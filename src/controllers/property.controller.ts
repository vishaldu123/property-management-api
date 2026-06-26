// @ts-nocheck - Phase 1: Property model deferred to Phase 2
import { Response, NextFunction } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiResponse } from '../shared/core/response';
import logger from '../utils/logger';

export const listProperties = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const properties = await prisma.property.findMany({
      where: { organizationId: req.user!.organizationId },
      include: { units: true },
    });
    ApiResponse.success(res, properties, 'Properties retrieved successfully');
  } catch (error) {
    logger.error('listProperties error', error as Error);
    next(error);
  }
};

export const getProperty = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const propertyId = req.params.propertyId as string;
    const property = await prisma.property.findFirst({
      where: { id: propertyId, organizationId: req.user!.organizationId },
      include: { units: true },
    });

    if (!property) {
      ApiResponse.error(res, 'Property not found', 404);
      return;
    }

    ApiResponse.success(res, property, 'Property retrieved successfully');
  } catch (error) {
    logger.error('getProperty error', error as Error);
    next(error);
  }
};

export const createProperty = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, address, city, state } = req.body;
    const property = await prisma.property.create({
      data: {
        name,
        address,
        city,
        state,
        organizationId: req.user!.organizationId,
      },
    });

    ApiResponse.created(res, property, 'Property created successfully');
  } catch (error) {
    logger.error('createProperty error', error as Error);
    next(error);
  }
};

export const updateProperty = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const propertyId = req.params.propertyId as string;
    const { name, address, city, state } = req.body;

    const property = await prisma.property.updateMany({
      where: { id: propertyId, organizationId: req.user!.organizationId },
      data: { name, address, city, state },
    });

    if (property.count === 0) {
      ApiResponse.error(res, 'Property not found', 404);
      return;
    }

    const updated = await prisma.property.findUnique({ where: { id: propertyId as string } });
    ApiResponse.success(res, updated, 'Property updated successfully');
  } catch (error) {
    logger.error('updateProperty error', error as Error);
    next(error);
  }
};

export const deleteProperty = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const propertyId = req.params.propertyId as string;

    const property = await prisma.property.deleteMany({
      where: { id: propertyId, organizationId: req.user!.organizationId },
    });

    if (property.count === 0) {
      ApiResponse.error(res, 'Property not found', 404);
      return;
    }

    ApiResponse.success(res, null, 'Property deleted successfully', 204);
  } catch (error) {
    logger.error('deleteProperty error', error as Error);
    next(error);
  }
};
