import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { paymentService } from '../services/payment.service';
import { ApiResponse } from '../shared/core/response';
import logger from '../utils/logger';
import {
  createPaymentSchema,
  updatePaymentSchema,
  listPaymentsSchema,
  paymentIdParamSchema,
  markAsPaidSchema,
  markAsOverdueSchema,
  refundPaymentSchema,
  generateReceiptSchema,
  leaseIdParamSchema,
  tenantIdParamSchema,
} from '../validators/payment.validators';

/**
 * Helper function to extract actor context from request
 */
function getActorContext(req: AuthenticatedRequest) {
  return {
    userId: req.user?.userId || '',
    organizationId: req.user?.organizationId || '',
  };
}

/**
 * Helper function to safely extract parameter
 */
function getParam(param: any): string | undefined {
  return typeof param === 'string' ? param : undefined;
}

/**
 * Create a new payment
 * POST /api/v1/payments
 */
export const createPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const validation = createPaymentSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
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

    const payment = await paymentService.createPayment(ctx, input as any);
    ApiResponse.created(res, payment, 'Payment created successfully');
  } catch (error) {
    logger.error('createPayment error', error as Error);
    next(error);
  }
};

/**
 * Get payment by ID
 * GET /api/v1/payments/:paymentId
 */
export const getPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = paymentIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      ApiResponse.error(res, 'Invalid payment ID', 400);
      return;
    }

    const paymentId = getParam(req.params.paymentId);
    if (!paymentId) {
      ApiResponse.error(res, 'Payment ID is required', 400);
      return;
    }

    const payment = await paymentService.getPayment(ctx, paymentId);
    ApiResponse.success(res, payment, 'Payment retrieved successfully');
  } catch (error) {
    logger.error('getPayment error', error as Error);
    next(error);
  }
};

/**
 * List payments with pagination, filtering, and search
 * GET /api/v1/payments
 */
export const listPayments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const validation = listPaymentsSchema.safeParse(req.query);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const result = await paymentService.listPayments(ctx, validation.data as any);
    ApiResponse.success(res, result, 'Payments retrieved successfully');
  } catch (error) {
    logger.error('listPayments error', error as Error);
    next(error);
  }
};

/**
 * Update payment
 * PUT /api/v1/payments/:paymentId
 */
export const updatePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = paymentIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      ApiResponse.error(res, 'Invalid payment ID', 400);
      return;
    }

    const validation = updatePaymentSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const paymentId = getParam(req.params.paymentId);
    if (!paymentId) {
      ApiResponse.error(res, 'Payment ID is required', 400);
      return;
    }

    const input = {
      ...validation.data,
      paymentDate: validation.data.paymentDate ? new Date(validation.data.paymentDate) : undefined,
      dueDate: validation.data.dueDate ? new Date(validation.data.dueDate) : undefined,
    };

    const payment = await paymentService.updatePayment(ctx, paymentId, input as any);
    ApiResponse.success(res, payment, 'Payment updated successfully');
  } catch (error) {
    logger.error('updatePayment error', error as Error);
    next(error);
  }
};

/**
 * Mark payment as paid
 * PATCH /api/v1/payments/:paymentId/mark-as-paid
 */
export const markAsPaid = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = paymentIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      ApiResponse.error(res, 'Invalid payment ID', 400);
      return;
    }

    const validation = markAsPaidSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const paymentId = getParam(req.params.paymentId);
    if (!paymentId) {
      ApiResponse.error(res, 'Payment ID is required', 400);
      return;
    }

    const payment = await paymentService.markAsPaid(ctx, paymentId, validation.data.paidAmount);
    ApiResponse.success(res, payment, 'Payment marked as paid');
  } catch (error) {
    logger.error('markAsPaid error', error as Error);
    next(error);
  }
};

/**
 * Mark payment as overdue
 * PATCH /api/v1/payments/:paymentId/mark-as-overdue
 */
export const markAsOverdue = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = paymentIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      ApiResponse.error(res, 'Invalid payment ID', 400);
      return;
    }

    const validation = markAsOverdueSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const paymentId = getParam(req.params.paymentId);
    if (!paymentId) {
      ApiResponse.error(res, 'Payment ID is required', 400);
      return;
    }

    const payment = await paymentService.markAsOverdue(ctx, paymentId);
    ApiResponse.success(res, payment, 'Payment marked as overdue');
  } catch (error) {
    logger.error('markAsOverdue error', error as Error);
    next(error);
  }
};

