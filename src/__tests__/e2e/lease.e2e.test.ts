process.env.NODE_ENV = 'test';
import request from 'supertest';
import app from '../../app';

describe('Lease Flow E2E', () => {
  const user = {
    name: 'Lease Tester',
    email: 'lease.tester@example.com',
    password: 'Password123!',
    organizationName: 'Lease Org',
  };
  let token: string;
  let propertyId: string;
  let unitId: string;
  let tenantId: string;
  let leaseId: string;

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    token = res.body.token;
  });

  it('creates property and unit and tenant, then lease', async () => {
    const p = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Lease Property', address: '1 Lease St', city: 'City', state: 'State' });
    propertyId = p.body.id;

    const u = await request(app)
      .post('/api/units')
      .set('Authorization', `Bearer ${token}`)
      .send({ propertyId, unitNumber: '201', rentAmount: 40000 });
    unitId = u.body.id;

    const t = await request(app)
      .post('/api/tenants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Tenant One', email: 'tenant.one@example.com', phone: '+911234567890' });
    tenantId = t.body.id;

    const l = await request(app)
      .post('/api/leases')
      .set('Authorization', `Bearer ${token}`)
      .send({ unitId, tenantId, startDate: '2026-07-01', endDate: '2027-06-30', monthlyRent: 40000 });
    expect(l.status).toBe(201);
    leaseId = l.body.id;
  });

  it('retrieves the lease', async () => {
    const res = await request(app).get(`/api/leases/${leaseId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(leaseId);
  });
});
