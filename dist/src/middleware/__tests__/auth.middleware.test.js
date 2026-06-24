"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../../config/prisma"));
const auth_middleware_1 = require("../auth.middleware");
jest.mock('../../config/prisma', () => ({
    organizationUser: {
        findUnique: jest.fn(),
    },
}));
const mockedPrisma = prisma_1.default;
const createMockRequest = (token) => ({
    headers: token ? { authorization: `Bearer ${token}` } : {},
});
const createMockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
const next = jest.fn();
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';
describe('auth.middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('requireAuth', () => {
        it('returns 401 when authorization header is missing', async () => {
            const req = createMockRequest();
            const res = createMockResponse();
            await (0, auth_middleware_1.requireAuth)(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Authorization header missing or invalid' });
            expect(next).not.toHaveBeenCalled();
        });
        it('returns 401 when token is invalid', async () => {
            const req = createMockRequest('invalid-token');
            const res = createMockResponse();
            await (0, auth_middleware_1.requireAuth)(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid or expired token' }));
            expect(next).not.toHaveBeenCalled();
        });
        it('attaches user and calls next when token is valid and membership exists', async () => {
            const payload = {
                userId: 'user-1',
                organizationId: 'org-1',
                role: 'MANAGER',
                email: 'user@example.com',
            };
            const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET);
            mockedPrisma.organizationUser.findUnique.mockResolvedValue({
                id: 'membership-1',
                organizationId: payload.organizationId,
                userId: payload.userId,
                role: payload.role,
                createdAt: new Date(),
            });
            const req = createMockRequest(token);
            const res = createMockResponse();
            await (0, auth_middleware_1.requireAuth)(req, res, next);
            expect(req.user).toEqual(payload);
            expect(next).toHaveBeenCalled();
        });
    });
    describe('authorize', () => {
        it('returns 401 when user is not attached', async () => {
            const middleware = (0, auth_middleware_1.authorize)('PROPERTY_READ');
            const req = {};
            const res = createMockResponse();
            await middleware(req, res, next);
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Authorization header missing or invalid' });
            expect(next).not.toHaveBeenCalled();
        });
        it('returns 403 when permission is not in role map', async () => {
            const middleware = (0, auth_middleware_1.authorize)('PROPERTY_CREATE');
            const req = { user: { role: 'STAFF' } };
            const res = createMockResponse();
            await middleware(req, res, next);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
            expect(next).not.toHaveBeenCalled();
        });
        it('calls next when permission is in role map', async () => {
            const middleware = (0, auth_middleware_1.authorize)('PROPERTY_READ');
            const req = { user: { role: 'STAFF' } };
            const res = createMockResponse();
            await middleware(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
});
