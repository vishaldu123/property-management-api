import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../utils/validation';
import {
  createOrganizationSchema,
  listOrganizationsQuerySchema,
  organizationParamsSchema,
  updateOrganizationSchema,
  organizationSettingsSchema,
  organizationBrandingSchema,
  organizationPreferencesSchema,
} from '../validators/organization.validators';
import {
  createOrganization,
  getOrganization,
  listOrganizations,
  restoreOrganization,
  softDeleteOrganization,
  updateOrganization,
  getOrganizationSettings,
  updateOrganizationSettings,
  getOrganizationBranding,
  updateOrganizationBranding,
  getOrganizationPreferences,
  updateOrganizationPreferences,
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

// Organization Settings Routes
router.get('/:organizationId/settings', validate({ params: organizationParamsSchema }), getOrganizationSettings);
router.put(
  '/:organizationId/settings',
  validate({ params: organizationParamsSchema, body: organizationSettingsSchema }),
  updateOrganizationSettings
);

// Organization Branding Routes
router.get('/:organizationId/branding', validate({ params: organizationParamsSchema }), getOrganizationBranding);
router.put(
  '/:organizationId/branding',
  validate({ params: organizationParamsSchema, body: organizationBrandingSchema }),
  updateOrganizationBranding
);

// Organization Preferences Routes
router.get('/:organizationId/preferences', validate({ params: organizationParamsSchema }), getOrganizationPreferences);
router.put(
  '/:organizationId/preferences',
  validate({ params: organizationParamsSchema, body: organizationPreferencesSchema }),
  updateOrganizationPreferences
);

export default router;
