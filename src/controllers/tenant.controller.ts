import { Request, Response, NextFunction } from 'express';
import { tenantService } from '../services/tenant.service';
import { ApiResponse } from '../shared/core/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * Get actor context from authenticated request
 */
function getActorContext(req: AuthenticatedRequest) {
  if (!req.user) {
    throw new Error('User not authenticated');
  }
  return {
    userId: req.user.userId,
    organizationId: req.user.organizationId,
  };
}

/**
 * Safely extract parameter value (Express may return string or string[])
 */
function getParam(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) {
    return param[0];
  }
  return param;
}

/**
 * Create a new tenant
 * POST /api/v1/tenants
 */
export const createTenant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    const result = await tenantService.createTenant(ctx, req.body);
    return ApiResponse.created(res, result, 'Tenant created');
  } catch (error) {
    next(error);
  }
};

/**
 * Get tenant by ID
 * GET /api/v1/tenants/:id
 */
export const getTenant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    const id = getParam(req.params.id);
    if (!id) {
      throw new Error('Tenant ID is required');
    }
    const result = await tenantService.getTenant(ctx, id);
    return ApiResponse.success(res, result, 'Tenant retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Update tenant
 * PUT /api/v1/tenants/:id
 */
export const updateTenant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    const id = getParam(req.params.id);
    if (!id) {
      throw new Error('Tenant ID is required');
    }
    const result = await tenantService.updateTenant(ctx, id, req.body);
    return ApiResponse.success(res, result, 'Tenant updated');
  } catch (error) {
    next(error);
  }
};

/**
 * List tenants with search, filtering, and pagination
 * GET /api/v1/tenants
 */
export const listTenants = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    
    const page = parseInt(getParam(req.query.page as any) || '1');
    const limit = parseInt(getParam(req.query.limit as any) || '20');

    const result = await tenantService.listTenants(ctx, {
      page,
      limit,
      unitId: getParam(req.query.unitId as any),
      status: getParam(req.query.status as any),
      sortBy: getParam(req.query.sortBy as any),
      sortOrder: (getParam(req.query.sortOrder as any) as 'asc' | 'desc') || undefined,
      search: getParam(req.query.search as any),
    });

    return ApiResponse.paginated(res, result.data, result.meta, 'Tenants retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete tenant (soft delete)
 * DELETE /api/v1/tenants/:id
 */
export const deleteTenant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    const id = getParam(req.params.id);
    if (!id) {
      throw new Error('Tenant ID is required');
    }
    await tenantService.deleteTenant(ctx, id);
    return ApiResponse.success(res, {}, 'Tenant deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * Restore deleted tenant
 * PATCH /api/v1/tenants/:id/restore
 */
export const restoreTenant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    const id = getParam(req.params.id);
    if (!id) {
      throw new Error('Tenant ID is required');
    }
    const result = await tenantService.restoreTenant(ctx, id);
    return ApiResponse.success(res, result, 'Tenant restored');
  } catch (error) {
    next(error);
  }
};

/**
 * Get organization tenant statistics
 * GET /api/v1/tenants/stats
 */
export const getOrganizationTenantStatistics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    const result = await tenantService.getOrganizationStatistics(ctx);
    return ApiResponse.success(res, result, 'Organization tenant statistics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get unit tenant statistics
 * GET /api/v1/units/:unitId/tenants/stats
 */
export const getUnitTenantStatistics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    const unitId = getParam(req.params.unitId);
    if (!unitId) {
      throw new Error('Unit ID is required');
    }
    const result = await tenantService.getUnitStatistics(ctx, unitId);
    return ApiResponse.success(res, result, 'Unit tenant statistics retrieved');
  } catch (error) {
    next(error);
  }
};
