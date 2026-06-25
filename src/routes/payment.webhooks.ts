// @ts-nocheck - Phase 1: Payment module deferred to Phase 2
import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import RazorpayAdapter from '../services/payments/razorpayAdapter';
import CashfreeAdapter from '../services/payments/cashfreeAdapter';

const razorpay = Router();
const cashfree = Router();

razorpay.post('/', async (req: Request, res: Response) => {
  try {
    const raw = req.body as Buffer;
    const signature = req.headers['x-razorpay-signature'] as string | undefined;
    const ok = RazorpayAdapter.verifyWebhookSignature(raw, signature);
    if (!ok) return res.status(400).json({ message: 'Invalid signature' });

    const payload = JSON.parse(raw.toString('utf8'));
    await RazorpayAdapter.handleWebhook(payload);
    res.json({ ok: true });
  } catch (err) {
    console.error('razorpay webhook error', err);
    res.status(500).json({ ok: false });
  }
});

cashfree.post('/', async (req: Request, res: Response) => {
  try {
    const raw = req.body as Buffer;
    const signature = req.headers['x-webhook-signature'] as string | undefined;
    const ok = CashfreeAdapter.verifyWebhookSignature(raw, signature);
    if (!ok) return res.status(400).json({ message: 'Invalid signature' });

    const payload = JSON.parse(raw.toString('utf8'));
    await CashfreeAdapter.handleWebhook(payload);
    res.json({ ok: true });
  } catch (err) {
    console.error('cashfree webhook error', err);
    res.status(500).json({ ok: false });
  }
});

export default { razorpay, cashfree };
