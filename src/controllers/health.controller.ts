/**
 * Health Check Endpoints
 * Provides liveness, readiness, and detailed diagnostics
 */

import { Request, Response } from 'express';
import { ApiResponse } from '../shared/core/response';
import { config } from '../config/environment';
import prisma from '../config/prisma';
import logger from '../utils/logger';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: {
      status: 'ok' | 'error';
      message?: string;
      responseTime?: number;
    };
    memory: {
      status: 'ok' | 'warning' | 'critical';
      used: number;
      total: number;
      percentage: number;
    };
  };
}

const startTime = Date.now();

/**
 * Liveness probe
 * Kubernetes uses this to determine if the pod should be restarted
 * Returns 200 if the application process is running
 */
export const liveness = async (req: Request, res: Response): Promise<void> => {
  try {
    ApiResponse.success(res, { status: 'live' }, 'Application is running', 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Liveness check failed', error as Error);
    res.status(503).json({ status: 'down', message: errorMessage });
  }
};

/**
 * Readiness probe
 * Kubernetes uses this to determine if the pod can accept traffic
 * Checks if database is accessible
 */
export const readiness = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;

    ApiResponse.success(
      res,
      {
        status: 'ready',
        database: 'connected',
      },
      'Application is ready',
      200
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Readiness check failed', error as Error);
    res.status(503).json({
      status: 'not-ready',
      message: 'Database connection failed',
      details: errorMessage,
    });
  }
};

/**
 * Detailed health check
 * Provides comprehensive diagnostic information
 */
export const detailed = async (req: Request, res: Response): Promise<void> => {
  try {
    const now = Date.now();
    const uptime = now - startTime;

    // Check database
    let databaseStatus: HealthStatus['checks']['database'];
    const dbStartTime = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseStatus = {
        status: 'ok',
        responseTime: Date.now() - dbStartTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      databaseStatus = {
        status: 'error',
        message: errorMessage,
      };
    }

    // Check memory
    const memUsage = process.memoryUsage();
    const memoryStatus = {
      status: 'ok' as 'ok' | 'warning' | 'critical',
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    };

    if (memoryStatus.percentage > 85) {
      memoryStatus.status = 'critical';
    } else if (memoryStatus.percentage > 70) {
      memoryStatus.status = 'warning';
    }

    // Determine overall status
    const overallStatus =
      databaseStatus.status === 'error' || memoryStatus.status === 'critical'
        ? 'unhealthy'
        : memoryStatus.status === 'warning'
          ? 'degraded'
          : 'healthy';

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime,
      environment: config.nodeEnv,
      version: config.appVersion,
      checks: {
        database: databaseStatus,
        memory: memoryStatus,
      },
    };

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    ApiResponse.success(res, healthStatus, `Health status: ${overallStatus}`, statusCode);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Detailed health check failed', error as Error);
    res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      details: errorMessage,
    });
  }
};

export default {
  liveness,
  readiness,
  detailed,
};
