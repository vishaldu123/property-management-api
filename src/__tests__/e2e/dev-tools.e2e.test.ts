process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../../app';
import prisma from '../../config/prisma';
import { getAccessToken, getOrganizationId } from '../helpers/auth.helpers';

describe('Dev Tools E2E Tests', () => {
  const seed = Date.now();
  let authToken = '';
  let organizationId = '';

  beforeAll(async () => {
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Dev Tools User',
        email: `dev-tools-${seed}@example.com`,
        password: 'TestPassword123!',
        organizationName: `Dev Tools Org ${seed}`,
      })
      .expect(201);

    authToken = getAccessToken(registerRes.body);
    organizationId = getOrganizationId(registerRes.body);
  });

  afterAll(async () => {
    if (organizationId) {
      await prisma.maintenanceRequest.deleteMany({ where: { organizationId } });
      await prisma.payment.deleteMany({ where: { organizationId } });
      await prisma.lease.deleteMany({ where: { organizationId } });
      await prisma.tenant.deleteMany({ where: { organizationId } });
      await prisma.unit.deleteMany({ where: { organizationId } });
      await prisma.property.deleteMany({ where: { organizationId } });
      await prisma.organizationUser.deleteMany({ where: { organizationId } });
      await prisma.organization.delete({ where: { id: organizationId } }).catch(() => undefined);
    }
    await prisma.$disconnect();
  });

  it('GET /api/v1/dev/data-summary returns zero counts for a new organization', async () => {
    const res = await request(app)
      .get('/api/v1/dev/data-summary')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(res.body.data.properties).toBe(0);
    expect(res.body.data.units).toBe(0);
    expect(res.body.data.tenants).toBe(0);
  });

  it('POST /api/v1/dev/seed creates demo portfolio data', async () => {
    const res = await request(app)
      .post('/api/v1/dev/seed')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
      .expect(201);

    expect(res.body.data.properties).toBe(2);
    expect(res.body.data.units).toBe(6);
    expect(res.body.data.tenants).toBe(4);
    expect(res.body.data.leases).toBe(3);
    expect(res.body.data.payments).toBe(5);
    expect(res.body.data.maintenanceRequests).toBe(3);
  });

  it('POST /api/v1/dev/seed without force conflicts when data exists', async () => {
    const res = await request(app)
      .post('/api/v1/dev/seed')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
      .expect(409);

    expect(res.body.message).toMatch(/already has portfolio data/i);
  });

  it('POST /api/v1/dev/reset clears portfolio data', async () => {
    const res = await request(app)
      .post('/api/v1/dev/reset')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
      .expect(200);

    expect(res.body.data.properties).toBe(0);

    const summary = await request(app)
      .get('/api/v1/dev/data-summary')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(summary.body.data.properties).toBe(0);
    expect(summary.body.data.units).toBe(0);
  });
});
