"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck - Phase 1: Lease module deferred to Phase 2
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_1 = require("../utils/validation");
const lease_validators_1 = require("../validators/lease.validators");
const lease_controller_1 = require("../controllers/lease.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/', (0, auth_middleware_1.authorize)('LEASE_READ'), lease_controller_1.listLeases);
router.get('/:leaseId', (0, auth_middleware_1.authorize)('LEASE_READ'), lease_controller_1.getLease);
router.post('/', (0, auth_middleware_1.authorize)('LEASE_CREATE'), (0, validation_1.validate)({ body: lease_validators_1.createLeaseSchema }), lease_controller_1.createLease);
router.put('/:leaseId', (0, auth_middleware_1.authorize)('LEASE_UPDATE'), (0, validation_1.validate)({ body: lease_validators_1.updateLeaseSchema, params: lease_validators_1.leaseIdParamSchema }), lease_controller_1.updateLease);
router.delete('/:leaseId', (0, auth_middleware_1.authorize)('LEASE_DELETE'), lease_controller_1.deleteLease);
exports.default = router;
