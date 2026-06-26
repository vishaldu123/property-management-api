/**
 * CORS Middleware
 * Environment-aware CORS policy configuration
 */

import cors from 'cors';
import { config } from '../config/environment';

/**
 * Create CORS middleware with environment-aware configuration
 */
export const createCorsMiddleware = () => {
  const isDevelopment = config.nodeEnv === 'development';
  const isProduction = config.nodeEnv === 'production';

  if (isDevelopment) {
    // Allow all origins in development
    return cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      optionsSuccessStatus: 200,
    });
  }

  if (isProduction) {
    // Strict CORS in production
    const allowedOrigins = config.corsOrigin.split(',').map(origin => origin.trim());

    return cors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
          callback(null, true);
        } else {
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
  return cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  });
};

export default createCorsMiddleware;
