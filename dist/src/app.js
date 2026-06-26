"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const organization_routes_1 = __importDefault(require("./routes/organization.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const helmet_middleware_1 = require("./middleware/helmet.middleware");
const cors_middleware_1 = require("./middleware/cors.middleware");
const rate_limit_middleware_1 = require("./middleware/rate-limit.middleware");
const brute_force_middleware_1 = require("./middleware/brute-force.middleware");
const response_1 = require("./shared/core/response");
const environment_1 = require("./config/environment");
const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv_1.default.config({ path: envPath });
const app = (0, express_1.default)();
// Security Middleware (must be before routes)
// 1. Helmet - HTTP headers security
app.use((0, helmet_middleware_1.createHelmetMiddleware)());
// 2. CORS - Environment-aware cross-origin policies
app.use((0, cors_middleware_1.createCorsMiddleware)());
// 3. Body parser
app.use(express_1.default.json());
// 4. General rate limiting (15 requests per 15 minutes)
app.use((0, rate_limit_middleware_1.createGeneralRateLimiter)());
// Request ID middleware for tracing
app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random()}`;
    res.setHeader('X-Request-ID', requestId);
    next();
});
// Health check endpoint
app.get('/', (req, res) => {
    response_1.ApiResponse.success(res, {
        status: 'healthy',
        environment: environment_1.config.nodeEnv,
        version: environment_1.config.appVersion,
    }, 'Property Management API is healthy');
});
// API Routes
// Authentication routes with specific rate limiting and brute-force protection
app.use('/api/auth', brute_force_middleware_1.checkBruteForceLockout, (0, rate_limit_middleware_1.createAuthRateLimiter)(), auth_routes_1.default);
// Organization routes
app.use('/api/organizations', organization_routes_1.default);
// 404 handler
app.use((req, res) => {
    response_1.ApiResponse.error(res, 'Route not found', 404);
});
// Global error handler (must be last)
app.use(errorHandler_1.globalErrorHandler);
exports.default = app;
