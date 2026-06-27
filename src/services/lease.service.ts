import { Lease } from '@prisma/client';
import { leaseRepository, CreateLeaseInput, UpdateLeaseInput, PaginationOptions, LeaseFilter } from '../repositories/lease.repository';
import { propertyRepository } from '../repositories/property.repository';
import { organizationRepository } from '../repositories/organization.repository';
import { unitRepository } from '../repositories/unit.repository';
import { tenantRepository } from '../repositories/tenant.repository';
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from '../utils/errors';
import logger from '../utils/logger';

export interface ActorContext {
  userId: string;
  organizationId: string;
}

export interface ListLeasesInput {
  page: number;
  limit: number;
  status?: string;
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
  sortBy?: 'startDate' | 'endDate' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export const LEASE_STATUSES = ['Draft', 'Pending', 'Active', 'Expired', 'Terminated', 'Renewed'] as const;
export const BILLING_CYCLES = ['monthly', 'quarterly', 'annual'] as const;

export class LeaseService {
  /**
   * Create a new lease
   */
  async createLease(ctx: ActorContext, input: CreateLeaseInput): Promise<Lease> {
    // Validate organization exists
    const organization = await organizationRepository.findByIdAndOrganizationId(ctx.organizationId, ctx.organizationId);
    if (!organization) {
      throw new ForbiddenError('Organization not found');
    }

    // Validate property exists and belongs to organization
    const property = await propertyRepository.findByIdAndOrganizationId(input.propertyId, ctx.organizationId);
    if (!property) {
      throw new NotFoundError('Property not found');
    }

    // Validate unit exists and belongs to property/organization
    const unit = await unitRepository.findByIdAndOrganizationId(input.unitId, ctx.organizationId);
    if (!unit || unit.propertyId !== input.propertyId) {
      throw new NotFoundError('Unit not found or does not belong to the property');
    }

    // Validate tenant exists and belongs to organization
    const tenant = await tenantRepository.findByIdAndOrganizationId(input.tenantId, ctx.organizationId);
    if (!tenant) {
      throw new NotFoundError('Tenant not found');
    }

    // Validate lease number is unique per organization
    const leaseExists = await leaseRepository.leaseNumberExists(ctx.organizationId, input.leaseNumber);
    if (leaseExists) {
      throw new ConflictError('Lease number already exists in this organization');
    }

    // Validate dates
    if (input.endDate <= input.startDate) {
      throw new ValidationError({
        endDate: ['End date must be after start date'],
      });
    }

    // Validate monetary values
    if (input.monthlyRent < 0) {
      throw new ValidationError({
        monthlyRent: ['Monthly rent must be a positive value'],
      });
    }

    if (input.securityDeposit < 0) {
      throw new ValidationError({
        securityDeposit: ['Security deposit must be a positive value'],
      });
    }

    // Validate billing cycle
    if (input.billingCycle && !BILLING_CYCLES.includes(input.billingCycle as any)) {
      throw new ValidationError({
        billingCycle: [`Billing cycle must be one of: ${BILLING_CYCLES.join(', ')}`],
      });
    }

    // Validate status
    if (input.status && !LEASE_STATUSES.includes(input.status as any)) {
      throw new ValidationError({
        status: [`Status must be one of: ${LEASE_STATUSES.join(', ')}`],
      });
    }

    // Check for overlapping leases on the same unit (if status is Active)
    if (input.status === 'Active') {
      const hasOverlapping = await leaseRepository.hasOverlappingLease(
        input.unitId,
        ctx.organizationId,
        input.startDate,
        input.endDate
      );

      if (hasOverlapping) {
        throw new ConflictError('An active or pending lease already exists for this unit during the specified period');
      }
    }

    // Create lease
    const lease = await leaseRepository.create(ctx.organizationId, input, ctx.userId);

    logger.info('Lease created', {
      leaseId: lease.id,
      organizationId: ctx.organizationId,
      leaseNumber: lease.leaseNumber,
      unitId: lease.unitId,
      tenantId: lease.tenantId,
    });

    return lease;
  }

  /**
   * Get lease by ID
   */
  async getLease(ctx: ActorContext, leaseId: string): Promise<Lease> {
    const lease = await leaseRepository.findByIdAndOrganizationId(leaseId, ctx.organizationId);

    if (!lease) {
      throw new NotFoundError('Lease not found');
    }

    return lease;
  }

