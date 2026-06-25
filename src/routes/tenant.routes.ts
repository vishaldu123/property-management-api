import { Router } from 'express';
import { requireAuth, authorize } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import { createTenantSchema } from '../validators/tenant.validators';
import { createTenant, listTenants } from '../controllers/tenant.controller';

const router = Router();

router.use(requireAuth);
router.get('/', authorize('TENANT_READ'), listTenants);
router.post('/', authorize('TENANT_CREATE'), validate({ body: createTenantSchema }), createTenant);

export default router;
