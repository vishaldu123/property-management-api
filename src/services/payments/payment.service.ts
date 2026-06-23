import RazorpayAdapter from './razorpayAdapter';
import CashfreeAdapter from './cashfreeAdapter';
import { ProviderKey, CreatePaymentOptions } from './gateway';

const providers: Record<ProviderKey, any> = {
  razorpay: RazorpayAdapter,
  cashfree: CashfreeAdapter,
};

export const createPaymentWithProvider = async (provider: ProviderKey, opts: CreatePaymentOptions) => {
  const p = providers[provider];
  if (!p) throw new Error('Unsupported provider');
  return p.createPayment(opts);
};

export const getProviderAdapter = (provider: ProviderKey) => providers[provider];
