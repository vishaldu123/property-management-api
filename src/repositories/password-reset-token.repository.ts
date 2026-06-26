/**
 * Password Reset Token Repository
 * Handles all password reset token operations
 */

import prisma from '../config/prisma';
import logger from '../utils/logger';

export interface CreatePasswordResetTokenInput {
  userId: string;
  token: string;
  expiresAt: Date;
}

export class PasswordResetTokenRepository {
  async create(input: CreatePasswordResetTokenInput): Promise<any> {
    try {
      const resetToken = await prisma.passwordResetToken.create({
        data: input,
      });
      logger.debug('Password reset token created', { userId: input.userId });
      return resetToken;
    } catch (error) {
      logger.error('Failed to create password reset token', error as Error);
      throw error;
    }
  }

  async findByToken(token: string): Promise<any> {
    try {
      return await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });
    } catch (error) {
      logger.error('Failed to find password reset token', error as Error);
      throw error;
    }
  }

  async findValidByToken(token: string): Promise<any> {
    try {
      return await prisma.passwordResetToken.findUnique({
        where: { token },
      });
    } catch (error) {
      logger.error('Failed to find valid password reset token', error as Error);
      throw error;
    }
  }

  async markAsUsed(token: string): Promise<any> {
    try {
      const resetToken = await prisma.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      });
      logger.debug('Password reset token marked as used');
      return resetToken;
    } catch (error) {
      logger.error('Failed to mark password reset token as used', error as Error);
      throw error;
    }
  }

  async deleteExpired(): Promise<any> {
    try {
      const result = await prisma.passwordResetToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      logger.info('Expired password reset tokens deleted', { count: result.count });
      return result;
    } catch (error) {
      logger.error('Failed to delete expired password reset tokens', error as Error);
      throw error;
    }
  }
}

export const passwordResetTokenRepository = new PasswordResetTokenRepository();
