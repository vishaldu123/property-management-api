"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const pagination_1 = require("../pagination");
const exceptions_1 = require("../../exceptions");
const context_1 = require("../context");
/**
 * Base Repository - Reusable CRUD operations with soft delete and pagination support
 * Generic type T represents the entity
 */
class BaseRepository {
    prisma;
    modelName; // Name of the Prisma model
    constructor(prisma, modelName) {
        this.prisma = prisma;
        this.modelName = modelName;
    }
    /**
     * Find by ID
     */
    async findById(id) {
        const model = this.prisma[this.modelName];
        return model.findUnique({
            where: { id },
        });
    }
    /**
     * Find by ID or throw
     */
    async findByIdOrThrow(id, resourceName = 'Resource') {
        const entity = await this.findById(id);
        if (!entity) {
            throw new exceptions_1.NotFoundException(resourceName);
        }
        return entity;
    }
    /**
     * Find all
     */
    async findAll(where) {
        const model = this.prisma[this.modelName];
        return model.findMany({
            where,
        });
    }
    /**
     * Find with pagination and filtering
     */
    async paginate(pagination, where) {
        const model = this.prisma[this.modelName];
        const [data, total] = await Promise.all([
            model.findMany({
                where,
                skip: pagination.getSkip(),
                take: pagination.limit,
                orderBy: pagination.getSortOrder(),
            }),
            model.count({ where }),
        ]);
        return new pagination_1.PaginationResponse(data, pagination.page, pagination.limit, total);
    }
    /**
     * Create
     */
    async create(data) {
        const model = this.prisma[this.modelName];
        const userId = context_1.RequestContextManager.getUserId();
        return model.create({
            data: {
                ...data,
                createdBy: userId,
                updatedBy: userId,
            },
        });
    }
    /**
     * Create many
     */
    async createMany(data) {
        const model = this.prisma[this.modelName];
        return model.createMany({
            data,
        });
    }
    /**
     * Update
     */
    async update(id, data) {
        const model = this.prisma[this.modelName];
        const userId = context_1.RequestContextManager.getUserId();
        return model.update({
            where: { id },
            data: {
                ...data,
                updatedBy: userId,
            },
        });
    }
    /**
     * Update or throw
     */
    async updateOrThrow(id, data, resourceName = 'Resource') {
        try {
            return await this.update(id, data);
        }
        catch {
            throw new exceptions_1.NotFoundException(resourceName);
        }
    }
    /**
     * Delete (hard delete)
     */
    async delete(id) {
        const model = this.prisma[this.modelName];
        return model.delete({
            where: { id },
        });
    }
    /**
     * Soft delete
     */
    async softDelete(id) {
        const model = this.prisma[this.modelName];
        const userId = context_1.RequestContextManager.getUserId();
        return model.update({
            where: { id },
            data: {
                deletedAt: new Date(),
                updatedBy: userId,
            },
        });
    }
    /**
     * Restore soft deleted entity
     */
    async restore(id) {
        const model = this.prisma[this.modelName];
        const userId = context_1.RequestContextManager.getUserId();
        return model.update({
            where: { id },
            data: {
                deletedAt: null,
                updatedBy: userId,
            },
        });
    }
    /**
     * Permanently delete soft deleted entity
     */
    async permanentlyDelete(id) {
        const model = this.prisma[this.modelName];
        return model.delete({
            where: { id },
        });
    }
    /**
     * Find all soft deleted entities
     */
    async findDeleted(where) {
        const model = this.prisma[this.modelName];
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
    async count(where) {
        const model = this.prisma[this.modelName];
        return model.count({ where });
    }
    /**
     * Check if exists
     */
    async exists(where) {
        const count = await this.count(where);
        return count > 0;
    }
    /**
     * Execute raw query within transaction
     */
    async transaction(callback) {
        return this.prisma.$transaction(callback);
    }
    /**
     * Upsert
     */
    async upsert(where, create, update) {
        const model = this.prisma[this.modelName];
        const userId = context_1.RequestContextManager.getUserId();
        return model.upsert({
            where,
            create: {
                ...create,
                createdBy: userId,
                updatedBy: userId,
            },
            update: {
                ...update,
                updatedBy: userId,
            },
        });
    }
}
exports.BaseRepository = BaseRepository;
