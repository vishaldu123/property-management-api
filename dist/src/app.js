"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const organization_routes_1 = __importDefault(require("./routes/organization.routes"));
const rbac_routes_1 = __importDefault(require("./routes/rbac.routes"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const property_routes_1 = __importDefault(require("./routes/property.routes"));
const unit_routes_1 = __importDefault(require("./routes/unit.routes"));
const tenant_routes_1 = __importDefault(require("./routes/tenant.routes"));
const lease_routes_1 = __importDefault(require("./routes/lease.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const maintenance_routes_1 = __importDefault(require("./routes/maintenance.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const helmet_middleware_1 = require("./middleware/helmet.middleware");
const cors_middleware_1 = require("./middleware/cors.middleware");
const rate_limit_middleware_1 = require("./middleware/rate-limit.middleware");
const brute_force_middleware_1 = require("./middleware/brute-force.middleware");
const response_1 = require("./shared/core/response");
const environment_1 = require("./config/environment");
const openapi_spec_1 = __importDefault(require("./openapi.spec"));
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
// Health check routes (no auth required)
app.use('/health', health_routes_1.default);
// API Documentation - Swagger UI
app.use('/api-docs', swagger_ui_express_1.default.serve);
app.get('/api-docs', swagger_ui_express_1.default.setup(openapi_spec_1.default, { swaggerOptions: { persistAuthorization: true } }));
// OpenAPI specification endpoint
app.get('/openapi.json', (req, res) => {
    res.json(openapi_spec_1.default);
});
// API Routes (versioned)
const apiV1Router = express_1.default.Router();
// Authentication routes with specific rate limiting and brute-force protection
apiV1Router.use('/auth', brute_force_middleware_1.checkBruteForceLockout, (0, rate_limit_middleware_1.createAuthRateLimiter)(), auth_routes_1.default);
// Organization routes with authorization
apiV1Router.use('/organizations', organization_routes_1.default);
// RBAC routes (Role-Based Access Control)
apiV1Router.use('/rbac', rbac_routes_1.default);
// Property management routes
apiV1Router.use('/properties', property_routes_1.default);
apiV1Router.use('/units', unit_routes_1.default);
apiV1Router.use('/tenants', tenant_routes_1.default);
apiV1Router.use('/leases', lease_routes_1.default);
apiV1Router.use('/payments', payment_routes_1.default);
apiV1Router.use('/maintenance', maintenance_routes_1.default);
// Mount versioned routes
app.use('/api/v1', apiV1Router);
// 404 handler
app.use((req, res) => {
    response_1.ApiResponse.error(res, 'Route not found', 404);
});
// Global error handler (must be last)
app.use(errorHandler_1.globalErrorHandler);
exports.default = app;
