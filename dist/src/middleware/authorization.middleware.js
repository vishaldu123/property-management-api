"use strict";
/**
 * Authorization Middleware
 * Provides role-based and permission-based access control
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthorization = exports.requireAll = exports.requireResourceOwnership = exports.requireOrganizationOwnership = exports.organizationScope = exports.requireAllPermissions = exports.requirePermission = exports.requireRole = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const rbac_service_1 = require("../services/rbac.service");
/**
 * Role-based authorization middleware
 * Validates that the user has one of the required roles
 *
 * @param requiredRoles - Array of acceptable roles (keys)
 */
const requireRole = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new errors_1.ForbiddenError('User context not found');
            }
            logger_1.default.debug('Checking user role', {
                userId: req.user.userId,
                organizationId: req.user.organizationId,
                requiredRoles,
            });
            // Check if user has any of the required roles
            for (const roleKey of requiredRoles) {
                const hasRole = await rbac_service_1.rbacService.userHasRoleByKey?.(req.user.organizationId, req.user.userId, roleKey);
                if (hasRole) {
                    next();
                    return;
                }
            }
            throw new errors_1.ForbiddenError('Insufficient role permissions');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Forbidden';
            logger_1.default.warn('Role authorization failed', { error: errorMessage });
            res.status(403).json({ message: errorMessage });
        }
    };
};
exports.requireRole = requireRole;
/**
 * Permission-based authorization middleware
 * Validates that the user has one of the required permissions
 *
 * @param requiredPermissions - Array of acceptable permission keys
 */
const requirePermission = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new errors_1.ForbiddenError('User context not found');
            }
            logger_1.default.debug('Checking user permission', {
                userId: req.user.userId,
                organizationId: req.user.organizationId,
                requiredPermissions,
            });
            // Check if user has any of the required permissions
            const hasPermission = await rbac_service_1.rbacService.userHasAnyPermission(req.user.organizationId, req.user.userId, requiredPermissions);
            if (!hasPermission) {
                throw new errors_1.ForbiddenError('Insufficient permissions');
            }
            next();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Forbidden';
            logger_1.default.warn('Permission authorization failed', { error: errorMessage });
            res.status(403).json({ message: errorMessage });
        }
    };
};
exports.requirePermission = requirePermission;
/**
 * Require all permissions middleware
 * Validates that the user has ALL the required permissions
 *
 * @param requiredPermissions - Array of required permission keys
 */
const requireAllPermissions = (requiredPermissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new errors_1.ForbiddenError('User context not found');
            }
            logger_1.default.debug('Checking all user permissions', {
                userId: req.user.userId,
                organizationId: req.user.organizationId,
                requiredPermissions,
            });
            // Check if user has all required permissions
            const hasAllPermissions = await rbac_service_1.rbacService.userHasAllPermissions(req.user.organizationId, req.user.userId, requiredPermissions);
            if (!hasAllPermissions) {
                throw new errors_1.ForbiddenError('Insufficient permissions');
            }
            next();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Forbidden';
            logger_1.default.warn('All permissions check failed', { error: errorMessage });
            res.status(403).json({ message: errorMessage });
        }
    };
};
exports.requireAllPermissions = requireAllPermissions;
/**
 * Organization scope middleware
 * Ensures the user is accessing their own organization
 *
 * @param orgIdParamName - Name of the organization ID parameter
 */
const organizationScope = (orgIdParamName = 'organizationId') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new errors_1.ForbiddenError('User context not found');
            }
            const requestedOrgId = req.params[orgIdParamName] || req.user.organizationId;
            const userOrgId = req.user.organizationId;
            if (requestedOrgId !== userOrgId) {
                logger_1.default.warn('Cross-organization access attempt', {
                    userId: req.user.userId,
                    userOrgId,
                    requestedOrgId,
                });
                throw new errors_1.ForbiddenError('Access denied for requested organization');
            }
            next();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Forbidden';
            logger_1.default.warn('Organization scope check failed', { error: errorMessage });
            res.status(403).json({ message: errorMessage });
        }
    };
};
exports.organizationScope = organizationScope;
/**
 * Organization ownership verification middleware
 * Ensures the user's organization matches the requested organization
 * Prevents cross-organization access
 */
const requireOrganizationOwnership = (orgIdParamName = 'organizationId') => {
    return (0, exports.organizationScope)(orgIdParamName);
};
exports.requireOrganizationOwnership = requireOrganizationOwnership;
/**
 * Resource ownership verification middleware
 * Ensures the user owns the resource (or is admin)
 * Framework for future implementation
 */
const requireResourceOwnership = (resourceOwnerIdField = 'createdBy') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new errors_1.ForbiddenError('User context not found');
            }
            // Phase 2: Implement actual resource ownership checking
            logger_1.default.debug('Resource ownership check', {
                userId: req.user.userId,
                field: resourceOwnerIdField,
            });
            next();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Forbidden';
            logger_1.default.warn('Resource ownership check failed', { error: errorMessage });
            res.status(403).json({ message: errorMessage });
        }
    };
};
exports.requireResourceOwnership = requireResourceOwnership;
/**
 * Middleware composer for chaining multiple authorization checks
 *
 * @param middlewares - Array of middleware functions to apply in sequence
 */
const requireAll = (...middlewares) => {
    return async (req, res, next) => {
        try {
            for (const middleware of middlewares) {
                await new Promise((resolve, reject) => {
                    middleware(req, res, (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            }
            next();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Forbidden';
            logger_1.default.warn('Combined authorization check failed', { error: errorMessage });
            res.status(403).json({ message: errorMessage });
        }
    };
};
exports.requireAll = requireAll;
/**
 * Middleware composer for optional authorization checks
 * Continues even if authorization fails
 * Useful for different response formats based on auth status
 */
const optionalAuthorization = (...middlewares) => {
    return async (req, res, next) => {
        try {
            for (const middleware of middlewares) {
                await new Promise((resolve) => {
                    middleware(req, res, () => {
                        // Ignore errors and continue
                        resolve();
                    });
                });
            }
            next();
        }
        catch (error) {
            // Silently ignore errors
            next();
        }
    };
};
exports.optionalAuthorization = optionalAuthorization;
exports.default = {
    requireRole: exports.requireRole,
    requirePermission: exports.requirePermission,
    requireOrganizationOwnership: exports.requireOrganizationOwnership,
    requireResourceOwnership: exports.requireResourceOwnership,
    requireAll: exports.requireAll,
    optionalAuthorization: exports.optionalAuthorization,
};
