// @ts-nocheck - Phase 1: Tenant model deferred to Phase 2
import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../shared/core/response';
import logger from '../utils/logger';

export const listTenants = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const tenants = await prisma.tenant.findMany({
      where: { organizationId: req.user!.organizationId },
    });
    ApiResponse.success(res, tenants, 'Tenants retrieved successfully');
  } catch (error) {
    logger.error('listTenants error', error as Error);
    next(error);
  }
};

export const createTenant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone } = req.body;
    const tenant = await prisma.tenant.create({
      data: {
        name,
        email,
        phone,
        organizationId: req.user!.organizationId,
      },
    });
    ApiResponse.created(res, tenant, 'Tenant created successfully');
  } catch (error) {
    logger.error('createTenant error', error as Error);
    next(error);
  }
};
