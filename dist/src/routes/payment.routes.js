"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck - Phase 1: Payment module deferred to Phase 2
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const payment_controller_1 = require("../controllers/payment.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
router.get('/', (0, auth_middleware_1.authorize)('PAYMENT_READ'), payment_controller_1.listPayments);
router.get('/:paymentId', (0, auth_middleware_1.authorize)('PAYMENT_READ'), payment_controller_1.getPayment);
router.post('/', (0, auth_middleware_1.authorize)('PAYMENT_CREATE'), payment_controller_1.createPayment);
router.post('/initiate', (0, auth_middleware_1.authorize)('PAYMENT_INITIATE'), payment_controller_1.initiatePayment);
router.put('/:paymentId', (0, auth_middleware_1.authorize)('PAYMENT_UPDATE'), payment_controller_1.updatePayment);
router.delete('/:paymentId', (0, auth_middleware_1.authorize)('PAYMENT_DELETE'), payment_controller_1.deletePayment);
exports.default = router;
