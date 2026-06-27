import { Tenant, Prisma } from '@prisma/client';
import { tenantRepository } from '../repositories/tenant.repository';
import { organizationRepository } from '../repositories/organization.repository';
import { unitRepository } from '../repositories/unit.repository';
import prisma from '../config/prisma';
import logger from '../utils/logger';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';
import { PaginationRequest } from '../shared/core/pagination';

interface OrganizationActorContext {
  userId: string;
  organizationId: string;
}

export interface CreateTenantInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  governmentIdType?: string;
  governmentIdNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  occupation?: string;
  employer?: string;
  unitId?: string;
  status?: string;
  notes?: string;
}

export interface UpdateTenantInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  governmentIdType?: string;
  governmentIdNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  occupation?: string;
  employer?: string;
  unitId?: string;
  status?: string;
  notes?: string;
}

export interface ListTenantsQuery {
  page?: number;
  limit?: number;
  unitId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export class TenantService {
  /**
   * Create a new tenant
   */
  async createTenant(
    ctx: OrganizationActorContext,
    input: CreateTenantInput
  ): Promise<Tenant> {
    // 1. Verify organization exists
    const organization = await organizationRepository.findById(ctx.organizationId);
    if (!organization) {
      logger.warn('Organization not found', { organizationId: ctx.organizationId });
      throw new ForbiddenError('Organization not found');
    }

    // 2. Validate email uniqueness within organization
    const existingTenant = await tenantRepository.findByEmail(ctx.organizationId, input.email);
    if (existingTenant) {
      logger.warn('Tenant email already exists', {
        organizationId: ctx.organizationId,
        email: input.email,
      });
      throw new ConflictError('Tenant with this email already exists in your organization');
    }

    // 3. Validate unit if provided
    if (input.unitId) {
      const unit = await unitRepository.findByIdAndOrganizationId(input.unitId, ctx.organizationId);
      if (!unit) {
        logger.warn('Unit not found', {
          unitId: input.unitId,
          organizationId: ctx.organizationId,
        });
        throw new NotFoundError('Unit not found in your organization');
      }
    }

    // 4. Validate status
    const validStatuses = ['Prospect', 'Active', 'Notice', 'Former', 'Blacklisted'];
    const status = input.status || 'Prospect';
    if (!validStatuses.includes(status)) {
      logger.warn('Invalid tenant status', { status });
      throw new ValidationError({
        status: ['Must be one of: ' + validStatuses.join(', ')],
      });
    }

    // 5. Validate email format
    if (!this.isValidEmail(input.email)) {
      throw new ValidationError({
        email: ['Invalid email format'],
      });
    }

    // 6. Create the tenant
    const tenantData = {
      organizationId: ctx.organizationId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      governmentIdType: input.governmentIdType,
      governmentIdNumber: input.governmentIdNumber,
      emergencyContactName: input.emergencyContactName,
      emergencyContactPhone: input.emergencyContactPhone,
      occupation: input.occupation,
      employer: input.employer,
      unitId: input.unitId,
      status,
      notes: input.notes,
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
    };

    const tenant = await tenantRepository.create(tenantData);

    logger.info('Tenant created', {
      tenantId: tenant.id,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });

    return tenant;
  }

  /**
   * Get tenant by ID
   */
  async getTenant(ctx: OrganizationActorContext, tenantId: string): Promise<Tenant> {
    const tenant = await tenantRepository.findByIdAndOrganizationId(tenantId, ctx.organizationId);

    if (!tenant) {
      logger.warn('Tenant not found', {
        tenantId,
        organizationId: ctx.organizationId,
      });
      throw new NotFoundError('Tenant not found in your organization');
    }

    return tenant;
  }

  /**
   * Update a tenant
   */
  async updateTenant(
    ctx: OrganizationActorContext,
    tenantId: string,
    input: UpdateTenantInput
  ): Promise<Tenant> {
    // 1. Verify tenant exists
    const tenant = await tenantRepository.findByIdAndOrganizationId(tenantId, ctx.organizationId);
    if (!tenant) {
      logger.warn('Tenant not found', { tenantId, organizationId: ctx.organizationId });
      throw new NotFoundError('Tenant not found in your organization');
    }

    // 2. If email is being updated, check uniqueness
    if (input.email && input.email !== tenant.email) {
      const existingTenant = await tenantRepository.findByEmail(ctx.organizationId, input.email);
      if (existingTenant) {
        logger.warn('Tenant email already exists', {
          organizationId: ctx.organizationId,
          email: input.email,
        });
        throw new ConflictError('Tenant with this email already exists in your organization');
      }
    }

    // 3. If email provided, validate format
    if (input.email && !this.isValidEmail(input.email)) {
      throw new ValidationError({
        email: ['Invalid email format'],
      });
    }

    // 4. Validate unit if provided
    if (input.unitId !== undefined) {
      if (input.unitId) {
        const unit = await unitRepository.findByIdAndOrganizationId(input.unitId, ctx.organizationId);
        if (!unit) {
          logger.warn('Unit not found', {
            unitId: input.unitId,
            organizationId: ctx.organizationId,
          });
          throw new NotFoundError('Unit not found in your organization');
        }
      }
    }

    // 5. Validate status if provided
    if (input.status) {
      const validStatuses = ['Prospect', 'Active', 'Notice', 'Former', 'Blacklisted'];
      if (!validStatuses.includes(input.status)) {
        logger.warn('Invalid tenant status', { status: input.status });
        throw new ValidationError({
          status: ['Must be one of: ' + validStatuses.join(', ')],
        });
      }
    }

    // 6. Build update data
    const updateData: Prisma.TenantUpdateInput = {
      updatedBy: ctx.userId,
    };

    if (input.firstName !== undefined) updateData.firstName = input.firstName;
    if (input.lastName !== undefined) updateData.lastName = input.lastName;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.dateOfBirth !== undefined) updateData.dateOfBirth = new Date(input.dateOfBirth);
    if (input.governmentIdType !== undefined) updateData.governmentIdType = input.governmentIdType;
    if (input.governmentIdNumber !== undefined) updateData.governmentIdNumber = input.governmentIdNumber;
    if (input.emergencyContactName !== undefined) updateData.emergencyContactName = input.emergencyContactName;
    if (input.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = input.emergencyContactPhone;
    if (input.occupation !== undefined) updateData.occupation = input.occupation;
    if (input.employer !== undefined) updateData.employer = input.employer;
    if (input.unitId !== undefined) {
      if (input.unitId) {
        updateData.unit = { connect: { id: input.unitId } };
      } else {
        updateData.unit = { disconnect: true };
      }
    }
    if (input.status !== undefined) updateData.status = input.status;
    if (input.notes !== undefined) updateData.notes = input.notes;

    const updatedTenant = await tenantRepository.update(tenantId, updateData);

    logger.info('Tenant updated', {
      tenantId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });

    return updatedTenant;
  }

  /**
   * List tenants with search, filtering, and pagination
   */
  async listTenants(
    ctx: OrganizationActorContext,
    query: ListTenantsQuery
  ): Promise<any> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);

