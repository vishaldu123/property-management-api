import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import {
  createPaymentSchema,
  updatePaymentSchema,
  listPaymentsSchema,
  paymentIdParamSchema,
  markAsPaidSchema,
  markAsOverdueSchema,
  refundPaymentSchema,
  generateReceiptSchema,
  leaseIdParamSchema,
  tenantIdParamSchema,
} from '../validators/payment.validators';
import {
  createPayment,
  deletePayment,
  getPayment,
  listPayments,
  updatePayment,
  restorePayment,
  markAsPaid,
  markAsOverdue,
  refundPayment,
  generateReceipt,
  getOrganizationStatistics,
  getLeaseStatistics,
  getTenantStatistics,
} from '../controllers/payment.controller';

/**
 * Payment Routes
 * @route /api/v1/payments
 */
const router = Router();

// All payment routes require authentication
router.use(requireAuth);

/**
 * @route GET /api/v1/payments/stats/organization
 * @desc Get organization payment statistics
 * @access Private
 */
router.get('/stats/organization', getOrganizationStatistics);

/**
 * @route GET /api/v1/payments
 * @desc List all payments with pagination, filtering, and search
 * @access Private
 */
router.get('/', validate({ query: listPaymentsSchema }), listPayments);

/**
 * @route POST /api/v1/payments
 * @desc Create a new payment
 * @access Private
 */
router.post('/', validate({ body: createPaymentSchema }), createPayment);

/**
 * @route GET /api/v1/payments/:paymentId
 * @desc Get a specific payment by ID
 * @access Private
 */
router.get('/:paymentId', validate({ params: paymentIdParamSchema }), getPayment);

/**
 * @route PUT /api/v1/payments/:paymentId
 * @desc Update a payment
 * @access Private
 */
router.put('/:paymentId', validate({ params: paymentIdParamSchema, body: updatePaymentSchema }), updatePayment);

/**
 * @route PATCH /api/v1/payments/:paymentId/mark-as-paid
 * @desc Mark a payment as paid
 * @access Private
 */
router.patch('/:paymentId/mark-as-paid', validate({ params: paymentIdParamSchema, body: markAsPaidSchema }), markAsPaid);

/**
 * @route PATCH /api/v1/payments/:paymentId/mark-as-overdue
 * @desc Mark a payment as overdue
 * @access Private
 */
router.patch(
  '/:paymentId/mark-as-overdue',
  validate({ params: paymentIdParamSchema, body: markAsOverdueSchema }),
  markAsOverdue
);

/**
 * @route PATCH /api/v1/payments/:paymentId/refund
 * @desc Refund a payment
 * @access Private
 */
router.patch('/:paymentId/refund', validate({ params: paymentIdParamSchema, body: refundPaymentSchema }), refundPayment);

/**
 * @route POST /api/v1/payments/:paymentId/generate-receipt
 * @desc Generate receipt for a payment
 * @access Private
 */
router.post(
  '/:paymentId/generate-receipt',
  validate({ params: paymentIdParamSchema, body: generateReceiptSchema }),
  generateReceipt
);

/**
 * @route DELETE /api/v1/payments/:paymentId
 * @desc Soft delete a payment
 * @access Private
 */
router.delete('/:paymentId', validate({ params: paymentIdParamSchema }), deletePayment);

/**
 * @route PATCH /api/v1/payments/:paymentId/restore
 * @desc Restore a deleted payment
 * @access Private
 */
router.patch('/:paymentId/restore', validate({ params: paymentIdParamSchema }), restorePayment);

/**
 * @route GET /api/v1/leases/:leaseId/payments/stats
 * @desc Get lease payment statistics
 * @access Private
 */
router.get('/leases/:leaseId/payments/stats', validate({ params: leaseIdParamSchema }), getLeaseStatistics);

/**
 * @route GET /api/v1/tenants/:tenantId/payments/stats
 * @desc Get tenant payment statistics
 * @access Private
 */
router.get('/tenants/:tenantId/payments/stats', validate({ params: tenantIdParamSchema }), getTenantStatistics);

export default router;
