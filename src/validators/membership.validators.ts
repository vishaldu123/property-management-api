import { z } from 'zod';
import { ValidationSchemas } from '../shared/validation';

// Membership Status Enums
export const membershipStatusEnum = z.enum(['ACTIVE', 'INVITED', 'SUSPENDED', 'REMOVED']);
export const invitationStatusEnum = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED']);
export const memberRoleEnum = z.enum(['OWNER', 'ADMIN', 'MEMBER']);

// Invite Member Schema
export const inviteMemberSchema = z.object({
  email: ValidationSchemas.email,
  role: memberRoleEnum.default('MEMBER'),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

// Accept Invitation Schema
export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Invitation token is required').max(500),
});

export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;

// Reject Invitation Schema
export const rejectInvitationSchema = z.object({
  token: z.string().min(1, 'Invitation token is required').max(500),
});

export type RejectInvitationInput = z.infer<typeof rejectInvitationSchema>;

// Cancel Invitation Schema
export const cancelInvitationSchema = z.object({
  invitationId: z.string().uuid('Invalid invitation ID'),
});

export type CancelInvitationInput = z.infer<typeof cancelInvitationSchema>;

// Resend Invitation Schema
export const resendInvitationSchema = z.object({
  invitationId: z.string().uuid('Invalid invitation ID'),
});

export type ResendInvitationInput = z.infer<typeof resendInvitationSchema>;

// Remove Member Schema
export const removeMemberSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
});

export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;

// Suspend Member Schema
export const suspendMemberSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
  reason: z.string().min(1, 'Suspension reason is required').max(500, 'Reason is too long').optional(),
});

export type SuspendMemberInput = z.infer<typeof suspendMemberSchema>;

// Reactivate Member Schema
export const reactivateMemberSchema = z.object({
  memberId: z.string().uuid('Invalid member ID'),
});

export type ReactivateMemberInput = z.infer<typeof reactivateMemberSchema>;

// Transfer Ownership Schema
export const transferOwnershipSchema = z.object({
  newOwnerId: z.string().uuid('Invalid member ID'),
});

export type TransferOwnershipInput = z.infer<typeof transferOwnershipSchema>;

// List Members Query
export const listMembersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: membershipStatusEnum.optional(),
  role: memberRoleEnum.optional(),
  sort: z.enum(['name', 'email', 'joinedAt', 'status']).default('joinedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export type ListMembersQuery = z.infer<typeof listMembersQuerySchema>;

// Invitation Details Schema (for response)
export const invitationDetailsSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  email: z.string().email(),
  status: invitationStatusEnum,
  invitedBy: z.string(),
  expiresAt: z.date(),
  acceptedAt: z.date().nullable(),
  rejectedAt: z.date().nullable(),
  cancelledAt: z.date().nullable(),
  sentCount: z.number(),
  lastSentAt: z.date(),
  createdAt: z.date(),
});

export type InvitationDetails = z.infer<typeof invitationDetailsSchema>;
