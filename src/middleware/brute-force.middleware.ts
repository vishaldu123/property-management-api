/**
 * Brute Force Protection Middleware
 * Prevents brute-force attacks on authentication endpoints
 */

import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';
import logger from '../utils/logger';

interface LoginAttempt {
  count: number;
  firstAttemptTime: number;
  lastAttemptTime: number;
}

/**
 * In-memory store for login attempts per IP/email combination
 * In production, this should be replaced with Redis
 */
class BruteForceProtection {
  private attempts: Map<string, LoginAttempt> = new Map();
  private readonly maxAttempts = 5;
  private readonly lockoutDurationMs = 30 * 60 * 1000; // 30 minutes
  private readonly attemptWindowMs = 15 * 60 * 1000; // 15 minutes

  /**
   * Get the cache key for an IP and email combination
   */
  private getCacheKey(ip: string, email: string): string {
    return `${ip}:${email}`;
  }

  /**
   * Record a failed login attempt
   */
  recordFailedAttempt(ip: string, email: string): { isLocked: boolean; remainingTime: number } {
    const key = this.getCacheKey(ip, email);
    const now = Date.now();

    let attempt = this.attempts.get(key);

    if (!attempt) {
      // First attempt
      this.attempts.set(key, {
        count: 1,
        firstAttemptTime: now,
        lastAttemptTime: now,
      });
      return { isLocked: false, remainingTime: 0 };
    }

    // Check if attempt window has expired
    if (now - attempt.firstAttemptTime > this.attemptWindowMs) {
      // Reset the attempt counter
      this.attempts.set(key, {
        count: 1,
        firstAttemptTime: now,
        lastAttemptTime: now,
      });
      return { isLocked: false, remainingTime: 0 };
    }

    // Increment attempt count
    attempt.count++;
    attempt.lastAttemptTime = now;

    logger.warn(`Brute force attempt detected: IP=${ip}, Email=${email}, Attempts=${attempt.count}`);

    if (attempt.count >= this.maxAttempts) {
      return {
        isLocked: true,
        remainingTime: this.lockoutDurationMs - (now - attempt.firstAttemptTime),
      };
    }

    return { isLocked: false, remainingTime: 0 };
  }

  /**
   * Record a successful login
   */
  recordSuccessfulLogin(ip: string, email: string): void {
    const key = this.getCacheKey(ip, email);
    this.attempts.delete(key);
  }

  /**
   * Check if an IP/email is locked out
   */
  isLockedOut(ip: string, email: string): { locked: boolean; remainingTime: number } {
    const key = this.getCacheKey(ip, email);
    const attempt = this.attempts.get(key);

    if (!attempt) {
      return { locked: false, remainingTime: 0 };
    }

    const now = Date.now();
    const timeSinceFirstAttempt = now - attempt.firstAttemptTime;

    // Check if still within lockout window
    if (attempt.count >= this.maxAttempts && timeSinceFirstAttempt < this.lockoutDurationMs) {
      return {
        locked: true,
        remainingTime: this.lockoutDurationMs - timeSinceFirstAttempt,
      };
    }

    // Lockout period expired
    if (timeSinceFirstAttempt > this.lockoutDurationMs) {
      this.attempts.delete(key);
      return { locked: false, remainingTime: 0 };
    }

    return { locked: false, remainingTime: 0 };
  }
}

export const bruteForceProtection = new BruteForceProtection();

/**
 * Middleware to check for brute force lockout
 * Must be applied before password reset or login endpoints
 *
 * Usage:
 *   router.post('/login', checkBruteForce, loginController);
 *   router.post('/password-reset', checkBruteForce, resetController);
 */
export const checkBruteForceLockout = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip rate limiting in development and test environments
  if (config.nodeEnv === 'development' || config.nodeEnv === 'test') {
    return next();
  }

  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const email = req.body?.email;

  if (!email) {
    return next();
  }

  const { locked, remainingTime } = bruteForceProtection.isLockedOut(clientIp, email);

  if (locked) {
    const remainingMinutes = Math.ceil(remainingTime / 60000);
    logger.warn(`Brute force lockout: IP=${clientIp}, Email=${email}, RemainingTime=${remainingMinutes}m`);

    res.status(429).json({
      success: false,
      message: `Too many failed attempts. Please try again in ${remainingMinutes} minutes.`,
      retryAfter: Math.ceil(remainingTime / 1000),
    });
    return;
  }

  next();
};

export default bruteForceProtection;
