import { PrismaClient } from '@prisma/client';
import { PaginationRequest, PaginationResponse } from '../pagination';
import { NotFoundException } from '../../exceptions';
import { RequestContextManager } from '../context';

/**
 * Base Repository - Reusable CRUD operations with soft delete and pagination support
 * Generic type T represents the entity
 */

export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;
  protected modelName: string; // Name of the Prisma model

  constructor(prisma: PrismaClient, modelName: string) {
    this.prisma = prisma;
    this.modelName = modelName;
  }

  /**
   * Find by ID
   */
  async findById(id: string): Promise<T | null> {
    const model = (this.prisma as any)[this.modelName];
    return model.findUnique({
      where: { id },
    });
  }

  /**
   * Find by ID or throw
   */
  async findByIdOrThrow(id: string, resourceName: string = 'Resource'): Promise<T> {
    const entity = await this.findById(id);
    if (!entity) {
      throw new NotFoundException(resourceName);
    }
    return entity;
  }

  /**
   * Find all
   */
  async findAll(where?: any): Promise<T[]> {
    const model = (this.prisma as any)[this.modelName];
    return model.findMany({
      where,
    });
  }

  /**
   * Find with pagination and filtering
   */
  async paginate(
    pagination: PaginationRequest,
    where?: any
  ): Promise<PaginationResponse<T>> {
    const model = (this.prisma as any)[this.modelName];

    const [data, total] = await Promise.all([
      model.findMany({
        where,
        skip: pagination.getSkip(),
        take: pagination.limit,
        orderBy: pagination.getSortOrder(),
      }),
      model.count({ where }),
    ]);

    return new PaginationResponse(data, pagination.page, pagination.limit, total);
  }

  /**
   * Create
   */
  async create(data: any): Promise<T> {
    const model = (this.prisma as any)[this.modelName];
    const userId = RequestContextManager.getUserId();
    const auditUser = userId ?? data.createdBy ?? null;

    return model.create({
      data: {
        ...data,
        createdBy: auditUser,
        updatedBy: auditUser,
      },
    });
  }

  /**
   * Create many
   */
  async createMany(data: any[]): Promise<any> {
    const model = (this.prisma as any)[this.modelName];
    return model.createMany({
      data,
    });
  }

  /**
   * Update
   */
  async update(id: string, data: any): Promise<T> {
    const model = (this.prisma as any)[this.modelName];
    const userId = RequestContextManager.getUserId();
    const auditUser = userId ?? data.updatedBy ?? null;

    return model.update({
      where: { id },
      data: {
        ...data,
        updatedBy: auditUser,
      },
    });
  }

  /**
   * Update or throw
   */
  async updateOrThrow(
    id: string,
    data: any,
    resourceName: string = 'Resource'
  ): Promise<T> {
    try {
      return await this.update(id, data);
    } catch {
      throw new NotFoundException(resourceName);
    }
  }

  /**
   * Delete (hard delete)
   */
  async delete(id: string): Promise<T> {
    const model = (this.prisma as any)[this.modelName];
    return model.delete({
      where: { id },
    });
  }

  /**
   * Soft delete
   */
  async softDelete(id: string): Promise<T> {
    const model = (this.prisma as any)[this.modelName];
    const userId = RequestContextManager.getUserId();

    return model.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedBy: userId ?? null,
      },
    });
  }

  /**
   * Restore soft deleted entity
   */
  async restore(id: string): Promise<T> {
    const model = (this.prisma as any)[this.modelName];
    const userId = RequestContextManager.getUserId();

    return model.update({
      where: { id },
      data: {
        deletedAt: null,
        updatedBy: userId ?? null,
      },
    });
  }

  /**
   * Permanently delete soft deleted entity
   */
  async permanentlyDelete(id: string): Promise<T> {
    const model = (this.prisma as any)[this.modelName];
    return model.delete({
      where: { id },
    });
  }

  /**
   * Find all soft deleted entities
   */
  async findDeleted(where?: any): Promise<T[]> {
    const model = (this.prisma as any)[this.modelName];
    return model.findMany({
      where: {
        ...where,
        deletedAt: { not: null },
      },
    });
  }

  /**
   * Count
   */
  async count(where?: any): Promise<number> {
    const model = (this.prisma as any)[this.modelName];
    return model.count({ where });
  }

  /**
   * Check if exists
   */
  async exists(where: any): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  /**
   * Execute raw query within transaction
   */
  async transaction<R>(callback: (prisma: PrismaClient) => Promise<R>): Promise<R> {
    return (this.prisma as any).$transaction(callback);
  }

  /**
   * Upsert
   */
  async upsert(where: any, create: any, update: any): Promise<T> {
    const model = (this.prisma as any)[this.modelName];
    const userId = RequestContextManager.getUserId();
    const createAuditUser = userId ?? create.createdBy ?? null;
    const updateAuditUser = userId ?? update.updatedBy ?? null;

    return model.upsert({
      where,
      create: {
        ...create,
        createdBy: createAuditUser,
        updatedBy: createAuditUser,
      },
      update: {
        ...update,
        updatedBy: updateAuditUser,
      },
    });
  }
}
