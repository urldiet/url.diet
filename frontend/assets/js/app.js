:root {
  --bg-deep: #050510;
  --bg-panel: rgba(8, 8, 24, 0.9);
  --bg-panel-soft: rgba(10, 10, 30, 0.85);

  --neon-pink: #ff00b8;
  --neon-blue: #00e5ff;
  --neon-purple: #7c3bff;
  --neon-yellow: #f2ff49;

  --text-main: #f8f8ff;
  --text-muted: #a0a0d0;
  --border-subtle: rgba(255, 255, 255, 0.08);

  --radius-lg: 18px;
  --shadow-neon: 0 0 24px rgba(0, 229, 255, 0.5);
  --shadow-pink: 0 0 24px rgba(255, 0, 184, 0.45);
}

/* Reset-ish */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI",
    sans-serif;
  background: radial-gradient(circle at top, #111133 0, #050510 55%, #000 100%);
  color: var(--text-main);
}

/* CRT / scanline overlays */
.scanlines,
.crt-overlay {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 0;
}

.scanlines {
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.06) 1px,
    transparent 1px
  );
  background-size: 100% 3px;
  opacity: 0.12;
  mix-blend-mode: soft-light;
}

.crt-overlay {
  background: radial-gradient(circle at center, transparent 0%, #000 130%);
  opacity: 0.9;
}

/* Layout */
.page-wrap {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 32px 18px 18px;
  display: flex;
  flex-direction: column;
  max-width: 1120px;
  margin: 0 auto;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.logo-glitch {
  position: relative;
  display: inline-block;
  font-size: 2.4rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.logo-main {
  position: relative;
  color: var(--neon-blue);
  text-shadow:
    0 0 12px rgba(0, 229, 255, 0.9),
    0 0 24px rgba(0, 229, 255, 0.7);
}

.logo-shadow {
  position: absolute;
  inset: 0;
  color: var(--neon-pink);
  mix-blend-mode: screen;
  transform: translate(-2px, 2px);
  opacity: 0.6;
  animation: logo-glitch 1.6s infinite;
}

@keyframes logo-glitch {
  0%,
  100% {
    transform: translate(-2px, 2px);
  }
  20% {
    transform: translate(2px, -1px);
  }
  40% {
    transform: translate(-1px, -2px);
  }
  60% {
    transform: translate(1px, 1px);
  }
  80% {
    transform: translate(-2px, 1px);
  }
}

.tagline {
  font-size: 0.95rem;
  color: var(--text-muted);
  display: flex;
  flex-wrap: wrap;
  gap: 0.5ch;
  text-transform: uppercase;
}

.main {
  display: grid;
  grid-template-columns: minmax(0, 2.3fr) minmax(0, 1.3fr);
  gap: 20px;
  flex: 1;
}

@media (max-width: 800px) {
  .main {
    grid-template-columns: 1fr;
  }
}

/* Panels */
.panel {
  border-radius: var(--radius-lg);
  padding: 18px 18px 20px;
  border: 1px solid rgba(0, 229, 255, 0.25);
  background: linear-gradient(
      135deg,
      rgba(255, 0, 184, 0.08),
      transparent 60%
    ),
    var(--bg-panel);
  box-shadow:
    0 0 40px rgba(7, 208, 255, 0.2),
    inset 0 0 20px rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
}

.panel-main {
  position: relative;
}

.panel-main::before {
  content: "";
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  border: 1px solid rgba(124, 59, 255, 0.4);
  mix-blend-mode: screen;
  opacity: 0.7;
  pointer-events: none;
}

.panel-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 18px;
}

.panel-title {
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.18em;
  color: var(--neon-blue);
}

.panel-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.panel-side {
  background: linear-gradient(
      145deg,
      rgba(0, 229, 255, 0.08),
      rgba(124, 59, 255, 0.08)
    ),
    var(--bg-panel-soft);
}

/* Form */
.shorten-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-muted);
}

