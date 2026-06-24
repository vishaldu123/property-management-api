"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    errors;
    constructor(errors) {
        super('Validation failed', 400, true);
        this.errors = errors;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(resource) {
        super(`${resource} not found`, 404, true);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401, true);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403, true);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.ForbiddenError = ForbiddenError;
