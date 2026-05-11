// src/services/paymentClient.ts
// Frontend client gọi backend thanh toán
// Không bao giờ gọi Stripe/MoMo trực tiếp từ đây

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export interface StripeIntentResponse {
  clientSecret: string;
  intentId: string;
  amountCents: number;
}

export interface MomoCreateResponse {
  payUrl: string;
  deeplink?: string;
  orderId: string;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error ?? `HTTP ${res.status}`);
  }

  return data as T;
}

export const paymentClient = {
  /**
   * Stripe: Lấy clientSecret để xác nhận thanh toán với @stripe/react-stripe-js
   * Dùng: const { clientSecret } = await paymentClient.stripeIntent(...)
   *       stripe.confirmPayment({ elements, confirmParams: { return_url } })
   */
  stripeIntent(amountUsd: number, userId: string, itemId: string) {
    return post<StripeIntentResponse>('/api/payment/stripe/intent', {
      amountUsd,
      userId,
      itemId,
    });
  },

  /**
   * MoMo: Lấy payUrl để redirect sang MoMo
   * Dùng: const { payUrl } = await paymentClient.momoCreate(...)
   *       window.location.href = payUrl
   */
  momoCreate(amountUsd: number, userId: string, itemId: string) {
    return post<MomoCreateResponse>('/api/payment/momo/create', {
      amountUsd,
      userId,
      itemId,
    });
  },
};
