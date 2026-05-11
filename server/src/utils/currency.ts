// utils/currency.ts
// Quy đổi tiền tệ USD ↔ VND ↔ Cents

const USD_TO_VND = parseInt(process.env.USD_TO_VND || '25000', 10);

/** USD → Cents (Stripe yêu cầu số nguyên) */
export const usdToCents = (usd: number): number => Math.round(usd * 100);

/** USD → VND (MoMo yêu cầu VND) */
export const usdToVnd = (usd: number): number => Math.round(usd * USD_TO_VND);

/** VND → USD (display ngược lại nếu cần) */
export const vndToUsd = (vnd: number): number =>
  Math.round((vnd / USD_TO_VND) * 100) / 100;

/** Format VND cho display */
export const formatVnd = (vnd: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vnd);
