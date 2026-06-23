import axios from 'axios';
import crypto from 'crypto';
import { PaymentProvider, CreatePaymentOptions } from './gateway';
import prisma from '../../config/prisma';

const APP_ID = process.env.CASHFREE_APP_ID || '';
const SECRET = process.env.CASHFREE_SECRET || '';

const CashfreeAdapter: PaymentProvider = {
  name: 'cashfree',
  async createPayment(opts: CreatePaymentOptions) {
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

    const res = await axios.post('https://api.cashfree.com/pg/orders', payload, { headers });
    return res.data;
  },
  verifyWebhookSignature(rawBody: Buffer, signatureHeader: string | undefined) {
    if (!signatureHeader) return false;
    const expected = crypto.createHmac('sha256', SECRET).update(rawBody).digest('hex');
    return expected === signatureHeader;
  },
  async handleWebhook(payload: any) {
    const providerPaymentId = payload?.orderId || payload?.txStatusId || payload?.referenceId || null;
    if (!providerPaymentId) return { ok: false };

    const payment = await prisma.payment.findFirst({ where: { providerPaymentId } });
    if (payment) {
      await prisma.payment.update({
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

export default CashfreeAdapter;
