"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.requireRole = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const rbac_service_1 = require("../services/rbac.service");
const JWT_SECRET = (() => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    return secret;
})();
const isUserRole = (role) => typeof role === 'string' &&
    ['OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'ACCOUNTANT', 'MEMBER'].includes(role);
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization header missing or invalid' });
        }
        const token = authHeader.split(' ')[1];
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (!payload || typeof payload !== 'object') {
            throw new Error('Invalid token payload');
        }
        const { userId, organizationId, role, email } = payload;
        if (!userId || !organizationId || !email || !isUserRole(role)) {
            throw new Error('Invalid token payload');
        }
        const membership = await prisma_1.default.organizationUser.findUnique({
            where: {
                organizationId_userId: {
                    organizationId,
                    userId,
                },
            },
        });
        if (!membership) {
            return res.status(403).json({ message: 'User membership not found for this organization' });
        }
        req.user = {
            userId,
            organizationId,
            role,
            email,
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token', error: error.message });
    }
};
exports.requireAuth = requireAuth;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        const role = req.user?.role;
        if (!role || !allowedRoles.includes(role)) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        next();
    };
};
exports.requireRole = requireRole;
const authorize = (permission) => {
    const requiredPermissions = Array.isArray(permission) ? permission : [permission];
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authorization header missing or invalid' });
        }
        const allowedPermissions = (0, rbac_service_1.getRolePermissions)(req.user.role);
        const hasPermission = requiredPermissions.some((p) => allowedPermissions.includes(p));
        if (!hasPermission) {
            return res.status(403).json({ message: 'Insufficient permissions' });
        }
        next();
    };
};
exports.authorize = authorize;
