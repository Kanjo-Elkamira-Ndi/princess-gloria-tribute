-- Migration 001
-- 1. Add optional private phone number to tributes.
-- 2. No schema change needed for the "removed" status — it reuses the existing
--    `status` TEXT column. Public queries only ever return status = 'approved',
--    so a value of 'removed' is hidden from the site automatically while the
--    row and its photos are preserved (reversible via Restore in the admin UI).
--
-- Idempotent: safe to run repeatedly.

ALTER TABLE tribute ADD COLUMN IF NOT EXISTS phone TEXT;
