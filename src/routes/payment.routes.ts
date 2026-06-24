import { Router } from 'express';
import { requireAuth, authorize } from '../middleware/auth.middleware';
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
router.get('/', authorize('PAYMENT_READ'), listPayments);
router.get('/:paymentId', authorize('PAYMENT_READ'), getPayment);
router.post('/', authorize('PAYMENT_CREATE'), createPayment);
router.post('/initiate', authorize('PAYMENT_INITIATE'), initiatePayment);
router.put('/:paymentId', authorize('PAYMENT_UPDATE'), updatePayment);
router.delete('/:paymentId', authorize('PAYMENT_DELETE'), deletePayment);

export default router;
