import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../shared/core/response';
import {
  getOrganizationDataCounts,
  resetOrganizationData,
  seedDemoData,
} from '../services/dev-tools.service';

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
 * GET /api/v1/dev/data-summary
 */
export async function getDataSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const ctx = getActorContext(req);
    const counts = await getOrganizationDataCounts(ctx.organizationId);
    return ApiResponse.success(res, counts, 'Organization data summary retrieved');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/dev/seed
 */
export async function seedData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const ctx = getActorContext(req);
    const force = req.body?.force === true || req.query.force === 'true';
    const counts = await seedDemoData(ctx.organizationId, ctx.userId, { force });
    return ApiResponse.created(res, counts, 'Demo data seeded successfully');
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/v1/dev/reset
 */
export async function resetData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const ctx = getActorContext(req);
    const counts = await resetOrganizationData(ctx.organizationId);
    return ApiResponse.success(res, counts, 'Organization portfolio data reset successfully');
  } catch (error) {
    next(error);
  }
}
