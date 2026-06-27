"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unitService = exports.UnitService = void 0;
const client_1 = require("@prisma/client");
const unit_repository_1 = require("../repositories/unit.repository");
const property_repository_1 = require("../repositories/property.repository");
const organization_repository_1 = require("../repositories/organization.repository");
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
const pagination_1 = require("../shared/core/pagination");
class UnitService {
    /**
     * Create a new unit
     */
    async createUnit(ctx, input) {
        // 1. Verify organization exists
        const organization = await organization_repository_1.organizationRepository.findById(ctx.organizationId);
        if (!organization) {
            logger_1.default.warn('Organization not found', { organizationId: ctx.organizationId });
            throw new errors_1.ForbiddenError('Organization not found');
        }
        // 2. Verify property exists and belongs to organization
        const property = await property_repository_1.propertyRepository.findByIdAndOrganizationId(input.propertyId, ctx.organizationId);
        if (!property) {
            logger_1.default.warn('Property not found', {
                propertyId: input.propertyId,
                organizationId: ctx.organizationId,
            });
            throw new errors_1.NotFoundError('Property not found in your organization');
        }
        // 3. Validate unit number uniqueness within property
        const existingUnit = await unit_repository_1.unitRepository.findByUnitNumber(input.propertyId, input.unitNumber);
        if (existingUnit) {
            logger_1.default.warn('Unit number already exists', {
                propertyId: input.propertyId,
                unitNumber: input.unitNumber,
            });
            throw new errors_1.ConflictError('Unit number already exists in this property');
        }
        // 4. Validate unit type
        const validUnitTypes = ['Studio', 'Apartment', 'Villa', 'Office', 'Shop', 'Warehouse', 'Parking', 'Storage'];
        const unitType = input.unitType || 'Apartment';
        if (!validUnitTypes.includes(unitType)) {
            logger_1.default.warn('Invalid unit type', { unitType });
            throw new errors_1.ValidationError({
                unitType: ['Must be one of: ' + validUnitTypes.join(', ')],
            });
        }
        // 5. Validate status
        const validStatuses = ['Available', 'Occupied', 'Reserved', 'Under Maintenance', 'Inactive'];
        const status = input.status || 'Available';
        if (!validStatuses.includes(status)) {
            logger_1.default.warn('Invalid status', { status });
            throw new errors_1.ValidationError({
                status: ['Must be one of: ' + validStatuses.join(', ')],
            });
        }
        // 6. Validate numeric values
        if (input.bedrooms !== undefined && input.bedrooms < 0) {
            throw new errors_1.ValidationError({
                bedrooms: ['Must be a non-negative number'],
            });
        }
        if (input.bathrooms !== undefined && input.bathrooms < 0) {
            throw new errors_1.ValidationError({
                bathrooms: ['Must be a non-negative number'],
            });
        }
        if (input.area !== undefined && input.area <= 0) {
            throw new errors_1.ValidationError({
                area: ['Must be a positive number'],
            });
        }
        if (input.floor !== undefined && input.floor < 0) {
            throw new errors_1.ValidationError({
                floor: ['Must be a non-negative number'],
            });
        }
        if (input.rentAmount !== undefined && input.rentAmount < 0) {
            throw new errors_1.ValidationError({
                rentAmount: ['Must be a non-negative number'],
            });
        }
        if (input.securityDeposit !== undefined && input.securityDeposit < 0) {
            throw new errors_1.ValidationError({
                securityDeposit: ['Must be a non-negative number'],
            });
        }
        // 7. Create the unit
        const unitData = {
            propertyId: input.propertyId,
            organizationId: ctx.organizationId,
            unitNumber: input.unitNumber,
            name: input.name,
            floor: input.floor,
            block: input.block,
            unitType,
            status,
            bedrooms: input.bedrooms,
            bathrooms: input.bathrooms,
            area: input.area ? new client_1.Prisma.Decimal(input.area) : undefined,
            areaUnit: input.areaUnit || 'sqft',
            rentAmount: input.rentAmount ? new client_1.Prisma.Decimal(input.rentAmount) : undefined,
            securityDeposit: input.securityDeposit ? new client_1.Prisma.Decimal(input.securityDeposit) : undefined,
            availabilityDate: input.availabilityDate ? new Date(input.availabilityDate) : undefined,
            notes: input.notes,
            createdBy: ctx.userId,
            updatedBy: ctx.userId,
        };
        const unit = await unit_repository_1.unitRepository.create(unitData);
        logger_1.default.info('Unit created', {
            unitId: unit.id,
            propertyId: unit.propertyId,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
        });
        return unit;
    }
    /**
     * Get unit by ID
     */
    async getUnit(ctx, unitId) {
        const unit = await unit_repository_1.unitRepository.findByIdAndOrganizationId(unitId, ctx.organizationId);
        if (!unit) {
            logger_1.default.warn('Unit not found', {
                unitId,
                organizationId: ctx.organizationId,
            });
            throw new errors_1.NotFoundError('Unit not found in your organization');
        }
        return unit;
    }
    /**
     * Update a unit
     */
    async updateUnit(ctx, unitId, input) {
        // 1. Verify unit exists
        const unit = await unit_repository_1.unitRepository.findByIdAndOrganizationId(unitId, ctx.organizationId);
        if (!unit) {
            logger_1.default.warn('Unit not found', { unitId, organizationId: ctx.organizationId });
            throw new errors_1.NotFoundError('Unit not found in your organization');
        }
        // 2. If unit number is being updated, check uniqueness
        if (input.unitNumber && input.unitNumber !== unit.unitNumber) {
            const existingUnit = await unit_repository_1.unitRepository.findByUnitNumber(unit.propertyId, input.unitNumber);
            if (existingUnit) {
                logger_1.default.warn('Unit number already exists', {
                    propertyId: unit.propertyId,
                    unitNumber: input.unitNumber,
                });
                throw new errors_1.ConflictError('Unit number already exists in this property');
            }
        }
        // 3. Validate unit type if provided
        if (input.unitType) {
            const validUnitTypes = ['Studio', 'Apartment', 'Villa', 'Office', 'Shop', 'Warehouse', 'Parking', 'Storage'];
            if (!validUnitTypes.includes(input.unitType)) {
                logger_1.default.warn('Invalid unit type', { unitType: input.unitType });
                throw new errors_1.ValidationError({
                    unitType: ['Must be one of: ' + validUnitTypes.join(', ')],
                });
            }
        }
        // 4. Validate status if provided
        if (input.status) {
            const validStatuses = ['Available', 'Occupied', 'Reserved', 'Under Maintenance', 'Inactive'];
            if (!validStatuses.includes(input.status)) {
                logger_1.default.warn('Invalid status', { status: input.status });
                throw new errors_1.ValidationError({
                    status: ['Must be one of: ' + validStatuses.join(', ')],
                });
            }
        }
        // 5. Validate numeric values
        if (input.bedrooms !== undefined && input.bedrooms < 0) {
            throw new errors_1.ValidationError({
                bedrooms: ['Must be a non-negative number'],
            });
        }
        if (input.bathrooms !== undefined && input.bathrooms < 0) {
            throw new errors_1.ValidationError({
                bathrooms: ['Must be a non-negative number'],
            });
        }
        if (input.area !== undefined && input.area <= 0) {
            throw new errors_1.ValidationError({
                area: ['Must be a positive number'],
            });
        }
        if (input.floor !== undefined && input.floor < 0) {
            throw new errors_1.ValidationError({
                floor: ['Must be a non-negative number'],
            });
        }
        if (input.rentAmount !== undefined && input.rentAmount < 0) {
            throw new errors_1.ValidationError({
                rentAmount: ['Must be a non-negative number'],
            });
        }
        if (input.securityDeposit !== undefined && input.securityDeposit < 0) {
            throw new errors_1.ValidationError({
                securityDeposit: ['Must be a non-negative number'],
            });
        }
        // 6. Build update data
        const updateData = {
            updatedBy: ctx.userId,
        };
        if (input.unitNumber !== undefined)
            updateData.unitNumber = input.unitNumber;
        if (input.name !== undefined)
            updateData.name = input.name;
        if (input.floor !== undefined)
            updateData.floor = input.floor;
        if (input.block !== undefined)
            updateData.block = input.block;
        if (input.unitType !== undefined)
            updateData.unitType = input.unitType;
        if (input.status !== undefined)
            updateData.status = input.status;
        if (input.bedrooms !== undefined)
            updateData.bedrooms = input.bedrooms;
        if (input.bathrooms !== undefined)
            updateData.bathrooms = input.bathrooms;
        if (input.area !== undefined)
            updateData.area = new client_1.Prisma.Decimal(input.area);
        if (input.areaUnit !== undefined)
            updateData.areaUnit = input.areaUnit;
        if (input.rentAmount !== undefined)
            updateData.rentAmount = new client_1.Prisma.Decimal(input.rentAmount);
        if (input.securityDeposit !== undefined)
            updateData.securityDeposit = new client_1.Prisma.Decimal(input.securityDeposit);
        if (input.availabilityDate !== undefined)
            updateData.availabilityDate = new Date(input.availabilityDate);
        if (input.notes !== undefined)
            updateData.notes = input.notes;
        const updatedUnit = await unit_repository_1.unitRepository.update(unitId, updateData);
        logger_1.default.info('Unit updated', {
            unitId,
            propertyId: unit.propertyId,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
        });
        return updatedUnit;
    }
    /**
     * List units with search, filtering, and pagination
     */
    async listUnits(ctx, query) {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 20, 100);
        const pagination = new pagination_1.PaginationRequest(page, limit, query.sortBy || 'createdAt', query.sortOrder || 'desc', query.search);
        // If property ID is specified, verify it belongs to the organization
        if (query.propertyId) {
            const property = await property_repository_1.propertyRepository.findByIdAndOrganizationId(query.propertyId, ctx.organizationId);
            if (!property) {
                logger_1.default.warn('Property not found', {
                    propertyId: query.propertyId,
                    organizationId: ctx.organizationId,
                });
                throw new errors_1.NotFoundError('Property not found in your organization');
            }
        }
        // If search query provided, use search
        if (query.search) {
            const result = await unit_repository_1.unitRepository.search(ctx.organizationId, query.search, pagination, query.propertyId);
            return result;
        }
        // Otherwise use filter
        const filters = {};
        if (query.propertyId)
            filters.propertyId = query.propertyId;
        if (query.status)
            filters.status = query.status;
        if (query.unitType)
            filters.unitType = query.unitType;
        if (query.floor !== undefined)
            filters.floor = query.floor;
        if (query.block)
            filters.block = query.block;
        const result = await unit_repository_1.unitRepository.filter(ctx.organizationId, filters, pagination);
        return result;
    }
    /**
     * Delete unit (soft delete)
     */
    async deleteUnit(ctx, unitId) {
        // 1. Verify unit exists
        const unit = await unit_repository_1.unitRepository.findByIdAndOrganizationId(unitId, ctx.organizationId);
        if (!unit) {
            logger_1.default.warn('Unit not found', {
                unitId,
                organizationId: ctx.organizationId,
            });
            throw new errors_1.NotFoundError('Unit not found in your organization');
        }
        // 2. Soft delete
        const deletedUnit = await unit_repository_1.unitRepository.update(unitId, {
            deletedAt: new Date(),
            updatedBy: ctx.userId,
        });
        logger_1.default.info('Unit deleted', {
            unitId,
            propertyId: unit.propertyId,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
        });
        return deletedUnit;
    }
    /**
     * Restore deleted unit
     */
    async restoreUnit(ctx, unitId) {
        // Get unit directly without organization filter since it's deleted
        const unit = await prisma_1.default.unit.findFirst({
            where: {
                id: unitId,
                organizationId: ctx.organizationId,
            },
        });
        if (!unit) {
            logger_1.default.warn('Unit not found', { unitId, organizationId: ctx.organizationId });
            throw new errors_1.NotFoundError('Unit not found');
        }
        if (!unit.deletedAt) {
            logger_1.default.warn('Unit is not deleted', { unitId });
            throw new errors_1.ValidationError({
                unitId: ['Unit is not deleted'],
            });
        }
        // Restore
        const restoredUnit = await unit_repository_1.unitRepository.update(unitId, {
            deletedAt: null,
            updatedBy: ctx.userId,
        });
        logger_1.default.info('Unit restored', {
            unitId,
            propertyId: unit.propertyId,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
        });
        return restoredUnit;
    }
    /**
     * Get statistics for a property's units
     */
    async getPropertyStatistics(ctx, propertyId) {
        // Verify property exists and belongs to organization
        const property = await property_repository_1.propertyRepository.findByIdAndOrganizationId(propertyId, ctx.organizationId);
        if (!property) {
            logger_1.default.warn('Property not found', {
                propertyId,
                organizationId: ctx.organizationId,
            });
            throw new errors_1.NotFoundError('Property not found in your organization');
        }
        return await unit_repository_1.unitRepository.getPropertyStatistics(propertyId);
    }
    /**
     * Get statistics for an organization's units
     */
    async getOrganizationStatistics(ctx) {
        return await unit_repository_1.unitRepository.getOrganizationStatistics(ctx.organizationId);
    }
}
exports.UnitService = UnitService;
exports.unitService = new UnitService();
