import { maintenanceService } from '../maintenance.service';
import { maintenanceRepository } from '../../repositories/maintenance.repository';
import { propertyRepository } from '../../repositories/property.repository';
import { unitRepository } from '../../repositories/unit.repository';
import { tenantRepository } from '../../repositories/tenant.repository';
import { userRepository } from '../../repositories/user.repository';
import { organizationRepository } from '../../repositories/organization.repository';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from '../../shared/exceptions';

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
    category: 'Plumbing' as const,
    priority: 'High' as const,
    status: 'Open' as const,
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
      (organizationRepository.findById as jest.Mock).mockResolvedValue(mockOrganization);
      (propertyRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockProperty);
      (unitRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockUnit);
      (tenantRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockTenant);
      (userRepository.findById as jest.Mock).mockResolvedValue(mockAssignedUser);
      (maintenanceRepository.create as jest.Mock).mockResolvedValue(mockMaintenance);

      const result = await maintenanceService.createRequest(
        mockCtx.organizationId,
        mockMaintenanceInput,
        mockCtx.userId
      );

      expect(result).toEqual(mockMaintenance);
      expect(maintenanceRepository.create).toHaveBeenCalledWith(
        mockCtx.organizationId,
        mockMaintenanceInput,
        mockCtx.userId
      );
    });

    it('should throw NotFoundError if organization not found', async () => {
      (organizationRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        maintenanceService.createRequest(
          mockCtx.organizationId,
          mockMaintenanceInput,
          mockCtx.userId
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if property not found', async () => {
      (organizationRepository.findById as jest.Mock).mockResolvedValue(mockOrganization);
      (propertyRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(null);

      await expect(
        maintenanceService.createRequest(
          mockCtx.organizationId,
          mockMaintenanceInput,
          mockCtx.userId
        )
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError for invalid status', async () => {
      (organizationRepository.findById as jest.Mock).mockResolvedValue(mockOrganization);
      (propertyRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockProperty);

      const invalidInput = {
        ...mockMaintenanceInput,
        status: 'InvalidStatus' as any,
      };

      await expect(
        maintenanceService.createRequest(
          mockCtx.organizationId,
          invalidInput,
          mockCtx.userId
        )
      ).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid priority', async () => {
      (organizationRepository.findById as jest.Mock).mockResolvedValue(mockOrganization);
      (propertyRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockProperty);

      const invalidInput = {
        ...mockMaintenanceInput,
        priority: 'InvalidPriority' as any,
      };

      await expect(
        maintenanceService.createRequest(
          mockCtx.organizationId,
          invalidInput,
          mockCtx.userId
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getRequest', () => {
    it('should retrieve a maintenance request successfully', async () => {
      (maintenanceRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockMaintenance);

      const result = await maintenanceService.getRequest(
        'maint-123',
        mockCtx.organizationId
      );

      expect(result).toEqual(mockMaintenance);
    });

    it('should throw NotFoundError if request not found', async () => {
      (maintenanceRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(null);

      await expect(
        maintenanceService.getRequest('invalid-123', mockCtx.organizationId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateRequest', () => {
    it('should update a maintenance request successfully', async () => {
      const updateData = { title: 'Updated Title', priority: 'Urgent' as const };
      const updatedMaintenance = { ...mockMaintenance, ...updateData };

      (maintenanceRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockMaintenance);
      (maintenanceRepository.update as jest.Mock).mockResolvedValue(updatedMaintenance);

      const result = await maintenanceService.updateRequest(
        'maint-123',
        mockCtx.organizationId,
        updateData,
        mockCtx.userId
      );

      expect(result).toEqual(updatedMaintenance);
      expect(maintenanceRepository.update).toHaveBeenCalled();
    });

    it('should throw ValidationError for completed requests', async () => {
      const completedMaintenance = { ...mockMaintenance, status: 'Completed' };
      (maintenanceRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(completedMaintenance);

      await expect(
        maintenanceService.updateRequest(
          'maint-123',
          mockCtx.organizationId,
          { title: 'New Title' },
          mockCtx.userId
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('changeStatus', () => {
    it('should change status successfully', async () => {
      const updatedMaintenance = { ...mockMaintenance, status: 'Assigned' };
      (maintenanceRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockMaintenance);
      (maintenanceRepository.changeStatus as jest.Mock).mockResolvedValue(updatedMaintenance);

      const result = await maintenanceService.changeStatus(
        'maint-123',
        mockCtx.organizationId,
        'Assigned',
        mockCtx.userId
      );

      expect(result).toEqual(updatedMaintenance);
    });

    it('should throw ValidationError for invalid status transition', async () => {
      const completedMaintenance = { ...mockMaintenance, status: 'Completed' };
      (maintenanceRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(completedMaintenance);

      await expect(
        maintenanceService.changeStatus(
          'maint-123',
          mockCtx.organizationId,
          'Open',
          mockCtx.userId
        )
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('assignTechnician', () => {
    it('should assign technician successfully', async () => {
      const assignedMaintenance = { ...mockMaintenance, status: 'Assigned', assignedTo: 'tech-123' };
      (maintenanceRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockMaintenance);
      (userRepository.findById as jest.Mock).mockResolvedValue(mockAssignedUser);
      (maintenanceRepository.assignTechnician as jest.Mock).mockResolvedValue(assignedMaintenance);

      const result = await maintenanceService.assignTechnician(
        'maint-123',
        mockCtx.organizationId,
        'tech-123',
        mockCtx.userId
      );

      expect(result).toEqual(assignedMaintenance);
    });

    it('should throw NotFoundError if user not found', async () => {
      (maintenanceRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockMaintenance);
      (userRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        maintenanceService.assignTechnician(
          'maint-123',
          mockCtx.organizationId,
          'invalid-user',
          mockCtx.userId
        )
      ).rejects.toThrow(NotFoundError);
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

      (organizationRepository.findById as jest.Mock).mockResolvedValue(mockOrganization);
      (maintenanceRepository.getOrganizationStatistics as jest.Mock).mockResolvedValue(stats);

      const result = await maintenanceService.getOrganizationStatistics(mockCtx.organizationId);

      expect(result).toEqual(stats);
    });

    it('should throw NotFoundError if organization not found', async () => {
      (organizationRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        maintenanceService.getOrganizationStatistics(mockCtx.organizationId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteRequest', () => {
    it('should soft delete a maintenance request', async () => {
      const deletedMaintenance = { ...mockMaintenance, deletedAt: new Date() };
      (maintenanceRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(mockMaintenance);
      (maintenanceRepository.softDelete as jest.Mock).mockResolvedValue(deletedMaintenance);

      const result = await maintenanceService.deleteRequest(
        'maint-123',
        mockCtx.organizationId,
        mockCtx.userId
      );

      expect(result).toEqual(deletedMaintenance);
    });

    it('should throw NotFoundError if request not found', async () => {
      (maintenanceRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(null);

      await expect(
        maintenanceService.deleteRequest(
          'invalid-123',
          mockCtx.organizationId,
          mockCtx.userId
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('Organization isolation', () => {
    it('should not access requests from other organizations', async () => {
      (maintenanceRepository.findByIdAndOrganizationId as jest.Mock).mockResolvedValue(null);

      await expect(
        maintenanceService.getRequest('maint-123', 'different-org')
      ).rejects.toThrow(NotFoundError);
    });

    it('should filter list by organization', async () => {
      const requests = { requests: [mockMaintenance], total: 1 };
      (maintenanceRepository.listWithFilters as jest.Mock).mockResolvedValue(requests);

      const result = await maintenanceService.listRequests(
        mockCtx.organizationId,
        { page: 1, limit: 20 }
      );

      expect(maintenanceRepository.listWithFilters).toHaveBeenCalledWith(
        mockCtx.organizationId,
        expect.any(Object),
        undefined,
        undefined
      );
    });
  });
});
