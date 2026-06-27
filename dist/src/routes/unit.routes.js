"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_1 = require("../utils/validation");
const unit_validator_1 = require("../validators/unit.validator");
const unit_controller_1 = require("../controllers/unit.controller");
const zod_1 = require("zod");
/**
 * Unit Routes
 * @route /api/v1/units
 */
const router = (0, express_1.Router)();
// All unit routes require authentication
router.use(auth_middleware_1.requireAuth);
/**
 * @route GET /api/v1/units/stats
 * @desc Get organization unit statistics
 * @access Private
 */
router.get('/stats', unit_controller_1.getOrganizationUnitStatistics);
/**
 * @route GET /api/v1/units
 * @desc List all units with pagination, filtering, and search
 * @access Private
 */
router.get('/', (0, validation_1.validate)({ query: unit_validator_1.listUnitsSchema }), unit_controller_1.listUnits);
/**
 * @route POST /api/v1/units
 * @desc Create a new unit
 * @access Private
 */
router.post('/', (0, validation_1.validate)({ body: unit_validator_1.createUnitSchema }), unit_controller_1.createUnit);
/**
 * @route GET /api/v1/units/:id
 * @desc Get unit by ID
 * @access Private
 */
router.get('/:id', (0, validation_1.validate)({ params: unit_validator_1.unitIdSchema }), unit_controller_1.getUnit);
/**
 * @route PUT /api/v1/units/:id
 * @desc Update unit
 * @access Private
 */
router.put('/:id', (0, validation_1.validate)({ params: unit_validator_1.unitIdSchema, body: unit_validator_1.updateUnitSchema }), unit_controller_1.updateUnit);
/**
 * @route DELETE /api/v1/units/:id
 * @desc Soft delete unit
 * @access Private
 */
router.delete('/:id', (0, validation_1.validate)({ params: unit_validator_1.unitIdSchema }), unit_controller_1.deleteUnit);
/**
 * @route PATCH /api/v1/units/:id/restore
 * @desc Restore deleted unit
 * @access Private
 */
router.patch('/:id/restore', (0, validation_1.validate)({ params: unit_validator_1.unitIdSchema }), unit_controller_1.restoreUnit);
/**
 * @route GET /api/v1/properties/:propertyId/units/stats
 * @desc Get property unit statistics
 * @access Private
 */
const propertyStatsSchema = zod_1.z.object({
    propertyId: zod_1.z.string().uuid(),
});
router.get('/properties/:propertyId/stats', (0, validation_1.validate)({ params: propertyStatsSchema }), unit_controller_1.getPropertyUnitStatistics);
exports.default = router;
