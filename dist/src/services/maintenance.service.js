"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceService = exports.MaintenanceService = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const maintenance_repository_1 = require("../repositories/maintenance.repository");
const property_repository_1 = require("../repositories/property.repository");
const unit_repository_1 = require("../repositories/unit.repository");
const tenant_repository_1 = require("../repositories/tenant.repository");
const user_repository_1 = require("../repositories/user.repository");
const organization_repository_1 = require("../repositories/organization.repository");
const exceptions_1 = require("../shared/exceptions");
// Maintenance request status transitions
const VALID_STATUS_TRANSITIONS = {
    Open: ['Assigned', 'Cancelled'],
    Assigned: ['Scheduled', 'Open', 'Cancelled'],
    Scheduled: ['In Progress', 'On Hold', 'Cancelled'],
    'In Progress': ['Completed', 'On Hold', 'Scheduled'],
    'On Hold': ['In Progress', 'Scheduled', 'Cancelled'],
    Completed: [], // Cannot transition from Completed
    Cancelled: ['Open'], // Can only reopen cancelled requests
};
const VALID_STATUSES = Object.keys(VALID_STATUS_TRANSITIONS);
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent', 'Emergency'];
const VALID_CATEGORIES = [
    'Plumbing',
    'Electrical',
    'HVAC',
    'Structural',
    'Cleaning',
    'Pest Control',
    'Other',
];
/**
 * Maintenance Request Service
 * Handles business logic for maintenance requests
 */
