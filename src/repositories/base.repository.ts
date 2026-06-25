/**
 * Base Repository Pattern
 * Generic repository for common database operations
 */

import { NotFoundError } from '../utils/errors';
import logger from '../utils/logger';

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(skip?: number, take?: number): Promise<T[]>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

/**
 * Base repository class providing common CRUD operations
 * Subclasses should inject the PrismaClient model
 */
export abstract class BaseRepository<T> implements IRepository<T> {
  protected abstract model: any; // Prisma model delegate
  protected modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  async findById(id: string): Promise<T | null> {
    try {
      logger.debug(`Finding ${this.modelName} by id`, { id });
      const result = await this.model.findUnique({ where: { id } });
      return result || null;
    } catch (error) {
      logger.error(`Failed to find ${this.modelName} by id`, error as Error, { id });
      throw error;
    }
  }

  async findAll(skip: number = 0, take: number = 10): Promise<T[]> {
    try {
      logger.debug(`Finding all ${this.modelName}`, { skip, take });
      return await this.model.findMany({ skip, take });
    } catch (error) {
      logger.error(`Failed to find all ${this.modelName}`, error as Error, { skip, take });
      throw error;
    }
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    try {
      logger.debug(`Creating ${this.modelName}`, { data });
      return await this.model.create({ data });
    } catch (error) {
      logger.error(`Failed to create ${this.modelName}`, error as Error, { data });
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      logger.debug(`Updating ${this.modelName}`, { id, data });
      const result = await this.model.update({
        where: { id },
        data,
      });
      if (!result) {
        throw new NotFoundError(this.modelName);
      }
      return result;
    } catch (error) {
      logger.error(`Failed to update ${this.modelName}`, error as Error, { id, data });
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      logger.debug(`Deleting ${this.modelName}`, { id });
      const result = await this.model.delete({ where: { id } });
      return !!result;
    } catch (error) {
      logger.error(`Failed to delete ${this.modelName}`, error as Error, { id });
      throw error;
    }
  }
}
