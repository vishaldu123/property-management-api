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
    // CORS
    corsOrigin: getEnv('CORS_ORIGIN', '*'),
    // Frontend
    frontendUrl: getEnv('FRONTEND_URL', 'http://localhost:3000'),
    // App Info
    appName: getEnv('APP_NAME', 'Property Management API'),
    appVersion: getEnv('APP_VERSION', '1.0.0'),
};
// Validate critical configuration on startup
const validateConfig = () => {
    const required = ['databaseUrl', 'jwtSecret'];
    const missing = required.filter((key) => !exports.config[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.map((k) => `[${k}]`).join(', ')}`);
    }
};
exports.validateConfig = validateConfig;
