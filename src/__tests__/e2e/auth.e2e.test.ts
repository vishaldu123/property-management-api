process.env.NODE_ENV = 'test';
import request from 'supertest';
import app from '../../app';

describe('Auth E2E', () => {
  const testUser = {
    name: 'E2E User',
    email: 'e2e.user@example.com',
    password: 'Password123!',
    organizationName: 'E2E Org',
  };

  it('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('organization');
  });

  it('logs in the user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
});
