import { maintenanceService } from '../maintenance.service';
import {
  createMaintenance,
  getMaintenance,
  listMaintenance,
  updateMaintenance,
  assignTechnician,
  changeStatus,
  getOrganizationStats,
  deleteMaintenance,
  restoreMaintenance,
} from '../../controllers/maintenance.controller';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { Response } from 'express';

jest.mock('../maintenance.service');

describe('Maintenance Controller', () => {
  const mockCtx = {
    userId: 'user-123',
    organizationId: 'org-123',
  };

  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    mockReq = {
      user: {
        userId: mockCtx.userId,
        organizationId: mockCtx.organizationId,
      },
      body: {},
      params: {},
      query: {},
    } as AuthenticatedRequest;

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
    } as unknown as Response;

    mockNext = jest.fn();
  });

  describe('createMaintenance', () => {
    it('should create maintenance request on valid input', async () => {
      const mockMaintenance = {
        id: 'maint-123',
        organizationId: mockCtx.organizationId,
        requestNumber: 'MR-001',
        title: 'Plumbing Issue',
        status: 'Open',
      };

      mockReq.body = {
        propertyId: 'property-123',
        requestNumber: 'MR-001',
        title: 'Plumbing Issue',
        description: 'Water leak',
        category: 'Plumbing',
        priority: 'High',
        status: 'Open',
        requestedDate: '2026-06-27T00:00:00Z',
      };

      (maintenanceService.createRequest as jest.Mock).mockResolvedValue(mockMaintenance);

      await createMaintenance(mockReq, mockRes, mockNext);

      expect(maintenanceService.createRequest).toHaveBeenCalledWith(
        mockCtx.organizationId,
        expect.any(Object),
        mockCtx.userId
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should return validation error on invalid data', async () => {
      mockReq.body = {
        propertyId: 'invalid-uuid',
        title: 'Test',
      };

      await createMaintenance(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getMaintenance', () => {
    it('should retrieve maintenance request', async () => {
      const mockMaintenance = {
        id: 'maint-123',
        title: 'Plumbing Issue',
      };

      mockReq.params.maintenanceId = 'maint-123';
      (maintenanceService.getRequest as jest.Mock).mockResolvedValue(mockMaintenance);

      await getMaintenance(mockReq, mockRes, mockNext);

      expect(maintenanceService.getRequest).toHaveBeenCalledWith(
        'maint-123',
        mockCtx.organizationId
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle service errors', async () => {
      mockReq.params.maintenanceId = 'invalid-123';
      (maintenanceService.getRequest as jest.Mock).mockRejectedValue(new Error('Not found'));

      await getMaintenance(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('listMaintenance', () => {
    it('should list maintenance requests with pagination', async () => {
      const mockList = {
        requests: [{ id: 'maint-1' }, { id: 'maint-2' }],
        total: 2,
      };

      mockReq.query = { page: '1', limit: '20', status: 'Open' };
      (maintenanceService.listRequests as jest.Mock).mockResolvedValue(mockList);

      await listMaintenance(mockReq, mockRes, mockNext);

      expect(maintenanceService.listRequests).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('updateMaintenance', () => {
    it('should update maintenance request', async () => {
      const updatedMaintenance = {
        id: 'maint-123',
        title: 'Updated Title',
      };

      mockReq.params.maintenanceId = 'maint-123';
      mockReq.body = { title: 'Updated Title', priority: 'Medium' };

      (maintenanceService.updateRequest as jest.Mock).mockResolvedValue(updatedMaintenance);

      await updateMaintenance(mockReq, mockRes, mockNext);

      expect(maintenanceService.updateRequest).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('assignTechnician', () => {
    it('should assign technician to maintenance request', async () => {
      const assignedMaintenance = {
        id: 'maint-123',
        assignedTo: 'tech-123',
        status: 'Assigned',
      };

      mockReq.params.maintenanceId = 'maint-123';
      mockReq.body = { assignedTo: 'tech-123' };

      (maintenanceService.assignTechnician as jest.Mock).mockResolvedValue(assignedMaintenance);

      await assignTechnician(mockReq, mockRes, mockNext);

      expect(maintenanceService.assignTechnician).toHaveBeenCalledWith(
        'maint-123',
        mockCtx.organizationId,
        'tech-123',
        mockCtx.userId
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('changeStatus', () => {
    it('should change maintenance request status', async () => {
      const updatedMaintenance = {
        id: 'maint-123',
        status: 'In Progress',
      };

      mockReq.params.maintenanceId = 'maint-123';
      mockReq.body = { status: 'In Progress' };

      (maintenanceService.changeStatus as jest.Mock).mockResolvedValue(updatedMaintenance);

      await changeStatus(mockReq, mockRes, mockNext);

      expect(maintenanceService.changeStatus).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getOrganizationStats', () => {
    it('should retrieve organization statistics', async () => {
      const stats = {
        totalRequests: 5,
        byStatus: { Open: 2, Assigned: 2, Completed: 1 },
        byPriority: { Low: 1, High: 4 },
      };

      (maintenanceService.getOrganizationStatistics as jest.Mock).mockResolvedValue(stats);

      await getOrganizationStats(mockReq, mockRes, mockNext);

      expect(maintenanceService.getOrganizationStatistics).toHaveBeenCalledWith(
        mockCtx.organizationId
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('deleteMaintenance', () => {
    it('should soft delete maintenance request', async () => {
      mockReq.params.maintenanceId = 'maint-123';
      (maintenanceService.deleteRequest as jest.Mock).mockResolvedValue(undefined);

      await deleteMaintenance(mockReq, mockRes, mockNext);

      expect(maintenanceService.deleteRequest).toHaveBeenCalledWith(
        'maint-123',
        mockCtx.organizationId,
        mockCtx.userId
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('restoreMaintenance', () => {
    it('should restore deleted maintenance request', async () => {
      const restoredMaintenance = {
        id: 'maint-123',
        deletedAt: null,
      };

      mockReq.params.maintenanceId = 'maint-123';
      (maintenanceService.restoreRequest as jest.Mock).mockResolvedValue(restoredMaintenance);

      await restoreMaintenance(mockReq, mockRes, mockNext);

      expect(maintenanceService.restoreRequest).toHaveBeenCalledWith(
        'maint-123',
        mockCtx.organizationId,
        mockCtx.userId
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
