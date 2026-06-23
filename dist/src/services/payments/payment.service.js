"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProviderAdapter = exports.createPaymentWithProvider = void 0;
const razorpayAdapter_1 = __importDefault(require("./razorpayAdapter"));
const cashfreeAdapter_1 = __importDefault(require("./cashfreeAdapter"));
const providers = {
    razorpay: razorpayAdapter_1.default,
    cashfree: cashfreeAdapter_1.default,
};
const createPaymentWithProvider = async (provider, opts) => {
    const p = providers[provider];
    if (!p)
        throw new Error('Unsupported provider');
    return p.createPayment(opts);
};
exports.createPaymentWithProvider = createPaymentWithProvider;
const getProviderAdapter = (provider) => providers[provider];
exports.getProviderAdapter = getProviderAdapter;
