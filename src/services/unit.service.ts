import { Unit, Prisma } from '@prisma/client';
import { unitRepository } from '../repositories/unit.repository';
import { propertyRepository } from '../repositories/property.repository';
import { organizationRepository } from '../repositories/organization.repository';
import prisma from '../config/prisma';
import logger from '../utils/logger';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';
import { PaginationRequest } from '../shared/core/pagination';

interface OrganizationActorContext {
  userId: string;
  organizationId: string;
}

export interface CreateUnitInput {
  propertyId: string;
  unitNumber: string;
  name?: string;
  floor?: number;
  block?: string;
  unitType?: string;
  status?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  areaUnit?: string;
  rentAmount?: number;
  securityDeposit?: number;
  availabilityDate?: string;
  notes?: string;
}

export interface UpdateUnitInput {
  unitNumber?: string;
  name?: string;
  floor?: number;
  block?: string;
  unitType?: string;
  status?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  areaUnit?: string;
  rentAmount?: number;
  securityDeposit?: number;
  availabilityDate?: string;
  notes?: string;
}

export interface ListUnitsQuery {
  page?: number;
  limit?: number;
  propertyId?: string;
  status?: string;
  unitType?: string;
  floor?: number;
  block?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export class UnitService {
  /**
   * Create a new unit
   */
  async createUnit(
    ctx: OrganizationActorContext,
    input: CreateUnitInput
  ): Promise<Unit> {
    // 1. Verify organization exists
    const organization = await organizationRepository.findById(ctx.organizationId);
    if (!organization) {
      logger.warn('Organization not found', { organizationId: ctx.organizationId });
      throw new ForbiddenError('Organization not found');
    }

    // 2. Verify property exists and belongs to organization
    const property = await propertyRepository.findByIdAndOrganizationId(input.propertyId, ctx.organizationId);
    if (!property) {
      logger.warn('Property not found', {
        propertyId: input.propertyId,
        organizationId: ctx.organizationId,
      });
      throw new NotFoundError('Property not found in your organization');
    }

    // 3. Validate unit number uniqueness within property
    const existingUnit = await unitRepository.findByUnitNumber(input.propertyId, input.unitNumber);
    if (existingUnit) {
      logger.warn('Unit number already exists', {
        propertyId: input.propertyId,
        unitNumber: input.unitNumber,
      });
      throw new ConflictError('Unit number already exists in this property');
    }

    // 4. Validate unit type
    const validUnitTypes = ['Studio', 'Apartment', 'Villa', 'Office', 'Shop', 'Warehouse', 'Parking', 'Storage'];
    const unitType = input.unitType || 'Apartment';
    if (!validUnitTypes.includes(unitType)) {
      logger.warn('Invalid unit type', { unitType });
      throw new ValidationError({
        unitType: ['Must be one of: ' + validUnitTypes.join(', ')],
      });
    }

    // 5. Validate status
    const validStatuses = ['Available', 'Occupied', 'Reserved', 'Under Maintenance', 'Inactive'];
    const status = input.status || 'Available';
    if (!validStatuses.includes(status)) {
      logger.warn('Invalid status', { status });
      throw new ValidationError({
        status: ['Must be one of: ' + validStatuses.join(', ')],
      });
    }

    // 6. Validate numeric values
    if (input.bedrooms !== undefined && input.bedrooms < 0) {
      throw new ValidationError({
        bedrooms: ['Must be a non-negative number'],
      });
    }

    if (input.bathrooms !== undefined && input.bathrooms < 0) {
      throw new ValidationError({
        bathrooms: ['Must be a non-negative number'],
      });
    }

    if (input.area !== undefined && input.area <= 0) {
      throw new ValidationError({
        area: ['Must be a positive number'],
      });
    }

    if (input.floor !== undefined && input.floor < 0) {
      throw new ValidationError({
        floor: ['Must be a non-negative number'],
      });
    }

    if (input.rentAmount !== undefined && input.rentAmount < 0) {
      throw new ValidationError({
        rentAmount: ['Must be a non-negative number'],
      });
    }

    if (input.securityDeposit !== undefined && input.securityDeposit < 0) {
      throw new ValidationError({
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
      area: input.area ? new Prisma.Decimal(input.area) : undefined,
      areaUnit: input.areaUnit || 'sqft',
      rentAmount: input.rentAmount ? new Prisma.Decimal(input.rentAmount) : undefined,
      securityDeposit: input.securityDeposit ? new Prisma.Decimal(input.securityDeposit) : undefined,
      availabilityDate: input.availabilityDate ? new Date(input.availabilityDate) : undefined,
      notes: input.notes,
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
    };

    const unit = await unitRepository.create(unitData);

    logger.info('Unit created', {
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
  async getUnit(ctx: OrganizationActorContext, unitId: string): Promise<Unit> {
    const unit = await unitRepository.findByIdAndOrganizationId(unitId, ctx.organizationId);

    if (!unit) {
      logger.warn('Unit not found', {
        unitId,
        organizationId: ctx.organizationId,
      });
      throw new NotFoundError('Unit not found in your organization');
    }

    return unit;
  }

  /**
   * Update a unit
   */
  async updateUnit(
    ctx: OrganizationActorContext,
    unitId: string,
    input: UpdateUnitInput
  ): Promise<Unit> {
    // 1. Verify unit exists
    const unit = await unitRepository.findByIdAndOrganizationId(unitId, ctx.organizationId);
    if (!unit) {
      logger.warn('Unit not found', { unitId, organizationId: ctx.organizationId });
      throw new NotFoundError('Unit not found in your organization');
    }

    // 2. If unit number is being updated, check uniqueness
    if (input.unitNumber && input.unitNumber !== unit.unitNumber) {
      const existingUnit = await unitRepository.findByUnitNumber(unit.propertyId, input.unitNumber);
      if (existingUnit) {
        logger.warn('Unit number already exists', {
          propertyId: unit.propertyId,
          unitNumber: input.unitNumber,
        });
        throw new ConflictError('Unit number already exists in this property');
      }
    }

    // 3. Validate unit type if provided
    if (input.unitType) {
      const validUnitTypes = ['Studio', 'Apartment', 'Villa', 'Office', 'Shop', 'Warehouse', 'Parking', 'Storage'];
      if (!validUnitTypes.includes(input.unitType)) {
        logger.warn('Invalid unit type', { unitType: input.unitType });
        throw new ValidationError({
          unitType: ['Must be one of: ' + validUnitTypes.join(', ')],
        });
      }
    }

    // 4. Validate status if provided
    if (input.status) {
      const validStatuses = ['Available', 'Occupied', 'Reserved', 'Under Maintenance', 'Inactive'];
      if (!validStatuses.includes(input.status)) {
        logger.warn('Invalid status', { status: input.status });
        throw new ValidationError({
          status: ['Must be one of: ' + validStatuses.join(', ')],
        });
      }
    }

    // 5. Validate numeric values
    if (input.bedrooms !== undefined && input.bedrooms < 0) {
      throw new ValidationError({
        bedrooms: ['Must be a non-negative number'],
      });
    }

    if (input.bathrooms !== undefined && input.bathrooms < 0) {
      throw new ValidationError({
        bathrooms: ['Must be a non-negative number'],
      });
    }

    if (input.area !== undefined && input.area <= 0) {
      throw new ValidationError({
        area: ['Must be a positive number'],
      });
    }

    if (input.floor !== undefined && input.floor < 0) {
      throw new ValidationError({
        floor: ['Must be a non-negative number'],
      });
    }

    if (input.rentAmount !== undefined && input.rentAmount < 0) {
      throw new ValidationError({
        rentAmount: ['Must be a non-negative number'],
      });
    }

    if (input.securityDeposit !== undefined && input.securityDeposit < 0) {
      throw new ValidationError({
        securityDeposit: ['Must be a non-negative number'],
      });
    }

    // 6. Build update data
    const updateData: Prisma.UnitUpdateInput = {
      updatedBy: ctx.userId,
    };

    if (input.unitNumber !== undefined) updateData.unitNumber = input.unitNumber;
    if (input.name !== undefined) updateData.name = input.name;
    if (input.floor !== undefined) updateData.floor = input.floor;
    if (input.block !== undefined) updateData.block = input.block;
    if (input.unitType !== undefined) updateData.unitType = input.unitType;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.bedrooms !== undefined) updateData.bedrooms = input.bedrooms;
    if (input.bathrooms !== undefined) updateData.bathrooms = input.bathrooms;
    if (input.area !== undefined) updateData.area = new Prisma.Decimal(input.area);
    if (input.areaUnit !== undefined) updateData.areaUnit = input.areaUnit;
    if (input.rentAmount !== undefined) updateData.rentAmount = new Prisma.Decimal(input.rentAmount);
    if (input.securityDeposit !== undefined) updateData.securityDeposit = new Prisma.Decimal(input.securityDeposit);
    if (input.availabilityDate !== undefined) updateData.availabilityDate = new Date(input.availabilityDate);
    if (input.notes !== undefined) updateData.notes = input.notes;

    const updatedUnit = await unitRepository.update(unitId, updateData);

    logger.info('Unit updated', {
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
  async listUnits(
    ctx: OrganizationActorContext,
    query: ListUnitsQuery
  ): Promise<any> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const pagination = new PaginationRequest(page, limit, query.sortBy || 'createdAt', query.sortOrder || 'desc', query.search);

    // If property ID is specified, verify it belongs to the organization
    if (query.propertyId) {
      const property = await propertyRepository.findByIdAndOrganizationId(query.propertyId, ctx.organizationId);
      if (!property) {
        logger.warn('Property not found', {
          propertyId: query.propertyId,
          organizationId: ctx.organizationId,
        });
        throw new NotFoundError('Property not found in your organization');
      }
    }

    // If search query provided, use search
    if (query.search) {
      const result = await unitRepository.search(
        ctx.organizationId,
        query.search,
        pagination,
        query.propertyId
      );

      return result;
    }

    // Otherwise use filter
    const filters: any = {};

    if (query.propertyId) filters.propertyId = query.propertyId;
    if (query.status) filters.status = query.status;
    if (query.unitType) filters.unitType = query.unitType;
    if (query.floor !== undefined) filters.floor = query.floor;
    if (query.block) filters.block = query.block;

    const result = await unitRepository.filter(
      ctx.organizationId,
      filters,
      pagination
    );

    return result;
  }

  /**
   * Delete unit (soft delete)
   */
  async deleteUnit(ctx: OrganizationActorContext, unitId: string): Promise<Unit> {
    // 1. Verify unit exists
    const unit = await unitRepository.findByIdAndOrganizationId(unitId, ctx.organizationId);
    if (!unit) {
      logger.warn('Unit not found', {
        unitId,
        organizationId: ctx.organizationId,
      });
      throw new NotFoundError('Unit not found in your organization');
    }

    // 2. Soft delete
    const deletedUnit = await unitRepository.update(unitId, {
      deletedAt: new Date(),
      updatedBy: ctx.userId,
    });

    logger.info('Unit deleted', {
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
  async restoreUnit(ctx: OrganizationActorContext, unitId: string): Promise<Unit> {
    // Get unit directly without organization filter since it's deleted
    const unit = await prisma.unit.findFirst({
      where: {
        id: unitId,
        organizationId: ctx.organizationId,
      },
    });

    if (!unit) {
      logger.warn('Unit not found', { unitId, organizationId: ctx.organizationId });
      throw new NotFoundError('Unit not found');
    }

    if (!unit.deletedAt) {
      logger.warn('Unit is not deleted', { unitId });
      throw new ValidationError({
        unitId: ['Unit is not deleted'],
      });
    }

    // Restore
    const restoredUnit = await unitRepository.update(unitId, {
      deletedAt: null,
      updatedBy: ctx.userId,
    });

    logger.info('Unit restored', {
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
  async getPropertyStatistics(
    ctx: OrganizationActorContext,
    propertyId: string
  ): Promise<any> {
    // Verify property exists and belongs to organization
    const property = await propertyRepository.findByIdAndOrganizationId(propertyId, ctx.organizationId);
    if (!property) {
      logger.warn('Property not found', {
        propertyId,
        organizationId: ctx.organizationId,
      });
      throw new NotFoundError('Property not found in your organization');
    }

    return await unitRepository.getPropertyStatistics(propertyId);
  }

  /**
   * Get statistics for an organization's units
   */
  async getOrganizationStatistics(ctx: OrganizationActorContext): Promise<any> {
    return await unitRepository.getOrganizationStatistics(ctx.organizationId);
  }
}

export const unitService = new UnitService();
