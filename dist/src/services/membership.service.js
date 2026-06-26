"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.membershipService = exports.MembershipService = void 0;
const membership_repository_1 = require("../repositories/membership.repository");
const organization_repository_1 = require("../repositories/organization.repository");
const user_repository_1 = require("../repositories/user.repository");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const email_service_1 = require("./email.service");
const crypto_1 = require("crypto");
class MembershipService {
    emailService = new email_service_1.EmailService();
    tokenExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days
    /**
     * Invite member to organization
     */
    async inviteMember(organizationId, payload, context) {
        // Verify organization exists
        const organization = await organization_repository_1.organizationRepository.findById(organizationId);
        if (!organization) {
            throw new errors_1.NotFoundError('Organization');
        }
        // Verify actor is organization owner or admin
        const actorMembership = await membership_repository_1.membershipRepository.getMemberWithIsolation(organizationId, context.userId);
        if (!actorMembership || (actorMembership.role !== 'OWNER' && actorMembership.role !== 'ADMIN')) {
            throw new errors_1.ForbiddenError('Only owners and admins can invite members');
        }
        // Check if email is already a member
        const user = await user_repository_1.userRepository.findByEmail(payload.email);
        if (user && await membership_repository_1.membershipRepository.isMember(organizationId, user.id)) {
            throw new errors_1.ConflictError('User is already a member of this organization');
        }
        // Check for pending invitation
        if (await membership_repository_1.membershipRepository.hasPendingInvitation(organizationId, payload.email)) {
            throw new errors_1.ConflictError('Pending invitation already exists for this email');
        }
        // Generate secure token
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date(Date.now() + this.tokenExpiry);
        // Create invitation
        const invitation = await membership_repository_1.membershipRepository.createInvitation({
            organizationId,
            email: payload.email,
            invitedBy: context.userId,
            token,
            expiresAt,
        });
        // Send invitation email
        await this.emailService.sendInvitationEmail({
            email: payload.email,
            organizationName: organization.name,
            inviteLink: `${process.env.FRONTEND_URL}/join?token=${token}`,
            inviterName: actorMembership.user.name,
        });
        logger_1.default.info('Member invited', {
            organizationId,
            invitedEmail: payload.email,
            invitedBy: context.userId,
        });
        return invitation;
    }
    /**
     * Accept invitation
     */
    async acceptInvitation(payload, context) {
        // Get invitation by token
        const invitation = await membership_repository_1.membershipRepository.getInvitationByToken(payload.token);
        if (!invitation) {
            throw new errors_1.UnauthorizedError('Invalid or expired invitation token');
        }
        // Check invitation status
        if (invitation.status !== 'PENDING') {
            throw new errors_1.ConflictError(`Invitation is ${invitation.status.toLowerCase()}`);
        }
        // Check if invitation expired
        if (new Date() > invitation.expiresAt) {
            await membership_repository_1.membershipRepository.expireInvitation(invitation.id);
            throw new errors_1.UnauthorizedError('Invitation has expired');
        }
        // Verify user email matches
        const user = await user_repository_1.userRepository.findById(context.userId);
        if (!user || user.email !== invitation.email) {
            throw new errors_1.UnauthorizedError('Invitation email does not match your account');
        }
        // Check if user is already a member
        if (await membership_repository_1.membershipRepository.isMember(invitation.organizationId, context.userId)) {
            throw new errors_1.ConflictError('You are already a member of this organization');
        }
        // Create membership
        const membership = await membership_repository_1.membershipRepository.createMembership({
            organizationId: invitation.organizationId,
            userId: context.userId,
            role: 'MEMBER',
            isOwner: false,
            createdBy: context.userId,
        });
        // Accept invitation
        await membership_repository_1.membershipRepository.acceptInvitation(invitation.id, membership.id);
        logger_1.default.info('Invitation accepted', {
            organizationId: invitation.organizationId,
            userId: context.userId,
            invitationId: invitation.id,
        });
        return membership;
    }
    /**
     * Reject invitation
     */
    async rejectInvitation(payload, context) {
        const invitation = await membership_repository_1.membershipRepository.getInvitationByToken(payload.token);
        if (!invitation) {
            throw new errors_1.UnauthorizedError('Invalid or expired invitation token');
        }
        if (invitation.status !== 'PENDING') {
            throw new errors_1.ConflictError(`Invitation is ${invitation.status.toLowerCase()}`);
        }
        const user = await user_repository_1.userRepository.findById(context.userId);
        if (!user || user.email !== invitation.email) {
            throw new errors_1.UnauthorizedError('Invitation email does not match your account');
        }
        await membership_repository_1.membershipRepository.rejectInvitation(invitation.id);
        logger_1.default.info('Invitation rejected', {
            organizationId: invitation.organizationId,
            userId: context.userId,
            invitationId: invitation.id,
        });
        return invitation;
    }
    /**
     * Cancel invitation
     */
    async cancelInvitation(organizationId, payload, context) {
        // Verify actor is owner or admin
        const actorMembership = await membership_repository_1.membershipRepository.getMemberWithIsolation(organizationId, context.userId);
        if (!actorMembership || (actorMembership.role !== 'OWNER' && actorMembership.role !== 'ADMIN')) {
            throw new errors_1.ForbiddenError('Only owners and admins can cancel invitations');
        }
        const invitation = await membership_repository_1.membershipRepository.getInvitationById(payload.invitationId);
        if (!invitation || invitation.organizationId !== organizationId) {
            throw new errors_1.NotFoundError('Invitation');
        }
        if (invitation.status !== 'PENDING') {
            throw new errors_1.ConflictError(`Cannot cancel ${invitation.status.toLowerCase()} invitation`);
        }
        await membership_repository_1.membershipRepository.cancelInvitation(invitation.id);
        logger_1.default.info('Invitation cancelled', {
            organizationId,
            invitationId: payload.invitationId,
            cancelledBy: context.userId,
        });
        return invitation;
    }
    /**
     * Resend invitation
     */
    async resendInvitation(organizationId, payload, context) {
        const actorMembership = await membership_repository_1.membershipRepository.getMemberWithIsolation(organizationId, context.userId);
        if (!actorMembership || (actorMembership.role !== 'OWNER' && actorMembership.role !== 'ADMIN')) {
            throw new errors_1.ForbiddenError('Only owners and admins can resend invitations');
        }
        const invitation = await membership_repository_1.membershipRepository.getInvitationById(payload.invitationId);
        if (!invitation || invitation.organizationId !== organizationId) {
            throw new errors_1.NotFoundError('Invitation');
        }
        if (invitation.status !== 'PENDING') {
            throw new errors_1.ConflictError(`Cannot resend ${invitation.status.toLowerCase()} invitation`);
        }
        // Check if invitation expired
        if (new Date() > invitation.expiresAt) {
            throw new errors_1.ConflictError('Invitation has expired');
        }
        const organization = await organization_repository_1.organizationRepository.findById(organizationId);
        await membership_repository_1.membershipRepository.resendInvitation(invitation.id);
        // Resend email
        await this.emailService.sendInvitationEmail({
            email: invitation.email,
            organizationName: organization.name,
            inviteLink: `${process.env.FRONTEND_URL}/join?token=${invitation.token}`,
            inviterName: actorMembership.user.name,
        });
        logger_1.default.info('Invitation resent', {
            organizationId,
            invitationId: payload.invitationId,
            resentBy: context.userId,
        });
        return invitation;
    }
    /**
     * List organization members
     */
    async listMembers(organizationId, query, context) {
        // Verify actor is member of organization
        const actorMembership = await membership_repository_1.membershipRepository.getMemberWithIsolation(organizationId, context.userId);
        if (!actorMembership) {
            throw new errors_1.ForbiddenError('You are not a member of this organization');
        }
        const result = await membership_repository_1.membershipRepository.listMembers(organizationId, query);
        logger_1.default.info('Organization members listed', {
            organizationId,
            count: result.data.length,
            total: result.pagination.total,
        });
        return result;
    }
    /**
     * Get member details
     */
    async getMemberDetails(organizationId, memberId, context) {
        const actorMembership = await membership_repository_1.membershipRepository.getMemberWithIsolation(organizationId, context.userId);
        if (!actorMembership) {
            throw new errors_1.ForbiddenError('You are not a member of this organization');
        }
        const member = await membership_repository_1.membershipRepository.getMemberWithIsolation(organizationId, memberId);
        if (!member) {
            throw new errors_1.NotFoundError('Member');
        }
        return member;
    }
    /**
     * Suspend member
     */
    async suspendMember(organizationId, payload, context) {
        const actorMembership = await membership_repository_1.membershipRepository.getMemberWithIsolation(organizationId, context.userId);
        if (!actorMembership || actorMembership.role !== 'OWNER') {
            throw new errors_1.ForbiddenError('Only owners can suspend members');
        }
        const member = await membership_repository_1.membershipRepository.getMemberWithIsolation(organizationId, payload.memberId);
        if (!member) {
            throw new errors_1.NotFoundError('Member');
        }
        if (member.isOwner) {
            throw new errors_1.ConflictError('Cannot suspend organization owner');
        }
        if (member.status === 'SUSPENDED') {
            throw new errors_1.ConflictError('Member is already suspended');
        }
        await membership_repository_1.membershipRepository.suspendMember(payload.memberId, payload.reason);
        logger_1.default.info('Member suspended', {
            organizationId,
            memberId: payload.memberId,
            reason: payload.reason,
            suspendedBy: context.userId,
        });
        return member;
    }
    /**
     * Reactivate member
     */
    async reactivateMember(organizationId, payload, context) {
        const actorMembership = await membership_repository_1.membershipRepository.getMemberWithIsolation(organizationId, context.userId);
        if (!actorMembership || actorMembership.role !== 'OWNER') {
            throw new errors_1.ForbiddenError('Only owners can reactivate members');
        }
        const member = await membership_repository_1.membershipRepository.getMemberWithIsolation(organizationId, payload.memberId);
        if (!member) {
            throw new errors_1.NotFoundError('Member');
        }
        if (member.status !== 'SUSPENDED') {
            throw new errors_1.ConflictError('Member is not suspended');
        }
        await membership_repository_1.membershipRepository.reactivateMember(payload.memberId);
        logger_1.default.info('Member reactivated', {
            organizationId,
            memberId: payload.memberId,
            reactivatedBy: context.userId,
        });
        return member;
    }
    /**
     * Remove member
     */
    async removeMember(organizationId, payload, context) {
        const actorMembership = await membership_repository_1.membershipRepository.getMemberWithIsolation(organizationId, context.userId);
        if (!actorMembership || (actorMembership.role !== 'OWNER' && actorMembership.role !== 'ADMIN')) {
            throw new errors_1.ForbiddenError('Only owners and admins can remove members');
        }
        const member = await membership_repository_1.membershipRepository.getMemberWithIsolation(organizationId, payload.memberId);
        if (!member) {
            throw new errors_1.NotFoundError('Member');
        }
        if (member.isOwner) {
            throw new errors_1.ConflictError('Cannot remove organization owner');
        }
        await membership_repository_1.membershipRepository.removeMember(payload.memberId, context.userId);
        logger_1.default.info('Member removed', {
            organizationId,
            memberId: payload.memberId,
            removedBy: context.userId,
        });
        return member;
    }
    /**
     * Leave organization
     */
    async leaveOrganization(organizationId, context) {
        const membership = await membership_repository_1.membershipRepository.getMemberWithIsolation(organizationId, context.userId);
        if (!membership) {
            throw new errors_1.NotFoundError('Membership');
        }
        if (membership.isOwner) {
            throw new errors_1.ConflictError('Organization owner cannot leave until ownership is transferred');
        }
        await membership_repository_1.membershipRepository.removeMember(membership.id, context.userId);
        logger_1.default.info('User left organization', {
            organizationId,
            userId: context.userId,
        });
        return membership;
    }
    /**
     * Transfer ownership
     */
    async transferOwnership(organizationId, payload, context) {
        const currentOwner = await membership_repository_1.membershipRepository.getMemberWithIsolation(organizationId, context.userId);
        if (!currentOwner || !currentOwner.isOwner) {
            throw new errors_1.ForbiddenError('Only organization owner can transfer ownership');
        }
        const newOwner = await membership_repository_1.membershipRepository.getMemberWithIsolation(organizationId, payload.newOwnerId);
        if (!newOwner) {
            throw new errors_1.NotFoundError('New owner not found in organization');
        }
        if (newOwner.status !== 'ACTIVE') {
            throw new errors_1.ConflictError('Cannot transfer ownership to inactive member');
        }
        await membership_repository_1.membershipRepository.transferOwnership(currentOwner.id, newOwner.id);
        logger_1.default.info('Ownership transferred', {
            organizationId,
            fromUserId: context.userId,
            toUserId: newOwner.userId,
        });
        return newOwner;
    }
}
exports.MembershipService = MembershipService;
exports.membershipService = new MembershipService();
