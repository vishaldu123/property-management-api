/**
 * Refresh Token Repository
 * Handles all refresh token operations
 */

import prisma from '../config/prisma';
import logger from '../utils/logger';

export interface CreateRefreshTokenInput {
  userId: string;
  token: string;
  expiresAt: Date;
}

export class RefreshTokenRepository {
  async create(input: CreateRefreshTokenInput): Promise<any> {
    try {
      const refreshToken = await prisma.refreshToken.create({
        data: input,
      });
      logger.debug('Refresh token created', { userId: input.userId });
      return refreshToken;
    } catch (error) {
      logger.error('Failed to create refresh token', error as Error);
      throw error;
    }
  }

  async findByToken(token: string): Promise<any> {
    try {
      return await prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
      });
    } catch (error) {
      logger.error('Failed to find refresh token', error as Error);
      throw error;
    }
  }

  async findValidByToken(token: string): Promise<any> {
    try {
      return await prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
      });
    } catch (error) {
      logger.error('Failed to find valid refresh token', error as Error);
      throw error;
    }
  }

  async revoke(token: string): Promise<any> {
    try {
      const refreshToken = await prisma.refreshToken.update({
        where: { token },
        data: { isRevoked: true },
      });
      logger.debug('Refresh token revoked');
      return refreshToken;
    } catch (error) {
      logger.error('Failed to revoke refresh token', error as Error);
      throw error;
    }
  }

  async revokeByUserId(userId: string): Promise<any> {
    try {
      const result = await prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
      logger.debug('Refresh tokens revoked for user', { userId });
      return result;
    } catch (error) {
      logger.error('Failed to revoke refresh tokens', error as Error);
      throw error;
    }
  }

  async deleteExpired(): Promise<any> {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
      logger.info('Expired refresh tokens deleted', { count: result.count });
      return result;
    } catch (error) {
      logger.error('Failed to delete expired refresh tokens', error as Error);
      throw error;
    }
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
