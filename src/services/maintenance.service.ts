import prisma from '../shared/infrastructure/prisma';
import { maintenanceRepository } from '../repositories/maintenance.repository';
import { propertyRepository } from '../repositories/property.repository';
import { unitRepository } from '../repositories/unit.repository';
import { tenantRepository } from '../repositories/tenant.repository';
import { userRepository } from '../repositories/user.repository';
import { organizationRepository } from '../repositories/organization.repository';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError,
} from '../shared/exceptions';
import {
  CreateMaintenanceInput,
  UpdateMaintenanceInput,
  PaginationOptions,
  MaintenanceFilter,
  MaintenanceSearchOptions,
} from '../validators/maintenance.validators';

// Maintenance request status transitions
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
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
export class MaintenanceService {
  /**
   * Create a new maintenance request
   */
  async createRequest(
    organizationId: string,
    data: CreateMaintenanceInput,
    userId: string
  ) {
    // Verify organization exists
    const org = await organizationRepository.findById(organizationId);
    if (!org) {
      throw new NotFoundError('Organization not found');
    }

    // Verify property exists
    const property = await propertyRepository.findByIdAndOrganizationId(
      data.propertyId,
      organizationId
    );
    if (!property) {
      throw new NotFoundError('Property not found');
    }

    // Verify unit if provided
    if (data.unitId) {
      const unit = await unitRepository.findByIdAndOrganizationId(
        data.unitId,
        organizationId
      );
      if (!unit) {
        throw new NotFoundError('Unit not found');
      }
    }

    // Verify tenant if provided
    if (data.tenantId) {
      const tenant = await tenantRepository.findByIdAndOrganizationId(
        data.tenantId,
        organizationId
      );
      if (!tenant) {
        throw new NotFoundError('Tenant not found');
      }
    }

    // Verify assigned user if provided
    if (data.assignedTo) {
      const assignedUser = await userRepository.findById(data.assignedTo);
      if (!assignedUser) {
        throw new NotFoundError('Assigned user not found');
      }
    }

    // Validate unique request number
    const existingRequest = await maintenanceRepository.findByIdAndOrganizationId(
      '', // dummy
      organizationId
    );
    // We need to check if request number is unique - this is handled at DB level with unique constraint

    // Validate status
    if (!VALID_STATUSES.includes(data.status)) {
      throw new ValidationError('Invalid maintenance status');
    }

    // Validate priority
    if (!VALID_PRIORITIES.includes(data.priority)) {
      throw new ValidationError('Invalid priority level');
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(data.category)) {
      throw new ValidationError('Invalid maintenance category');
    }

    // Validate dates
    const requestedDate = new Date(data.requestedDate);
    if (data.scheduledDate) {
      const scheduledDate = new Date(data.scheduledDate);
      if (scheduledDate < requestedDate) {
        throw new ValidationError(
          'Scheduled date must be on or after requested date'
        );
      }
    }

    // Validate cost values
    if (
      data.estimatedCost &&
      (Number(data.estimatedCost) < 0 || !Number.isFinite(Number(data.estimatedCost)))
    ) {
      throw new ValidationError('Estimated cost must be a positive number');
    }

    // Create the maintenance request
    const request = await maintenanceRepository.create(
      organizationId,
      data,
      userId
    );

    return request;
  }

  /**
   * Get maintenance request by ID
   */
  async getRequest(id: string, organizationId: string) {
    const request = await maintenanceRepository.findByIdAndOrganizationId(
      id,
      organizationId
    );

    if (!request) {
      throw new NotFoundError('Maintenance request not found');
    }

    return request;
  }

  /**
   * List maintenance requests with filtering
   */
  async listRequests(
    organizationId: string,
    options: PaginationOptions,
    filter?: MaintenanceFilter,
    search?: MaintenanceSearchOptions
  ) {
    return maintenanceRepository.listWithFilters(
      organizationId,
      options,
      filter,
      search
    );
  }

