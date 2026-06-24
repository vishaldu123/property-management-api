import { Router } from 'express';
import { requireAuth, authorize } from '../middleware/auth.middleware';
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
router.post('/', authorize('UNIT_CREATE'), createUnit);
router.put('/:unitId', authorize('UNIT_UPDATE'), updateUnit);
router.delete('/:unitId', authorize('UNIT_DELETE'), deleteUnit);

export default router;
