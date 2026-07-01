"use strict";
/**
 * Authentication Service
 * Business logic for registration, login, token management, and password reset
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_repository_1 = require("../repositories/user.repository");
const refresh_token_repository_1 = require("../repositories/refresh-token.repository");
const password_reset_token_repository_1 = require("../repositories/password-reset-token.repository");
const email_service_1 = require("./email.service");
const rbac_service_1 = require("./rbac.service");
const prisma_1 = __importDefault(require("../config/prisma"));
const environment_1 = require("../config/environment");
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
function userRelationsInclude(organizationId) {
    return {
        userRoles: {
            where: organizationId
                ? { organizationId, deletedAt: null }
                : { deletedAt: null },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        },
        memberships: {
            where: { deletedAt: null },
            include: {
                organization: true,
            },
        },
    };
}
function transformAuthUser(user) {
    return {
        id: user.id,
        email: user.email,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        displayName: user.name,
        avatar: undefined,
        roles: user.userRoles.map(ur => ({
            id: ur.id,
            userId: ur.userId,
            organizationId: ur.organizationId,
            roleId: ur.roleId,
            role: ur.role
                ? {
                    id: ur.role.id,
                    organizationId: ur.role.organizationId,
                    name: ur.role.name,
                    key: ur.role.key,
                    description: ur.role.description ?? undefined,
                    permissions: (ur.role.permissions || []).map(rp => ({
                        id: rp.permission.id,
                        organizationId: rp.permission.organizationId,
                        name: rp.permission.name,
                        key: rp.permission.key,
                        description: rp.permission.description ?? undefined,
                        createdAt: rp.permission.createdAt.toISOString(),
                        updatedAt: rp.permission.updatedAt.toISOString(),
                    })),
                    createdAt: ur.role.createdAt.toISOString(),
                    updatedAt: ur.role.updatedAt.toISOString(),
                }
                : undefined,
            createdAt: ur.createdAt.toISOString(),
            updatedAt: ur.updatedAt.toISOString(),
        })),
        organizations: user.memberships.map(m => ({
            id: m.id,
            userId: m.userId,
            organizationId: m.organizationId,
            joinedAt: m.joinedAt.toISOString(),
            organization: {
                id: m.organization.id,
                name: m.organization.name,
                slug: m.organization.slug,
                description: m.organization.description ?? undefined,
                logo: m.organization.logo ?? undefined,
                favicon: m.organization.favicon ?? undefined,
                ownerId: m.organization.ownerId ?? m.organization.createdBy ?? '',
                createdAt: m.organization.createdAt.toISOString(),
                updatedAt: m.organization.updatedAt.toISOString(),
            },
        })),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
    };
}
class AuthService {
    bcryptRounds = 10;
    jwtExpiry = '15m'; // Access token expiry
    refreshTokenExpiry = '7d'; // Refresh token expiry
    passwordResetTokenExpiry = 15 * 60 * 1000; // 15 minutes
    async register(payload) {
        const { name, email, password, organizationName } = payload;
        // Validate email is unique
        const existingUser = await user_repository_1.userRepository.findByEmail(email);
        if (existingUser) {
            logger_1.default.warn('Registration attempted with existing email', { email });
            throw new errors_1.ValidationError({ email: ['Email already exists'] });
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, this.bcryptRounds);
        // Generate organization slug
        const organizationSlug = this.generateSlug(organizationName);
        logger_1.default.info('Creating new user and organization', { email, organizationName });
        try {
            // Use transaction to ensure atomicity
            const result = await prisma_1.default.$transaction(async (tx) => {
                // Create user
                const user = await tx.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                    },
                });
                // Create organization
                const organization = await tx.organization.create({
                    data: {
                        name: organizationName,
                        slug: organizationSlug,
                        email,
                    },
                });
                // Create membership (user as OWNER)
                await tx.organizationUser.create({
                    data: {
                        organizationId: organization.id,
                        userId: user.id,
                        role: 'OWNER',
                    },
                });
                return { user, organization };
            });
            const accessToken = this.generateAccessToken({
                userId: result.user.id,
                organizationId: result.organization.id,
            });
            const refreshToken = await this.generateAndStoreRefreshToken(result.user.id);
            logger_1.default.info('User registered successfully', { userId: result.user.id, organizationId: result.organization.id });
            await rbac_service_1.rbacService.ensureOrganizationBootstrap(result.organization.id, result.user.id);
            const fullUser = await prisma_1.default.user.findUnique({
                where: { id: result.user.id },
                include: userRelationsInclude(result.organization.id),
            });
            if (!fullUser) {
                throw new errors_1.NotFoundError('User not found');
            }
            const transformedUser = transformAuthUser(fullUser);
            return {
                user: transformedUser,
                accessToken,
                refreshToken,
            };
        }
        catch (error) {
            logger_1.default.error('Registration failed', error, { email });
            throw error;
        }
    }
    async login(payload) {
        const { email, password } = payload;
        logger_1.default.debug('Login attempt', { email });
        // Find user with memberships
        const userResult = await user_repository_1.userRepository.findByEmail(email);
        if (!userResult) {
            logger_1.default.warn('Login failed - user not found', { email });
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        // Verify password
        const passwordMatches = await bcrypt_1.default.compare(password, userResult.password);
        if (!passwordMatches) {
            logger_1.default.warn('Login failed - invalid password', { email });
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        // Get full user data with roles and organizations
        const user = await prisma_1.default.user.findUnique({
            where: { id: userResult.id },
            include: {
                userRoles: {
                    include: {
                        role: true,
                    },
                },
                memberships: {
                    include: {
                        organization: true,
                    },
                },
            },
        });
        if (!user || user.memberships.length === 0) {
            logger_1.default.warn('Login failed - user not found or no memberships', { email });
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        // Generate tokens
        const membership = user.memberships[0];
        await rbac_service_1.rbacService.ensureOrganizationBootstrap(membership.organizationId, user.id);
        const refreshedUser = await prisma_1.default.user.findUnique({
            where: { id: user.id },
            include: userRelationsInclude(membership.organizationId),
        });
        if (!refreshedUser) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        const accessToken = this.generateAccessToken({
            userId: user.id,
            organizationId: membership.organizationId,
        });
        const refreshToken = await this.generateAndStoreRefreshToken(user.id);
        logger_1.default.info('User logged in successfully', { userId: user.id });
        const transformedUser = transformAuthUser(refreshedUser);
        return {
            user: transformedUser,
            accessToken,
            refreshToken,
        };
    }
    async refreshToken(refreshToken) {
        logger_1.default.debug('Refreshing token');
        // Verify refresh token exists and is valid
        const tokenRecord = await refresh_token_repository_1.refreshTokenRepository.findByToken(refreshToken);
        if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
            logger_1.default.warn('Invalid or expired refresh token');
            throw new errors_1.UnauthorizedError('Invalid or expired refresh token');
        }
        // Get user with memberships
        const user = await user_repository_1.userRepository.findWithMemberships(tokenRecord.userId);
        if (!user || user.memberships.length === 0) {
            logger_1.default.warn('User not found or has no memberships');
            throw new errors_1.UnauthorizedError('Invalid token');
        }
        const membership = user.memberships[0];
        // Generate new access token
        const newAccessToken = this.generateAccessToken({
            userId: user.id,
            organizationId: membership.organizationId,
        });
        // Revoke old refresh token and generate new one (token rotation)
        await refresh_token_repository_1.refreshTokenRepository.revoke(refreshToken);
        const newRefreshToken = await this.generateAndStoreRefreshToken(user.id);
        logger_1.default.info('Token refreshed successfully', { userId: user.id });
        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }
    async logout(refreshToken) {
        try {
            await refresh_token_repository_1.refreshTokenRepository.revoke(refreshToken);
            logger_1.default.info('User logged out successfully');
        }
        catch (error) {
            logger_1.default.error('Logout failed', error);
            throw error;
        }
    }
    async forgotPassword(email) {
        logger_1.default.debug('Forgot password request', { email });
        const user = await user_repository_1.userRepository.findByEmail(email);
        // Don't reveal if email exists or not (security best practice)
        if (!user) {
            logger_1.default.warn('Forgot password for non-existent email', { email });
            return { message: 'If an account exists, a password reset email has been sent' };
        }
        // Generate reset token
        const resetToken = this.generateRandomToken();
        const expiresAt = new Date(Date.now() + this.passwordResetTokenExpiry);
        await password_reset_token_repository_1.passwordResetTokenRepository.create({
            userId: user.id,
            token: resetToken,
            expiresAt,
        });
        // Send reset email
        const resetLink = `${environment_1.config.frontendUrl || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
        await email_service_1.emailService.sendPasswordResetEmail(user.email, resetLink, user.name);
        logger_1.default.info('Password reset email sent', { userId: user.id });
        return { message: 'If an account exists, a password reset email has been sent' };
    }
    async resetPassword(token, newPassword) {
        logger_1.default.debug('Reset password request');
        // Find valid reset token
        const resetToken = await password_reset_token_repository_1.passwordResetTokenRepository.findByToken(token);
        if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
            logger_1.default.warn('Invalid or expired password reset token');
            throw new errors_1.UnauthorizedError('Invalid or expired reset token');
        }
        // Hash new password
        const hashedPassword = await bcrypt_1.default.hash(newPassword, this.bcryptRounds);
        try {
            // Update user password and mark token as used
            await prisma_1.default.$transaction(async (tx) => {
                await tx.user.update({
                    where: { id: resetToken.userId },
                    data: { password: hashedPassword },
                });
                await tx.passwordResetToken.update({
                    where: { token },
                    data: { usedAt: new Date() },
                });
                // Revoke all refresh tokens (force re-login)
                await tx.refreshToken.updateMany({
                    where: { userId: resetToken.userId },
                    data: { isRevoked: true },
                });
            });
            logger_1.default.info('Password reset successfully', { userId: resetToken.userId });
            return { message: 'Password has been reset successfully' };
        }
        catch (error) {
            logger_1.default.error('Password reset failed', error);
            throw error;
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        logger_1.default.debug('Change password request', { userId });
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            logger_1.default.warn('User not found', { userId });
            throw new errors_1.NotFoundError('User not found');
        }
        // Verify current password
        const passwordMatches = await bcrypt_1.default.compare(currentPassword, user.password);
        if (!passwordMatches) {
            logger_1.default.warn('Change password failed - invalid current password', { userId });
            throw new errors_1.UnauthorizedError('Current password is incorrect');
        }
        // Hash new password
        const hashedPassword = await bcrypt_1.default.hash(newPassword, this.bcryptRounds);
        try {
            // Update password
            await prisma_1.default.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });
            // Send confirmation email
            await email_service_1.emailService.sendPasswordChangedEmail(user.email, user.name);
            logger_1.default.info('Password changed successfully', { userId });
            return { message: 'Password has been changed successfully' };
        }
        catch (error) {
            logger_1.default.error('Change password failed', error);
            throw error;
        }
    }
    async getCurrentUser(userId, organizationId) {
        logger_1.default.debug('Get current user', { userId });
        await rbac_service_1.rbacService.ensureOrganizationBootstrap(organizationId, userId);
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            include: userRelationsInclude(organizationId),
        });
        if (!user) {
            logger_1.default.warn('User not found', { userId });
            throw new errors_1.NotFoundError('User not found');
        }
        return {
            user: transformAuthUser(user),
        };
    }
    generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, environment_1.config.jwtSecret, {
            expiresIn: this.jwtExpiry,
            jwtid: crypto_1.default.randomUUID(),
        });
    }
    async generateAndStoreRefreshToken(userId) {
        const token = this.generateRandomToken();
        const expiresAt = new Date(Date.now() + this.parseExpiry(this.refreshTokenExpiry));
        await refresh_token_repository_1.refreshTokenRepository.create({
            userId,
            token,
            expiresAt,
        });
        return token;
    }
    generateRandomToken() {
        return crypto_1.default.randomBytes(32).toString('hex');
    }
    parseExpiry(expiry) {
        const match = expiry.match(/^(\d+)([smhd])$/);
        if (!match)
            return 7 * 24 * 60 * 60 * 1000; // Default 7 days
        const [, value, unit] = match;
        const num = parseInt(value, 10);
        switch (unit) {
            case 's':
                return num * 1000;
            case 'm':
                return num * 60 * 1000;
            case 'h':
                return num * 60 * 60 * 1000;
            case 'd':
                return num * 24 * 60 * 60 * 1000;
            default:
                return 7 * 24 * 60 * 60 * 1000;
        }
    }
    generateSlug(text) {
        const slug = text
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        return slug || `org-${Date.now()}`;
    }
}
exports.AuthService = AuthService;
// Export singleton instance
exports.authService = new AuthService();