.input-row {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

@media (max-width: 720px) {
  .input-row {
    flex-direction: column;
  }
}

.neon-input {
  flex: 1;
  padding: 11px 12px;
  border-radius: 999px;
  border: 1px solid rgba(0, 229, 255, 0.35);
  background: rgba(4, 4, 20, 0.9);
  color: var(--text-main);
  outline: none;
  font-size: 0.92rem;
  box-shadow: inset 0 0 12px rgba(0, 229, 255, 0.25);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.neon-input::placeholder {
  color: rgba(150, 150, 210, 0.6);
}

.neon-input:focus {
  border-color: var(--neon-pink);
  box-shadow:
    inset 0 0 18px rgba(0, 229, 255, 0.45),
    0 0 20px rgba(255, 0, 184, 0.4);
  background: rgba(6, 6, 26, 0.95);
}

.neon-button {
  border: none;
  border-radius: 999px;
  padding: 0 22px;
  background: linear-gradient(120deg, var(--neon-pink), var(--neon-purple), var(--neon-blue));
  color: #050510;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  min-width: 120px;
  box-shadow:
    var(--shadow-neon),
    var(--shadow-pink);
}

.neon-button .btn-glitch {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.18),
    rgba(255, 255, 255, 0.18) 2px,
    transparent 2px,
    transparent 4px
  );
  mix-blend-mode: overlay;
  opacity: 0;
  animation: button-glitch 1.4s infinite;
}

.neon-button:hover .btn-glitch {
  opacity: 0.35;
}

.neon-button:hover {
  transform: translateY(-1px);
  box-shadow:
    0 0 28px rgba(0, 229, 255, 0.7),
    0 0 24px rgba(255, 0, 184, 0.7);
}

.neon-button:active {
  transform: translateY(0);
  box-shadow:
    0 0 16px rgba(0, 229, 255, 0.5),
    0 0 16px rgba(255, 0, 184, 0.5);
}

@keyframes button-glitch {
  0%,
  100% {
    transform: translate(0, 0);
  }
  20% {
    transform: translate(-2px, -1px);
  }
  40% {
    transform: translate(2px, 1px);
  }
  60% {
    transform: translate(-1px, 2px);
  }
  80% {
    transform: translate(1px, -2px);
  }
}

.field-hint {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Result card */
.result-card {
  margin-top: 18px;
  padding: 14px 14px 12px;
  border-radius: 14px;
  border: 1px solid rgba(0, 229, 255, 0.35);
  background: radial-gradient(circle at top left, rgba(0, 229, 255, 0.18), transparent 55%),
    rgba(6, 6, 24, 0.96);
  box-shadow: 0 0 24px rgba(0, 229, 255, 0.4);
  animation: fade-in-up 0.25s ease-out;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.result-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: var(--text-muted);
}

.pill {
  font-size: 0.7rem;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid rgba(0, 229, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.pill-status {
  color: var(--neon-blue);
}

.result-body {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.short-url-text {
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco,
    Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.88rem;
  color: var(--neon-blue);
  text-decoration: none;
  word-break: break-all;
}

.short-url-text:hover {
  text-decoration: underline;
}

.chip {
  border-radius: 999px;
  border: 1px solid rgba(0, 229, 255, 0.7);
  background: rgba(4, 4, 20, 0.95);
  color: var(--text-main);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  padding: 6px 12px;
  cursor: pointer;
  box-shadow: 0 0 16px rgba(0, 229, 255, 0.45);
}

.chip:hover {
  background: rgba(0, 229, 255, 0.09);
}

.result-footer {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  gap: 0.4ch;
  flex-wrap: wrap;
}

.meta-label {
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.meta-value {
  color: var(--text-main);
}

/* Alerts */
.alert {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.78rem;
  display: flex;
  gap: 6px;
  align-items: baseline;
  border: 1px solid var(--border-subtle);
  background: rgba(5, 5, 20, 0.85);
}

.alert-info {
  border-color: rgba(0, 229, 255, 0.35);
  background: radial-gradient(
      circle at top left,
      rgba(0, 229, 255, 0.18),
      transparent 55%
    ),
    rgba(6, 6, 26, 0.95);
}

.alert-error {
  border-color: rgba(255, 0, 136, 0.55);
  background: radial-gradient(
      circle at top left,
      rgba(255, 0, 136, 0.2),
      transparent 55%
    ),
    rgba(26, 6, 18, 0.96);
}

.alert-title {
  font-weight: 700;
  color: var(--neon-blue);
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.alert-error .alert-title {
  color: var(--neon-pink);
}

.alert-body {
  color: var(--text-muted);
}

/* Side panel */
.stat-list {
  list-style: none;
  padding: 0;
  margin: 4px 0 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid rgba(0, 229, 255, 0.28);
  background: rgba(5, 5, 24, 0.9);
}

.stat-label {
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.stat-value {
  color: var(--neon-yellow);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}

.panel-footer {
  margin-top: 10px;
}

.panel-note {
  margin: 0;
  font-size: 0.7rem;
  color: var(--text-muted);
}

/* Footer */
.footer {
  margin-top: 16px;
  font-size: 0.78rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4ch;
  color: var(--text-muted);
}

.footer-separator {
  opacity: 0.5;
}

/* Utility */
.hidden {
  display: none !important;
}

/* Animations */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
