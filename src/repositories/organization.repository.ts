import { Organization, Prisma } from '@prisma/client';
import prisma from '../config/prisma';
import { BaseRepository } from '../shared/core/repository';
import { PaginationRequest } from '../shared/core/pagination';

export class OrganizationRepository extends BaseRepository<Organization> {
  constructor() {
    super(prisma, 'organization');
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { slug },
    });
  }

  async findByEmail(email: string): Promise<Organization | null> {
    return prisma.organization.findUnique({
      where: { email },
    });
  }

  async findByIdAndOrganizationId(id: string, organizationId: string): Promise<Organization | null> {
    if (id !== organizationId) {
      return null;
    }

    return prisma.organization.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async paginateScoped(
    pagination: PaginationRequest,
    organizationId: string,
    where: Prisma.OrganizationWhereInput
  ) {
    const scopedWhere: Prisma.OrganizationWhereInput = {
      ...where,
      id: organizationId,
    };

    return this.paginate(pagination, scopedWhere);
  }
}

// Export singleton instance
export const organizationRepository = new OrganizationRepository();
