import { Response, NextFunction } from 'express';
import { propertyService, CreatePropertyInput, UpdatePropertyInput, ListPropertiesQuery } from '../services/property.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../shared/core/response';

/**
 * Get actor context from request
 */
function getActorContext(req: AuthenticatedRequest) {
  if (!req.user) {
    throw new Error('User context not found');
  }
  return {
    userId: req.user.userId,
    organizationId: req.user.organizationId,
  };
}

/**
 * Safely extract param as string
 */
function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) {
    return param[0];
  }
  return param || '';
}

/**
 * Create Property Endpoint
 * POST /api/v1/properties
 */
export async function createProperty(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const ctx = getActorContext(req);
    const input: CreatePropertyInput = req.body;

    const property = await propertyService.createProperty(ctx, input);

    return ApiResponse.created(res, property, 'Property created successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Update Property Endpoint
 * PUT /api/v1/properties/:id
 */
export async function updateProperty(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const ctx = getActorContext(req);
    const id = getParam(req.params.id);
    const input: UpdatePropertyInput = req.body;

    const property = await propertyService.updateProperty(ctx, id, input);

    return ApiResponse.success(res, property, 'Property updated successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Get Property Endpoint
 * GET /api/v1/properties/:id
 */
export async function getProperty(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const ctx = getActorContext(req);
    const id = getParam(req.params.id);

    const property = await propertyService.getProperty(ctx, id);

    return ApiResponse.success(res, property, 'Property retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * List Properties Endpoint
 * GET /api/v1/properties
 */
export async function listProperties(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const ctx = getActorContext(req);
    const query: ListPropertiesQuery = {
      page: req.query.page ? parseInt(getParam(req.query.page as any)) : undefined,
      limit: req.query.limit ? parseInt(getParam(req.query.limit as any)) : undefined,
      status: getParam(req.query.status as any) || undefined,
      propertyType: getParam(req.query.propertyType as any) || undefined,
      city: getParam(req.query.city as any) || undefined,
      country: getParam(req.query.country as any) || undefined,
      search: getParam(req.query.search as any) || undefined,
      sortBy: getParam(req.query.sortBy as any) || undefined,
      sortOrder: (getParam(req.query.sortOrder as any) || undefined) as 'asc' | 'desc' | undefined,
    };

    const result = await propertyService.listProperties(ctx, query);

    return ApiResponse.paginated(res, result.data, result.meta, 'Properties retrieved successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Delete Property Endpoint (Soft Delete)
 * DELETE /api/v1/properties/:id
 */
export async function deleteProperty(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const ctx = getActorContext(req);
    const id = getParam(req.params.id);

    const property = await propertyService.deleteProperty(ctx, id);

    return ApiResponse.success(res, property, 'Property deleted successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Restore Property Endpoint
 * PATCH /api/v1/properties/:id/restore
 */
export async function restoreProperty(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const ctx = getActorContext(req);
    const id = getParam(req.params.id);

    const property = await propertyService.restoreProperty(ctx, id);

    return ApiResponse.success(res, property, 'Property restored successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * Get Property Statistics Endpoint
 * GET /api/v1/properties/stats
 */
export async function getPropertyStatistics(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const ctx = getActorContext(req);

    const stats = await propertyService.getPropertyStatistics(ctx);

    return ApiResponse.success(res, stats, 'Property statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
}
