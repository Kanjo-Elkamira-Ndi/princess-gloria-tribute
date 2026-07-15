-- Princess Gloria Mala Galabe — Memorial Tribute schema
-- Run: psql $DATABASE_URL -f db/schema.sql

CREATE TABLE IF NOT EXISTS admin_user (
  id         TEXT PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  name       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tribute (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  relationship  TEXT NOT NULL,
  message       TEXT NOT NULL,
  email         TEXT,
  photos        TEXT NOT NULL DEFAULT '[]',
  status        TEXT NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at   TIMESTAMPTZ,
  reviewed_by   TEXT,
  company       TEXT
);

CREATE INDEX IF NOT EXISTS idx_tribute_status ON tribute (status);
CREATE INDEX IF NOT EXISTS idx_tribute_reviewed_at ON tribute (reviewed_at DESC NULLS LAST);
