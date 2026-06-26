// @ts-nocheck - Phase 1: Lease model deferred to Phase 2
import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../shared/core/response';
import logger from '../utils/logger';

export const listLeases = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const leases = await prisma.lease.findMany({
      where: { unit: { property: { organizationId: req.user!.organizationId } } },
      include: { unit: true, tenant: true, payments: true },
    });
    ApiResponse.success(res, leases, 'Leases retrieved successfully');
  } catch (error) {
    logger.error('listLeases error', error as Error);
    next(error);
  }
};

export const getLease = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const leaseId = req.params.leaseId as string;
    const lease = await prisma.lease.findFirst({
      where: { id: leaseId, unit: { property: { organizationId: req.user!.organizationId } } },
      include: { unit: true, tenant: true, payments: true },
    });

    if (!lease) {
      ApiResponse.error(res, 'Lease not found', 404);
      return;
    }

    ApiResponse.success(res, lease, 'Lease retrieved successfully');
  } catch (error) {
    logger.error('getLease error', error as Error);
    next(error);
  }
};

export const createLease = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { unitId, tenantId, startDate, endDate, monthlyRent } = req.body;

    const unit = await prisma.unit.findFirst({
      where: { id: unitId, property: { organizationId: req.user!.organizationId } },
    });
    if (!unit) {
      ApiResponse.error(res, 'Unit not found', 404);
      return;
    }

    const tenant = await prisma.tenant.findFirst({
      where: { id: tenantId, organizationId: req.user!.organizationId },
    });
    if (!tenant) {
      ApiResponse.error(res, 'Tenant not found', 404);
      return;
    }

    const lease = await prisma.lease.create({
      data: {
        unit: { connect: { id: unitId } },
        tenant: { connect: { id: tenantId } },
        Organization: { connect: { id: req.user!.organizationId } },
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        monthlyRent,
      },
    });

    ApiResponse.created(res, lease, 'Lease created successfully');
  } catch (error) {
    logger.error('createLease error', error as Error);
    next(error);
  }
};

export const updateLease = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const leaseId = req.params.leaseId as string;
    const { startDate, endDate, monthlyRent } = req.body;

    const lease = await prisma.lease.findFirst({
      where: { id: leaseId, unit: { property: { organizationId: req.user!.organizationId } } },
    });
    if (!lease) {
      ApiResponse.error(res, 'Lease not found', 404);
      return;
    }

    const updated = await prisma.lease.update({
      where: { id: leaseId as string },
      data: {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        monthlyRent: monthlyRent !== undefined ? monthlyRent : undefined,
      },
    });

    ApiResponse.success(res, updated, 'Lease updated successfully');
  } catch (error) {
    logger.error('updateLease error', error as Error);
    next(error);
  }
};

export const deleteLease = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const leaseId = req.params.leaseId as string;

    const deleted = await prisma.lease.deleteMany({
      where: { id: leaseId, unit: { property: { organizationId: req.user!.organizationId } } },
    });

    if (deleted.count === 0) {
      ApiResponse.error(res, 'Lease not found', 404);
      return;
    }

    ApiResponse.success(res, null, 'Lease deleted successfully', 204);
  } catch (error) {
    logger.error('deleteLease error', error as Error);
    next(error);
  }
};
