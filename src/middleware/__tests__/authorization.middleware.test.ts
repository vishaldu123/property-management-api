/**
 * Authorization Middleware Tests
 */

import { Request, Response, NextFunction } from 'express';
import {
  requireRole,
  requirePermission,
  requireOrganizationOwnership,
  requireResourceOwnership,
  requireAll,
} from '../authorization.middleware';
import { AuthenticatedRequest } from '../auth.middleware';
import { ForbiddenError } from '../../utils/errors';

describe('Authorization Middleware', () => {
  let req: AuthenticatedRequest;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      params: {},
      user: {
        userId: 'test-user-123',
        organizationId: 'test-org-123',
      },
    } as any;

    res = {
      status: jest.fn(function() { return this; }),
      json: jest.fn(),
    } as any;

    next = jest.fn();
  });

  describe('requireRole', () => {
    it('should pass through valid role check', () => {
      const middleware = requireRole(['ADMIN', 'OWNER']);
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should fail if user context not found', () => {
      const middleware = requireRole(['ADMIN']);
      req.user = undefined;
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requirePermission', () => {
    it('should pass through valid permission check', () => {
      const middleware = requirePermission(['READ_USERS', 'WRITE_USERS']);
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should fail if user context not found', () => {
      const middleware = requirePermission(['READ_USERS']);
      req.user = undefined;
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireOrganizationOwnership', () => {
    it('should allow access to own organization', () => {
      req.params = { organizationId: 'test-org-123' };
      const middleware = requireOrganizationOwnership('organizationId');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should deny cross-organization access', () => {
      req.params = { organizationId: 'different-org-456' };
      const middleware = requireOrganizationOwnership('organizationId');
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should fail if organization ID param missing', () => {
      req.params = {};
      const middleware = requireOrganizationOwnership('organizationId');
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should support custom param name', () => {
      req.params = { orgId: 'test-org-123' };
      const middleware = requireOrganizationOwnership('orgId');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireResourceOwnership', () => {
    it('should pass resource ownership check', () => {
      const middleware = requireResourceOwnership('createdBy');
      middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should fail if user context not found', () => {
      const middleware = requireResourceOwnership('createdBy');
      req.user = undefined;
      middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('requireAll', () => {
    it('should chain multiple middleware successfully', () => {
      const middleware1 = jest.fn((req, res, next) => next());
      const middleware2 = jest.fn((req, res, next) => next());
      
      const combined = requireAll(middleware1, middleware2);
      combined(req, res, next);

      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should stop execution on middleware error', () => {
      const middleware1 = jest.fn((req, res, next) => next(new Error('Auth failed')));
      const middleware2 = jest.fn();
      
      const combined = requireAll(middleware1, middleware2);
      combined(req, res, next);

      expect(middleware1).toHaveBeenCalled();
      expect(middleware2).not.toHaveBeenCalled();
    });
  });
});
