"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
process.env.JWT_SECRET = 'test_jwt_secret';
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_middleware_1 = require("../auth.middleware");
const createMockRequest = (token) => ({
    headers: token ? { authorization: `Bearer ${token}` } : {},
});
const createMockResponse = () => {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };
    return res;
};
const createMockNext = () => jest.fn();
describe('Auth Middleware', () => {
    describe('requireAuth', () => {
        it('should pass if valid token is provided', () => {
            const token = jsonwebtoken_1.default.sign({ userId: 'test-user', organizationId: 'test-org' }, 'test_jwt_secret', { expiresIn: '8h' });
            const req = createMockRequest(token);
            const res = createMockResponse();
            const next = createMockNext();
            (0, auth_middleware_1.requireAuth)(req, res, next);
            expect(next).toHaveBeenCalled();
            expect(req.user).toEqual({ userId: 'test-user', organizationId: 'test-org' });
        });
        it('should reject if no token is provided', () => {
            const req = createMockRequest();
            const res = createMockResponse();
            const next = createMockNext();
            (0, auth_middleware_1.requireAuth)(req, res, next);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
        });
        it('should reject if token is invalid', () => {
            const req = createMockRequest('invalid-token');
            const res = createMockResponse();
            const next = createMockNext();
            (0, auth_middleware_1.requireAuth)(req, res, next);
            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
        });
    });
    describe('authorize', () => {
        it('should pass authorization (stub for Phase 2)', () => {
            const authMiddleware = (0, auth_middleware_1.authorize)(['PROPERTY_READ']);
            const req = createMockRequest();
            const res = createMockResponse();
            const next = createMockNext();
            authMiddleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
});
