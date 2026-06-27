"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_1 = require("../utils/validation");
const tenant_validator_1 = require("../validators/tenant.validator");
const tenant_controller_1 = require("../controllers/tenant.controller");
const zod_1 = require("zod");
/**
 * Tenant Routes
 * @route /api/v1/tenants
 */
const router = (0, express_1.Router)();
// All tenant routes require authentication
router.use(auth_middleware_1.requireAuth);
/**
 * @route GET /api/v1/tenants/stats
 * @desc Get organization tenant statistics
 * @access Private
 */
router.get('/stats', tenant_controller_1.getOrganizationTenantStatistics);
/**
 * @route GET /api/v1/tenants
 * @desc List all tenants with pagination, filtering, and search
 * @access Private
 */
router.get('/', (0, validation_1.validate)({ query: tenant_validator_1.listTenantsSchema }), tenant_controller_1.listTenants);
/**
 * @route POST /api/v1/tenants
 * @desc Create a new tenant
 * @access Private
 */
router.post('/', (0, validation_1.validate)({ body: tenant_validator_1.createTenantSchema }), tenant_controller_1.createTenant);
/**
 * @route GET /api/v1/tenants/:id
 * @desc Get tenant by ID
 * @access Private
 */
router.get('/:id', (0, validation_1.validate)({ params: tenant_validator_1.tenantIdSchema }), tenant_controller_1.getTenant);
/**
 * @route PUT /api/v1/tenants/:id
 * @desc Update tenant
 * @access Private
 */
router.put('/:id', (0, validation_1.validate)({ params: tenant_validator_1.tenantIdSchema, body: tenant_validator_1.updateTenantSchema }), tenant_controller_1.updateTenant);
/**
 * @route DELETE /api/v1/tenants/:id
 * @desc Soft delete tenant
 * @access Private
 */
router.delete('/:id', (0, validation_1.validate)({ params: tenant_validator_1.tenantIdSchema }), tenant_controller_1.deleteTenant);
/**
 * @route PATCH /api/v1/tenants/:id/restore
 * @desc Restore deleted tenant
 * @access Private
 */
router.patch('/:id/restore', (0, validation_1.validate)({ params: tenant_validator_1.tenantIdSchema }), tenant_controller_1.restoreTenant);
/**
 * @route GET /api/v1/units/:unitId/tenants/stats
 * @desc Get unit tenant statistics
 * @access Private
 */
const unitStatsSchema = zod_1.z.object({
    unitId: zod_1.z.string().uuid(),
});
router.get('/units/:unitId/stats', (0, validation_1.validate)({ params: unitStatsSchema }), tenant_controller_1.getUnitTenantStatistics);
exports.default = router;
