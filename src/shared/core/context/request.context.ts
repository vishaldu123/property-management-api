/**
 * Request Context Storage (using AsyncLocalStorage for thread-safety)
 */

import { AsyncLocalStorage } from 'async_hooks';
import { IRequestContext } from '../../types';

const asyncLocalStorage = new AsyncLocalStorage<IRequestContext>();

export class RequestContextManager {
  /**
   * Set request context
   */
  static setContext(context: IRequestContext): void {
    asyncLocalStorage.enterWith(context);
  }

  /**
   * Get current request context
   */
  static getContext(): IRequestContext | undefined {
    return asyncLocalStorage.getStore();
  }

  /**
   * Get user ID from context
   */
  static getUserId(): string | undefined {
    return this.getContext()?.userId;
  }

  /**
   * Get organization ID from context
   */
  static getOrganizationId(): string | undefined {
    return this.getContext()?.organizationId;
  }

  /**
   * Get request ID from context
   */
  static getRequestId(): string | undefined {
    return this.getContext()?.requestId;
  }

  /**
   * Get IP from context
   */
  static getIp(): string | undefined {
    return this.getContext()?.ip;
  }

  /**
   * Get user agent from context
   */
  static getUserAgent(): string | undefined {
    return this.getContext()?.userAgent;
  }

  /**
   * Run function within a context
   */
  static run<T>(context: IRequestContext, fn: () => T): T {
    return asyncLocalStorage.run(context, fn);
  }
}

/**
 * Request context middleware for Express
 */

import { Request, Response, NextFunction } from 'express';
import { UUIDGenerator } from '../../utils';

export const requestContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = UUIDGenerator.generate();
  const userId = (req as any).user?.id || 'anonymous';
  const organizationId = (req as any).user?.organizationId || 'unknown';
  const ip = req.ip || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';

  const context: IRequestContext = {
    requestId,
    userId,
    organizationId,
    ip,
    userAgent,
  };

  RequestContextManager.setContext(context);

  // Attach to response headers for tracking
  res.setHeader('X-Request-Id', requestId);

  next();
};
