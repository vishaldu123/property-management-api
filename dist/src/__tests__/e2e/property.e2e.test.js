"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.NODE_ENV = 'test';
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const auth_helpers_1 = require("../helpers/auth.helpers");
describe('Property CRUD E2E Tests', () => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const user = {
        name: 'Property Manager',
        email: `property.manager.${uniqueSuffix}@test.com`,
        password: 'Password123!@',
        organizationName: `Property Test Org ${uniqueSuffix}`,
    };
    let authToken;
    let organizationId;
    let propertyId;
    beforeAll(async () => {
        // Register user
        const registerRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/register')
            .send(user);
        expect(registerRes.status).toBe(201);
        organizationId = (0, auth_helpers_1.getOrganizationId)(registerRes.body);
        // Login
        const loginRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/auth/login')
            .send({ email: user.email, password: user.password });
        expect(loginRes.status).toBe(200);
        authToken = (0, auth_helpers_1.getAccessToken)(loginRes.body);
    });
    afterAll(async () => {
        // Cleanup: Delete test data only if organizationId was set
        if (organizationId) {
            await prisma_1.default.property.deleteMany({ where: { organizationId } });
            await prisma_1.default.organization.delete({ where: { id: organizationId } }).catch(() => {
                // Organization might not exist if setup failed, silently ignore
            });
        }
        await prisma_1.default.$disconnect();
    });
    describe('POST /api/v1/properties', () => {
        it('should create a new property with all required fields', async () => {
            const propertyData = {
                name: 'Downtown Office Building',
                code: 'DT-OFFICE-001',
                description: 'Modern downtown office complex',
                propertyType: 'Commercial',
                status: 'Active',
                address: '123 Main Street',
                city: 'New York',
                state: 'NY',
                country: 'USA',
                postalCode: '10001',
                latitude: 40.7128,
                longitude: -74.006,
                timezone: 'America/New_York',
                totalUnits: 10,
                yearBuilt: 2020,
                notes: 'Premium location with parking',
            };
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/properties')
                .set('Authorization', `Bearer ${authToken}`)
                .send(propertyData);
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.name).toBe(propertyData.name);
            expect(res.body.data.code).toBe(propertyData.code);
            expect(res.body.data.organizationId).toBe(organizationId);
            expect(res.body.data.status).toBe('Active');
            expect(res.body.data.propertyType).toBe('Commercial');
            expect(res.body.data.createdBy).toBeDefined();
            propertyId = res.body.data.id;
        });
        it('should fail to create property with duplicate code in same organization', async () => {
            const propertyData = {
                name: 'Another Office',
                code: 'DT-OFFICE-001', // Same code as above
                propertyType: 'Office',
                status: 'Draft',
                address: '456 Side Street',
                city: 'Boston',
                state: 'MA',
                country: 'USA',
                postalCode: '02101',
            };
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/properties')
                .set('Authorization', `Bearer ${authToken}`)
                .send(propertyData);
            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
        });
        it('should fail to create property with invalid property type', async () => {
            const propertyData = {
                name: 'Test Property',
                code: 'TEST-001',
                propertyType: 'InvalidType',
                status: 'Draft',
                address: '789 Test Ave',
                city: 'Test City',
                state: 'TS',
                country: 'USA',
                postalCode: '00000',
            };
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/properties')
                .set('Authorization', `Bearer ${authToken}`)
                .send(propertyData);
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
        it('should fail to create property without required fields', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/properties')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'Incomplete Property' });
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
    describe('GET /api/v1/properties/:id', () => {
        it('should retrieve a property by ID', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get(`/api/v1/properties/${propertyId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(propertyId);
            expect(res.body.data.organizationId).toBe(organizationId);
        });
        it('should fail to retrieve non-existent property', async () => {
            const fakeId = 'invalid-id';
            const res = await (0, supertest_1.default)(app_1.default)
                .get(`/api/v1/properties/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`);
            // Invalid UUID format returns 400 validation error
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
    describe('PUT /api/v1/properties/:id', () => {
        it('should update a property with partial data', async () => {
            const updateData = {
                name: 'Downtown Office Building (Updated)',
                status: 'Inactive',
                totalUnits: 15,
            };
            const res = await (0, supertest_1.default)(app_1.default)
                .put(`/api/v1/properties/${propertyId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe(updateData.name);
            expect(res.body.data.status).toBe('Inactive');
            expect(res.body.data.totalUnits).toBe(15);
            expect(res.body.data.updatedBy).toBeDefined();
        });
        it('should fail to update with duplicate code', async () => {
            // First create another property
            const property2Res = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/properties')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                name: 'Property 2',
                code: 'PROP-002',
                propertyType: 'Villa',
                status: 'Draft',
                address: '999 Ave',
                city: 'City',
                state: 'ST',
                country: 'Country',
                postalCode: '12345',
            });
            expect(property2Res.status).toBe(201);
            const property2Id = property2Res.body.data.id;
            // Try to update property 2 with property 1's code
            const res = await (0, supertest_1.default)(app_1.default)
                .put(`/api/v1/properties/${property2Id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ code: 'DT-OFFICE-001' });
            expect(res.status).toBe(409);
            expect(res.body.success).toBe(false);
        });
    });
    describe('GET /api/v1/properties', () => {
        beforeAll(async () => {
            // Create multiple properties for filtering/pagination tests
            const properties = [
                {
                    name: 'Apartment Complex A',
                    code: 'APT-001',
                    propertyType: 'Apartment',
                    status: 'Active',
                    address: '100 Apt St',
                    city: 'New York',
                    state: 'NY',
                    country: 'USA',
                    postalCode: '10001',
                },
                {
                    name: 'Apartment Complex B',
                    code: 'APT-002',
                    propertyType: 'Apartment',
                    status: 'Draft',
                    address: '200 Apt St',
                    city: 'New York',
                    state: 'NY',
                    country: 'USA',
                    postalCode: '10002',
                },
                {
                    name: 'Warehouse in Chicago',
                    code: 'WH-001',
                    propertyType: 'Warehouse',
                    status: 'Active',
                    address: '300 Industrial',
                    city: 'Chicago',
                    state: 'IL',
                    country: 'USA',
                    postalCode: '60601',
                },
            ];
            for (const prop of properties) {
                await (0, supertest_1.default)(app_1.default)
                    .post('/api/v1/properties')
                    .set('Authorization', `Bearer ${authToken}`)
                    .send(prop);
            }
        });
        it('should list all properties with pagination', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/v1/properties')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ page: 1, limit: 10 });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.meta).toBeDefined();
            expect(res.body.meta.page).toBe(1);
        });
        it('should filter properties by status', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/v1/properties')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ status: 'Active' });
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
            res.body.data.forEach((prop) => {
                expect(prop.status).toBe('Active');
            });
        });
        it('should filter properties by property type', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/v1/properties')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ propertyType: 'Apartment' });
            expect(res.status).toBe(200);
            res.body.data.forEach((prop) => {
                expect(prop.propertyType).toBe('Apartment');
            });
        });
        it('should filter properties by city', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/v1/properties')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ city: 'Chicago' });
            expect(res.status).toBe(200);
            res.body.data.forEach((prop) => {
                expect(prop.city).toBe('Chicago');
            });
        });
        it('should search properties by name', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/v1/properties')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ search: 'Apartment' });
            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeGreaterThan(0);
            res.body.data.forEach((prop) => {
                expect(prop.name.toLowerCase()).toContain('apartment');
            });
        });
        it('should search properties by code', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/v1/properties')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ search: 'APT' });
            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeGreaterThan(0);
            res.body.data.forEach((prop) => {
                expect(prop.code).toContain('APT');
            });
        });
    });
    describe('DELETE /api/v1/properties/:id (Soft Delete)', () => {
        it('should soft delete a property', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/v1/properties/${propertyId}`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.deletedAt).toBeDefined();
        });
        it('should fail to delete non-existent property', async () => {
            const fakeId = 'invalid-id';
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/v1/properties/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`);
            // Invalid UUID format returns 400 validation error
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });
    describe('PATCH /api/v1/properties/:id/restore', () => {
        it('should restore a soft-deleted property', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .patch(`/api/v1/properties/${propertyId}/restore`)
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.deletedAt).toBeNull();
        });
    });
    describe('GET /api/v1/properties/stats', () => {
        it('should retrieve property statistics', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/v1/properties/stats')
                .set('Authorization', `Bearer ${authToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('total');
            expect(res.body.data).toHaveProperty('active');
            expect(res.body.data).toHaveProperty('draft');
            expect(res.body.data).toHaveProperty('archived');
        });
    });
    describe('Organization Isolation', () => {
        let otherOrgToken;
        let otherOrgId;
        beforeAll(async () => {
            // Create another organization
            const otherUser = {
                name: 'Other User',
                email: `other.user.${uniqueSuffix}@test.com`,
                password: 'Password123!@',
                organizationName: `Other Org ${uniqueSuffix}`,
            };
            const registerRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/auth/register')
                .send(otherUser);
            otherOrgId = (0, auth_helpers_1.getOrganizationId)(registerRes.body);
            const loginRes = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/auth/login')
                .send({ email: otherUser.email, password: otherUser.password });
            otherOrgToken = (0, auth_helpers_1.getAccessToken)(loginRes.body);
        });
        it('should not allow access to properties from other organizations', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get(`/api/v1/properties/${propertyId}`)
                .set('Authorization', `Bearer ${otherOrgToken}`);
            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
        });
        afterAll(async () => {
            if (otherOrgId) {
                await prisma_1.default.property.deleteMany({ where: { organizationId: otherOrgId } });
                await prisma_1.default.organization.delete({ where: { id: otherOrgId } }).catch(() => {
                    // Organization might not exist if setup failed, silently ignore
                });
            }
        });
    });
});
