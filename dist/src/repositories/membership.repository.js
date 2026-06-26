"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.membershipRepository = exports.MembershipRepository = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const pagination_1 = require("../shared/core/pagination");
class MembershipRepository {
    /**
     * Create organization invitation
     */
    async createInvitation(data) {
        return prisma_1.default.organizationInvitation.create({
            data,
        });
    }
    /**
     * Get invitation by token
     */
    async getInvitationByToken(token) {
        return prisma_1.default.organizationInvitation.findUnique({
            where: { token },
            include: {
                organization: true,
            },
        });
    }
    /**
     * Get invitation by ID
     */
    async getInvitationById(id) {
        return prisma_1.default.organizationInvitation.findUnique({
            where: { id },
            include: {
                organization: true,
            },
        });
    }
    /**
     * Accept invitation
     */
    async acceptInvitation(invitationId, organizationUserId) {
        return prisma_1.default.organizationInvitation.update({
            where: { id: invitationId },
            data: {
                status: 'ACCEPTED',
                acceptedAt: new Date(),
                organizationUserId,
            },
            include: {
                organization: true,
            },
        });
    }
    /**
     * Reject invitation
     */
    async rejectInvitation(invitationId) {
        return prisma_1.default.organizationInvitation.update({
            where: { id: invitationId },
            data: {
                status: 'REJECTED',
                rejectedAt: new Date(),
            },
            include: {
                organization: true,
            },
        });
    }
    /**
     * Cancel invitation
     */
    async cancelInvitation(invitationId) {
        return prisma_1.default.organizationInvitation.update({
            where: { id: invitationId },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
            },
            include: {
                organization: true,
            },
        });
    }
    /**
     * Update invitation status to expired
     */
    async expireInvitation(invitationId) {
        return prisma_1.default.organizationInvitation.update({
            where: { id: invitationId },
            data: {
                status: 'EXPIRED',
            },
        });
    }
    /**
     * Resend invitation
     */
    async resendInvitation(invitationId) {
        return prisma_1.default.organizationInvitation.update({
            where: { id: invitationId },
            data: {
                sentCount: { increment: 1 },
                lastSentAt: new Date(),
            },
        });
    }
    /**
     * Check if user is already a member
     */
    async isMember(organizationId, userId) {
        const membership = await prisma_1.default.organizationUser.findUnique({
            where: {
                organizationId_userId: {
                    organizationId,
                    userId,
                },
            },
        });
        return !!membership;
    }
    /**
     * Check if user has pending invitation
     */
    async hasPendingInvitation(organizationId, email) {
        const invitation = await prisma_1.default.organizationInvitation.findUnique({
            where: {
                organizationId_email_status: {
                    organizationId,
                    email,
                    status: 'PENDING',
                },
            },
        });
        return !!invitation;
    }
    /**
     * Create organization membership
     */
    async createMembership(data) {
        return prisma_1.default.organizationUser.create({
            data: {
                organizationId: data.organizationId,
                userId: data.userId,
                role: data.role,
                isOwner: data.isOwner,
                status: 'ACTIVE',
                createdBy: data.createdBy,
            },
            include: {
                user: true,
                organization: true,
            },
        });
    }
    /**
     * Get member by ID
     */
    async getMemberById(memberId) {
        return prisma_1.default.organizationUser.findUnique({
            where: { id: memberId },
            include: {
                user: true,
                organization: true,
            },
        });
    }
    /**
     * Get member with organization isolation check
     */
    async getMemberWithIsolation(organizationId, memberId) {
        return prisma_1.default.organizationUser.findFirst({
            where: {
                id: memberId,
                organizationId,
                deletedAt: null,
            },
            include: {
                user: true,
                organization: true,
            },
        });
    }
    /**
     * List organization members
     */
    async listMembers(organizationId, query) {
        const pagination = new pagination_1.PaginationRequest(query.page, query.limit, query.sort, query.order);
        const where = {
            organizationId,
            deletedAt: null,
            ...(query.status && { status: query.status }),
            ...(query.role && { role: query.role }),
            ...(query.search && {
                OR: [
                    { user: { name: { contains: query.search, mode: 'insensitive' } } },
                    { user: { email: { contains: query.search, mode: 'insensitive' } } },
                ],
            }),
        };
        const [items, total] = await Promise.all([
            prisma_1.default.organizationUser.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    [pagination.sort]: pagination.order,
                },
                skip: pagination.getSkip(),
                take: pagination.limit,
            }),
            prisma_1.default.organizationUser.count({ where }),
        ]);
        return {
            data: items,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total,
                pages: Math.ceil(total / pagination.limit),
            },
        };
    }
    /**
     * Suspend member
     */
    async suspendMember(memberId, reason) {
        return prisma_1.default.organizationUser.update({
            where: { id: memberId },
            data: {
                status: 'SUSPENDED',
                suspendedAt: new Date(),
                suspendedReason: reason,
            },
            include: {
                user: true,
                organization: true,
            },
        });
    }
    /**
     * Reactivate member
     */
    async reactivateMember(memberId) {
        return prisma_1.default.organizationUser.update({
            where: { id: memberId },
            data: {
                status: 'ACTIVE',
                suspendedAt: null,
                suspendedReason: null,
            },
            include: {
                user: true,
                organization: true,
            },
        });
    }
    /**
     * Soft delete member
     */
    async removeMember(memberId, userId) {
        return prisma_1.default.organizationUser.update({
            where: { id: memberId },
            data: {
                status: 'REMOVED',
                deletedAt: new Date(),
                updatedBy: userId,
            },
            include: {
                user: true,
                organization: true,
            },
        });
    }
    /**
     * Get organization owner
     */
    async getOrganizationOwner(organizationId) {
        return prisma_1.default.organizationUser.findFirst({
            where: {
                organizationId,
                isOwner: true,
                deletedAt: null,
            },
            include: {
                user: true,
            },
        });
    }
    /**
     * Transfer ownership
     */
    async transferOwnership(currentOwnerId, newOwnerId) {
        return prisma_1.default.$transaction([
            prisma_1.default.organizationUser.update({
                where: { id: currentOwnerId },
                data: { isOwner: false, role: 'ADMIN' },
            }),
            prisma_1.default.organizationUser.update({
                where: { id: newOwnerId },
                data: { isOwner: true, role: 'OWNER' },
            }),
        ]);
    }
    /**
     * Get member count for organization
     */
    async getMemberCount(organizationId) {
        return prisma_1.default.organizationUser.count({
            where: {
                organizationId,
                status: 'ACTIVE',
                deletedAt: null,
            },
        });
    }
    /**
     * Get pending invitations for organization
     */
    async getPendingInvitations(organizationId) {
        return prisma_1.default.organizationInvitation.findMany({
            where: {
                organizationId,
                status: 'PENDING',
            },
            include: {
                organization: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
exports.MembershipRepository = MembershipRepository;
exports.membershipRepository = new MembershipRepository();
