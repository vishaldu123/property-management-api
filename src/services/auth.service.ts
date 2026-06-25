/**
 * Authentication Service
 * Business logic for registration, login, token management, and password reset
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { organizationRepository } from '../repositories/organization.repository';
import { refreshTokenRepository } from '../repositories/refresh-token.repository';
import { passwordResetTokenRepository } from '../repositories/password-reset-token.repository';
import { emailService } from './email.service';
import prisma from '../config/prisma';
import { config } from '../config/environment';
import logger from '../utils/logger';
import { ValidationError, UnauthorizedError, NotFoundError } from '../utils/errors';

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthToken {
  token: string;
  expiresIn: string;
}

interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

interface CurrentUserResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
}

export class AuthService {
  private bcryptRounds = 10;
  private jwtExpiry = '15m'; // Access token expiry
  private refreshTokenExpiry = '7d'; // Refresh token expiry
  private passwordResetTokenExpiry = 15 * 60 * 1000; // 15 minutes

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { name, email, password, organizationName } = payload;

    // Validate email is unique
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      logger.warn('Registration attempted with existing email', { email });
      throw new ValidationError({ email: ['Email already exists'] });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, this.bcryptRounds);

    // Generate organization slug
    const organizationSlug = this.generateSlug(organizationName);

    logger.info('Creating new user and organization', { email, organizationName });

    try {
      // Use transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx: any) => {
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

      logger.info('User registered successfully', { userId: result.user.id, organizationId: result.organization.id });

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
    } catch (error) {
      logger.error('Registration failed', error as Error, { email });
      throw error;
    }
  }

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { email, password } = payload;

    logger.debug('Login attempt', { email });

    // Find user with memberships
    const user = await userRepository.findWithMemberships(
      (await userRepository.findByEmail(email))?.id || ''
    );

    if (!user || user.memberships.length === 0) {
      logger.warn('Login failed - user not found or no memberships', { email });
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      logger.warn('Login failed - invalid password', { email });
      throw new UnauthorizedError('Invalid credentials');
    }

    // Get first organization membership
    const membership = user.memberships[0];

    const accessToken = this.generateAccessToken({
      userId: user.id,
      organizationId: membership.organizationId,
    });

    const refreshToken = await this.generateAndStoreRefreshToken(user.id);

    logger.info('User logged in successfully', { userId: user.id });

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

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    logger.debug('Refreshing token');

    // Verify refresh token exists and is valid
    const tokenRecord = await refreshTokenRepository.findByToken(refreshToken);

    if (!tokenRecord || tokenRecord.isRevoked || tokenRecord.expiresAt < new Date()) {
      logger.warn('Invalid or expired refresh token');
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    // Get user with memberships
    const user = await userRepository.findWithMemberships(tokenRecord.userId);

    if (!user || user.memberships.length === 0) {
      logger.warn('User not found or has no memberships');
      throw new UnauthorizedError('Invalid token');
    }

    const membership = user.memberships[0];

    // Generate new access token
    const newAccessToken = this.generateAccessToken({
      userId: user.id,
      organizationId: membership.organizationId,
    });

    // Revoke old refresh token and generate new one (token rotation)
    await refreshTokenRepository.revoke(refreshToken);
    const newRefreshToken = await this.generateAndStoreRefreshToken(user.id);

    logger.info('Token refreshed successfully', { userId: user.id });

    return {
      token: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    try {
      await refreshTokenRepository.revoke(refreshToken);
      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout failed', error as Error);
      throw error;
    }
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    logger.debug('Forgot password request', { email });

    const user = await userRepository.findByEmail(email);

    // Don't reveal if email exists or not (security best practice)
    if (!user) {
      logger.warn('Forgot password for non-existent email', { email });
      return { message: 'If an account exists, a password reset email has been sent' };
    }

    // Generate reset token
    const resetToken = this.generateRandomToken();
    const expiresAt = new Date(Date.now() + this.passwordResetTokenExpiry);

    await passwordResetTokenRepository.create({
      userId: user.id,
      token: resetToken,
      expiresAt,
    });

    // Send reset email
    const resetLink = `${config.frontendUrl || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    await emailService.sendPasswordResetEmail(user.email, resetLink, user.name);

    logger.info('Password reset email sent', { userId: user.id });

    return { message: 'If an account exists, a password reset email has been sent' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    logger.debug('Reset password request');

    // Find valid reset token
    const resetToken = await passwordResetTokenRepository.findByToken(token);

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      logger.warn('Invalid or expired password reset token');
      throw new UnauthorizedError('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.bcryptRounds);

    try {
      // Update user password and mark token as used
      await prisma.$transaction(async (tx: any) => {
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

      logger.info('Password reset successfully', { userId: resetToken.userId });

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      logger.error('Password reset failed', error as Error);
      throw error;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> {
    logger.debug('Change password request', { userId });

    const user = await userRepository.findById(userId);

    if (!user) {
      logger.warn('User not found', { userId });
      throw new NotFoundError('User not found');
    }

    // Verify current password
    const passwordMatches = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatches) {
      logger.warn('Change password failed - invalid current password', { userId });
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, this.bcryptRounds);

    try {
      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      // Send confirmation email
      await emailService.sendPasswordChangedEmail(user.email, user.name);

      logger.info('Password changed successfully', { userId });

      return { message: 'Password has been changed successfully' };
    } catch (error) {
      logger.error('Change password failed', error as Error);
      throw error;
    }
  }

  async getCurrentUser(userId: string, organizationId: string): Promise<CurrentUserResponse> {
    logger.debug('Get current user', { userId });

    const user = await userRepository.findById(userId);

    if (!user) {
      logger.warn('User not found', { userId });
      throw new NotFoundError('User not found');
    }

    const organization = await organizationRepository.findById(organizationId);

    if (!organization) {
      logger.warn('Organization not found', { organizationId });
      throw new NotFoundError('Organization not found');
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

  private generateAccessToken(payload: { userId: string; organizationId: string }): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: this.jwtExpiry,
    } as any);
  }

  private async generateAndStoreRefreshToken(userId: string): Promise<string> {
    const token = this.generateRandomToken();
    const expiresAt = new Date(Date.now() + this.parseExpiry(this.refreshTokenExpiry));

    await refreshTokenRepository.create({
      userId,
      token,
      expiresAt,
    });

    return token;
  }

  private generateRandomToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

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

  private generateSlug(text: string): string {
    const slug = text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug || `org-${Date.now()}`;
  }
}

// Export singleton instance
export const authService = new AuthService();

