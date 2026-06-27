import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import {
  createUnitSchema,
  updateUnitSchema,
  listUnitsSchema,
  unitIdSchema,
} from '../validators/unit.validator';
import {
  createUnit,
  deleteUnit,
  getUnit,
  listUnits,
  updateUnit,
  restoreUnit,
  getOrganizationUnitStatistics,
  getPropertyUnitStatistics,
} from '../controllers/unit.controller';
import { z } from 'zod';

/**
 * Unit Routes
 * @route /api/v1/units
 */
const router = Router();

// All unit routes require authentication
router.use(requireAuth);

/**
 * @route GET /api/v1/units/stats
 * @desc Get organization unit statistics
 * @access Private
 */
router.get('/stats', getOrganizationUnitStatistics);

/**
 * @route GET /api/v1/units
 * @desc List all units with pagination, filtering, and search
 * @access Private
 */
router.get('/', validate({ query: listUnitsSchema }), listUnits);

/**
 * @route POST /api/v1/units
 * @desc Create a new unit
 * @access Private
 */
router.post('/', validate({ body: createUnitSchema }), createUnit);

/**
 * @route GET /api/v1/units/:id
 * @desc Get unit by ID
 * @access Private
 */
router.get('/:id', validate({ params: unitIdSchema }), getUnit);

/**
 * @route PUT /api/v1/units/:id
 * @desc Update unit
 * @access Private
 */
router.put('/:id', validate({ params: unitIdSchema, body: updateUnitSchema }), updateUnit);

/**
 * @route DELETE /api/v1/units/:id
 * @desc Soft delete unit
 * @access Private
 */
router.delete('/:id', validate({ params: unitIdSchema }), deleteUnit);

/**
 * @route PATCH /api/v1/units/:id/restore
 * @desc Restore deleted unit
 * @access Private
 */
router.patch('/:id/restore', validate({ params: unitIdSchema }), restoreUnit);

/**
 * @route GET /api/v1/properties/:propertyId/units/stats
 * @desc Get property unit statistics
 * @access Private
 */
const propertyStatsSchema = z.object({
  propertyId: z.string().uuid(),
});

router.get('/properties/:propertyId/stats', validate({ params: propertyStatsSchema }), getPropertyUnitStatistics);

export default router;
