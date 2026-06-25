"use strict";
/**
 * Authentication Middleware
 * JWT validation and user context injection
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../config/environment");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Middleware to validate JWT and inject user context
 */
const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger_1.default.warn('Missing or invalid authorization header');
            throw new errors_1.UnauthorizedError('Authorization header missing or invalid');
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const payload = jsonwebtoken_1.default.verify(token, environment_1.config.jwtSecret);
        if (!payload.userId || !payload.organizationId) {
            logger_1.default.warn('Invalid token payload');
            throw new errors_1.UnauthorizedError('Invalid token payload');
        }
        req.user = {
            userId: payload.userId,
            organizationId: payload.organizationId,
        };
        next();
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.default.warn('Authentication failed', { error: errorMessage });
        if (error instanceof errors_1.UnauthorizedError) {
            res.status(401).json({ message: error.message });
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ message: 'Invalid token' });
        }
        else if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ message: 'Token expired' });
        }
        else {
            res.status(401).json({ message: 'Unauthorized' });
        }
    }
};
exports.requireAuth = requireAuth;
/**
 * Stub for authorization checking (implemented in Phase 2)
 * TODO: Implement permission checking in Phase 2 RBAC
 */
const authorize = (_permissions) => {
    return (_req, _res, next) => {
        // Phase 2: Implement actual permission checking
        next();
    };
};
exports.authorize = authorize;
