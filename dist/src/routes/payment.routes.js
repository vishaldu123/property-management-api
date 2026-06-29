"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_1 = require("../utils/validation");
const payment_validators_1 = require("../validators/payment.validators");
const payment_controller_1 = require("../controllers/payment.controller");
/**
 * Payment Routes
 * @route /api/v1/payments
 */
const router = (0, express_1.Router)();
// All payment routes require authentication
router.use(auth_middleware_1.requireAuth);
/**
 * @route GET /api/v1/payments/stats/organization
 * @desc Get organization payment statistics
 * @access Private
 */
router.get('/stats/organization', payment_controller_1.getOrganizationStatistics);
/**
 * @route GET /api/v1/payments
 * @desc List all payments with pagination, filtering, and search
 * @access Private
 */
router.get('/', (0, validation_1.validate)({ query: payment_validators_1.listPaymentsSchema }), payment_controller_1.listPayments);
/**
 * @route POST /api/v1/payments
 * @desc Create a new payment
 * @access Private
 */
router.post('/', (0, validation_1.validate)({ body: payment_validators_1.createPaymentSchema }), payment_controller_1.createPayment);
/**
 * @route GET /api/v1/payments/:paymentId
 * @desc Get a specific payment by ID
 * @access Private
 */
router.get('/:paymentId', (0, validation_1.validate)({ params: payment_validators_1.paymentIdParamSchema }), payment_controller_1.getPayment);
/**
 * @route PUT /api/v1/payments/:paymentId
 * @desc Update a payment
 * @access Private
 */
router.put('/:paymentId', (0, validation_1.validate)({ params: payment_validators_1.paymentIdParamSchema, body: payment_validators_1.updatePaymentSchema }), payment_controller_1.updatePayment);
/**
 * @route PATCH /api/v1/payments/:paymentId/mark-as-paid
 * @desc Mark a payment as paid
 * @access Private
 */
router.patch('/:paymentId/mark-as-paid', (0, validation_1.validate)({ params: payment_validators_1.paymentIdParamSchema, body: payment_validators_1.markAsPaidSchema }), payment_controller_1.markAsPaid);
/**
 * @route PATCH /api/v1/payments/:paymentId/mark-as-overdue
 * @desc Mark a payment as overdue
 * @access Private
 */
router.patch('/:paymentId/mark-as-overdue', (0, validation_1.validate)({ params: payment_validators_1.paymentIdParamSchema, body: payment_validators_1.markAsOverdueSchema }), payment_controller_1.markAsOverdue);
/**
 * @route PATCH /api/v1/payments/:paymentId/refund
 * @desc Refund a payment
 * @access Private
 */
router.patch('/:paymentId/refund', (0, validation_1.validate)({ params: payment_validators_1.paymentIdParamSchema, body: payment_validators_1.refundPaymentSchema }), payment_controller_1.refundPayment);
/**
 * @route POST /api/v1/payments/:paymentId/generate-receipt
 * @desc Generate receipt for a payment
 * @access Private
 */
router.post('/:paymentId/generate-receipt', (0, validation_1.validate)({ params: payment_validators_1.paymentIdParamSchema, body: payment_validators_1.generateReceiptSchema }), payment_controller_1.generateReceipt);
/**
 * @route DELETE /api/v1/payments/:paymentId
 * @desc Soft delete a payment
 * @access Private
 */
router.delete('/:paymentId', (0, validation_1.validate)({ params: payment_validators_1.paymentIdParamSchema }), payment_controller_1.deletePayment);
/**
 * @route PATCH /api/v1/payments/:paymentId/restore
 * @desc Restore a deleted payment
 * @access Private
 */
router.patch('/:paymentId/restore', (0, validation_1.validate)({ params: payment_validators_1.paymentIdParamSchema }), payment_controller_1.restorePayment);
/**
 * @route GET /api/v1/leases/:leaseId/payments/stats
 * @desc Get lease payment statistics
 * @access Private
 */
router.get('/leases/:leaseId/payments/stats', (0, validation_1.validate)({ params: payment_validators_1.leaseIdParamSchema }), payment_controller_1.getLeaseStatistics);
/**
 * @route GET /api/v1/tenants/:tenantId/payments/stats
 * @desc Get tenant payment statistics
 * @access Private
 */
router.get('/tenants/:tenantId/payments/stats', (0, validation_1.validate)({ params: payment_validators_1.tenantIdParamSchema }), payment_controller_1.getTenantStatistics);
exports.default = router;
