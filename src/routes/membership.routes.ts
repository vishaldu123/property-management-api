import { Router } from 'express';
import { membershipController } from '../controllers/membership.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router({ mergeParams: true });

// All routes require authentication
router.use(requireAuth);

/**
 * POST /api/v1/organizations/:organizationId/invitations
 * Invite member to organization
 */
router.post('/:organizationId/invitations', (req, res, next) =>
  membershipController.inviteMember(req, res, next)
);

/**
 * POST /api/v1/organizations/:organizationId/invitations/:invitationId/resend
 * Resend invitation
 */
router.post('/:organizationId/invitations/:invitationId/resend', (req, res, next) =>
  membershipController.resendInvitation(req, res, next)
);

/**
 * POST /api/v1/organizations/:organizationId/invitations/:invitationId/cancel
 * Cancel invitation (owner/admin only)
 */
router.post('/:organizationId/invitations/:invitationId/cancel', (req, res, next) =>
  membershipController.cancelInvitation(req, res, next)
);

/**
 * POST /api/v1/invitations/:token/accept
 * Accept invitation (public, token-based)
 */
router.post('/invitations/:token/accept', (req, res, next) =>
  membershipController.acceptInvitation(req, res, next)
);

/**
 * POST /api/v1/invitations/:token/reject
 * Reject invitation (public, token-based)
 */
router.post('/invitations/:token/reject', (req, res, next) =>
  membershipController.rejectInvitation(req, res, next)
);

/**
 * GET /api/v1/organizations/:organizationId/members
 * List organization members with pagination, search, filter
 */
router.get('/:organizationId/members', (req, res, next) =>
  membershipController.listMembers(req, res, next)
);

/**
 * GET /api/v1/organizations/:organizationId/members/:memberId
 * Get member details
 */
router.get('/:organizationId/members/:memberId', (req, res, next) =>
  membershipController.getMemberDetails(req, res, next)
);

/**
 * POST /api/v1/organizations/:organizationId/members/:memberId/suspend
 * Suspend member (owner only)
 */
router.post('/:organizationId/members/:memberId/suspend', (req, res, next) =>
  membershipController.suspendMember(req, res, next)
);

/**
 * POST /api/v1/organizations/:organizationId/members/:memberId/reactivate
 * Reactivate member (owner only)
 */
router.post('/:organizationId/members/:memberId/reactivate', (req, res, next) =>
  membershipController.reactivateMember(req, res, next)
);

/**
 * DELETE /api/v1/organizations/:organizationId/members/:memberId
 * Remove member (owner/admin only)
 */
router.delete('/:organizationId/members/:memberId', (req, res, next) =>
  membershipController.removeMember(req, res, next)
);

/**
 * POST /api/v1/organizations/:organizationId/leave
 * Leave organization
 */
router.post('/:organizationId/leave', (req, res, next) =>
  membershipController.leaveOrganization(req, res, next)
);

/**
 * POST /api/v1/organizations/:organizationId/transfer-ownership
 * Transfer ownership (owner only)
 */
router.post('/:organizationId/transfer-ownership', (req, res, next) =>
  membershipController.transferOwnership(req, res, next)
);

export default router;
