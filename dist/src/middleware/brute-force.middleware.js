"use strict";
/**
 * Brute Force Protection Middleware
 * Prevents brute-force attacks on authentication endpoints
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBruteForceLockout = exports.bruteForceProtection = void 0;
const environment_1 = require("../config/environment");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * In-memory store for login attempts per IP/email combination
 * In production, this should be replaced with Redis
 */
class BruteForceProtection {
    attempts = new Map();
    maxAttempts = 5;
    lockoutDurationMs = 30 * 60 * 1000; // 30 minutes
    attemptWindowMs = 15 * 60 * 1000; // 15 minutes
    /**
     * Get the cache key for an IP and email combination
     */
    getCacheKey(ip, email) {
        return `${ip}:${email}`;
    }
    /**
     * Record a failed login attempt
     */
    recordFailedAttempt(ip, email) {
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
        logger_1.default.warn(`Brute force attempt detected: IP=${ip}, Email=${email}, Attempts=${attempt.count}`);
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
    recordSuccessfulLogin(ip, email) {
        const key = this.getCacheKey(ip, email);
        this.attempts.delete(key);
    }
    /**
     * Check if an IP/email is locked out
     */
    isLockedOut(ip, email) {
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
exports.bruteForceProtection = new BruteForceProtection();
/**
 * Middleware to check for brute force lockout
 * Must be applied before password reset or login endpoints
 *
 * Usage:
 *   router.post('/login', checkBruteForce, loginController);
 *   router.post('/password-reset', checkBruteForce, resetController);
 */
const checkBruteForceLockout = (req, res, next) => {
    // Skip rate limiting in development and test environments
    if (environment_1.config.nodeEnv === 'development' || environment_1.config.nodeEnv === 'test') {
        return next();
    }
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    const email = req.body?.email;
    if (!email) {
        return next();
    }
    const { locked, remainingTime } = exports.bruteForceProtection.isLockedOut(clientIp, email);
    if (locked) {
        const remainingMinutes = Math.ceil(remainingTime / 60000);
        logger_1.default.warn(`Brute force lockout: IP=${clientIp}, Email=${email}, RemainingTime=${remainingMinutes}m`);
        res.status(429).json({
            success: false,
            message: `Too many failed attempts. Please try again in ${remainingMinutes} minutes.`,
            retryAfter: Math.ceil(remainingTime / 1000),
        });
        return;
    }
    next();
};
exports.checkBruteForceLockout = checkBruteForceLockout;
exports.default = exports.bruteForceProtection;
