import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';

export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
    });
    return;
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
  });
};