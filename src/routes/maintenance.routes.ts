import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  createMaintenance,
  getMaintenance,
  listMaintenance,
  updateMaintenance,
  assignTechnician,
  changeStatus,
  addNotes,
  getOrganizationStats,
  getPropertyStats,
  deleteMaintenance,
  restoreMaintenance,
} from '../controllers/maintenance.controller';

const router = Router();

/**
 * Maintenance Request Routes
 * Base: /api/v1/maintenance
 */

// Statistics endpoints (must be before :maintenanceId routes)
router.get('/stats/organization', requireAuth, getOrganizationStats);
router.get('/properties/:propertyId/stats', requireAuth, getPropertyStats);

// CRUD operations
router.post('/', requireAuth, createMaintenance);
router.get('/', requireAuth, listMaintenance);
router.get('/:maintenanceId', requireAuth, getMaintenance);
router.put('/:maintenanceId', requireAuth, updateMaintenance);

// Status and assignment operations
router.patch('/:maintenanceId/assign', requireAuth, assignTechnician);
router.patch('/:maintenanceId/change-status', requireAuth, changeStatus);
router.patch('/:maintenanceId/notes', requireAuth, addNotes);

// Soft delete and restore
router.delete('/:maintenanceId', requireAuth, deleteMaintenance);
router.patch('/:maintenanceId/restore', requireAuth, restoreMaintenance);

export default router;
