"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const errors_1 = require("../utils/errors");
const globalErrorHandler = (err, _req, res, _next) => {
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
