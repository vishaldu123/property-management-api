"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreMaintenance = exports.deleteMaintenance = exports.getPropertyStats = exports.getOrganizationStats = exports.addNotes = exports.changeStatus = exports.assignTechnician = exports.updateMaintenance = exports.listMaintenance = exports.getMaintenance = exports.createMaintenance = void 0;
const maintenance_service_1 = require("../services/maintenance.service");
const response_1 = require("../shared/core/response");
const maintenance_validators_1 = require("../validators/maintenance.validators");
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
 * Create a new maintenance request
 * POST /api/v1/maintenance
 */
const createMaintenance = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const validation = maintenance_validators_1.createMaintenanceSchema.safeParse(req.body);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const request = await maintenance_service_1.maintenanceService.createRequest(ctx.organizationId, validation.data, ctx.userId);
        response_1.ApiResponse.created(res, request, 'Maintenance request created successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.createMaintenance = createMaintenance;
/**
 * Get maintenance request by ID
 * GET /api/v1/maintenance/:maintenanceId
 */
const getMaintenance = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = maintenance_validators_1.maintenanceIdParamSchema.safeParse({
            maintenanceId: getParam(req.params.maintenanceId),
        });
        if (!paramValidation.success) {
            const errors = paramValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const request = await maintenance_service_1.maintenanceService.getRequest(paramValidation.data.maintenanceId, ctx.organizationId);
        response_1.ApiResponse.success(res, request, 'Maintenance request retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getMaintenance = getMaintenance;
/**
 * List maintenance requests with filtering
 * GET /api/v1/maintenance
 */
const listMaintenance = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const validation = maintenance_validators_1.listMaintenanceSchema.safeParse(req.query);
        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const { page, limit, sortBy, sortOrder, ...filterData } = validation.data;
        const filter = {};
        if (filterData.status)
            filter.status = filterData.status;
        if (filterData.priority)
            filter.priority = filterData.priority;
        if (filterData.category)
            filter.category = filterData.category;
        if (filterData.propertyId)
            filter.propertyId = filterData.propertyId;
        if (filterData.unitId)
            filter.unitId = filterData.unitId;
        if (filterData.assignedTo)
            filter.assignedTo = filterData.assignedTo;
        if (filterData.startDate)
            filter.startDate = filterData.startDate;
        if (filterData.endDate)
            filter.endDate = filterData.endDate;
        const { requests, total } = await maintenance_service_1.maintenanceService.listRequests(ctx.organizationId, { page, limit, sortBy, sortOrder }, Object.keys(filter).length > 0 ? filter : undefined, filterData.search ? { query: filterData.search } : undefined);
        response_1.ApiResponse.success(res, {
            data: requests,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / (limit || 20)),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.listMaintenance = listMaintenance;
/**
 * Update maintenance request
 * PUT /api/v1/maintenance/:maintenanceId
 */
const updateMaintenance = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = maintenance_validators_1.maintenanceIdParamSchema.safeParse({
            maintenanceId: getParam(req.params.maintenanceId),
        });
        if (!paramValidation.success) {
            const errors = paramValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const bodyValidation = maintenance_validators_1.updateMaintenanceSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            const errors = bodyValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const request = await maintenance_service_1.maintenanceService.updateRequest(paramValidation.data.maintenanceId, ctx.organizationId, bodyValidation.data, ctx.userId);
        response_1.ApiResponse.success(res, request, 'Maintenance request updated');
    }
    catch (error) {
        next(error);
    }
};
exports.updateMaintenance = updateMaintenance;
/**
 * Assign technician to maintenance request
 * PATCH /api/v1/maintenance/:maintenanceId/assign
 */
const assignTechnician = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = maintenance_validators_1.maintenanceIdParamSchema.safeParse({
            maintenanceId: getParam(req.params.maintenanceId),
        });
        if (!paramValidation.success) {
            const errors = paramValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const bodyValidation = maintenance_validators_1.assignTechnicianSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            const errors = bodyValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const request = await maintenance_service_1.maintenanceService.assignTechnician(paramValidation.data.maintenanceId, ctx.organizationId, bodyValidation.data.assignedTo, ctx.userId);
        response_1.ApiResponse.success(res, request, 'Technician assigned successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.assignTechnician = assignTechnician;
/**
 * Change status of maintenance request
 * PATCH /api/v1/maintenance/:maintenanceId/change-status
 */
const changeStatus = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = maintenance_validators_1.maintenanceIdParamSchema.safeParse({
            maintenanceId: getParam(req.params.maintenanceId),
        });
        if (!paramValidation.success) {
            const errors = paramValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const bodyValidation = maintenance_validators_1.changeStatusSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            const errors = bodyValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const request = await maintenance_service_1.maintenanceService.changeStatus(paramValidation.data.maintenanceId, ctx.organizationId, bodyValidation.data.status, ctx.userId);
        response_1.ApiResponse.success(res, request, 'Status updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.changeStatus = changeStatus;
/**
 * Add notes to maintenance request
 * PATCH /api/v1/maintenance/:maintenanceId/notes
 */
const addNotes = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = maintenance_validators_1.maintenanceIdParamSchema.safeParse({
            maintenanceId: getParam(req.params.maintenanceId),
        });
        if (!paramValidation.success) {
            const errors = paramValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const bodyValidation = maintenance_validators_1.addNotesSchema.safeParse(req.body);
        if (!bodyValidation.success) {
            const errors = bodyValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const request = await maintenance_service_1.maintenanceService.updateRequest(paramValidation.data.maintenanceId, ctx.organizationId, { notes: bodyValidation.data.notes }, ctx.userId);
        response_1.ApiResponse.success(res, request, 'Notes added successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.addNotes = addNotes;
/**
 * Get organization maintenance statistics
 * GET /api/v1/maintenance/stats/organization
 */
const getOrganizationStats = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const stats = await maintenance_service_1.maintenanceService.getOrganizationStatistics(ctx.organizationId);
        response_1.ApiResponse.success(res, stats, 'Organization statistics retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getOrganizationStats = getOrganizationStats;
/**
 * Get property maintenance statistics
 * GET /api/v1/maintenance/properties/:propertyId/stats
 */
const getPropertyStats = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = maintenance_validators_1.propertyIdParamSchema.safeParse({
            propertyId: getParam(req.params.propertyId),
        });
        if (!paramValidation.success) {
            const errors = paramValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const stats = await maintenance_service_1.maintenanceService.getPropertyStatistics(ctx.organizationId, paramValidation.data.propertyId);
        response_1.ApiResponse.success(res, stats, 'Property statistics retrieved');
    }
    catch (error) {
        next(error);
    }
};
exports.getPropertyStats = getPropertyStats;
/**
 * Soft delete maintenance request
 * DELETE /api/v1/maintenance/:maintenanceId
 */
const deleteMaintenance = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = maintenance_validators_1.maintenanceIdParamSchema.safeParse({
            maintenanceId: getParam(req.params.maintenanceId),
        });
        if (!paramValidation.success) {
            const errors = paramValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        await maintenance_service_1.maintenanceService.deleteRequest(paramValidation.data.maintenanceId, ctx.organizationId, ctx.userId);
        response_1.ApiResponse.success(res, null, 'Maintenance request deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.deleteMaintenance = deleteMaintenance;
/**
 * Restore deleted maintenance request
 * PATCH /api/v1/maintenance/:maintenanceId/restore
 */
const restoreMaintenance = async (req, res, next) => {
    try {
        const ctx = getActorContext(req);
        const paramValidation = maintenance_validators_1.maintenanceIdParamSchema.safeParse({
            maintenanceId: getParam(req.params.maintenanceId),
        });
        if (!paramValidation.success) {
            const errors = paramValidation.error.flatten().fieldErrors;
            response_1.ApiResponse.validationError(res, errors, 'Validation failed');
            return;
        }
        const request = await maintenance_service_1.maintenanceService.restoreRequest(paramValidation.data.maintenanceId, ctx.organizationId, ctx.userId);
        response_1.ApiResponse.success(res, request, 'Maintenance request restored successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.restoreMaintenance = restoreMaintenance;
