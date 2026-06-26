ALTER TABLE "Organization"
  ADD COLUMN "email" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "website" TEXT,
  ADD COLUMN "logo" TEXT,
  ADD COLUMN "address" TEXT,
  ADD COLUMN "city" TEXT,
  ADD COLUMN "state" TEXT,
  ADD COLUMN "country" TEXT,
  ADD COLUMN "postalCode" TEXT,
  ADD COLUMN "timezone" TEXT DEFAULT 'UTC',
  ADD COLUMN "currency" TEXT DEFAULT 'USD',
  ADD COLUMN "subscriptionPlan" TEXT NOT NULL DEFAULT 'FREE',
  ADD COLUMN "subscriptionStatus" TEXT NOT NULL DEFAULT 'TRIAL',
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

UPDATE "Organization"
SET "email" = CONCAT("slug", '@organization.local')
WHERE "email" IS NULL;

ALTER TABLE "Organization"
  ALTER COLUMN "email" SET NOT NULL;

CREATE UNIQUE INDEX "Organization_email_key" ON "Organization"("email");
CREATE INDEX "Organization_isActive_idx" ON "Organization"("isActive");
