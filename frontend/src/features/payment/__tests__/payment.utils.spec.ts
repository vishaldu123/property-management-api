import { describe, it, expect } from 'vitest'
import {
  calculateNetAmount,
  calculateOutstanding,
  formatPaymentCurrency,
  generatePaymentNumber,
  buildPaymentTimeline,
  filterByAmountRange,
  filterByReceiptNumber,
  exportPaymentsToCsv,
  getStatusBadgeClass,
} from '../utils/payment.utils'
import type { Payment } from '@/shared/services'

const mockPayment: Payment = {
  id: '1',
  organizationId: 'org-1',
  paymentNumber: 'PAY-001',
  leaseId: 'lease-1',
  propertyId: 'prop-1',
  unitId: 'unit-1',
  tenantId: 'tenant-1',
  amount: 1000,
  currency: 'USD',
  paymentDate: '2025-01-15T00:00:00.000Z',
  dueDate: '2025-01-01T00:00:00.000Z',
  status: 'PartiallyPaid',
  paymentType: 'Rent',
  paymentMethod: 'BankTransfer',
  paidAmount: 500,
  outstandingBalance: 500,
  lateFee: 50,
  discount: 25,
  tax: 10,
  receiptNumber: 'RCP-001',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-15T00:00:00.000Z',
}

describe('payment.utils', () => {
  it('calculates net amount with fees and discounts', () => {
    expect(calculateNetAmount(1000, 50, 25, 10)).toBe(1035)
  })

  it('calculates outstanding balance', () => {
    expect(calculateOutstanding(1000, 50, 25, 10, 500)).toBe(535)
  })

  it('formats currency', () => {
    expect(formatPaymentCurrency(1234.5)).toContain('1,234.50')
  })

  it('generates unique payment numbers', () => {
    const a = generatePaymentNumber()
    const b = generatePaymentNumber()
    expect(a).toMatch(/^PAY-/)
    expect(a).not.toBe(b)
  })

  it('builds payment timeline events', () => {
    const events = buildPaymentTimeline(mockPayment)
    expect(events.some(e => e.type === 'created')).toBe(true)
    expect(events.some(e => e.type === 'partial_payment')).toBe(true)
    expect(events.some(e => e.type === 'receipt_generated')).toBe(true)
  })

  it('filters by amount range', () => {
    const payments = [
      { ...mockPayment, id: '1', amount: 100 },
      { ...mockPayment, id: '2', amount: 500 },
      { ...mockPayment, id: '3', amount: 1000 },
    ]
    const filtered = filterByAmountRange(payments, 200, 800)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].amount).toBe(500)
  })

  it('filters by receipt number', () => {
    const payments = [
      { ...mockPayment, receiptNumber: 'RCP-001' },
      { ...mockPayment, id: '2', receiptNumber: 'RCP-999' },
    ]
    expect(filterByReceiptNumber(payments, '999')).toHaveLength(1)
  })

  it('exports payments to CSV', () => {
    const csv = exportPaymentsToCsv([mockPayment])
    expect(csv).toContain('PAY-001')
    expect(csv).toContain('PartiallyPaid')
  })

  it('returns status badge classes', () => {
    expect(getStatusBadgeClass('Paid')).toContain('green')
    expect(getStatusBadgeClass('Overdue')).toContain('red')
  })
})
