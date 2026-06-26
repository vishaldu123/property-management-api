import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '../shared/core/response';
import { AppException, ValidationException } from '../shared/exceptions';
import { AppError, ValidationError as UtilsValidationError } from '../utils/errors';
import logger from '../utils/logger';

/**
 * Global Error Handler Middleware
 * Consolidates all exception types and ensures standardized error responses
 *
 * Must be placed last in middleware chain
 */
export const globalErrorHandler = (
  err: Error | unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const requestId = res.getHeader('X-Request-ID') as string || 'unknown';

  // Log all errors
  const errorMessage = err instanceof Error ? err.message : String(err);
  const errorStack = err instanceof Error ? err.stack : undefined;
  
  logger.error('Request error', {
    message: errorMessage,
    requestId,
    path: req.path,
    method: req.method,
    ip: req.ip,
    stack: errorStack,
  } as any);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const path = issue.path.join('.');
      if (!errors[path]) {
        errors[path] = [];
      }
      errors[path].push(issue.message);
    }
    ApiResponse.validationError(res, errors, 'Validation failed');
    return;
  }

  // Handle shared ValidationException
  if (err instanceof ValidationException) {
    ApiResponse.validationError(res, err.errors, err.message);
    return;
  }

  // Handle utils ValidationError (legacy)
  if (err instanceof UtilsValidationError) {
    ApiResponse.validationError(res, err.errors, err.message);
    return;
  }

  // Handle shared AppException
  if (err instanceof AppException) {
    let errors: Record<string, any> | undefined;
    if (err.details?.errors) {
      errors = err.details.errors;
    }

    ApiResponse.error(
      res,
      err.message,
      err.statusCode,
      errors
    );
    return;
  }

  // Handle utils AppError (legacy)
  if (err instanceof AppError) {
    ApiResponse.error(res, err.message, err.statusCode);
    return;
  }

  // Handle generic Error objects
  if (err instanceof Error) {
    // Check for common error types
    if (err.name === 'CastError') {
      ApiResponse.error(res, 'Invalid ID format', 400);
      return;
    }

    if (err.message.includes('UNIQUE constraint failed')) {
      ApiResponse.error(res, 'Resource already exists', 409);
      return;
    }

    if (err.message.includes('FOREIGN KEY constraint failed')) {
      ApiResponse.error(res, 'Referenced resource not found', 400);
      return;
    }

    // Generic error - don't expose internal details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    const message = isDevelopment ? err.message : 'An unexpected error occurred';

    ApiResponse.error(res, message, 500);
    return;
  }

  // Fallback for unknown error types
  ApiResponse.error(res, 'An unexpected error occurred', 500);
};
