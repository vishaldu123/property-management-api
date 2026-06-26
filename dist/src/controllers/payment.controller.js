"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePayment = exports.updatePayment = exports.initiatePayment = exports.createPayment = exports.getPayment = exports.listPayments = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const response_1 = require("../shared/core/response");
const logger_1 = __importDefault(require("../utils/logger"));
const payment_service_1 = require("../services/payments/payment.service");
const listPayments = async (req, res, next) => {
    try {
        const payments = await prisma_1.default.payment.findMany({
            where: { lease: { unit: { property: { organizationId: req.user.organizationId } } } },
            include: { lease: true },
        });
        response_1.ApiResponse.success(res, payments, 'Payments retrieved successfully');
    }
    catch (error) {
        logger_1.default.error('listPayments error', error);
        next(error);
    }
};
exports.listPayments = listPayments;
const getPayment = async (req, res, next) => {
    try {
        const paymentId = req.params.paymentId;
        const payment = await prisma_1.default.payment.findFirst({
            where: { id: paymentId, lease: { unit: { property: { organizationId: req.user.organizationId } } } },
            include: { lease: true },
        });
        if (!payment) {
            response_1.ApiResponse.error(res, 'Payment not found', 404);
            return;
        }
        response_1.ApiResponse.success(res, payment, 'Payment retrieved successfully');
    }
    catch (error) {
        logger_1.default.error('getPayment error', error);
        next(error);
    }
};
exports.getPayment = getPayment;
const createPayment = async (req, res, next) => {
    try {
        const { leaseId, amount, paymentDate, status } = req.body;
        const lease = await prisma_1.default.lease.findFirst({
            where: { id: leaseId, unit: { property: { organizationId: req.user.organizationId } } },
        });
        if (!lease) {
            response_1.ApiResponse.error(res, 'Lease not found', 404);
            return;
        }
        const payment = await prisma_1.default.payment.create({
            data: {
                leaseId,
                amount,
                paymentDate: new Date(paymentDate),
                status,
            },
        });
        response_1.ApiResponse.created(res, payment, 'Payment created successfully');
    }
    catch (error) {
        logger_1.default.error('createPayment error', error);
        next(error);
    }
};
exports.createPayment = createPayment;
const initiatePayment = async (req, res, next) => {
    try {
        const { leaseId, amount, provider, metadata } = req.body; // provider: 'razorpay' | 'cashfree'
        if (!['razorpay', 'cashfree'].includes(provider)) {
            response_1.ApiResponse.error(res, 'Unsupported provider', 400);
            return;
        }
        const lease = await prisma_1.default.lease.findFirst({
            where: { id: leaseId, unit: { property: { organizationId: req.user.organizationId } } },
        });
        if (!lease) {
            response_1.ApiResponse.error(res, 'Lease not found', 404);
            return;
        }
        // Create a local payment record with PENDING status
        const payment = await prisma_1.default.payment.create({
            data: {
                leaseId,
                amount,
                paymentDate: new Date(),
                status: 'PENDING',
                provider: provider,
            },
        });
        try {
            const providerResponse = await (0, payment_service_1.createPaymentWithProvider)(provider, {
                amount: Number(amount) * 100, // convert to paise
                currency: 'INR',
                receipt: payment.id,
                metadata: { ...metadata, leaseId, paymentId: payment.id },
            });
            const providerPaymentId = providerResponse?.id ||
                providerResponse?.order_id ||
                providerResponse?.data?.order_id ||
                providerResponse?.order?.id;
            await prisma_1.default.payment.update({
                where: { id: payment.id },
                data: {
                    providerPaymentId: providerPaymentId || undefined,
                    providerResponse: providerResponse,
                },
            });
            response_1.ApiResponse.created(res, { paymentId: payment.id, providerResponse }, 'Payment initiated successfully');
        }
        catch (err) {
            logger_1.default.error('initiatePayment provider error', err);
            await prisma_1.default.payment.update({
                where: { id: payment.id },
                data: { status: 'FAILED', providerResponse: { error: String(err?.message || err) } },
            });
            response_1.ApiResponse.error(res, 'Failed to initiate payment', 500, { error: err?.message || err });
        }
    }
    catch (error) {
        logger_1.default.error('initiatePayment error', error);
        next(error);
    }
};
exports.initiatePayment = initiatePayment;
const updatePayment = async (req, res, next) => {
    try {
        const paymentId = req.params.paymentId;
        const { amount, paymentDate, status } = req.body;
        const payment = await prisma_1.default.payment.findFirst({
            where: { id: paymentId, lease: { unit: { property: { organizationId: req.user.organizationId } } } },
        });
        if (!payment) {
            response_1.ApiResponse.error(res, 'Payment not found', 404);
            return;
        }
        const updated = await prisma_1.default.payment.update({
            where: { id: paymentId },
            data: {
                amount: amount !== undefined ? amount : undefined,
                paymentDate: paymentDate ? new Date(paymentDate) : undefined,
                status,
            },
        });
        response_1.ApiResponse.success(res, updated, 'Payment updated successfully');
    }
    catch (error) {
        logger_1.default.error('updatePayment error', error);
        next(error);
    }
};
exports.updatePayment = updatePayment;
const deletePayment = async (req, res, next) => {
    try {
        const paymentId = req.params.paymentId;
        const deleted = await prisma_1.default.payment.deleteMany({
            where: { id: paymentId, lease: { unit: { property: { organizationId: req.user.organizationId } } } },
        });
        if (deleted.count === 0) {
            response_1.ApiResponse.error(res, 'Payment not found', 404);
            return;
        }
        response_1.ApiResponse.success(res, null, 'Payment deleted successfully', 204);
    }
    catch (error) {
        logger_1.default.error('deletePayment error', error);
        next(error);
    }
};
exports.deletePayment = deletePayment;
