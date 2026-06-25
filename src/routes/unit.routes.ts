import { Router } from 'express';
import { requireAuth, authorize } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import {
  createUnitSchema,
  updateUnitSchema,
  unitIdParamSchema,
} from '../validators/unit.validators';
import {
  createUnit,
  deleteUnit,
  getUnit,
  listUnits,
  updateUnit,
} from '../controllers/unit.controller';

const router = Router();

router.use(requireAuth);
router.get('/', authorize('UNIT_READ'), listUnits);
router.get('/:unitId', authorize('UNIT_READ'), getUnit);
router.post('/', authorize('UNIT_CREATE'), validate({ body: createUnitSchema }), createUnit);
router.put('/:unitId', authorize('UNIT_UPDATE'), validate({ body: updateUnitSchema, params: unitIdParamSchema }), updateUnit);
router.delete('/:unitId', authorize('UNIT_DELETE'), deleteUnit);

export default router;
