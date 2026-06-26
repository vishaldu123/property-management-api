import { membershipRepository } from '../repositories/membership.repository';
import { organizationRepository } from '../repositories/organization.repository';
import { userRepository } from '../repositories/user.repository';
import { 
  InviteMemberInput,
  AcceptInvitationInput,
  RejectInvitationInput,
  CancelInvitationInput,
  ResendInvitationInput,
  RemoveMemberInput,
  SuspendMemberInput,
  ReactivateMemberInput,
  TransferOwnershipInput,
  ListMembersQuery,
} from '../validators/membership.validators';
import { NotFoundError, ConflictError, UnauthorizedError, ForbiddenError } from '../utils/errors';
import logger from '../utils/logger';
import { EmailService } from './email.service';
import { randomBytes } from 'crypto';

interface MembershipActorContext {
  userId: string;
  organizationId: string;
}

export class MembershipService {
  private emailService = new EmailService();
  private tokenExpiry = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Invite member to organization
   */
  async inviteMember(
    organizationId: string,
    payload: InviteMemberInput,
    context: MembershipActorContext
  ) {
    // Verify organization exists
    const organization = await organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundError('Organization');
    }

    // Verify actor is organization owner or admin
    const actorMembership = await membershipRepository.getMemberWithIsolation(organizationId, context.userId);
    if (!actorMembership || (actorMembership.role !== 'OWNER' && actorMembership.role !== 'ADMIN')) {
      throw new ForbiddenError('Only owners and admins can invite members');
    }

    // Check if email is already a member
    const user = await userRepository.findByEmail(payload.email);
    if (user && await membershipRepository.isMember(organizationId, user.id)) {
      throw new ConflictError('User is already a member of this organization');
    }

    // Check for pending invitation
    if (await membershipRepository.hasPendingInvitation(organizationId, payload.email)) {
      throw new ConflictError('Pending invitation already exists for this email');
    }

    // Generate secure token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.tokenExpiry);

