process.env.NODE_ENV = 'test';

import request from 'supertest';
import app from '../../app';

describe('Organization Module E2E', () => {
  const seed = Date.now();
  const primaryUser = {
    name: 'Org Admin',
    email: `org-admin-${seed}@example.com`,
    password: 'Password123!',
    organizationName: `Primary Org ${seed}`,
  };
  const secondaryUser = {
    name: 'Other Admin',
    email: `org-admin-secondary-${seed}@example.com`,
    password: 'Password123!',
    organizationName: `Secondary Org ${seed}`,
  };

  let authToken = '';
  let ownOrganizationId = '';
  let otherOrganizationId = '';

  it('creates an organization (public endpoint)', async () => {
    const createResponse = await request(app).post('/api/organizations').send({
      name: `Standalone Org ${seed}`,
      slug: `standalone-org-${seed}`,
      email: `standalone-org-${seed}@example.com`,
      city: 'Mumbai',
      country: 'India',
      subscriptionPlan: 'FREE',
      subscriptionStatus: 'TRIAL',
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.success).toBe(true);
    expect(createResponse.body.data.slug).toBe(`standalone-org-${seed}`);
  });

  it('registers users and gets auth context', async () => {
    await request(app).post('/api/auth/register').send(primaryUser).expect(201);
    await request(app).post('/api/auth/register').send(secondaryUser).expect(201);

    const loginPrimary = await request(app)
      .post('/api/auth/login')
      .send({ email: primaryUser.email, password: primaryUser.password })
      .expect(200);

    const loginSecondary = await request(app)
      .post('/api/auth/login')
      .send({ email: secondaryUser.email, password: secondaryUser.password })
      .expect(200);

    authToken = loginPrimary.body.token;
    ownOrganizationId = loginPrimary.body.organization.id;
    otherOrganizationId = loginSecondary.body.organization.id;
  });

  it('lists organizations with pagination metadata', async () => {
    const response = await request(app)
      .get('/api/organizations?page=1&limit=10&search=Primary')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.meta).toHaveProperty('total');
    expect(response.body.data[0].id).toBe(ownOrganizationId);
  });

  it('gets organization by id in same tenant', async () => {
    const response = await request(app)
      .get(`/api/organizations/${ownOrganizationId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(ownOrganizationId);
  });

  it('prevents cross-organization access', async () => {
    const response = await request(app)
      .get(`/api/organizations/${otherOrganizationId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(403);

    expect(response.body.message).toBe('Access denied for requested organization');
  });

  it('updates organization', async () => {
    const response = await request(app)
      .put(`/api/organizations/${ownOrganizationId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        city: 'Pune',
        subscriptionPlan: 'PROFESSIONAL',
        subscriptionStatus: 'ACTIVE',
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.city).toBe('Pune');
    expect(response.body.data.subscriptionPlan).toBe('PROFESSIONAL');
  });

  it('soft deletes and restores organization', async () => {
    const deleteResponse = await request(app)
      .delete(`/api/organizations/${ownOrganizationId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(deleteResponse.body.success).toBe(true);
    expect(deleteResponse.body.data.deletedAt).not.toBeNull();

    const restoreResponse = await request(app)
      .post(`/api/organizations/${ownOrganizationId}/restore`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(restoreResponse.body.success).toBe(true);
    expect(restoreResponse.body.data.deletedAt).toBeNull();
  });
});
