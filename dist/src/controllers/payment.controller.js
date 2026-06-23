"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePayment = exports.updatePayment = exports.initiatePayment = exports.createPayment = exports.getPayment = exports.listPayments = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const payment_service_1 = require("../services/payments/payment.service");
const listPayments = async (req, res) => {
    const payments = await prisma_1.default.payment.findMany({
        where: { lease: { unit: { property: { organizationId: req.user.organizationId } } } },
        include: { lease: true },
    });
    res.json(payments);
};
exports.listPayments = listPayments;
const getPayment = async (req, res) => {
    const paymentId = req.params.paymentId;
    const payment = await prisma_1.default.payment.findFirst({
        where: { id: paymentId, lease: { unit: { property: { organizationId: req.user.organizationId } } } },
        include: { lease: true },
    });
    if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
};
exports.getPayment = getPayment;
const createPayment = async (req, res) => {
    const { leaseId, amount, paymentDate, status } = req.body;
    const lease = await prisma_1.default.lease.findFirst({
        where: { id: leaseId, unit: { property: { organizationId: req.user.organizationId } } },
    });
    if (!lease) {
        return res.status(404).json({ message: 'Lease not found' });
    }
    const payment = await prisma_1.default.payment.create({
        data: {
            leaseId,
            amount,
            paymentDate: new Date(paymentDate),
            status,
        },
    });
    res.status(201).json(payment);
};
exports.createPayment = createPayment;
const initiatePayment = async (req, res) => {
    const { leaseId, amount, provider, metadata } = req.body; // provider: 'razorpay' | 'cashfree'
    if (!['razorpay', 'cashfree'].includes(provider)) {
        return res.status(400).json({ message: 'Unsupported provider' });
    }
    const lease = await prisma_1.default.lease.findFirst({
        where: { id: leaseId, unit: { property: { organizationId: req.user.organizationId } } },
    });
    if (!lease) {
        return res.status(404).json({ message: 'Lease not found' });
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
        const providerPaymentId = providerResponse?.id || providerResponse?.order_id || providerResponse?.data?.order_id || providerResponse?.order?.id;
        await prisma_1.default.payment.update({
            where: { id: payment.id },
            data: {
                providerPaymentId: providerPaymentId || undefined,
                providerResponse: providerResponse,
            },
        });
        res.status(201).json({ paymentId: payment.id, providerResponse });
    }
    catch (err) {
        console.error('initiatePayment error', err);
        await prisma_1.default.payment.update({ where: { id: payment.id }, data: { status: 'FAILED', providerResponse: { error: String(err?.message || err) } } });
        res.status(500).json({ message: 'Failed to initiate payment', error: err?.message || err });
    }
};
exports.initiatePayment = initiatePayment;
const updatePayment = async (req, res) => {
    const paymentId = req.params.paymentId;
    const { amount, paymentDate, status } = req.body;
    const payment = await prisma_1.default.payment.findFirst({
        where: { id: paymentId, lease: { unit: { property: { organizationId: req.user.organizationId } } } },
    });
    if (!payment) {
        return res.status(404).json({ message: 'Payment not found' });
    }
    const updated = await prisma_1.default.payment.update({
        where: { id: paymentId },
        data: {
            amount: amount !== undefined ? amount : undefined,
            paymentDate: paymentDate ? new Date(paymentDate) : undefined,
            status,
        },
    });
    res.json(updated);
};
exports.updatePayment = updatePayment;
const deletePayment = async (req, res) => {
    const paymentId = req.params.paymentId;
    const deleted = await prisma_1.default.payment.deleteMany({
        where: { id: paymentId, lease: { unit: { property: { organizationId: req.user.organizationId } } } },
    });
    if (deleted.count === 0) {
        return res.status(404).json({ message: 'Payment not found' });
    }
    res.status(204).send();
};
exports.deletePayment = deletePayment;
