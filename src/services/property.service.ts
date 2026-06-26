import { Property, Prisma } from '@prisma/client';
import { propertyRepository } from '../repositories/property.repository';
import { organizationRepository } from '../repositories/organization.repository';
import logger from '../utils/logger';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';
import { PaginationRequest } from '../shared/core/pagination';

interface OrganizationActorContext {
  userId: string;
  organizationId: string;
}

export interface CreatePropertyInput {
  name: string;
  code: string;
  description?: string;
  propertyType: string;
  status?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  totalUnits?: number;
  yearBuilt?: number;
  notes?: string;
}

export interface UpdatePropertyInput {
  name?: string;
  code?: string;
  description?: string;
  propertyType?: string;
  status?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  totalUnits?: number;
  yearBuilt?: number;
  notes?: string;
}

export interface ListPropertiesQuery {
  page?: number;
  limit?: number;
  status?: string;
  propertyType?: string;
  city?: string;
  country?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export class PropertyService {
  /**
   * Create a new property
   */
  async createProperty(
    ctx: OrganizationActorContext,
    input: CreatePropertyInput
  ): Promise<Property> {
    // 1. Verify organization exists
    const organization = await organizationRepository.findById(ctx.organizationId);
    if (!organization) {
      logger.warn('Organization not found', { organizationId: ctx.organizationId });
      throw new ForbiddenError('Organization not found');
    }

    // 2. Validate property code uniqueness within organization
    const existingProperty = await propertyRepository.findByCode(ctx.organizationId, input.code);
    if (existingProperty) {
      logger.warn('Property code already exists', {
        organizationId: ctx.organizationId,
        code: input.code,
      });
      throw new ConflictError('Property code already exists in this organization');
    }

    // 3. Validate property type is supported
    const validPropertyTypes = ['Apartment', 'Villa', 'Commercial', 'Office', 'Retail', 'Warehouse', 'Mixed Use', 'Land'];
    if (!validPropertyTypes.includes(input.propertyType)) {
      logger.warn('Invalid property type', { propertyType: input.propertyType });
      throw new ValidationError({
        propertyType: ['Must be one of: ' + validPropertyTypes.join(', ')],
      });
    }

    // 4. Validate status is supported
    const validStatuses = ['Draft', 'Active', 'Inactive', 'Archived'];
    const status = input.status || 'Draft';
    if (!validStatuses.includes(status)) {
      logger.warn('Invalid status', { status });
      throw new ValidationError({
        status: ['Must be one of: ' + validStatuses.join(', ')],
      });
    }

    // 5. Create property
    const property = await propertyRepository.create({
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
      latitude: input.latitude ? new Prisma.Decimal(input.latitude) : null,
      longitude: input.longitude ? new Prisma.Decimal(input.longitude) : null,
      timezone: input.timezone || 'UTC',
      totalUnits: input.totalUnits,
      yearBuilt: input.yearBuilt,
      notes: input.notes,
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
    });

    logger.info('Property created', {
      propertyId: property.id,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });

    return property;
  }

  /**
   * Update an existing property
   */
  async updateProperty(
    ctx: OrganizationActorContext,
    propertyId: string,
    input: UpdatePropertyInput
  ): Promise<Property> {
    // 1. Verify property exists and belongs to organization
    const property = await propertyRepository.findByIdAndOrganizationId(propertyId, ctx.organizationId);
    if (!property) {
      logger.warn('Property not found', { propertyId, organizationId: ctx.organizationId });
      throw new NotFoundError('Property not found');
    }

    // 2. If code is being updated, check uniqueness
    if (input.code && input.code !== property.code) {
      const existingProperty = await propertyRepository.findByCode(ctx.organizationId, input.code);
      if (existingProperty) {
        logger.warn('Property code already exists', {
          organizationId: ctx.organizationId,
          code: input.code,
        });
        throw new ConflictError('Property code already exists in this organization');
      }
    }

    // 3. Validate property type if provided
    if (input.propertyType) {
      const validPropertyTypes = ['Apartment', 'Villa', 'Commercial', 'Office', 'Retail', 'Warehouse', 'Mixed Use', 'Land'];
      if (!validPropertyTypes.includes(input.propertyType)) {
        logger.warn('Invalid property type', { propertyType: input.propertyType });
        throw new ValidationError({
          propertyType: ['Must be one of: ' + validPropertyTypes.join(', ')],
        });
      }
    }

    // 4. Validate status if provided
    if (input.status) {
      const validStatuses = ['Draft', 'Active', 'Inactive', 'Archived'];
      if (!validStatuses.includes(input.status)) {
        logger.warn('Invalid status', { status: input.status });
        throw new ValidationError({
          status: ['Must be one of: ' + validStatuses.join(', ')],
        });
      }
    }

    // 5. Build update data
    const updateData: Prisma.PropertyUpdateInput = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.code !== undefined) updateData.code = input.code;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.propertyType !== undefined) updateData.propertyType = input.propertyType;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.address !== undefined) updateData.address = input.address;
    if (input.city !== undefined) updateData.city = input.city;
    if (input.state !== undefined) updateData.state = input.state;
    if (input.country !== undefined) updateData.country = input.country;
    if (input.postalCode !== undefined) updateData.postalCode = input.postalCode;
    if (input.latitude !== undefined) updateData.latitude = new Prisma.Decimal(input.latitude);
    if (input.longitude !== undefined) updateData.longitude = new Prisma.Decimal(input.longitude);
    if (input.timezone !== undefined) updateData.timezone = input.timezone;
    if (input.totalUnits !== undefined) updateData.totalUnits = input.totalUnits;
    if (input.yearBuilt !== undefined) updateData.yearBuilt = input.yearBuilt;
    if (input.notes !== undefined) updateData.notes = input.notes;

    updateData.updatedBy = ctx.userId;

    const updatedProperty = await propertyRepository.update(propertyId, updateData);

    logger.info('Property updated', {
      propertyId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });

    return updatedProperty;
  }

  /**
   * Get a property by ID
   */
  async getProperty(
    ctx: OrganizationActorContext,
    propertyId: string
  ): Promise<Property> {
    const property = await propertyRepository.findByIdAndOrganizationId(propertyId, ctx.organizationId);
    if (!property) {
      logger.warn('Property not found', { propertyId, organizationId: ctx.organizationId });
      throw new NotFoundError('Property not found');
    }

    return property;
  }

  /**
   * List properties with pagination
   */
  async listProperties(
    ctx: OrganizationActorContext,
    query: ListPropertiesQuery
  ) {
    const pagination = new PaginationRequest(query.page || 1, query.limit || 10);

    const filters: {
      status?: string;
      propertyType?: string;
      city?: string;
      country?: string;
    } = {};

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
      const result = await propertyRepository.search(ctx.organizationId, query.search, pagination);
      logger.debug('Properties searched', {
        organizationId: ctx.organizationId,
        query: query.search,
        count: result.data.length,
      });
      return result;
    }

    // Use filter method
    const result = await propertyRepository.filter(ctx.organizationId, filters, pagination);

    logger.debug('Properties listed', {
      organizationId: ctx.organizationId,
      count: result.data.length,
    });

    return result;
  }

  /**
   * Soft delete a property
   */
  async deleteProperty(
    ctx: OrganizationActorContext,
    propertyId: string
  ): Promise<Property> {
    // 1. Verify property exists and belongs to organization
    const property = await propertyRepository.findByIdAndOrganizationId(propertyId, ctx.organizationId);
    if (!property) {
      logger.warn('Property not found', { propertyId, organizationId: ctx.organizationId });
      throw new NotFoundError('Property not found');
    }

    // 2. Soft delete
    const deletedProperty = await propertyRepository.softDelete(propertyId);

    logger.info('Property soft deleted', {
      propertyId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });

    return deletedProperty;
  }

  /**
   * Restore a soft-deleted property
   */
  async restoreProperty(
    ctx: OrganizationActorContext,
    propertyId: string
  ): Promise<Property> {
    // 1. Find deleted property by ID
    const property = await propertyRepository.findById(propertyId);
    if (!property || property.organizationId !== ctx.organizationId) {
      logger.warn('Property not found', { propertyId, organizationId: ctx.organizationId });
      throw new NotFoundError('Property not found');
    }

    if (!property.deletedAt) {
      logger.warn('Property is not deleted', { propertyId, organizationId: ctx.organizationId });
      throw new ValidationError({
        deletedAt: ['Property is not deleted and cannot be restored'],
      });
    }

    // 2. Restore
    const restoredProperty = await propertyRepository.restore(propertyId);

    logger.info('Property restored', {
      propertyId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });

    return restoredProperty;
  }

  /**
   * Get property statistics
   */
  async getPropertyStatistics(ctx: OrganizationActorContext) {
    const stats = await propertyRepository.getStatistics(ctx.organizationId);

    logger.debug('Property statistics retrieved', {
      organizationId: ctx.organizationId,
      stats,
    });

    return stats;
  }
}

export const propertyService = new PropertyService();
