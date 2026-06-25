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
const organization_repository_1 = require("../repositories/organization.repository");
const refresh_token_repository_1 = require("../repositories/refresh-token.repository");
const password_reset_token_repository_1 = require("../repositories/password-reset-token.repository");
const email_service_1 = require("./email.service");
const prisma_1 = __importDefault(require("../config/prisma"));
const environment_1 = require("../config/environment");
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
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
            return {
                token: accessToken,
                refreshToken,
                user: {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                },
                organization: {
                    id: result.organization.id,
                    name: result.organization.name,
                    slug: result.organization.slug,
                },
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
        const user = await user_repository_1.userRepository.findWithMemberships((await user_repository_1.userRepository.findByEmail(email))?.id || '');
        if (!user || user.memberships.length === 0) {
            logger_1.default.warn('Login failed - user not found or no memberships', { email });
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        // Verify password
        const passwordMatches = await bcrypt_1.default.compare(password, user.password);
        if (!passwordMatches) {
            logger_1.default.warn('Login failed - invalid password', { email });
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        // Get first organization membership
        const membership = user.memberships[0];
        const accessToken = this.generateAccessToken({
            userId: user.id,
            organizationId: membership.organizationId,
        });
        const refreshToken = await this.generateAndStoreRefreshToken(user.id);
        logger_1.default.info('User logged in successfully', { userId: user.id });
        return {
            token: accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            organization: {
                id: membership.organization.id,
                name: membership.organization.name,
                slug: membership.organization.slug,
            },
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
            token: newAccessToken,
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
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            logger_1.default.warn('User not found', { userId });
            throw new errors_1.NotFoundError('User not found');
        }
        const organization = await organization_repository_1.organizationRepository.findById(organizationId);
        if (!organization) {
            logger_1.default.warn('Organization not found', { organizationId });
            throw new errors_1.NotFoundError('Organization not found');
        }
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            organization: {
                id: organization.id,
                name: organization.name,
                slug: organization.slug,
            },
        };
    }
    generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, environment_1.config.jwtSecret, {
            expiresIn: this.jwtExpiry,
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
