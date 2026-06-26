/**
 * Helmet Security Middleware
 * Provides HTTP headers security across environments
 */

import helmet from 'helmet';
import { config } from '../config/environment';

/**
 * Configure Helmet based on environment
 */
export const createHelmetMiddleware = () => {
  const isDevelopment = config.nodeEnv === 'development';
  const isProduction = config.nodeEnv === 'production';

  return helmet({
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

export default createHelmetMiddleware;
