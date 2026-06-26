/**
 * Rate Limiting Middleware
 * Applied to authentication endpoints to prevent abuse
 */

import rateLimit from 'express-rate-limit';
import { config } from '../config/environment';

/**
 * General rate limiter - 15 requests per 15 minutes
 */
export const createGeneralRateLimiter = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    skip: (req) => {
      // Skip rate limiting in development and test
      return config.nodeEnv === 'development' || config.nodeEnv === 'test';
    },
  });
};

/**
 * Authentication rate limiter - 5 requests per 15 minutes
 * Used for login and registration endpoints
 */
export const createAuthRateLimiter = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false, // Count failed and successful attempts
    skip: (req) => {
      // Skip rate limiting in development and test
      return config.nodeEnv === 'development' || config.nodeEnv === 'test';
    },
  });
};

/**
 * Password reset rate limiter - 3 requests per hour
 * Prevents password reset abuse
 */
export const createPasswordResetRateLimiter = () => {
  return rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 requests per hour
    message: 'Too many password reset attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skip: (req) => {
      // Skip rate limiting in development and test
      return config.nodeEnv === 'development' || config.nodeEnv === 'test';
    },
  });
};

export default {
  createGeneralRateLimiter,
  createAuthRateLimiter,
  createPasswordResetRateLimiter,
};
