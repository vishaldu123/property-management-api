import type { Payment, PaymentStatus } from '@/shared/services'

export function calculateNetAmount(amount: number, lateFee = 0, discount = 0, tax = 0): number {
  return amount + lateFee + tax - discount
}

export function calculateOutstanding(
  amount: number,
  lateFee = 0,
  discount = 0,
  tax = 0,
  paidAmount = 0
): number {
  const net = calculateNetAmount(amount, lateFee, discount, tax)
  return Math.max(0, net - paidAmount)
}

export function formatPaymentCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatPaymentDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getStatusBadgeClass(status: PaymentStatus): string {
  switch (status) {
    case 'Paid':
      return 'bg-green-100 text-green-800'
    case 'Pending':
      return 'bg-blue-100 text-blue-800'
    case 'PartiallyPaid':
      return 'bg-yellow-100 text-yellow-800'
    case 'Overdue':
      return 'bg-red-100 text-red-800'
    case 'Refunded':
      return 'bg-purple-100 text-purple-800'
    case 'Failed':
      return 'bg-orange-100 text-orange-800'
    case 'Cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function generatePaymentNumber(): string {
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase()
  return `PAY-${suffix}`
}

export function toIsoDateTime(dateValue: string): string {
  if (!dateValue) return new Date().toISOString()
  if (dateValue.includes('T')) return dateValue
  return new Date(`${dateValue}T12:00:00.000Z`).toISOString()
}

export interface PaymentTimelineEvent {
  id: string
  type: 'created' | 'updated' | 'marked_paid' | 'partial_payment' | 'refund' | 'receipt_generated'
  label: string
  timestamp: string
  description?: string
}

export function buildPaymentTimeline(payment: Payment): PaymentTimelineEvent[] {
  const events: PaymentTimelineEvent[] = [
    {
      id: 'created',
      type: 'created',
      label: 'Payment Created',
      timestamp: payment.createdAt,
      description: `Payment ${payment.paymentNumber} was created`,
    },
  ]

  if (payment.updatedAt !== payment.createdAt) {
    events.push({
      id: 'updated',
      type: 'updated',
      label: 'Payment Updated',
      timestamp: payment.updatedAt,
      description: 'Payment details were updated',
    })
  }

  if (payment.status === 'PartiallyPaid' && payment.paidAmount) {
    events.push({
      id: 'partial',
      type: 'partial_payment',
      label: 'Partial Payment Recorded',
      timestamp: payment.updatedAt,
      description: `${formatPaymentCurrency(payment.paidAmount, payment.currency)} received`,
    })
  }

  if (payment.paidAt) {
    events.push({
      id: 'paid',
      type: 'marked_paid',
      label: 'Marked as Paid',
      timestamp: payment.paidAt,
      description: 'Payment was marked as fully paid',
    })
  }

  if (payment.status === 'Refunded') {
    events.push({
      id: 'refund',
      type: 'refund',
      label: 'Refund Issued',
      timestamp: payment.updatedAt,
      description: 'A refund was processed for this payment',
    })
  }

  if (payment.receiptNumber) {
    events.push({
      id: 'receipt',
      type: 'receipt_generated',
      label: 'Receipt Generated',
      timestamp: payment.updatedAt,
      description: `Receipt #${payment.receiptNumber}`,
    })
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

export function filterByAmountRange(
  payments: Payment[],
  minAmount?: number,
  maxAmount?: number
): Payment[] {
  return payments.filter(payment => {
    if (minAmount !== undefined && payment.amount < minAmount) return false
    if (maxAmount !== undefined && payment.amount > maxAmount) return false
    return true
  })
}

export function filterByReceiptNumber(payments: Payment[], search: string): Payment[] {
  if (!search.trim()) return payments
  const query = search.toLowerCase()
  return payments.filter(p => p.receiptNumber?.toLowerCase().includes(query) ?? false)
}

export function exportPaymentsToCsv(payments: Payment[]): string {
  const headers = [
    'Payment Number',
    'Status',
    'Amount',
    'Paid Amount',
    'Outstanding',
    'Due Date',
    'Payment Date',
    'Method',
    'Type',
    'Receipt Number',
  ]
  const rows = payments.map(p => [
    p.paymentNumber,
    p.status,
    p.amount,
    p.paidAmount ?? '',
    p.outstandingBalance ?? '',
    p.dueDate,
    p.paymentDate,
    p.paymentMethod ?? '',
    p.paymentType,
    p.receiptNumber ?? '',
  ])
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}
