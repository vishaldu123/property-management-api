"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = exports.LoggerService = void 0;
const winston_1 = __importDefault(require("winston"));
const context_1 = require("../core/context");
/**
 * Structured Logger Service
 */
class LoggerService {
    static logger;
    static initialize() {
        this.logger = winston_1.default.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json()),
            defaultMeta: { service: 'property-management-api' },
            transports: [
                new winston_1.default.transports.Console({
                    format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(({ level, message, timestamp, ...meta }) => {
                        const requestId = context_1.RequestContextManager.getRequestId() || 'N/A';
                        return `${timestamp} [${requestId}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
                    })),
                }),
                new winston_1.default.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                }),
                new winston_1.default.transports.File({
                    filename: 'logs/combined.log',
                }),
            ],
        });
    }
    static info(message, meta) {
        this.logger.info(message, this.addRequestContext(meta));
    }
    static error(message, error, meta) {
        this.logger.error(message, {
            ...this.addRequestContext(meta),
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
        });
    }
    static warn(message, meta) {
        this.logger.warn(message, this.addRequestContext(meta));
    }
    static debug(message, meta) {
        this.logger.debug(message, this.addRequestContext(meta));
    }
    static addRequestContext(meta) {
        const context = context_1.RequestContextManager.getContext();
        return {
            ...meta,
            requestId: context?.requestId,
            userId: context?.userId,
            organizationId: context?.organizationId,
            ip: context?.ip,
        };
    }
}
exports.LoggerService = LoggerService;
const loggerMiddleware = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const statusCode = res.statusCode;
        const message = `${req.method} ${req.path}`;
        const logMeta = {
            method: req.method,
            path: req.path,
            statusCode,
            duration: `${duration}ms`,
            query: req.query,
            userId: req.user?.id,
        };
        if (statusCode >= 500) {
            LoggerService.error(message, undefined, logMeta);
        }
        else if (statusCode >= 400) {
            LoggerService.warn(message, logMeta);
        }
        else {
            LoggerService.info(message, logMeta);
        }
    });
    next();
};
exports.loggerMiddleware = loggerMiddleware;
