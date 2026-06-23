"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const payment_service_1 = require("../payment.service");
const razorpayAdapter_1 = __importDefault(require("../razorpayAdapter"));
describe('Payment Service', () => {
    describe('getProviderAdapter', () => {
        it('should return Razorpay adapter for razorpay provider', () => {
            const adapter = (0, payment_service_1.getProviderAdapter)('razorpay');
            expect(adapter).toBeDefined();
            expect(adapter.name).toBe('razorpay');
        });
        it('should return Cashfree adapter for cashfree provider', () => {
            const adapter = (0, payment_service_1.getProviderAdapter)('cashfree');
            expect(adapter).toBeDefined();
            expect(adapter.name).toBe('cashfree');
        });
    });
    describe('createPaymentWithProvider', () => {
        it('should throw error for unsupported provider', async () => {
            await expect((0, payment_service_1.createPaymentWithProvider)('unsupported', {
                amount: 100,
                currency: 'INR',
                receipt: 'test-receipt',
            })).rejects.toThrow('Unsupported provider');
        });
        it('should call Razorpay adapter for razorpay provider', async () => {
            const spy = jest.spyOn(razorpayAdapter_1.default, 'createPayment').mockResolvedValue({
                id: 'order_123',
                amount: 10000,
                currency: 'INR',
            });
            const result = await (0, payment_service_1.createPaymentWithProvider)('razorpay', {
                amount: 10000,
                currency: 'INR',
                receipt: 'test-receipt',
            });
            expect(spy).toHaveBeenCalled();
            expect(result.id).toBe('order_123');
            spy.mockRestore();
        });
    });
});
