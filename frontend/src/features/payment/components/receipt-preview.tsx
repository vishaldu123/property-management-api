import * as React from 'react'
import type { Payment } from '@/shared/services'
import {
  calculateNetAmount,
  formatPaymentCurrency,
  formatPaymentDate,
} from '../utils/payment.utils'

interface ReceiptPreviewProps {
  payment: Payment
  organizationName?: string
  tenantName?: string
  propertyName?: string
  unitLabel?: string
  onPrint?: () => void
  onDownloadPdf?: () => void
}

export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  payment,
  organizationName = 'Property Management',
  tenantName,
  propertyName,
  unitLabel,
  onPrint,
  onDownloadPdf,
}) => {
  const netAmount = calculateNetAmount(
    payment.amount,
    payment.lateFee,
    payment.discount,
    payment.tax
  )

  return (
    <article
      aria-label="Payment receipt preview"
      className="rounded-lg border bg-white p-6 shadow-sm max-w-lg mx-auto"
    >
      <header className="text-center border-b pb-4 mb-4">
        <h2 className="text-xl font-bold">{organizationName}</h2>
        <p className="text-sm text-muted-foreground">Official Payment Receipt</p>
      </header>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Receipt #</span>
          <span className="font-medium">{payment.receiptNumber ?? 'Pending'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Payment #</span>
          <span>{payment.paymentNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date</span>
          <span>{formatPaymentDate(payment.paymentDate)}</span>
        </div>
        {tenantName && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tenant</span>
            <span>{tenantName}</span>
          </div>
        )}
        {propertyName && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Property</span>
            <span>{propertyName}</span>
          </div>
        )}
        {unitLabel && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Unit</span>
            <span>{unitLabel}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Method</span>
          <span>{payment.paymentMethod ?? '—'}</span>
        </div>
        <div className="flex justify-between font-semibold text-base pt-2 border-t mt-2">
          <span>Net Amount</span>
          <span>{formatPaymentCurrency(netAmount, payment.currency)}</span>
        </div>
      </div>

      <div
        className="mt-6 flex items-center justify-center h-20 border border-dashed rounded text-xs text-muted-foreground"
        aria-label="QR code placeholder"
      >
        QR Code Placeholder
      </div>

      {(onPrint || onDownloadPdf) && (
        <div className="flex gap-2 mt-4 print:hidden">
          {onPrint && (
            <button
              type="button"
              onClick={onPrint}
              className="flex-1 rounded-md border px-3 py-2 text-sm hover:bg-muted"
              aria-label="Print receipt"
            >
              Print
            </button>
          )}
          {onDownloadPdf && (
            <button
              type="button"
              onClick={onDownloadPdf}
              className="flex-1 rounded-md border px-3 py-2 text-sm hover:bg-muted"
              aria-label="Download PDF placeholder"
            >
              Download PDF
            </button>
          )}
        </div>
      )}
    </article>
  )
}
