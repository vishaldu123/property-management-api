import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import {
  createOrganizationSchema,
  listOrganizationsQuerySchema,
  organizationParamsSchema,
  updateOrganizationSchema,
} from '../validators/organization.validators';
import {
  createOrganization,
  getOrganization,
  listOrganizations,
  restoreOrganization,
  softDeleteOrganization,
  updateOrganization,
} from '../controllers/organization.controller';

const router = Router();

router.post('/', validate({ body: createOrganizationSchema }), createOrganization);

router.use(requireAuth);

router.get('/', validate({ query: listOrganizationsQuerySchema }), listOrganizations);
router.get('/:organizationId', validate({ params: organizationParamsSchema }), getOrganization);
router.put(
  '/:organizationId',
  validate({ params: organizationParamsSchema, body: updateOrganizationSchema }),
  updateOrganization
);
router.delete('/:organizationId', validate({ params: organizationParamsSchema }), softDeleteOrganization);
router.post('/:organizationId/restore', validate({ params: organizationParamsSchema }), restoreOrganization);

export default router;
