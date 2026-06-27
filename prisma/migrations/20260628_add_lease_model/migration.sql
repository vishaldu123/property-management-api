-- CreateTable "Lease"
CREATE TABLE "Lease" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leaseNumber" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "moveInDate" TIMESTAMP(3),
    "moveOutDate" TIMESTAMP(3),
    "monthlyRent" DECIMAL(18,2) NOT NULL,
    "securityDeposit" DECIMAL(18,2) NOT NULL,
    "billingCycle" TEXT NOT NULL DEFAULT 'monthly',
    "gracePeriod" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "renewalOption" BOOLEAN NOT NULL DEFAULT false,
    "autoRenewal" BOOLEAN NOT NULL DEFAULT false,
    "noticePeriod" INTEGER NOT NULL DEFAULT 30,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Lease_pkey" PRIMARY KEY ("id")
);

-- CreateIndex "Lease_organizationId_idx"
CREATE INDEX "Lease_organizationId_idx" ON "Lease"("organizationId");

-- CreateIndex "Lease_propertyId_idx"
CREATE INDEX "Lease_propertyId_idx" ON "Lease"("propertyId");

-- CreateIndex "Lease_unitId_idx"
CREATE INDEX "Lease_unitId_idx" ON "Lease"("unitId");

-- CreateIndex "Lease_tenantId_idx"
CREATE INDEX "Lease_tenantId_idx" ON "Lease"("tenantId");

-- CreateIndex "Lease_status_idx"
CREATE INDEX "Lease_status_idx" ON "Lease"("status");

-- CreateIndex "Lease_leaseNumber_idx"
CREATE INDEX "Lease_leaseNumber_idx" ON "Lease"("leaseNumber");

-- CreateIndex "Lease_startDate_idx"
CREATE INDEX "Lease_startDate_idx" ON "Lease"("startDate");

-- CreateIndex "Lease_endDate_idx"
CREATE INDEX "Lease_endDate_idx" ON "Lease"("endDate");

-- CreateIndex "Lease_createdAt_idx"
CREATE INDEX "Lease_createdAt_idx" ON "Lease"("createdAt");

-- CreateIndex "Lease_deletedAt_idx"
CREATE INDEX "Lease_deletedAt_idx" ON "Lease"("deletedAt");

-- CreateIndex "Lease_createdBy_idx"
CREATE INDEX "Lease_createdBy_idx" ON "Lease"("createdBy");

-- CreateIndex "Lease_autoRenewal_idx"
CREATE INDEX "Lease_autoRenewal_idx" ON "Lease"("autoRenewal");

-- AddForeignKey "Lease_organizationId_fkey"
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey "Lease_propertyId_fkey"
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey "Lease_unitId_fkey"
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey "Lease_tenantId_fkey"
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey "Payment_organizationId_fkey"
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey "Payment_propertyId_fkey"
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey "Payment_unitId_fkey"
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey "Payment_tenantId_fkey"
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey "Payment_leaseId_fkey"
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE CASCADE ON UPDATE CASCADE;
