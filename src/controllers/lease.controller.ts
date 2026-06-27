import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { leaseService } from '../services/lease.service';
import logger from '../utils/logger';
import { ApiResponse } from '../shared/core/response';
import {
  createLeaseSchema,
  updateLeaseSchema,
  listLeasesSchema,
  leaseIdSchema,
  renewLeaseSchema,
  terminateLeaseSchema,
} from '../validators/lease.validator';

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
 * Create a new lease
 * POST /api/v1/leases
 */
export const createLease = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const validation = createLeaseSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    // Parse dates
    const input = {
      ...validation.data,
      startDate: new Date(validation.data.startDate),
      endDate: new Date(validation.data.endDate),
      moveInDate: validation.data.moveInDate ? new Date(validation.data.moveInDate) : null,
      moveOutDate: validation.data.moveOutDate ? new Date(validation.data.moveOutDate) : null,
    };

    const lease = await leaseService.createLease(ctx, input);
    ApiResponse.created(res, lease, 'Lease created successfully');
  } catch (error) {
    logger.error('Create lease endpoint error', error as Error);
    next(error);
  }
};

/**
 * Get lease by ID
 * GET /api/v1/leases/:id
 */
export const getLease = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const validation = leaseIdSchema.safeParse(req.params);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const lease = await leaseService.getLease(ctx, validation.data.id);
    ApiResponse.success(res, lease, 'Lease retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Update lease
 * PUT /api/v1/leases/:id
 */
export const updateLease = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const paramsValidation = leaseIdSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      const errors = paramsValidation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const bodyValidation = updateLeaseSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      const errors = bodyValidation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    // Parse dates if provided
    const updateData: any = {
      ...bodyValidation.data,
    };

    if (bodyValidation.data.startDate) {
      updateData.startDate = new Date(bodyValidation.data.startDate);
    }
    if (bodyValidation.data.endDate) {
      updateData.endDate = new Date(bodyValidation.data.endDate);
    }
    if (bodyValidation.data.moveInDate) {
      updateData.moveInDate = new Date(bodyValidation.data.moveInDate);
    }
    if (bodyValidation.data.moveOutDate) {
      updateData.moveOutDate = new Date(bodyValidation.data.moveOutDate);
    }

    const lease = await leaseService.updateLease(ctx, paramsValidation.data.id, updateData);
    ApiResponse.success(res, lease, 'Lease updated');
  } catch (error) {
    next(error);
  }
};

/**
 * List leases
 * GET /api/v1/leases
 */
export const listLeases = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const validation = listLeasesSchema.safeParse(req.query);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const result = await leaseService.listLeases(ctx, validation.data);
    ApiResponse.paginated(res, result.data, result.meta, 'Leases retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete lease (soft delete)
 * DELETE /api/v1/leases/:id
 */
export const deleteLease = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const validation = leaseIdSchema.safeParse(req.params);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const lease = await leaseService.deleteLease(ctx, validation.data.id);
    ApiResponse.success(res, lease, 'Lease deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * Restore deleted lease
 * PATCH /api/v1/leases/:id/restore
 */
export const restoreLease = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const validation = leaseIdSchema.safeParse(req.params);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const lease = await leaseService.restoreLease(ctx, validation.data.id);
    ApiResponse.success(res, lease, 'Lease restored');
  } catch (error) {
    next(error);
  }
};

/**
 * Renew lease
 * POST /api/v1/leases/:id/renew
 */
export const renewLease = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const paramsValidation = leaseIdSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      const errors = paramsValidation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const bodyValidation = renewLeaseSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      const errors = bodyValidation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const renewalInput = {
      newStartDate: new Date(bodyValidation.data.newStartDate),
      newEndDate: new Date(bodyValidation.data.newEndDate),
    };

    const lease = await leaseService.renewLease(ctx, paramsValidation.data.id, renewalInput);
    ApiResponse.success(res, lease, 'Lease renewed');
  } catch (error) {
    next(error);
  }
};

/**
 * Terminate lease
 * POST /api/v1/leases/:id/terminate
 */
export const terminateLease = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);

    const paramsValidation = leaseIdSchema.safeParse(req.params);
    if (!paramsValidation.success) {
      const errors = paramsValidation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const bodyValidation = terminateLeaseSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      const errors = bodyValidation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const lease = await leaseService.terminateLease(
      ctx,
      paramsValidation.data.id,
      bodyValidation.data.reason
    );
    ApiResponse.success(res, lease, 'Lease terminated');
  } catch (error) {
    next(error);
  }
};

/**
 * Get organization lease statistics
 * GET /api/v1/leases/stats
 */
export const getOrganizationLeaseStatistics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = getActorContext(req);
    const stats = await leaseService.getOrganizationStatistics(ctx);
    ApiResponse.success(res, stats, 'Organization lease statistics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get unit lease statistics
 * GET /api/v1/units/:unitId/leases/stats
 */
export const getUnitLeaseStatistics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    const unitId = getParam(req.params.unitId);

    if (!unitId) {
      throw new Error('Unit ID is required');
    }

    const stats = await leaseService.getUnitStatistics(ctx, unitId);
    ApiResponse.success(res, stats, 'Unit lease statistics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get tenant lease statistics
 * GET /api/v1/tenants/:tenantId/leases/stats
 */
export const getTenantLeaseStatistics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    const tenantId = getParam(req.params.tenantId);

    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    const stats = await leaseService.getTenantStatistics(ctx, tenantId);
    ApiResponse.success(res, stats, 'Tenant lease statistics retrieved');
  } catch (error) {
    next(error);
  }
};
