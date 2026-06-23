"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const razorpay_1 = __importDefault(require("razorpay"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
let razor = null;
const getRazorpayInstance = () => {
    if (!razor && KEY_ID) {
        razor = new razorpay_1.default({ key_id: KEY_ID, key_secret: KEY_SECRET });
    }
    return razor;
};
const RazorpayAdapter = {
    name: 'razorpay',
    async createPayment(opts) {
        const razor = getRazorpayInstance();
        if (!razor)
            throw new Error('Razorpay credentials not configured');
        const order = await razor.orders.create({
            amount: opts.amount,
            currency: opts.currency || 'INR',
            receipt: opts.receipt,
            notes: opts.metadata,
        });
        return order;
    },
    verifyWebhookSignature(rawBody, signatureHeader) {
        if (!signatureHeader)
            return false;
        const expected = crypto_1.default.createHmac('sha256', KEY_SECRET).update(rawBody).digest('hex');
        return expected === signatureHeader;
    },
    async handleWebhook(payload) {
        // Basic handling: update payment by provider payment id
        const event = payload.event || payload.payload?.payment?.entity ? payload.event : undefined;
        const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity || payload;
        const providerPaymentId = entity?.id || entity?.order_id || null;
        if (!providerPaymentId)
            return { ok: false };
        // Try to find and update payment record
        const payment = await prisma_1.default.payment.findFirst({ where: { providerPaymentId } });
        if (payment) {
            await prisma_1.default.payment.update({
                where: { id: payment.id },
                data: {
                    providerStatus: entity.status || payload?.event,
                    providerResponse: entity,
                },
            });
        }
        return { ok: true };
    },
};
exports.default = RazorpayAdapter;
