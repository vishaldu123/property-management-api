import { Router } from 'express';
import { requireAuth, authorize } from '../middleware/auth.middleware';
import {
  createLease,
  deleteLease,
  getLease,
  listLeases,
  updateLease,
} from '../controllers/lease.controller';

const router = Router();

router.use(requireAuth);
router.get('/', authorize('LEASE_READ'), listLeases);
router.get('/:leaseId', authorize('LEASE_READ'), getLease);
router.post('/', authorize('LEASE_CREATE'), createLease);
router.put('/:leaseId', authorize('LEASE_UPDATE'), updateLease);
router.delete('/:leaseId', authorize('LEASE_DELETE'), deleteLease);

export default router;
