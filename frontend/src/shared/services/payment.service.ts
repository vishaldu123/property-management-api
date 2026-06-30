import { apiClient } from './api-client'
import { PaginatedResponse } from '@/types'

export type PaymentStatus =
  | 'Pending'
  | 'Paid'
  | 'PartiallyPaid'
  | 'Overdue'
  | 'Failed'
  | 'Refunded'
  | 'Cancelled'

export type PaymentMethod =
  | 'Cash'
  | 'BankTransfer'
  | 'Cheque'
  | 'CreditCard'
  | 'DebitCard'
  | 'UPI'
  | 'Online'

export type PaymentType = 'Rent' | 'SecurityDeposit' | 'LateFee' | 'Discount' | 'Refund' | 'Other'

export interface Payment {
  id: string
  organizationId: string
  paymentNumber: string
  leaseId: string
  propertyId: string
  unitId: string
  tenantId: string
  amount: number
  currency: string
  paymentDate: string
  dueDate: string
  status: PaymentStatus
  paymentType: PaymentType
  paymentMethod?: PaymentMethod
  paidAmount?: number
  outstandingBalance?: number
  paidAt?: string
  referenceNumber?: string
  notes?: string
  lateFee?: number
  discount?: number
  tax?: number
  receiptNumber?: string
  deletedAt?: string
  createdBy?: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
}

export interface PaymentStatistics {
  totalPayments: number
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
  pendingCount: number
  overDueCount: number
  paidCount: number
}

export interface LeasePaymentStatistics {
  totalPayments: number
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
}

export interface CreatePaymentRequest {
  leaseId: string
  paymentNumber: string
  amount: number
  currency?: string
  paymentDate: string
  dueDate: string
  paymentMethod?: PaymentMethod
  paymentType?: PaymentType
  status?: PaymentStatus
  referenceNumber?: string
  notes?: string
  lateFee?: number
  discount?: number
  tax?: number
  receiptNumber?: string
  paidAmount?: number
}

export interface UpdatePaymentRequest {
  paymentDate?: string
  dueDate?: string
  paymentMethod?: PaymentMethod
  paymentType?: PaymentType
  status?: PaymentStatus
  referenceNumber?: string
  notes?: string
  lateFee?: number
  discount?: number
  tax?: number
  receiptNumber?: string
  paidAmount?: number
}

export interface MarkAsPaidRequest {
  paidAmount?: number
}

export interface RefundPaymentRequest {
  refundAmount?: number
}

export interface GenerateReceiptResponse {
  receiptNumber: string
}

export interface ListPaymentsParams {
  page?: number
  limit?: number
  status?: string
  paymentMethod?: string
  paymentType?: string
  leaseId?: string
  propertyId?: string
  unitId?: string
  tenantId?: string
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: 'paymentDate' | 'dueDate' | 'amount' | 'createdAt' | 'status'
  sortOrder?: 'asc' | 'desc'
}

function normalizePayment(raw: Payment): Payment {
  return {
    ...raw,
    amount: Number(raw.amount),
    paidAmount: raw.paidAmount !== undefined ? Number(raw.paidAmount) : undefined,
    outstandingBalance:
      raw.outstandingBalance !== undefined ? Number(raw.outstandingBalance) : undefined,
    lateFee: raw.lateFee !== undefined ? Number(raw.lateFee) : undefined,
    discount: raw.discount !== undefined ? Number(raw.discount) : undefined,
    tax: raw.tax !== undefined ? Number(raw.tax) : undefined,
  }
}

function buildSearchParams(params: ListPaymentsParams): string {
  const searchParams = new URLSearchParams()

  if (params.page) searchParams.append('page', params.page.toString())
  if (params.limit) searchParams.append('limit', params.limit.toString())
  if (params.status) searchParams.append('status', params.status)
  if (params.paymentMethod) searchParams.append('paymentMethod', params.paymentMethod)
  if (params.paymentType) searchParams.append('paymentType', params.paymentType)
  if (params.leaseId) searchParams.append('leaseId', params.leaseId)
  if (params.propertyId) searchParams.append('propertyId', params.propertyId)
  if (params.unitId) searchParams.append('unitId', params.unitId)
  if (params.tenantId) searchParams.append('tenantId', params.tenantId)
  if (params.startDate) searchParams.append('startDate', params.startDate)
  if (params.endDate) searchParams.append('endDate', params.endDate)
  if (params.search) searchParams.append('search', params.search)
  if (params.sortBy) searchParams.append('sortBy', params.sortBy)
  if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)

  return searchParams.toString()
}

