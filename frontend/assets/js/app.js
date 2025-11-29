/* ---------------------------------------------
   URL.DIET — Cyberpunk Overkill Mode Logic
--------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("shortenForm");
  const longUrlInput = document.getElementById("longUrl");
  const resultArea = document.getElementById("resultArea");
  const alertArea = document.getElementById("alertArea");
  const logoMain = document.getElementById("logoMain");
  const footerTicker = document.getElementById("footerTicker");

  /* ---------- HOLO-REACTIVE TYPING FX ---------- */

  const inputShell = longUrlInput ? longUrlInput.closest(".input-shell") : null;
  let typingTimeout;

  if (longUrlInput && inputShell) {
    longUrlInput.addEventListener("input", () => {
      inputShell.classList.add("typing");
      clearTimeout(typingTimeout);
      typingTimeout = setTimeout(() => {
        inputShell.classList.remove("typing");
      }, 280);
    });
  }

  /* ---------- FORM / SHORTENER (DEMO MODE) ---------- */

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const longUrl = longUrlInput.value.trim();
    if (!longUrl) return;

    // Clear previous
    resultArea.innerHTML = "";
    resultArea.classList.add("hidden");
    alertArea.innerHTML = "";

    // Fake key for now – will be replaced by Worker endpoint later
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const longUrl = longUrlInput.value.trim();
    if (!longUrl) return;

    // Clear UI elements
    resultArea.innerHTML = "";
    resultArea.classList.add("hidden");
    alertArea.innerHTML = "";

    try {
      // CALL WORKER API
      const response = await fetch("/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ long_url: longUrl })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Network error");
      }

      const data = await response.json();

      const shortUrl = data.short_url;

      // Build result card
      const card = document.createElement("div");
      card.className = "result-card";
      card.innerHTML = `
        <div class="result-label">Shortened URL</div>
        <div class="result-main">
          <a class="short-url-text" href="${shortUrl}" target="_blank" rel="noopener">
            ${shortUrl}
          </a>
          <button class="copy-btn" type="button" data-url="${shortUrl}">
            Copy
          </button>
        </div>
      `;

      resultArea.appendChild(card);
      resultArea.classList.remove("hidden");

      // Copy button logic
      const copyBtn = card.querySelector(".copy-btn");
      copyBtn.addEventListener("click", () => {
        const url = copyBtn.getAttribute("data-url");
        navigator.clipboard.writeText(url);
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
      });

    } catch (err) {
      // Show error alert
      alertArea.innerHTML = `
        <div class="alert alert-error">
          <div class="alert-title">Error</div>
          <div class="alert-body">${err.message}</div>
        </div>
      `;
    }
  });


  /* ---------- RANDOM LOGO GLITCH BURSTS ---------- */

  function triggerLogoSpike() {
    if (!logoMain) return;
    logoMain.classList.add("logo-spike");
    setTimeout(() => logoMain.classList.remove("logo-spike"), 180);
  }

  setInterval(() => {
    if (Math.random() < 0.25) triggerLogoSpike();
  }, 1200);

  /* ---------- FOOTER "SYSTEM TICKER" SCROLL ---------- */

  if (footerTicker) {
    const base = footerTicker.textContent.trim();
    footerTicker.textContent = base + " " + base + " " + base;
  }

  /* ---------- PARTICLE BACKGROUND ---------- */

  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = window.innerWidth;
  let height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  const particles = [];
  const MAX_PARTICLES = 70;

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + Math.random() * 40;
      this.size = 1 + Math.random() * 2.4;
      this.speedY = -0.3 - Math.random() * 0.7;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.alpha = 0.2 + Math.random() * 0.6;
      this.hue = 180 + Math.random() * 120; // cyan -> magenta
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.y < -40 || this.x < -40 || this.x > width + 40) {
        this.reset();
      }
    }

    draw(ctx) {
      ctx.beginPath();
      const gradient = ctx.createLinearGradient(
        this.x,
        this.y,
        this.x,
        this.y + 16
      );
      gradient.addColorStop(
        0,
        `hsla(${this.hue}, 100%, 72%, ${this.alpha})`
      );
      gradient.addColorStop(
        1,
        `hsla(${this.hue + 40}, 100%, 40%, 0)`
      );
      ctx.strokeStyle = gradient;
      ctx.lineWidth = this.size;
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x, this.y + 16);
      ctx.stroke();
    }
  }

  for (let i = 0; i < MAX_PARTICLES; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = "lighter";

    particles.forEach((p) => {
      p.update();
      p.draw(ctx);
    });

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  });
});
