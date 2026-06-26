"use strict";
/**
 * Rate Limiting Middleware
 * Applied to authentication endpoints to prevent abuse
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPasswordResetRateLimiter = exports.createAuthRateLimiter = exports.createGeneralRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const environment_1 = require("../config/environment");
/**
 * General rate limiter - 15 requests per 15 minutes
 */
const createGeneralRateLimiter = () => {
    return (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
        standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
        legacyHeaders: false, // Disable `X-RateLimit-*` headers
        skip: (req) => {
            // Skip rate limiting in development and test
            return environment_1.config.nodeEnv === 'development' || environment_1.config.nodeEnv === 'test';
        },
    });
};
exports.createGeneralRateLimiter = createGeneralRateLimiter;
/**
 * Authentication rate limiter - 5 requests per 15 minutes
 * Used for login and registration endpoints
 */
const createAuthRateLimiter = () => {
    return (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // Limit each IP to 5 requests per windowMs
        message: 'Too many authentication attempts, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: false, // Count failed and successful attempts
        skip: (req) => {
            // Skip rate limiting in development and test
            return environment_1.config.nodeEnv === 'development' || environment_1.config.nodeEnv === 'test';
        },
    });
};
exports.createAuthRateLimiter = createAuthRateLimiter;
/**
 * Password reset rate limiter - 3 requests per hour
 * Prevents password reset abuse
 */
const createPasswordResetRateLimiter = () => {
    return (0, express_rate_limit_1.default)({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3, // Limit each IP to 3 requests per hour
        message: 'Too many password reset attempts, please try again later.',
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: false,
        skip: (req) => {
            // Skip rate limiting in development and test
            return environment_1.config.nodeEnv === 'development' || environment_1.config.nodeEnv === 'test';
        },
    });
};
exports.createPasswordResetRateLimiter = createPasswordResetRateLimiter;
exports.default = {
    createGeneralRateLimiter: exports.createGeneralRateLimiter,
    createAuthRateLimiter: exports.createAuthRateLimiter,
    createPasswordResetRateLimiter: exports.createPasswordResetRateLimiter,
};
