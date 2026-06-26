// @ts-nocheck - Phase 1: Unit model deferred to Phase 2
import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../shared/core/response';
import logger from '../utils/logger';

export const listUnits = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const units = await prisma.unit.findMany({
      where: {
        property: { organizationId: req.user!.organizationId },
      },
      include: { property: true },
    });
    ApiResponse.success(res, units, 'Units retrieved successfully');
  } catch (error) {
    logger.error('listUnits error', error as Error);
    next(error);
  }
};

export const getUnit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const unitId = req.params.unitId as string;
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        property: { organizationId: req.user!.organizationId },
      },
      include: { property: true },
    });

    if (!unit) {
      ApiResponse.error(res, 'Unit not found', 404);
      return;
    }

    ApiResponse.success(res, unit, 'Unit retrieved successfully');
  } catch (error) {
    logger.error('getUnit error', error as Error);
    next(error);
  }
};

export const createUnit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { propertyId, unitNumber, rentAmount } = req.body;
    const property = await prisma.property.findFirst({
      where: { id: propertyId, organizationId: req.user!.organizationId },
    });

    if (!property) {
      ApiResponse.error(res, 'Property not found', 404);
      return;
    }

    const unit = await prisma.unit.create({
      data: {
        propertyId,
        unitNumber,
        rentAmount,
      },
    });

    ApiResponse.created(res, unit, 'Unit created successfully');
  } catch (error) {
    logger.error('createUnit error', error as Error);
    next(error);
  }
};

export const updateUnit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const unitId = req.params.unitId as string;
    const { unitNumber, rentAmount } = req.body;

    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        property: { organizationId: req.user!.organizationId },
      },
    });

    if (!unit) {
      ApiResponse.error(res, 'Unit not found', 404);
      return;
    }

    const updated = await prisma.unit.update({
      where: { id: unitId },
      data: {
        unitNumber,
        rentAmount: rentAmount !== undefined ? rentAmount : undefined,
      },
    });

    ApiResponse.success(res, updated, 'Unit updated successfully');
  } catch (error) {
    logger.error('updateUnit error', error as Error);
    next(error);
  }
};

export const deleteUnit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const unitId = req.params.unitId as string;

    const deleted = await prisma.unit.deleteMany({
      where: {
        id: unitId,
        property: { organizationId: req.user!.organizationId },
      },
    });

    if (deleted.count === 0) {
      ApiResponse.error(res, 'Unit not found', 404);
      return;
    }

    ApiResponse.success(res, null, 'Unit deleted successfully', 204);
  } catch (error) {
    logger.error('deleteUnit error', error as Error);
    next(error);
  }
};
