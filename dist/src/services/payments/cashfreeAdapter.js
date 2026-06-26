"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck - Phase 1: Payment model deferred to Phase 2
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const APP_ID = process.env.CASHFREE_APP_ID || '';
const SECRET = process.env.CASHFREE_SECRET || '';
const CashfreeAdapter = {
    name: 'cashfree',
    async createPayment(opts) {
        // Cashfree payment link / order creation - basic example using axios
        const payload = {
            order_amount: (opts.amount / 100).toFixed(2),
            order_currency: opts.currency || 'INR',
            order_note: opts.metadata?.note || 'Payment',
            order_id: opts.receipt,
            customer_details: {
                customer_id: opts.metadata?.customerId,
                customer_email: opts.metadata?.email,
                customer_phone: opts.metadata?.phone,
            },
        };
        const headers = {
            'x-client-id': APP_ID,
            'x-client-secret': SECRET,
            'Content-Type': 'application/json',
        };
        const res = await axios_1.default.post('https://api.cashfree.com/pg/orders', payload, { headers });
        return res.data;
    },
    verifyWebhookSignature(rawBody, signatureHeader) {
        if (!signatureHeader)
            return false;
        const expected = crypto_1.default.createHmac('sha256', SECRET).update(rawBody).digest('hex');
        return expected === signatureHeader;
    },
    async handleWebhook(payload) {
        const providerPaymentId = payload?.orderId || payload?.txStatusId || payload?.referenceId || null;
        if (!providerPaymentId)
            return { ok: false };
        const payment = await prisma_1.default.payment.findFirst({ where: { providerPaymentId } });
        if (payment) {
            await prisma_1.default.payment.update({
                where: { id: payment.id },
                data: {
                    providerStatus: payload?.orderStatus || payload?.txStatus || payload?.status,
                    providerResponse: payload,
                },
            });
        }
        return { ok: true };
    },
};
exports.default = CashfreeAdapter;
