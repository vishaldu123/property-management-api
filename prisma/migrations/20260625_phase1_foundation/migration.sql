-- This migration is intentionally a no-op.
-- All tables, indexes, and foreign keys defined here were already created
-- by earlier migrations (20260623181016 and 20260623192949).
-- Duplicate CREATE TABLE / CREATE INDEX / ADD CONSTRAINT statements caused
-- "relation already exists" errors when running prisma migrate reset.
SELECT 1;
