/**
 * Authentication Middleware
 * JWT validation and user context injection
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { UnauthorizedError } from '../utils/errors';
import logger from '../utils/logger';

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'STAFF' | 'ACCOUNTANT' | 'MEMBER';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
  };
}

interface TokenPayload {
  userId: string;
  organizationId: string;
  iat?: number;
  exp?: number;
}

/**
 * Middleware to validate JWT and inject user context
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid authorization header');
      throw new UnauthorizedError('Authorization header missing or invalid');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;

    if (!payload.userId || !payload.organizationId) {
      logger.warn('Invalid token payload');
      throw new UnauthorizedError('Invalid token payload');
    }

    req.user = {
      userId: payload.userId,
      organizationId: payload.organizationId,
    };

    next();
  } catch (error) {
    logger.warn('Authentication failed', error as Error);

    if (error instanceof UnauthorizedError) {
      res.status(401).json({ message: error.message });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid token' });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Token expired' });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
    }
  }
};
