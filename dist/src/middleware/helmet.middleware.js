"use strict";
/**
 * Helmet Security Middleware
 * Provides HTTP headers security across environments
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHelmetMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
const environment_1 = require("../config/environment");
/**
 * Configure Helmet based on environment
 */
const createHelmetMiddleware = () => {
    const isDevelopment = environment_1.config.nodeEnv === 'development';
    const isProduction = environment_1.config.nodeEnv === 'production';
    return (0, helmet_1.default)({
        // Content Security Policy
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                connectSrc: ["'self'"],
                fontSrc: ["'self'"],
                objectSrc: ["'none'"],
                mediaSrc: ["'self'"],
                frameSrc: ["'none'"],
            },
            reportOnly: isDevelopment,
        },
        // X-Content-Type-Options header
        noSniff: true,
        // X-Frame-Options header
        frameguard: {
            action: 'deny',
        },
        // X-XSS-Protection header
        xssFilter: true,
        // Referrer-Policy header
        referrerPolicy: {
            policy: 'strict-origin-when-cross-origin',
        },
        // Strict-Transport-Security for HTTPS
        hsts: isProduction ? {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true,
        } : {
            maxAge: 0,
            includeSubDomains: false,
            preload: false,
        },
    });
};
exports.createHelmetMiddleware = createHelmetMiddleware;
exports.default = exports.createHelmetMiddleware;
