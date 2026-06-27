"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrganizationUnitStatistics = exports.getPropertyUnitStatistics = exports.restoreUnit = exports.deleteUnit = exports.listUnits = exports.updateUnit = exports.getUnit = exports.createUnit = void 0;
const unit_service_1 = require("../services/unit.service");
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
 * Create a new unit
 * POST /api/v1/units
 */
const createUnit = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const result = await unit_service_1.unitService.createUnit(ctx, req.body);
        return response_1.ApiResponse.created(res, result, 'Unit created');
    }
    catch (error) {
        next(error);
    }
};
exports.createUnit = createUnit;
/**
 * Get unit by ID
 * GET /api/v1/units/:id
 */
const getUnit = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const id = getParam(req.params.id);
        if (!id) {
            throw new Error('Unit ID is required');
        }
        const result = await unit_service_1.unitService.getUnit(ctx, id);
        return response_1.ApiResponse.success(res, result, 'Unit retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getUnit = getUnit;
/**
 * Update unit
 * PUT /api/v1/units/:id
 */
const updateUnit = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const id = getParam(req.params.id);
        if (!id) {
            throw new Error('Unit ID is required');
        }
        const result = await unit_service_1.unitService.updateUnit(ctx, id, req.body);
        return response_1.ApiResponse.success(res, result, 'Unit updated');
    }
    catch (error) {
        next(error);
    }
};
exports.updateUnit = updateUnit;
/**
 * List units with search, filtering, and pagination
 * GET /api/v1/units
 */
const listUnits = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const page = parseInt(getParam(req.query.page) || '1');
        const limit = parseInt(getParam(req.query.limit) || '20');
        const result = await unit_service_1.unitService.listUnits(ctx, {
            page,
            limit,
            propertyId: getParam(req.query.propertyId),
            status: getParam(req.query.status),
            unitType: getParam(req.query.unitType),
            floor: req.query.floor ? parseInt(getParam(req.query.floor) || '0') : undefined,
            block: getParam(req.query.block),
            sortBy: getParam(req.query.sortBy),
            sortOrder: getParam(req.query.sortOrder) || undefined,
            search: getParam(req.query.search),
        });
        return response_1.ApiResponse.paginated(res, result.data, result.meta, 'Units retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.listUnits = listUnits;
/**
 * Delete unit (soft delete)
 * DELETE /api/v1/units/:id
 */
const deleteUnit = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const id = getParam(req.params.id);
        if (!id) {
            throw new Error('Unit ID is required');
        }
        await unit_service_1.unitService.deleteUnit(ctx, id);
        return response_1.ApiResponse.success(res, null, 'Unit deleted');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUnit = deleteUnit;
/**
 * Restore deleted unit
 * PATCH /api/v1/units/:id/restore
 */
const restoreUnit = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const id = getParam(req.params.id);
        if (!id) {
            throw new Error('Unit ID is required');
        }
        const result = await unit_service_1.unitService.restoreUnit(ctx, id);
        return response_1.ApiResponse.success(res, result, 'Unit restored');
    }
    catch (error) {
        next(error);
    }
};
exports.restoreUnit = restoreUnit;
/**
 * Get property unit statistics
 * GET /api/v1/properties/:propertyId/units/stats
 */
const getPropertyUnitStatistics = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const propertyId = getParam(req.params.propertyId);
        if (!propertyId) {
            throw new Error('Property ID is required');
        }
        const result = await unit_service_1.unitService.getPropertyStatistics(ctx, propertyId);
        return response_1.ApiResponse.success(res, result, 'Property unit statistics retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getPropertyUnitStatistics = getPropertyUnitStatistics;
/**
 * Get organization unit statistics
 * GET /api/v1/units/stats
 */
const getOrganizationUnitStatistics = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const result = await unit_service_1.unitService.getOrganizationStatistics(ctx);
        return response_1.ApiResponse.success(res, result, 'Organization unit statistics retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getOrganizationUnitStatistics = getOrganizationUnitStatistics;
