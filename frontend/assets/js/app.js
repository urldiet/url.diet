/* ---------------------------------------------
   URL.DIET — Neon Terminal UI Logic
   --------------------------------------------- */

const form = document.getElementById("shortenForm");
const longUrlInput = document.getElementById("longUrl");
const resultArea = document.getElementById("resultArea");
const alertArea = document.getElementById("alertArea");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const longUrl = longUrlInput.value.trim();
  if (!longUrl) return;

  // Clear previous output
  resultArea.innerHTML = "";
  resultArea.classList.add("hidden");
  alertArea.innerHTML = "";

  try {
    // FUTURE: Call your Worker backend
    // const res = await fetch("/api/shorten", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ long_url: longUrl }),
    // });

    // TEMPORARY PREVIEW MODE — Fake short URL
    const fakeKey = Math.random().toString(36).substring(2, 8);
    const shortUrl = `https://url.diet/${fakeKey}`;

    // Build UI result card
    resultArea.innerHTML = `
      <div class="result-card">
        <div class="result-label">Shortened URL</div>
        <a class="short-url-text" href="${shortUrl}" target="_blank">${shortUrl}</a>
        <button class="copy-btn" data-url="${shortUrl}">Copy</button>
      </div>
    `;
    resultArea.classList.remove("hidden");

    // Copy button handler
    const copyBtn = resultArea.querySelector(".copy-btn");
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(shortUrl);
      copyBtn.textContent = "Copied!";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    });

  } catch (err) {
    console.error(err);
    alertArea.innerHTML = `
      <div class="alert alert-error">
        <div class="alert-title">Error</div>
        <div class="alert-body">Something went wrong. Try again.</div>
      </div>
    `;
  }
});
