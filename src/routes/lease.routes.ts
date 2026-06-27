import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import {
  createLeaseSchema,
  updateLeaseSchema,
  listLeasesSchema,
  leaseIdSchema,
  renewLeaseSchema,
  terminateLeaseSchema,
} from '../validators/lease.validator';
import {
  createLease,
  deleteLease,
  getLease,
  listLeases,
  updateLease,
  restoreLease,
  renewLease,
  terminateLease,
  getOrganizationLeaseStatistics,
  getUnitLeaseStatistics,
  getTenantLeaseStatistics,
} from '../controllers/lease.controller';
import { z } from 'zod';

/**
 * Lease Routes
 * @route /api/v1/leases
 */
const router = Router();

// All lease routes require authentication
router.use(requireAuth);

/**
 * @route GET /api/v1/leases/stats
 * @desc Get organization lease statistics
 * @access Private
 */
router.get('/stats', getOrganizationLeaseStatistics);

/**
 * @route GET /api/v1/leases
 * @desc List all leases with pagination, filtering, and search
 * @access Private
 */
router.get('/', validate({ query: listLeasesSchema }), listLeases);

/**
 * @route POST /api/v1/leases
 * @desc Create a new lease
 * @access Private
 */
router.post('/', validate({ body: createLeaseSchema }), createLease);

/**
 * @route GET /api/v1/leases/:id
 * @desc Get lease by ID
 * @access Private
 */
router.get('/:id', validate({ params: leaseIdSchema }), getLease);

/**
 * @route PUT /api/v1/leases/:id
 * @desc Update lease
 * @access Private
 */
router.put('/:id', validate({ params: leaseIdSchema, body: updateLeaseSchema }), updateLease);

/**
 * @route DELETE /api/v1/leases/:id
 * @desc Soft delete lease
 * @access Private
 */
router.delete('/:id', validate({ params: leaseIdSchema }), deleteLease);

/**
 * @route PATCH /api/v1/leases/:id/restore
 * @desc Restore deleted lease
 * @access Private
 */
router.patch('/:id/restore', validate({ params: leaseIdSchema }), restoreLease);

/**
 * @route POST /api/v1/leases/:id/renew
 * @desc Renew a lease
 * @access Private
 */
router.post('/:id/renew', validate({ params: leaseIdSchema, body: renewLeaseSchema }), renewLease);

/**
 * @route POST /api/v1/leases/:id/terminate
 * @desc Terminate a lease
 * @access Private
 */
router.post('/:id/terminate', validate({ params: leaseIdSchema, body: terminateLeaseSchema }), terminateLease);

/**
 * @route GET /api/v1/units/:unitId/leases/stats
 * @desc Get unit lease statistics
 * @access Private
 */
const unitStatsSchema = z.object({
  unitId: z.string().uuid(),
});

router.get('/units/:unitId/stats', validate({ params: unitStatsSchema }), getUnitLeaseStatistics);

/**
 * @route GET /api/v1/tenants/:tenantId/leases/stats
 * @desc Get tenant lease statistics
 * @access Private
 */
const tenantStatsSchema = z.object({
  tenantId: z.string().uuid(),
});

router.get('/tenants/:tenantId/stats', validate({ params: tenantStatsSchema }), getTenantLeaseStatistics);

export default router;