class MaintenanceService {
    /**
     * Create a new maintenance request
     */
    async createRequest(organizationId, data, userId) {
        // Verify organization exists
        const org = await organization_repository_1.organizationRepository.findById(organizationId);
        if (!org) {
            throw new exceptions_1.NotFoundError('Organization not found');
        }
        // Verify property exists
        const property = await property_repository_1.propertyRepository.findByIdAndOrganizationId(data.propertyId, organizationId);
        if (!property) {
            throw new exceptions_1.NotFoundError('Property not found');
        }
        // Verify unit if provided
        if (data.unitId) {
            const unit = await unit_repository_1.unitRepository.findByIdAndOrganizationId(data.unitId, organizationId);
            if (!unit) {
                throw new exceptions_1.NotFoundError('Unit not found');
            }
        }
        // Verify tenant if provided
        if (data.tenantId) {
            const tenant = await tenant_repository_1.tenantRepository.findByIdAndOrganizationId(data.tenantId, organizationId);
            if (!tenant) {
                throw new exceptions_1.NotFoundError('Tenant not found');
            }
        }
        // Verify assigned user if provided
        if (data.assignedTo) {
            const assignedUser = await user_repository_1.userRepository.findById(data.assignedTo);
            if (!assignedUser) {
                throw new exceptions_1.NotFoundError('Assigned user not found');
            }
        }
        // Validate status
        if (!VALID_STATUSES.includes(data.status)) {
            throw new exceptions_1.ValidationError('Invalid maintenance status');
        }
        // Validate priority
        if (!VALID_PRIORITIES.includes(data.priority)) {
            throw new exceptions_1.ValidationError('Invalid priority level');
        }
        // Validate category
        if (!VALID_CATEGORIES.includes(data.category)) {
            throw new exceptions_1.ValidationError('Invalid maintenance category');
        }
        // Validate dates
        const requestedDate = new Date(data.requestedDate);
        if (data.scheduledDate) {
            const scheduledDate = new Date(data.scheduledDate);
            if (scheduledDate < requestedDate) {
                throw new exceptions_1.ValidationError('Scheduled date must be on or after requested date');
            }
        }
        // Validate cost values
        if (data.estimatedCost &&
            (Number(data.estimatedCost) < 0 || !Number.isFinite(Number(data.estimatedCost)))) {
            throw new exceptions_1.ValidationError('Estimated cost must be a positive number');
        }
        // Create the maintenance request
        const request = await maintenance_repository_1.maintenanceRepository.create(organizationId, data, userId);
        return request;
    }
    /**
     * Get maintenance request by ID
     */
    async getRequest(id, organizationId) {
        const request = await maintenance_repository_1.maintenanceRepository.findByIdAndOrganizationId(id, organizationId);
        if (!request) {
            throw new exceptions_1.NotFoundError('Maintenance request not found');
        }
        return request;
    }
    /**
     * List maintenance requests with filtering
     */
    async listRequests(organizationId, options, filter, search) {
        return maintenance_repository_1.maintenanceRepository.listWithFilters(organizationId, options, filter, search);
    }
    /**
     * Update maintenance request
     */
    async updateRequest(id, organizationId, data, userId) {
        const request = await maintenance_repository_1.maintenanceRepository.findByIdAndOrganizationId(id, organizationId);
        if (!request) {
            throw new exceptions_1.NotFoundError('Maintenance request not found');
        }
        // Cannot update completed requests
        if (request.status === 'Completed') {
            throw new exceptions_1.ValidationError('Cannot update a completed request. Use reopening workflow instead.');
        }
        // Validate status if provided
        if (data.status && data.status !== request.status) {
            if (!VALID_STATUSES.includes(data.status)) {
                throw new exceptions_1.ValidationError('Invalid maintenance status');
            }
            // Validate status transition
            const validTransitions = VALID_STATUS_TRANSITIONS[request.status] || [];
            if (!validTransitions.includes(data.status)) {
                throw new exceptions_1.ValidationError(`Cannot transition from ${request.status} to ${data.status}`);
            }
        }
        // Validate priority if provided
        if (data.priority && !VALID_PRIORITIES.includes(data.priority)) {
            throw new exceptions_1.ValidationError('Invalid priority level');
        }
        // Validate category if provided
        if (data.category && !VALID_CATEGORIES.includes(data.category)) {
            throw new exceptions_1.ValidationError('Invalid maintenance category');
        }
        // Verify assigned user if provided
        if (data.assignedTo && data.assignedTo !== request.assignedTo) {
            const assignedUser = await user_repository_1.userRepository.findById(data.assignedTo);
            if (!assignedUser) {
                throw new exceptions_1.NotFoundError('Assigned user not found');
            }
        }
        // Validate cost values
        if (data.estimatedCost) {
            if (Number(data.estimatedCost) < 0 || !Number.isFinite(Number(data.estimatedCost))) {
                throw new exceptions_1.ValidationError('Estimated cost must be a positive number');
            }
        }
        if (data.actualCost) {
            if (Number(data.actualCost) < 0 || !Number.isFinite(Number(data.actualCost))) {
                throw new exceptions_1.ValidationError('Actual cost must be a positive number');
            }
        }
        // Update the request
        return maintenance_repository_1.maintenanceRepository.update(id, organizationId, data, userId);
    }
    /**
     * Assign technician to maintenance request
     */
    async assignTechnician(id, organizationId, assignedTo, userId) {
        const request = await maintenance_repository_1.maintenanceRepository.findByIdAndOrganizationId(id, organizationId);
        if (!request) {
            throw new exceptions_1.NotFoundError('Maintenance request not found');
        }
        // Verify assigned user exists
        const assignedUser = await user_repository_1.userRepository.findById(assignedTo);
        if (!assignedUser) {
            throw new exceptions_1.NotFoundError('Assigned user not found');
        }
        // Check if valid transition to Assigned status
        const validTransitions = VALID_STATUS_TRANSITIONS[request.status] || [];
        if (!validTransitions.includes('Assigned') && request.status !== 'Assigned') {
            throw new exceptions_1.ValidationError(`Cannot assign technician from status: ${request.status}`);
        }
        return maintenance_repository_1.maintenanceRepository.assignTechnician(id, organizationId, assignedTo, userId);
    }
    /**
     * Change status of maintenance request
     */
    async changeStatus(id, organizationId, newStatus, userId) {
        const request = await maintenance_repository_1.maintenanceRepository.findByIdAndOrganizationId(id, organizationId);
        if (!request) {
            throw new exceptions_1.NotFoundError('Maintenance request not found');
        }
        // Validate new status
        if (!VALID_STATUSES.includes(newStatus)) {
            throw new exceptions_1.ValidationError('Invalid maintenance status');
        }
        // Validate status transition
        const validTransitions = VALID_STATUS_TRANSITIONS[request.status] || [];
        if (!validTransitions.includes(newStatus)) {
            throw new exceptions_1.ValidationError(`Cannot transition from ${request.status} to ${newStatus}`);
        }
        return maintenance_repository_1.maintenanceRepository.changeStatus(id, organizationId, newStatus, userId);
    }
    /**
     * Get organization maintenance statistics
     */
    async getOrganizationStatistics(organizationId) {
        // Verify organization exists
        const org = await organization_repository_1.organizationRepository.findById(organizationId);
        if (!org) {
            throw new exceptions_1.NotFoundError('Organization not found');
        }
        return maintenance_repository_1.maintenanceRepository.getOrganizationStatistics(organizationId);
    }
    /**
     * Get property maintenance statistics
     */
    async getPropertyStatistics(organizationId, propertyId) {
        // Verify property exists
        const property = await property_repository_1.propertyRepository.findByIdAndOrganizationId(propertyId, organizationId);
        if (!property) {
            throw new exceptions_1.NotFoundError('Property not found');
        }
        return maintenance_repository_1.maintenanceRepository.getPropertyStatistics(organizationId, propertyId);
    }
    /**
     * Delete maintenance request (soft delete)
     */
    async deleteRequest(id, organizationId, userId) {
        const request = await maintenance_repository_1.maintenanceRepository.findByIdAndOrganizationId(id, organizationId);
        if (!request) {
            throw new exceptions_1.NotFoundError('Maintenance request not found');
        }
        return maintenance_repository_1.maintenanceRepository.softDelete(id, organizationId, userId);
    }
    /**
     * Restore deleted maintenance request
     */
    async restoreRequest(id, organizationId, userId) {
        const request = await prisma_1.default.maintenanceRequest.findFirst({
            where: {
                id,
                organizationId,
                deletedAt: { not: null },
            },
        });
        if (!request) {
            throw new exceptions_1.NotFoundError('Maintenance request not found or not deleted');
        }
        return maintenance_repository_1.maintenanceRepository.restore(id, organizationId, userId);
    }
}
exports.MaintenanceService = MaintenanceService;
exports.maintenanceService = new MaintenanceService();
