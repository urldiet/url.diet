// worker/src/index.js

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // CORS preflight for /api/shorten
    if (request.method === "OPTIONS" && pathname === "/api/shorten") {
      return handleOptions();
    }

    // API route: POST /api/shorten
    if (request.method === "POST" && pathname === "/api/shorten") {
      return handleShorten(request, env);
    }

    // Redirect route: GET /:id
    if (request.method === "GET" && pathname !== "/" && !pathname.startsWith("/api/")) {
      return handleRedirect(request, env, ctx);
    }

    // Fallback
    return new Response("Not found", { status: 404 });
  }
};

function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

async function handleShorten(request, env) {
  try {
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";

    // Simple per-IP rate limiting
    const rateOk = await checkRateLimit(env, ip);
    if (!rateOk) {
      return json(
        { error: "Rate limit exceeded. Please try again later." },
        429
      );
    }

    const body = await request.json().catch(() => null);
    const longUrl = body?.long_url || body?.longUrl || "";

    if (!longUrl || !/^https?:\/\//i.test(longUrl)) {
      return json({ error: "Invalid or missing URL (must start with http:// or https://)" }, 400);
    }

    // Generate short key
    const key = generateKey();

    // Save to KV for fast lookups
    await env.URLS.put(key, longUrl);

    // Save to D1 for metadata & analytics
    const nowSec = Math.floor(Date.now() / 1000);
    await env.DB.prepare(
      `INSERT INTO links (short_key, long_url, created_at, total_clicks)
       VALUES (?, ?, ?, 0)`
    )
      .bind(key, longUrl, nowSec)
      .run();

    const shortUrl = `https://url.diet/${key}`;

    return json(
      {
        short_url: shortUrl,
        long_url: longUrl,
        key
      },
      200
    );
  } catch (err) {
    console.error("Error in /api/shorten:", err);
    return json({ error: "Internal server error" }, 500);
  }
}

async function handleRedirect(request, env, ctx) {
  const url = new URL(request.url);
  const key = url.pathname.slice(1); // remove leading "/"

  if (!key) {
    return new Response("Missing key", { status: 400 });
  }

  const longUrl = await env.URLS.get(key);

  if (!longUrl) {
    return new Response("Short URL not found", { status: 404 });
  }

  // Async logging to D1
  ctx.waitUntil(logRedirect(request, env, key));

  return Response.redirect(longUrl, 302);
}

// ---------- Helpers ----------

function generateKey(length = 8) {
  // Short, URL-safe key using a-z0-9 (no uppercase for simplicity)
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = "";
  const randomBytes = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    key += alphabet[randomBytes[i] % alphabet.length];
  }
  return key;
}

async function checkRateLimit(env, ip) {
  // Very simple: IP + hour bucket
  const now = new Date();
  const hourBucket = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}-${now.getUTCHours()}`;
  const rateKey = `rate:${ip}:${hourBucket}`;

  const current = await env.RATE_LIMIT.get(rateKey);
  const count = current ? parseInt(current, 10) : 0;

  const LIMIT = 60; // 60 shorten requests per IP per hour (tweak later)

  if (count >= LIMIT) {
    return false;
  }

  await env.RATE_LIMIT.put(rateKey, String(count + 1), {
    expirationTtl: 3600 // 1 hour
  });

  return true;
}

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

async function hashIP(ip) {
  const data = new TextEncoder().encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
