"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaseService = exports.LeaseService = exports.BILLING_CYCLES = exports.LEASE_STATUSES = void 0;
const lease_repository_1 = require("../repositories/lease.repository");
const property_repository_1 = require("../repositories/property.repository");
const organization_repository_1 = require("../repositories/organization.repository");
const unit_repository_1 = require("../repositories/unit.repository");
const tenant_repository_1 = require("../repositories/tenant.repository");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
exports.LEASE_STATUSES = ['Draft', 'Pending', 'Active', 'Expired', 'Terminated', 'Renewed'];
exports.BILLING_CYCLES = ['monthly', 'quarterly', 'annual'];
class LeaseService {
    /**
     * Create a new lease
     */
    async createLease(ctx, input) {
        // Validate organization exists
        const organization = await organization_repository_1.organizationRepository.findByIdAndOrganizationId(ctx.organizationId, ctx.organizationId);
        if (!organization) {
            throw new errors_1.ForbiddenError('Organization not found');
        }
        // Validate property exists and belongs to organization
        const property = await property_repository_1.propertyRepository.findByIdAndOrganizationId(input.propertyId, ctx.organizationId);
        if (!property) {
            throw new errors_1.NotFoundError('Property not found');
        }
        // Validate unit exists and belongs to property/organization
        const unit = await unit_repository_1.unitRepository.findByIdAndOrganizationId(input.unitId, ctx.organizationId);
        if (!unit || unit.propertyId !== input.propertyId) {
            throw new errors_1.NotFoundError('Unit not found or does not belong to the property');
        }
        // Validate tenant exists and belongs to organization
        const tenant = await tenant_repository_1.tenantRepository.findByIdAndOrganizationId(input.tenantId, ctx.organizationId);
        if (!tenant) {
            throw new errors_1.NotFoundError('Tenant not found');
        }
        // Validate lease number is unique per organization
        const leaseExists = await lease_repository_1.leaseRepository.leaseNumberExists(ctx.organizationId, input.leaseNumber);
        if (leaseExists) {
            throw new errors_1.ConflictError('Lease number already exists in this organization');
        }
        // Validate dates
        if (input.endDate <= input.startDate) {
            throw new errors_1.ValidationError({
                endDate: ['End date must be after start date'],
            });
        }
        // Validate monetary values
        if (input.monthlyRent < 0) {
            throw new errors_1.ValidationError({
                monthlyRent: ['Monthly rent must be a positive value'],
            });
        }
        if (input.securityDeposit < 0) {
            throw new errors_1.ValidationError({
                securityDeposit: ['Security deposit must be a positive value'],
            });
        }
        // Validate billing cycle
        if (input.billingCycle && !exports.BILLING_CYCLES.includes(input.billingCycle)) {
            throw new errors_1.ValidationError({
                billingCycle: [`Billing cycle must be one of: ${exports.BILLING_CYCLES.join(', ')}`],
            });
        }
        // Validate status
        if (input.status && !exports.LEASE_STATUSES.includes(input.status)) {
            throw new errors_1.ValidationError({
                status: [`Status must be one of: ${exports.LEASE_STATUSES.join(', ')}`],
            });
        }
        // Check for overlapping leases on the same unit (if status is Active)
        if (input.status === 'Active') {
            const hasOverlapping = await lease_repository_1.leaseRepository.hasOverlappingLease(input.unitId, ctx.organizationId, input.startDate, input.endDate);
            if (hasOverlapping) {
                throw new errors_1.ConflictError('An active or pending lease already exists for this unit during the specified period');
            }
        }
        // Create lease
        const lease = await lease_repository_1.leaseRepository.create(ctx.organizationId, input, ctx.userId);
        logger_1.default.info('Lease created', {
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
    async getLease(ctx, leaseId) {
        const lease = await lease_repository_1.leaseRepository.findByIdAndOrganizationId(leaseId, ctx.organizationId);
        if (!lease) {
            throw new errors_1.NotFoundError('Lease not found');
        }
        return lease;
    }
    /**
     * Update lease
     */
    async updateLease(ctx, leaseId, input) {
        // Verify lease exists
        const lease = await lease_repository_1.leaseRepository.findByIdAndOrganizationId(leaseId, ctx.organizationId);
        if (!lease) {
            throw new errors_1.NotFoundError('Lease not found');
        }
        // Validate dates if provided
        if (input.startDate || input.endDate) {
            const startDate = input.startDate || lease.startDate;
            const endDate = input.endDate || lease.endDate;
            if (endDate <= startDate) {
                throw new errors_1.ValidationError({
                    endDate: ['End date must be after start date'],
                });
            }
            // Check for overlapping leases if dates are being changed
            if (input.startDate || input.endDate) {
                const hasOverlapping = await lease_repository_1.leaseRepository.hasOverlappingLease(lease.unitId, ctx.organizationId, startDate, endDate, leaseId);
                if (hasOverlapping) {
                    throw new errors_1.ConflictError('Lease dates conflict with an existing lease for this unit');
                }
            }
        }
        // Validate monetary values if provided
        if (input.monthlyRent !== undefined && input.monthlyRent < 0) {
            throw new errors_1.ValidationError({
                monthlyRent: ['Monthly rent must be a positive value'],
            });
        }
        if (input.securityDeposit !== undefined && input.securityDeposit < 0) {
            throw new errors_1.ValidationError({
                securityDeposit: ['Security deposit must be a positive value'],
            });
        }
        // Validate billing cycle if provided
        if (input.billingCycle && !exports.BILLING_CYCLES.includes(input.billingCycle)) {
            throw new errors_1.ValidationError({
                billingCycle: [`Billing cycle must be one of: ${exports.BILLING_CYCLES.join(', ')}`],
            });
        }
        // Validate status if provided
        if (input.status && !exports.LEASE_STATUSES.includes(input.status)) {
            throw new errors_1.ValidationError({
                status: [`Status must be one of: ${exports.LEASE_STATUSES.join(', ')}`],
            });
        }
        // Update lease
        const updatedLease = await lease_repository_1.leaseRepository.update(leaseId, ctx.organizationId, input, ctx.userId);
        logger_1.default.info('Lease updated', {
            leaseId: updatedLease.id,
            organizationId: ctx.organizationId,
            changes: input,
        });
        return updatedLease;
    }
    /**
     * List leases with pagination, filtering, and search
     */
    async listLeases(ctx, query) {
        const pagination = {
            page: Math.max(query.page, 1),
            limit: Math.min(query.limit, 100),
        };
        let result;
        // Use search if query string provided
        if (query.search) {
            result = await lease_repository_1.leaseRepository.search(ctx.organizationId, query.search, pagination, query.unitId, query.tenantId, query.status);
        }
        else {
            // Use filter for structured filtering
            const filters = {
                ...(query.status && { status: query.status }),
                ...(query.propertyId && { propertyId: query.propertyId }),
                ...(query.unitId && { unitId: query.unitId }),
                ...(query.tenantId && { tenantId: query.tenantId }),
            };
            result = await lease_repository_1.leaseRepository.filter(ctx.organizationId, filters, pagination);
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
    async renewLease(ctx, leaseId, renewalInput) {
        // Verify lease exists
        const lease = await lease_repository_1.leaseRepository.findByIdAndOrganizationId(leaseId, ctx.organizationId);
        if (!lease) {
            throw new errors_1.NotFoundError('Lease not found');
        }
        // Validate renewal eligibility
        if (lease.status === 'Terminated') {
            throw new errors_1.ValidationError({
                status: ['Cannot renew a terminated lease'],
            });
        }
        if (!lease.renewalOption) {
            throw new errors_1.ValidationError({
                renewalOption: ['This lease does not have renewal option enabled'],
            });
        }
        // Validate dates
        if (renewalInput.newEndDate <= renewalInput.newStartDate) {
            throw new errors_1.ValidationError({
                newEndDate: ['End date must be after start date'],
            });
        }
        // Check for overlapping leases with new dates
        const hasOverlapping = await lease_repository_1.leaseRepository.hasOverlappingLease(lease.unitId, ctx.organizationId, renewalInput.newStartDate, renewalInput.newEndDate, leaseId);
        if (hasOverlapping) {
            throw new errors_1.ConflictError('The renewal dates conflict with another lease for this unit');
        }
        // Update lease with renewal
        const renewedLease = await lease_repository_1.leaseRepository.update(leaseId, ctx.organizationId, {
            status: 'Renewed',
            startDate: renewalInput.newStartDate,
            endDate: renewalInput.newEndDate,
        }, ctx.userId);
        logger_1.default.info('Lease renewed', {
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
    async terminateLease(ctx, leaseId, terminationReason) {
        // Verify lease exists
        const lease = await lease_repository_1.leaseRepository.findByIdAndOrganizationId(leaseId, ctx.organizationId);
        if (!lease) {
            throw new errors_1.NotFoundError('Lease not found');
        }
        // Validate termination eligibility
        if (lease.status === 'Terminated') {
            throw new errors_1.ValidationError({
                status: ['Lease is already terminated'],
            });
        }
        // Update lease status to terminated
        const terminatedLease = await lease_repository_1.leaseRepository.update(leaseId, ctx.organizationId, {
            status: 'Terminated',
            notes: terminationReason || lease.notes,
        }, ctx.userId);
        logger_1.default.info('Lease terminated', {
            leaseId: terminatedLease.id,
            organizationId: ctx.organizationId,
            reason: terminationReason,
        });
        return terminatedLease;
    }
    /**
     * Delete lease (soft delete)
     */
    async deleteLease(ctx, leaseId) {
        // Verify lease exists
        const lease = await lease_repository_1.leaseRepository.findByIdAndOrganizationId(leaseId, ctx.organizationId);
        if (!lease) {
            throw new errors_1.NotFoundError('Lease not found');
        }
        // Soft delete lease
        const deletedLease = await lease_repository_1.leaseRepository.delete(leaseId, ctx.organizationId, ctx.userId);
        logger_1.default.info('Lease deleted', {
            leaseId: deletedLease.id,
            organizationId: ctx.organizationId,
        });
        return deletedLease;
    }
    /**
     * Restore deleted lease
     */
    async restoreLease(ctx, leaseId) {
        // Use direct Prisma query to find deleted lease
        const prisma = require('../config/prisma').default;
        const lease = await prisma.lease.findFirst({
            where: {
                id: leaseId,
                organizationId: ctx.organizationId,
            },
        });
        if (!lease) {
            throw new errors_1.NotFoundError('Lease not found');
        }
        // Restore lease
        const restoredLease = await lease_repository_1.leaseRepository.restore(leaseId, ctx.organizationId, ctx.userId);
        logger_1.default.info('Lease restored', {
            leaseId: restoredLease.id,
            organizationId: ctx.organizationId,
        });
        return restoredLease;
    }
    /**
     * Get organization lease statistics
     */
    async getOrganizationStatistics(ctx) {
        return lease_repository_1.leaseRepository.getOrganizationStatistics(ctx.organizationId);
    }
    /**
     * Get unit lease statistics
     */
    async getUnitStatistics(ctx, unitId) {
        // Verify unit exists and belongs to organization
        const unit = await unit_repository_1.unitRepository.findByIdAndOrganizationId(unitId, ctx.organizationId);
        if (!unit) {
            throw new errors_1.NotFoundError('Unit not found');
        }
        return lease_repository_1.leaseRepository.getUnitStatistics(unitId, ctx.organizationId);
    }
    /**
     * Get tenant lease statistics
     */
    async getTenantStatistics(ctx, tenantId) {
        // Verify tenant exists and belongs to organization
        const tenant = await tenant_repository_1.tenantRepository.findByIdAndOrganizationId(tenantId, ctx.organizationId);
        if (!tenant) {
            throw new errors_1.NotFoundError('Tenant not found');
        }
        return lease_repository_1.leaseRepository.getTenantStatistics(tenantId, ctx.organizationId);
    }
}
exports.LeaseService = LeaseService;
exports.leaseService = new LeaseService();
