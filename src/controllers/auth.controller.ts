/**
 * Authentication Controller
 * Handles user registration and login endpoints
 */

import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';

/**
 * Register a new user and organization
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, organizationName } = req.body;

    // Validate required fields
    if (!name || !email || !password || !organizationName) {
      res.status(400).json({
        message: 'Validation failed',
        errors: {
          name: !name ? ['Name is required'] : [],
          email: !email ? ['Email is required'] : [],
          password: !password ? ['Password is required'] : [],
          organizationName: !organizationName ? ['Organization name is required'] : [],
        },
      });
      return;
    }

    const result = await authService.register({
      name,
      email,
      password,
      organizationName,
    });

    res.status(201).json(result);
  } catch (error) {
    logger.error('Register endpoint error', error as Error);

    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

/**
 * Login a user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        message: 'Validation failed',
        errors: {
          email: !email ? ['Email is required'] : [],
          password: !password ? ['Password is required'] : [],
        },
      });
      return;
    }

    const result = await authService.login({
      email,
      password,
    });

    res.status(200).json(result);
  } catch (error) {
    logger.error('Login endpoint error', error as Error);

    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
