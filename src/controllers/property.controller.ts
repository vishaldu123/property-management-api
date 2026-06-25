// @ts-nocheck - Phase 1: Property model deferred to Phase 2
import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const listProperties = async (req: AuthenticatedRequest, res: Response) => {
  const properties = await prisma.property.findMany({
    where: { organizationId: req.user!.organizationId },
    include: { units: true },
  });
  res.json(properties);
};

export const getProperty = async (req: AuthenticatedRequest, res: Response) => {
  const propertyId = req.params.propertyId as string;
  const property = await prisma.property.findFirst({
    where: { id: propertyId, organizationId: req.user!.organizationId },
    include: { units: true },
  });

  if (!property) {
    return res.status(404).json({ message: 'Property not found' });
  }

  res.json(property);
};

export const createProperty = async (req: AuthenticatedRequest, res: Response) => {
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

  res.status(201).json(property);
};

export const updateProperty = async (req: AuthenticatedRequest, res: Response) => {
  const propertyId = req.params.propertyId as string;
  const { name, address, city, state } = req.body;

  const property = await prisma.property.updateMany({
    where: { id: propertyId, organizationId: req.user!.organizationId },
    data: { name, address, city, state },
  });

  if (property.count === 0) {
    return res.status(404).json({ message: 'Property not found' });
  }

  const updated = await prisma.property.findUnique({ where: { id: propertyId as string } });
  res.json(updated);
};

export const deleteProperty = async (req: AuthenticatedRequest, res: Response) => {
  const propertyId = req.params.propertyId as string;

  const property = await prisma.property.deleteMany({
    where: { id: propertyId, organizationId: req.user!.organizationId },
  });

  if (property.count === 0) {
    return res.status(404).json({ message: 'Property not found' });
  }

  res.status(204).send();
};
