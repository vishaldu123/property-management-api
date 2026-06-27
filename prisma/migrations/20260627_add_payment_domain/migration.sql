-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "leaseId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'BankTransfer',
    "paymentType" TEXT NOT NULL DEFAULT 'Rent',
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "referenceNumber" TEXT,
    "notes" TEXT,
    "lateFee" DECIMAL(65,30),
    "discount" DECIMAL(65,30),
    "tax" DECIMAL(65,30),
    "receiptNumber" TEXT,
    "paidAt" TIMESTAMP(3),
    "paidAmount" DECIMAL(65,30),
    "outstandingBalance" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_organizationId_paymentNumber_key" ON "Payment"("organizationId", "paymentNumber");

-- CreateIndex
CREATE INDEX "Payment_organizationId_idx" ON "Payment"("organizationId");

-- CreateIndex
CREATE INDEX "Payment_leaseId_idx" ON "Payment"("leaseId");

-- CreateIndex
CREATE INDEX "Payment_propertyId_idx" ON "Payment"("propertyId");

-- CreateIndex
CREATE INDEX "Payment_unitId_idx" ON "Payment"("unitId");

-- CreateIndex
CREATE INDEX "Payment_tenantId_idx" ON "Payment"("tenantId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_paymentNumber_idx" ON "Payment"("paymentNumber");

-- CreateIndex
CREATE INDEX "Payment_paymentDate_idx" ON "Payment"("paymentDate");

-- CreateIndex
CREATE INDEX "Payment_dueDate_idx" ON "Payment"("dueDate");

-- CreateIndex
CREATE INDEX "Payment_paymentMethod_idx" ON "Payment"("paymentMethod");

-- CreateIndex
CREATE INDEX "Payment_paymentType_idx" ON "Payment"("paymentType");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_deletedAt_idx" ON "Payment"("deletedAt");

-- CreateIndex
CREATE INDEX "Payment_createdBy_idx" ON "Payment"("createdBy");

-- CreateIndex
CREATE INDEX "Payment_paidAt_idx" ON "Payment"("paidAt");
