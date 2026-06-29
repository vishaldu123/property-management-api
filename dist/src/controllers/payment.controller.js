"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantStatistics = exports.getLeaseStatistics = exports.getOrganizationStatistics = exports.restorePayment = exports.deletePayment = exports.generateReceipt = exports.refundPayment = exports.markAsOverdue = exports.markAsPaid = exports.updatePayment = exports.listPayments = exports.getPayment = exports.createPayment = void 0;
const payment_service_1 = require("../services/payment.service");
const response_1 = require("../shared/core/response");
const logger_1 = __importDefault(require("../utils/logger"));
const payment_validators_1 = require("../validators/payment.validators");
/**
 * Helper function to extract actor context from request
 */
function getActorContext(req) {
    return {
        userId: req.user?.userId || '',
        organizationId: req.user?.organizationId || '',
    };
}
/**
 * Helper function to safely extract parameter
 */
function getParam(param) {
    return typeof param === 'string' ? param : undefined;
}
/**
 * Create a new payment
 * POST /api/v1/payments
 */
const createPayment = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const validation = payment_validators_1.createPaymentSchema.safeParse(req.body);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        // Convert date strings to Date objects
        const input = {
            ...validation.data,
            paymentDate: new Date(validation.data.paymentDate),
            dueDate: new Date(validation.data.dueDate),
            propertyId: '', // Will be set in service
            unitId: '', // Will be set in service
            tenantId: '', // Will be set in service
        };
        const payment = await payment_service_1.paymentService.createPayment(ctx, input);
        response_1.ApiResponse.created(res, payment, 'Payment created successfully');
    }
    catch (error) {
        logger_1.default.error('createPayment error', error);
        next(error);
    }
};
exports.createPayment = createPayment;
/**
 * Get payment by ID
 * GET /api/v1/payments/:paymentId
 */
const getPayment = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = payment_validators_1.paymentIdParamSchema.safeParse(req.params);
        if (!paramValidation.success) {
            response_1.ApiResponse.error(res, 'Invalid payment ID', 400);
            return;
        }
        const paymentId = getParam(req.params.paymentId);
        if (!paymentId) {
            response_1.ApiResponse.error(res, 'Payment ID is required', 400);
            return;
        }
        const payment = await payment_service_1.paymentService.getPayment(ctx, paymentId);
        response_1.ApiResponse.success(res, payment, 'Payment retrieved successfully');
    }
    catch (error) {
        logger_1.default.error('getPayment error', error);
        next(error);
    }
};
exports.getPayment = getPayment;
/**
 * List payments with pagination, filtering, and search
 * GET /api/v1/payments
 */
const listPayments = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const validation = payment_validators_1.listPaymentsSchema.safeParse(req.query);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const result = await payment_service_1.paymentService.listPayments(ctx, validation.data);
        response_1.ApiResponse.success(res, result, 'Payments retrieved successfully');
    }
    catch (error) {
        logger_1.default.error('listPayments error', error);
        next(error);
    }
};
exports.listPayments = listPayments;
/**
 * Update payment
 * PUT /api/v1/payments/:paymentId
 */
const updatePayment = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = payment_validators_1.paymentIdParamSchema.safeParse(req.params);
        if (!paramValidation.success) {
            response_1.ApiResponse.error(res, 'Invalid payment ID', 400);
            return;
        }
        const validation = payment_validators_1.updatePaymentSchema.safeParse(req.body);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const paymentId = getParam(req.params.paymentId);
        if (!paymentId) {
            response_1.ApiResponse.error(res, 'Payment ID is required', 400);
            return;
        }
        const input = {
            ...validation.data,
            paymentDate: validation.data.paymentDate ? new Date(validation.data.paymentDate) : undefined,
            dueDate: validation.data.dueDate ? new Date(validation.data.dueDate) : undefined,
        };
        const payment = await payment_service_1.paymentService.updatePayment(ctx, paymentId, input);
        response_1.ApiResponse.success(res, payment, 'Payment updated successfully');
    }
    catch (error) {
        logger_1.default.error('updatePayment error', error);
        next(error);
    }
};
exports.updatePayment = updatePayment;
/**
 * Mark payment as paid
 * PATCH /api/v1/payments/:paymentId/mark-as-paid
 */
