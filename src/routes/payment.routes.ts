import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import {
  createPayment,
  deletePayment,
  getPayment,
  listPayments,
  updatePayment,
  initiatePayment,
} from '../controllers/payment.controller';

const router = Router();

router.use(requireAuth);
router.get('/', listPayments);
router.get('/:paymentId', getPayment);
router.post('/', requireRole(['MANAGER', 'ADMIN', 'OWNER']), createPayment);
router.post('/initiate', requireRole(['MANAGER', 'ADMIN', 'OWNER']), initiatePayment);
router.put('/:paymentId', requireRole(['MANAGER', 'ADMIN', 'OWNER']), updatePayment);
router.delete('/:paymentId', requireRole(['ADMIN', 'OWNER']), deletePayment);

export default router;
