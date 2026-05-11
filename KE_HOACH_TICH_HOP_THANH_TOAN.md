# 💳 Kế Hoạch Tích Hợp Khung Thanh Toán — Math Battle

> **Mục tiêu:** Chỉ cần điền `STRIPE_SECRET_KEY` và `MOMO_SECRET_KEY` vào file `.env` là hệ thống hoạt động hoàn chỉnh.

---

## 🗂️ Tổng Quan Kiến Trúc

```
[App Mobile/Web]
      │  fetch("/api/payment/...")
      ▼
[Backend Node.js  — server/]
      │  Stripe SDK / MoMo HMAC
      ▼
[Cổng Thanh Toán]
      │  Webhook POST
      ▼
[Backend — xác thực chữ ký]
      │  deliverReward(userId, itemId)
      ▼
[playerStore — cộng gems/item]
```

**Nguyên tắc bất biến:**
- ❌ Không bao giờ gọi Stripe/MoMo trực tiếp từ frontend
- ✅ Frontend chỉ gọi backend nội bộ `/api/payment/...`
- ✅ Backend xác thực webhook bằng chữ ký mật mã trước khi phát thưởng

---

## 📁 Cấu Trúc Thư Mục Cần Tạo

```
math-battle-offline-mobile/
├── server/                          ← Backend mới (Node.js)
│   ├── src/
│   │   ├── index.ts                 ← Entry point Express
│   │   ├── routes/
│   │   │   └── payment.routes.ts   ← POST /stripe/intent, /momo/create
│   │   ├── services/
│   │   │   ├── stripe.service.ts   ← Stripe PaymentIntent
│   │   │   └── momo.service.ts     ← MoMo create order + HMAC
│   │   ├── webhooks/
│   │   │   ├── stripe.webhook.ts   ← Xác thực + deliverReward
│   │   │   └── momo.webhook.ts     ← Xác thực HMAC + deliverReward
│   │   ├── services/
│   │   │   └── reward.service.ts   ← Ghi vào DB / cộng items
│   │   └── utils/
│   │       └── currency.ts         ← USD ↔ VND
│   ├── .env                         ← ← ← CHỈ CẦN ĐIỀN 2 KEY NÀY
│   └── package.json
│
└── src/                             ← Frontend hiện có
    ├── services/
    │   └── paymentClient.ts         ← Fetch helper gọi backend
    ├── pages/Shop/
    │   └── ShopPage.tsx             ← Cập nhật: gọi paymentClient
    └── data/
        └── shopData.ts              ← Thêm priceUsd vào ShopItem
```

---

## ⚙️ Bước 1 — Cài Đặt Backend

```bash
mkdir server && cd server
npm init -y
npm install express stripe axios crypto-js dotenv cors helmet express-rate-limit
npm install -D typescript @types/express @types/node ts-node tsx
```

---

## 🔑 Bước 2 — File `.env` (CHỈ CẦN ĐIỀN 2 KEY)

```env
# ════════════════════════════════════
#   CHỈ CẦN ĐIỀN 2 DÒNG NÀY LÀ XONG
# ════════════════════════════════════

STRIPE_SECRET_KEY=sk_test_...       # Lấy tại: dashboard.stripe.com → API Keys
MOMO_SECRET_KEY=...                 # Lấy tại: business.momo.vn → Thông tin tích hợp

# ════════════════════════════════════
#   CẤU HÌNH MẶC ĐỊNH (không cần đổi)
# ════════════════════════════════════

# Stripe (Webhook secret tự động tạo khi chạy dev với Stripe CLI)
STRIPE_WEBHOOK_SECRET=whsec_auto    # dev: dùng stripe listen --forward-to localhost:3001/api/webhooks/stripe

# MoMo (Sandbox mặc định — đổi sang production khi live)
MOMO_PARTNER_CODE=MOMO_ATM_TEST
MOMO_ACCESS_KEY=F8BBA842ECF85        # Sandbox public, OK để default
MOMO_ENDPOINT=https://test-payment.momo.vn

# App
FRONTEND_URL=http://localhost:5173
PORT=3001
USD_TO_VND=25000
```

> **Hướng dẫn lấy key:**
> - **Stripe:** Vào `dashboard.stripe.com` → *Developers* → *API Keys* → Copy `Secret key`
> - **MoMo:** Vào `business.momo.vn` → *Tích hợp* → *Thông tin kết nối* → Copy `secretKey`

---

## 📝 Bước 3 — Các File Cần Tạo

### `server/src/utils/currency.ts`

```typescript
const USD_TO_VND = parseInt(process.env.USD_TO_VND || '25000');

export const usdToCents = (usd: number) => Math.round(usd * 100);
export const usdToVnd   = (usd: number) => Math.round(usd * USD_TO_VND);
```

---

### `server/src/services/stripe.service.ts`

