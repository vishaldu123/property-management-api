"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const maintenance_controller_1 = require("../controllers/maintenance.controller");
const router = (0, express_1.Router)();
/**
 * Maintenance Request Routes
 * Base: /api/v1/maintenance
 */
// Statistics endpoints (must be before :maintenanceId routes)
router.get('/stats/organization', auth_middleware_1.requireAuth, maintenance_controller_1.getOrganizationStats);
router.get('/properties/:propertyId/stats', auth_middleware_1.requireAuth, maintenance_controller_1.getPropertyStats);
// CRUD operations
router.post('/', auth_middleware_1.requireAuth, maintenance_controller_1.createMaintenance);
router.get('/', auth_middleware_1.requireAuth, maintenance_controller_1.listMaintenance);
router.get('/:maintenanceId', auth_middleware_1.requireAuth, maintenance_controller_1.getMaintenance);
router.put('/:maintenanceId', auth_middleware_1.requireAuth, maintenance_controller_1.updateMaintenance);
// Status and assignment operations
router.patch('/:maintenanceId/assign', auth_middleware_1.requireAuth, maintenance_controller_1.assignTechnician);
router.patch('/:maintenanceId/change-status', auth_middleware_1.requireAuth, maintenance_controller_1.changeStatus);
router.patch('/:maintenanceId/notes', auth_middleware_1.requireAuth, maintenance_controller_1.addNotes);
// Soft delete and restore
router.delete('/:maintenanceId', auth_middleware_1.requireAuth, maintenance_controller_1.deleteMaintenance);
router.patch('/:maintenanceId/restore', auth_middleware_1.requireAuth, maintenance_controller_1.restoreMaintenance);
exports.default = router;
