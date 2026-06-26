/**
 * Authorization Middleware
 * Provides role-based and permission-based access control
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ForbiddenError } from '../utils/errors';
import logger from '../utils/logger';
import { rbacService } from '../services/rbac.service';


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
 * @param requiredRoles - Array of acceptable roles (keys)
 */
export const requireRole = (requiredRoles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User context not found');
      }

      logger.debug('Checking user role', {
        userId: req.user.userId,
        organizationId: req.user.organizationId,
        requiredRoles,
      });

      // Check if user has any of the required roles
      for (const roleKey of requiredRoles) {
        const hasRole = await rbacService.userHasRoleByKey?.(req.user.organizationId, req.user.userId, roleKey);
        if (hasRole) {
          next();
          return;
        }
      }

      throw new ForbiddenError('Insufficient role permissions');
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
 * @param requiredPermissions - Array of acceptable permission keys
 */
export const requirePermission = (requiredPermissions: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User context not found');
      }

      logger.debug('Checking user permission', {
        userId: req.user.userId,
        organizationId: req.user.organizationId,
        requiredPermissions,
      });

      // Check if user has any of the required permissions
      const hasPermission = await rbacService.userHasAnyPermission(
        req.user.organizationId,
        req.user.userId,
        requiredPermissions
      );

      if (!hasPermission) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Forbidden';
      logger.warn('Permission authorization failed', { error: errorMessage });
      res.status(403).json({ message: errorMessage });
    }
  };
};

/**
 * Require all permissions middleware
 * Validates that the user has ALL the required permissions
 * 
 * @param requiredPermissions - Array of required permission keys
 */
export const requireAllPermissions = (requiredPermissions: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User context not found');
      }

      logger.debug('Checking all user permissions', {
        userId: req.user.userId,
        organizationId: req.user.organizationId,
        requiredPermissions,
      });

      // Check if user has all required permissions
      const hasAllPermissions = await rbacService.userHasAllPermissions(
        req.user.organizationId,
        req.user.userId,
        requiredPermissions
      );

      if (!hasAllPermissions) {
        throw new ForbiddenError('Insufficient permissions');
      }

      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Forbidden';
      logger.warn('All permissions check failed', { error: errorMessage });
      res.status(403).json({ message: errorMessage });
    }
  };
};

/**
 * Organization scope middleware
 * Ensures the user is accessing their own organization
 * 
 * @param orgIdParamName - Name of the organization ID parameter
 */
export const organizationScope = (orgIdParamName = 'organizationId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new ForbiddenError('User context not found');
      }

      const requestedOrgId = req.params[orgIdParamName];

      if (!requestedOrgId) {
        throw new ForbiddenError(`Organization ID parameter '${orgIdParamName}' not found`);
      }

      const userOrgId = req.user.organizationId;

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
      logger.warn('Organization scope check failed', { error: errorMessage });
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
  return organizationScope(orgIdParamName);
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
export const requireAll = (...middlewares: Array<(req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Promise<void>>) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      for (const middleware of middlewares) {
        await new Promise<void>((resolve, reject) => {
          middleware(req, res, (err?: any) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Forbidden';
      logger.warn('Combined authorization check failed', { error: errorMessage });
      res.status(403).json({ message: errorMessage });
    }
  };
};

/**
 * Middleware composer for optional authorization checks
 * Continues even if authorization fails
 * Useful for different response formats based on auth status
 */
export const optionalAuthorization = (...middlewares: Array<(req: AuthenticatedRequest, res: Response, next: NextFunction) => void | Promise<void>>) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      for (const middleware of middlewares) {
        await new Promise<void>((resolve) => {
          middleware(req, res, () => {
            // Ignore errors and continue
            resolve();
          });
        });
      }
      next();
    } catch (error) {
      // Silently ignore errors
      next();
    }
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