    // Create invitation
    const invitation = await membershipRepository.createInvitation({
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

    logger.info('Member invited', {
      organizationId,
      invitedEmail: payload.email,
      invitedBy: context.userId,
    });

    return invitation;
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(
    payload: AcceptInvitationInput,
    context: MembershipActorContext
  ) {
    // Get invitation by token
    const invitation = await membershipRepository.getInvitationByToken(payload.token);
    if (!invitation) {
      throw new UnauthorizedError('Invalid or expired invitation token');
    }

    // Check invitation status
    if (invitation.status !== 'PENDING') {
      throw new ConflictError(`Invitation is ${invitation.status.toLowerCase()}`);
    }

    // Check if invitation expired
    if (new Date() > invitation.expiresAt) {
      await membershipRepository.expireInvitation(invitation.id);
      throw new UnauthorizedError('Invitation has expired');
    }

    // Verify user email matches
    const user = await userRepository.findById(context.userId);
    if (!user || user.email !== invitation.email) {
      throw new UnauthorizedError('Invitation email does not match your account');
    }

    // Check if user is already a member
    if (await membershipRepository.isMember(invitation.organizationId, context.userId)) {
      throw new ConflictError('You are already a member of this organization');
    }

    // Create membership
    const membership = await membershipRepository.createMembership({
      organizationId: invitation.organizationId,
      userId: context.userId,
      role: 'MEMBER',
      isOwner: false,
      createdBy: context.userId,
    });

    // Accept invitation
    await membershipRepository.acceptInvitation(invitation.id, membership.id);

    logger.info('Invitation accepted', {
      organizationId: invitation.organizationId,
      userId: context.userId,
      invitationId: invitation.id,
    });

    return membership;
  }

  /**
   * Reject invitation
   */
  async rejectInvitation(
    payload: RejectInvitationInput,
    context: MembershipActorContext
  ) {
    const invitation = await membershipRepository.getInvitationByToken(payload.token);
    if (!invitation) {
      throw new UnauthorizedError('Invalid or expired invitation token');
    }

    if (invitation.status !== 'PENDING') {
      throw new ConflictError(`Invitation is ${invitation.status.toLowerCase()}`);
    }

    const user = await userRepository.findById(context.userId);
    if (!user || user.email !== invitation.email) {
      throw new UnauthorizedError('Invitation email does not match your account');
    }

    await membershipRepository.rejectInvitation(invitation.id);

    logger.info('Invitation rejected', {
      organizationId: invitation.organizationId,
      userId: context.userId,
      invitationId: invitation.id,
    });

    return invitation;
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(
    organizationId: string,
    payload: CancelInvitationInput,
    context: MembershipActorContext
  ) {
    // Verify actor is owner or admin
    const actorMembership = await membershipRepository.getMemberWithIsolation(organizationId, context.userId);
    if (!actorMembership || (actorMembership.role !== 'OWNER' && actorMembership.role !== 'ADMIN')) {
      throw new ForbiddenError('Only owners and admins can cancel invitations');
    }

    const invitation = await membershipRepository.getInvitationById(payload.invitationId);
    if (!invitation || invitation.organizationId !== organizationId) {
      throw new NotFoundError('Invitation');
    }

    if (invitation.status !== 'PENDING') {
      throw new ConflictError(`Cannot cancel ${invitation.status.toLowerCase()} invitation`);
    }

    await membershipRepository.cancelInvitation(invitation.id);

    logger.info('Invitation cancelled', {
      organizationId,
      invitationId: payload.invitationId,
      cancelledBy: context.userId,
    });

    return invitation;
  }

  /**
   * Resend invitation
   */
  async resendInvitation(
    organizationId: string,
    payload: ResendInvitationInput,
    context: MembershipActorContext
  ) {
    const actorMembership = await membershipRepository.getMemberWithIsolation(organizationId, context.userId);
    if (!actorMembership || (actorMembership.role !== 'OWNER' && actorMembership.role !== 'ADMIN')) {
      throw new ForbiddenError('Only owners and admins can resend invitations');
    }

    const invitation = await membershipRepository.getInvitationById(payload.invitationId);
    if (!invitation || invitation.organizationId !== organizationId) {
      throw new NotFoundError('Invitation');
    }

    if (invitation.status !== 'PENDING') {
      throw new ConflictError(`Cannot resend ${invitation.status.toLowerCase()} invitation`);
    }

    // Check if invitation expired
    if (new Date() > invitation.expiresAt) {
      throw new ConflictError('Invitation has expired');
    }

    const organization = await organizationRepository.findById(organizationId);
    await membershipRepository.resendInvitation(invitation.id);

    // Resend email
    await this.emailService.sendInvitationEmail({
      email: invitation.email,
      organizationName: organization!.name,
      inviteLink: `${process.env.FRONTEND_URL}/join?token=${invitation.token}`,
      inviterName: actorMembership.user.name,
    });

    logger.info('Invitation resent', {
      organizationId,
      invitationId: payload.invitationId,
      resentBy: context.userId,
    });

    return invitation;
  }

  /**
   * List organization members
   */
  async listMembers(organizationId: string, query: ListMembersQuery, context: MembershipActorContext) {
    // Verify actor is member of organization
    const actorMembership = await membershipRepository.getMemberWithIsolation(organizationId, context.userId);
    if (!actorMembership) {
      throw new ForbiddenError('You are not a member of this organization');
    }

    const result = await membershipRepository.listMembers(organizationId, query);

    logger.info('Organization members listed', {
      organizationId,
      count: result.data.length,
      total: result.pagination.total,
    });

    return result;
  }

  /**
   * Get member details
   */
  async getMemberDetails(organizationId: string, memberId: string, context: MembershipActorContext) {
    const actorMembership = await membershipRepository.getMemberWithIsolation(organizationId, context.userId);
    if (!actorMembership) {
      throw new ForbiddenError('You are not a member of this organization');
    }

    const member = await membershipRepository.getMemberWithIsolation(organizationId, memberId);
    if (!member) {
      throw new NotFoundError('Member');
    }

    return member;
  }

  /**
   * Suspend member
   */
  async suspendMember(
    organizationId: string,
    payload: SuspendMemberInput,
    context: MembershipActorContext
  ) {
    const actorMembership = await membershipRepository.getMemberWithIsolation(organizationId, context.userId);
    if (!actorMembership || actorMembership.role !== 'OWNER') {
      throw new ForbiddenError('Only owners can suspend members');
    }

    const member = await membershipRepository.getMemberWithIsolation(organizationId, payload.memberId);
    if (!member) {
      throw new NotFoundError('Member');
    }

    if (member.isOwner) {
      throw new ConflictError('Cannot suspend organization owner');
    }

    if (member.status === 'SUSPENDED') {
      throw new ConflictError('Member is already suspended');
    }

    await membershipRepository.suspendMember(payload.memberId, payload.reason);

    logger.info('Member suspended', {
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
  async reactivateMember(
    organizationId: string,
    payload: ReactivateMemberInput,
    context: MembershipActorContext
  ) {
    const actorMembership = await membershipRepository.getMemberWithIsolation(organizationId, context.userId);
    if (!actorMembership || actorMembership.role !== 'OWNER') {
      throw new ForbiddenError('Only owners can reactivate members');
    }

    const member = await membershipRepository.getMemberWithIsolation(organizationId, payload.memberId);
    if (!member) {
      throw new NotFoundError('Member');
    }

    if (member.status !== 'SUSPENDED') {
      throw new ConflictError('Member is not suspended');
    }

    await membershipRepository.reactivateMember(payload.memberId);

    logger.info('Member reactivated', {
      organizationId,
      memberId: payload.memberId,
      reactivatedBy: context.userId,
    });

    return member;
  }

  /**
   * Remove member
   */
  async removeMember(
    organizationId: string,
    payload: RemoveMemberInput,
    context: MembershipActorContext
  ) {
    const actorMembership = await membershipRepository.getMemberWithIsolation(organizationId, context.userId);
    if (!actorMembership || (actorMembership.role !== 'OWNER' && actorMembership.role !== 'ADMIN')) {
      throw new ForbiddenError('Only owners and admins can remove members');
    }

    const member = await membershipRepository.getMemberWithIsolation(organizationId, payload.memberId);
    if (!member) {
      throw new NotFoundError('Member');
    }

    if (member.isOwner) {
      throw new ConflictError('Cannot remove organization owner');
    }

    await membershipRepository.removeMember(payload.memberId, context.userId);

    logger.info('Member removed', {
      organizationId,
      memberId: payload.memberId,
      removedBy: context.userId,
    });

    return member;
  }

  /**
   * Leave organization
   */
  async leaveOrganization(organizationId: string, context: MembershipActorContext) {
    const membership = await membershipRepository.getMemberWithIsolation(organizationId, context.userId);
    if (!membership) {
      throw new NotFoundError('Membership');
    }

    if (membership.isOwner) {
      throw new ConflictError('Organization owner cannot leave until ownership is transferred');
    }

    await membershipRepository.removeMember(membership.id, context.userId);

    logger.info('User left organization', {
      organizationId,
      userId: context.userId,
    });

    return membership;
  }

  /**
   * Transfer ownership
   */
  async transferOwnership(
    organizationId: string,
    payload: TransferOwnershipInput,
    context: MembershipActorContext
  ) {
    const currentOwner = await membershipRepository.getMemberWithIsolation(organizationId, context.userId);
    if (!currentOwner || !currentOwner.isOwner) {
      throw new ForbiddenError('Only organization owner can transfer ownership');
    }

    const newOwner = await membershipRepository.getMemberWithIsolation(organizationId, payload.newOwnerId);
    if (!newOwner) {
      throw new NotFoundError('New owner not found in organization');
    }

    if (newOwner.status !== 'ACTIVE') {
      throw new ConflictError('Cannot transfer ownership to inactive member');
    }

    await membershipRepository.transferOwnership(currentOwner.id, newOwner.id);

    logger.info('Ownership transferred', {
      organizationId,
      fromUserId: context.userId,
      toUserId: newOwner.userId,
    });

    return newOwner;
  }
}

export const membershipService = new MembershipService();
