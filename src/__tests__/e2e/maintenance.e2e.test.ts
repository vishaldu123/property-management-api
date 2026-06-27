import prisma from '../../shared/infrastructure/prisma';
import { maintenanceService } from '../../services/maintenance.service';
import { propertyRepository } from '../../repositories/property.repository';
import { organizationRepository } from '../../repositories/organization.repository';
import { userRepository } from '../../repositories/user.repository';

describe('Maintenance Domain - E2E Tests', () => {
  const mockCtx = {
    userId: 'user-123',
    organizationId: 'org-123',
  };

  const mockMaintenanceInput = {
    propertyId: 'property-123',
    unitId: 'unit-123',
    tenantId: 'tenant-123',
    requestNumber: 'MR-E2E-001',
    title: 'Plumbing Issue',
    description: 'Water leak in bathroom',
    category: 'Plumbing' as const,
    priority: 'High' as const,
    status: 'Open' as const,
    requestedDate: '2026-06-27T00:00:00Z',
    scheduledDate: '2026-06-28T00:00:00Z',
    estimatedCost: '500.00',
    vendor: 'Local Plumber',
    notes: 'Urgent repair',
  };

  describe('Complete maintenance workflow', () => {
    it('should create, assign, update status, and complete a maintenance request', async () => {
      // Mock organization exists
      const org = {
        id: mockCtx.organizationId,
        name: 'Test Org',
        slug: 'test-org',
        email: 'org@test.com',
      };

      // Create maintenance request
      const maint = await maintenanceService.createRequest(
        mockCtx.organizationId,
        mockMaintenanceInput,
        mockCtx.userId
      );

      expect(maint).toBeDefined();
      expect(maint.requestNumber).toBe('MR-E2E-001');
      expect(maint.status).toBe('Open');
      expect(maint.organizationId).toBe(mockCtx.organizationId);

      // Get the request
      const retrieved = await maintenanceService.getRequest(
        maint.id,
        mockCtx.organizationId
      );

      expect(retrieved.id).toBe(maint.id);
      expect(retrieved.title).toBe(mockMaintenanceInput.title);

      // Update status to Assigned
      const assigned = await maintenanceService.changeStatus(
        maint.id,
        mockCtx.organizationId,
        'Assigned',
        mockCtx.userId
      );

      expect(assigned.status).toBe('Assigned');

      // Assign technician
      const withTech = await maintenanceService.assignTechnician(
        maint.id,
        mockCtx.organizationId,
        'tech-123',
        mockCtx.userId
      );

      expect(withTech.assignedTo).toBe('tech-123');
      expect(withTech.status).toBe('Assigned');

      // Change to Scheduled
      const scheduled = await maintenanceService.changeStatus(
        maint.id,
        mockCtx.organizationId,
        'Scheduled',
        mockCtx.userId
      );

      expect(scheduled.status).toBe('Scheduled');

      // Update to In Progress
      const inProgress = await maintenanceService.changeStatus(
        maint.id,
        mockCtx.organizationId,
        'In Progress',
        mockCtx.userId
      );

      expect(inProgress.status).toBe('In Progress');

      // Complete the request
      const completed = await maintenanceService.updateRequest(
        maint.id,
        mockCtx.organizationId,
        {
          status: 'Completed',
          actualCost: '450.00',
          notes: 'Repair completed successfully',
        },
        mockCtx.userId
      );

      expect(completed.status).toBe('Completed');
      expect(completed.actualCost?.toString()).toBe('450');
    });

    it('should soft delete and restore a maintenance request', async () => {
      // Create request
      const maint = await maintenanceService.createRequest(
        mockCtx.organizationId,
        mockMaintenanceInput,
        mockCtx.userId
      );

      // Delete the request
      const deleted = await maintenanceService.deleteRequest(
        maint.id,
        mockCtx.organizationId,
        mockCtx.userId
      );

      expect(deleted.deletedAt).not.toBeNull();

      // Verify not in list
      const list = await maintenanceService.listRequests(
        mockCtx.organizationId,
        { page: 1, limit: 20 }
      );

      expect(list.requests.find(r => r.id === maint.id)).toBeUndefined();

      // Restore the request
      const restored = await maintenanceService.restoreRequest(
        maint.id,
        mockCtx.organizationId,
        mockCtx.userId
      );

      expect(restored.deletedAt).toBeNull();

      // Verify in list again
      const listAfterRestore = await maintenanceService.listRequests(
        mockCtx.organizationId,
        { page: 1, limit: 20 }
      );

      expect(listAfterRestore.requests.find(r => r.id === maint.id)).toBeDefined();
    });

    it('should filter maintenance requests by status, priority, and category', async () => {
      // Create multiple requests
      const maint1 = await maintenanceService.createRequest(
        mockCtx.organizationId,
        { ...mockMaintenanceInput, requestNumber: 'MR-FILTER-001', status: 'Open' },
        mockCtx.userId
      );

      const maint2 = await maintenanceService.createRequest(
        mockCtx.organizationId,
        { ...mockMaintenanceInput, requestNumber: 'MR-FILTER-002', priority: 'Low', category: 'Electrical', status: 'Open' },
        mockCtx.userId
      );

      // Filter by status
      const byStatus = await maintenanceService.listRequests(
        mockCtx.organizationId,
        { page: 1, limit: 20 },
        { status: 'Open' }
      );

      expect(byStatus.requests.length).toBeGreaterThan(0);
      expect(byStatus.requests.every(r => r.status === 'Open')).toBe(true);

      // Filter by priority
      const byPriority = await maintenanceService.listRequests(
        mockCtx.organizationId,
        { page: 1, limit: 20 },
        { priority: 'High' }
      );

      expect(byPriority.requests.every(r => r.priority === 'High')).toBe(true);

      // Filter by category
      const byCategory = await maintenanceService.listRequests(
        mockCtx.organizationId,
        { page: 1, limit: 20 },
        { category: 'Plumbing' }
      );

      expect(byCategory.requests.every(r => r.category === 'Plumbing')).toBe(true);
    });

    it('should search maintenance requests by request number and title', async () => {
      // Create request
      const maint = await maintenanceService.createRequest(
        mockCtx.organizationId,
        { ...mockMaintenanceInput, requestNumber: 'MR-SEARCH-001', title: 'Unique Title' },
        mockCtx.userId
      );

      // Search by request number
      const searchByNumber = await maintenanceService.listRequests(
        mockCtx.organizationId,
        { page: 1, limit: 20 },
        undefined,
        { query: 'MR-SEARCH-001' }
      );

      expect(searchByNumber.requests.find(r => r.id === maint.id)).toBeDefined();

      // Search by title
      const searchByTitle = await maintenanceService.listRequests(
        mockCtx.organizationId,
        { page: 1, limit: 20 },
        undefined,
        { query: 'Unique' }
      );

      expect(searchByTitle.requests.find(r => r.id === maint.id)).toBeDefined();
    });

    it('should sort maintenance requests by different fields', async () => {
      // Create requests with different priorities
      await maintenanceService.createRequest(
        mockCtx.organizationId,
        { ...mockMaintenanceInput, requestNumber: 'MR-SORT-001', priority: 'Low' },
        mockCtx.userId
      );

      await maintenanceService.createRequest(
        mockCtx.organizationId,
        { ...mockMaintenanceInput, requestNumber: 'MR-SORT-002', priority: 'High' },
        mockCtx.userId
      );

      // Sort by priority descending
      const sortedDesc = await maintenanceService.listRequests(
        mockCtx.organizationId,
        { page: 1, limit: 20, sortBy: 'priority', sortOrder: 'desc' }
      );

      expect(sortedDesc.requests).toBeDefined();
      expect(sortedDesc.requests.length).toBeGreaterThan(0);

      // Sort by requested date ascending
      const sortedAsc = await maintenanceService.listRequests(
        mockCtx.organizationId,
        { page: 1, limit: 20, sortBy: 'requestedDate', sortOrder: 'asc' }
      );

      expect(sortedAsc.requests).toBeDefined();
    });

    it('should enforce organization isolation', async () => {
      // Create request in org-123
      const maint = await maintenanceService.createRequest(
        mockCtx.organizationId,
        mockMaintenanceInput,
        mockCtx.userId
      );

      // Try to access from different org
      try {
        await maintenanceService.getRequest(maint.id, 'different-org');
        expect.fail('Should not find request in different organization');
      } catch (error: any) {
        expect(error.message).toContain('not found');
      }

      // Verify list is scoped to organization
      const list = await maintenanceService.listRequests(
        'different-org',
        { page: 1, limit: 20 }
      );

      expect(list.requests.find(r => r.id === maint.id)).toBeUndefined();
    });

    it('should get organization statistics', async () => {
      // Create multiple requests with different statuses
      await maintenanceService.createRequest(
        mockCtx.organizationId,
        { ...mockMaintenanceInput, requestNumber: 'MR-STAT-001', status: 'Open' },
        mockCtx.userId
      );

      await maintenanceService.createRequest(
        mockCtx.organizationId,
        { ...mockMaintenanceInput, requestNumber: 'MR-STAT-002', status: 'Open', priority: 'High' },
        mockCtx.userId
      );

      // Get statistics
      const stats = await maintenanceService.getOrganizationStatistics(mockCtx.organizationId);

      expect(stats.totalRequests).toBeGreaterThanOrEqual(2);
      expect(stats.byStatus).toBeDefined();
      expect(stats.byPriority).toBeDefined();
      expect(stats.totalEstimatedCost).toBeDefined();
      expect(stats.totalActualCost).toBeDefined();
    });
  });
});
