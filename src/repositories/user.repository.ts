/**
 * User Repository
 * Data access layer for User model
 */

import { BaseRepository } from './base.repository';
import prisma from '../config/prisma';
import logger from '../utils/logger';

// Type definition for User model
type User = any;

export class UserRepository extends BaseRepository<User> {
  protected model = prisma.user;

  constructor() {
    super('User');
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      logger.debug('Finding user by email', { email });
      return await this.model.findUnique({
        where: { email },
      });
    } catch (error) {
      logger.error('Failed to find user by email', error as Error, { email });
      throw error;
    }
  }

  async findWithMemberships(id: string): Promise<(User & { memberships: any[] }) | null> {
    try {
      logger.debug('Finding user with memberships', { id });
      return await this.model.findUnique({
        where: { id },
        include: {
          memberships: {
            include: {
              organization: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Failed to find user with memberships', error as Error, { id });
      throw error;
    }
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
