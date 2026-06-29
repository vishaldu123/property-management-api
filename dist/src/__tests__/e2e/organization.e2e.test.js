"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_ENV = 'test';
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const auth_helpers_1 = require("../helpers/auth.helpers");
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
        const createResponse = await (0, supertest_1.default)(app_1.default).post('/api/v1/organizations').send({
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
        await (0, supertest_1.default)(app_1.default).post('/api/v1/auth/register').send(primaryUser).expect(201);
        await (0, supertest_1.default)(app_1.default).post('/api/v1/auth/register').send(secondaryUser).expect(201);
        const loginPrimary = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/login')
            .send({ email: primaryUser.email, password: primaryUser.password })
            .expect(200);
        const loginSecondary = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/login')
            .send({ email: secondaryUser.email, password: secondaryUser.password })
            .expect(200);
        authToken = (0, auth_helpers_1.getAccessToken)(loginPrimary.body);
        ownOrganizationId = (0, auth_helpers_1.getOrganizationId)(loginPrimary.body);
        otherOrganizationId = (0, auth_helpers_1.getOrganizationId)(loginSecondary.body);
    });
    it('lists organizations with pagination metadata', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .get('/api/v1/organizations?page=1&limit=10&search=Primary')
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.meta).toHaveProperty('total');
        expect(response.body.data[0].id).toBe(ownOrganizationId);
    });
    it('gets organization by id in same tenant', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .get(`/api/v1/organizations/${ownOrganizationId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(ownOrganizationId);
    });
    it('prevents cross-organization access', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .get(`/api/v1/organizations/${otherOrganizationId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(403);
        expect(response.body.message).toBe('Access denied for requested organization');
    });
    it('updates organization', async () => {
        const response = await (0, supertest_1.default)(app_1.default)
            .put(`/api/v1/organizations/${ownOrganizationId}`)
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
        const deleteResponse = await (0, supertest_1.default)(app_1.default)
            .delete(`/api/v1/organizations/${ownOrganizationId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        expect(deleteResponse.body.success).toBe(true);
        expect(deleteResponse.body.data.deletedAt).not.toBeNull();
        const restoreResponse = await (0, supertest_1.default)(app_1.default)
            .post(`/api/v1/organizations/${ownOrganizationId}/restore`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(200);
        expect(restoreResponse.body.success).toBe(true);
        expect(restoreResponse.body.data.deletedAt).toBeNull();
    });
    // Organization Settings E2E Tests (Sprint 3)
    describe('Organization Settings', () => {
        it('gets organization settings', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get(`/api/v1/organizations/${ownOrganizationId}/settings`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('timezone');
            expect(response.body.data).toHaveProperty('currency');
            expect(response.body.data).toHaveProperty('dateFormat');
            expect(response.body.data).toHaveProperty('timeFormat');
            expect(response.body.data).toHaveProperty('language');
            expect(response.body.data).toHaveProperty('measurementUnit');
        });
        it('updates organization settings', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .put(`/api/v1/organizations/${ownOrganizationId}/settings`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                timezone: 'America/New_York',
                currency: 'USD',
                dateFormat: 'MM-DD-YYYY',
                language: 'es',
            })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.timezone).toBe('America/New_York');
            expect(response.body.data.dateFormat).toBe('MM-DD-YYYY');
            expect(response.body.data.language).toBe('es');
        });
        it('prevents cross-organization access to settings', async () => {
            const loginSecondary = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/auth/login')
                .send({ email: secondaryUser.email, password: secondaryUser.password })
                .expect(200);
            const secondaryToken = (0, auth_helpers_1.getAccessToken)(loginSecondary.body);
            await (0, supertest_1.default)(app_1.default)
                .get(`/api/v1/organizations/${ownOrganizationId}/settings`)
                .set('Authorization', `Bearer ${secondaryToken}`)
                .expect(403);
        });
        it('requires authentication for settings', async () => {
            await (0, supertest_1.default)(app_1.default)
                .get(`/api/v1/organizations/${ownOrganizationId}/settings`)
                .expect(401);
        });
        it('validates settings input', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .put(`/api/v1/organizations/${ownOrganizationId}/settings`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                currency: 'INVALID',
            })
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Validation failed');
        });
    });
    // Organization Branding E2E Tests (Sprint 3)
    describe('Organization Branding', () => {
        it('gets organization branding', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get(`/api/v1/organizations/${ownOrganizationId}/branding`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('primaryColor');
            expect(response.body.data).toHaveProperty('secondaryColor');
            expect(response.body.data).toHaveProperty('accentColor');
            expect(response.body.data).toHaveProperty('theme');
        });
        it('updates organization branding', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .put(`/api/v1/organizations/${ownOrganizationId}/branding`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                primaryColor: '#FF0000',
                secondaryColor: '#00FF00',
                accentColor: '#0000FF',
                theme: 'dark',
                logoUrl: 'https://example.com/new-logo.png',
                logoAltText: 'New Logo',
            })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.primaryColor).toBe('#FF0000');
            expect(response.body.data.theme).toBe('dark');
            expect(response.body.data.logoUrl).toBe('https://example.com/new-logo.png');
        });
        it('validates branding color format', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .put(`/api/v1/organizations/${ownOrganizationId}/branding`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                primaryColor: 'red',
            })
                .expect(400);
            expect(response.body.success).toBe(false);
        });
        it('prevents cross-organization access to branding', async () => {
            const loginSecondary = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/auth/login')
                .send({ email: secondaryUser.email, password: secondaryUser.password })
                .expect(200);
            const secondaryToken = (0, auth_helpers_1.getAccessToken)(loginSecondary.body);
            await (0, supertest_1.default)(app_1.default)
                .get(`/api/v1/organizations/${ownOrganizationId}/branding`)
                .set('Authorization', `Bearer ${secondaryToken}`)
                .expect(403);
        });
    });
    // Organization Preferences E2E Tests (Sprint 3)
    describe('Organization Preferences', () => {
        it('gets organization preferences', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get(`/api/v1/organizations/${ownOrganizationId}/preferences`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('emailNotifications');
            expect(response.body.data).toHaveProperty('emailDigest');
            expect(response.body.data).toHaveProperty('twoFactorAuth');
            expect(response.body.data).toHaveProperty('dataRetention');
            expect(response.body.data).toHaveProperty('backupFrequency');
        });
        it('updates organization preferences', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .put(`/api/v1/organizations/${ownOrganizationId}/preferences`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                emailNotifications: false,
                emailDigest: 'weekly',
                twoFactorAuth: true,
                dataRetention: 180,
                backupFrequency: 'monthly',
            })
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.emailNotifications).toBe(false);
            expect(response.body.data.emailDigest).toBe('weekly');
            expect(response.body.data.twoFactorAuth).toBe(true);
            expect(response.body.data.dataRetention).toBe(180);
            expect(response.body.data.backupFrequency).toBe('monthly');
        });
        it('validates preferences data retention range', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .put(`/api/v1/organizations/${ownOrganizationId}/preferences`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                dataRetention: 10000,
            })
                .expect(400);
            expect(response.body.success).toBe(false);
        });
        it('prevents cross-organization access to preferences', async () => {
            const loginSecondary = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/auth/login')
                .send({ email: secondaryUser.email, password: secondaryUser.password })
                .expect(200);
            const secondaryToken = (0, auth_helpers_1.getAccessToken)(loginSecondary.body);
            await (0, supertest_1.default)(app_1.default)
                .get(`/api/v1/organizations/${ownOrganizationId}/preferences`)
                .set('Authorization', `Bearer ${secondaryToken}`)
                .expect(403);
        });
        it('requires authentication for preferences', async () => {
            await (0, supertest_1.default)(app_1.default)
                .get(`/api/v1/organizations/${ownOrganizationId}/preferences`)
                .expect(401);
        });
        it('persists preference changes across multiple updates', async () => {
            // First update
            await (0, supertest_1.default)(app_1.default)
                .put(`/api/v1/organizations/${ownOrganizationId}/preferences`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ emailNotifications: false })
                .expect(200);
            // Second update (different field)
            const secondUpdate = await (0, supertest_1.default)(app_1.default)
                .put(`/api/v1/organizations/${ownOrganizationId}/preferences`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ twoFactorAuth: true })
                .expect(200);
            // Verify both changes persisted
            expect(secondUpdate.body.data.emailNotifications).toBe(false);
            expect(secondUpdate.body.data.twoFactorAuth).toBe(true);
        });
    });
});
