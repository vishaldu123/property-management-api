/**
 * Health Check Routes
 * No authentication required
 */

import express from 'express';
import * as healthController from '../controllers/health.controller';

const router = express.Router();

/**
 * Liveness probe for Kubernetes
 * GET /health/live
 */
router.get('/live', healthController.liveness);

/**
 * Readiness probe for Kubernetes
 * GET /health/ready
 */
router.get('/ready', healthController.readiness);

/**
 * Detailed health check
 * GET /health/detailed
 */
router.get('/detailed', healthController.detailed);

export default router;
