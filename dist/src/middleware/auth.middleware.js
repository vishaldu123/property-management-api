"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization header missing or invalid' });
        }
        const token = authHeader.split(' ')[1];
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const membership = await prisma_1.default.organizationUser.findUnique({
            where: {
                organizationId_userId: {
                    organizationId: payload.organizationId,
                    userId: payload.userId,
                },
            },
        });
        if (!membership) {
            return res.status(403).json({ message: 'User membership not found for this organization' });
        }
        req.user = {
            userId: payload.userId,
            organizationId: payload.organizationId,
            role: payload.role,
            email: payload.email,
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
