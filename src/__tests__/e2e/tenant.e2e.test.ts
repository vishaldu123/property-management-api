process.env.NODE_ENV = 'test';
import request from 'supertest';
import app from '../../app';
import prisma from '../../config/prisma';

describe('Tenant Domain E2E Tests', () => {
  let authToken: string;
  let userId: string;
  let organizationId: string;
  let propertyId: string;
  let unitId: string;
  let tenantId: string;

  beforeAll(async () => {
    // Register user
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Tenant Test User',
        email: `tenant-test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        organizationName: 'Tenant Test Org',
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
  });

  afterAll(async () => {
    // Cleanup
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

  describe('CREATE Tenant', () => {
    it('should create a new tenant with required fields', async () => {
      const res = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: `tenant-${Date.now()}@example.com`,
          status: 'Prospect',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.firstName).toBe('John');
      expect(res.body.data.lastName).toBe('Doe');
      expect(res.body.data.status).toBe('Prospect');

      tenantId = res.body.data.id;
    });

    it('should create tenant with all fields including unit association', async () => {
      const res = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: `jane-${Date.now()}@example.com`,
          phone: '+1234567890',
          dateOfBirth: '1990-01-15T00:00:00Z',
          governmentIdType: 'Passport',
          governmentIdNumber: 'PASS123456',
          emergencyContactName: 'Bob Smith',
          emergencyContactPhone: '+0987654321',
          occupation: 'Engineer',
          employer: 'Tech Corp',
          unitId,
          status: 'Active',
          notes: 'Good tenant',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.firstName).toBe('Jane');
      expect(res.body.data.unitId).toBe(unitId);
      expect(res.body.data.status).toBe('Active');
      expect(res.body.data.governmentIdType).toBe('Passport');
    });

    it('should return 409 if email already exists in organization', async () => {
      const email = `duplicate-${Date.now()}@example.com`;

      // Create first tenant
      await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'First',
          lastName: 'Tenant',
          email,
          status: 'Prospect',
        });

      // Try to create second with same email
      const res = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Second',
          lastName: 'Tenant',
          email,
          status: 'Prospect',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 if invalid status provided', async () => {
      const res = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: `invalid-${Date.now()}@example.com`,
          status: 'InvalidStatus',
        });

      expect(res.status).toBe(400);
    });

    it('should return 400 if invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email',
          status: 'Prospect',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('READ Tenant', () => {
    it('should retrieve tenant by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/tenants/${tenantId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(tenantId);
      expect(res.body.data.firstName).toBe('John');
    });

    it('should return 404 if tenant not found', async () => {
      const res = await request(app)
        .get('/api/v1/tenants/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('UPDATE Tenant', () => {
    it('should update tenant successfully', async () => {
      const res = await request(app)
        .put(`/api/v1/tenants/${tenantId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Johnny',
          phone: '+1111111111',
          status: 'Active',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.firstName).toBe('Johnny');
      expect(res.body.data.phone).toBe('+1111111111');
      expect(res.body.data.status).toBe('Active');
    });

    it('should reject duplicate email on update', async () => {
      const email = `unique-${Date.now()}@example.com`;

      // Create two tenants
      const tenant1Res = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Tenant1',
          lastName: 'One',
          email,
          status: 'Prospect',
        });

      const tenant2Res = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Tenant2',
          lastName: 'Two',
          email: `other-${Date.now()}@example.com`,
          status: 'Prospect',
        });

      // Try to update tenant2 with tenant1's email
      const res = await request(app)
        .put(`/api/v1/tenants/${tenant2Res.body.data.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email });

      expect(res.status).toBe(409);
    });

    it('should allow disassociating unit by setting unitId to null', async () => {
      // Create tenant with unit
      const createRes = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Unit',
          lastName: 'Tenant',
          email: `unit-tenant-${Date.now()}@example.com`,
          unitId,
          status: 'Active',
        });

      const tenantWithUnit = createRes.body.data.id;

      // Remove unit association
      const updateRes = await request(app)
        .put(`/api/v1/tenants/${tenantWithUnit}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ unitId: null });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.unitId).toBeNull();
    });
  });

  describe('LIST Tenants', () => {
    beforeAll(async () => {
      // Create test tenants
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/tenants')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            firstName: `TestTenant${i}`,
            lastName: `Last${i}`,
            email: `list-test-${i}-${Date.now()}@example.com`,
            status: i % 2 === 0 ? 'Active' : 'Prospect',
          });
      }
    });

    it('should list all tenants with pagination', async () => {
      const res = await request(app)
        .get('/api/v1/tenants?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta).toBeDefined();
    });

    it('should filter tenants by status', async () => {
      const res = await request(app)
        .get('/api/v1/tenants?status=Active&limit=100')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach((tenant: any) => {
        expect(tenant.status).toBe('Active');
      });
    });

    it('should search tenants by first name', async () => {
      const res = await request(app)
        .get(`/api/v1/tenants?search=Johnny`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        res.body.data.forEach((tenant: any) => {
          expect(
            tenant.firstName.toLowerCase().includes('johnny') ||
            tenant.lastName.toLowerCase().includes('johnny') ||
            tenant.email.toLowerCase().includes('johnny')
          ).toBe(true);
        });
      }
    });

    it('should search tenants by email', async () => {
      const res = await request(app)
        .get(`/api/v1/tenants?search=example.com`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter tenants by unitId', async () => {
      const res = await request(app)
        .get(`/api/v1/tenants?unitId=${unitId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach((tenant: any) => {
        expect(tenant.unitId).toBe(unitId);
      });
    });
  });

  describe('DELETE Tenant', () => {
    let deleteTestTenantId: string;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          firstName: 'Delete',
          lastName: 'Test',
          email: `delete-test-${Date.now()}@example.com`,
          status: 'Prospect',
        });

      deleteTestTenantId = res.body.data.id;
    });

    it('should soft delete tenant', async () => {
      const res = await request(app)
        .delete(`/api/v1/tenants/${deleteTestTenantId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should not return soft deleted tenant in list', async () => {
      const res = await request(app)
        .get(`/api/v1/tenants/${deleteTestTenantId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('should restore deleted tenant', async () => {
      // Restore
      const restoreRes = await request(app)
        .patch(`/api/v1/tenants/${deleteTestTenantId}/restore`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(restoreRes.status).toBe(200);

      // Verify restored
      const getRes = await request(app)
        .get(`/api/v1/tenants/${deleteTestTenantId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(200);
    });
  });

  describe('Organization Isolation', () => {
    let otherToken: string;
    let otherOrgId: string;
    let otherTenantId: string;

    beforeAll(async () => {
      // Create another user in different organization
      const registerRes = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Other Org User',
          email: `org-isolation-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          organizationName: 'Other Org',
        });

      otherToken = registerRes.body.data.token;
      otherOrgId = registerRes.body.data.organization.id;

      // Create tenant in other organization
      const tenantRes = await request(app)
        .post('/api/v1/tenants')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          firstName: 'Other',
          lastName: 'Org',
          email: `other-org-${Date.now()}@example.com`,
          status: 'Active',
        });

      otherTenantId = tenantRes.body.data.id;
    });

    it('should not access other organization tenant', async () => {
      const res = await request(app)
        .get(`/api/v1/tenants/${otherTenantId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });

    it('should not list other organization tenants', async () => {
      const res = await request(app)
        .get('/api/v1/tenants?page=1&limit=100')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((tenant: any) => {
        expect(tenant.organizationId).toBe(organizationId);
      });

      const hasOtherOrgTenant = res.body.data.some((t: any) => t.id === otherTenantId);
      expect(hasOtherOrgTenant).toBe(false);
    });
  });

  describe('Tenant Statistics', () => {
    it('should get organization tenant statistics', async () => {
      const res = await request(app)
        .get('/api/v1/tenants/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total).toBeDefined();
      expect(res.body.data.byStatus).toBeDefined();
    });

    it('should get unit tenant statistics', async () => {
      const res = await request(app)
        .get(`/api/v1/tenants/units/${unitId}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tenantCount).toBeDefined();
    });
  });

  describe('Authorization', () => {
    it('should return 401 without authentication token', async () => {
      const res = await request(app)
        .get('/api/v1/tenants');

      expect(res.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/tenants')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });
  });
});
