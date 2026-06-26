-- Add soft delete and audit fields to Organization model
ALTER TABLE "Organization" ADD COLUMN "deletedAt" TIMESTAMP,
ADD COLUMN "createdBy" TEXT,
ADD COLUMN "updatedBy" TEXT;

-- Add soft delete and audit fields to User model
ALTER TABLE "User" ADD COLUMN "deletedAt" TIMESTAMP,
ADD COLUMN "createdBy" TEXT,
ADD COLUMN "updatedBy" TEXT;

-- Add soft delete and audit fields to OrganizationUser model
ALTER TABLE "OrganizationUser" ADD COLUMN "deletedAt" TIMESTAMP,
ADD COLUMN "createdBy" TEXT,
ADD COLUMN "updatedBy" TEXT;

-- Add soft delete and audit fields to Role model
ALTER TABLE "Role" ADD COLUMN "deletedAt" TIMESTAMP,
ADD COLUMN "createdBy" TEXT,
ADD COLUMN "updatedBy" TEXT;

-- Add soft delete and audit fields to Permission model
ALTER TABLE "Permission" ADD COLUMN "deletedAt" TIMESTAMP,
ADD COLUMN "createdBy" TEXT,
ADD COLUMN "updatedBy" TEXT;

-- Create indexes for soft delete and audit fields
CREATE INDEX "Organization_deletedAt_idx" ON "Organization"("deletedAt");
CREATE INDEX "Organization_createdBy_idx" ON "Organization"("createdBy");
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");
CREATE INDEX "User_createdBy_idx" ON "User"("createdBy");
CREATE INDEX "OrganizationUser_deletedAt_idx" ON "OrganizationUser"("deletedAt");
CREATE INDEX "Role_deletedAt_idx" ON "Role"("deletedAt");
CREATE INDEX "Permission_deletedAt_idx" ON "Permission"("deletedAt");
