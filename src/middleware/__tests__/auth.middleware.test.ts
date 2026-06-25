process.env.JWT_SECRET = 'test_jwt_secret';

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../../config/prisma';
import { authorize, requireAuth, UserRole } from '../auth.middleware';

jest.mock('../../config/prisma', () => ({
  organizationUser: {
    findUnique: jest.fn(),
  },
}));

const mockedPrisma = prisma as unknown as {
  organizationUser: {
    findUnique: jest.Mock;
  };
};

const createMockRequest = (token?: string) => ({
  headers: token ? { authorization: `Bearer ${token}` } : {},
}) as any;

const createMockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const next = jest.fn() as NextFunction;

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';

describe('auth.middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('returns 401 when authorization header is missing', async () => {
      const req = createMockRequest();
      const res = createMockResponse();

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authorization header missing or invalid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 401 when token is invalid', async () => {
      const req = createMockRequest('invalid-token');
      const res = createMockResponse();

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid or expired token' }));
      expect(next).not.toHaveBeenCalled();
    });

    it('attaches user and calls next when token is valid and membership exists', async () => {
      const payload = {
        userId: 'user-1',
        organizationId: 'org-1',
        role: 'MANAGER' as UserRole,
        email: 'user@example.com',
      };
      const token = jwt.sign(payload, JWT_SECRET);
      mockedPrisma.organizationUser.findUnique.mockResolvedValue({
        id: 'membership-1',
        organizationId: payload.organizationId,
        userId: payload.userId,
        role: payload.role,
        createdAt: new Date(),
      } as any);

      const req = createMockRequest(token);
      const res = createMockResponse();

      await requireAuth(req, res, next);

      expect(req.user).toEqual(payload);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('authorize', () => {
    it('returns 401 when user is not attached', async () => {
      const middleware = authorize('PROPERTY_READ');
      const req = {} as any;
      const res = createMockResponse();

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authorization header missing or invalid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 403 when permission is not in role map', async () => {
      const middleware = authorize('PROPERTY_CREATE');
      const req = { user: { role: 'STAFF' } } as any;
      const res = createMockResponse();

      await middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient permissions' });
      expect(next).not.toHaveBeenCalled();
    });

    it('calls next when permission is in role map', async () => {
      const middleware = authorize('PROPERTY_READ');
      const req = { user: { role: 'STAFF' } } as any;
      const res = createMockResponse();

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
