process.env.NODE_ENV = 'test';
import request from 'supertest';
import app from '../../app';

describe.skip('Payment Flow E2E', () => {
  const user = {
    name: 'Payment Tester',
    email: 'payment.tester@example.com',
    password: 'Password123!',
    organizationName: 'Payment Org',
  };
  let token: string;
  let propertyId: string;
  let unitId: string;
  let tenantId: string;
  let leaseId: string;
  let paymentId: string;

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/login').send({ email: user.email, password: user.password });
    token = res.body.token;
  });

  it('creates lease and payment', async () => {
    const p = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Pay Property', address: '1 Pay St', city: 'City', state: 'State' });
    propertyId = p.body.id;

    const u = await request(app)
      .post('/api/units')
      .set('Authorization', `Bearer ${token}`)
      .send({ propertyId, unitNumber: '301', rentAmount: 45000 });
    unitId = u.body.id;

    const t = await request(app)
      .post('/api/tenants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Tenant Pay', email: 'tenant.pay@example.com', phone: '+911234567891' });
    tenantId = t.body.id;

    const l = await request(app)
      .post('/api/leases')
      .set('Authorization', `Bearer ${token}`)
      .send({ unitId, tenantId, startDate: '2026-07-01', endDate: '2027-06-30', monthlyRent: 45000 });
    leaseId = l.body.id;

    const pay = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ leaseId, amount: 45000, paymentDate: '2026-07-05', status: 'PENDING' });
    expect(pay.status).toBe(201);
    paymentId = pay.body.id;
  });

  it('retrieves payment by id', async () => {
    const res = await request(app).get(`/api/payments/${paymentId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(paymentId);
  });
});
