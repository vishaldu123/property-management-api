"use strict";
/**
 * CORS Middleware
 * Environment-aware CORS policy configuration
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCorsMiddleware = void 0;
const cors_1 = __importDefault(require("cors"));
const environment_1 = require("../config/environment");
/**
 * Create CORS middleware with environment-aware configuration
 */
const createCorsMiddleware = () => {
    const isDevelopment = environment_1.config.nodeEnv === 'development';
    const isProduction = environment_1.config.nodeEnv === 'production';
    if (isDevelopment) {
        // Allow all origins in development
        return (0, cors_1.default)({
            origin: true,
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            optionsSuccessStatus: 200,
        });
    }
    if (isProduction) {
        // Strict CORS in production
        const allowedOrigins = environment_1.config.corsOrigin.split(',').map(origin => origin.trim());
        return (0, cors_1.default)({
            origin: (origin, callback) => {
                // Allow requests with no origin (like mobile apps or curl)
                if (!origin) {
                    return callback(null, true);
                }
                if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                    callback(null, true);
                }
                else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
            optionsSuccessStatus: 200,
            maxAge: 86400, // 24 hours
        });
    }
    // Test environment - allow all
    return (0, cors_1.default)({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        optionsSuccessStatus: 200,
    });
};
exports.createCorsMiddleware = createCorsMiddleware;
exports.default = exports.createCorsMiddleware;
