import winston, { Logger } from 'winston';
import { RequestContextManager } from '../core/context';

/**
 * Structured Logger Service
 */

export class LoggerService {
  private static logger: Logger;

  static initialize(): void {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
      ),
      defaultMeta: { service: 'property-management-api' },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              const requestId = RequestContextManager.getRequestId() || 'N/A';
              return `${timestamp} [${requestId}] ${level}: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
              }`;
            })
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    });
  }

  static info(message: string, meta?: any): void {
    this.logger.info(message, this.addRequestContext(meta));
  }

  static error(message: string, error?: Error | any, meta?: any): void {
    this.logger.error(message, {
      ...this.addRequestContext(meta),
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
  }

  static warn(message: string, meta?: any): void {
    this.logger.warn(message, this.addRequestContext(meta));
  }

  static debug(message: string, meta?: any): void {
    this.logger.debug(message, this.addRequestContext(meta));
  }

  private static addRequestContext(meta?: any): any {
    const context = RequestContextManager.getContext();
    return {
      ...meta,
      requestId: context?.requestId,
      userId: context?.userId,
      organizationId: context?.organizationId,
      ip: context?.ip,
    };
  }
}

/**
 * Logger middleware for Express
 */

import { Request, Response, NextFunction } from 'express';

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
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
      userId: (req as any).user?.id,
    };

    if (statusCode >= 500) {
      LoggerService.error(message, undefined, logMeta);
    } else if (statusCode >= 400) {
      LoggerService.warn(message, logMeta);
    } else {
      LoggerService.info(message, logMeta);
    }
  });

  next();
};