```typescript
import Stripe from 'stripe';
import { usdToCents } from '../utils/currency';

// ← Chỉ cần STRIPE_SECRET_KEY trong .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createStripeIntent = async (
  amountUsd: number,
  userId: string,
  itemId: string,
) => {
  const intent = await stripe.paymentIntents.create({
    amount:   usdToCents(amountUsd),
    currency: 'usd',
    metadata: { userId, itemId },  // dùng để phát thưởng trong webhook
  });
  return { clientSecret: intent.client_secret, intentId: intent.id };
};
```

---

### `server/src/services/momo.service.ts`

```typescript
import crypto from 'crypto';
import axios from 'axios';
import { usdToVnd } from '../utils/currency';

// ← Chỉ cần MOMO_SECRET_KEY trong .env
export const createMomoPayment = async (
  amountUsd: number,
  orderId: string,
  userId: string,
  itemId: string,
) => {
  const amount    = usdToVnd(amountUsd);
  const requestId = `${orderId}_${Date.now()}`;
  const extraData = Buffer.from(JSON.stringify({ userId, itemId })).toString('base64');
  const ipnUrl    = `${process.env.FRONTEND_URL}/api/webhooks/momo`;
  const redirectUrl = `${process.env.FRONTEND_URL}/shop/success`;

  const rawSignature = [
    `accessKey=${process.env.MOMO_ACCESS_KEY}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${ipnUrl}`,
    `orderId=${orderId}`,
    `orderInfo=Math Battle - ${itemId}`,
    `partnerCode=${process.env.MOMO_PARTNER_CODE}`,
    `redirectUrl=${redirectUrl}`,
    `requestId=${requestId}`,
    `requestType=payWithMethod`,
  ].join('&');

  const signature = crypto
    .createHmac('sha256', process.env.MOMO_SECRET_KEY!)
    .update(rawSignature)
    .digest('hex');

  const { data } = await axios.post(
    `${process.env.MOMO_ENDPOINT}/v2/gateway/api/create`,
    {
      partnerCode: process.env.MOMO_PARTNER_CODE,
      requestId, orderId, amount,
      orderInfo: `Math Battle - ${itemId}`,
      redirectUrl, ipnUrl,
      requestType: 'payWithMethod',
      extraData, lang: 'vi', signature,
    },
  );
  return data; // chứa payUrl
};
```

---

### `server/src/webhooks/stripe.webhook.ts`

```typescript
import Stripe from 'stripe';
import { Request, Response } from 'express';
import { deliverReward } from '../services/reward.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature']!;
  let event: Stripe.Event;

  try {
    // req.body phải là raw Buffer (xem index.ts)
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return res.status(400).send('Webhook signature invalid');
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const { userId, itemId } = intent.metadata;
    await deliverReward(userId, itemId);
  }

  res.json({ received: true });
};
```

---

### `server/src/webhooks/momo.webhook.ts`

```typescript
import crypto from 'crypto';
import { Request, Response } from 'express';
import { deliverReward } from '../services/reward.service';

export const handleMomoWebhook = async (req: Request, res: Response) => {
  const { resultCode, extraData, signature, ...fields } = req.body;

  // Xác thực chữ ký HMAC-SHA256
  const raw = Object.keys(fields).sort()
    .map(k => `${k}=${fields[k]}`).join('&');
  const expected = crypto
    .createHmac('sha256', process.env.MOMO_SECRET_KEY!)
    .update(raw).digest('hex');

  if (signature !== expected) return res.status(400).send('Invalid signature');

  if (resultCode === 0) { // 0 = thành công
    const { userId, itemId } = JSON.parse(Buffer.from(extraData, 'base64').toString());
    await deliverReward(userId, itemId);
  }

  res.json({ message: 'ok' }); // MoMo yêu cầu phản hồi 200
};
```

---

### `server/src/services/reward.service.ts`

```typescript
// Giao diện giữa backend thanh toán và logic game
// Hiện tại: cập nhật localStorage qua API nội bộ
// Tương lai: ghi vào database

export const deliverReward = async (userId: string, itemId: string) => {
  console.log(`[REWARD] userId=${userId} itemId=${itemId}`);

  // TODO: Ghi vào DB để chống trùng lặp (idempotency)
  // const existing = await db.transactions.findOne({ userId, itemId, status: 'delivered' });
  // if (existing) return;

  // TODO: Map itemId → phần thưởng (gems, gói bài, v.v.)
  // const reward = REWARD_MAP[itemId];
  // await db.users.updateOne({ userId }, { $inc: { gems: reward.gems } });

  // Tạm thời: emit event để frontend cập nhật
  console.log(`[REWARD] Delivered ${itemId} to ${userId}`);
};
```

---

### `server/src/routes/payment.routes.ts`

