import { Response } from 'express';
import { membershipController } from '../membership.controller';
import { membershipService } from '../../services/membership.service';
import { ApiResponse } from '../../shared/core/response';

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

  let res: Response;
  let next: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    res = {
      status: jest.fn(function () {
        return this;
      }),
      json: jest.fn(),
    } as unknown as Response;
    next = jest.fn();
  });

  it('invites a member', async () => {
    const result = { id: 'invitation-1' };
    (membershipService.inviteMember as jest.Mock).mockResolvedValue(result);

    await membershipController.inviteMember(
      {
        ...baseRequest,
        body: { email: 'invitee@example.com', role: 'MEMBER' },
      } as any,
      res,
      next
    );

    expect(membershipService.inviteMember).toHaveBeenCalledWith(
      baseRequest.params.organizationId,
      { email: 'invitee@example.com', role: 'MEMBER' },
      { userId: baseRequest.user.userId, organizationId: baseRequest.params.organizationId }
    );
    expect(ApiResponse.created).toHaveBeenCalledWith(res, result, 'Member invited successfully');
  });

  it('forwards invite errors to next()', async () => {
    const error = new Error('boom');
    (membershipService.inviteMember as jest.Mock).mockRejectedValue(error);

    await membershipController.inviteMember(
      {
        ...baseRequest,
        body: { email: 'invitee@example.com', role: 'MEMBER' },
      } as any,
      res,
      next
    );

    expect(next).toHaveBeenCalledWith(error);
  });

  it('accepts an invitation', async () => {
    const result = { id: 'membership-1' };
    (membershipService.acceptInvitation as jest.Mock).mockResolvedValue(result);

    await membershipController.acceptInvitation(
      {
        ...baseRequest,
        body: { token: 'token-1' },
      } as any,
      res,
      next
    );

    expect(ApiResponse.success).toHaveBeenCalledWith(res, result, 'Invitation accepted successfully');
  });

  it('rejects an invitation', async () => {
    const result = { id: 'invitation-1' };
    (membershipService.rejectInvitation as jest.Mock).mockResolvedValue(result);

    await membershipController.rejectInvitation(
      {
        ...baseRequest,
        body: { token: 'token-1' },
      } as any,
      res,
      next
    );

    expect(ApiResponse.success).toHaveBeenCalledWith(res, result, 'Invitation rejected successfully');
  });

  it('cancels an invitation', async () => {
    const result = { id: 'invitation-1' };
    (membershipService.cancelInvitation as jest.Mock).mockResolvedValue(result);

    await membershipController.cancelInvitation(
      {
        ...baseRequest,
        body: { invitationId: '550e8400-e29b-41d4-a716-446655440002' },
      } as any,
      res,
      next
    );

    expect(ApiResponse.success).toHaveBeenCalledWith(res, result, 'Invitation cancelled successfully');
  });

  it('resends an invitation', async () => {
    const result = { id: 'invitation-1' };
    (membershipService.resendInvitation as jest.Mock).mockResolvedValue(result);

    await membershipController.resendInvitation(
      {
        ...baseRequest,
        body: { invitationId: '550e8400-e29b-41d4-a716-446655440002' },
      } as any,
      res,
      next
    );

    expect(ApiResponse.success).toHaveBeenCalledWith(res, result, 'Invitation resent successfully');
  });

  it('lists members', async () => {
    const result = {
      data: [{ id: 'membership-1' }],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    };
    (membershipService.listMembers as jest.Mock).mockResolvedValue(result);

    await membershipController.listMembers(
      {
        ...baseRequest,
        query: { page: '1', limit: '10', sort: 'joinedAt', order: 'desc' },
      } as any,
      res,
      next
    );

    expect(ApiResponse.paginated).toHaveBeenCalledWith(
      res,
      result.data,
      result.pagination,
      'Members retrieved successfully'
    );
  });

  it('gets member details', async () => {
    const result = { id: 'membership-1' };
    (membershipService.getMemberDetails as jest.Mock).mockResolvedValue(result);

    await membershipController.getMemberDetails(baseRequest as any, res, next);

    expect(ApiResponse.success).toHaveBeenCalledWith(res, result, 'Member details retrieved successfully');
  });

  it('suspends a member', async () => {
    const result = { id: 'membership-1' };
    (membershipService.suspendMember as jest.Mock).mockResolvedValue(result);

    await membershipController.suspendMember(
      {
        ...baseRequest,
        body: {
          memberId: baseRequest.params.memberId,
          reason: 'Policy violation',
        },
      } as any,
      res,
      next
    );

    expect(ApiResponse.success).toHaveBeenCalledWith(res, result, 'Member suspended successfully');
  });

  it('reactivates a member', async () => {
    const result = { id: 'membership-1' };
    (membershipService.reactivateMember as jest.Mock).mockResolvedValue(result);

    await membershipController.reactivateMember(
      {
        ...baseRequest,
        body: { memberId: baseRequest.params.memberId },
      } as any,
      res,
      next
    );

    expect(ApiResponse.success).toHaveBeenCalledWith(res, result, 'Member reactivated successfully');
  });

  it('removes a member', async () => {
    const result = { id: 'membership-1' };
    (membershipService.removeMember as jest.Mock).mockResolvedValue(result);

    await membershipController.removeMember(
      {
        ...baseRequest,
        body: { memberId: baseRequest.params.memberId },
      } as any,
      res,
      next
    );

    expect(ApiResponse.success).toHaveBeenCalledWith(res, result, 'Member removed successfully');
  });

  it('allows a user to leave an organization', async () => {
    const result = { id: 'membership-1' };
    (membershipService.leaveOrganization as jest.Mock).mockResolvedValue(result);

    await membershipController.leaveOrganization(baseRequest as any, res, next);

    expect(ApiResponse.success).toHaveBeenCalledWith(res, result, 'You have left the organization');
  });

  it('transfers ownership', async () => {
    const result = { id: 'membership-2' };
    (membershipService.transferOwnership as jest.Mock).mockResolvedValue(result);

    await membershipController.transferOwnership(
      {
        ...baseRequest,
        body: { newOwnerId: baseRequest.params.memberId },
      } as any,
      res,
      next
    );

    expect(ApiResponse.success).toHaveBeenCalledWith(res, result, 'Ownership transferred successfully');
  });
});
