import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
  UseQueryResult,
} from '@tanstack/react-query'
import { toastService } from '@/shared/services'
import { AxiosError } from 'axios'
import { ApiError } from '@/types'

/**
 * Custom hook for data fetching with error handling and notifications
 */
export function useQueryWithToast<TData>(
  options: UseQueryOptions<TData, AxiosError<ApiError>>,
  showErrorToast = true
): UseQueryResult<TData, AxiosError<ApiError>> {
  return useQuery({
    ...options,
    retry: 1,
    meta: {
      ...options.meta,
      showErrorToast,
    },
  })
}

/**
 * Custom hook for mutations with error handling and notifications
 */
export function useMutationWithToast<TData = unknown, TVariables = unknown, TContext = unknown>(
  options: UseMutationOptions<TData, AxiosError<ApiError>, TVariables, TContext>,
  {
    successMessage,
    showErrorToast = true,
  }: {
    successMessage?: string
    showErrorToast?: boolean
  } = {}
) {
  return useMutation<TData, AxiosError<ApiError>, TVariables, TContext>({
    ...options,
    onSuccess: (data: TData, variables: TVariables) => {
      if (successMessage) {
        toastService.success(successMessage)
      }
      return (options.onSuccess as any)?.(data, variables)
    },
    onError: (error: AxiosError<ApiError>, variables: TVariables) => {
      if (showErrorToast) {
        const message = error.response?.data?.message || 'An error occurred'
        toastService.error(message)
      }
      return (options.onError as any)?.(error, variables)
    },
  })
}