const markAsPaid = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = payment_validators_1.paymentIdParamSchema.safeParse(req.params);
        if (!paramValidation.success) {
            response_1.ApiResponse.error(res, 'Invalid payment ID', 400);
            return;
        }
        const validation = payment_validators_1.markAsPaidSchema.safeParse(req.body);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const paymentId = getParam(req.params.paymentId);
        if (!paymentId) {
            response_1.ApiResponse.error(res, 'Payment ID is required', 400);
            return;
        }
        const payment = await payment_service_1.paymentService.markAsPaid(ctx, paymentId, validation.data.paidAmount);
        response_1.ApiResponse.success(res, payment, 'Payment marked as paid');
    }
    catch (error) {
        logger_1.default.error('markAsPaid error', error);
        next(error);
    }
};
exports.markAsPaid = markAsPaid;
/**
 * Mark payment as overdue
 * PATCH /api/v1/payments/:paymentId/mark-as-overdue
 */
const markAsOverdue = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = payment_validators_1.paymentIdParamSchema.safeParse(req.params);
        if (!paramValidation.success) {
            response_1.ApiResponse.error(res, 'Invalid payment ID', 400);
            return;
        }
        const validation = payment_validators_1.markAsOverdueSchema.safeParse(req.body);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const paymentId = getParam(req.params.paymentId);
        if (!paymentId) {
            response_1.ApiResponse.error(res, 'Payment ID is required', 400);
            return;
        }
        const payment = await payment_service_1.paymentService.markAsOverdue(ctx, paymentId);
        response_1.ApiResponse.success(res, payment, 'Payment marked as overdue');
    }
    catch (error) {
        logger_1.default.error('markAsOverdue error', error);
        next(error);
    }
};
exports.markAsOverdue = markAsOverdue;
/**
 * Refund payment
 * PATCH /api/v1/payments/:paymentId/refund
 */
const refundPayment = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = payment_validators_1.paymentIdParamSchema.safeParse(req.params);
        if (!paramValidation.success) {
            response_1.ApiResponse.error(res, 'Invalid payment ID', 400);
            return;
        }
        const validation = payment_validators_1.refundPaymentSchema.safeParse(req.body);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const paymentId = getParam(req.params.paymentId);
        if (!paymentId) {
            response_1.ApiResponse.error(res, 'Payment ID is required', 400);
            return;
        }
        const payment = await payment_service_1.paymentService.refundPayment(ctx, paymentId, validation.data.refundAmount);
        response_1.ApiResponse.success(res, payment, 'Payment refunded successfully');
    }
    catch (error) {
        logger_1.default.error('refundPayment error', error);
        next(error);
    }
};
exports.refundPayment = refundPayment;
/**
 * Generate receipt
 * POST /api/v1/payments/:paymentId/generate-receipt
 */
const generateReceipt = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = payment_validators_1.paymentIdParamSchema.safeParse(req.params);
        if (!paramValidation.success) {
            response_1.ApiResponse.error(res, 'Invalid payment ID', 400);
            return;
        }
        const validation = payment_validators_1.generateReceiptSchema.safeParse(req.body);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const paymentId = getParam(req.params.paymentId);
        if (!paymentId) {
            response_1.ApiResponse.error(res, 'Payment ID is required', 400);
            return;
        }
        const receiptNumber = await payment_service_1.paymentService.generateReceipt(ctx, paymentId);
        response_1.ApiResponse.success(res, { receiptNumber }, 'Receipt generated successfully');
    }
    catch (error) {
        logger_1.default.error('generateReceipt error', error);
        next(error);
    }
};
exports.generateReceipt = generateReceipt;
/**
 * Delete payment (soft delete)
 * DELETE /api/v1/payments/:paymentId
 */
