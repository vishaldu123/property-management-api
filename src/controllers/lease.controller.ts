import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const listLeases = async (req: AuthenticatedRequest, res: Response) => {
  const leases = await prisma.lease.findMany({
    where: { unit: { property: { organizationId: req.user!.organizationId } } },
    include: { unit: true, tenant: true, payments: true },
  });
  res.json(leases);
};

export const getLease = async (req: AuthenticatedRequest, res: Response) => {
  const leaseId = req.params.leaseId as string;
  const lease = await prisma.lease.findFirst({
    where: { id: leaseId, unit: { property: { organizationId: req.user!.organizationId } } },
    include: { unit: true, tenant: true, payments: true },
  });

  if (!lease) {
    return res.status(404).json({ message: 'Lease not found' });
  }

  res.json(lease);
};

export const createLease = async (req: AuthenticatedRequest, res: Response) => {
  const { unitId, tenantId, startDate, endDate, monthlyRent } = req.body;

  const unit = await prisma.unit.findFirst({
    where: { id: unitId, property: { organizationId: req.user!.organizationId } },
  });
  if (!unit) {
    return res.status(404).json({ message: 'Unit not found' });
  }

  const tenant = await prisma.tenant.findFirst({
    where: { id: tenantId, organizationId: req.user!.organizationId },
  });
  if (!tenant) {
    return res.status(404).json({ message: 'Tenant not found' });
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

  res.status(201).json(lease);
};

export const updateLease = async (req: AuthenticatedRequest, res: Response) => {
  const leaseId = req.params.leaseId as string;
  const { startDate, endDate, monthlyRent } = req.body;

  const lease = await prisma.lease.findFirst({
    where: { id: leaseId, unit: { property: { organizationId: req.user!.organizationId } } },
  });
  if (!lease) {
    return res.status(404).json({ message: 'Lease not found' });
  }

  const updated = await prisma.lease.update({
    where: { id: leaseId as string },
    data: {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      monthlyRent: monthlyRent !== undefined ? monthlyRent : undefined,
    },
  });

  res.json(updated);
};

export const deleteLease = async (req: AuthenticatedRequest, res: Response) => {
  const leaseId = req.params.leaseId as string;

  const deleted = await prisma.lease.deleteMany({
    where: { id: leaseId, unit: { property: { organizationId: req.user!.organizationId } } },
  });

  if (deleted.count === 0) {
    return res.status(404).json({ message: 'Lease not found' });
  }

  res.status(204).send();
};
