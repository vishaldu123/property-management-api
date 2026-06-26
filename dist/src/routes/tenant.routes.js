"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck - Phase 1: Tenant module deferred to Phase 2
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_1 = require("../utils/validation");
const tenant_validators_1 = require("../validators/tenant.validators");
const tenant_controller_1 = require("../controllers/tenant.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/', (0, auth_middleware_1.authorize)('TENANT_READ'), tenant_controller_1.listTenants);
router.post('/', (0, auth_middleware_1.authorize)('TENANT_CREATE'), (0, validation_1.validate)({ body: tenant_validators_1.createTenantSchema }), tenant_controller_1.createTenant);
exports.default = router;
