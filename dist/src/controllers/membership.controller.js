"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.membershipController = exports.MembershipController = void 0;
const membership_service_1 = require("../services/membership.service");
const membership_validators_1 = require("../validators/membership.validators");
const response_1 = require("../shared/core/response");
class MembershipController {
    /**
     * Invite member to organization
     */
    async inviteMember(req, res, next) {
        try {
            const organizationId = req.params.organizationId;
            const userId = req.user?.userId;
            const payload = membership_validators_1.inviteMemberSchema.parse(req.body);
            const result = await membership_service_1.membershipService.inviteMember(organizationId, payload, {
                userId,
                organizationId,
            });
            response_1.ApiResponse.created(res, result, 'Member invited successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Accept invitation
     */
    async acceptInvitation(req, res, next) {
        try {
            const userId = req.user?.userId;
            const organizationId = req.params.organizationId;
            const payload = membership_validators_1.acceptInvitationSchema.parse(req.body);
            const result = await membership_service_1.membershipService.acceptInvitation(payload, {
                userId,
                organizationId,
            });
            response_1.ApiResponse.success(res, result, 'Invitation accepted successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Reject invitation
     */
    async rejectInvitation(req, res, next) {
        try {
            const userId = req.user?.userId;
            const organizationId = req.params.organizationId;
            const payload = membership_validators_1.rejectInvitationSchema.parse(req.body);
            const result = await membership_service_1.membershipService.rejectInvitation(payload, {
                userId,
                organizationId,
            });
            response_1.ApiResponse.success(res, result, 'Invitation rejected successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Cancel invitation (admin/owner only)
     */
    async cancelInvitation(req, res, next) {
        try {
            const organizationId = req.params.organizationId;
            const userId = req.user?.userId;
            const payload = membership_validators_1.cancelInvitationSchema.parse(req.body);
            const result = await membership_service_1.membershipService.cancelInvitation(organizationId, payload, {
                userId,
                organizationId,
            });
            response_1.ApiResponse.success(res, result, 'Invitation cancelled successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Resend invitation
     */
    async resendInvitation(req, res, next) {
        try {
            const organizationId = req.params.organizationId;
            const userId = req.user?.userId;
            const payload = membership_validators_1.resendInvitationSchema.parse(req.body);
            const result = await membership_service_1.membershipService.resendInvitation(organizationId, payload, {
                userId,
                organizationId,
            });
            response_1.ApiResponse.success(res, result, 'Invitation resent successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * List organization members
     */
    async listMembers(req, res, next) {
        try {
            const organizationId = req.params.organizationId;
            const userId = req.user?.userId;
            const query = membership_validators_1.listMembersQuerySchema.parse(req.query);
            const result = await membership_service_1.membershipService.listMembers(organizationId, query, {
                userId,
                organizationId,
            });
            response_1.ApiResponse.paginated(res, result.data, result.pagination, 'Members retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get member details
     */
    async getMemberDetails(req, res, next) {
        try {
            const organizationId = req.params.organizationId;
            const memberId = req.params.memberId;
            const userId = req.user?.userId;
            const result = await membership_service_1.membershipService.getMemberDetails(organizationId, memberId, {
                userId,
                organizationId,
            });
            response_1.ApiResponse.success(res, result, 'Member details retrieved successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Suspend member
     */
    async suspendMember(req, res, next) {
        try {
            const organizationId = req.params.organizationId;
            const userId = req.user?.userId;
            const payload = membership_validators_1.suspendMemberSchema.parse(req.body);
            const result = await membership_service_1.membershipService.suspendMember(organizationId, payload, {
                userId,
                organizationId,
            });
            response_1.ApiResponse.success(res, result, 'Member suspended successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Reactivate member
     */
    async reactivateMember(req, res, next) {
        try {
            const organizationId = req.params.organizationId;
            const userId = req.user?.userId;
            const payload = membership_validators_1.reactivateMemberSchema.parse(req.body);
            const result = await membership_service_1.membershipService.reactivateMember(organizationId, payload, {
                userId,
                organizationId,
            });
            response_1.ApiResponse.success(res, result, 'Member reactivated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Remove member
     */
    async removeMember(req, res, next) {
        try {
            const organizationId = req.params.organizationId;
            const userId = req.user?.userId;
            const payload = membership_validators_1.removeMemberSchema.parse(req.body);
            const result = await membership_service_1.membershipService.removeMember(organizationId, payload, {
                userId,
                organizationId,
            });
            response_1.ApiResponse.success(res, result, 'Member removed successfully');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Leave organization
     */
    async leaveOrganization(req, res, next) {
        try {
            const organizationId = req.params.organizationId;
            const userId = req.user?.userId;
            const result = await membership_service_1.membershipService.leaveOrganization(organizationId, {
                userId,
                organizationId,
            });
            response_1.ApiResponse.success(res, result, 'You have left the organization');
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Transfer ownership
     */
    async transferOwnership(req, res, next) {
        try {
            const organizationId = req.params.organizationId;
            const userId = req.user?.userId;
            const payload = membership_validators_1.transferOwnershipSchema.parse(req.body);
            const result = await membership_service_1.membershipService.transferOwnership(organizationId, payload, {
                userId,
                organizationId,
            });
            response_1.ApiResponse.success(res, result, 'Ownership transferred successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.MembershipController = MembershipController;
exports.membershipController = new MembershipController();
