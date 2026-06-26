/**
 * Authentication Controller
 * Handles user registration, login, logout, password reset, and token refresh
 */

import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { authService } from '../services/auth.service';
import logger from '../utils/logger';
import { ApiResponse } from '../shared/core/response';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '../validators/auth.validators';
import { bruteForceProtection } from '../middleware/brute-force.middleware';

/**
 * Register a new user and organization
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const result = await authService.register(validation.data);
    ApiResponse.created(res, result, 'User and organization registered successfully');
  } catch (error) {
    logger.error('Register endpoint error', error as Error);
    next(error);
  }
};

/**
 * Login a user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors, 'Validation failed');
      return;
    }

    const result = await authService.login(validation.data);

    // Record successful login to clear brute-force attempts
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    bruteForceProtection.recordSuccessfulLogin(clientIp, validation.data.email);

    ApiResponse.success(res, result, 'Login successful');
  } catch (error) {
    logger.error('Login endpoint error', error as Error);

    // Record failed login attempt for brute-force protection
    if (req.body?.email) {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const { isLocked } = bruteForceProtection.recordFailedAttempt(clientIp, req.body.email);
      if (isLocked) {
        res.status(429).json({
          success: false,
          message: 'Too many failed login attempts. Please try again later.',
        });
        return;
      }
    }

    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validation = refreshTokenSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors);
      return;
    }

    const result = await authService.refreshToken(validation.data.refreshToken);
    ApiResponse.success(res, result, 'Token refreshed successfully');
  } catch (error) {
    logger.error('Refresh token endpoint error', error as Error);
    next(error);
  }
};

/**
 * Logout a user
 * POST /api/auth/logout
 */
export const logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validation = refreshTokenSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors);
      return;
    }

    await authService.logout(validation.data.refreshToken);
    ApiResponse.success(res, null, 'Logged out successfully');
  } catch (error) {
    logger.error('Logout endpoint error', error as Error);
    next(error);
  }
};

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validation = forgotPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors);
      return;
    }

    const result = await authService.forgotPassword(validation.data.email);
    ApiResponse.success(res, result, 'Password reset email sent');
  } catch (error) {
    logger.error('Forgot password endpoint error', error as Error);
    next(error);
  }
};

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validation = resetPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors);
      return;
    }

    const result = await authService.resetPassword(validation.data.token, validation.data.password);
    ApiResponse.success(res, result, 'Password reset successfully');
  } catch (error) {
    logger.error('Reset password endpoint error', error as Error);
    next(error);
  }
};

/**
 * Change password (authenticated user)
 * POST /api/auth/change-password
 */
export const changePassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Unauthorized', 401);
      return;
    }

    const validation = changePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors as Record<string, string[]>;
      ApiResponse.validationError(res, errors);
      return;
    }

    const result = await authService.changePassword(
      req.user.userId,
      validation.data.currentPassword,
      validation.data.newPassword
    );
    ApiResponse.success(res, result, 'Password changed successfully');
  } catch (error) {
    logger.error('Change password endpoint error', error as Error);
    next(error);
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      ApiResponse.error(res, 'Unauthorized', 401);
      return;
    }

    const result = await authService.getCurrentUser(req.user.userId, req.user.organizationId);
    ApiResponse.success(res, result, 'User retrieved successfully');
  } catch (error) {
    logger.error('Get current user endpoint error', error as Error);
    next(error);
  }
};
