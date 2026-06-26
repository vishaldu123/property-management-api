/**
 * Error Classes Tests
 */

import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from '../errors';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create error with message and status code', () => {
      const error = new AppError('Test error', 400);

      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.name).toBe('AppError');
    });

    it('should have proper prototype chain', () => {
      const error = new AppError('Test', 400);
      expect(error instanceof Error).toBe(true);
      expect(error instanceof AppError).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with errors object', () => {
      const errorObj = { email: ['Invalid email'], password: ['Too short'] };
      const error = new ValidationError(errorObj);

      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual(errorObj);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error', () => {
      const error = new NotFoundError('User');

      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create unauthorized error with default message', () => {
      const error = new UnauthorizedError();

      expect(error.message).toBe('Unauthorized');
      expect(error.statusCode).toBe(401);
    });

    it('should create unauthorized error with custom message', () => {
      const error = new UnauthorizedError('Invalid credentials');

      expect(error.message).toBe('Invalid credentials');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ForbiddenError', () => {
    it('should create forbidden error with default message', () => {
      const error = new ForbiddenError();

      expect(error.message).toBe('Forbidden');
      expect(error.statusCode).toBe(403);
    });

    it('should create forbidden error with custom message', () => {
      const error = new ForbiddenError('Access denied');

      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error with default message', () => {
      const error = new ConflictError();

      expect(error.message).toBe('Conflict');
      expect(error.statusCode).toBe(409);
    });

    it('should create conflict error with custom message', () => {
      const error = new ConflictError('Resource already exists');

      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
    });
  });
});
