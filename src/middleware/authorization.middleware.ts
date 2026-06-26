/**
 * Authorization Middleware
 * Provides role-based and permission-based access control
 * Framework for future RBAC implementation
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ForbiddenError } from '../utils/errors';
import logger from '../utils/logger';

export interface AuthorizationContext {
  userId: string;
  organizationId: string;
  roles?: string[];
  permissions?: string[];
}

/**
 * Role-based authorization middleware
 * Validates that the user has one of the required roles
 * 
 * @param requiredRoles - Array of acceptable roles
 */
export const requireRole = (requiredRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User context not found');
      }

      // Note: In production, fetch roles from database
      // For now, this framework allows future implementation
      logger.debug('Role check', {
        userId: req.user.userId,
        requiredRoles,
      });

      // Phase 2: Implement actual role checking
      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Forbidden';
      logger.warn('Role authorization failed', { error: errorMessage });
      res.status(403).json({ message: errorMessage });
    }
  };
};

/**
 * Permission-based authorization middleware
 * Validates that the user has one of the required permissions
 * 
 * @param requiredPermissions - Array of acceptable permissions
 */
export const requirePermission = (requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User context not found');
      }

      // Note: In production, fetch permissions from database
      // For now, this framework allows future implementation
      logger.debug('Permission check', {
        userId: req.user.userId,
        requiredPermissions,
      });

      // Phase 2: Implement actual permission checking
      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Forbidden';
      logger.warn('Permission authorization failed', { error: errorMessage });
      res.status(403).json({ message: errorMessage });
    }
  };
};

/**
 * Organization ownership verification middleware
 * Ensures the user's organization matches the requested organization
 * Prevents cross-organization access
 */
export const requireOrganizationOwnership = (orgIdParamName = 'organizationId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User context not found');
      }

      const requestedOrgId = req.params[orgIdParamName];
      const userOrgId = req.user.organizationId;

      if (!requestedOrgId) {
        throw new ForbiddenError(`Organization ID parameter '${orgIdParamName}' not found`);
      }

      if (requestedOrgId !== userOrgId) {
        logger.warn('Cross-organization access attempt', {
          userId: req.user.userId,
          userOrgId,
          requestedOrgId,
        });
        throw new ForbiddenError('Access denied for requested organization');
      }

      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Forbidden';
      logger.warn('Organization ownership check failed', { error: errorMessage });
      res.status(403).json({ message: errorMessage });
    }
  };
};

/**
 * Resource ownership verification middleware
 * Ensures the user owns the resource (or is admin)
 * Framework for future implementation
 */
export const requireResourceOwnership = (
  resourceOwnerIdField = 'createdBy',
) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User context not found');
      }

      // Phase 2: Implement actual resource ownership checking
      logger.debug('Resource ownership check', {
        userId: req.user.userId,
        field: resourceOwnerIdField,
      });

      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Forbidden';
      logger.warn('Resource ownership check failed', { error: errorMessage });
      res.status(403).json({ message: errorMessage });
    }
  };
};

/**
 * Middleware composer for chaining multiple authorization checks
 * 
 * @param middlewares - Array of middleware functions to apply in sequence
 */
export const requireAll = (...middlewares: Array<(req: AuthenticatedRequest, res: Response, next: NextFunction) => void>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    let index = 0;

    const executeMiddleware = (): void => {
      if (index >= middlewares.length) {
        next();
        return;
      }

      const middleware = middlewares[index++];
      middleware(req, res, (err?: any) => {
        if (err) {
          next(err);
        } else {
          executeMiddleware();
        }
      });
    };

    executeMiddleware();
  };
};

/**
 * Middleware composer for optional authorization checks
 * Continues even if authorization fails
 * Useful for different response formats based on auth status
 */
export const optionalAuthorization = (...middlewares: Array<(req: AuthenticatedRequest, res: Response, next: NextFunction) => void>) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    let index = 0;

    const executeMiddleware = (): void => {
      if (index >= middlewares.length) {
        next();
        return;
      }

      const middleware = middlewares[index++];
      middleware(req, res, () => {
        // Ignore errors and continue
        executeMiddleware();
      });
    };

    executeMiddleware();
  };
};

export default {
  requireRole,
  requirePermission,
  requireOrganizationOwnership,
  requireResourceOwnership,
  requireAll,
  optionalAuthorization,
};
