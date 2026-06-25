// @ts-ignore - Phase 1: Unit model deferred to Phase 2
import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const listUnits = async (req: AuthenticatedRequest, res: Response) => {
  const units = await prisma.unit.findMany({
    where: {
      property: { organizationId: req.user!.organizationId },
    },
    include: { property: true },
  });
  res.json(units);
};

export const getUnit = async (req: AuthenticatedRequest, res: Response) => {
  const unitId = req.params.unitId as string;
  const unit = await prisma.unit.findFirst({
    where: {
      id: unitId,
      property: { organizationId: req.user!.organizationId },
    },
    include: { property: true },
  });

  if (!unit) {
    return res.status(404).json({ message: 'Unit not found' });
  }

  res.json(unit);
};

export const createUnit = async (req: AuthenticatedRequest, res: Response) => {
  const { propertyId, unitNumber, rentAmount } = req.body;
  const property = await prisma.property.findFirst({
    where: { id: propertyId, organizationId: req.user!.organizationId },
  });

  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }

  const unit = await prisma.unit.create({
    data: {
      propertyId,
      unitNumber,
      rentAmount,
    },
  });

  res.status(201).json(unit);
};

export const updateUnit = async (req: AuthenticatedRequest, res: Response) => {
  const unitId = req.params.unitId as string;
  const { unitNumber, rentAmount } = req.body;

  const unit = await prisma.unit.findFirst({
    where: {
      id: unitId,
      property: { organizationId: req.user!.organizationId },
    },
  });

  if (!unit) {
    return res.status(404).json({ message: 'Unit not found' });
  }

  const updated = await prisma.unit.update({
    where: { id: unitId },
    data: {
      unitNumber,
      rentAmount: rentAmount !== undefined ? rentAmount : undefined,
    },
  });

  res.json(updated);
};

export const deleteUnit = async (req: AuthenticatedRequest, res: Response) => {
  const unitId = req.params.unitId as string;

  const deleted = await prisma.unit.deleteMany({
    where: {
      id: unitId,
      property: { organizationId: req.user!.organizationId },
    },
  });

  if (deleted.count === 0) {
    return res.status(404).json({ message: 'Unit not found' });
  }

  res.status(204).send();
};
