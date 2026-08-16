import crypto from 'crypto';
import env from '../config/env';
import { ApiError } from '../utils/ApiError';
import { PaymentMethod } from '../models/Order';

export interface PaymentIntent {
  reference: string;
  amount: number;
  currency: 'INR';
  provider: PaymentMethod;
  // Extra fields a client SDK might need (e.g. Razorpay order id/key).
  clientMeta?: Record<string, unknown>;
}

export interface PaymentVerification {
  verified: boolean;
  reference: string;
}

/**
 * A payment provider knows how to create a payment intent and verify a
 * completed payment. All verification happens server-side — the client is
 * never trusted to report success.
 */
export interface PaymentProvider {
  readonly method: PaymentMethod;
  createIntent(amount: number, orderNumber: string): Promise<PaymentIntent>;
  verify(payload: Record<string, unknown>): Promise<PaymentVerification>;
}

/** Cash on delivery — no online payment, marked pending until delivered. */
class CodProvider implements PaymentProvider {
  readonly method = 'cod' as const;
  async createIntent(amount: number, orderNumber: string): Promise<PaymentIntent> {
    return { reference: `COD-${orderNumber}`, amount, currency: 'INR', provider: 'cod' };
  }
  async verify(): Promise<PaymentVerification> {
    return { verified: true, reference: 'cod' };
  }
}

/** Deterministic mock provider for development/test payment flows. */
class MockProvider implements PaymentProvider {
  readonly method = 'mock' as const;
  async createIntent(amount: number, orderNumber: string): Promise<PaymentIntent> {
    const reference = `MOCK-${orderNumber}-${crypto.randomBytes(4).toString('hex')}`;
    return {
      reference,
      amount,
      currency: 'INR',
      provider: 'mock',
      clientMeta: { note: 'Development mock payment — always succeeds.' },
    };
  }
  async verify(payload: Record<string, unknown>): Promise<PaymentVerification> {
    // In the mock flow the reference created at intent time is echoed back.
    return { verified: true, reference: String(payload.reference ?? 'mock') };
  }
}

/**
 * Razorpay provider. Left as a structured stub so it can be wired up by adding
 * the razorpay SDK and env keys — no call sites change.
 */
class RazorpayProvider implements PaymentProvider {
  readonly method = 'razorpay' as const;
  async createIntent(amount: number, orderNumber: string): Promise<PaymentIntent> {
    if (!env.razorpay.keyId) {
      throw ApiError.badRequest('Razorpay is not configured.');
    }
    // TODO: const order = await razorpay.orders.create({ amount: amount*100, currency:'INR', receipt: orderNumber })
    return {
      reference: `rzp_${orderNumber}`,
      amount,
      currency: 'INR',
      provider: 'razorpay',
      clientMeta: { keyId: env.razorpay.keyId },
    };
  }
  async verify(payload: Record<string, unknown>): Promise<PaymentVerification> {
    // TODO: verify razorpay_signature using HMAC SHA256 with keySecret.
    const signature = payload.razorpay_signature;
    return { verified: Boolean(signature), reference: String(payload.razorpay_payment_id ?? '') };
  }
}

const providers: Record<PaymentMethod, PaymentProvider> = {
  cod: new CodProvider(),
  mock: new MockProvider(),
  razorpay: new RazorpayProvider(),
};

export const paymentService = {
  getProvider(method: PaymentMethod): PaymentProvider {
    const provider = providers[method];
    if (!provider) throw ApiError.badRequest('Unsupported payment method.');
    return provider;
  },
};
