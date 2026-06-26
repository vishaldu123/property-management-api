import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.routes';
import organizationRoutes from './routes/organization.routes';
import rbacRoutes from './routes/rbac.routes';
import healthRoutes from './routes/health.routes';
import propertyRoutes from './routes/property.routes';
import unitRoutes from './routes/unit.routes';
import tenantRoutes from './routes/tenant.routes';
import leaseRoutes from './routes/lease.routes';
import paymentRoutes from './routes/payment.routes';
import { globalErrorHandler } from './middleware/errorHandler';
import { createHelmetMiddleware } from './middleware/helmet.middleware';
import { createCorsMiddleware } from './middleware/cors.middleware';
import {
  createGeneralRateLimiter,
  createAuthRateLimiter,
  createPasswordResetRateLimiter,
} from './middleware/rate-limit.middleware';
import { checkBruteForceLockout } from './middleware/brute-force.middleware';
import { ApiResponse } from './shared/core/response';
import { config } from './config/environment';
import openApiSpec from './openapi.spec';

const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: envPath });

const app = express();

// Security Middleware (must be before routes)
// 1. Helmet - HTTP headers security
app.use(createHelmetMiddleware());

// 2. CORS - Environment-aware cross-origin policies
app.use(createCorsMiddleware());

// 3. Body parser
app.use(express.json());

// 4. General rate limiting (15 requests per 15 minutes)
app.use(createGeneralRateLimiter());

// Request ID middleware for tracing
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || `req-${Date.now()}-${Math.random()}`;
  res.setHeader('X-Request-ID', requestId);
  next();
});

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  ApiResponse.success(
    res,
    {
      status: 'healthy',
      environment: config.nodeEnv,
      version: config.appVersion,
    },
    'Property Management API is healthy'
  );
});

// Health check routes (no auth required)
app.use('/health', healthRoutes);

// API Documentation - Swagger UI
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(openApiSpec, { swaggerOptions: { persistAuthorization: true } }));

// OpenAPI specification endpoint
app.get('/openapi.json', (req: Request, res: Response) => {
  res.json(openApiSpec);
});

// API Routes (versioned)
const apiV1Router = express.Router();

// Authentication routes with specific rate limiting and brute-force protection
apiV1Router.use('/auth', checkBruteForceLockout, createAuthRateLimiter(), authRoutes);

// Organization routes with authorization
apiV1Router.use('/organizations', organizationRoutes);

// RBAC routes (Role-Based Access Control)
apiV1Router.use('/rbac', rbacRoutes);

// Property management routes
apiV1Router.use('/properties', propertyRoutes);
apiV1Router.use('/units', unitRoutes);
apiV1Router.use('/tenants', tenantRoutes);
apiV1Router.use('/leases', leaseRoutes);
apiV1Router.use('/payments', paymentRoutes);

// Mount versioned routes
app.use('/api/v1', apiV1Router);

// 404 handler
app.use((req: Request, res: Response) => {
  ApiResponse.error(
    res,
    'Route not found',
    404
  );
});

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
