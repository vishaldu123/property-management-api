export interface CreatePaymentOptions {
  amount: number; // in smallest currency unit (paise)
  currency?: string;
  receipt?: string;
  metadata?: Record<string, any>;
}

export interface PaymentProvider {
  name: string;
  createPayment(opts: CreatePaymentOptions): Promise<any>;
  verifyWebhookSignature(rawBody: Buffer, signatureHeader: string | undefined): boolean;
  handleWebhook(payload: any): Promise<any>;
}

export type ProviderKey = 'razorpay' | 'cashfree';
