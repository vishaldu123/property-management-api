import prisma from '../config/prisma';
import { Lease } from '@prisma/client';

export interface CreateLeaseInput {
  leaseNumber: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  moveInDate?: Date | null;
  moveOutDate?: Date | null;
  monthlyRent: number;
  securityDeposit: number;
  billingCycle?: string;
  gracePeriod?: number;
  status?: string;
  renewalOption?: boolean;
  autoRenewal?: boolean;
  noticePeriod?: number;
  notes?: string;
}

export interface UpdateLeaseInput {
  leaseNumber?: string;
  moveInDate?: Date | null;
  moveOutDate?: Date | null;
  monthlyRent?: number;
  securityDeposit?: number;
  billingCycle?: string;
  gracePeriod?: number;
  status?: string;
  renewalOption?: boolean;
  autoRenewal?: boolean;
  noticePeriod?: number;
  notes?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface LeaseFilter {
  status?: string;
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
}

export class LeaseRepository {
  /**
   * Create a new lease
   */
  async create(organizationId: string, data: CreateLeaseInput, userId: string): Promise<Lease> {
    return prisma.lease.create({
      data: {
        ...data,
        organizationId,
        createdBy: userId,
        updatedBy: userId,
      },
    });
  }

  /**
   * Find lease by ID and organization
   */
  async findByIdAndOrganizationId(id: string, organizationId: string): Promise<Lease | null> {
    return prisma.lease.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });
  }

  /**
   * Find lease by lease number and organization
   */
  async findByLeaseNumberAndOrganizationId(
    leaseNumber: string,
    organizationId: string
  ): Promise<Lease | null> {
    return prisma.lease.findFirst({
      where: {
        leaseNumber,
        organizationId,
        deletedAt: null,
      },
    });
  }

  /**
   * Find active lease for a unit
   * Only one active lease per unit at any given time
   */
  async findActiveLeaseForUnit(unitId: string, organizationId: string): Promise<Lease | null> {
    return prisma.lease.findFirst({
      where: {
        unitId,
        organizationId,
        status: 'Active',
        deletedAt: null,
      },
    });
  }

  /**
   * Get leases by unit with pagination
   */
  async findByUnitId(
    unitId: string,
    organizationId: string,
    pagination: PaginationOptions
  ): Promise<{ leases: Lease[]; total: number }> {
    const [leases, total] = await Promise.all([
      prisma.lease.findMany({
        where: {
          unitId,
          organizationId,
          deletedAt: null,
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { startDate: 'desc' },
      }),
      prisma.lease.count({
        where: {
          unitId,
          organizationId,
          deletedAt: null,
        },
      }),
    ]);

    return { leases, total };
  }

  /**
   * Get leases by tenant with pagination
   */
  async findByTenantId(
    tenantId: string,
    organizationId: string,
    pagination: PaginationOptions
  ): Promise<{ leases: Lease[]; total: number }> {
    const [leases, total] = await Promise.all([
      prisma.lease.findMany({
        where: {
          tenantId,
          organizationId,
          deletedAt: null,
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { startDate: 'desc' },
      }),
      prisma.lease.count({
        where: {
          tenantId,
          organizationId,
          deletedAt: null,
        },
      }),
    ]);

    return { leases, total };
  }

  /**
   * Get leases by property with pagination
   */
  async findByPropertyId(
    propertyId: string,
    organizationId: string,
    pagination: PaginationOptions
  ): Promise<{ leases: Lease[]; total: number }> {
    const [leases, total] = await Promise.all([
      prisma.lease.findMany({
        where: {
          propertyId,
          organizationId,
          deletedAt: null,
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { startDate: 'desc' },
      }),
      prisma.lease.count({
        where: {
          propertyId,
          organizationId,
          deletedAt: null,
        },
      }),
    ]);

    return { leases, total };
  }

  /**
   * Paginate leases with organization isolation
   */
  async paginateScoped(
    pagination: PaginationOptions,
    organizationId: string,
    where?: Record<string, any>
  ): Promise<{ leases: Lease[]; total: number }> {
    const [leases, total] = await Promise.all([
      prisma.lease.findMany({
        where: {
          organizationId,
          deletedAt: null,
          ...where,
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { startDate: 'desc' },
      }),
      prisma.lease.count({
        where: {
          organizationId,
          deletedAt: null,
          ...where,
        },
      }),
    ]);

    return { leases, total };
  }

  /**
   * Search leases by lease number, tenant name, or unit number
   */
  async search(
    organizationId: string,
    query: string,
    pagination: PaginationOptions,
    unitId?: string,
    tenantId?: string,
    status?: string
  ): Promise<{ leases: Lease[]; total: number }> {
    const [leases, total] = await Promise.all([
      prisma.lease.findMany({
        where: {
          organizationId,
          deletedAt: null,
          OR: [{ leaseNumber: { contains: query, mode: 'insensitive' } }],
          ...(unitId && { unitId }),
          ...(tenantId && { tenantId }),
          ...(status && { status }),
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { startDate: 'desc' },
      }),
      prisma.lease.count({
        where: {
          organizationId,
          deletedAt: null,
          OR: [{ leaseNumber: { contains: query, mode: 'insensitive' } }],
          ...(unitId && { unitId }),
          ...(tenantId && { tenantId }),
          ...(status && { status }),
        },
      }),
    ]);

    return { leases, total };
  }

  /**
   * Filter leases by status, property, unit, or tenant
   */
  async filter(
    organizationId: string,
    filters: LeaseFilter,
    pagination: PaginationOptions
  ): Promise<{ leases: Lease[]; total: number }> {
    const [leases, total] = await Promise.all([
      prisma.lease.findMany({
        where: {
          organizationId,
          deletedAt: null,
          ...(filters.status && { status: filters.status }),
          ...(filters.propertyId && { propertyId: filters.propertyId }),
          ...(filters.unitId && { unitId: filters.unitId }),
          ...(filters.tenantId && { tenantId: filters.tenantId }),
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
        orderBy: { startDate: 'desc' },
      }),
      prisma.lease.count({
        where: {
          organizationId,
          deletedAt: null,
          ...(filters.status && { status: filters.status }),
          ...(filters.propertyId && { propertyId: filters.propertyId }),
          ...(filters.unitId && { unitId: filters.unitId }),
          ...(filters.tenantId && { tenantId: filters.tenantId }),
        },
      }),
    ]);

    return { leases, total };
  }

  /**
   * Update lease
   */
  async update(
    id: string,
    organizationId: string,
    data: UpdateLeaseInput,
    userId: string
  ): Promise<Lease> {
    return prisma.lease.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
      },
    });
  }

  /**
   * Soft delete lease
   */
  async delete(id: string, organizationId: string, userId: string): Promise<Lease> {
    return prisma.lease.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId,
      },
    });
  }

  /**
   * Restore deleted lease
   */
  async restore(id: string, organizationId: string, userId: string): Promise<Lease> {
    return prisma.lease.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedBy: userId,
      },
    });
  }

  /**
   * Check if lease number exists in organization
   */
  async leaseNumberExists(
    organizationId: string,
    leaseNumber: string,
    excludeId?: string
  ): Promise<boolean> {
    const count = await prisma.lease.count({
      where: {
        organizationId,
        leaseNumber,
        deletedAt: null,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return count > 0;
  }

  /**
   * Check if unit has overlapping active lease
   */
  async hasOverlappingLease(
    unitId: string,
    organizationId: string,
    startDate: Date,
    endDate: Date,
    excludeId?: string
  ): Promise<boolean> {
    const count = await prisma.lease.count({
      where: {
        unitId,
        organizationId,
        deletedAt: null,
        status: { not: 'Terminated' },
        ...(excludeId && { id: { not: excludeId } }),
        AND: [{ startDate: { lte: endDate } }, { endDate: { gte: startDate } }],
      },
    });

    return count > 0;
  }

  /**
   * Get lease statistics by organization
   */
  async getOrganizationStatistics(
    organizationId: string
  ): Promise<{
    total: number;
    byStatus: Record<string, number>;
  }> {
    const [total, byStatus] = await Promise.all([
      prisma.lease.count({
        where: {
          organizationId,
          deletedAt: null,
        },
      }),
      prisma.lease.groupBy({
        by: ['status'],
        where: {
          organizationId,
          deletedAt: null,
        },
        _count: true,
      }),
    ]);

    const statusMap: Record<string, number> = {};
    byStatus.forEach((item: any) => {
      statusMap[item.status] = item._count;
    });

    return {
      total,
      byStatus: statusMap,
    };
  }

  /**
   * Get lease statistics for a unit
   */
  async getUnitStatistics(
    unitId: string,
    organizationId: string
  ): Promise<{
    totalLeases: number;
    activeLeases: number;
  }> {
    const [totalLeases, activeLeases] = await Promise.all([
      prisma.lease.count({
        where: {
          unitId,
          organizationId,
          deletedAt: null,
        },
      }),
      prisma.lease.count({
        where: {
          unitId,
          organizationId,
          status: 'Active',
          deletedAt: null,
        },
      }),
    ]);

    return {
      totalLeases,
      activeLeases,
    };
  }

  /**
   * Get lease statistics for a tenant
   */
  async getTenantStatistics(
    tenantId: string,
    organizationId: string
  ): Promise<{
    totalLeases: number;
    activeLeases: number;
  }> {
    const [totalLeases, activeLeases] = await Promise.all([
      prisma.lease.count({
        where: {
          tenantId,
          organizationId,
          deletedAt: null,
        },
      }),
      prisma.lease.count({
        where: {
          tenantId,
          organizationId,
          status: 'Active',
          deletedAt: null,
        },
      }),
    ]);

    return {
      totalLeases,
      activeLeases,
    };
  }
}

export const leaseRepository = new LeaseRepository();
