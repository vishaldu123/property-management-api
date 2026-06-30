import { apiClient } from './api-client'
import { PaginatedResponse } from '@/types'

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
  status: string
  paymentType: string
  paymentMethod?: string
  paidAmount?: number
  outstandingBalance?: number
  paidAt?: string
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

export interface PaymentListResult extends PaginatedResponse<Payment> {}

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
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export const paymentService = {
  listPayments: async (params: ListPaymentsParams = {}): Promise<PaginatedResponse<Payment>> => {
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

    const response = await apiClient.get<PaginatedResponse<Payment>>(
      `/payments?${searchParams.toString()}`
    )
    return response.data
  },

  getOrganizationStatistics: async (): Promise<PaymentStatistics> => {
    const response = await apiClient.get<PaymentStatistics>('/payments/stats/organization')
    return response.data
  },
}
