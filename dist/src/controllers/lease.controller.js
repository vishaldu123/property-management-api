"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantLeaseStatistics = exports.getUnitLeaseStatistics = exports.getOrganizationLeaseStatistics = exports.terminateLease = exports.renewLease = exports.restoreLease = exports.deleteLease = exports.listLeases = exports.updateLease = exports.getLease = exports.createLease = void 0;
const lease_service_1 = require("../services/lease.service");
const logger_1 = __importDefault(require("../utils/logger"));
const response_1 = require("../shared/core/response");
const lease_validator_1 = require("../validators/lease.validator");
/**
 * Helper function to extract actor context from request
 */
function getActorContext(req) {
    return {
        userId: req.user?.userId || '',
        organizationId: req.user?.organizationId || '',
    };
}
/**
 * Helper function to safely extract parameter
 */
function getParam(param) {
    return typeof param === 'string' ? param : undefined;
}
/**
 * Create a new lease
 * POST /api/v1/leases
 */
const createLease = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const validation = lease_validator_1.createLeaseSchema.safeParse(req.body);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        // Parse dates
        const input = {
            ...validation.data,
            startDate: new Date(validation.data.startDate),
            endDate: new Date(validation.data.endDate),
            moveInDate: validation.data.moveInDate ? new Date(validation.data.moveInDate) : null,
            moveOutDate: validation.data.moveOutDate ? new Date(validation.data.moveOutDate) : null,
        };
        const lease = await lease_service_1.leaseService.createLease(ctx, input);
        response_1.ApiResponse.created(res, lease, 'Lease created successfully');
    }
    catch (error) {
        logger_1.default.error('Create lease endpoint error', error);
        next(error);
    }
};
exports.createLease = createLease;
/**
 * Get lease by ID
 * GET /api/v1/leases/:id
 */
const getLease = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const validation = lease_validator_1.leaseIdSchema.safeParse(req.params);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const lease = await lease_service_1.leaseService.getLease(ctx, validation.data.id);
        response_1.ApiResponse.success(res, lease, 'Lease retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getLease = getLease;
/**
 * Update lease
 * PUT /api/v1/leases/:id
 */
const updateLease = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramsValidation = lease_validator_1.leaseIdSchema.safeParse(req.params);
        if (!paramsValidation.success) {
            const errors = paramsValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const bodyValidation = lease_validator_1.updateLeaseSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            const errors = bodyValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        // Parse dates if provided
        const updateData = {
            ...bodyValidation.data,
        };
        if (bodyValidation.data.startDate) {
            updateData.startDate = new Date(bodyValidation.data.startDate);
        }
        if (bodyValidation.data.endDate) {
            updateData.endDate = new Date(bodyValidation.data.endDate);
        }
        if (bodyValidation.data.moveInDate) {
            updateData.moveInDate = new Date(bodyValidation.data.moveInDate);
        }
        if (bodyValidation.data.moveOutDate) {
            updateData.moveOutDate = new Date(bodyValidation.data.moveOutDate);
        }
        const lease = await lease_service_1.leaseService.updateLease(ctx, paramsValidation.data.id, updateData);
        response_1.ApiResponse.success(res, lease, 'Lease updated');
    }
    catch (error) {
        next(error);
    }
};
exports.updateLease = updateLease;
/**
 * List leases
 * GET /api/v1/leases
 */
const listLeases = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const validation = lease_validator_1.listLeasesSchema.safeParse(req.query);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const result = await lease_service_1.leaseService.listLeases(ctx, validation.data);
        response_1.ApiResponse.paginated(res, result.data, result.meta, 'Leases retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.listLeases = listLeases;
/**
 * Delete lease (soft delete)
 * DELETE /api/v1/leases/:id
 */
const deleteLease = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const validation = lease_validator_1.leaseIdSchema.safeParse(req.params);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const lease = await lease_service_1.leaseService.deleteLease(ctx, validation.data.id);
        response_1.ApiResponse.success(res, lease, 'Lease deleted');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteLease = deleteLease;
/**
 * Restore deleted lease
 * PATCH /api/v1/leases/:id/restore
 */
const restoreLease = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const validation = lease_validator_1.leaseIdSchema.safeParse(req.params);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const lease = await lease_service_1.leaseService.restoreLease(ctx, validation.data.id);
        response_1.ApiResponse.success(res, lease, 'Lease restored');
    }
    catch (error) {
        next(error);
    }
};
exports.restoreLease = restoreLease;
/**
 * Renew lease
 * POST /api/v1/leases/:id/renew
 */
const renewLease = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramsValidation = lease_validator_1.leaseIdSchema.safeParse(req.params);
        if (!paramsValidation.success) {
            const errors = paramsValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const bodyValidation = lease_validator_1.renewLeaseSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            const errors = bodyValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const renewalInput = {
            newStartDate: new Date(bodyValidation.data.newStartDate),
            newEndDate: new Date(bodyValidation.data.newEndDate),
        };
        const lease = await lease_service_1.leaseService.renewLease(ctx, paramsValidation.data.id, renewalInput);
        response_1.ApiResponse.success(res, lease, 'Lease renewed');
    }
    catch (error) {
        next(error);
    }
};
exports.renewLease = renewLease;
/**
 * Terminate lease
 * POST /api/v1/leases/:id/terminate
 */
const terminateLease = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramsValidation = lease_validator_1.leaseIdSchema.safeParse(req.params);
        if (!paramsValidation.success) {
            const errors = paramsValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const bodyValidation = lease_validator_1.terminateLeaseSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            const errors = bodyValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const lease = await lease_service_1.leaseService.terminateLease(ctx, paramsValidation.data.id, bodyValidation.data.reason);
        response_1.ApiResponse.success(res, lease, 'Lease terminated');
    }
    catch (error) {
        next(error);
    }
};
exports.terminateLease = terminateLease;
/**
 * Get organization lease statistics
 * GET /api/v1/leases/stats
 */
const getOrganizationLeaseStatistics = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const stats = await lease_service_1.leaseService.getOrganizationStatistics(ctx);
        response_1.ApiResponse.success(res, stats, 'Organization lease statistics retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getOrganizationLeaseStatistics = getOrganizationLeaseStatistics;
/**
 * Get unit lease statistics
 * GET /api/v1/units/:unitId/leases/stats
 */
const getUnitLeaseStatistics = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const unitId = getParam(req.params.unitId);
        if (!unitId) {
            throw new Error('Unit ID is required');
        }
        const stats = await lease_service_1.leaseService.getUnitStatistics(ctx, unitId);
        response_1.ApiResponse.success(res, stats, 'Unit lease statistics retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getUnitLeaseStatistics = getUnitLeaseStatistics;
/**
 * Get tenant lease statistics
 * GET /api/v1/tenants/:tenantId/leases/stats
 */
const getTenantLeaseStatistics = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const tenantId = getParam(req.params.tenantId);
        if (!tenantId) {
            throw new Error('Tenant ID is required');
        }
        const stats = await lease_service_1.leaseService.getTenantStatistics(ctx, tenantId);
        response_1.ApiResponse.success(res, stats, 'Tenant lease statistics retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getTenantLeaseStatistics = getTenantLeaseStatistics;
