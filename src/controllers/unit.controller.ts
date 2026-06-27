import { Request, Response, NextFunction } from 'express';
import { unitService } from '../services/unit.service';
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
 * Create a new unit
 * POST /api/v1/units
 */
export const createUnit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    const result = await unitService.createUnit(ctx, req.body);
    return ApiResponse.created(res, result, 'Unit created');
  } catch (error) {
    next(error);
  }
};

/**
 * Get unit by ID
 * GET /api/v1/units/:id
 */
export const getUnit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    const id = getParam(req.params.id);
    if (!id) {
      throw new Error('Unit ID is required');
    }
    const result = await unitService.getUnit(ctx, id);
    return ApiResponse.success(res, result, 'Unit retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Update unit
 * PUT /api/v1/units/:id
 */
export const updateUnit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    const id = getParam(req.params.id);
    if (!id) {
      throw new Error('Unit ID is required');
    }
    const result = await unitService.updateUnit(ctx, id, req.body);
    return ApiResponse.success(res, result, 'Unit updated');
  } catch (error) {
    next(error);
  }
};

/**
 * List units with search, filtering, and pagination
 * GET /api/v1/units
 */
export const listUnits = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    
    const page = parseInt(getParam(req.query.page as any) || '1');
    const limit = parseInt(getParam(req.query.limit as any) || '20');

    const result = await unitService.listUnits(ctx, {
      page,
      limit,
      propertyId: getParam(req.query.propertyId as any),
      status: getParam(req.query.status as any),
      unitType: getParam(req.query.unitType as any),
      floor: req.query.floor ? parseInt(getParam(req.query.floor as any) || '0') : undefined,
      block: getParam(req.query.block as any),
      sortBy: getParam(req.query.sortBy as any),
      sortOrder: (getParam(req.query.sortOrder as any) as 'asc' | 'desc') || undefined,
      search: getParam(req.query.search as any),
    });

    return ApiResponse.paginated(res, result.data, result.meta, 'Units retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete unit (soft delete)
 * DELETE /api/v1/units/:id
 */
export const deleteUnit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    const id = getParam(req.params.id);
    if (!id) {
      throw new Error('Unit ID is required');
    }
    await unitService.deleteUnit(ctx, id);
    return ApiResponse.success(res, null, 'Unit deleted');
  } catch (error) {
    next(error);
  }
};

/**
 * Restore deleted unit
 * PATCH /api/v1/units/:id/restore
 */
export const restoreUnit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    const id = getParam(req.params.id);
    if (!id) {
      throw new Error('Unit ID is required');
    }
    const result = await unitService.restoreUnit(ctx, id);
    return ApiResponse.success(res, result, 'Unit restored');
  } catch (error) {
    next(error);
  }
};

/**
 * Get property unit statistics
 * GET /api/v1/properties/:propertyId/units/stats
 */
export const getPropertyUnitStatistics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    const propertyId = getParam(req.params.propertyId);
    if (!propertyId) {
      throw new Error('Property ID is required');
    }
    const result = await unitService.getPropertyStatistics(ctx, propertyId);
    return ApiResponse.success(res, result, 'Property unit statistics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get organization unit statistics
 * GET /api/v1/units/stats
 */
export const getOrganizationUnitStatistics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ctx = getActorContext(req);
    const result = await unitService.getOrganizationStatistics(ctx);
    return ApiResponse.success(res, result, 'Organization unit statistics retrieved');
  } catch (error) {
    next(error);
  }
};
