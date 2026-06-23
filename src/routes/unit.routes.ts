import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import {
  createUnit,
  deleteUnit,
  getUnit,
  listUnits,
  updateUnit,
} from '../controllers/unit.controller';

const router = Router();

router.use(requireAuth);
router.get('/', listUnits);
router.get('/:unitId', getUnit);
router.post('/', requireRole(['MANAGER', 'ADMIN', 'OWNER']), createUnit);
router.put('/:unitId', requireRole(['MANAGER', 'ADMIN', 'OWNER']), updateUnit);
router.delete('/:unitId', requireRole(['ADMIN', 'OWNER']), deleteUnit);

export default router;
