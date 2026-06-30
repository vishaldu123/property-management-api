import { useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentService, type ListPaymentsParams } from '@/shared/services'
import { PAYMENT_QUERY_KEYS } from '../constants'

export function usePaymentsList(params: ListPaymentsParams, enabled = true) {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.list(params as Record<string, unknown>),
    queryFn: () => paymentService.listPayments(params),
    enabled,
    staleTime: 30_000,
  })
}

export function usePaymentDetail(paymentId: string | undefined) {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.detail(paymentId ?? ''),
    queryFn: () => paymentService.getPayment(paymentId!),
    enabled: !!paymentId,
    staleTime: 60_000,
  })
}

export function usePaymentStats() {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.stats(),
    queryFn: () => paymentService.getOrganizationStatistics(),
    staleTime: 60_000,
  })
}

export function useLeasePaymentHistory(leaseId: string | undefined) {
  return useQuery({
    queryKey: PAYMENT_QUERY_KEYS.leaseHistory(leaseId ?? ''),
    queryFn: () =>
      paymentService.listPayments({ leaseId, limit: 50, sortBy: 'paymentDate', sortOrder: 'desc' }),
    enabled: !!leaseId,
    staleTime: 30_000,
  })
}

export function usePrefetchPayment() {
  const queryClient = useQueryClient()

  return (paymentId: string) => {
    queryClient.prefetchQuery({
      queryKey: PAYMENT_QUERY_KEYS.detail(paymentId),
      queryFn: () => paymentService.getPayment(paymentId),
      staleTime: 60_000,
    })
  }
}

export function useInvalidatePayments() {
  const queryClient = useQueryClient()

  return {
    invalidateList: () => queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.lists() }),
    invalidateDetail: (id: string) =>
      queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.detail(id) }),
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: PAYMENT_QUERY_KEYS.all }),
  }
}
