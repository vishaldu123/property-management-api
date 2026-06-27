import { Tenant, Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { BaseRepository } from '../shared/core/repository';
import { PaginationRequest } from '../shared/core/pagination';

export class TenantRepository extends BaseRepository<Tenant> {
  constructor() {
    super(prisma, 'tenant');
  }

  /**
   * Find a tenant by email within an organization
   */
  async findByEmail(organizationId: string, email: string): Promise<Tenant | null> {
    return prisma.tenant.findFirst({
      where: {
        organizationId,
        email,
        deletedAt: null,
      },
    });
  }

  /**
   * Find a tenant by ID with organization isolation
   */
  async findByIdAndOrganizationId(id: string, organizationId: string): Promise<Tenant | null> {
    return prisma.tenant.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });
  }

  /**
   * Find tenants by unit ID with organization isolation
   */
  async findByUnitId(unitId: string, organizationId: string): Promise<Tenant[]> {
    return prisma.tenant.findMany({
      where: {
        unitId,
        organizationId,
        deletedAt: null,
      },
    });
  }

  /**
   * List tenants with pagination and organization isolation
   */
  async paginateScoped(
    pagination: PaginationRequest,
    organizationId: string,
    where?: Prisma.TenantWhereInput
  ) {
    const scopedWhere: Prisma.TenantWhereInput = {
      ...where,
      organizationId,
      deletedAt: null,
    };

    return this.paginate(pagination, scopedWhere);
  }

  /**
   * Search tenants by first name, last name, email, or phone
   */
  async search(
    organizationId: string,
    query: string,
    pagination: PaginationRequest,
    unitId?: string
  ) {
    const searchCondition: Prisma.TenantWhereInput = {
      organizationId,
      deletedAt: null,
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (unitId) {
      searchCondition.unitId = unitId;
    }

    return this.paginate(pagination, searchCondition);
  }

  /**
   * Filter tenants by multiple criteria
   */
  async filter(
    organizationId: string,
    filters: {
      unitId?: string;
      status?: string;
    },
    pagination: PaginationRequest
  ) {
    const where: Prisma.TenantWhereInput = {
      organizationId,
      deletedAt: null,
    };

    if (filters.unitId) {
      where.unitId = filters.unitId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    return this.paginate(pagination, where);
  }

  /**
   * Check if email exists within organization
   */
  async emailExists(organizationId: string, email: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.TenantWhereInput = {
      organizationId,
      email,
      deletedAt: null,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await prisma.tenant.count({ where });
    return count > 0;
  }

  /**
   * Count tenants by unit
   */
  async countByUnit(unitId: string): Promise<number> {
    return prisma.tenant.count({
      where: {
        unitId,
        deletedAt: null,
      },
    });
  }

  /**
   * Count tenants by organization
   */
  async countByOrganization(organizationId: string): Promise<number> {
    return prisma.tenant.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });
  }

  /**
   * Get tenant statistics by status
   */
  async getStatusStatistics(organizationId: string) {
    const statistics = await prisma.tenant.groupBy({
      by: ['status'],
      where: {
        organizationId,
        deletedAt: null,
      },
      _count: true,
    });

    return statistics.map(stat => ({
      status: stat.status,
      count: stat._count,
    }));
  }

  /**
   * Get tenant statistics by unit
   */
  async getUnitStatistics(organizationId: string) {
    const statistics = await prisma.tenant.groupBy({
      by: ['unitId'],
      where: {
        organizationId,
        deletedAt: null,
        unitId: { not: null },
      },
      _count: true,
    });

    return statistics.map(stat => ({
      unitId: stat.unitId,
      count: stat._count,
    }));
  }

  /**
   * Get organization-level tenant statistics
   */
  async getOrganizationStatistics(organizationId: string) {
    const [total, byStatus, byUnit] = await Promise.all([
      this.countByOrganization(organizationId),
      this.getStatusStatistics(organizationId),
      this.getUnitStatistics(organizationId),
    ]);

    return {
      total,
      byStatus,
      byUnit,
    };
  }
}

export const tenantRepository = new TenantRepository();
