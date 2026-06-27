"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.propertyService = exports.PropertyService = void 0;
const client_1 = require("@prisma/client");
const property_repository_1 = require("../repositories/property.repository");
const organization_repository_1 = require("../repositories/organization.repository");
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
const pagination_1 = require("../shared/core/pagination");
class PropertyService {
    /**
     * Create a new property
     */
    async createProperty(ctx, input) {
        // 1. Verify organization exists
        const organization = await organization_repository_1.organizationRepository.findById(ctx.organizationId);
        if (!organization) {
            logger_1.default.warn('Organization not found', { organizationId: ctx.organizationId });
            throw new errors_1.ForbiddenError('Organization not found');
        }
        // 2. Validate property code uniqueness within organization
        const existingProperty = await property_repository_1.propertyRepository.findByCode(ctx.organizationId, input.code);
        if (existingProperty) {
            logger_1.default.warn('Property code already exists', {
                organizationId: ctx.organizationId,
                code: input.code,
            });
            throw new errors_1.ConflictError('Property code already exists in this organization');
        }
        // 3. Validate property type is supported
        const validPropertyTypes = ['Apartment', 'Villa', 'Commercial', 'Office', 'Retail', 'Warehouse', 'Mixed Use', 'Land'];
        if (!validPropertyTypes.includes(input.propertyType)) {
            logger_1.default.warn('Invalid property type', { propertyType: input.propertyType });
            throw new errors_1.ValidationError({
                propertyType: ['Must be one of: ' + validPropertyTypes.join(', ')],
            });
        }
        // 4. Validate status is supported
        const validStatuses = ['Draft', 'Active', 'Inactive', 'Archived'];
        const status = input.status || 'Draft';
        if (!validStatuses.includes(status)) {
            logger_1.default.warn('Invalid status', { status });
            throw new errors_1.ValidationError({
                status: ['Must be one of: ' + validStatuses.join(', ')],
            });
        }
        // 5. Create property
        const property = await property_repository_1.propertyRepository.create({
            organizationId: ctx.organizationId,
            name: input.name,
            code: input.code,
            description: input.description,
            propertyType: input.propertyType,
            status,
            address: input.address,
            city: input.city,
            state: input.state,
            country: input.country,
            postalCode: input.postalCode,
            latitude: input.latitude ? new client_1.Prisma.Decimal(input.latitude) : null,
            longitude: input.longitude ? new client_1.Prisma.Decimal(input.longitude) : null,
            timezone: input.timezone || 'UTC',
            totalUnits: input.totalUnits,
            yearBuilt: input.yearBuilt,
            notes: input.notes,
            createdBy: ctx.userId,
            updatedBy: ctx.userId,
        });
        logger_1.default.info('Property created', {
            propertyId: property.id,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
        });
        return property;
    }
    /**
     * Update an existing property
     */
    async updateProperty(ctx, propertyId, input) {
        // 1. Verify property exists and belongs to organization
        const property = await property_repository_1.propertyRepository.findByIdAndOrganizationId(propertyId, ctx.organizationId);
        if (!property) {
            logger_1.default.warn('Property not found', { propertyId, organizationId: ctx.organizationId });
            throw new errors_1.NotFoundError('Property not found');
        }
        // 2. If code is being updated, check uniqueness
        if (input.code && input.code !== property.code) {
            const existingProperty = await property_repository_1.propertyRepository.findByCode(ctx.organizationId, input.code);
            if (existingProperty) {
                logger_1.default.warn('Property code already exists', {
                    organizationId: ctx.organizationId,
                    code: input.code,
                });
                throw new errors_1.ConflictError('Property code already exists in this organization');
            }
        }
        // 3. Validate property type if provided
        if (input.propertyType) {
            const validPropertyTypes = ['Apartment', 'Villa', 'Commercial', 'Office', 'Retail', 'Warehouse', 'Mixed Use', 'Land'];
            if (!validPropertyTypes.includes(input.propertyType)) {
                logger_1.default.warn('Invalid property type', { propertyType: input.propertyType });
                throw new errors_1.ValidationError({
                    propertyType: ['Must be one of: ' + validPropertyTypes.join(', ')],
                });
            }
        }
        // 4. Validate status if provided
        if (input.status) {
            const validStatuses = ['Draft', 'Active', 'Inactive', 'Archived'];
            if (!validStatuses.includes(input.status)) {
                logger_1.default.warn('Invalid status', { status: input.status });
                throw new errors_1.ValidationError({
                    status: ['Must be one of: ' + validStatuses.join(', ')],
                });
            }
        }
        // 5. Build update data
        const updateData = {};
        if (input.name !== undefined)
            updateData.name = input.name;
        if (input.code !== undefined)
            updateData.code = input.code;
        if (input.description !== undefined)
            updateData.description = input.description;
        if (input.propertyType !== undefined)
            updateData.propertyType = input.propertyType;
        if (input.status !== undefined)
            updateData.status = input.status;
        if (input.address !== undefined)
            updateData.address = input.address;
        if (input.city !== undefined)
            updateData.city = input.city;
        if (input.state !== undefined)
            updateData.state = input.state;
        if (input.country !== undefined)
            updateData.country = input.country;
        if (input.postalCode !== undefined)
            updateData.postalCode = input.postalCode;
        if (input.latitude !== undefined)
            updateData.latitude = new client_1.Prisma.Decimal(input.latitude);
        if (input.longitude !== undefined)
            updateData.longitude = new client_1.Prisma.Decimal(input.longitude);
        if (input.timezone !== undefined)
            updateData.timezone = input.timezone;
        if (input.totalUnits !== undefined)
            updateData.totalUnits = input.totalUnits;
        if (input.yearBuilt !== undefined)
            updateData.yearBuilt = input.yearBuilt;
        if (input.notes !== undefined)
            updateData.notes = input.notes;
        updateData.updatedBy = ctx.userId;
        const updatedProperty = await property_repository_1.propertyRepository.update(propertyId, updateData);
        logger_1.default.info('Property updated', {
            propertyId,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
        });
        return updatedProperty;
    }
    /**
     * Get a property by ID
     */
    async getProperty(ctx, propertyId) {
        const property = await property_repository_1.propertyRepository.findByIdAndOrganizationId(propertyId, ctx.organizationId);
        if (!property) {
            logger_1.default.warn('Property not found', { propertyId, organizationId: ctx.organizationId });
            throw new errors_1.NotFoundError('Property not found');
        }
        return property;
    }
    /**
     * List properties with pagination
     */
    async listProperties(ctx, query) {
        const pagination = new pagination_1.PaginationRequest(query.page || 1, query.limit || 10);
        const filters = {};
        if (query.status) {
            filters.status = query.status;
        }
        if (query.propertyType) {
            filters.propertyType = query.propertyType;
        }
        if (query.city) {
            filters.city = query.city;
        }
        if (query.country) {
            filters.country = query.country;
        }
        // If search query provided, use search method
        if (query.search) {
            const result = await property_repository_1.propertyRepository.search(ctx.organizationId, query.search, pagination);
            logger_1.default.debug('Properties searched', {
                organizationId: ctx.organizationId,
                query: query.search,
                count: result.data.length,
            });
            return result;
        }
        // Use filter method
        const result = await property_repository_1.propertyRepository.filter(ctx.organizationId, filters, pagination);
        logger_1.default.debug('Properties listed', {
            organizationId: ctx.organizationId,
            count: result.data.length,
        });
        return result;
    }
    /**
     * Soft delete a property
     */
    async deleteProperty(ctx, propertyId) {
        // 1. Verify property exists and belongs to organization
        const property = await property_repository_1.propertyRepository.findByIdAndOrganizationId(propertyId, ctx.organizationId);
        if (!property) {
            logger_1.default.warn('Property not found', { propertyId, organizationId: ctx.organizationId });
            throw new errors_1.NotFoundError('Property not found');
        }
        // 2. Soft delete
        const deletedProperty = await property_repository_1.propertyRepository.softDelete(propertyId);
        logger_1.default.info('Property soft deleted', {
            propertyId,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
        });
        return deletedProperty;
    }
    /**
     * Restore a soft-deleted property
     */
    async restoreProperty(ctx, propertyId) {
        // 1. Find deleted property by ID
        const property = await property_repository_1.propertyRepository.findById(propertyId);
        if (!property || property.organizationId !== ctx.organizationId) {
            logger_1.default.warn('Property not found', { propertyId, organizationId: ctx.organizationId });
            throw new errors_1.NotFoundError('Property not found');
        }
        if (!property.deletedAt) {
            logger_1.default.warn('Property is not deleted', { propertyId, organizationId: ctx.organizationId });
            throw new errors_1.ValidationError({
                deletedAt: ['Property is not deleted and cannot be restored'],
            });
        }
        // 2. Restore
        const restoredProperty = await property_repository_1.propertyRepository.restore(propertyId);
        logger_1.default.info('Property restored', {
            propertyId,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
        });
        return restoredProperty;
    }
    /**
     * Get property statistics
     */
    async getPropertyStatistics(ctx) {
        const stats = await property_repository_1.propertyRepository.getStatistics(ctx.organizationId);
        logger_1.default.debug('Property statistics retrieved', {
            organizationId: ctx.organizationId,
            stats,
        });
        return stats;
    }
}
exports.PropertyService = PropertyService;
exports.propertyService = new PropertyService();
