import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';
import { ListMembersQuery } from '../validators/membership.validators';
import { PaginationRequest } from '../shared/core/pagination';

export class MembershipRepository {
  /**
   * Create organization invitation
   */
  async createInvitation(data: {
    organizationId: string;
    email: string;
    invitedBy: string;
    token: string;
    expiresAt: Date;
  }) {
    return prisma.organizationInvitation.create({
      data,
    });
  }

  /**
   * Get invitation by token
   */
  async getInvitationByToken(token: string) {
    return prisma.organizationInvitation.findUnique({
      where: { token },
      include: {
        organization: true,
      },
    });
  }

  /**
   * Get invitation by ID
   */
  async getInvitationById(id: string) {
    return prisma.organizationInvitation.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(invitationId: string, organizationUserId: string) {
    return prisma.organizationInvitation.update({
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
  async rejectInvitation(invitationId: string) {
    return prisma.organizationInvitation.update({
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
  async cancelInvitation(invitationId: string) {
    return prisma.organizationInvitation.update({
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
  async expireInvitation(invitationId: string) {
    return prisma.organizationInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'EXPIRED',
      },
    });
  }

  /**
   * Resend invitation
   */
  async resendInvitation(invitationId: string) {
    return prisma.organizationInvitation.update({
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
  async isMember(organizationId: string, userId: string) {
    const membership = await prisma.organizationUser.findUnique({
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
  async hasPendingInvitation(organizationId: string, email: string) {
    const invitation = await prisma.organizationInvitation.findUnique({
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
  async createMembership(data: {
    organizationId: string;
    userId: string;
    role: string;
    isOwner: boolean;
    createdBy: string;
  }) {
    return prisma.organizationUser.create({
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
  async getMemberById(memberId: string) {
    return prisma.organizationUser.findUnique({
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
  async getMemberWithIsolation(organizationId: string, memberId: string) {
    return prisma.organizationUser.findFirst({
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
  async listMembers(organizationId: string, query: ListMembersQuery) {
    const pagination = new PaginationRequest(query.page, query.limit, query.sort, query.order);

    const where: Prisma.OrganizationUserWhereInput = {
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
      prisma.organizationUser.findMany({
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
      prisma.organizationUser.count({ where }),
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
  async suspendMember(memberId: string, reason?: string) {
    return prisma.organizationUser.update({
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
  async reactivateMember(memberId: string) {
    return prisma.organizationUser.update({
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
  async removeMember(memberId: string, userId: string) {
    return prisma.organizationUser.update({
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
  async getOrganizationOwner(organizationId: string) {
    return prisma.organizationUser.findFirst({
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
  async transferOwnership(currentOwnerId: string, newOwnerId: string) {
    return prisma.$transaction([
      prisma.organizationUser.update({
        where: { id: currentOwnerId },
        data: { isOwner: false, role: 'ADMIN' },
      }),
      prisma.organizationUser.update({
        where: { id: newOwnerId },
        data: { isOwner: true, role: 'OWNER' },
      }),
    ]);
  }

  /**
   * Get member count for organization
   */
  async getMemberCount(organizationId: string) {
    return prisma.organizationUser.count({
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
  async getPendingInvitations(organizationId: string) {
    return prisma.organizationInvitation.findMany({
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

export const membershipRepository = new MembershipRepository();
