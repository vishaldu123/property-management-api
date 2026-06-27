"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantService = exports.TenantService = void 0;
const tenant_repository_1 = require("../repositories/tenant.repository");
const organization_repository_1 = require("../repositories/organization.repository");
const unit_repository_1 = require("../repositories/unit.repository");
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
const pagination_1 = require("../shared/core/pagination");
class TenantService {
    /**
     * Create a new tenant
     */
    async createTenant(ctx, input) {
        // 1. Verify organization exists
        const organization = await organization_repository_1.organizationRepository.findById(ctx.organizationId);
        if (!organization) {
            logger_1.default.warn('Organization not found', { organizationId: ctx.organizationId });
            throw new errors_1.ForbiddenError('Organization not found');
        }
        // 2. Validate email uniqueness within organization
        const existingTenant = await tenant_repository_1.tenantRepository.findByEmail(ctx.organizationId, input.email);
        if (existingTenant) {
            logger_1.default.warn('Tenant email already exists', {
                organizationId: ctx.organizationId,
                email: input.email,
            });
            throw new errors_1.ConflictError('Tenant with this email already exists in your organization');
        }
        // 3. Validate unit if provided
        if (input.unitId) {
            const unit = await unit_repository_1.unitRepository.findByIdAndOrganizationId(input.unitId, ctx.organizationId);
            if (!unit) {
                logger_1.default.warn('Unit not found', {
                    unitId: input.unitId,
                    organizationId: ctx.organizationId,
                });
                throw new errors_1.NotFoundError('Unit not found in your organization');
            }
        }
        // 4. Validate status
        const validStatuses = ['Prospect', 'Active', 'Notice', 'Former', 'Blacklisted'];
        const status = input.status || 'Prospect';
        if (!validStatuses.includes(status)) {
            logger_1.default.warn('Invalid tenant status', { status });
            throw new errors_1.ValidationError({
                status: ['Must be one of: ' + validStatuses.join(', ')],
            });
        }
        // 5. Validate email format
        if (!this.isValidEmail(input.email)) {
            throw new errors_1.ValidationError({
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
        const tenant = await tenant_repository_1.tenantRepository.create(tenantData);
        logger_1.default.info('Tenant created', {
            tenantId: tenant.id,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
        });
        return tenant;
    }
    /**
     * Get tenant by ID
     */
    async getTenant(ctx, tenantId) {
        const tenant = await tenant_repository_1.tenantRepository.findByIdAndOrganizationId(tenantId, ctx.organizationId);
        if (!tenant) {
            logger_1.default.warn('Tenant not found', {
                tenantId,
                organizationId: ctx.organizationId,
            });
            throw new errors_1.NotFoundError('Tenant not found in your organization');
        }
        return tenant;
    }
    /**
     * Update a tenant
     */
    async updateTenant(ctx, tenantId, input) {
        // 1. Verify tenant exists
        const tenant = await tenant_repository_1.tenantRepository.findByIdAndOrganizationId(tenantId, ctx.organizationId);
        if (!tenant) {
            logger_1.default.warn('Tenant not found', { tenantId, organizationId: ctx.organizationId });
            throw new errors_1.NotFoundError('Tenant not found in your organization');
        }
        // 2. If email is being updated, check uniqueness
        if (input.email && input.email !== tenant.email) {
            const existingTenant = await tenant_repository_1.tenantRepository.findByEmail(ctx.organizationId, input.email);
            if (existingTenant) {
                logger_1.default.warn('Tenant email already exists', {
                    organizationId: ctx.organizationId,
                    email: input.email,
                });
                throw new errors_1.ConflictError('Tenant with this email already exists in your organization');
            }
        }
        // 3. If email provided, validate format
        if (input.email && !this.isValidEmail(input.email)) {
            throw new errors_1.ValidationError({
                email: ['Invalid email format'],
            });
        }
        // 4. Validate unit if provided
        if (input.unitId !== undefined) {
            if (input.unitId) {
                const unit = await unit_repository_1.unitRepository.findByIdAndOrganizationId(input.unitId, ctx.organizationId);
                if (!unit) {
                    logger_1.default.warn('Unit not found', {
                        unitId: input.unitId,
                        organizationId: ctx.organizationId,
                    });
                    throw new errors_1.NotFoundError('Unit not found in your organization');
                }
            }
        }
        // 5. Validate status if provided
        if (input.status) {
            const validStatuses = ['Prospect', 'Active', 'Notice', 'Former', 'Blacklisted'];
            if (!validStatuses.includes(input.status)) {
                logger_1.default.warn('Invalid tenant status', { status: input.status });
                throw new errors_1.ValidationError({
                    status: ['Must be one of: ' + validStatuses.join(', ')],
                });
            }
        }
        // 6. Build update data
        const updateData = {
            updatedBy: ctx.userId,
        };
        if (input.firstName !== undefined)
            updateData.firstName = input.firstName;
        if (input.lastName !== undefined)
            updateData.lastName = input.lastName;
        if (input.email !== undefined)
            updateData.email = input.email;
        if (input.phone !== undefined)
            updateData.phone = input.phone;
        if (input.dateOfBirth !== undefined)
            updateData.dateOfBirth = new Date(input.dateOfBirth);
        if (input.governmentIdType !== undefined)
            updateData.governmentIdType = input.governmentIdType;
        if (input.governmentIdNumber !== undefined)
            updateData.governmentIdNumber = input.governmentIdNumber;
        if (input.emergencyContactName !== undefined)
            updateData.emergencyContactName = input.emergencyContactName;
        if (input.emergencyContactPhone !== undefined)
            updateData.emergencyContactPhone = input.emergencyContactPhone;
        if (input.occupation !== undefined)
            updateData.occupation = input.occupation;
        if (input.employer !== undefined)
            updateData.employer = input.employer;
        if (input.unitId !== undefined) {
            if (input.unitId) {
                updateData.unit = { connect: { id: input.unitId } };
            }
            else {
                updateData.unit = { disconnect: true };
            }
        }
        if (input.status !== undefined)
            updateData.status = input.status;
        if (input.notes !== undefined)
            updateData.notes = input.notes;
        const updatedTenant = await tenant_repository_1.tenantRepository.update(tenantId, updateData);
        logger_1.default.info('Tenant updated', {
            tenantId,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
        });
        return updatedTenant;
    }
    /**
     * List tenants with search, filtering, and pagination
     */
    async listTenants(ctx, query) {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 20, 100);
        const pagination = new pagination_1.PaginationRequest(page, limit, query.sortBy || 'createdAt', query.sortOrder || 'desc', query.search);
        // If unit ID is specified, verify it belongs to the organization
        if (query.unitId) {
            const unit = await unit_repository_1.unitRepository.findByIdAndOrganizationId(query.unitId, ctx.organizationId);
            if (!unit) {
                logger_1.default.warn('Unit not found', {
                    unitId: query.unitId,
                    organizationId: ctx.organizationId,
                });
                throw new errors_1.NotFoundError('Unit not found in your organization');
            }
        }
        // If search query provided, use search
        if (query.search) {
            const result = await tenant_repository_1.tenantRepository.search(ctx.organizationId, query.search, pagination, query.unitId);
            return result;
        }
        // Otherwise use filter
        const filters = {};
        if (query.unitId)
            filters.unitId = query.unitId;
        if (query.status)
            filters.status = query.status;
        const result = await tenant_repository_1.tenantRepository.filter(ctx.organizationId, filters, pagination);
        return result;
    }
    /**
     * Delete tenant (soft delete)
     */
    async deleteTenant(ctx, tenantId) {
        // 1. Verify tenant exists
        const tenant = await tenant_repository_1.tenantRepository.findByIdAndOrganizationId(tenantId, ctx.organizationId);
        if (!tenant) {
            logger_1.default.warn('Tenant not found', {
                tenantId,
                organizationId: ctx.organizationId,
            });
            throw new errors_1.NotFoundError('Tenant not found in your organization');
        }
        // 2. Soft delete
        const deletedTenant = await tenant_repository_1.tenantRepository.update(tenantId, {
            deletedAt: new Date(),
            updatedBy: ctx.userId,
        });
        logger_1.default.info('Tenant deleted', {
            tenantId,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
        });
        return deletedTenant;
    }
    /**
     * Restore deleted tenant
     */
    async restoreTenant(ctx, tenantId) {
        // Get tenant directly without organization filter since it's deleted
        const tenant = await prisma_1.default.tenant.findFirst({
            where: {
                id: tenantId,
                organizationId: ctx.organizationId,
            },
        });
        if (!tenant) {
            logger_1.default.warn('Tenant not found', { tenantId, organizationId: ctx.organizationId });
            throw new errors_1.NotFoundError('Tenant not found');
        }
        if (!tenant.deletedAt) {
            logger_1.default.warn('Tenant is not deleted', { tenantId });
            throw new errors_1.ValidationError({
                tenantId: ['Tenant is not deleted'],
            });
        }
        // Restore
        const restoredTenant = await tenant_repository_1.tenantRepository.update(tenantId, {
            deletedAt: null,
            updatedBy: ctx.userId,
        });
        logger_1.default.info('Tenant restored', {
            tenantId,
            organizationId: ctx.organizationId,
            userId: ctx.userId,
        });
        return restoredTenant;
    }
    /**
     * Get statistics for a unit's tenants
     */
    async getUnitStatistics(ctx, unitId) {
        // Verify unit exists and belongs to organization
        const unit = await unit_repository_1.unitRepository.findByIdAndOrganizationId(unitId, ctx.organizationId);
        if (!unit) {
            logger_1.default.warn('Unit not found', {
                unitId,
                organizationId: ctx.organizationId,
            });
            throw new errors_1.NotFoundError('Unit not found in your organization');
        }
        const count = await tenant_repository_1.tenantRepository.countByUnit(unitId);
        return {
            unitId,
            tenantCount: count,
        };
    }
    /**
     * Get statistics for an organization's tenants
     */
    async getOrganizationStatistics(ctx) {
        return await tenant_repository_1.tenantRepository.getOrganizationStatistics(ctx.organizationId);
    }
    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}
exports.TenantService = TenantService;
exports.tenantService = new TenantService();
