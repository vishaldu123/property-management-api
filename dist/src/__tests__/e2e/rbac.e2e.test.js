"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../../app"));
describe('RBAC E2E Smoke Tests', () => {
    const organizationId = '550e8400-e29b-41d4-a716-446655440001';
    const userId = '550e8400-e29b-41d4-a716-446655440002';
    let authToken;
    // This is a simplified smoke test that just verifies the endpoints exist and return proper errors
    // In a real scenario, this would be run after proper authentication setup
    describe('RBAC Endpoints Available', () => {
        it('permission endpoints should be defined', async () => {
            // These requests will likely fail due to missing auth, but that's OK for smoke test
            // The point is to verify the routes are registered and responding
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/v1/rbac/permissions')
                .set('Authorization', 'Bearer invalid-token');
            // Should not return 404 (route not found)
            expect(response.status).not.toBe(404);
        });
        it('role endpoints should be defined', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .get('/api/v1/rbac/roles')
                .set('Authorization', 'Bearer invalid-token');
            expect(response.status).not.toBe(404);
        });
        it('user role assignment endpoints should be defined', async () => {
            const response = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/rbac/users/roles')
                .set('Authorization', 'Bearer invalid-token')
                .send({ userId: 'test', roleId: 'test' });
            expect(response.status).not.toBe(404);
        });
    });
    describe('RBAC Service Integration', () => {
        it('should have rbacService available', async () => {
            const { rbacService } = require('../../services/rbac.service');
            expect(rbacService).toBeDefined();
            expect(typeof rbacService.createPermission).toBe('function');
            expect(typeof rbacService.createRole).toBe('function');
            expect(typeof rbacService.assignRoleToUser).toBe('function');
        });
        it('should have all repositories available', async () => {
            const { permissionRepository } = require('../../repositories/permission.repository');
            const { roleRepository } = require('../../repositories/role.repository');
            const { userRoleRepository } = require('../../repositories/user-role.repository');
            expect(permissionRepository).toBeDefined();
            expect(roleRepository).toBeDefined();
            expect(userRoleRepository).toBeDefined();
        });
        it('should have authorization middleware with permission checks', async () => {
            const authMiddleware = require('../../middleware/authorization.middleware');
            expect(authMiddleware.default).toBeDefined();
            expect(authMiddleware.default.requireRole).toBeDefined();
            expect(authMiddleware.default.requirePermission).toBeDefined();
        });
    });
});
