"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_ENV = 'test';
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
describe('Lease Flow E2E', () => {
    const user = {
        name: 'Lease Tester',
        email: 'lease.tester@example.com',
        password: 'Password123!',
        organizationName: 'Lease Org',
    };
    let token;
    let propertyId;
    let unitId;
    let tenantId;
    let leaseId;
    beforeAll(async () => {
        await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(user);
        const res = await (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({ email: user.email, password: user.password });
        token = res.body.token;
    });
    it('creates property and unit and tenant, then lease', async () => {
        const p = await (0, supertest_1.default)(app_1.default)
            .post('/api/properties')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Lease Property', address: '1 Lease St', city: 'City', state: 'State' });
        propertyId = p.body.id;
        const u = await (0, supertest_1.default)(app_1.default)
            .post('/api/units')
            .set('Authorization', `Bearer ${token}`)
            .send({ propertyId, unitNumber: '201', rentAmount: 40000 });
        unitId = u.body.id;
        const t = await (0, supertest_1.default)(app_1.default)
            .post('/api/tenants')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Tenant One', email: 'tenant.one@example.com', phone: '+911234567890' });
        tenantId = t.body.id;
        const l = await (0, supertest_1.default)(app_1.default)
            .post('/api/leases')
            .set('Authorization', `Bearer ${token}`)
            .send({ unitId, tenantId, startDate: '2026-07-01', endDate: '2027-06-30', monthlyRent: 40000 });
        expect(l.status).toBe(201);
        leaseId = l.body.id;
    });
    it('retrieves the lease', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get(`/api/leases/${leaseId}`).set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(leaseId);
    });
});
