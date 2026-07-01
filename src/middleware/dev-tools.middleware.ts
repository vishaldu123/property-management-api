import { Request, Response, NextFunction } from 'express';
import { config } from '../config/environment';
import { ApiResponse } from '../shared/core/response';

/**
 * Dev/demo data tools are disabled in production unless explicitly enabled.
 */
export function requireDevToolsEnabled(req: Request, res: Response, next: NextFunction): void {
  const enabled =
    config.nodeEnv !== 'production' || process.env.ENABLE_DEV_TOOLS === 'true';

  if (!enabled) {
    ApiResponse.error(res, 'Developer tools are not available in this environment', 404);
    return;
  }

  next();
}
