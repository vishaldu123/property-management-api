import { Unit, Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { BaseRepository } from '../shared/core/repository';
import { PaginationRequest } from '../shared/core/pagination';

export class UnitRepository extends BaseRepository<Unit> {
  constructor() {
    super(prisma, 'unit');
  }

  /**
   * Find a unit by unit number within a property
   */
  async findByUnitNumber(propertyId: string, unitNumber: string): Promise<Unit | null> {
    return prisma.unit.findFirst({
      where: {
        propertyId,
        unitNumber,
        deletedAt: null,
      },
    });
  }

  /**
   * Find a unit by ID with organization and property isolation
   */
  async findByIdAndOrganizationId(id: string, organizationId: string): Promise<Unit | null> {
    return prisma.unit.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });
  }

  /**
   * Find units by property ID with organization isolation
   */
  async findByPropertyId(propertyId: string, organizationId: string): Promise<Unit[]> {
    return prisma.unit.findMany({
      where: {
        propertyId,
        organizationId,
        deletedAt: null,
      },
    });
  }

  /**
   * List units with pagination, filtering, and sorting
   */
  async paginateScoped(
    pagination: PaginationRequest,
    organizationId: string,
    where?: Prisma.UnitWhereInput
  ) {
    const scopedWhere: Prisma.UnitWhereInput = {
      ...where,
      organizationId,
      deletedAt: null,
    };

    return this.paginate(pagination, scopedWhere);
  }

  /**
   * Search units by name, number, or block
   */
  async search(
    organizationId: string,
    query: string,
    pagination: PaginationRequest,
    propertyId?: string
  ) {
    const searchCondition: Prisma.UnitWhereInput = {
      organizationId,
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { unitNumber: { contains: query, mode: 'insensitive' } },
        { block: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (propertyId) {
      searchCondition.propertyId = propertyId;
    }

    return this.paginate(pagination, searchCondition);
  }

  /**
   * Filter units by multiple criteria
   */
  async filter(
    organizationId: string,
    filters: {
      propertyId?: string;
      status?: string;
      unitType?: string;
      floor?: number;
      block?: string;
    },
    pagination: PaginationRequest
  ) {
    const where: Prisma.UnitWhereInput = {
      organizationId,
      deletedAt: null,
    };

    if (filters.propertyId) {
      where.propertyId = filters.propertyId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.unitType) {
      where.unitType = filters.unitType;
    }

    if (filters.floor !== undefined) {
      where.floor = filters.floor;
    }

    if (filters.block) {
      where.block = { contains: filters.block, mode: 'insensitive' };
    }

    return this.paginate(pagination, where);
  }

  /**
   * Create a new unit
   */
  async create(data: any): Promise<Unit> {
    return prisma.unit.create({ data });
  }

  /**
   * Update a unit
   */
  async update(
    id: string,
    data: Prisma.UnitUpdateInput
  ): Promise<Unit> {
    return prisma.unit.update({
      where: { id },
      data,
    });
  }

  /**
   * Count total units in a property
   */
  async countByProperty(propertyId: string): Promise<number> {
    return prisma.unit.count({
      where: {
        propertyId,
        deletedAt: null,
      },
    });
  }

  /**
   * Count total units in an organization
   */
  async countByOrganization(organizationId: string): Promise<number> {
    return prisma.unit.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });
  }

  /**
   * Check if a unit number exists in a property
   */
  async unitNumberExists(propertyId: string, unitNumber: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.UnitWhereInput = {
      propertyId,
      unitNumber,
      deletedAt: null,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await prisma.unit.count({ where });
    return count > 0;
  }

  /**
   * Get unit statistics for a property
   */
  async getPropertyStatistics(propertyId: string) {
    const [total, available, occupied, reserved, underMaintenance] = await Promise.all([
      prisma.unit.count({
        where: { propertyId, deletedAt: null },
      }),
      prisma.unit.count({
        where: { propertyId, status: 'Available', deletedAt: null },
      }),
      prisma.unit.count({
        where: { propertyId, status: 'Occupied', deletedAt: null },
      }),
      prisma.unit.count({
        where: { propertyId, status: 'Reserved', deletedAt: null },
      }),
      prisma.unit.count({
        where: { propertyId, status: 'Under Maintenance', deletedAt: null },
      }),
    ]);

    const byStatus = {
      available: available,
      occupied: occupied,
      reserved: reserved,
      underMaintenance: underMaintenance,
      inactive: total - available - occupied - reserved - underMaintenance,
    };

    const byType = await prisma.unit.groupBy({
      by: ['unitType'],
      where: { propertyId, deletedAt: null },
      _count: true,
    });

    const byTypeMap: Record<string, number> = {};
    byType.forEach(item => {
      byTypeMap[item.unitType] = item._count;
    });

    return {
      total,
      byStatus,
      byType: byTypeMap,
    };
  }

  /**
   * Get unit statistics for an organization
   */
  async getOrganizationStatistics(organizationId: string) {
    const [total, available, occupied, reserved, underMaintenance] = await Promise.all([
      prisma.unit.count({
        where: { organizationId, deletedAt: null },
      }),
      prisma.unit.count({
        where: { organizationId, status: 'Available', deletedAt: null },
      }),
      prisma.unit.count({
        where: { organizationId, status: 'Occupied', deletedAt: null },
      }),
      prisma.unit.count({
        where: { organizationId, status: 'Reserved', deletedAt: null },
      }),
      prisma.unit.count({
        where: { organizationId, status: 'Under Maintenance', deletedAt: null },
      }),
    ]);

    const byStatus = {
      available: available,
      occupied: occupied,
      reserved: reserved,
      underMaintenance: underMaintenance,
      inactive: total - available - occupied - reserved - underMaintenance,
    };

    return {
      total,
      byStatus,
    };
  }
}

export const unitRepository = new UnitRepository();