const deletePayment = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = payment_validators_1.paymentIdParamSchema.safeParse(req.params);
        if (!paramValidation.success) {
            response_1.ApiResponse.error(res, 'Invalid payment ID', 400);
            return;
        }
        const paymentId = getParam(req.params.paymentId);
        if (!paymentId) {
            response_1.ApiResponse.error(res, 'Payment ID is required', 400);
            return;
        }
        const payment = await payment_service_1.paymentService.deletePayment(ctx, paymentId);
        response_1.ApiResponse.success(res, payment, 'Payment deleted successfully');
    }
    catch (error) {
        logger_1.default.error('deletePayment error', error);
        next(error);
    }
};
exports.deletePayment = deletePayment;
/**
 * Restore payment
 * PATCH /api/v1/payments/:paymentId/restore
 */
const restorePayment = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = payment_validators_1.paymentIdParamSchema.safeParse(req.params);
        if (!paramValidation.success) {
            response_1.ApiResponse.error(res, 'Invalid payment ID', 400);
            return;
        }
        const paymentId = getParam(req.params.paymentId);
        if (!paymentId) {
            response_1.ApiResponse.error(res, 'Payment ID is required', 400);
            return;
        }
        const payment = await payment_service_1.paymentService.restorePayment(ctx, paymentId);
        response_1.ApiResponse.success(res, payment, 'Payment restored successfully');
    }
    catch (error) {
        logger_1.default.error('restorePayment error', error);
        next(error);
    }
};
exports.restorePayment = restorePayment;
/**
 * Get organization payment statistics
 * GET /api/v1/payments/stats/organization
 */
const getOrganizationStatistics = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const stats = await payment_service_1.paymentService.getOrganizationStatistics(ctx);
        response_1.ApiResponse.success(res, stats, 'Organization statistics retrieved successfully');
    }
    catch (error) {
        logger_1.default.error('getOrganizationStatistics error', error);
        next(error);
    }
};
exports.getOrganizationStatistics = getOrganizationStatistics;
/**
 * Get lease payment statistics
 * GET /api/v1/leases/:leaseId/payments/stats
 */
const getLeaseStatistics = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = payment_validators_1.leaseIdParamSchema.safeParse(req.params);
        if (!paramValidation.success) {
            response_1.ApiResponse.error(res, 'Invalid lease ID', 400);
            return;
        }
        const leaseId = getParam(req.params.leaseId);
        if (!leaseId) {
            response_1.ApiResponse.error(res, 'Lease ID is required', 400);
            return;
        }
        const stats = await payment_service_1.paymentService.getLeaseStatistics(ctx, leaseId);
        response_1.ApiResponse.success(res, stats, 'Lease payment statistics retrieved successfully');
    }
    catch (error) {
        logger_1.default.error('getLeaseStatistics error', error);
        next(error);
    }
};
exports.getLeaseStatistics = getLeaseStatistics;
/**
 * Get tenant payment statistics
 * GET /api/v1/tenants/:tenantId/payments/stats
 */
const getTenantStatistics = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = payment_validators_1.tenantIdParamSchema.safeParse(req.params);
        if (!paramValidation.success) {
            response_1.ApiResponse.error(res, 'Invalid tenant ID', 400);
            return;
        }
        const tenantId = getParam(req.params.tenantId);
        if (!tenantId) {
            response_1.ApiResponse.error(res, 'Tenant ID is required', 400);
            return;
        }
        const stats = await payment_service_1.paymentService.getTenantStatistics(ctx, tenantId);
        response_1.ApiResponse.success(res, stats, 'Tenant payment statistics retrieved successfully');
    }
    catch (error) {
        logger_1.default.error('getTenantStatistics error', error);
        next(error);
    }
};
exports.getTenantStatistics = getTenantStatistics;
