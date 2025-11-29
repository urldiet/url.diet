// worker/src/index.js

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Build CORS headers dynamically based on request Origin
    const origin = request.headers.get("Origin");
    const allowedOrigins = [
      "https://url.diet",
      "https://www.url.diet",
      "https://url-diet.pages.dev",
      "https://*.url-diet.pages.dev"
    ];

    const allowOrigin = allowedOrigins.includes(origin) ? origin : "https://url.diet";

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    };

    // -------- OPTIONS Preflight Handling --------
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // -------- POST /api/shorten --------
    if (request.method === "POST" && pathname === "/api/shorten") {
      return handleShorten(request, env, corsHeaders);
    }

    // -------- GET /<id> redirect --------
    if (request.method === "GET" && pathname !== "/" && !pathname.startsWith("/api/")) {
      return handleRedirect(request, env, ctx, corsHeaders);
    }

    // Default
    return new Response("Not found", { status: 404, headers: corsHeaders });
  }
};


// ========== OPTIONS HANDLER (unused - main logic now above) ==========
function handleOptions(corsHeaders) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}


// ========== POST /api/shorten ==========
async function handleShorten(request, env, corsHeaders) {
  try {
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";

    // Rate limiting
    const rateOk = await checkRateLimit(env, ip);
    if (!rateOk) {
      return json({ error: "Rate limit exceeded. Please try again later." }, 429, corsHeaders);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, corsHeaders);
    }

    const longUrl = body?.long_url || body?.longUrl || "";

    if (!longUrl || !/^https?:\/\//i.test(longUrl)) {
      return json({ error: "Invalid or missing URL (must start with http:// or https://)" }, 400, corsHeaders);
    }

    // Generate key
    const key = generateKey();

    // Save to KV
    await env.URLS.put(key, longUrl);

    // Save metadata to D1
    const nowSec = Math.floor(Date.now() / 1000);
    await env.DB.prepare(
      `INSERT INTO links (short_key, long_url, created_at, total_clicks)
       VALUES (?, ?, ?, 0)`
    )
      .bind(key, longUrl, nowSec)
      .run();

    const shortUrl = `https://url.diet/${key}`;

    return json(
      { short_url: shortUrl, long_url: longUrl, key },
      200,
      corsHeaders
    );

  } catch (err) {
    console.error("Error in /api/shorten:", err);
    return json({ error: "Internal server error" }, 500, corsHeaders);
  }
}


// ========== GET /<id> Redirect ==========
async function handleRedirect(request, env, ctx, corsHeaders) {
  const url = new URL(request.url);
  const key = url.pathname.slice(1);

  if (!key) {
    return new Response("Missing key", { status: 400, headers: corsHeaders });
  }

  const longUrl = await env.URLS.get(key);

  if (!longUrl) {
    return new Response("Short URL not found", { status: 404, headers: corsHeaders });
  }

  // Log analytics
  ctx.waitUntil(logRedirect(request, env, key));

  return new Response(null, {
    status: 302,
    headers: { Location: longUrl, ...corsHeaders }
  });
}


// ========================================================
// HELPERS
// ========================================================

// Generate short key
function generateKey(length = 8) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  const randomBytes = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    key += alphabet[randomBytes[i] % alphabet.length];
  }
  return key;
}


// Rate limit: 60/hour per IP
async function checkRateLimit(env, ip) {
  const now = new Date();
  const hourBucket = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}-${now.getUTCHours()}`;
  const rateKey = `rate:${ip}:${hourBucket}`;

  const current = await env.RATE_LIMIT.get(rateKey);
  const count = current ? parseInt(current, 10) : 0;

  const LIMIT = 60;

  if (count >= LIMIT) return false;

  await env.RATE_LIMIT.put(rateKey, String(count + 1), { expirationTtl: 3600 });

  return true;
}


// Log redirect analytics to D1
async function logRedirect(request, env, key) {
  try {
    const ip = request.headers.get("CF-Connecting-IP") || "";
    const userAgent = request.headers.get("User-Agent") || "";
    const referrer = request.headers.get("Referer") || "";

    const ipHash = await hashIP(ip);
    const nowSec = Math.floor(Date.now() / 1000);

    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO redirect_logs (short_key, timestamp, ip_hash, user_agent, referrer)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(key, nowSec, ipHash, userAgent, referrer),

      env.DB.prepare(
        `UPDATE links
         SET total_clicks = total_clicks + 1,
             last_click = ?
         WHERE short_key = ?`
      ).bind(nowSec, key)
    ]);

  } catch (err) {
    console.error("Error logging redirect:", err);
  }
}


// Hash IP for privacy-safe analytics
async function hashIP(ip) {
  const data = new TextEncoder().encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}


// JSON helper with CORS
function json(obj, status = 200, corsHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders
    }
  });
}
