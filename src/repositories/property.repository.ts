import { Property, Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { BaseRepository } from '../shared/core/repository';
import { PaginationRequest } from '../shared/core/pagination';

export class PropertyRepository extends BaseRepository<Property> {
  constructor() {
    super(prisma, 'property');
  }

  /**
   * Find a property by code within an organization
   */
  async findByCode(organizationId: string, code: string): Promise<Property | null> {
    return prisma.property.findFirst({
      where: {
        organizationId,
        code,
        deletedAt: null,
      },
    });
  }

  /**
   * Find a property by ID with organization isolation
   */
  async findByIdAndOrganizationId(id: string, organizationId: string): Promise<Property | null> {
    return prisma.property.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: null,
      },
    });
  }

  /**
   * List properties with pagination, filtering, and sorting
   */
  async paginateScoped(
    pagination: PaginationRequest,
    organizationId: string,
    where?: Prisma.PropertyWhereInput
  ) {
    const scopedWhere: Prisma.PropertyWhereInput = {
      ...where,
      organizationId,
      deletedAt: null,
    };

    return this.paginate(pagination, scopedWhere);
  }

  /**
   * Search properties by name, address, or city
   */
  async search(
    organizationId: string,
    query: string,
    pagination: PaginationRequest
  ) {
    const searchCondition: Prisma.PropertyWhereInput = {
      organizationId,
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
        { city: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } },
      ],
    };

    return this.paginate(pagination, searchCondition);
  }

  /**
   * Filter properties by multiple criteria
   */
  async filter(
    organizationId: string,
    filters: {
      status?: string;
      propertyType?: string;
      city?: string;
      country?: string;
    },
    pagination: PaginationRequest
  ) {
    const where: Prisma.PropertyWhereInput = {
      organizationId,
      deletedAt: null,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.propertyType) {
      where.propertyType = filters.propertyType;
    }

    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }

    if (filters.country) {
      where.country = { contains: filters.country, mode: 'insensitive' };
    }

    return this.paginate(pagination, where);
  }

  /**
   * Create a new property
   */
  async create(data: any): Promise<Property> {
    return prisma.property.create({ data });
  }

  /**
   * Update a property
   */
  async update(
    id: string,
    data: Prisma.PropertyUpdateInput
  ): Promise<Property> {
    return prisma.property.update({
      where: { id },
      data,
    });
  }

  /**
   * Count total properties in an organization
   */
  async countByOrganization(organizationId: string): Promise<number> {
    return prisma.property.count({
      where: {
        organizationId,
        deletedAt: null,
      },
    });
  }

  /**
   * Check if a property code exists in an organization
   */
  async codeExists(organizationId: string, code: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.PropertyWhereInput = {
      organizationId,
      code,
      deletedAt: null,
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await prisma.property.count({ where });
    return count > 0;
  }

  /**
   * Get property statistics for an organization
   */
  async getStatistics(organizationId: string) {
    const [total, active, draft, archived] = await Promise.all([
      prisma.property.count({
        where: { organizationId, deletedAt: null },
      }),
      prisma.property.count({
        where: { organizationId, status: 'ACTIVE', deletedAt: null },
      }),
      prisma.property.count({
        where: { organizationId, status: 'DRAFT', deletedAt: null },
      }),
      prisma.property.count({
        where: { organizationId, status: 'ARCHIVED', deletedAt: null },
      }),
    ]);

    return { total, active, draft, archived };
  }
}

export const propertyRepository = new PropertyRepository();
