"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maintenance_service_1 = require("../../services/maintenance.service");
const maintenance_controller_1 = require("../../controllers/maintenance.controller");
jest.mock('../../services/maintenance.service');
const PROPERTY_ID = '550e8400-e29b-41d4-a716-446655440010';
const MAINTENANCE_ID = '550e8400-e29b-41d4-a716-446655440011';
const TECHNICIAN_ID = '550e8400-e29b-41d4-a716-446655440012';
describe('Maintenance Controller', () => {
    const mockCtx = {
        userId: 'user-123',
        organizationId: 'org-123',
    };
    let mockReq;
    let mockRes;
    let mockNext;
    beforeEach(() => {
        mockReq = {
            user: {
                userId: mockCtx.userId,
                organizationId: mockCtx.organizationId,
            },
            body: {},
            params: {},
            query: {},
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            setHeader: jest.fn(),
        };
        mockNext = jest.fn();
    });
    describe('createMaintenance', () => {
        it('should create maintenance request on valid input', async () => {
            const mockMaintenance = {
                id: MAINTENANCE_ID,
                organizationId: mockCtx.organizationId,
                requestNumber: 'MR-001',
                title: 'Plumbing Issue',
                status: 'Open',
            };
            mockReq.body = {
                propertyId: PROPERTY_ID,
                requestNumber: 'MR-001',
                title: 'Plumbing Issue',
                description: 'Water leak',
                category: 'Plumbing',
                priority: 'High',
                status: 'Open',
                requestedDate: '2026-06-27T00:00:00Z',
            };
            maintenance_service_1.maintenanceService.createRequest.mockResolvedValue(mockMaintenance);
            await (0, maintenance_controller_1.createMaintenance)(mockReq, mockRes, mockNext);
            expect(maintenance_service_1.maintenanceService.createRequest).toHaveBeenCalledWith(mockCtx.organizationId, expect.any(Object), mockCtx.userId);
            expect(mockRes.status).toHaveBeenCalledWith(201);
        });
        it('should return validation error on invalid data', async () => {
            mockReq.body = {
                propertyId: 'invalid-uuid',
                title: 'Test',
            };
            await (0, maintenance_controller_1.createMaintenance)(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
        });
    });
    describe('getMaintenance', () => {
        it('should retrieve maintenance request', async () => {
            const mockMaintenance = {
                id: MAINTENANCE_ID,
                title: 'Plumbing Issue',
            };
            mockReq.params.maintenanceId = MAINTENANCE_ID;
            maintenance_service_1.maintenanceService.getRequest.mockResolvedValue(mockMaintenance);
            await (0, maintenance_controller_1.getMaintenance)(mockReq, mockRes, mockNext);
            expect(maintenance_service_1.maintenanceService.getRequest).toHaveBeenCalledWith(MAINTENANCE_ID, mockCtx.organizationId);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
        it('should handle service errors', async () => {
            mockReq.params.maintenanceId = MAINTENANCE_ID;
            maintenance_service_1.maintenanceService.getRequest.mockRejectedValue(new Error('Not found'));
            await (0, maintenance_controller_1.getMaintenance)(mockReq, mockRes, mockNext);
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
            maintenance_service_1.maintenanceService.listRequests.mockResolvedValue(mockList);
            await (0, maintenance_controller_1.listMaintenance)(mockReq, mockRes, mockNext);
            expect(maintenance_service_1.maintenanceService.listRequests).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
    describe('updateMaintenance', () => {
        it('should update maintenance request', async () => {
            const updatedMaintenance = {
                id: MAINTENANCE_ID,
                title: 'Updated Title',
            };
            mockReq.params.maintenanceId = MAINTENANCE_ID;
            mockReq.body = { title: 'Updated Title', priority: 'Medium' };
            maintenance_service_1.maintenanceService.updateRequest.mockResolvedValue(updatedMaintenance);
            await (0, maintenance_controller_1.updateMaintenance)(mockReq, mockRes, mockNext);
            expect(maintenance_service_1.maintenanceService.updateRequest).toHaveBeenCalled();
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
    describe('assignTechnician', () => {
        it('should assign technician to maintenance request', async () => {
            const assignedMaintenance = {
                id: MAINTENANCE_ID,
                assignedTo: TECHNICIAN_ID,
                status: 'Assigned',
            };
            mockReq.params.maintenanceId = MAINTENANCE_ID;
            mockReq.body = { assignedTo: TECHNICIAN_ID };
            maintenance_service_1.maintenanceService.assignTechnician.mockResolvedValue(assignedMaintenance);
            await (0, maintenance_controller_1.assignTechnician)(mockReq, mockRes, mockNext);
            expect(maintenance_service_1.maintenanceService.assignTechnician).toHaveBeenCalledWith(MAINTENANCE_ID, mockCtx.organizationId, TECHNICIAN_ID, mockCtx.userId);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
    describe('changeStatus', () => {
        it('should change maintenance request status', async () => {
            const updatedMaintenance = {
                id: MAINTENANCE_ID,
                status: 'In Progress',
            };
            mockReq.params.maintenanceId = MAINTENANCE_ID;
            mockReq.body = { status: 'In Progress' };
            maintenance_service_1.maintenanceService.changeStatus.mockResolvedValue(updatedMaintenance);
            await (0, maintenance_controller_1.changeStatus)(mockReq, mockRes, mockNext);
            expect(maintenance_service_1.maintenanceService.changeStatus).toHaveBeenCalled();
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
            maintenance_service_1.maintenanceService.getOrganizationStatistics.mockResolvedValue(stats);
            await (0, maintenance_controller_1.getOrganizationStats)(mockReq, mockRes, mockNext);
            expect(maintenance_service_1.maintenanceService.getOrganizationStatistics).toHaveBeenCalledWith(mockCtx.organizationId);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
    describe('deleteMaintenance', () => {
        it('should soft delete maintenance request', async () => {
            mockReq.params.maintenanceId = MAINTENANCE_ID;
            maintenance_service_1.maintenanceService.deleteRequest.mockResolvedValue(undefined);
            await (0, maintenance_controller_1.deleteMaintenance)(mockReq, mockRes, mockNext);
            expect(maintenance_service_1.maintenanceService.deleteRequest).toHaveBeenCalledWith(MAINTENANCE_ID, mockCtx.organizationId, mockCtx.userId);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
    describe('restoreMaintenance', () => {
        it('should restore deleted maintenance request', async () => {
            const restoredMaintenance = {
                id: MAINTENANCE_ID,
                deletedAt: null,
            };
            mockReq.params.maintenanceId = MAINTENANCE_ID;
            maintenance_service_1.maintenanceService.restoreRequest.mockResolvedValue(restoredMaintenance);
            await (0, maintenance_controller_1.restoreMaintenance)(mockReq, mockRes, mockNext);
            expect(maintenance_service_1.maintenanceService.restoreRequest).toHaveBeenCalledWith(MAINTENANCE_ID, mockCtx.organizationId, mockCtx.userId);
            expect(mockRes.status).toHaveBeenCalledWith(200);
        });
    });
});
