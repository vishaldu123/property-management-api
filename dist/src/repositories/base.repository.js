"use strict";
/**
 * Base Repository Pattern
 * Generic repository for common database operations
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Base repository class providing common CRUD operations
 * Subclasses should inject the PrismaClient model
 */
class BaseRepository {
    modelName;
    constructor(modelName) {
        this.modelName = modelName;
    }
    async findById(id) {
        try {
            logger_1.default.debug(`Finding ${this.modelName} by id`, { id });
            const result = await this.model.findUnique({ where: { id } });
            return result || null;
        }
        catch (error) {
            logger_1.default.error(`Failed to find ${this.modelName} by id`, error, { id });
            throw error;
        }
    }
    async findAll(skip = 0, take = 10) {
        try {
            logger_1.default.debug(`Finding all ${this.modelName}`, { skip, take });
            return await this.model.findMany({ skip, take });
        }
        catch (error) {
            logger_1.default.error(`Failed to find all ${this.modelName}`, error, { skip, take });
            throw error;
        }
    }
    async create(data) {
        try {
            logger_1.default.debug(`Creating ${this.modelName}`, { data });
            return await this.model.create({ data });
        }
        catch (error) {
            logger_1.default.error(`Failed to create ${this.modelName}`, error, { data });
            throw error;
        }
    }
    async update(id, data) {
        try {
            logger_1.default.debug(`Updating ${this.modelName}`, { id, data });
            const result = await this.model.update({
                where: { id },
                data,
            });
            if (!result) {
                throw new errors_1.NotFoundError(this.modelName);
            }
            return result;
        }
        catch (error) {
            logger_1.default.error(`Failed to update ${this.modelName}`, error, { id, data });
            throw error;
        }
    }
    async delete(id) {
        try {
            logger_1.default.debug(`Deleting ${this.modelName}`, { id });
            const result = await this.model.delete({ where: { id } });
            return !!result;
        }
        catch (error) {
            logger_1.default.error(`Failed to delete ${this.modelName}`, error, { id });
            throw error;
        }
    }
}
exports.BaseRepository = BaseRepository;