  /**
   * Update maintenance request
   */
  async updateRequest(
    id: string,
    organizationId: string,
    data: UpdateMaintenanceInput,
    userId: string
  ) {
    const request = await maintenanceRepository.findByIdAndOrganizationId(
      id,
      organizationId
    );

    if (!request) {
      throw new NotFoundError('Maintenance request not found');
    }

    // Cannot update completed requests
    if (request.status === 'Completed') {
      throw new ValidationError(
        'Cannot update a completed request. Use reopening workflow instead.'
      );
    }

    // Validate status if provided
    if (data.status && data.status !== request.status) {
      if (!VALID_STATUSES.includes(data.status)) {
        throw new ValidationError('Invalid maintenance status');
      }

      // Validate status transition
      const validTransitions = VALID_STATUS_TRANSITIONS[request.status] || [];
      if (!validTransitions.includes(data.status)) {
        throw new ValidationError(
          `Cannot transition from ${request.status} to ${data.status}`
        );
      }
    }

    // Validate priority if provided
    if (data.priority && !VALID_PRIORITIES.includes(data.priority)) {
      throw new ValidationError('Invalid priority level');
    }

    // Validate category if provided
    if (data.category && !VALID_CATEGORIES.includes(data.category)) {
      throw new ValidationError('Invalid maintenance category');
    }

    // Verify assigned user if provided
    if (data.assignedTo && data.assignedTo !== request.assignedTo) {
      const assignedUser = await userRepository.findById(data.assignedTo);
      if (!assignedUser) {
        throw new NotFoundError('Assigned user not found');
      }
    }

    // Validate cost values
    if (data.estimatedCost) {
      if (Number(data.estimatedCost) < 0 || !Number.isFinite(Number(data.estimatedCost))) {
        throw new ValidationError('Estimated cost must be a positive number');
      }
    }

    if (data.actualCost) {
      if (Number(data.actualCost) < 0 || !Number.isFinite(Number(data.actualCost))) {
        throw new ValidationError('Actual cost must be a positive number');
      }
    }

    // Update the request
    return maintenanceRepository.update(id, organizationId, data, userId);
  }

  /**
   * Assign technician to maintenance request
   */
  async assignTechnician(
    id: string,
    organizationId: string,
    assignedTo: string,
    userId: string
  ) {
    const request = await maintenanceRepository.findByIdAndOrganizationId(
      id,
      organizationId
    );

    if (!request) {
      throw new NotFoundError('Maintenance request not found');
    }

    // Verify assigned user exists
    const assignedUser = await userRepository.findById(assignedTo);
    if (!assignedUser) {
      throw new NotFoundError('Assigned user not found');
    }

    // Check if valid transition to Assigned status
    const validTransitions = VALID_STATUS_TRANSITIONS[request.status] || [];
    if (!validTransitions.includes('Assigned') && request.status !== 'Assigned') {
      throw new ValidationError(`Cannot assign technician from status: ${request.status}`);
    }

    return maintenanceRepository.assignTechnician(
      id,
      organizationId,
      assignedTo,
      userId
    );
  }

  /**
   * Change status of maintenance request
   */
  async changeStatus(
    id: string,
    organizationId: string,
    newStatus: string,
    userId: string
  ) {
    const request = await maintenanceRepository.findByIdAndOrganizationId(
      id,
      organizationId
    );

    if (!request) {
      throw new NotFoundError('Maintenance request not found');
    }

    // Validate new status
    if (!VALID_STATUSES.includes(newStatus)) {
      throw new ValidationError('Invalid maintenance status');
    }

    // Validate status transition
    const validTransitions = VALID_STATUS_TRANSITIONS[request.status] || [];
    if (!validTransitions.includes(newStatus)) {
      throw new ValidationError(
        `Cannot transition from ${request.status} to ${newStatus}`
      );
    }

    return maintenanceRepository.changeStatus(
      id,
      organizationId,
      newStatus,
      userId
    );
  }

  /**
   * Get organization maintenance statistics
   */
  async getOrganizationStatistics(organizationId: string) {
    // Verify organization exists
    const org = await organizationRepository.findById(organizationId);
    if (!org) {
      throw new NotFoundError('Organization not found');
    }

    return maintenanceRepository.getOrganizationStatistics(organizationId);
  }

  /**
   * Get property maintenance statistics
   */
  async getPropertyStatistics(organizationId: string, propertyId: string) {
    // Verify property exists
    const property = await propertyRepository.findByIdAndOrganizationId(
      propertyId,
      organizationId
    );
    if (!property) {
      throw new NotFoundError('Property not found');
    }

    return maintenanceRepository.getPropertyStatistics(organizationId, propertyId);
  }

  /**
   * Delete maintenance request (soft delete)
   */
  async deleteRequest(
    id: string,
    organizationId: string,
    userId: string
  ) {
    const request = await maintenanceRepository.findByIdAndOrganizationId(
      id,
      organizationId
    );

    if (!request) {
      throw new NotFoundError('Maintenance request not found');
    }

    return maintenanceRepository.softDelete(id, organizationId, userId);
  }

  /**
   * Restore deleted maintenance request
   */
  async restoreRequest(
    id: string,
    organizationId: string,
    userId: string
  ) {
    const request = await prisma.maintenanceRequest.findFirst({
      where: {
        id,
        organizationId,
        deletedAt: { not: null },
      },
    });

    if (!request) {
      throw new NotFoundError('Maintenance request not found or not deleted');
    }

    return maintenanceRepository.restore(id, organizationId, userId);
  }
}

export const maintenanceService = new MaintenanceService();
