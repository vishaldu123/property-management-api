import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import {
  createLease,
  deleteLease,
  getLease,
  listLeases,
  updateLease,
} from '../controllers/lease.controller';

const router = Router();

router.use(requireAuth);
router.get('/', listLeases);
router.get('/:leaseId', getLease);
router.post('/', requireRole(['MANAGER', 'ADMIN', 'OWNER']), createLease);
router.put('/:leaseId', requireRole(['MANAGER', 'ADMIN', 'OWNER']), updateLease);
router.delete('/:leaseId', requireRole(['ADMIN', 'OWNER']), deleteLease);

export default router;