    const pagination = new PaginationRequest(page, limit, query.sortBy || 'createdAt', query.sortOrder || 'desc', query.search);

    // If unit ID is specified, verify it belongs to the organization
    if (query.unitId) {
      const unit = await unitRepository.findByIdAndOrganizationId(query.unitId, ctx.organizationId);
      if (!unit) {
        logger.warn('Unit not found', {
          unitId: query.unitId,
          organizationId: ctx.organizationId,
        });
        throw new NotFoundError('Unit not found in your organization');
      }
    }

    // If search query provided, use search
    if (query.search) {
      const result = await tenantRepository.search(
        ctx.organizationId,
        query.search,
        pagination,
        query.unitId
      );

      return result;
    }

    // Otherwise use filter
    const filters: any = {};

    if (query.unitId) filters.unitId = query.unitId;
    if (query.status) filters.status = query.status;

    const result = await tenantRepository.filter(
      ctx.organizationId,
      filters,
      pagination
    );

    return result;
  }

  /**
   * Delete tenant (soft delete)
   */
  async deleteTenant(ctx: OrganizationActorContext, tenantId: string): Promise<Tenant> {
    // 1. Verify tenant exists
    const tenant = await tenantRepository.findByIdAndOrganizationId(tenantId, ctx.organizationId);
    if (!tenant) {
      logger.warn('Tenant not found', {
        tenantId,
        organizationId: ctx.organizationId,
      });
      throw new NotFoundError('Tenant not found in your organization');
    }

    // 2. Soft delete
    const deletedTenant = await tenantRepository.update(tenantId, {
      deletedAt: new Date(),
      updatedBy: ctx.userId,
    });

    logger.info('Tenant deleted', {
      tenantId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });

    return deletedTenant;
  }

  /**
   * Restore deleted tenant
   */
  async restoreTenant(ctx: OrganizationActorContext, tenantId: string): Promise<Tenant> {
    // Get tenant directly without organization filter since it's deleted
    const tenant = await prisma.tenant.findFirst({
      where: {
        id: tenantId,
        organizationId: ctx.organizationId,
      },
    });

    if (!tenant) {
      logger.warn('Tenant not found', { tenantId, organizationId: ctx.organizationId });
      throw new NotFoundError('Tenant not found');
    }

    if (!tenant.deletedAt) {
      logger.warn('Tenant is not deleted', { tenantId });
      throw new ValidationError({
        tenantId: ['Tenant is not deleted'],
      });
    }

    // Restore
    const restoredTenant = await tenantRepository.update(tenantId, {
      deletedAt: null,
      updatedBy: ctx.userId,
    });

    logger.info('Tenant restored', {
      tenantId,
      organizationId: ctx.organizationId,
      userId: ctx.userId,
    });

    return restoredTenant;
  }

  /**
   * Get statistics for a unit's tenants
   */
  async getUnitStatistics(
    ctx: OrganizationActorContext,
    unitId: string
  ): Promise<any> {
    // Verify unit exists and belongs to organization
    const unit = await unitRepository.findByIdAndOrganizationId(unitId, ctx.organizationId);
    if (!unit) {
      logger.warn('Unit not found', {
        unitId,
        organizationId: ctx.organizationId,
      });
      throw new NotFoundError('Unit not found in your organization');
    }

    const count = await tenantRepository.countByUnit(unitId);

    return {
      unitId,
      tenantCount: count,
    };
  }

  /**
   * Get statistics for an organization's tenants
   */
  async getOrganizationStatistics(ctx: OrganizationActorContext): Promise<any> {
    return await tenantRepository.getOrganizationStatistics(ctx.organizationId);
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export const tenantService = new TenantService();