  /**
   * Update lease
   */
  async updateLease(ctx: ActorContext, leaseId: string, input: UpdateLeaseInput): Promise<Lease> {
    // Verify lease exists
    const lease = await leaseRepository.findByIdAndOrganizationId(leaseId, ctx.organizationId);
    if (!lease) {
      throw new NotFoundError('Lease not found');
    }

    // Validate dates if provided
    if (input.startDate || input.endDate) {
      const startDate = input.startDate || lease.startDate;
      const endDate = input.endDate || lease.endDate;

      if (endDate <= startDate) {
        throw new ValidationError({
          endDate: ['End date must be after start date'],
        });
      }

      // Check for overlapping leases if dates are being changed
      const hasOverlapping = await leaseRepository.hasOverlappingLease(
        lease.unitId,
        ctx.organizationId,
        startDate,
        endDate,
        leaseId
      );

      if (hasOverlapping) {
        throw new ConflictError('Lease dates conflict with an existing lease for this unit');
      }
    }

    // Validate monetary values if provided
    if (input.monthlyRent !== undefined && input.monthlyRent < 0) {
      throw new ValidationError({
        monthlyRent: ['Monthly rent must be a positive value'],
      });
    }

    if (input.securityDeposit !== undefined && input.securityDeposit < 0) {
      throw new ValidationError({
        securityDeposit: ['Security deposit must be a positive value'],
      });
    }

    // Validate billing cycle if provided
    if (input.billingCycle && !BILLING_CYCLES.includes(input.billingCycle as any)) {
      throw new ValidationError({
        billingCycle: [`Billing cycle must be one of: ${BILLING_CYCLES.join(', ')}`],
      });
    }

    // Validate status if provided
    if (input.status && !LEASE_STATUSES.includes(input.status as any)) {
      throw new ValidationError({
        status: [`Status must be one of: ${LEASE_STATUSES.join(', ')}`],
      });
    }

    // Update lease
    const updatedLease = await leaseRepository.update(leaseId, ctx.organizationId, input, ctx.userId);

    logger.info('Lease updated', {
      leaseId: updatedLease.id,
      organizationId: ctx.organizationId,
      changes: input,
    });

    return updatedLease;
  }

  /**
   * List leases with pagination, filtering, and search
   */
  async listLeases(ctx: ActorContext, query: ListLeasesInput): Promise<{
    data: Lease[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const pagination: PaginationOptions = {
      page: Math.max(query.page, 1),
      limit: Math.min(query.limit, 100),
    };

    let result;

    // Use search if query string provided
    if (query.search) {
      result = await leaseRepository.search(
        ctx.organizationId,
        query.search,
        pagination,
        query.unitId,
        query.tenantId,
        query.status
      );
    } else {
      // Use filter for structured filtering
      const filters: LeaseFilter = {
        ...(query.status && { status: query.status }),
        ...(query.propertyId && { propertyId: query.propertyId }),
        ...(query.unitId && { unitId: query.unitId }),
        ...(query.tenantId && { tenantId: query.tenantId }),
      };

      result = await leaseRepository.filter(ctx.organizationId, filters, pagination);
    }

    return {
      data: result.leases,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / pagination.limit),
      },
    };
  }

  /**
   * Renew a lease
   */
  async renewLease(ctx: ActorContext, leaseId: string, renewalInput: {
    newStartDate: Date;
    newEndDate: Date;
  }): Promise<Lease> {
    // Verify lease exists
    const lease = await leaseRepository.findByIdAndOrganizationId(leaseId, ctx.organizationId);
    if (!lease) {
      throw new NotFoundError('Lease not found');
    }

    // Validate renewal eligibility
    if (lease.status === 'Terminated') {
      throw new ValidationError({
        status: ['Cannot renew a terminated lease'],
      });
    }

    if (!lease.renewalOption) {
      throw new ValidationError({
        renewalOption: ['This lease does not have renewal option enabled'],
      });
    }

    // Validate dates
    if (renewalInput.newEndDate <= renewalInput.newStartDate) {
      throw new ValidationError({
        newEndDate: ['End date must be after start date'],
      });
    }

    // Check for overlapping leases with new dates
    const hasOverlapping = await leaseRepository.hasOverlappingLease(
      lease.unitId,
      ctx.organizationId,
      renewalInput.newStartDate,
      renewalInput.newEndDate,
      leaseId
    );

    if (hasOverlapping) {
      throw new ConflictError('The renewal dates conflict with another lease for this unit');
    }

    // Update lease with renewal
    const renewedLease = await leaseRepository.update(
      leaseId,
      ctx.organizationId,
      {
        status: 'Renewed',
        startDate: renewalInput.newStartDate,
        endDate: renewalInput.newEndDate,
      } as UpdateLeaseInput,
      ctx.userId
    );

    logger.info('Lease renewed', {
      leaseId: renewedLease.id,
      organizationId: ctx.organizationId,
      newStartDate: renewalInput.newStartDate,
      newEndDate: renewalInput.newEndDate,
    });

    return renewedLease;
  }

