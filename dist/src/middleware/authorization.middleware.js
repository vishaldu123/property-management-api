"use strict";
/**
 * Authorization Middleware
 * Provides role-based and permission-based access control
 * Framework for future RBAC implementation
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthorization = exports.requireAll = exports.requireResourceOwnership = exports.requireOrganizationOwnership = exports.requirePermission = exports.requireRole = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Role-based authorization middleware
 * Validates that the user has one of the required roles
 *
 * @param requiredRoles - Array of acceptable roles
 */
const requireRole = (requiredRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new errors_1.ForbiddenError('User context not found');
            }
            // Note: In production, fetch roles from database
            // For now, this framework allows future implementation
            logger_1.default.debug('Role check', {
                userId: req.user.userId,
                requiredRoles,
            });
            // Phase 2: Implement actual role checking
            next();
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
 * @param requiredPermissions - Array of acceptable permissions
 */
const requirePermission = (requiredPermissions) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new errors_1.ForbiddenError('User context not found');
            }
            // Note: In production, fetch permissions from database
            // For now, this framework allows future implementation
            logger_1.default.debug('Permission check', {
                userId: req.user.userId,
                requiredPermissions,
            });
            // Phase 2: Implement actual permission checking
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
 * Organization ownership verification middleware
 * Ensures the user's organization matches the requested organization
 * Prevents cross-organization access
 */
const requireOrganizationOwnership = (orgIdParamName = 'organizationId') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new errors_1.ForbiddenError('User context not found');
            }
            const requestedOrgId = req.params[orgIdParamName];
            const userOrgId = req.user.organizationId;
            if (!requestedOrgId) {
                throw new errors_1.ForbiddenError(`Organization ID parameter '${orgIdParamName}' not found`);
            }
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
            logger_1.default.warn('Organization ownership check failed', { error: errorMessage });
            res.status(403).json({ message: errorMessage });
        }
    };
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
    return (req, res, next) => {
        let index = 0;
        const executeMiddleware = () => {
            if (index >= middlewares.length) {
                next();
                return;
            }
            const middleware = middlewares[index++];
            middleware(req, res, (err) => {
                if (err) {
                    next(err);
                }
                else {
                    executeMiddleware();
                }
            });
        };
        executeMiddleware();
    };
};
exports.requireAll = requireAll;
/**
 * Middleware composer for optional authorization checks
 * Continues even if authorization fails
 * Useful for different response formats based on auth status
 */
const optionalAuthorization = (...middlewares) => {
    return (req, res, next) => {
        let index = 0;
        const executeMiddleware = () => {
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
exports.optionalAuthorization = optionalAuthorization;
exports.default = {
    requireRole: exports.requireRole,
    requirePermission: exports.requirePermission,
    requireOrganizationOwnership: exports.requireOrganizationOwnership,
    requireResourceOwnership: exports.requireResourceOwnership,
    requireAll: exports.requireAll,
    optionalAuthorization: exports.optionalAuthorization,
};
