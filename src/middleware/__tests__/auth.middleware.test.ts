process.env.JWT_SECRET = 'test_jwt_secret';

import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authorize, requireAuth, AuthenticatedRequest } from '../auth.middleware';

const createMockRequest = (token?: string) => ({
  headers: token ? { authorization: `Bearer ${token}` } : {},
} as AuthenticatedRequest);

const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
};

const createMockNext = () => jest.fn() as unknown as NextFunction;

describe('Auth Middleware', () => {
  describe('requireAuth', () => {
    it('should pass if valid token is provided', () => {
      const token = jwt.sign(
        { userId: 'test-user', organizationId: 'test-org' },
        'test_jwt_secret',
        { expiresIn: '8h' }
      );
      const req = createMockRequest(token);
      const res = createMockResponse();
      const next = createMockNext();

      requireAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual({ userId: 'test-user', organizationId: 'test-org' });
    });

    it('should reject if no token is provided', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should reject if token is invalid', () => {
      const req = createMockRequest('invalid-token');
      const res = createMockResponse();
      const next = createMockNext();

      requireAuth(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('authorize', () => {
    it('should pass authorization (stub for Phase 2)', () => {
      const authMiddleware = authorize(['PROPERTY_READ']);
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      authMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
