import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import authRoutes from './routes/auth.routes';
import organizationRoutes from './routes/organization.routes';
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

// API Routes
// Authentication routes with specific rate limiting and brute-force protection
app.use('/api/auth', checkBruteForceLockout, createAuthRateLimiter(), authRoutes);

// Organization routes
app.use('/api/organizations', organizationRoutes);

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
