"use strict";
/**
 * Environment Configuration
 * Typed environment variables with validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfig = exports.config = void 0;
const getEnv = (key, defaultValue) => {
    const value = process.env[key];
    if (!value && !defaultValue) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value || defaultValue || '';
};
exports.config = {
    // Application
    nodeEnv: getEnv('NODE_ENV', 'development'),
    port: parseInt(getEnv('PORT', '5000'), 10),
    logLevel: getEnv('LOG_LEVEL', 'INFO'),
    // Database
    databaseUrl: getEnv('DATABASE_URL'),
    // JWT
    jwtSecret: getEnv('JWT_SECRET'),
    jwtExpiresIn: getEnv('JWT_EXPIRES_IN', '8h'),
    jwtRefreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
    // CORS - Comma-separated list of allowed origins
    corsOrigin: getEnv('CORS_ORIGIN', '*'),
    corsCredentials: getEnv('CORS_CREDENTIALS', 'true').toLowerCase() === 'true',
    // Frontend
    frontendUrl: getEnv('FRONTEND_URL', 'http://localhost:3000'),
    // App Info
    appName: getEnv('APP_NAME', 'Property Management API'),
    appVersion: getEnv('APP_VERSION', '1.0.0'),
    // Rate Limiting
    rateLimitWindowMs: parseInt(getEnv('RATE_LIMIT_WINDOW_MS', '900000'), 10), // 15 minutes
    rateLimitMaxRequests: parseInt(getEnv('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
    // Authentication Rate Limiting
    authRateLimitWindowMs: parseInt(getEnv('AUTH_RATE_LIMIT_WINDOW_MS', '900000'), 10), // 15 minutes
    authRateLimitMaxRequests: parseInt(getEnv('AUTH_RATE_LIMIT_MAX_REQUESTS', '5'), 10),
    // Password Reset Rate Limiting
    passwordResetRateLimitWindowMs: parseInt(getEnv('PASSWORD_RESET_RATE_LIMIT_WINDOW_MS', '3600000'), 10), // 1 hour
    passwordResetRateLimitMaxRequests: parseInt(getEnv('PASSWORD_RESET_RATE_LIMIT_MAX_REQUESTS', '3'), 10),
    // Brute Force Protection
    bruteForceMaxAttempts: parseInt(getEnv('BRUTE_FORCE_MAX_ATTEMPTS', '5'), 10),
    bruteForceLockoutDurationMs: parseInt(getEnv('BRUTE_FORCE_LOCKOUT_DURATION_MS', '1800000'), 10), // 30 minutes
    bruteForceAttemptWindowMs: parseInt(getEnv('BRUTE_FORCE_ATTEMPT_WINDOW_MS', '900000'), 10), // 15 minutes
    // Security
    bcryptRounds: parseInt(getEnv('BCRYPT_ROUNDS', '12'), 10),
    secureCookies: getEnv('SECURE_COOKIES', 'true').toLowerCase() === 'true',
    trustProxy: getEnv('TRUST_PROXY', 'true').toLowerCase() === 'true',
    // Email Configuration
    emailProvider: getEnv('EMAIL_PROVIDER', 'sendgrid'),
    emailFromAddress: getEnv('EMAIL_FROM_ADDRESS', 'noreply@propertymanagement.com'),
    // Payment Configuration
    paymentProvider: getEnv('PAYMENT_PROVIDER', 'razorpay'),
    razorpayKeyId: getEnv('RAZORPAY_KEY_ID', 'test_key_id'),
    razorpayKeySecret: getEnv('RAZORPAY_KEY_SECRET', 'test_key_secret'),
};
// Validate critical configuration on startup
const validateConfig = () => {
    const required = ['databaseUrl', 'jwtSecret'];
    const missing = required.filter((key) => !exports.config[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.map((k) => `[${k}]`).join(', ')}`);
    }
    // Warn if production config is incomplete
    if (exports.config.nodeEnv === 'production') {
        if (exports.config.corsOrigin === '*') {
            console.warn('WARNING: CORS_ORIGIN should not be "*" in production');
        }
        if (exports.config.razorpayKeyId === 'test_key_id' || exports.config.razorpayKeySecret === 'test_key_secret') {
            console.warn('WARNING: Razorpay credentials should be configured in production');
        }
    }
};
exports.validateConfig = validateConfig;
