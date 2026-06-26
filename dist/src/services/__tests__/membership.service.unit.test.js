"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const membership_service_1 = require("../membership.service");
const membership_repository_1 = require("../../repositories/membership.repository");
const organization_repository_1 = require("../../repositories/organization.repository");
const user_repository_1 = require("../../repositories/user.repository");
const errors_1 = require("../../utils/errors");
const mockSendInvitationEmail = jest.fn();
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
        sendInvitationEmail: (...args) => mockSendInvitationEmail(...args),
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
            organization_repository_1.organizationRepository.findById.mockResolvedValue({
                id: context.organizationId,
                name: 'Acme Org',
            });
            membership_repository_1.membershipRepository.getMemberWithIsolation.mockResolvedValue(actorMembership);
            user_repository_1.userRepository.findByEmail.mockResolvedValue(null);
            membership_repository_1.membershipRepository.hasPendingInvitation.mockResolvedValue(false);
            membership_repository_1.membershipRepository.createInvitation.mockResolvedValue(invitation);
            crypto_1.randomBytes.mockReturnValue(generatedTokenBytes);
            const result = await membership_service_1.membershipService.inviteMember(context.organizationId, { email: pendingInvitation.email, role: 'MEMBER' }, context);
            expect(result).toEqual(invitation);
            expect(membership_repository_1.membershipRepository.createInvitation).toHaveBeenCalledWith(expect.objectContaining({
                organizationId: context.organizationId,
                email: pendingInvitation.email,
                invitedBy: context.userId,
                token: generatedTokenBytes.toString('hex'),
            }));
            expect(mockSendInvitationEmail).toHaveBeenCalledWith({
                email: pendingInvitation.email,
                organizationName: 'Acme Org',
                inviteLink: `https://app.example.com/join?token=${generatedTokenBytes.toString('hex')}`,
                inviterName: actorMembership.user.name,
            });
        });
        it('throws when the organization is missing', async () => {
            organization_repository_1.organizationRepository.findById.mockResolvedValue(null);
            await expect(membership_service_1.membershipService.inviteMember(context.organizationId, { email: pendingInvitation.email, role: 'MEMBER' }, context)).rejects.toThrow(errors_1.NotFoundError);
        });
        it('throws when the actor is not an owner or admin', async () => {
            organization_repository_1.organizationRepository.findById.mockResolvedValue({
                id: context.organizationId,
                name: 'Acme Org',
            });
            membership_repository_1.membershipRepository.getMemberWithIsolation.mockResolvedValue({
                ...actorMembership,
                role: 'MEMBER',
            });
            await expect(membership_service_1.membershipService.inviteMember(context.organizationId, { email: pendingInvitation.email, role: 'MEMBER' }, context)).rejects.toThrow(errors_1.ForbiddenError);
        });
    });
    describe('acceptInvitation', () => {
        it('accepts a valid invitation', async () => {
            const membership = { ...memberRecord, organizationId: context.organizationId };
            membership_repository_1.membershipRepository.getInvitationByToken.mockResolvedValue(pendingInvitation);
            user_repository_1.userRepository.findById.mockResolvedValue({
                id: context.userId,
                email: pendingInvitation.email,
            });
            membership_repository_1.membershipRepository.isMember.mockResolvedValue(false);
            membership_repository_1.membershipRepository.createMembership.mockResolvedValue(membership);
            membership_repository_1.membershipRepository.acceptInvitation.mockResolvedValue(undefined);
            const result = await membership_service_1.membershipService.acceptInvitation({ token: pendingInvitation.token }, context);
            expect(result).toEqual(membership);
            expect(membership_repository_1.membershipRepository.createMembership).toHaveBeenCalledWith({
                organizationId: pendingInvitation.organizationId,
                userId: context.userId,
                role: 'MEMBER',
                isOwner: false,
                createdBy: context.userId,
            });
            expect(membership_repository_1.membershipRepository.acceptInvitation).toHaveBeenCalledWith(pendingInvitation.id, membership.id);
        });
        it('expires an old invitation before rejecting it', async () => {
            membership_repository_1.membershipRepository.getInvitationByToken.mockResolvedValue({
                ...pendingInvitation,
                expiresAt: new Date('2000-01-01T00:00:00.000Z'),
            });
            membership_repository_1.membershipRepository.expireInvitation.mockResolvedValue(undefined);
            await expect(membership_service_1.membershipService.acceptInvitation({ token: pendingInvitation.token }, context)).rejects.toThrow(errors_1.UnauthorizedError);
            expect(membership_repository_1.membershipRepository.expireInvitation).toHaveBeenCalledWith(pendingInvitation.id);
        });
        it('throws when the user is already a member', async () => {
            membership_repository_1.membershipRepository.getInvitationByToken.mockResolvedValue(pendingInvitation);
            user_repository_1.userRepository.findById.mockResolvedValue({
                id: context.userId,
                email: pendingInvitation.email,
            });
            membership_repository_1.membershipRepository.isMember.mockResolvedValue(true);
            await expect(membership_service_1.membershipService.acceptInvitation({ token: pendingInvitation.token }, context)).rejects.toThrow(errors_1.ConflictError);
        });
    });
    it('rejects a pending invitation', async () => {
        membership_repository_1.membershipRepository.getInvitationByToken.mockResolvedValue(pendingInvitation);
        user_repository_1.userRepository.findById.mockResolvedValue({
            id: context.userId,
            email: pendingInvitation.email,
        });
        membership_repository_1.membershipRepository.rejectInvitation.mockResolvedValue(undefined);
        const result = await membership_service_1.membershipService.rejectInvitation({ token: pendingInvitation.token }, context);
        expect(result).toEqual(pendingInvitation);
        expect(membership_repository_1.membershipRepository.rejectInvitation).toHaveBeenCalledWith(pendingInvitation.id);
    });
    it('cancels a pending invitation', async () => {
        membership_repository_1.membershipRepository.getMemberWithIsolation.mockResolvedValue(actorMembership);
        membership_repository_1.membershipRepository.getInvitationById.mockResolvedValue(pendingInvitation);
        membership_repository_1.membershipRepository.cancelInvitation.mockResolvedValue(undefined);
        const result = await membership_service_1.membershipService.cancelInvitation(context.organizationId, { invitationId: pendingInvitation.id }, context);
        expect(result).toEqual(pendingInvitation);
        expect(membership_repository_1.membershipRepository.cancelInvitation).toHaveBeenCalledWith(pendingInvitation.id);
    });
    it('resends a pending invitation', async () => {
        membership_repository_1.membershipRepository.getMemberWithIsolation.mockResolvedValue(actorMembership);
        membership_repository_1.membershipRepository.getInvitationById.mockResolvedValue(pendingInvitation);
        organization_repository_1.organizationRepository.findById.mockResolvedValue({
            id: context.organizationId,
            name: 'Acme Org',
        });
        membership_repository_1.membershipRepository.resendInvitation.mockResolvedValue(undefined);
        const result = await membership_service_1.membershipService.resendInvitation(context.organizationId, { invitationId: pendingInvitation.id }, context);
        expect(result).toEqual(pendingInvitation);
        expect(membership_repository_1.membershipRepository.resendInvitation).toHaveBeenCalledWith(pendingInvitation.id);
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
        membership_repository_1.membershipRepository.getMemberWithIsolation.mockResolvedValue(actorMembership);
        membership_repository_1.membershipRepository.listMembers.mockResolvedValue(listResult);
        const result = await membership_service_1.membershipService.listMembers(context.organizationId, { page: 1, limit: 10, sort: 'joinedAt', order: 'desc' }, context);
        expect(result).toEqual(listResult);
    });
    it('gets member details for a visible member', async () => {
        membership_repository_1.membershipRepository.getMemberWithIsolation
            .mockResolvedValueOnce(actorMembership)
            .mockResolvedValueOnce(memberRecord);
        const result = await membership_service_1.membershipService.getMemberDetails(context.organizationId, memberRecord.id, context);
        expect(result).toEqual(memberRecord);
    });
    it('suspends a non-owner member', async () => {
        membership_repository_1.membershipRepository.getMemberWithIsolation
            .mockResolvedValueOnce(actorMembership)
            .mockResolvedValueOnce(memberRecord);
        membership_repository_1.membershipRepository.suspendMember.mockResolvedValue(undefined);
        const result = await membership_service_1.membershipService.suspendMember(context.organizationId, { memberId: memberRecord.id, reason: 'Policy violation' }, context);
        expect(result).toEqual(memberRecord);
        expect(membership_repository_1.membershipRepository.suspendMember).toHaveBeenCalledWith(memberRecord.id, 'Policy violation');
    });
    it('reactivates a suspended member', async () => {
        membership_repository_1.membershipRepository.getMemberWithIsolation
            .mockResolvedValueOnce(actorMembership)
            .mockResolvedValueOnce({
            ...memberRecord,
            status: 'SUSPENDED',
        });
        membership_repository_1.membershipRepository.reactivateMember.mockResolvedValue(undefined);
        const result = await membership_service_1.membershipService.reactivateMember(context.organizationId, { memberId: memberRecord.id }, context);
        expect(result).toMatchObject({ id: memberRecord.id, status: 'SUSPENDED' });
        expect(membership_repository_1.membershipRepository.reactivateMember).toHaveBeenCalledWith(memberRecord.id);
    });
    it('removes a non-owner member', async () => {
        membership_repository_1.membershipRepository.getMemberWithIsolation
            .mockResolvedValueOnce(actorMembership)
            .mockResolvedValueOnce(memberRecord);
        membership_repository_1.membershipRepository.removeMember.mockResolvedValue(undefined);
        const result = await membership_service_1.membershipService.removeMember(context.organizationId, { memberId: memberRecord.id }, context);
        expect(result).toEqual(memberRecord);
        expect(membership_repository_1.membershipRepository.removeMember).toHaveBeenCalledWith(memberRecord.id, context.userId);
    });
    it('prevents an owner from leaving the organization', async () => {
        membership_repository_1.membershipRepository.getMemberWithIsolation.mockResolvedValue(actorMembership);
        await expect(membership_service_1.membershipService.leaveOrganization(context.organizationId, context)).rejects.toThrow(errors_1.ConflictError);
    });
    it('transfers ownership to an active member', async () => {
        membership_repository_1.membershipRepository.getMemberWithIsolation
            .mockResolvedValueOnce(actorMembership)
            .mockResolvedValueOnce(memberRecord);
        membership_repository_1.membershipRepository.transferOwnership.mockResolvedValue(undefined);
        const result = await membership_service_1.membershipService.transferOwnership(context.organizationId, { newOwnerId: memberRecord.id }, context);
        expect(result).toEqual(memberRecord);
        expect(membership_repository_1.membershipRepository.transferOwnership).toHaveBeenCalledWith(actorMembership.id, memberRecord.id);
    });
});
