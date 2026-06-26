// @ts-nocheck - Phase 1: Payment model deferred to Phase 2
import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../shared/core/response';
import logger from '../utils/logger';
import { createPaymentWithProvider } from '../services/payments/payment.service';

export const listPayments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { lease: { unit: { property: { organizationId: req.user!.organizationId } } } },
      include: { lease: true },
    });
    ApiResponse.success(res, payments, 'Payments retrieved successfully');
  } catch (error) {
    logger.error('listPayments error', error as Error);
    next(error);
  }
};

export const getPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const paymentId = req.params.paymentId as string;
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, lease: { unit: { property: { organizationId: req.user!.organizationId } } } },
      include: { lease: true },
    });

    if (!payment) {
      ApiResponse.error(res, 'Payment not found', 404);
      return;
    }

    ApiResponse.success(res, payment, 'Payment retrieved successfully');
  } catch (error) {
    logger.error('getPayment error', error as Error);
    next(error);
  }
};

export const createPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { leaseId, amount, paymentDate, status } = req.body;

    const lease = await prisma.lease.findFirst({
      where: { id: leaseId, unit: { property: { organizationId: req.user!.organizationId } } },
    });

    if (!lease) {
      ApiResponse.error(res, 'Lease not found', 404);
      return;
    }

    const payment = await prisma.payment.create({
      data: {
        leaseId,
        amount,
        paymentDate: new Date(paymentDate),
        status,
      },
    });

    ApiResponse.created(res, payment, 'Payment created successfully');
  } catch (error) {
    logger.error('createPayment error', error as Error);
    next(error);
  }
};

export const initiatePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { leaseId, amount, provider, metadata } = req.body; // provider: 'razorpay' | 'cashfree'

    if (!['razorpay', 'cashfree'].includes(provider)) {
      ApiResponse.error(res, 'Unsupported provider', 400);
      return;
    }

    const lease = await prisma.lease.findFirst({
      where: { id: leaseId, unit: { property: { organizationId: req.user!.organizationId } } },
    });

    if (!lease) {
      ApiResponse.error(res, 'Lease not found', 404);
      return;
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

      const providerPaymentId =
        providerResponse?.id ||
        providerResponse?.order_id ||
        providerResponse?.data?.order_id ||
        providerResponse?.order?.id;

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          providerPaymentId: providerPaymentId || undefined,
          providerResponse: providerResponse,
        },
      });

      ApiResponse.created(res, { paymentId: payment.id, providerResponse }, 'Payment initiated successfully');
    } catch (err: any) {
      logger.error('initiatePayment provider error', err as Error);
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', providerResponse: { error: String(err?.message || err) } as any },
      });
      ApiResponse.error(res, 'Failed to initiate payment', 500, { error: err?.message || err });
    }
  } catch (error) {
    logger.error('initiatePayment error', error as Error);
    next(error);
  }
};

export const updatePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const paymentId = req.params.paymentId as string;
    const { amount, paymentDate, status } = req.body;

    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, lease: { unit: { property: { organizationId: req.user!.organizationId } } } },
    });

    if (!payment) {
      ApiResponse.error(res, 'Payment not found', 404);
      return;
    }

    const updated = await prisma.payment.update({
      where: { id: paymentId as string },
      data: {
        amount: amount !== undefined ? amount : undefined,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        status,
      },
    });

    ApiResponse.success(res, updated, 'Payment updated successfully');
  } catch (error) {
    logger.error('updatePayment error', error as Error);
    next(error);
  }
};

export const deletePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const paymentId = req.params.paymentId as string;

    const deleted = await prisma.payment.deleteMany({
      where: { id: paymentId, lease: { unit: { property: { organizationId: req.user!.organizationId } } } },
    });

    if (deleted.count === 0) {
      ApiResponse.error(res, 'Payment not found', 404);
      return;
    }

    ApiResponse.success(res, null, 'Payment deleted successfully', 204);
  } catch (error) {
    logger.error('deletePayment error', error as Error);
    next(error);
  }
};
