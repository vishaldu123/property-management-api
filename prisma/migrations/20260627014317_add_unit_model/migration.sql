-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "unitNumber" TEXT NOT NULL,
    "name" TEXT,
    "floor" INTEGER,
    "block" TEXT,
    "unitType" TEXT NOT NULL DEFAULT 'Apartment',
    "status" TEXT NOT NULL DEFAULT 'Available',
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "area" DECIMAL(65,30),
    "areaUnit" TEXT NOT NULL DEFAULT 'sqft',
    "rentAmount" DECIMAL(65,30),
    "securityDeposit" DECIMAL(65,30),
    "availabilityDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Unit_propertyId_idx" ON "Unit"("propertyId");

-- CreateIndex
CREATE INDEX "Unit_organizationId_idx" ON "Unit"("organizationId");

-- CreateIndex
CREATE INDEX "Unit_status_idx" ON "Unit"("status");

-- CreateIndex
CREATE INDEX "Unit_unitType_idx" ON "Unit"("unitType");

-- CreateIndex
CREATE INDEX "Unit_createdAt_idx" ON "Unit"("createdAt");

-- CreateIndex
CREATE INDEX "Unit_deletedAt_idx" ON "Unit"("deletedAt");

-- CreateIndex
CREATE INDEX "Unit_createdBy_idx" ON "Unit"("createdBy");

-- CreateIndex
CREATE INDEX "Unit_floor_idx" ON "Unit"("floor");

-- CreateIndex
CREATE INDEX "Unit_name_idx" ON "Unit"("name");

-- CreateIndex
CREATE INDEX "Unit_block_idx" ON "Unit"("block");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_propertyId_unitNumber_key" ON "Unit"("propertyId", "unitNumber");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
