"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_1 = require("../utils/validation");
const lease_validator_1 = require("../validators/lease.validator");
const lease_controller_1 = require("../controllers/lease.controller");
const zod_1 = require("zod");
/**
 * Lease Routes
 * @route /api/v1/leases
 */
const router = (0, express_1.Router)();
// All lease routes require authentication
router.use(auth_middleware_1.requireAuth);
/**
 * @route GET /api/v1/leases/stats
 * @desc Get organization lease statistics
 * @access Private
 */
router.get('/stats', lease_controller_1.getOrganizationLeaseStatistics);
/**
 * @route GET /api/v1/leases
 * @desc List all leases with pagination, filtering, and search
 * @access Private
 */
router.get('/', (0, validation_1.validate)({ query: lease_validator_1.listLeasesSchema }), lease_controller_1.listLeases);
/**
 * @route POST /api/v1/leases
 * @desc Create a new lease
 * @access Private
 */
router.post('/', (0, validation_1.validate)({ body: lease_validator_1.createLeaseSchema }), lease_controller_1.createLease);
/**
 * @route GET /api/v1/leases/:id
 * @desc Get lease by ID
 * @access Private
 */
router.get('/:id', (0, validation_1.validate)({ params: lease_validator_1.leaseIdSchema }), lease_controller_1.getLease);
/**
 * @route PUT /api/v1/leases/:id
 * @desc Update lease
 * @access Private
 */
router.put('/:id', (0, validation_1.validate)({ params: lease_validator_1.leaseIdSchema, body: lease_validator_1.updateLeaseSchema }), lease_controller_1.updateLease);
/**
 * @route DELETE /api/v1/leases/:id
 * @desc Soft delete lease
 * @access Private
 */
router.delete('/:id', (0, validation_1.validate)({ params: lease_validator_1.leaseIdSchema }), lease_controller_1.deleteLease);
/**
 * @route PATCH /api/v1/leases/:id/restore
 * @desc Restore deleted lease
 * @access Private
 */
router.patch('/:id/restore', (0, validation_1.validate)({ params: lease_validator_1.leaseIdSchema }), lease_controller_1.restoreLease);
/**
 * @route POST /api/v1/leases/:id/renew
 * @desc Renew a lease
 * @access Private
 */
router.post('/:id/renew', (0, validation_1.validate)({ params: lease_validator_1.leaseIdSchema, body: lease_validator_1.renewLeaseSchema }), lease_controller_1.renewLease);
/**
 * @route POST /api/v1/leases/:id/terminate
 * @desc Terminate a lease
 * @access Private
 */
router.post('/:id/terminate', (0, validation_1.validate)({ params: lease_validator_1.leaseIdSchema, body: lease_validator_1.terminateLeaseSchema }), lease_controller_1.terminateLease);
/**
 * @route GET /api/v1/units/:unitId/leases/stats
 * @desc Get unit lease statistics
 * @access Private
 */
const unitStatsSchema = zod_1.z.object({
    unitId: zod_1.z.string().uuid(),
});
router.get('/units/:unitId/stats', (0, validation_1.validate)({ params: unitStatsSchema }), lease_controller_1.getUnitLeaseStatistics);
/**
 * @route GET /api/v1/tenants/:tenantId/leases/stats
 * @desc Get tenant lease statistics
 * @access Private
 */
const tenantStatsSchema = zod_1.z.object({
    tenantId: zod_1.z.string().uuid(),
});
router.get('/tenants/:tenantId/stats', (0, validation_1.validate)({ params: tenantStatsSchema }), lease_controller_1.getTenantLeaseStatistics);
exports.default = router;
