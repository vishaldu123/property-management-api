"use strict";
/**
 * Authorization Middleware Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const authorization_middleware_1 = require("../authorization.middleware");
jest.mock('../../services/rbac.service', () => ({
    rbacService: {
        userHasRoleByKey: jest.fn().mockResolvedValue(true),
        userHasAnyPermission: jest.fn().mockResolvedValue(true),
        userHasAllPermissions: jest.fn().mockResolvedValue(true),
    },
}));
describe('Authorization Middleware', () => {
    let req;
    let res;
    let next;
    beforeEach(() => {
        req = {
            headers: {},
            params: {},
            user: {
                userId: 'test-user-123',
                organizationId: 'test-org-123',
            },
        };
        res = {
            status: jest.fn(function () { return this; }),
            json: jest.fn(),
        };
        next = jest.fn();
    });
    describe('requireRole', () => {
        it('should pass through valid role check', async () => {
            const middleware = (0, authorization_middleware_1.requireRole)(['ADMIN', 'OWNER']);
            await middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });
        it('should fail if user context not found', async () => {
            const middleware = (0, authorization_middleware_1.requireRole)(['ADMIN']);
            req.user = undefined;
            await middleware(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });
    describe('requirePermission', () => {
        it('should pass through valid permission check', async () => {
            const middleware = (0, authorization_middleware_1.requirePermission)(['READ_USERS', 'WRITE_USERS']);
            await middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });
        it('should fail if user context not found', async () => {
            const middleware = (0, authorization_middleware_1.requirePermission)(['READ_USERS']);
            req.user = undefined;
            await middleware(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });
    describe('requireOrganizationOwnership', () => {
        it('should allow access to own organization', () => {
            req.params = { organizationId: 'test-org-123' };
            const middleware = (0, authorization_middleware_1.requireOrganizationOwnership)('organizationId');
            middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });
        it('should deny cross-organization access', () => {
            req.params = { organizationId: 'different-org-456' };
            const middleware = (0, authorization_middleware_1.requireOrganizationOwnership)('organizationId');
            middleware(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
        });
        it('should fail if organization ID param missing', () => {
            req.params = {};
            const middleware = (0, authorization_middleware_1.requireOrganizationOwnership)('organizationId');
            middleware(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
        });
        it('should support custom param name', () => {
            req.params = { orgId: 'test-org-123' };
            const middleware = (0, authorization_middleware_1.requireOrganizationOwnership)('orgId');
            middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
    describe('requireResourceOwnership', () => {
        it('should pass resource ownership check', () => {
            const middleware = (0, authorization_middleware_1.requireResourceOwnership)('createdBy');
            middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });
        it('should fail if user context not found', () => {
            const middleware = (0, authorization_middleware_1.requireResourceOwnership)('createdBy');
            req.user = undefined;
            middleware(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });
    describe('requireAll', () => {
        it('should chain multiple middleware successfully', async () => {
            const middleware1 = jest.fn((req, res, next) => next());
            const middleware2 = jest.fn((req, res, next) => next());
            const combined = (0, authorization_middleware_1.requireAll)(middleware1, middleware2);
            await combined(req, res, next);
            expect(middleware1).toHaveBeenCalled();
            expect(middleware2).toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });
        it('should stop execution on middleware error', async () => {
            const middleware1 = jest.fn((req, res, next) => next(new Error('Auth failed')));
            const middleware2 = jest.fn();
            const combined = (0, authorization_middleware_1.requireAll)(middleware1, middleware2);
            await combined(req, res, next);
            expect(middleware1).toHaveBeenCalled();
            expect(middleware2).not.toHaveBeenCalled();
        });
    });
});
