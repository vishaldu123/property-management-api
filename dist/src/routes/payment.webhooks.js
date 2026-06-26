"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck - Phase 1: Payment module deferred to Phase 2
const express_1 = require("express");
const razorpayAdapter_1 = __importDefault(require("../services/payments/razorpayAdapter"));
const cashfreeAdapter_1 = __importDefault(require("../services/payments/cashfreeAdapter"));
const razorpay = (0, express_1.Router)();
const cashfree = (0, express_1.Router)();
razorpay.post('/', async (req, res) => {
    try {
        const raw = req.body;
        const signature = req.headers['x-razorpay-signature'];
        const ok = razorpayAdapter_1.default.verifyWebhookSignature(raw, signature);
        if (!ok)
            return res.status(400).json({ message: 'Invalid signature' });
        const payload = JSON.parse(raw.toString('utf8'));
        await razorpayAdapter_1.default.handleWebhook(payload);
        res.json({ ok: true });
    }
    catch (err) {
        console.error('razorpay webhook error', err);
        res.status(500).json({ ok: false });
    }
});
cashfree.post('/', async (req, res) => {
    try {
        const raw = req.body;
        const signature = req.headers['x-webhook-signature'];
        const ok = cashfreeAdapter_1.default.verifyWebhookSignature(raw, signature);
        if (!ok)
            return res.status(400).json({ message: 'Invalid signature' });
        const payload = JSON.parse(raw.toString('utf8'));
        await cashfreeAdapter_1.default.handleWebhook(payload);
        res.json({ ok: true });
    }
    catch (err) {
        console.error('cashfree webhook error', err);
        res.status(500).json({ ok: false });
    }
});
exports.default = { razorpay, cashfree };
