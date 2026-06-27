/*
  Warnings:

  - You are about to drop the column `provider` on the `Payment` table. All the data in that column will be lost.
  - You are about to drop the column `providerPaymentId` on the `Payment` table. All the data in that column will be lost.
  - You are about to drop the column `providerResponse` on the `Payment` table. All the data in that column will be lost.
  - Added the required column `paymentNumber` to the `Payment` table without a default value. This required argument must not be supplied.
  - Added the required column `dueDate` to the `Payment` table without a default value. This required argument must not be supplied.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "paymentNumber" TEXT NOT NULL,
ADD COLUMN "dueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'USD',
ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'BankTransfer',
ADD COLUMN "paymentType" TEXT NOT NULL DEFAULT 'Rent',
ADD COLUMN "referenceNumber" TEXT,
ADD COLUMN "receiptNumber" TEXT,
ADD COLUMN "paidAmount" DECIMAL(19,4),
ADD COLUMN "outstandingBalance" DECIMAL(19,4),
ADD COLUMN "paidAt" TIMESTAMP(3),
ADD COLUMN "updatedBy" TEXT,
DROP COLUMN "provider",
DROP COLUMN "providerPaymentId",
DROP COLUMN "providerResponse";

-- CreateIndex
CREATE UNIQUE INDEX "Payment_organizationId_paymentNumber_key" ON "Payment"("organizationId", "paymentNumber");
