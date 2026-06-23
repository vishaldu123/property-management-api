import Razorpay from 'razorpay';
import crypto from 'crypto';
import { PaymentProvider, CreatePaymentOptions } from './gateway';
import prisma from '../../config/prisma';

const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

let razor: any = null;

const getRazorpayInstance = () => {
  if (!razor && KEY_ID) {
    razor = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
  }
  return razor;
};

const RazorpayAdapter: PaymentProvider = {
  name: 'razorpay',
  async createPayment(opts: CreatePaymentOptions) {
    const razor = getRazorpayInstance();
    if (!razor) throw new Error('Razorpay credentials not configured');
    const order = await razor.orders.create({
      amount: opts.amount,
      currency: opts.currency || 'INR',
      receipt: opts.receipt,
      notes: opts.metadata,
    });
    return order;
  },
  verifyWebhookSignature(rawBody: Buffer, signatureHeader: string | undefined) {
    if (!signatureHeader) return false;
    const expected = crypto.createHmac('sha256', KEY_SECRET).update(rawBody).digest('hex');
    return expected === signatureHeader;
  },
  async handleWebhook(payload: any) {
    // Basic handling: update payment by provider payment id
    const event = payload.event || payload.payload?.payment?.entity ? payload.event : undefined;
    const entity = payload.payload?.payment?.entity || payload.payload?.order?.entity || payload;
    const providerPaymentId = entity?.id || entity?.order_id || null;

    if (!providerPaymentId) return { ok: false };

    // Try to find and update payment record
    const payment = await prisma.payment.findFirst({ where: { providerPaymentId } });
    if (payment) {
      await prisma.payment.update({
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

export default RazorpayAdapter;
