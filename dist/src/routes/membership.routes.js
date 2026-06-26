"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const membership_controller_1 = require("../controllers/membership.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)({ mergeParams: true });
// All routes require authentication
router.use(auth_middleware_1.requireAuth);
/**
 * POST /api/v1/organizations/:organizationId/invitations
 * Invite member to organization
 */
router.post('/:organizationId/invitations', (req, res, next) => membership_controller_1.membershipController.inviteMember(req, res, next));
/**
 * POST /api/v1/organizations/:organizationId/invitations/:invitationId/resend
 * Resend invitation
 */
router.post('/:organizationId/invitations/:invitationId/resend', (req, res, next) => membership_controller_1.membershipController.resendInvitation(req, res, next));
/**
 * POST /api/v1/organizations/:organizationId/invitations/:invitationId/cancel
 * Cancel invitation (owner/admin only)
 */
router.post('/:organizationId/invitations/:invitationId/cancel', (req, res, next) => membership_controller_1.membershipController.cancelInvitation(req, res, next));
/**
 * POST /api/v1/invitations/:token/accept
 * Accept invitation (public, token-based)
 */
router.post('/invitations/:token/accept', (req, res, next) => membership_controller_1.membershipController.acceptInvitation(req, res, next));
/**
 * POST /api/v1/invitations/:token/reject
 * Reject invitation (public, token-based)
 */
router.post('/invitations/:token/reject', (req, res, next) => membership_controller_1.membershipController.rejectInvitation(req, res, next));
/**
 * GET /api/v1/organizations/:organizationId/members
 * List organization members with pagination, search, filter
 */
router.get('/:organizationId/members', (req, res, next) => membership_controller_1.membershipController.listMembers(req, res, next));
/**
 * GET /api/v1/organizations/:organizationId/members/:memberId
 * Get member details
 */
router.get('/:organizationId/members/:memberId', (req, res, next) => membership_controller_1.membershipController.getMemberDetails(req, res, next));
/**
 * POST /api/v1/organizations/:organizationId/members/:memberId/suspend
 * Suspend member (owner only)
 */
router.post('/:organizationId/members/:memberId/suspend', (req, res, next) => membership_controller_1.membershipController.suspendMember(req, res, next));
/**
 * POST /api/v1/organizations/:organizationId/members/:memberId/reactivate
 * Reactivate member (owner only)
 */
router.post('/:organizationId/members/:memberId/reactivate', (req, res, next) => membership_controller_1.membershipController.reactivateMember(req, res, next));
/**
 * DELETE /api/v1/organizations/:organizationId/members/:memberId
 * Remove member (owner/admin only)
 */
router.delete('/:organizationId/members/:memberId', (req, res, next) => membership_controller_1.membershipController.removeMember(req, res, next));
/**
 * POST /api/v1/organizations/:organizationId/leave
 * Leave organization
 */
router.post('/:organizationId/leave', (req, res, next) => membership_controller_1.membershipController.leaveOrganization(req, res, next));
/**
 * POST /api/v1/organizations/:organizationId/transfer-ownership
 * Transfer ownership (owner only)
 */
router.post('/:organizationId/transfer-ownership', (req, res, next) => membership_controller_1.membershipController.transferOwnership(req, res, next));
exports.default = router;
