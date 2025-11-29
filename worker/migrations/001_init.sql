-- worker/migrations/001_init.sql

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  short_key TEXT NOT NULL UNIQUE,
  long_url TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  total_clicks INTEGER NOT NULL DEFAULT 0,
  last_click INTEGER
);

CREATE INDEX IF NOT EXISTS idx_links_short_key ON links(short_key);

CREATE TABLE IF NOT EXISTS redirect_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  short_key TEXT NOT NULL,
  timestamp INTEGER NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  FOREIGN KEY (short_key) REFERENCES links(short_key) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_redirect_logs_short_key ON redirect_logs(short_key);
CREATE INDEX IF NOT EXISTS idx_redirect_logs_timestamp ON redirect_logs(timestamp);
