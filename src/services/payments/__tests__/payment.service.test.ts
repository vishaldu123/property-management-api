import { createPaymentWithProvider, getProviderAdapter } from '../../services/payments/payment.service';
import RazorpayAdapter from '../../services/payments/razorpayAdapter';
import CashfreeAdapter from '../../services/payments/cashfreeAdapter';

describe('Payment Service', () => {
  describe('getProviderAdapter', () => {
    it('should return Razorpay adapter for razorpay provider', () => {
      const adapter = getProviderAdapter('razorpay');
      expect(adapter).toBeDefined();
      expect(adapter.name).toBe('razorpay');
    });

    it('should return Cashfree adapter for cashfree provider', () => {
      const adapter = getProviderAdapter('cashfree');
      expect(adapter).toBeDefined();
      expect(adapter.name).toBe('cashfree');
    });
  });

  describe('createPaymentWithProvider', () => {
    it('should throw error for unsupported provider', async () => {
      await expect(
        createPaymentWithProvider('unsupported' as any, {
          amount: 100,
          currency: 'INR',
          receipt: 'test-receipt',
        })
      ).rejects.toThrow('Unsupported provider');
    });

    it('should call Razorpay adapter for razorpay provider', async () => {
      const spy = jest.spyOn(RazorpayAdapter, 'createPayment').mockResolvedValue({
        id: 'order_123',
        amount: 10000,
        currency: 'INR',
      });

      const result = await createPaymentWithProvider('razorpay', {
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
