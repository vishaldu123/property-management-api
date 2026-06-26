"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invitationDetailsSchema = exports.listMembersQuerySchema = exports.transferOwnershipSchema = exports.reactivateMemberSchema = exports.suspendMemberSchema = exports.removeMemberSchema = exports.resendInvitationSchema = exports.cancelInvitationSchema = exports.rejectInvitationSchema = exports.acceptInvitationSchema = exports.inviteMemberSchema = exports.memberRoleEnum = exports.invitationStatusEnum = exports.membershipStatusEnum = void 0;
const zod_1 = require("zod");
const validation_1 = require("../shared/validation");
// Membership Status Enums
exports.membershipStatusEnum = zod_1.z.enum(['ACTIVE', 'INVITED', 'SUSPENDED', 'REMOVED']);
exports.invitationStatusEnum = zod_1.z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED']);
exports.memberRoleEnum = zod_1.z.enum(['OWNER', 'ADMIN', 'MEMBER']);
// Invite Member Schema
exports.inviteMemberSchema = zod_1.z.object({
    email: validation_1.ValidationSchemas.email,
    role: exports.memberRoleEnum.default('MEMBER'),
});
// Accept Invitation Schema
exports.acceptInvitationSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Invitation token is required').max(500),
});
// Reject Invitation Schema
exports.rejectInvitationSchema = zod_1.z.object({
    token: zod_1.z.string().min(1, 'Invitation token is required').max(500),
});
// Cancel Invitation Schema
exports.cancelInvitationSchema = zod_1.z.object({
    invitationId: zod_1.z.string().uuid('Invalid invitation ID'),
});
// Resend Invitation Schema
exports.resendInvitationSchema = zod_1.z.object({
    invitationId: zod_1.z.string().uuid('Invalid invitation ID'),
});
// Remove Member Schema
exports.removeMemberSchema = zod_1.z.object({
    memberId: zod_1.z.string().uuid('Invalid member ID'),
});
// Suspend Member Schema
exports.suspendMemberSchema = zod_1.z.object({
    memberId: zod_1.z.string().uuid('Invalid member ID'),
    reason: zod_1.z.string().min(1, 'Suspension reason is required').max(500, 'Reason is too long').optional(),
});
// Reactivate Member Schema
exports.reactivateMemberSchema = zod_1.z.object({
    memberId: zod_1.z.string().uuid('Invalid member ID'),
});
// Transfer Ownership Schema
exports.transferOwnershipSchema = zod_1.z.object({
    newOwnerId: zod_1.z.string().uuid('Invalid member ID'),
});
// List Members Query
exports.listMembersQuerySchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
    search: zod_1.z.string().optional(),
    status: exports.membershipStatusEnum.optional(),
    role: exports.memberRoleEnum.optional(),
    sort: zod_1.z.enum(['name', 'email', 'joinedAt', 'status']).default('joinedAt'),
    order: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
// Invitation Details Schema (for response)
exports.invitationDetailsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    organizationId: zod_1.z.string().uuid(),
    email: zod_1.z.string().email(),
    status: exports.invitationStatusEnum,
    invitedBy: zod_1.z.string(),
    expiresAt: zod_1.z.date(),
    acceptedAt: zod_1.z.date().nullable(),
    rejectedAt: zod_1.z.date().nullable(),
    cancelledAt: zod_1.z.date().nullable(),
    sentCount: zod_1.z.number(),
    lastSentAt: zod_1.z.date(),
    createdAt: zod_1.z.date(),
});
