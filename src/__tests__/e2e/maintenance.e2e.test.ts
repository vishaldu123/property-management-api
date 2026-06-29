process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../../app';
import prisma from '../../config/prisma';
import { getAccessToken, getOrganizationId, getUserId } from '../helpers/auth.helpers';

describe('Maintenance Domain E2E Tests', () => {
  const seed = Date.now();

  let authToken = '';
  let userId = '';
  let organizationId = '';
  let propertyId = '';

  const buildMaintenancePayload = (overrides: Record<string, unknown> = {}) => ({
    propertyId,
    requestNumber: `MR-E2E-${seed}-${Math.random().toString(36).slice(2, 8)}`,
    title: 'Plumbing Issue',
    description: 'Water leak in bathroom',
    category: 'Plumbing',
    priority: 'High',
    status: 'Open',
    requestedDate: '2026-06-27T00:00:00Z',
    scheduledDate: '2026-06-28T00:00:00Z',
    estimatedCost: '500.00',
    vendor: 'Local Plumber',
    notes: 'Urgent repair',
    ...overrides,
  });

  beforeAll(async () => {
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Maintenance Test User',
        email: `maintenance-test-${seed}@example.com`,
        password: 'TestPassword123!',
        organizationName: `Maintenance Test Org ${seed}`,
      })
      .expect(201);

    authToken = getAccessToken(registerRes.body);
    userId = getUserId(registerRes.body);
    organizationId = getOrganizationId(registerRes.body);

    const propertyRes = await request(app)
      .post('/api/v1/properties')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Maintenance Test Property',
        code: `PROP-MNT-${seed}`,
        propertyType: 'Apartment',
        address: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        postalCode: '12345',
      })
      .expect(201);

    propertyId = propertyRes.body.data.id;
  });

  afterAll(async () => {
    if (organizationId) {
      await prisma.maintenanceRequest.deleteMany({ where: { organizationId } });
      await prisma.property.deleteMany({ where: { organizationId } });
      await prisma.organizationUser.deleteMany({ where: { organizationId } });
      await prisma.organization.delete({ where: { id: organizationId } }).catch(() => undefined);
    }
    await prisma.$disconnect();
  });

  describe('Complete maintenance workflow', () => {
    it('should create, assign, update status, and complete a maintenance request', async () => {
      const createRes = await request(app)
        .post('/api/v1/maintenance')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildMaintenancePayload({ requestNumber: `MR-WF-${seed}` }))
        .expect(201);

      const maintenanceId = createRes.body.data.id;
      expect(createRes.body.data.requestNumber).toBe(`MR-WF-${seed}`);
      expect(createRes.body.data.status).toBe('Open');

      const getRes = await request(app)
        .get(`/api/v1/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getRes.body.data.id).toBe(maintenanceId);
      expect(getRes.body.data.title).toBe('Plumbing Issue');

      await request(app)
        .patch(`/api/v1/maintenance/${maintenanceId}/change-status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'Assigned' })
        .expect(200);

      const assignRes = await request(app)
        .patch(`/api/v1/maintenance/${maintenanceId}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ assignedTo: userId })
        .expect(200);

      expect(assignRes.body.data.assignedTo).toBe(userId);
      expect(assignRes.body.data.status).toBe('Assigned');

      await request(app)
        .patch(`/api/v1/maintenance/${maintenanceId}/change-status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'Scheduled' })
        .expect(200);

      await request(app)
        .patch(`/api/v1/maintenance/${maintenanceId}/change-status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'In Progress' })
        .expect(200);

      const completeRes = await request(app)
        .put(`/api/v1/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'Completed',
          actualCost: '450.00',
          notes: 'Repair completed successfully',
        })
        .expect(200);

      expect(completeRes.body.data.status).toBe('Completed');
      expect(completeRes.body.data.actualCost?.toString()).toBe('450');
    });

    it('should soft delete and restore a maintenance request', async () => {
      const createRes = await request(app)
        .post('/api/v1/maintenance')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildMaintenancePayload({ requestNumber: `MR-DEL-${seed}` }))
        .expect(201);

      const maintenanceId = createRes.body.data.id;

      await request(app)
        .delete(`/api/v1/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const listAfterDelete = await request(app)
        .get('/api/v1/maintenance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const deletedItems = listAfterDelete.body.data.data as Array<{ id: string }>;
      expect(deletedItems.find((item) => item.id === maintenanceId)).toBeUndefined();

      const restoreRes = await request(app)
        .patch(`/api/v1/maintenance/${maintenanceId}/restore`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(restoreRes.body.data.deletedAt).toBeNull();

      const listAfterRestore = await request(app)
        .get('/api/v1/maintenance')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const restoredItems = listAfterRestore.body.data.data as Array<{ id: string }>;
      expect(restoredItems.find((item) => item.id === maintenanceId)).toBeDefined();
    });

    it('should filter maintenance requests by status, priority, and category', async () => {
      await request(app)
        .post('/api/v1/maintenance')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildMaintenancePayload({ requestNumber: `MR-FILTER-1-${seed}`, status: 'Open' }))
        .expect(201);

      await request(app)
        .post('/api/v1/maintenance')
        .set('Authorization', `Bearer ${authToken}`)
        .send(
          buildMaintenancePayload({
            requestNumber: `MR-FILTER-2-${seed}`,
            priority: 'Low',
            category: 'Electrical',
            status: 'Open',
          })
        )
        .expect(201);

      const byStatus = await request(app)
        .get('/api/v1/maintenance?status=Open')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(byStatus.body.data.data.length).toBeGreaterThan(0);
      expect(byStatus.body.data.data.every((item: { status: string }) => item.status === 'Open')).toBe(true);

      const byPriority = await request(app)
        .get('/api/v1/maintenance?priority=High')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(
        byPriority.body.data.data.every((item: { priority: string }) => item.priority === 'High')
      ).toBe(true);

      const byCategory = await request(app)
        .get('/api/v1/maintenance?category=Plumbing')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(
        byCategory.body.data.data.every((item: { category: string }) => item.category === 'Plumbing')
      ).toBe(true);
    });

    it('should search maintenance requests by request number and title', async () => {
      const createRes = await request(app)
        .post('/api/v1/maintenance')
        .set('Authorization', `Bearer ${authToken}`)
        .send(
          buildMaintenancePayload({
            requestNumber: `MR-SEARCH-${seed}`,
            title: `Unique Title ${seed}`,
          })
        )
        .expect(201);

      const maintenanceId = createRes.body.data.id;

      const searchByNumber = await request(app)
        .get(`/api/v1/maintenance?search=MR-SEARCH-${seed}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(
        searchByNumber.body.data.data.find((item: { id: string }) => item.id === maintenanceId)
      ).toBeDefined();

      const searchByTitle = await request(app)
        .get(`/api/v1/maintenance?search=${encodeURIComponent(`Unique Title ${seed}`)}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(
        searchByTitle.body.data.data.find((item: { id: string }) => item.id === maintenanceId)
      ).toBeDefined();
    });

    it('should sort maintenance requests by different fields', async () => {
      await request(app)
        .post('/api/v1/maintenance')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildMaintenancePayload({ requestNumber: `MR-SORT-1-${seed}`, priority: 'Low' }))
        .expect(201);

      await request(app)
        .post('/api/v1/maintenance')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildMaintenancePayload({ requestNumber: `MR-SORT-2-${seed}`, priority: 'High' }))
        .expect(201);

      const sortedDesc = await request(app)
        .get('/api/v1/maintenance?sortBy=priority&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(sortedDesc.body.data.data.length).toBeGreaterThan(0);

      const sortedAsc = await request(app)
        .get('/api/v1/maintenance?sortBy=requestedDate&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(sortedAsc.body.data.data.length).toBeGreaterThan(0);
    });

    it('should enforce organization isolation', async () => {
      const createRes = await request(app)
        .post('/api/v1/maintenance')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildMaintenancePayload({ requestNumber: `MR-ISO-${seed}` }))
        .expect(201);

      const maintenanceId = createRes.body.data.id;

      const otherRegisterRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Other Maintenance User',
          email: `maintenance-other-${seed}@example.com`,
          password: 'TestPassword123!',
          organizationName: `Other Maintenance Org ${seed}`,
        })
        .expect(201);

      const otherToken = getAccessToken(otherRegisterRes.body);

      await request(app)
        .get(`/api/v1/maintenance/${maintenanceId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);
    });

    it('should get organization statistics', async () => {
      await request(app)
        .post('/api/v1/maintenance')
        .set('Authorization', `Bearer ${authToken}`)
        .send(buildMaintenancePayload({ requestNumber: `MR-STAT-1-${seed}`, status: 'Open' }))
        .expect(201);

      await request(app)
        .post('/api/v1/maintenance')
        .set('Authorization', `Bearer ${authToken}`)
        .send(
          buildMaintenancePayload({
            requestNumber: `MR-STAT-2-${seed}`,
            status: 'Open',
            priority: 'High',
          })
        )
        .expect(201);

      const statsRes = await request(app)
        .get('/api/v1/maintenance/stats/organization')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(statsRes.body.data.totalRequests).toBeGreaterThanOrEqual(2);
      expect(statsRes.body.data.byStatus).toBeDefined();
      expect(statsRes.body.data.byPriority).toBeDefined();
      expect(statsRes.body.data.totalEstimatedCost).toBeDefined();
      expect(statsRes.body.data.totalActualCost).toBeDefined();
    });
  });
});
