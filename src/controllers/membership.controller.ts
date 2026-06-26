import { Request, Response, NextFunction } from 'express';
import { membershipService } from '../services/membership.service';
import {
  inviteMemberSchema,
  acceptInvitationSchema,
  rejectInvitationSchema,
  cancelInvitationSchema,
  resendInvitationSchema,
  removeMemberSchema,
  suspendMemberSchema,
  reactivateMemberSchema,
  transferOwnershipSchema,
  listMembersQuerySchema,
} from '../validators/membership.validators';
import { ApiResponse } from '../shared/core/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class MembershipController {
  /**
   * Invite member to organization
   */
  async inviteMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.params.organizationId as string;
      const userId = req.user?.userId!;

      const payload = inviteMemberSchema.parse(req.body);
      const result = await membershipService.inviteMember(organizationId, payload, {
        userId,
        organizationId,
      });

      ApiResponse.created(res, result, 'Member invited successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept invitation
   */
  async acceptInvitation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId!;
      const organizationId = req.params.organizationId as string;

      const payload = acceptInvitationSchema.parse(req.body);
      const result = await membershipService.acceptInvitation(payload, {
        userId,
        organizationId,
      });

      ApiResponse.success(res, result, 'Invitation accepted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject invitation
   */
  async rejectInvitation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId!;
      const organizationId = req.params.organizationId as string;

      const payload = rejectInvitationSchema.parse(req.body);
      const result = await membershipService.rejectInvitation(payload, {
        userId,
        organizationId,
      });

      ApiResponse.success(res, result, 'Invitation rejected successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel invitation (admin/owner only)
   */
  async cancelInvitation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.params.organizationId as string;
      const userId = req.user?.userId!;

      const payload = cancelInvitationSchema.parse(req.body);
      const result = await membershipService.cancelInvitation(organizationId, payload, {
        userId,
        organizationId,
      });

      ApiResponse.success(res, result, 'Invitation cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resend invitation
   */
  async resendInvitation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.params.organizationId as string;
      const userId = req.user?.userId!;

      const payload = resendInvitationSchema.parse(req.body);
      const result = await membershipService.resendInvitation(organizationId, payload, {
        userId,
        organizationId,
      });

      ApiResponse.success(res, result, 'Invitation resent successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * List organization members
   */
  async listMembers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.params.organizationId as string;
      const userId = req.user?.userId!;

      const query = listMembersQuerySchema.parse(req.query);
      const result = await membershipService.listMembers(organizationId, query, {
        userId,
        organizationId,
      });

      ApiResponse.paginated(res, result.data, result.pagination, 'Members retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get member details
   */
  async getMemberDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.params.organizationId as string;
      const memberId = req.params.memberId as string;
      const userId = req.user?.userId!;

      const result = await membershipService.getMemberDetails(organizationId, memberId, {
        userId,
        organizationId,
      });

      ApiResponse.success(res, result, 'Member details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Suspend member
   */
  async suspendMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.params.organizationId as string;
      const userId = req.user?.userId!;

      const payload = suspendMemberSchema.parse(req.body);
      const result = await membershipService.suspendMember(organizationId, payload, {
        userId,
        organizationId,
      });

      ApiResponse.success(res, result, 'Member suspended successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reactivate member
   */
  async reactivateMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.params.organizationId as string;
      const userId = req.user?.userId!;

      const payload = reactivateMemberSchema.parse(req.body);
      const result = await membershipService.reactivateMember(organizationId, payload, {
        userId,
        organizationId,
      });

      ApiResponse.success(res, result, 'Member reactivated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove member
   */
  async removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.params.organizationId as string;
      const userId = req.user?.userId!;

      const payload = removeMemberSchema.parse(req.body);
      const result = await membershipService.removeMember(organizationId, payload, {
        userId,
        organizationId,
      });

      ApiResponse.success(res, result, 'Member removed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Leave organization
   */
  async leaveOrganization(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.params.organizationId as string;
      const userId = req.user?.userId!;

      const result = await membershipService.leaveOrganization(organizationId, {
        userId,
        organizationId,
      });

      ApiResponse.success(res, result, 'You have left the organization');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Transfer ownership
   */
  async transferOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const organizationId = req.params.organizationId as string;
      const userId = req.user?.userId!;

      const payload = transferOwnershipSchema.parse(req.body);
      const result = await membershipService.transferOwnership(organizationId, payload, {
        userId,
        organizationId,
      });

      ApiResponse.success(res, result, 'Ownership transferred successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const membershipController = new MembershipController();
