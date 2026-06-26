"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_1 = require("../utils/validation");
const organization_validators_1 = require("../validators/organization.validators");
const organization_controller_1 = require("../controllers/organization.controller");
const router = (0, express_1.Router)();
router.post('/', (0, validation_1.validate)({ body: organization_validators_1.createOrganizationSchema }), organization_controller_1.createOrganization);
router.use(auth_middleware_1.requireAuth);
router.get('/', (0, validation_1.validate)({ query: organization_validators_1.listOrganizationsQuerySchema }), organization_controller_1.listOrganizations);
router.get('/:organizationId', (0, validation_1.validate)({ params: organization_validators_1.organizationParamsSchema }), organization_controller_1.getOrganization);
router.put('/:organizationId', (0, validation_1.validate)({ params: organization_validators_1.organizationParamsSchema, body: organization_validators_1.updateOrganizationSchema }), organization_controller_1.updateOrganization);
router.delete('/:organizationId', (0, validation_1.validate)({ params: organization_validators_1.organizationParamsSchema }), organization_controller_1.softDeleteOrganization);
router.post('/:organizationId/restore', (0, validation_1.validate)({ params: organization_validators_1.organizationParamsSchema }), organization_controller_1.restoreOrganization);
// Organization Settings Routes
router.get('/:organizationId/settings', (0, validation_1.validate)({ params: organization_validators_1.organizationParamsSchema }), organization_controller_1.getOrganizationSettings);
router.put('/:organizationId/settings', (0, validation_1.validate)({ params: organization_validators_1.organizationParamsSchema, body: organization_validators_1.organizationSettingsSchema }), organization_controller_1.updateOrganizationSettings);
// Organization Branding Routes
router.get('/:organizationId/branding', (0, validation_1.validate)({ params: organization_validators_1.organizationParamsSchema }), organization_controller_1.getOrganizationBranding);
router.put('/:organizationId/branding', (0, validation_1.validate)({ params: organization_validators_1.organizationParamsSchema, body: organization_validators_1.organizationBrandingSchema }), organization_controller_1.updateOrganizationBranding);
// Organization Preferences Routes
router.get('/:organizationId/preferences', (0, validation_1.validate)({ params: organization_validators_1.organizationParamsSchema }), organization_controller_1.getOrganizationPreferences);
router.put('/:organizationId/preferences', (0, validation_1.validate)({ params: organization_validators_1.organizationParamsSchema, body: organization_validators_1.organizationPreferencesSchema }), organization_controller_1.updateOrganizationPreferences);
exports.default = router;
