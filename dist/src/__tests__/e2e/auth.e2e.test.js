"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_ENV = 'test';
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
describe('Auth E2E', () => {
    const testUser = {
        name: 'E2E User',
        email: 'e2e.user@example.com',
        password: 'Password123!',
        organizationName: 'E2E Org',
    };
    it('registers a new user', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(testUser);
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('organization');
    });
    it('logs in the user', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/auth/login').send({
            email: testUser.email,
            password: testUser.password,
        });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });
});
