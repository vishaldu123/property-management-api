import { randomBytes } from 'crypto';
import { membershipService } from '../membership.service';
import { membershipRepository } from '../../repositories/membership.repository';
import { organizationRepository } from '../../repositories/organization.repository';
import { userRepository } from '../../repositories/user.repository';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../utils/errors';

var mockSendInvitationEmail = jest.fn();

jest.mock('../../repositories/membership.repository');
jest.mock('../../repositories/organization.repository');
jest.mock('../../repositories/user.repository');
jest.mock('../../utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));
jest.mock('../email.service', () => ({
  EmailService: jest.fn().mockImplementation(() => ({
    sendInvitationEmail: (...args: unknown[]) => mockSendInvitationEmail(...args),
  })),
}));
jest.mock('crypto', () => ({
  randomBytes: jest.fn(),
}));

describe('MembershipService', () => {
  const context = {
    userId: 'user-1',
    organizationId: 'org-1',
  };

  const actorMembership = {
    id: 'membership-1',
    userId: context.userId,
    role: 'OWNER',
    isOwner: true,
    status: 'ACTIVE',
    user: {
      name: 'Owner User',
      email: 'owner@example.com',
    },
  };

  const memberRecord = {
    id: 'membership-2',
    userId: 'user-2',
    role: 'MEMBER',
    isOwner: false,
    status: 'ACTIVE',
    user: {
      name: 'Member User',
      email: 'member@example.com',
    },
  };

  const pendingInvitation = {
    id: 'invitation-1',
    organizationId: context.organizationId,
    email: 'invitee@example.com',
    status: 'PENDING',
    token: 'token-1',
    expiresAt: new Date('2099-01-01T00:00:00.000Z'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FRONTEND_URL = 'https://app.example.com';
  });

  describe('inviteMember', () => {
    it('invites a member and sends an email', async () => {
      const invitation = { id: pendingInvitation.id, email: pendingInvitation.email };
      const generatedTokenBytes = Buffer.from('generated-token');

      (organizationRepository.findById as jest.Mock).mockResolvedValue({
        id: context.organizationId,
        name: 'Acme Org',
      });
      (membershipRepository.getMemberWithIsolation as jest.Mock).mockResolvedValue(actorMembership);
      (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
      (membershipRepository.hasPendingInvitation as jest.Mock).mockResolvedValue(false);
      (membershipRepository.createInvitation as jest.Mock).mockResolvedValue(invitation);
      (randomBytes as jest.Mock).mockReturnValue(generatedTokenBytes);

      const result = await membershipService.inviteMember(
        context.organizationId,
        { email: pendingInvitation.email, role: 'MEMBER' },
        context
      );

      expect(result).toEqual(invitation);
      expect(membershipRepository.createInvitation).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: context.organizationId,
          email: pendingInvitation.email,
          invitedBy: context.userId,
          token: generatedTokenBytes.toString('hex'),
        })
      );
      expect(mockSendInvitationEmail).toHaveBeenCalledWith({
        email: pendingInvitation.email,
        organizationName: 'Acme Org',
        inviteLink: `https://app.example.com/join?token=${generatedTokenBytes.toString('hex')}`,
        inviterName: actorMembership.user.name,
      });
    });

    it('throws when the organization is missing', async () => {
      (organizationRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        membershipService.inviteMember(context.organizationId, { email: pendingInvitation.email, role: 'MEMBER' }, context)
      ).rejects.toThrow(NotFoundError);
    });

    it('throws when the actor is not an owner or admin', async () => {
      (organizationRepository.findById as jest.Mock).mockResolvedValue({
        id: context.organizationId,
        name: 'Acme Org',
      });
      (membershipRepository.getMemberWithIsolation as jest.Mock).mockResolvedValue({
        ...actorMembership,
        role: 'MEMBER',
      });

      await expect(
        membershipService.inviteMember(context.organizationId, { email: pendingInvitation.email, role: 'MEMBER' }, context)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('acceptInvitation', () => {
    it('accepts a valid invitation', async () => {
      const membership = { ...memberRecord, organizationId: context.organizationId };

      (membershipRepository.getInvitationByToken as jest.Mock).mockResolvedValue(pendingInvitation);
      (userRepository.findById as jest.Mock).mockResolvedValue({
        id: context.userId,
        email: pendingInvitation.email,
      });
      (membershipRepository.isMember as jest.Mock).mockResolvedValue(false);
      (membershipRepository.createMembership as jest.Mock).mockResolvedValue(membership);
      (membershipRepository.acceptInvitation as jest.Mock).mockResolvedValue(undefined);

      const result = await membershipService.acceptInvitation({ token: pendingInvitation.token }, context);

      expect(result).toEqual(membership);
      expect(membershipRepository.createMembership).toHaveBeenCalledWith({
        organizationId: pendingInvitation.organizationId,
        userId: context.userId,
        role: 'MEMBER',
        isOwner: false,
        createdBy: context.userId,
      });
      expect(membershipRepository.acceptInvitation).toHaveBeenCalledWith(pendingInvitation.id, membership.id);
    });

    it('expires an old invitation before rejecting it', async () => {
      (membershipRepository.getInvitationByToken as jest.Mock).mockResolvedValue({
        ...pendingInvitation,
        expiresAt: new Date('2000-01-01T00:00:00.000Z'),
      });
      (membershipRepository.expireInvitation as jest.Mock).mockResolvedValue(undefined);

      await expect(membershipService.acceptInvitation({ token: pendingInvitation.token }, context)).rejects.toThrow(
        UnauthorizedError
      );
      expect(membershipRepository.expireInvitation).toHaveBeenCalledWith(pendingInvitation.id);
    });

    it('throws when the user is already a member', async () => {
      (membershipRepository.getInvitationByToken as jest.Mock).mockResolvedValue(pendingInvitation);
      (userRepository.findById as jest.Mock).mockResolvedValue({
        id: context.userId,
        email: pendingInvitation.email,
      });
      (membershipRepository.isMember as jest.Mock).mockResolvedValue(true);

      await expect(membershipService.acceptInvitation({ token: pendingInvitation.token }, context)).rejects.toThrow(
        ConflictError
      );
    });
  });

  it('rejects a pending invitation', async () => {
    (membershipRepository.getInvitationByToken as jest.Mock).mockResolvedValue(pendingInvitation);
    (userRepository.findById as jest.Mock).mockResolvedValue({
      id: context.userId,
      email: pendingInvitation.email,
    });
    (membershipRepository.rejectInvitation as jest.Mock).mockResolvedValue(undefined);

    const result = await membershipService.rejectInvitation({ token: pendingInvitation.token }, context);

    expect(result).toEqual(pendingInvitation);
    expect(membershipRepository.rejectInvitation).toHaveBeenCalledWith(pendingInvitation.id);
  });

  it('cancels a pending invitation', async () => {
    (membershipRepository.getMemberWithIsolation as jest.Mock).mockResolvedValue(actorMembership);
    (membershipRepository.getInvitationById as jest.Mock).mockResolvedValue(pendingInvitation);
    (membershipRepository.cancelInvitation as jest.Mock).mockResolvedValue(undefined);

    const result = await membershipService.cancelInvitation(
      context.organizationId,
      { invitationId: pendingInvitation.id },
      context
    );

    expect(result).toEqual(pendingInvitation);
    expect(membershipRepository.cancelInvitation).toHaveBeenCalledWith(pendingInvitation.id);
  });

  it('resends a pending invitation', async () => {
    (membershipRepository.getMemberWithIsolation as jest.Mock).mockResolvedValue(actorMembership);
    (membershipRepository.getInvitationById as jest.Mock).mockResolvedValue(pendingInvitation);
    (organizationRepository.findById as jest.Mock).mockResolvedValue({
      id: context.organizationId,
      name: 'Acme Org',
    });
    (membershipRepository.resendInvitation as jest.Mock).mockResolvedValue(undefined);

    const result = await membershipService.resendInvitation(
      context.organizationId,
      { invitationId: pendingInvitation.id },
      context
    );

    expect(result).toEqual(pendingInvitation);
    expect(membershipRepository.resendInvitation).toHaveBeenCalledWith(pendingInvitation.id);
    expect(mockSendInvitationEmail).toHaveBeenCalledWith({
      email: pendingInvitation.email,
      organizationName: 'Acme Org',
      inviteLink: `https://app.example.com/join?token=${pendingInvitation.token}`,
      inviterName: actorMembership.user.name,
    });
  });

  it('lists members for an existing organization member', async () => {
    const listResult = {
      data: [memberRecord],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        pages: 1,
      },
    };

    (membershipRepository.getMemberWithIsolation as jest.Mock).mockResolvedValue(actorMembership);
    (membershipRepository.listMembers as jest.Mock).mockResolvedValue(listResult);

    const result = await membershipService.listMembers(
      context.organizationId,
      { page: 1, limit: 10, sort: 'joinedAt', order: 'desc' },
      context
    );

    expect(result).toEqual(listResult);
  });

  it('gets member details for a visible member', async () => {
    (membershipRepository.getMemberWithIsolation as jest.Mock)
      .mockResolvedValueOnce(actorMembership)
      .mockResolvedValueOnce(memberRecord);

    const result = await membershipService.getMemberDetails(context.organizationId, memberRecord.id, context);

    expect(result).toEqual(memberRecord);
  });

  it('suspends a non-owner member', async () => {
    (membershipRepository.getMemberWithIsolation as jest.Mock)
      .mockResolvedValueOnce(actorMembership)
      .mockResolvedValueOnce(memberRecord);
    (membershipRepository.suspendMember as jest.Mock).mockResolvedValue(undefined);

    const result = await membershipService.suspendMember(
      context.organizationId,
      { memberId: memberRecord.id, reason: 'Policy violation' },
      context
    );

    expect(result).toEqual(memberRecord);
    expect(membershipRepository.suspendMember).toHaveBeenCalledWith(memberRecord.id, 'Policy violation');
  });

  it('reactivates a suspended member', async () => {
    (membershipRepository.getMemberWithIsolation as jest.Mock)
      .mockResolvedValueOnce(actorMembership)
      .mockResolvedValueOnce({
        ...memberRecord,
        status: 'SUSPENDED',
      });
    (membershipRepository.reactivateMember as jest.Mock).mockResolvedValue(undefined);

    const result = await membershipService.reactivateMember(
      context.organizationId,
      { memberId: memberRecord.id },
      context
    );

    expect(result).toMatchObject({ id: memberRecord.id, status: 'SUSPENDED' });
    expect(membershipRepository.reactivateMember).toHaveBeenCalledWith(memberRecord.id);
  });

  it('removes a non-owner member', async () => {
    (membershipRepository.getMemberWithIsolation as jest.Mock)
      .mockResolvedValueOnce(actorMembership)
      .mockResolvedValueOnce(memberRecord);
    (membershipRepository.removeMember as jest.Mock).mockResolvedValue(undefined);

    const result = await membershipService.removeMember(
      context.organizationId,
      { memberId: memberRecord.id },
      context
    );

    expect(result).toEqual(memberRecord);
    expect(membershipRepository.removeMember).toHaveBeenCalledWith(memberRecord.id, context.userId);
  });

  it('prevents an owner from leaving the organization', async () => {
    (membershipRepository.getMemberWithIsolation as jest.Mock).mockResolvedValue(actorMembership);

    await expect(membershipService.leaveOrganization(context.organizationId, context)).rejects.toThrow(ConflictError);
  });

  it('transfers ownership to an active member', async () => {
    (membershipRepository.getMemberWithIsolation as jest.Mock)
      .mockResolvedValueOnce(actorMembership)
      .mockResolvedValueOnce(memberRecord);
    (membershipRepository.transferOwnership as jest.Mock).mockResolvedValue(undefined);

    const result = await membershipService.transferOwnership(
      context.organizationId,
      { newOwnerId: memberRecord.id },
      context
    );

    expect(result).toEqual(memberRecord);
    expect(membershipRepository.transferOwnership).toHaveBeenCalledWith(actorMembership.id, memberRecord.id);
  });
});