export const paymentService = {
  listPayments: async (params: ListPaymentsParams = {}): Promise<PaginatedResponse<Payment>> => {
    const response = await apiClient.get<PaginatedResponse<Payment>>(
      `/payments?${buildSearchParams(params)}`
    )
    return {
      ...response.data,
      data: response.data.data.map(normalizePayment),
    }
  },

  getPayment: async (paymentId: string): Promise<Payment> => {
    const response = await apiClient.get<Payment>(`/payments/${paymentId}`)
    return normalizePayment(response.data)
  },

  createPayment: async (payload: CreatePaymentRequest): Promise<Payment> => {
    const response = await apiClient.post<Payment>('/payments', payload)
    return normalizePayment(response.data)
  },

  updatePayment: async (paymentId: string, payload: UpdatePaymentRequest): Promise<Payment> => {
    const response = await apiClient.put<Payment>(`/payments/${paymentId}`, payload)
    return normalizePayment(response.data)
  },

  markAsPaid: async (paymentId: string, payload: MarkAsPaidRequest = {}): Promise<Payment> => {
    const response = await apiClient.patch<Payment>(`/payments/${paymentId}/mark-as-paid`, payload)
    return normalizePayment(response.data)
  },

  markAsOverdue: async (paymentId: string): Promise<Payment> => {
    const response = await apiClient.patch<Payment>(`/payments/${paymentId}/mark-as-overdue`, {})
    return normalizePayment(response.data)
  },

  refundPayment: async (
    paymentId: string,
    payload: RefundPaymentRequest = {}
  ): Promise<Payment> => {
    const response = await apiClient.patch<Payment>(`/payments/${paymentId}/refund`, payload)
    return normalizePayment(response.data)
  },

  generateReceipt: async (paymentId: string): Promise<GenerateReceiptResponse> => {
    const response = await apiClient.post<GenerateReceiptResponse>(
      `/payments/${paymentId}/generate-receipt`,
      {}
    )
    return response.data
  },

  deletePayment: async (paymentId: string): Promise<Payment> => {
    const response = await apiClient.delete<Payment>(`/payments/${paymentId}`)
    return normalizePayment(response.data)
  },

  restorePayment: async (paymentId: string): Promise<Payment> => {
    const response = await apiClient.patch<Payment>(`/payments/${paymentId}/restore`, {})
    return normalizePayment(response.data)
  },

  getOrganizationStatistics: async (): Promise<PaymentStatistics> => {
    const response = await apiClient.get<PaymentStatistics>('/payments/stats/organization')
    return {
      ...response.data,
      totalAmount: Number(response.data.totalAmount),
      paidAmount: Number(response.data.paidAmount),
      outstandingAmount: Number(response.data.outstandingAmount),
    }
  },

  getLeaseStatistics: async (leaseId: string): Promise<LeasePaymentStatistics> => {
    const response = await apiClient.get<LeasePaymentStatistics>(
      `/payments/leases/${leaseId}/payments/stats`
    )
    return {
      ...response.data,
      totalAmount: Number(response.data.totalAmount),
      paidAmount: Number(response.data.paidAmount),
      outstandingAmount: Number(response.data.outstandingAmount),
    }
  },

  getTenantStatistics: async (tenantId: string): Promise<LeasePaymentStatistics> => {
    const response = await apiClient.get<LeasePaymentStatistics>(
      `/payments/tenants/${tenantId}/payments/stats`
    )
    return {
      ...response.data,
      totalAmount: Number(response.data.totalAmount),
      paidAmount: Number(response.data.paidAmount),
      outstandingAmount: Number(response.data.outstandingAmount),
    }
  },
}
