import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { createTenant, listTenants } from '../controllers/tenant.controller';

const router = Router();

router.use(requireAuth);
router.get('/', listTenants);
router.post('/', requireRole(['MANAGER', 'ADMIN', 'OWNER']), createTenant);

export default router;
