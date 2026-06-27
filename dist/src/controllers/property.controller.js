"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProperty = createProperty;
exports.updateProperty = updateProperty;
exports.getProperty = getProperty;
exports.listProperties = listProperties;
exports.deleteProperty = deleteProperty;
exports.restoreProperty = restoreProperty;
exports.getPropertyStatistics = getPropertyStatistics;
const property_service_1 = require("../services/property.service");
const response_1 = require("../shared/core/response");
/**
 * Get actor context from request
 */
function getActorContext(req) {
    if (!req.user) {
        throw new Error('User context not found');
    }
    return {
        userId: req.user.userId,
        organizationId: req.user.organizationId,
    };
}
/**
 * Safely extract param as string
 */
function getParam(param) {
    if (Array.isArray(param)) {
        return param[0];
    }
    return param || '';
}
/**
 * Create Property Endpoint
 * POST /api/v1/properties
 */
async function createProperty(req, res, next) {
    try {
        const ctx = getActorContext(req);
        const input = req.body;
        const property = await property_service_1.propertyService.createProperty(ctx, input);
        return response_1.ApiResponse.created(res, property, 'Property created successfully');
    }
    catch (error) {
        next(error);
    }
}
/**
 * Update Property Endpoint
 * PUT /api/v1/properties/:id
 */
async function updateProperty(req, res, next) {
    try {
        const ctx = getActorContext(req);
        const id = getParam(req.params.id);
        const input = req.body;
        const property = await property_service_1.propertyService.updateProperty(ctx, id, input);
        return response_1.ApiResponse.success(res, property, 'Property updated successfully');
    }
    catch (error) {
        next(error);
    }
}
/**
 * Get Property Endpoint
 * GET /api/v1/properties/:id
 */
async function getProperty(req, res, next) {
    try {
        const ctx = getActorContext(req);
        const id = getParam(req.params.id);
        const property = await property_service_1.propertyService.getProperty(ctx, id);
        return response_1.ApiResponse.success(res, property, 'Property retrieved successfully');
    }
    catch (error) {
        next(error);
    }
}
/**
 * List Properties Endpoint
 * GET /api/v1/properties
 */
async function listProperties(req, res, next) {
    try {
        const ctx = getActorContext(req);
        const query = {
            page: req.query.page ? parseInt(getParam(req.query.page)) : undefined,
            limit: req.query.limit ? parseInt(getParam(req.query.limit)) : undefined,
            status: getParam(req.query.status) || undefined,
            propertyType: getParam(req.query.propertyType) || undefined,
            city: getParam(req.query.city) || undefined,
            country: getParam(req.query.country) || undefined,
            search: getParam(req.query.search) || undefined,
            sortBy: getParam(req.query.sortBy) || undefined,
            sortOrder: (getParam(req.query.sortOrder) || undefined),
        };
        const result = await property_service_1.propertyService.listProperties(ctx, query);
        return response_1.ApiResponse.paginated(res, result.data, result.meta, 'Properties retrieved successfully');
    }
    catch (error) {
        next(error);
    }
}
/**
 * Delete Property Endpoint (Soft Delete)
 * DELETE /api/v1/properties/:id
 */
async function deleteProperty(req, res, next) {
    try {
        const ctx = getActorContext(req);
        const id = getParam(req.params.id);
        const property = await property_service_1.propertyService.deleteProperty(ctx, id);
        return response_1.ApiResponse.success(res, property, 'Property deleted successfully');
    }
    catch (error) {
        next(error);
    }
}
/**
 * Restore Property Endpoint
 * PATCH /api/v1/properties/:id/restore
 */
async function restoreProperty(req, res, next) {
    try {
        const ctx = getActorContext(req);
        const id = getParam(req.params.id);
        const property = await property_service_1.propertyService.restoreProperty(ctx, id);
        return response_1.ApiResponse.success(res, property, 'Property restored successfully');
    }
    catch (error) {
        next(error);
    }
}
/**
 * Get Property Statistics Endpoint
 * GET /api/v1/properties/stats
 */
async function getPropertyStatistics(req, res, next) {
    try {
        const ctx = getActorContext(req);
        const stats = await property_service_1.propertyService.getPropertyStatistics(ctx);
        return response_1.ApiResponse.success(res, stats, 'Property statistics retrieved successfully');
    }
    catch (error) {
        next(error);
    }
}
