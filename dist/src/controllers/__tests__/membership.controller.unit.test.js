"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const membership_controller_1 = require("../membership.controller");
const membership_service_1 = require("../../services/membership.service");
const response_1 = require("../../shared/core/response");
jest.mock('../../services/membership.service', () => ({
    membershipService: {
        inviteMember: jest.fn(),
        acceptInvitation: jest.fn(),
        rejectInvitation: jest.fn(),
        cancelInvitation: jest.fn(),
        resendInvitation: jest.fn(),
        listMembers: jest.fn(),
        getMemberDetails: jest.fn(),
        suspendMember: jest.fn(),
        reactivateMember: jest.fn(),
        removeMember: jest.fn(),
        leaveOrganization: jest.fn(),
        transferOwnership: jest.fn(),
    },
}));
jest.mock('../../shared/core/response', () => ({
    ApiResponse: {
        created: jest.fn(),
        success: jest.fn(),
        paginated: jest.fn(),
    },
}));
describe('MembershipController', () => {
    const baseRequest = {
        params: {
            organizationId: '550e8400-e29b-41d4-a716-446655440000',
            memberId: '550e8400-e29b-41d4-a716-446655440001',
        },
        body: {},
        query: {},
        user: {
            userId: 'user-1',
        },
    };
    let res;
    let next;
    beforeEach(() => {
        jest.clearAllMocks();
        res = {
            status: jest.fn(function () {
                return this;
            }),
            json: jest.fn(),
        };
        next = jest.fn();
    });
    it('invites a member', async () => {
        const result = { id: 'invitation-1' };
        membership_service_1.membershipService.inviteMember.mockResolvedValue(result);
        await membership_controller_1.membershipController.inviteMember({
            ...baseRequest,
            body: { email: 'invitee@example.com', role: 'MEMBER' },
        }, res, next);
        expect(membership_service_1.membershipService.inviteMember).toHaveBeenCalledWith(baseRequest.params.organizationId, { email: 'invitee@example.com', role: 'MEMBER' }, { userId: baseRequest.user.userId, organizationId: baseRequest.params.organizationId });
        expect(response_1.ApiResponse.created).toHaveBeenCalledWith(res, result, 'Member invited successfully');
    });
    it('forwards invite errors to next()', async () => {
        const error = new Error('boom');
        membership_service_1.membershipService.inviteMember.mockRejectedValue(error);
        await membership_controller_1.membershipController.inviteMember({
            ...baseRequest,
            body: { email: 'invitee@example.com', role: 'MEMBER' },
        }, res, next);
        expect(next).toHaveBeenCalledWith(error);
    });
    it('accepts an invitation', async () => {
        const result = { id: 'membership-1' };
        membership_service_1.membershipService.acceptInvitation.mockResolvedValue(result);
        await membership_controller_1.membershipController.acceptInvitation({
            ...baseRequest,
            body: { token: 'token-1' },
        }, res, next);
        expect(response_1.ApiResponse.success).toHaveBeenCalledWith(res, result, 'Invitation accepted successfully');
    });
    it('rejects an invitation', async () => {
        const result = { id: 'invitation-1' };
        membership_service_1.membershipService.rejectInvitation.mockResolvedValue(result);
        await membership_controller_1.membershipController.rejectInvitation({
            ...baseRequest,
            body: { token: 'token-1' },
        }, res, next);
        expect(response_1.ApiResponse.success).toHaveBeenCalledWith(res, result, 'Invitation rejected successfully');
    });
    it('cancels an invitation', async () => {
        const result = { id: 'invitation-1' };
        membership_service_1.membershipService.cancelInvitation.mockResolvedValue(result);
        await membership_controller_1.membershipController.cancelInvitation({
            ...baseRequest,
            body: { invitationId: '550e8400-e29b-41d4-a716-446655440002' },
        }, res, next);
        expect(response_1.ApiResponse.success).toHaveBeenCalledWith(res, result, 'Invitation cancelled successfully');
    });
    it('resends an invitation', async () => {
        const result = { id: 'invitation-1' };
        membership_service_1.membershipService.resendInvitation.mockResolvedValue(result);
        await membership_controller_1.membershipController.resendInvitation({
            ...baseRequest,
            body: { invitationId: '550e8400-e29b-41d4-a716-446655440002' },
        }, res, next);
        expect(response_1.ApiResponse.success).toHaveBeenCalledWith(res, result, 'Invitation resent successfully');
    });
    it('lists members', async () => {
        const result = {
            data: [{ id: 'membership-1' }],
            pagination: { page: 1, limit: 10, total: 1, pages: 1 },
        };
        membership_service_1.membershipService.listMembers.mockResolvedValue(result);
        await membership_controller_1.membershipController.listMembers({
            ...baseRequest,
            query: { page: '1', limit: '10', sort: 'joinedAt', order: 'desc' },
        }, res, next);
        expect(response_1.ApiResponse.paginated).toHaveBeenCalledWith(res, result.data, result.pagination, 'Members retrieved successfully');
    });
    it('gets member details', async () => {
        const result = { id: 'membership-1' };
        membership_service_1.membershipService.getMemberDetails.mockResolvedValue(result);
        await membership_controller_1.membershipController.getMemberDetails(baseRequest, res, next);
        expect(response_1.ApiResponse.success).toHaveBeenCalledWith(res, result, 'Member details retrieved successfully');
    });
    it('suspends a member', async () => {
        const result = { id: 'membership-1' };
        membership_service_1.membershipService.suspendMember.mockResolvedValue(result);
        await membership_controller_1.membershipController.suspendMember({
            ...baseRequest,
            body: {
                memberId: baseRequest.params.memberId,
                reason: 'Policy violation',
            },
        }, res, next);
        expect(response_1.ApiResponse.success).toHaveBeenCalledWith(res, result, 'Member suspended successfully');
    });
    it('reactivates a member', async () => {
        const result = { id: 'membership-1' };
        membership_service_1.membershipService.reactivateMember.mockResolvedValue(result);
        await membership_controller_1.membershipController.reactivateMember({
            ...baseRequest,
            body: { memberId: baseRequest.params.memberId },
        }, res, next);
        expect(response_1.ApiResponse.success).toHaveBeenCalledWith(res, result, 'Member reactivated successfully');
    });
    it('removes a member', async () => {
        const result = { id: 'membership-1' };
        membership_service_1.membershipService.removeMember.mockResolvedValue(result);
        await membership_controller_1.membershipController.removeMember({
            ...baseRequest,
            body: { memberId: baseRequest.params.memberId },
        }, res, next);
        expect(response_1.ApiResponse.success).toHaveBeenCalledWith(res, result, 'Member removed successfully');
    });
    it('allows a user to leave an organization', async () => {
        const result = { id: 'membership-1' };
        membership_service_1.membershipService.leaveOrganization.mockResolvedValue(result);
        await membership_controller_1.membershipController.leaveOrganization(baseRequest, res, next);
        expect(response_1.ApiResponse.success).toHaveBeenCalledWith(res, result, 'You have left the organization');
    });
    it('transfers ownership', async () => {
        const result = { id: 'membership-2' };
        membership_service_1.membershipService.transferOwnership.mockResolvedValue(result);
        await membership_controller_1.membershipController.transferOwnership({
            ...baseRequest,
            body: { newOwnerId: baseRequest.params.memberId },
        }, res, next);
        expect(response_1.ApiResponse.success).toHaveBeenCalledWith(res, result, 'Ownership transferred successfully');
    });
});
