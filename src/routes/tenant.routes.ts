import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import {
  createTenantSchema,
  updateTenantSchema,
  listTenantsSchema,
  tenantIdSchema,
} from '../validators/tenant.validator';
import {
  createTenant,
  deleteTenant,
  getTenant,
  listTenants,
  updateTenant,
  restoreTenant,
  getOrganizationTenantStatistics,
  getUnitTenantStatistics,
} from '../controllers/tenant.controller';
import { z } from 'zod';

/**
 * Tenant Routes
 * @route /api/v1/tenants
 */
const router = Router();

// All tenant routes require authentication
router.use(requireAuth);

/**
 * @route GET /api/v1/tenants/stats
 * @desc Get organization tenant statistics
 * @access Private
 */
router.get('/stats', getOrganizationTenantStatistics);

/**
 * @route GET /api/v1/tenants
 * @desc List all tenants with pagination, filtering, and search
 * @access Private
 */
router.get('/', validate({ query: listTenantsSchema }), listTenants);

/**
 * @route POST /api/v1/tenants
 * @desc Create a new tenant
 * @access Private
 */
router.post('/', validate({ body: createTenantSchema }), createTenant);

/**
 * @route GET /api/v1/tenants/:id
 * @desc Get tenant by ID
 * @access Private
 */
router.get('/:id', validate({ params: tenantIdSchema }), getTenant);

/**
 * @route PUT /api/v1/tenants/:id
 * @desc Update tenant
 * @access Private
 */
router.put('/:id', validate({ params: tenantIdSchema, body: updateTenantSchema }), updateTenant);

/**
 * @route DELETE /api/v1/tenants/:id
 * @desc Soft delete tenant
 * @access Private
 */
router.delete('/:id', validate({ params: tenantIdSchema }), deleteTenant);

/**
 * @route PATCH /api/v1/tenants/:id/restore
 * @desc Restore deleted tenant
 * @access Private
 */
router.patch('/:id/restore', validate({ params: tenantIdSchema }), restoreTenant);

/**
 * @route GET /api/v1/units/:unitId/tenants/stats
 * @desc Get unit tenant statistics
 * @access Private
 */
const unitStatsSchema = z.object({
  unitId: z.string().uuid(),
});

router.get('/units/:unitId/stats', validate({ params: unitStatsSchema }), getUnitTenantStatistics);

export default router;
