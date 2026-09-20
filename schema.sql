PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS anonymous_saves (
  key_hash TEXT PRIMARY KEY,
  state_json TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_anonymous_saves_updated
ON anonymous_saves(updated_at);
