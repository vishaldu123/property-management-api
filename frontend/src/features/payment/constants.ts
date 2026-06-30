import type { PaymentStatus, PaymentMethod, PaymentType } from '@/shared/services'

export const PAYMENT_STATUSES: PaymentStatus[] = [
  'Pending',
  'Paid',
  'PartiallyPaid',
  'Overdue',
  'Failed',
  'Refunded',
  'Cancelled',
]

export const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'BankTransfer',
  'Cheque',
  'CreditCard',
  'DebitCard',
  'UPI',
  'Online',
]

export const PAYMENT_TYPES: PaymentType[] = [
  'Rent',
  'SecurityDeposit',
  'LateFee',
  'Discount',
  'Refund',
  'Other',
]

export const OUTSTANDING_STATUSES: PaymentStatus[] = ['Pending', 'PartiallyPaid', 'Overdue']

export const PAYMENT_QUERY_KEYS = {
  all: ['payments'] as const,
  lists: () => [...PAYMENT_QUERY_KEYS.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...PAYMENT_QUERY_KEYS.lists(), params] as const,
  details: () => [...PAYMENT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PAYMENT_QUERY_KEYS.details(), id] as const,
  stats: () => [...PAYMENT_QUERY_KEYS.all, 'stats'] as const,
  leaseHistory: (leaseId: string) => [...PAYMENT_QUERY_KEYS.all, 'lease', leaseId] as const,
}
