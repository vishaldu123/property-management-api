/**
 * Organization Repository
 * Data access layer for Organization model
 */

import { Organization } from '@prisma/client';
import { BaseRepository } from './base.repository';
import prisma from '../config/prisma';
import logger from '../utils/logger';

export class OrganizationRepository extends BaseRepository<Organization> {
  protected model = prisma.organization;

  constructor() {
    super('Organization');
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    try {
      logger.debug('Finding organization by slug', { slug });
      return await this.model.findUnique({
        where: { slug },
      });
    } catch (error) {
      logger.error('Failed to find organization by slug', error as Error, { slug });
      throw error;
    }
  }

  async findWithUsers(id: string): Promise<(Organization & { users: any[] }) | null> {
    try {
      logger.debug('Finding organization with users', { id });
      return await this.model.findUnique({
        where: { id },
        include: {
          users: {
            include: {
              user: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Failed to find organization with users', error as Error, { id });
      throw error;
    }
  }
}

// Export singleton instance
export const organizationRepository = new OrganizationRepository();
