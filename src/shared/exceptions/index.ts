export * from './app.exception';

import { AppException } from './app.exception';

export class ValidationError extends AppException {
  constructor(message: string = 'Validation failed', details?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppException {
  constructor(message: string = 'Resource not found', details?: Record<string, any>) {
    super(message, 404, 'NOT_FOUND', details);
  }
}

export class ConflictError extends AppException {
  constructor(message: string = 'Conflict', details?: Record<string, any>) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class ForbiddenError extends AppException {
  constructor(message: string = 'Forbidden', details?: Record<string, any>) {
    super(message, 403, 'FORBIDDEN', details);
  }
}