  /**
   * Terminate a lease
   */
  async terminateLease(ctx: ActorContext, leaseId: string, terminationReason?: string): Promise<Lease> {
    // Verify lease exists
    const lease = await leaseRepository.findByIdAndOrganizationId(leaseId, ctx.organizationId);
    if (!lease) {
      throw new NotFoundError('Lease not found');
    }

    // Validate termination eligibility
    if (lease.status === 'Terminated') {
      throw new ValidationError({
        status: ['Lease is already terminated'],
      });
    }

    // Update lease status to terminated
    const terminatedLease = await leaseRepository.update(
      leaseId,
      ctx.organizationId,
      {
        status: 'Terminated',
        notes: terminationReason ?? lease.notes,
      },
      ctx.userId
    );

    logger.info('Lease terminated', {
      leaseId: terminatedLease.id,
      organizationId: ctx.organizationId,
      reason: terminationReason,
    });

    return terminatedLease;
  }

  /**
   * Delete lease (soft delete)
   */
  async deleteLease(ctx: ActorContext, leaseId: string): Promise<Lease> {
    // Verify lease exists
    const lease = await leaseRepository.findByIdAndOrganizationId(leaseId, ctx.organizationId);
    if (!lease) {
      throw new NotFoundError('Lease not found');
    }

    // Soft delete lease
    const deletedLease = await leaseRepository.delete(leaseId, ctx.organizationId, ctx.userId);

    logger.info('Lease deleted', {
      leaseId: deletedLease.id,
      organizationId: ctx.organizationId,
    });

    return deletedLease;
  }

  /**
   * Restore deleted lease
   */
  async restoreLease(ctx: ActorContext, leaseId: string): Promise<Lease> {
    // Use direct Prisma query to find deleted lease
    const prisma = require('../config/prisma').default;
    const lease = await prisma.lease.findFirst({
      where: {
        id: leaseId,
        organizationId: ctx.organizationId,
      },
    });

    if (!lease) {
      throw new NotFoundError('Lease not found');
    }

    // Restore lease
    const restoredLease = await leaseRepository.restore(leaseId, ctx.organizationId, ctx.userId);

    logger.info('Lease restored', {
      leaseId: restoredLease.id,
      organizationId: ctx.organizationId,
    });

    return restoredLease;
  }

  /**
   * Get organization lease statistics
   */
  async getOrganizationStatistics(ctx: ActorContext): Promise<{
    total: number;
    byStatus: Record<string, number>;
  }> {
    return leaseRepository.getOrganizationStatistics(ctx.organizationId);
  }

  /**
   * Get unit lease statistics
   */
  async getUnitStatistics(ctx: ActorContext, unitId: string): Promise<{
    totalLeases: number;
    activeLeases: number;
  }> {
    // Verify unit exists and belongs to organization
    const unit = await unitRepository.findByIdAndOrganizationId(unitId, ctx.organizationId);
    if (!unit) {
      throw new NotFoundError('Unit not found');
    }

    return leaseRepository.getUnitStatistics(unitId, ctx.organizationId);
  }

  /**
   * Get tenant lease statistics
   */
  async getTenantStatistics(ctx: ActorContext, tenantId: string): Promise<{
    totalLeases: number;
    activeLeases: number;
  }> {
    // Verify tenant exists and belongs to organization
    const tenant = await tenantRepository.findByIdAndOrganizationId(tenantId, ctx.organizationId);
    if (!tenant) {
      throw new NotFoundError('Tenant not found');
    }

    return leaseRepository.getTenantStatistics(tenantId, ctx.organizationId);
  }
}

export const leaseService = new LeaseService();
