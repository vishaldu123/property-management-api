import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { createPaymentWithProvider } from '../services/payments/payment.service';

export const listPayments = async (req: AuthenticatedRequest, res: Response) => {
  const payments = await prisma.payment.findMany({
    where: { lease: { unit: { property: { organizationId: req.user!.organizationId } } } },
    include: { lease: true },
  });
  res.json(payments);
};

export const getPayment = async (req: AuthenticatedRequest, res: Response) => {
  const { paymentId } = req.params;
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, lease: { unit: { property: { organizationId: req.user!.organizationId } } } },
    include: { lease: true },
  });

  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  res.json(payment);
};

export const createPayment = async (req: AuthenticatedRequest, res: Response) => {
  const { leaseId, amount, paymentDate, status } = req.body;

  const lease = await prisma.lease.findFirst({
    where: { id: leaseId, unit: { property: { organizationId: req.user!.organizationId } } },
  });

  if (!lease) {
    return res.status(404).json({ message: 'Lease not found' });
  }

  const payment = await prisma.payment.create({
    data: {
      leaseId,
      amount,
      paymentDate: new Date(paymentDate),
      status,
    },
  });

  res.status(201).json(payment);
};

export const initiatePayment = async (req: AuthenticatedRequest, res: Response) => {
  const { leaseId, amount, provider, metadata } = req.body; // provider: 'razorpay' | 'cashfree'

  if (!['razorpay', 'cashfree'].includes(provider)) {
    return res.status(400).json({ message: 'Unsupported provider' });
  }

  const lease = await prisma.lease.findFirst({
    where: { id: leaseId, unit: { property: { organizationId: req.user!.organizationId } } },
  });

  if (!lease) {
    return res.status(404).json({ message: 'Lease not found' });
  }

  // Create a local payment record with PENDING status
  const payment = await prisma.payment.create({
    data: {
      leaseId,
      amount,
      paymentDate: new Date(),
      status: 'PENDING',
      provider: provider,
    },
  });

  try {
    const providerResponse = await createPaymentWithProvider(provider, {
      amount: Number(amount) * 100, // convert to paise
      currency: 'INR',
      receipt: payment.id,
      metadata: { ...metadata, leaseId, paymentId: payment.id },
    });

    const providerPaymentId = providerResponse?.id || providerResponse?.order_id || providerResponse?.data?.order_id || providerResponse?.order?.id;

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: providerPaymentId || undefined,
        providerResponse: providerResponse,
      },
    });

    res.status(201).json({ paymentId: payment.id, providerResponse });
  } catch (err: any) {
    console.error('initiatePayment error', err);
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED', providerResponse: { error: String(err?.message || err) } as any } });
    res.status(500).json({ message: 'Failed to initiate payment', error: err?.message || err });
  }
};

export const updatePayment = async (req: AuthenticatedRequest, res: Response) => {
  const { paymentId } = req.params;
  const { amount, paymentDate, status } = req.body;

  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, lease: { unit: { property: { organizationId: req.user!.organizationId } } } },
  });

  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      amount: amount !== undefined ? amount : undefined,
      paymentDate: paymentDate ? new Date(paymentDate) : undefined,
      status,
    },
  });

  res.json(updated);
};

export const deletePayment = async (req: AuthenticatedRequest, res: Response) => {
  const { paymentId } = req.params;

  const deleted = await prisma.payment.deleteMany({
    where: { id: paymentId, lease: { unit: { property: { organizationId: req.user!.organizationId } } } },
  });

  if (deleted.count === 0) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  res.status(204).send();
};
