"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
const globalErrorHandler = (err, _req, res, _next) => {
    if (err instanceof zod_1.ZodError) {
        const errors = {};
        for (const issue of err.issues) {
            const path = issue.path.join('.');
            if (!errors[path]) {
                errors[path] = [];
            }
            errors[path].push(issue.message);
        }
        res.status(400).json({
            message: 'Validation failed',
            errors,
        });
        return;
    }
    if (err instanceof errors_1.ValidationError) {
        res.status(err.statusCode).json({
            message: err.message,
            errors: err.errors,
        });
        return;
    }
    if (err instanceof errors_1.AppError) {
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
exports.globalErrorHandler = globalErrorHandler;
