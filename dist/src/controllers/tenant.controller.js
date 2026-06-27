"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnitTenantStatistics = exports.getOrganizationTenantStatistics = exports.restoreTenant = exports.deleteTenant = exports.listTenants = exports.updateTenant = exports.getTenant = exports.createTenant = void 0;
const tenant_service_1 = require("../services/tenant.service");
const response_1 = require("../shared/core/response");
/**
 * Get actor context from authenticated request
 */
function getActorContext(req) {
    if (!req.user) {
        throw new Error('User not authenticated');
    }
    return {
        userId: req.user.userId,
        organizationId: req.user.organizationId,
    };
}
/**
 * Safely extract parameter value (Express may return string or string[])
 */
function getParam(param) {
    if (Array.isArray(param)) {
        return param[0];
    }
    return param;
}
/**
 * Create a new tenant
 * POST /api/v1/tenants
 */
const createTenant = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const result = await tenant_service_1.tenantService.createTenant(ctx, req.body);
        return response_1.ApiResponse.created(res, result, 'Tenant created');
    }
    catch (error) {
        next(error);
    }
};
exports.createTenant = createTenant;
/**
 * Get tenant by ID
 * GET /api/v1/tenants/:id
 */
const getTenant = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const id = getParam(req.params.id);
        if (!id) {
            throw new Error('Tenant ID is required');
        }
        const result = await tenant_service_1.tenantService.getTenant(ctx, id);
        return response_1.ApiResponse.success(res, result, 'Tenant retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getTenant = getTenant;
/**
 * Update tenant
 * PUT /api/v1/tenants/:id
 */
const updateTenant = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const id = getParam(req.params.id);
        if (!id) {
            throw new Error('Tenant ID is required');
        }
        const result = await tenant_service_1.tenantService.updateTenant(ctx, id, req.body);
        return response_1.ApiResponse.success(res, result, 'Tenant updated');
    }
    catch (error) {
        next(error);
    }
};
exports.updateTenant = updateTenant;
/**
 * List tenants with search, filtering, and pagination
 * GET /api/v1/tenants
 */
const listTenants = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const page = parseInt(getParam(req.query.page) || '1');
        const limit = parseInt(getParam(req.query.limit) || '20');
        const result = await tenant_service_1.tenantService.listTenants(ctx, {
            page,
            limit,
            unitId: getParam(req.query.unitId),
            status: getParam(req.query.status),
            sortBy: getParam(req.query.sortBy),
            sortOrder: getParam(req.query.sortOrder) || undefined,
            search: getParam(req.query.search),
        });
        return response_1.ApiResponse.paginated(res, result.data, result.meta, 'Tenants retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.listTenants = listTenants;
/**
 * Delete tenant (soft delete)
 * DELETE /api/v1/tenants/:id
 */
const deleteTenant = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const id = getParam(req.params.id);
        if (!id) {
            throw new Error('Tenant ID is required');
        }
        await tenant_service_1.tenantService.deleteTenant(ctx, id);
        return response_1.ApiResponse.success(res, {}, 'Tenant deleted');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTenant = deleteTenant;
/**
 * Restore deleted tenant
 * PATCH /api/v1/tenants/:id/restore
 */
const restoreTenant = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const id = getParam(req.params.id);
        if (!id) {
            throw new Error('Tenant ID is required');
        }
        const result = await tenant_service_1.tenantService.restoreTenant(ctx, id);
        return response_1.ApiResponse.success(res, result, 'Tenant restored');
    }
    catch (error) {
        next(error);
    }
};
exports.restoreTenant = restoreTenant;
/**
 * Get organization tenant statistics
 * GET /api/v1/tenants/stats
 */
const getOrganizationTenantStatistics = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const result = await tenant_service_1.tenantService.getOrganizationStatistics(ctx);
        return response_1.ApiResponse.success(res, result, 'Organization tenant statistics retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getOrganizationTenantStatistics = getOrganizationTenantStatistics;
/**
 * Get unit tenant statistics
 * GET /api/v1/units/:unitId/tenants/stats
 */
const getUnitTenantStatistics = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const unitId = getParam(req.params.unitId);
        if (!unitId) {
            throw new Error('Unit ID is required');
        }
        const result = await tenant_service_1.tenantService.getUnitStatistics(ctx, unitId);
        return response_1.ApiResponse.success(res, result, 'Unit tenant statistics retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getUnitTenantStatistics = getUnitTenantStatistics;
