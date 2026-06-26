/**
 * Custom Exception Classes
 * Standardized error handling across the application
 */

export class AppException extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestException extends AppException {
  constructor(message: string = 'Bad Request', details?: Record<string, any>) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedException extends AppException {
  constructor(message: string = 'Unauthorized', details?: Record<string, any>) {
    super(message, 401, 'UNAUTHORIZED', details);
  }
}

export class ForbiddenException extends AppException {
  constructor(message: string = 'Forbidden', details?: Record<string, any>) {
    super(message, 403, 'FORBIDDEN', details);
  }
}

export class NotFoundException extends AppException {
  constructor(
    resource: string = 'Resource',
    details?: Record<string, any>
  ) {
    super(`${resource} not found`, 404, 'NOT_FOUND', details);
  }
}

export class ConflictException extends AppException {
  constructor(message: string = 'Resource already exists', details?: Record<string, any>) {
    super(message, 409, 'CONFLICT', details);
  }
}

export class UnprocessableEntityException extends AppException {
  constructor(message: string = 'Unprocessable Entity', details?: Record<string, any>) {
    super(message, 422, 'UNPROCESSABLE_ENTITY', details);
  }
}

export class InternalServerErrorException extends AppException {
  constructor(message: string = 'Internal Server Error', details?: Record<string, any>) {
    super(message, 500, 'INTERNAL_ERROR', details);
  }
}

export class ServiceUnavailableException extends AppException {
  constructor(message: string = 'Service Unavailable', details?: Record<string, any>) {
    super(message, 503, 'SERVICE_UNAVAILABLE', details);
  }
}

export class ValidationException extends BadRequestException {
  constructor(
    public errors: Record<string, string[]>,
    message: string = 'Validation failed'
  ) {
    super(message, { errors });
  }
}
