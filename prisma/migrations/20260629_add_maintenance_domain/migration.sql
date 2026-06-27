-- AddTable MaintenanceRequest
CREATE TABLE "MaintenanceRequest" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitId" TEXT,
    "tenantId" TEXT,
    "reportedBy" TEXT NOT NULL,
    "assignedTo" TEXT,
    "requestNumber" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "status" TEXT NOT NULL DEFAULT 'Open',
    "requestedDate" TIMESTAMP(3) NOT NULL,
    "scheduledDate" TIMESTAMP(3),
    "startedDate" TIMESTAMP(3),
    "completedDate" TIMESTAMP(3),
    "estimatedCost" DECIMAL(18,4),
    "actualCost" DECIMAL(18,4),
    "vendor" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes
CREATE UNIQUE INDEX "MaintenanceRequest_organizationId_requestNumber_key" ON "MaintenanceRequest"("organizationId", "requestNumber");
CREATE INDEX "MaintenanceRequest_organizationId_idx" ON "MaintenanceRequest"("organizationId");
CREATE INDEX "MaintenanceRequest_propertyId_idx" ON "MaintenanceRequest"("propertyId");
CREATE INDEX "MaintenanceRequest_unitId_idx" ON "MaintenanceRequest"("unitId");
CREATE INDEX "MaintenanceRequest_tenantId_idx" ON "MaintenanceRequest"("tenantId");
CREATE INDEX "MaintenanceRequest_reportedBy_idx" ON "MaintenanceRequest"("reportedBy");
CREATE INDEX "MaintenanceRequest_assignedTo_idx" ON "MaintenanceRequest"("assignedTo");
CREATE INDEX "MaintenanceRequest_status_idx" ON "MaintenanceRequest"("status");
CREATE INDEX "MaintenanceRequest_priority_idx" ON "MaintenanceRequest"("priority");
CREATE INDEX "MaintenanceRequest_category_idx" ON "MaintenanceRequest"("category");
CREATE INDEX "MaintenanceRequest_requestNumber_idx" ON "MaintenanceRequest"("requestNumber");
CREATE INDEX "MaintenanceRequest_requestedDate_idx" ON "MaintenanceRequest"("requestedDate");
CREATE INDEX "MaintenanceRequest_scheduledDate_idx" ON "MaintenanceRequest"("scheduledDate");
CREATE INDEX "MaintenanceRequest_completedDate_idx" ON "MaintenanceRequest"("completedDate");
CREATE INDEX "MaintenanceRequest_createdAt_idx" ON "MaintenanceRequest"("createdAt");
CREATE INDEX "MaintenanceRequest_deletedAt_idx" ON "MaintenanceRequest"("deletedAt");
CREATE INDEX "MaintenanceRequest_createdBy_idx" ON "MaintenanceRequest"("createdBy");
