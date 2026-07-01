import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { membershipService, healthService } from '../services/administration.service'
import { authService } from '@/shared/services'
import type { ListMembersParams } from '../types'
import { ADMIN_QUERY_KEY } from '../constants'

export function useMembersList(organizationId: string | undefined, params: ListMembersParams = {}) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEY, 'members', organizationId, params],
    queryFn: () => membershipService.listMembers(organizationId!, params),
    enabled: !!organizationId,
    staleTime: 30_000,
  })
}

export function useInviteMember(organizationId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { email: string; role?: 'OWNER' | 'ADMIN' | 'MEMBER' }) =>
      membershipService.inviteMember(organizationId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_QUERY_KEY, 'members', organizationId] })
    },
  })
}

export function useSuspendMember(organizationId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ memberId, reason }: { memberId: string; reason?: string }) =>
      membershipService.suspendMember(organizationId!, memberId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_QUERY_KEY, 'members', organizationId] })
    },
  })
}

export function useReactivateMember(organizationId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) => membershipService.reactivateMember(organizationId!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_QUERY_KEY, 'members', organizationId] })
    },
  })
}

export function useRemoveMember(organizationId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (memberId: string) => membershipService.removeMember(organizationId!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ADMIN_QUERY_KEY, 'members', organizationId] })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: {
      currentPassword: string
      newPassword: string
      confirmPassword: string
    }) => authService.changePassword(payload),
  })
}

export function useSystemHealth() {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEY, 'health'],
    queryFn: () => healthService.getDetailedHealth(),
    staleTime: 120_000,
    retry: 1,
  })
}
