"use strict";
/**
 * Health Check Endpoints
 * Provides liveness, readiness, and detailed diagnostics
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detailed = exports.readiness = exports.liveness = void 0;
const response_1 = require("../shared/core/response");
const environment_1 = require("../config/environment");
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
const startTime = Date.now();
/**
 * Liveness probe
 * Kubernetes uses this to determine if the pod should be restarted
 * Returns 200 if the application process is running
 */
const liveness = async (req, res) => {
    try {
        response_1.ApiResponse.success(res, { status: 'live' }, 'Application is running', 200);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.default.error('Liveness check failed', error);
        res.status(503).json({ status: 'down', message: errorMessage });
    }
};
exports.liveness = liveness;
/**
 * Readiness probe
 * Kubernetes uses this to determine if the pod can accept traffic
 * Checks if database is accessible
 */
const readiness = async (req, res) => {
    try {
        // Check database connectivity
        await prisma_1.default.$queryRaw `SELECT 1`;
        response_1.ApiResponse.success(res, {
            status: 'ready',
            database: 'connected',
        }, 'Application is ready', 200);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.default.error('Readiness check failed', error);
        res.status(503).json({
            status: 'not-ready',
            message: 'Database connection failed',
            details: errorMessage,
        });
    }
};
exports.readiness = readiness;
/**
 * Detailed health check
 * Provides comprehensive diagnostic information
 */
const detailed = async (req, res) => {
    try {
        const now = Date.now();
        const uptime = now - startTime;
        // Check database
        let databaseStatus;
        const dbStartTime = Date.now();
        try {
            await prisma_1.default.$queryRaw `SELECT 1`;
            databaseStatus = {
                status: 'ok',
                responseTime: Date.now() - dbStartTime,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Connection failed';
            databaseStatus = {
                status: 'error',
                message: errorMessage,
            };
        }
        // Check memory
        const memUsage = process.memoryUsage();
        const memoryStatus = {
            status: 'ok',
            used: Math.round(memUsage.heapUsed / 1024 / 1024),
            total: Math.round(memUsage.heapTotal / 1024 / 1024),
            percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
        };
        if (memoryStatus.percentage > 85) {
            memoryStatus.status = 'critical';
        }
        else if (memoryStatus.percentage > 70) {
            memoryStatus.status = 'warning';
        }
        // Determine overall status
        const overallStatus = databaseStatus.status === 'error' || memoryStatus.status === 'critical'
            ? 'unhealthy'
            : memoryStatus.status === 'warning'
                ? 'degraded'
                : 'healthy';
        const healthStatus = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime,
            environment: environment_1.config.nodeEnv,
            version: environment_1.config.appVersion,
            checks: {
                database: databaseStatus,
                memory: memoryStatus,
            },
        };
        const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
        response_1.ApiResponse.success(res, healthStatus, `Health status: ${overallStatus}`, statusCode);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger_1.default.error('Detailed health check failed', error);
        res.status(500).json({
            status: 'error',
            message: 'Health check failed',
            details: errorMessage,
        });
    }
};
exports.detailed = detailed;
exports.default = {
    liveness: exports.liveness,
    readiness: exports.readiness,
    detailed: exports.detailed,
};
