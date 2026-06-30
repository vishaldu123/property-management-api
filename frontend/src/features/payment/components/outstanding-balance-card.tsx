import * as React from 'react'
import type { Payment } from '@/shared/services'
import { calculateNetAmount, formatPaymentCurrency } from '../utils/payment.utils'

interface OutstandingBalanceCardProps {
  payment: Payment
}

export const OutstandingBalanceCard: React.FC<OutstandingBalanceCardProps> = ({ payment }) => {
  const lateFee = payment.lateFee ?? 0
  const discount = payment.discount ?? 0
  const tax = payment.tax ?? 0
  const paidAmount = payment.paidAmount ?? 0
  const totalDue = calculateNetAmount(payment.amount, lateFee, discount, tax)
  const remaining = payment.outstandingBalance ?? Math.max(0, totalDue - paidAmount)

  return (
    <section
      aria-label="Outstanding balance summary"
      className="rounded-lg border bg-muted/30 p-4 space-y-3"
    >
      <h3 className="font-semibold">Balance Summary</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Total Due</p>
          <p className="text-xl font-bold">{formatPaymentCurrency(totalDue, payment.currency)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Paid</p>
          <p className="text-xl font-bold text-green-700">
            {formatPaymentCurrency(paidAmount, payment.currency)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Remaining Balance</p>
          <p className="text-xl font-bold text-destructive">
            {formatPaymentCurrency(remaining, payment.currency)}
          </p>
        </div>
      </div>
    </section>
  )
}
