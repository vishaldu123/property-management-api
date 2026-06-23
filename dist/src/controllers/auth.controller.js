"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const prisma_1 = __importDefault(require("../config/prisma"));
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    organizationName: zod_1.z.string().min(1),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
    organizationId: zod_1.z.string().uuid().optional(),
});
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';
const createToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '8h' });
};
const register = async (req, res) => {
    const { name, email, password, organizationName } = registerSchema.parse(req.body);
    const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const organizationSlug = organizationName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const result = await prisma_1.default.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });
        const organization = await tx.organization.create({
            data: {
                name: organizationName,
                slug: organizationSlug || `org-${Date.now()}`,
            },
        });
        const membership = await tx.organizationUser.create({
            data: {
                organizationId: organization.id,
                userId: user.id,
                role: 'OWNER',
            },
        });
        return { user, organization, membership };
    });
    const token = createToken({
        userId: result.user.id,
        organizationId: result.organization.id,
        role: result.membership.role,
        email: result.user.email,
    });
    return res.status(201).json({
        token,
        organization: {
            id: result.organization.id,
            name: result.organization.name,
            slug: result.organization.slug,
        },
    });
};
exports.register = register;
const login = async (req, res) => {
    const { email, password, organizationId } = loginSchema.parse(req.body);
    const user = await prisma_1.default.user.findUnique({
        where: { email },
        include: {
            memberships: {
                include: { organization: true },
            },
        },
    });
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const passwordMatches = await bcrypt_1.default.compare(password, user.password);
    if (!passwordMatches) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const membership = organizationId
        ? user.memberships.find((m) => m.organizationId === organizationId)
        : user.memberships[0];
    if (!membership) {
        return res.status(403).json({ message: 'User is not associated with the requested organization' });
    }
    const token = createToken({
        userId: user.id,
        organizationId: membership.organizationId,
        role: membership.role,
        email: user.email,
    });
    return res.json({
        token,
        organization: {
            id: membership.organization.id,
            name: membership.organization.name,
            slug: membership.organization.slug,
        },
    });
};
exports.login = login;
