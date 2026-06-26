"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_ENV = 'test';
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
describe.skip('Property CRUD E2E', () => {
    const user = {
        name: 'Prop Tester',
        email: 'prop.tester@example.com',
        password: 'Password123!',
        organizationName: 'Prop Org',
    };
    let token;
    let propertyId;
    beforeAll(async () => {
        await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(user);
        const res = await (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({ email: user.email, password: user.password });
        token = res.body.token;
    });
    it('creates a property', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/properties')
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'E2E Property', address: '1 Test St', city: 'City', state: 'State' });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('id');
        propertyId = res.body.id;
    });
    it('lists properties', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/properties').set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
    it('gets property by id', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get(`/api/properties/${propertyId}`).set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.id).toBe(propertyId);
    });
    it('updates the property', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .put(`/api/properties/${propertyId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'E2E Property Updated' });
        expect(res.status).toBe(200);
        expect(res.body.name).toBe('E2E Property Updated');
    });
    it('deletes the property', async () => {
        const res = await (0, supertest_1.default)(app_1.default).delete(`/api/properties/${propertyId}`).set('Authorization', `Bearer ${token}`);
        expect([200, 204]).toContain(res.status);
    });
});
