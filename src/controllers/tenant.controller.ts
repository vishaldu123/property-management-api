import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const listTenants = async (req: AuthenticatedRequest, res: Response) => {
  const tenants = await prisma.tenant.findMany({
    where: { organizationId: req.user!.organizationId },
  });
  res.json(tenants);
};

export const createTenant = async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, phone } = req.body;
  const tenant = await prisma.tenant.create({
    data: {
      name,
      email,
      phone,
      organizationId: req.user!.organizationId,
    },
  });
  res.status(201).json(tenant);
};
