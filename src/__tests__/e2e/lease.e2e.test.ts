process.env.NODE_ENV = 'test';
import request from 'supertest';
import app from '../../app';
import prisma from '../../config/prisma';

const DAYS_AFTER_EXISTING_ACTIVE_LEASE = 366;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

describe('Lease Domain E2E Tests', () => {
  let authToken: string;
  let userId: string;
  let organizationId: string;
  let propertyId: string;
  let unitId: string;
  let tenantId: string;
  let leaseId: string;

  beforeAll(async () => {
    // Register user
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Lease Test User',
        email: `lease-test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        organizationName: `Lease Test Org ${Date.now()}`,
      });

    userId = registerRes.body.data.user.id;
    organizationId = registerRes.body.data.organization.id;
    authToken = registerRes.body.data.token;

    // Create property
    const propertyRes = await request(app)
      .post('/api/v1/properties')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Property',
        code: `PROP-${Date.now()}`,
        propertyType: 'Apartment',
        address: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        postalCode: '12345',
      });

    propertyId = propertyRes.body.data.id;

    // Create unit
    const unitRes = await request(app)
      .post('/api/v1/units')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        propertyId,
        unitNumber: '101',
        name: 'Unit 101',
        unitType: 'Apartment',
        status: 'Available',
        bedrooms: 2,
        bathrooms: 1,
        area: 1000,
      });

    unitId = unitRes.body.data.id;

    // Create tenant
    const tenantRes = await request(app)
      .post('/api/v1/tenants')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: `lease-tenant-${Date.now()}@example.com`,
        status: 'Active',
      });

    tenantId = tenantRes.body.data.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.lease.deleteMany({
      where: { organizationId },
    });
    await prisma.tenant.deleteMany({
      where: { organizationId },
    });
    await prisma.unit.deleteMany({
      where: { propertyId },
    });
    await prisma.property.deleteMany({
      where: { organizationId },
    });
  });

  describe('CREATE Lease', () => {
    it('should create a new lease with required fields', async () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

      const res = await request(app)
        .post('/api/v1/leases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          leaseNumber: `LEASE-${Date.now()}`,
          propertyId,
          unitId,
          tenantId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          monthlyRent: 1500,
          securityDeposit: 3000,
          status: 'Active',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.leaseNumber).toBeDefined();
      expect(res.body.data.status).toBe('Active');
      expect(res.body.data.monthlyRent).toBe('1500');

      leaseId = res.body.data.id;
    });

    it('should create lease with all optional fields', async () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      const moveInDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

      const res = await request(app)
        .post('/api/v1/leases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          leaseNumber: `LEASE-ALT-${Date.now()}`,
          propertyId,
          unitId,
          tenantId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          moveInDate: moveInDate.toISOString(),
          monthlyRent: 2000,
          securityDeposit: 4000,
          billingCycle: 'monthly',
          gracePeriod: 5,
          status: 'Draft',
          renewalOption: true,
          autoRenewal: false,
          noticePeriod: 30,
          notes: 'Test lease',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.renewalOption).toBe(true);
      expect(res.body.data.noticePeriod).toBe(30);
    });

    it('should return 409 if lease number already exists', async () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
      const leaseNumber = `UNIQUE-LEASE-${Date.now()}`;

      // Create first lease
      await request(app)
        .post('/api/v1/leases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          leaseNumber,
          propertyId,
          unitId,
          tenantId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          monthlyRent: 1500,
          securityDeposit: 3000,
        });

      // Try to create with same lease number
      const res = await request(app)
        .post('/api/v1/leases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          leaseNumber,
          propertyId,
          unitId,
          tenantId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          monthlyRent: 1500,
          securityDeposit: 3000,
        });

      expect(res.status).toBe(409);
    });

    it('should return 400 if end date is before start date', async () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() - 1000);

      const res = await request(app)
        .post('/api/v1/leases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          leaseNumber: `LEASE-BAD-${Date.now()}`,
          propertyId,
          unitId,
          tenantId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          monthlyRent: 1500,
          securityDeposit: 3000,
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 if monthly rent is negative', async () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

      const res = await request(app)
        .post('/api/v1/leases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          leaseNumber: `LEASE-NEG-${Date.now()}`,
          propertyId,
          unitId,
          tenantId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          monthlyRent: -1500,
          securityDeposit: 3000,
        });

      expect(res.status).toBe(400);
    });
  });

  describe('READ Lease', () => {
    it('should retrieve lease by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/leases/${leaseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(leaseId);
    });

    it('should return 404 if lease not found', async () => {
      const res = await request(app)
        .get('/api/v1/leases/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('UPDATE Lease', () => {
    it('should update lease successfully', async () => {
      const res = await request(app)
        .put(`/api/v1/leases/${leaseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          monthlyRent: 1600,
          notes: 'Updated lease',
          gracePeriod: 10,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.monthlyRent).toBe('1600');
      expect(res.body.data.notes).toBe('Updated lease');
    });

    it('should reject update with invalid status', async () => {
      const res = await request(app)
        .put(`/api/v1/leases/${leaseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'InvalidStatus',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('LIST Leases', () => {
    it('should list all leases with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/leases?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
    });

    it('should filter leases by status', async () => {
      const res = await request(app)
        .get('/api/v1/leases?status=Active&limit=100')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach((lease: any) => {
        expect(lease.status).toBe('Active');
      });
    });

    it('should search leases by lease number', async () => {
      const res = await request(app)
        .get('/api/v1/leases?search=LEASE-')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter leases by unit', async () => {
      const res = await request(app)
        .get(`/api/v1/leases?unitId=${unitId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter leases by tenant', async () => {
      const res = await request(app)
        .get(`/api/v1/leases?tenantId=${tenantId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('RENEW Lease', () => {
    let renewableLeaseId: string;

    beforeAll(async () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

      const res = await request(app)
        .post('/api/v1/leases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          leaseNumber: `RENEWABLE-${Date.now()}`,
          propertyId,
          unitId,
          tenantId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          monthlyRent: 1500,
          securityDeposit: 3000,
          renewalOption: true,
          status: 'Draft',
        });

      renewableLeaseId = res.body.data.id;
    });

    it('should renew lease with new dates', async () => {
      const newStartDate = new Date(Date.now() + DAYS_AFTER_EXISTING_ACTIVE_LEASE * MILLISECONDS_PER_DAY);
      const newEndDate = new Date(newStartDate.getTime() + 365 * MILLISECONDS_PER_DAY);

      const res = await request(app)
        .post(`/api/v1/leases/${renewableLeaseId}/renew`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          newStartDate: newStartDate.toISOString(),
          newEndDate: newEndDate.toISOString(),
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Renewed');
    });
  });

  describe('TERMINATE Lease', () => {
    let terminableLeaseId: string;

    beforeAll(async () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

      const res = await request(app)
        .post('/api/v1/leases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          leaseNumber: `TERMINABLE-${Date.now()}`,
          propertyId,
          unitId,
          tenantId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          monthlyRent: 1500,
          securityDeposit: 3000,
          status: 'Draft',
        });

      terminableLeaseId = res.body.data.id;
    });

    it('should terminate lease', async () => {
      const res = await request(app)
        .post(`/api/v1/leases/${terminableLeaseId}/terminate`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Tenant requested early termination',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Terminated');
    });
  });

  describe('DELETE and RESTORE Lease', () => {
    let deleteTestLeaseId: string;

    beforeAll(async () => {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);

      const res = await request(app)
        .post('/api/v1/leases')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          leaseNumber: `DELETABLE-${Date.now()}`,
          propertyId,
          unitId,
          tenantId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          monthlyRent: 1500,
          securityDeposit: 3000,
        });

      deleteTestLeaseId = res.body.data.id;
    });

    it('should soft delete lease', async () => {
      const res = await request(app)
        .delete(`/api/v1/leases/${deleteTestLeaseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should not return soft deleted lease', async () => {
      const res = await request(app)
        .get(`/api/v1/leases/${deleteTestLeaseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('should restore deleted lease', async () => {
      const restoreRes = await request(app)
        .patch(`/api/v1/leases/${deleteTestLeaseId}/restore`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(restoreRes.status).toBe(200);

      const getRes = await request(app)
        .get(`/api/v1/leases/${deleteTestLeaseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(200);
    });
  });

  describe('Organization Isolation', () => {
    let otherToken: string;
    let otherOrgLeaseId: string;

    beforeAll(async () => {
      // Create another user in different organization
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Other Org User',
          email: `org-isolation-lease-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          organizationName: `Other Org ${Date.now()}`,
        });

      otherToken = registerRes.body.data.token;

      // For simplicity, we'll try to access a lease from this org
    });

    it('should not access lease from other organization', async () => {
      const res = await request(app)
        .get(`/api/v1/leases/${leaseId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Lease Statistics', () => {
    it('should get organization lease statistics', async () => {
      const res = await request(app)
        .get('/api/v1/leases/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBeDefined();
      expect(res.body.data.byStatus).toBeDefined();
    });

    it('should get unit lease statistics', async () => {
      const res = await request(app)
        .get(`/api/v1/units/${unitId}/leases/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalLeases).toBeDefined();
      expect(res.body.data.activeLeases).toBeDefined();
    });

    it('should get tenant lease statistics', async () => {
      const res = await request(app)
        .get(`/api/v1/tenants/${tenantId}/leases/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalLeases).toBeDefined();
      expect(res.body.data.activeLeases).toBeDefined();
    });
  });

  describe('Authorization', () => {
    it('should return 401 without authentication token', async () => {
      const res = await request(app).get('/api/v1/leases');

      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/leases')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });
});
