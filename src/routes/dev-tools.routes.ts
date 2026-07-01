import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/authorization.middleware';
import { requireDevToolsEnabled } from '../middleware/dev-tools.middleware';
import { getDataSummary, resetData, seedData } from '../controllers/dev-tools.controller';

const router = Router();

router.use(requireDevToolsEnabled);
router.use(requireAuth);
router.use(requireRole(['organization_owner', 'organization_admin', 'super_admin']));

/**
 * @route GET /api/v1/dev/data-summary
 * @desc Current portfolio record counts for the organization
 */
router.get('/data-summary', getDataSummary);

/**
 * @route POST /api/v1/dev/seed
 * @desc Seed demo portfolio data (optional body/query: force=true)
 */
router.post('/seed', seedData);

/**
 * @route POST /api/v1/dev/reset
 * @desc Remove all portfolio data for the organization
 */
router.post('/reset', resetData);

export default router;