```typescript
import { Router } from 'express';
import { createStripeIntent } from '../services/stripe.service';
import { createMomoPayment }  from '../services/momo.service';

const router = Router();

// POST /api/payment/stripe/intent
router.post('/stripe/intent', async (req, res) => {
  const { amountUsd, userId, itemId } = req.body;
  const result = await createStripeIntent(amountUsd, userId, itemId);
  res.json(result);
});

// POST /api/payment/momo/create
router.post('/momo/create', async (req, res) => {
  const { amountUsd, userId, itemId } = req.body;
  const orderId = `MB_${userId}_${Date.now()}`;
  const result  = await createMomoPayment(amountUsd, orderId, userId, itemId);
  res.json({ payUrl: result.payUrl, orderId });
});

export default router;
```

---

### `server/src/index.ts`

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import paymentRoutes from './routes/payment.routes';
import { handleStripeWebhook } from './webhooks/stripe.webhook';
import { handleMomoWebhook }   from './webhooks/momo.webhook';

dotenv.config();

const app = express();

// Stripe webhook cần raw body TRƯỚC khi parse JSON
app.post(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook,
);

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// MoMo webhook (JSON bình thường)
app.post('/api/webhooks/momo', handleMomoWebhook);

// Payment routes
app.use('/api/payment', paymentRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Backend chạy tại http://localhost:${PORT}`));
```

---

## 🖥️ Bước 4 — Frontend: `src/services/paymentClient.ts`

```typescript
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const paymentClient = {
  // Stripe: lấy clientSecret để dùng với @stripe/react-stripe-js
  async stripeIntent(amountUsd: number, userId: string, itemId: string) {
    const res = await fetch(`${BASE}/api/payment/stripe/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountUsd, userId, itemId }),
    });
    return res.json() as Promise<{ clientSecret: string; intentId: string }>;
  },

  // MoMo: lấy payUrl để redirect
  async momoCreate(amountUsd: number, userId: string, itemId: string) {
    const res = await fetch(`${BASE}/api/payment/momo/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountUsd, userId, itemId }),
    });
    return res.json() as Promise<{ payUrl: string; orderId: string }>;
  },
};
```

---

## 🛍️ Bước 5 — Cập Nhật `ShopPage.tsx`

```tsx
import { paymentClient } from '../../services/paymentClient';
import { useAuthStore } from '../../store/authStore';

// Trong component:
const { user } = useAuthStore();

const handleMomoPay = async (item: ShopItem) => {
  const { payUrl } = await paymentClient.momoCreate(
    item.priceUsd!, user!.id, item.id
  );
  window.location.href = payUrl; // redirect sang MoMo
};

const handleStripePay = async (item: ShopItem) => {
  const { clientSecret } = await paymentClient.stripeIntent(
    item.priceUsd!, user!.id, item.id
  );
  // Mở Stripe Elements modal với clientSecret
  // (dùng @stripe/react-stripe-js)
};
```

---

## 📦 Bước 6 — Thêm `priceUsd` vào `shopData.ts`

```typescript
// Thêm field vào type ShopItem:
interface ShopItem {
  id: string;
  name: string;
  price: number;      // VND — hiển thị
  priceUsd?: number;  // USD — dùng cho Stripe/MoMo backend
  // ...
}

// Ví dụ dữ liệu:
{ id: 'gems_100',  price: 10_000, priceUsd: 0.40 },
{ id: 'gems_500',  price: 45_000, priceUsd: 1.80 },
{ id: 'gems_1200', price: 99_000, priceUsd: 3.96 },
```

---

## 🚀 Bước 7 — Khởi Động

```bash
# Terminal 1 — Backend
cd server
npx tsx src/index.ts

# Terminal 2 — Stripe CLI (nhận webhook local khi dev)
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Terminal 3 — Frontend
npm run dev
```

---

## 📋 Checklist Triển Khai

| # | Việc làm | Trạng thái |
|---|----------|-----------|
| 1 | Tạo thư mục `server/` và cài packages | ⬜ |
| 2 | Copy các file `.ts` từ kế hoạch này | ⬜ |
| 3 | Điền `STRIPE_SECRET_KEY` vào `server/.env` | ⬜ |
| 4 | Điền `MOMO_SECRET_KEY` vào `server/.env` | ⬜ |
| 5 | Chạy backend + Stripe CLI | ⬜ |
| 6 | Tạo `src/services/paymentClient.ts` | ⬜ |
| 7 | Cập nhật `ShopPage.tsx` gọi `paymentClient` | ⬜ |
| 8 | Thêm `priceUsd` vào `shopData.ts` | ⬜ |
| 9 | Test Stripe với thẻ `4242 4242 4242 4242` | ⬜ |
| 10 | Test MoMo với sandbox account | ⬜ |

---

## 🔐 Bảo Mật Tối Thiểu (Đã Tích Hợp Sẵn)

- `helmet()` — HTTP security headers
- `cors({ origin: FRONTEND_URL })` — Chặn cross-origin ngoài danh sách
- Webhook signature verification — Stripe + MoMo đều xác thực HMAC trước khi phát thưởng
- Secret keys chỉ tồn tại ở `server/.env`, không bao giờ commit lên Git

---

> **Lưu ý:** File này không chứa key thật. Chỉ thêm key vào `server/.env` (file đã có trong `.gitignore`).
