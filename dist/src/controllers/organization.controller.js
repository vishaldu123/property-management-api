"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listOrganizations = exports.getOrganization = exports.restoreOrganization = exports.softDeleteOrganization = exports.updateOrganization = exports.createOrganization = void 0;
const response_1 = require("../shared/core/response");
const organization_service_1 = require("../services/organization.service");
const organization_validators_1 = require("../validators/organization.validators");
const errors_1 = require("../utils/errors");
const getActorContext = (req) => {
    if (!req.user) {
        throw new errors_1.UnauthorizedError();
    }
    return {
        userId: req.user.userId,
        organizationId: req.user.organizationId,
    };
};
const createOrganization = async (req, res, next) => {
    try {
        const actorUserId = req.user?.userId;
        const organization = await organization_service_1.organizationService.createOrganization(req.body, actorUserId);
        response_1.ApiResponse.created(res, organization, 'Organization created successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.createOrganization = createOrganization;
const updateOrganization = async (req, res, next) => {
    try {
        const context = getActorContext(req);
        const organizationId = req.params.organizationId;
        const organization = await organization_service_1.organizationService.updateOrganization(organizationId, req.body, context);
        response_1.ApiResponse.success(res, organization, 'Organization updated successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.updateOrganization = updateOrganization;
const softDeleteOrganization = async (req, res, next) => {
    try {
        const context = getActorContext(req);
        const organizationId = req.params.organizationId;
        const organization = await organization_service_1.organizationService.softDeleteOrganization(organizationId, context);
        response_1.ApiResponse.success(res, organization, 'Organization deleted successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.softDeleteOrganization = softDeleteOrganization;
const restoreOrganization = async (req, res, next) => {
    try {
        const context = getActorContext(req);
        const organizationId = req.params.organizationId;
        const organization = await organization_service_1.organizationService.restoreOrganization(organizationId, context);
        response_1.ApiResponse.success(res, organization, 'Organization restored successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.restoreOrganization = restoreOrganization;
const getOrganization = async (req, res, next) => {
    try {
        const context = getActorContext(req);
        const organizationId = req.params.organizationId;
        const organization = await organization_service_1.organizationService.getOrganization(organizationId, context);
        response_1.ApiResponse.success(res, organization, 'Organization retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.getOrganization = getOrganization;
const listOrganizations = async (req, res, next) => {
    try {
        const context = getActorContext(req);
        const query = organization_validators_1.listOrganizationsQuerySchema.parse(req.query);
        const organizations = await organization_service_1.organizationService.listOrganizations(query, context);
        response_1.ApiResponse.paginated(res, organizations.data, organizations.meta, 'Organizations retrieved successfully');
    }
    catch (error) {
        next(error);
    }
};
exports.listOrganizations = listOrganizations;
