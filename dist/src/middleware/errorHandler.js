"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const zod_1 = require("zod");
const response_1 = require("../shared/core/response");
const exceptions_1 = require("../shared/exceptions");
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
/**
 * Global Error Handler Middleware
 * Consolidates all exception types and ensures standardized error responses
 *
 * Must be placed last in middleware chain
 */
const globalErrorHandler = (err, req, res, next) => {
    const requestId = res.getHeader('X-Request-ID') || 'unknown';
    // Log all errors
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;
    logger_1.default.error('Request error', {
        message: errorMessage,
        requestId,
        path: req.path,
        method: req.method,
        ip: req.ip,
        stack: errorStack,
    });
    // Handle Zod validation errors
    if (err instanceof zod_1.ZodError) {
        const errors = {};
        for (const issue of err.issues) {
            const path = issue.path.join('.');
            if (!errors[path]) {
                errors[path] = [];
            }
            errors[path].push(issue.message);
        }
        response_1.ApiResponse.validationError(res, errors, 'Validation failed');
        return;
    }
    // Handle shared ValidationException
    if (err instanceof exceptions_1.ValidationException) {
        response_1.ApiResponse.validationError(res, err.errors, err.message);
        return;
    }
    // Handle utils ValidationError (legacy)
    if (err instanceof errors_1.ValidationError) {
        response_1.ApiResponse.validationError(res, err.errors, err.message);
        return;
    }
    // Handle shared AppException
    if (err instanceof exceptions_1.AppException) {
        let errors;
        if (err.details?.errors) {
            errors = err.details.errors;
        }
        response_1.ApiResponse.error(res, err.message, err.statusCode, errors);
        return;
    }
    // Handle utils AppError (legacy)
    if (err instanceof errors_1.AppError) {
        response_1.ApiResponse.error(res, err.message, err.statusCode);
        return;
    }
    // Handle generic Error objects
    if (err instanceof Error) {
        // Check for common error types
        if (err.name === 'CastError') {
            response_1.ApiResponse.error(res, 'Invalid ID format', 400);
            return;
        }
        if (err.message.includes('UNIQUE constraint failed')) {
            response_1.ApiResponse.error(res, 'Resource already exists', 409);
            return;
        }
        if (err.message.includes('FOREIGN KEY constraint failed')) {
            response_1.ApiResponse.error(res, 'Referenced resource not found', 400);
            return;
        }
        // Generic error - don't expose internal details in production
        const isDevelopment = process.env.NODE_ENV === 'development';
        const message = isDevelopment ? err.message : 'An unexpected error occurred';
        response_1.ApiResponse.error(res, message, 500);
        return;
    }
    // Fallback for unknown error types
    response_1.ApiResponse.error(res, 'An unexpected error occurred', 500);
};
exports.globalErrorHandler = globalErrorHandler;
