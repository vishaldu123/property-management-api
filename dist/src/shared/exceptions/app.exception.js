"use strict";
/**
 * Custom Exception Classes
 * Standardized error handling across the application
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationException = exports.ServiceUnavailableException = exports.InternalServerErrorException = exports.UnprocessableEntityException = exports.ConflictException = exports.NotFoundException = exports.ForbiddenException = exports.UnauthorizedException = exports.BadRequestException = exports.AppException = void 0;
class AppException extends Error {
    message;
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppException = AppException;
class BadRequestException extends AppException {
    constructor(message = 'Bad Request', details) {
        super(message, 400, 'BAD_REQUEST', details);
    }
}
exports.BadRequestException = BadRequestException;
class UnauthorizedException extends AppException {
    constructor(message = 'Unauthorized', details) {
        super(message, 401, 'UNAUTHORIZED', details);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends AppException {
    constructor(message = 'Forbidden', details) {
        super(message, 403, 'FORBIDDEN', details);
    }
}
exports.ForbiddenException = ForbiddenException;
class NotFoundException extends AppException {
    constructor(resource = 'Resource', details) {
        super(`${resource} not found`, 404, 'NOT_FOUND', details);
    }
}
exports.NotFoundException = NotFoundException;
class ConflictException extends AppException {
    constructor(message = 'Resource already exists', details) {
        super(message, 409, 'CONFLICT', details);
    }
}
exports.ConflictException = ConflictException;
class UnprocessableEntityException extends AppException {
    constructor(message = 'Unprocessable Entity', details) {
        super(message, 422, 'UNPROCESSABLE_ENTITY', details);
    }
}
exports.UnprocessableEntityException = UnprocessableEntityException;
class InternalServerErrorException extends AppException {
    constructor(message = 'Internal Server Error', details) {
        super(message, 500, 'INTERNAL_ERROR', details);
    }
}
exports.InternalServerErrorException = InternalServerErrorException;
class ServiceUnavailableException extends AppException {
    constructor(message = 'Service Unavailable', details) {
        super(message, 503, 'SERVICE_UNAVAILABLE', details);
    }
}
exports.ServiceUnavailableException = ServiceUnavailableException;
class ValidationException extends BadRequestException {
    errors;
    constructor(errors, message = 'Validation failed') {
        super(message, { errors });
        this.errors = errors;
    }
}
exports.ValidationException = ValidationException;