/**
 * Refund payment
 * PATCH /api/v1/payments/:paymentId/refund
 */
export const refundPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = paymentIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      ApiResponse.error(res, 'Invalid payment ID', 400);
      return;
    }

    const validation = refundPaymentSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const paymentId = getParam(req.params.paymentId);
    if (!paymentId) {
      ApiResponse.error(res, 'Payment ID is required', 400);
      return;
    }

    const payment = await paymentService.refundPayment(ctx, paymentId, validation.data.refundAmount);
    ApiResponse.success(res, payment, 'Payment refunded successfully');
  } catch (error) {
    logger.error('refundPayment error', error as Error);
    next(error);
  }
};

/**
 * Generate receipt
 * POST /api/v1/payments/:paymentId/generate-receipt
 */
export const generateReceipt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = paymentIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      ApiResponse.error(res, 'Invalid payment ID', 400);
      return;
    }

    const validation = generateReceiptSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const paymentId = getParam(req.params.paymentId);
    if (!paymentId) {
      ApiResponse.error(res, 'Payment ID is required', 400);
      return;
    }

    const receiptNumber = await paymentService.generateReceipt(ctx, paymentId);
    ApiResponse.success(res, { receiptNumber }, 'Receipt generated successfully');
  } catch (error) {
    logger.error('generateReceipt error', error as Error);
    next(error);
  }
};

/**
 * Delete payment (soft delete)
 * DELETE /api/v1/payments/:paymentId
 */
export const deletePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = paymentIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      ApiResponse.error(res, 'Invalid payment ID', 400);
      return;
    }

    const paymentId = getParam(req.params.paymentId);
    if (!paymentId) {
      ApiResponse.error(res, 'Payment ID is required', 400);
      return;
    }

    const payment = await paymentService.deletePayment(ctx, paymentId);
    ApiResponse.success(res, payment, 'Payment deleted successfully');
  } catch (error) {
    logger.error('deletePayment error', error as Error);
    next(error);
  }
};

/**
 * Restore payment
 * PATCH /api/v1/payments/:paymentId/restore
 */
export const restorePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = paymentIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      ApiResponse.error(res, 'Invalid payment ID', 400);
      return;
    }

    const paymentId = getParam(req.params.paymentId);
    if (!paymentId) {
      ApiResponse.error(res, 'Payment ID is required', 400);
      return;
    }

    const payment = await paymentService.restorePayment(ctx, paymentId);
    ApiResponse.success(res, payment, 'Payment restored successfully');
  } catch (error) {
    logger.error('restorePayment error', error as Error);
    next(error);
  }
};

/**
 * Get organization payment statistics
 * GET /api/v1/payments/stats/organization
 */
export const getOrganizationStatistics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = getActorContext(req);
    const stats = await paymentService.getOrganizationStatistics(ctx);
    ApiResponse.success(res, stats, 'Organization statistics retrieved successfully');
  } catch (error) {
    logger.error('getOrganizationStatistics error', error as Error);
    next(error);
  }
};

/**
 * Get lease payment statistics
 * GET /api/v1/leases/:leaseId/payments/stats
 */
export const getLeaseStatistics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = leaseIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      ApiResponse.error(res, 'Invalid lease ID', 400);
      return;
    }

    const leaseId = getParam(req.params.leaseId);
    if (!leaseId) {
      ApiResponse.error(res, 'Lease ID is required', 400);
      return;
    }

    const stats = await paymentService.getLeaseStatistics(ctx, leaseId);
    ApiResponse.success(res, stats, 'Lease payment statistics retrieved successfully');
  } catch (error) {
    logger.error('getLeaseStatistics error', error as Error);
    next(error);
  }
};

/**
 * Get tenant payment statistics
 * GET /api/v1/tenants/:tenantId/payments/stats
 */
export const getTenantStatistics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const paramValidation = tenantIdParamSchema.safeParse(req.params);
    if (!paramValidation.success) {
      ApiResponse.error(res, 'Invalid tenant ID', 400);
      return;
    }

    const tenantId = getParam(req.params.tenantId);
    if (!tenantId) {
      ApiResponse.error(res, 'Tenant ID is required', 400);
      return;
    }

    const stats = await paymentService.getTenantStatistics(ctx, tenantId);
    ApiResponse.success(res, stats, 'Tenant payment statistics retrieved successfully');
  } catch (error) {
    logger.error('getTenantStatistics error', error as Error);
    next(error);
  }
};
