"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maintenance_service_1 = require("../maintenance.service");
const maintenance_repository_1 = require("../../repositories/maintenance.repository");
const property_repository_1 = require("../../repositories/property.repository");
const unit_repository_1 = require("../../repositories/unit.repository");
const tenant_repository_1 = require("../../repositories/tenant.repository");
const user_repository_1 = require("../../repositories/user.repository");
const organization_repository_1 = require("../../repositories/organization.repository");
const exceptions_1 = require("../../shared/exceptions");
// Mock all repositories
jest.mock('../../repositories/maintenance.repository');
jest.mock('../../repositories/property.repository');
jest.mock('../../repositories/unit.repository');
jest.mock('../../repositories/tenant.repository');
jest.mock('../../repositories/user.repository');
jest.mock('../../repositories/organization.repository');
describe('MaintenanceService', () => {
    const mockCtx = {
        userId: 'user-123',
        organizationId: 'org-123',
    };
    const mockProperty = {
        id: 'property-123',
        organizationId: mockCtx.organizationId,
        name: 'Main Property',
    };
    const mockUnit = {
        id: 'unit-123',
        organizationId: mockCtx.organizationId,
        propertyId: 'property-123',
        unitNumber: '101',
    };
    const mockTenant = {
        id: 'tenant-123',
        organizationId: mockCtx.organizationId,
        email: 'tenant@example.com',
    };
    const mockAssignedUser = {
        id: 'tech-123',
        name: 'Technician',
        email: 'tech@example.com',
    };
    const mockOrganization = {
        id: mockCtx.organizationId,
        name: 'Test Organization',
    };
    const mockMaintenanceInput = {
        propertyId: 'property-123',
        unitId: 'unit-123',
        tenantId: 'tenant-123',
        assignedTo: 'tech-123',
        requestNumber: 'MR-001',
        title: 'Plumbing Issue',
        description: 'Water leak in bathroom',
        category: 'Plumbing',
        priority: 'High',
        status: 'Open',
        requestedDate: '2026-06-27T00:00:00Z',
        scheduledDate: '2026-06-28T00:00:00Z',
        estimatedCost: '500.00',
        vendor: 'Local Plumber',
        notes: 'Urgent repair needed',
    };
    const mockMaintenance = {
        id: 'maint-123',
        organizationId: mockCtx.organizationId,
        ...mockMaintenanceInput,
        createdBy: mockCtx.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        updatedBy: null,
        startedDate: null,
        completedDate: null,
        actualCost: null,
        paidAmount: null,
        reportedBy: mockCtx.userId,
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('createRequest', () => {
        it('should create a maintenance request successfully', async () => {
            organization_repository_1.organizationRepository.findById.mockResolvedValue(mockOrganization);
            property_repository_1.propertyRepository.findByIdAndOrganizationId.mockResolvedValue(mockProperty);
            unit_repository_1.unitRepository.findByIdAndOrganizationId.mockResolvedValue(mockUnit);
            tenant_repository_1.tenantRepository.findByIdAndOrganizationId.mockResolvedValue(mockTenant);
            user_repository_1.userRepository.findById.mockResolvedValue(mockAssignedUser);
            maintenance_repository_1.maintenanceRepository.create.mockResolvedValue(mockMaintenance);
            const result = await maintenance_service_1.maintenanceService.createRequest(mockCtx.organizationId, mockMaintenanceInput, mockCtx.userId);
            expect(result).toEqual(mockMaintenance);
            expect(maintenance_repository_1.maintenanceRepository.create).toHaveBeenCalledWith(mockCtx.organizationId, mockMaintenanceInput, mockCtx.userId);
        });
        it('should throw NotFoundError if organization not found', async () => {
            organization_repository_1.organizationRepository.findById.mockResolvedValue(null);
            await expect(maintenance_service_1.maintenanceService.createRequest(mockCtx.organizationId, mockMaintenanceInput, mockCtx.userId)).rejects.toThrow(exceptions_1.NotFoundError);
        });
        it('should throw NotFoundError if property not found', async () => {
            organization_repository_1.organizationRepository.findById.mockResolvedValue(mockOrganization);
            property_repository_1.propertyRepository.findByIdAndOrganizationId.mockResolvedValue(null);
            await expect(maintenance_service_1.maintenanceService.createRequest(mockCtx.organizationId, mockMaintenanceInput, mockCtx.userId)).rejects.toThrow(exceptions_1.NotFoundError);
        });
        it('should throw ValidationError for invalid status', async () => {
            organization_repository_1.organizationRepository.findById.mockResolvedValue(mockOrganization);
            property_repository_1.propertyRepository.findByIdAndOrganizationId.mockResolvedValue(mockProperty);
            const invalidInput = {
                ...mockMaintenanceInput,
                status: 'InvalidStatus',
            };
            await expect(maintenance_service_1.maintenanceService.createRequest(mockCtx.organizationId, invalidInput, mockCtx.userId)).rejects.toThrow(exceptions_1.ValidationError);
        });
        it('should throw ValidationError for invalid priority', async () => {
            organization_repository_1.organizationRepository.findById.mockResolvedValue(mockOrganization);
            property_repository_1.propertyRepository.findByIdAndOrganizationId.mockResolvedValue(mockProperty);
            const invalidInput = {
                ...mockMaintenanceInput,
                priority: 'InvalidPriority',
            };
            await expect(maintenance_service_1.maintenanceService.createRequest(mockCtx.organizationId, invalidInput, mockCtx.userId)).rejects.toThrow(exceptions_1.ValidationError);
        });
    });
    describe('getRequest', () => {
        it('should retrieve a maintenance request successfully', async () => {
            maintenance_repository_1.maintenanceRepository.findByIdAndOrganizationId.mockResolvedValue(mockMaintenance);
            const result = await maintenance_service_1.maintenanceService.getRequest('maint-123', mockCtx.organizationId);
            expect(result).toEqual(mockMaintenance);
        });
        it('should throw NotFoundError if request not found', async () => {
            maintenance_repository_1.maintenanceRepository.findByIdAndOrganizationId.mockResolvedValue(null);
            await expect(maintenance_service_1.maintenanceService.getRequest('invalid-123', mockCtx.organizationId)).rejects.toThrow(exceptions_1.NotFoundError);
        });
    });
    describe('updateRequest', () => {
        it('should update a maintenance request successfully', async () => {
            const updateData = { title: 'Updated Title', priority: 'Urgent' };
            const updatedMaintenance = { ...mockMaintenance, ...updateData };
            maintenance_repository_1.maintenanceRepository.findByIdAndOrganizationId.mockResolvedValue(mockMaintenance);
            maintenance_repository_1.maintenanceRepository.update.mockResolvedValue(updatedMaintenance);
            const result = await maintenance_service_1.maintenanceService.updateRequest('maint-123', mockCtx.organizationId, updateData, mockCtx.userId);
            expect(result).toEqual(updatedMaintenance);
            expect(maintenance_repository_1.maintenanceRepository.update).toHaveBeenCalled();
        });
        it('should throw ValidationError for completed requests', async () => {
            const completedMaintenance = { ...mockMaintenance, status: 'Completed' };
            maintenance_repository_1.maintenanceRepository.findByIdAndOrganizationId.mockResolvedValue(completedMaintenance);
            await expect(maintenance_service_1.maintenanceService.updateRequest('maint-123', mockCtx.organizationId, { title: 'New Title' }, mockCtx.userId)).rejects.toThrow(exceptions_1.ValidationError);
        });
    });
    describe('changeStatus', () => {
        it('should change status successfully', async () => {
            const updatedMaintenance = { ...mockMaintenance, status: 'Assigned' };
            maintenance_repository_1.maintenanceRepository.findByIdAndOrganizationId.mockResolvedValue(mockMaintenance);
            maintenance_repository_1.maintenanceRepository.changeStatus.mockResolvedValue(updatedMaintenance);
            const result = await maintenance_service_1.maintenanceService.changeStatus('maint-123', mockCtx.organizationId, 'Assigned', mockCtx.userId);
            expect(result).toEqual(updatedMaintenance);
        });
        it('should throw ValidationError for invalid status transition', async () => {
            const completedMaintenance = { ...mockMaintenance, status: 'Completed' };
            maintenance_repository_1.maintenanceRepository.findByIdAndOrganizationId.mockResolvedValue(completedMaintenance);
            await expect(maintenance_service_1.maintenanceService.changeStatus('maint-123', mockCtx.organizationId, 'Open', mockCtx.userId)).rejects.toThrow(exceptions_1.ValidationError);
        });
    });
    describe('assignTechnician', () => {
        it('should assign technician successfully', async () => {
            const assignedMaintenance = { ...mockMaintenance, status: 'Assigned', assignedTo: 'tech-123' };
            maintenance_repository_1.maintenanceRepository.findByIdAndOrganizationId.mockResolvedValue(mockMaintenance);
            user_repository_1.userRepository.findById.mockResolvedValue(mockAssignedUser);
            maintenance_repository_1.maintenanceRepository.assignTechnician.mockResolvedValue(assignedMaintenance);
            const result = await maintenance_service_1.maintenanceService.assignTechnician('maint-123', mockCtx.organizationId, 'tech-123', mockCtx.userId);
            expect(result).toEqual(assignedMaintenance);
        });
        it('should throw NotFoundError if user not found', async () => {
            maintenance_repository_1.maintenanceRepository.findByIdAndOrganizationId.mockResolvedValue(mockMaintenance);
            user_repository_1.userRepository.findById.mockResolvedValue(null);
            await expect(maintenance_service_1.maintenanceService.assignTechnician('maint-123', mockCtx.organizationId, 'invalid-user', mockCtx.userId)).rejects.toThrow(exceptions_1.NotFoundError);
        });
    });
    describe('getOrganizationStatistics', () => {
        it('should return organization statistics', async () => {
            const stats = {
                totalRequests: 5,
                byStatus: { Open: 2, Assigned: 2, Completed: 1, Cancelled: 0, Scheduled: 0, 'In Progress': 0, 'On Hold': 0 },
                byPriority: { Low: 1, Medium: 2, High: 1, Urgent: 1, Emergency: 0 },
                totalEstimatedCost: 2000,
                totalActualCost: 1500,
            };
            organization_repository_1.organizationRepository.findById.mockResolvedValue(mockOrganization);
            maintenance_repository_1.maintenanceRepository.getOrganizationStatistics.mockResolvedValue(stats);
            const result = await maintenance_service_1.maintenanceService.getOrganizationStatistics(mockCtx.organizationId);
            expect(result).toEqual(stats);
        });
        it('should throw NotFoundError if organization not found', async () => {
            organization_repository_1.organizationRepository.findById.mockResolvedValue(null);
            await expect(maintenance_service_1.maintenanceService.getOrganizationStatistics(mockCtx.organizationId)).rejects.toThrow(exceptions_1.NotFoundError);
        });
    });
    describe('deleteRequest', () => {
        it('should soft delete a maintenance request', async () => {
            const deletedMaintenance = { ...mockMaintenance, deletedAt: new Date() };
            maintenance_repository_1.maintenanceRepository.findByIdAndOrganizationId.mockResolvedValue(mockMaintenance);
            maintenance_repository_1.maintenanceRepository.softDelete.mockResolvedValue(deletedMaintenance);
            const result = await maintenance_service_1.maintenanceService.deleteRequest('maint-123', mockCtx.organizationId, mockCtx.userId);
            expect(result).toEqual(deletedMaintenance);
        });
        it('should throw NotFoundError if request not found', async () => {
            maintenance_repository_1.maintenanceRepository.findByIdAndOrganizationId.mockResolvedValue(null);
            await expect(maintenance_service_1.maintenanceService.deleteRequest('invalid-123', mockCtx.organizationId, mockCtx.userId)).rejects.toThrow(exceptions_1.NotFoundError);
        });
    });
    describe('Organization isolation', () => {
        it('should not access requests from other organizations', async () => {
            maintenance_repository_1.maintenanceRepository.findByIdAndOrganizationId.mockResolvedValue(null);
            await expect(maintenance_service_1.maintenanceService.getRequest('maint-123', 'different-org')).rejects.toThrow(exceptions_1.NotFoundError);
        });
        it('should filter list by organization', async () => {
            const requests = { requests: [mockMaintenance], total: 1 };
            maintenance_repository_1.maintenanceRepository.listWithFilters.mockResolvedValue(requests);
            const result = await maintenance_service_1.maintenanceService.listRequests(mockCtx.organizationId, { page: 1, limit: 20 });
            expect(maintenance_repository_1.maintenanceRepository.listWithFilters).toHaveBeenCalledWith(mockCtx.organizationId, expect.any(Object), undefined, undefined);
        });
    });
});
