# 📊 Báo Cáo Tiến Độ — Math Battle Mobile

> **Cập nhật lần cuối:** 2026-05-17 — Sprint Database & Security hoàn tất  
> **Nhánh:** `main`  
> **Phiên bản:** Pre-production (Payment v2 + Database Persistence)

---

## 1. 📈 Tổng Quan Tiến Độ

| Module | Hoàn thành | Trạng thái |
|--------|-----------|-----------|
| Game Engine (logic) | ✅ 100% | Ổn định |
| UI / Design System | ✅ 95% | Đang polish |
| AI Opponent | ✅ 90% | Tối ưu hóa |
| Mobile Responsive | ✅ 95% | Fix Tailwind class (shrink-0, h-dvh) |
| Tutorial | ✅ 100% | Ổn định |
| Summon / Deck | ✅ 90% | Ổn định |
| Campaign Map | ✅ 80% | Cần test thêm |
| Shop UI | ✅ 85% | Đã kết nối paymentClient |
| **Thanh Toán — Backend v2** | **✅ 100%** | **DB + Zod + Order lifecycle** |
| **Thanh Toán — MoMo Frontend** | **✅ 90%** | **Chờ key để test thật** |
| **Thanh Toán — Stripe Frontend** | **⬜ 20%** | Chưa tích hợp Stripe Elements |
| **Trang /shop/success** | **✅ 100%** | **Backend polling + fallback** |
| **Database (Prisma + SQLite)** | **✅ 100%** | **Order model, migration done** |
| **API Validation (Zod)** | **✅ 100%** | **Schema-based validation** |

---

## 2. 🔧 Công Việc Đã Hoàn Thành

### 2.1 Sprint Database & Security (2026-05-17)

> **Mục tiêu:** Nâng cấp từ `tích hợp cổng thanh toán.md` (v1) lên `payment_plan_v2.md` (v2)

#### Cải tiến Backend

| Hạng mục | v1 (cũ) | v2 (mới) |
|----------|---------|----------|
| Idempotency | In-memory `Set` — mất khi restart | Prisma DB `order.rewardDelivered` |
| Order tracking | Không có | Bảng `Order` với lifecycle PENDING → SUCCESS/FAILED |
| Stripe dedup | Không có | `idempotencyKey = orderId` |
| MoMo signature | `Object.keys().sort()` — SAI | Thứ tự field cố định theo docs MoMo IPN v2 |
| Input validation | Manual check | Zod schema `CreatePaymentSchema` |
| Order polling | Không có | `GET /api/payment/order/:orderId` |
| Frontend verify | URL params chỉ | Polling backend 2s × 15 lần + fallback URL |

#### File đã thay đổi

| File | Chức năng | Thay đổi |
|------|-----------|----------|
| `prisma/schema.prisma` | Order model (14 fields) | ✨ New |
| `src/services/order.service.ts` | CRUD Order: create, get, markSuccess, markFailed, markRewardDelivered | ✨ New |
| `src/services/reward.service.ts` | DB-backed idempotency, mở rộng REWARD_MAP | ✏️ Rewritten |
| `src/services/stripe.service.ts` | Tạo DB order → Stripe intent → lưu intentId | ✏️ Rewritten |
| `src/services/momo.service.ts` | Tạo DB order → MoMo API → orderId trong extraData | ✏️ Rewritten |
| `src/webhooks/stripe.webhook.ts` | Truyền orderId từ metadata cho idempotency | ✏️ Updated |
| `src/webhooks/momo.webhook.ts` | Fixed field order cho HMAC signature | ✏️ Rewritten |
| `src/routes/payment.routes.ts` | Zod validation + `GET /order/:orderId` | ✏️ Rewritten |
| `src/index.ts` | Log endpoint mới + eslint fix | ✏️ Minor |
| `.env` / `.env.example` | Thêm `DATABASE_URL` | ✏️ Updated |

#### File Frontend đã thay đổi

| File | Thay đổi |
|------|----------|
| `services/paymentClient.ts` | Thêm `orderStatus()` method + GET helper |
| `pages/Shop/ShopSuccessPage.tsx` | Backend polling 2s × 15 + progress bar + fallback |
| `pages/Game/GamePage.tsx` | Fix Tailwind: `flex-shrink-0` → `shrink-0`, `h-[100dvh]` → `h-dvh` |

#### Dependencies mới

| Package | Loại | Mục đích |
|---------|------|----------|
| `@prisma/client` | Runtime | ORM — query database |
| `prisma` | Dev | CLI — migration, generate |
| `zod` | Runtime | Schema validation cho API |

---

### 2.2 Sprint Thanh Toán (2026-05-11)

#### Backend Server (`server/`)

| File | Chức năng | Trạng thái |
|------|-----------|-----------|
| `src/index.ts` | Express server, kiểm tra env bắt buộc khi khởi động | ✅ |
| `src/utils/currency.ts` | USD ↔ VND ↔ Cents | ✅ |
| `src/services/stripe.service.ts` | Tạo PaymentIntent với Stripe SDK | ✅ |
| `src/services/momo.service.ts` | Tạo lệnh thanh toán + ký HMAC-SHA256 | ✅ |
| `src/services/reward.service.ts` | Phát thưởng có idempotency check | ✅ |
| `src/webhooks/stripe.webhook.ts` | Xác thực Stripe signature, gọi deliverReward | ✅ |
| `src/webhooks/momo.webhook.ts` | Xác thực MoMo HMAC, gọi deliverReward | ✅ |
| `src/routes/payment.routes.ts` | Rate limiting (10 req/phút) + input validation | ✅ |
| `.env.example` | Template — chỉ cần điền 2 key để chạy | ✅ |
| `tsconfig.json` / `package.json` | TypeScript 0 errors khi compile | ✅ |

#### Frontend (`src/`)

| File | Thay đổi | Trạng thái |
|------|---------|-----------|
| `services/paymentClient.ts` | Typed fetch wrapper cho cả Stripe + MoMo | ✅ |
| `types/shop.types.ts` | Thêm `priceUsd?: number` vào `ShopItem` | ✅ |
| `data/shopData.ts` | Thêm `priceUsd` cho 13 item `currency:'cash'` | ✅ |
| `features/MomoPaymentModal.tsx` | Gọi backend thật; fallback simulate khi chưa có key | ✅ |
| `pages/Shop/ShopSuccessPage.tsx` | Trang redirect sau thanh toán MoMo | ✅ |
| `App.tsx` | Thêm route `/shop/success` | ✅ |

---

### 2.3 Sprint UI Mobile (2026-05-11 — Trước đó)

| Bug | File sửa | Giải pháp |
|-----|---------|-----------|
| BUG-001: Slots tràn ngang trên iPhone SE | `Game.css` | `flex-wrap + clamp(54px, 18vw, 100px)` |
| BUG-002: Tay bài bị cắt mất đầu thẻ | `Game.css` | `padding-top: 12px + overflow-y: visible` |
| BUG-003: Thẻ úp đối thủ to hơn thẻ mở | `Card.tsx` | Xóa `w-[76px] h-[106px]` Tailwind cứng |
| BUG-004: Hiệu ứng kỹ năng bị cắt bởi overflow | `ArenaSlot.tsx`, `Game.css` | `overflow: visible + overflow-x: clip` |
| BUG-005: GameOverModal dark theme lệch app | `GameOverModal.css` | Đổi sang nền kem `#faf9f4` + text `#1c1c0f` |
| BUG-006: RoundResultModal tràn màn hình | `RoundResultModal.css` | `max-height: calc(100dvh - 24px)` |

---

## 3. 🔐 Bảo Mật

### 3.1 Đã Triển Khai

| Biện pháp | Mô tả | File |
|-----------|-------|------|
| ✅ Webhook signature | Stripe: `constructEvent()`, MoMo: HMAC-SHA256 (fixed field order) | `*.webhook.ts` |
| ✅ Secret key isolation | Key chỉ tồn tại trong `server/.env`, không bao giờ ở frontend | `.env` + `.gitignore` |
| ✅ Rate limiting | 10 req/phút/IP cho `/api/payment/*` | `payment.routes.ts` |
| ✅ Input validation (Zod) | Schema-based: type, range, format cho amountUsd/userId/itemId | `payment.routes.ts` |
| ✅ CORS restriction | Chỉ cho phép `FRONTEND_URL` | `index.ts` |
| ✅ Helmet security headers | Chống XSS, clickjacking, MIME sniffing | `index.ts` |
| ✅ Idempotency (database) | Prisma `order.rewardDelivered` — persist qua restart | `order.service.ts` |
| ✅ Stripe idempotencyKey | `orderId` ngăn duplicate PaymentIntent | `stripe.service.ts` |
| ✅ Env validation | Server từ chối khởi động nếu thiếu key | `index.ts` |
| ✅ Audit trail (DB) | Bảng `Order` lưu mọi giao dịch + timestamps | `schema.prisma` |

### 3.2 Cần Bổ Sung Trước Production

> [!WARNING]
> **localStorage không mã hóa.** Dữ liệu gems/deck có thể bị chỉnh sửa bởi user qua DevTools. Cần server-side validation khi nhận yêu cầu mua hàng.

| Cần làm | Mức độ | Khi nào |
|---------|--------|---------|
| Server-side gem balance validation | 🔴 Cao | Trước production |
| HTTPS bắt buộc | 🔴 Cao | Khi deploy |
| Stripe KYC xác minh danh tính | 🟡 Trung | Khi nhận tiền thật |
| MoMo hồ sơ doanh nghiệp | 🟡 Trung | Khi live |
| Chuyển SQLite → PostgreSQL | 🟡 Trung | Khi deploy production |

---

## 4. 🧠 Logic Đã Kiểm Tra

### 4.1 Luồng Thanh Toán MoMo (v2 — database-backed)

```
User bấm mua
  ↓ MomoPaymentModal.tsx → paymentClient.momoCreate()
  ↓ POST /api/payment/momo/create (Zod validate)
  ↓ order.service.ts → createOrder(status=PENDING)
  ↓ momo.service.ts → HMAC ký (fixed field order) → gọi MoMo API
  ↓ Nhận payUrl → redirect window.location.href
  ↓ User thanh toán trên app MoMo
  ↓ MoMo gọi ipnUrl → POST /api/webhooks/momo
  ↓ momo.webhook.ts → xác thực HMAC → resultCode === 0
  ↓ deliverReward(userId, itemId, orderId, transId)
  ↓   → check DB: order.rewardDelivered? → markOrderSuccess → markRewardDelivered
  ↓ MoMo redirect → /shop/success?orderId=MB_xxx
  ↓ ShopSuccessPage.tsx → poll GET /api/payment/order/:orderId (2s × 15)
  ↓ Backend trả {status:'SUCCESS', rewardDelivered:true}
  ↓ Hiển thị thành công + auto-redirect shop sau 3s
```

### 4.2 Luồng Thanh Toán Stripe (v2 — backend sẵn sàng, frontend chưa hoàn thiện)

```
User bấm mua (Stripe)
  ↓ paymentClient.stripeIntent() → POST /api/payment/stripe/intent (Zod validate)
  ↓ order.service.ts → createOrder(status=PENDING)
  ↓ stripe.service.ts → PaymentIntent.create(idempotencyKey=orderId)
  ↓ Lưu intentId vào DB
  ↓ Trả về clientSecret + orderId
  ↓ [TODO] Frontend dùng @stripe/react-stripe-js để confirm
  ↓ Stripe gọi → POST /api/webhooks/stripe
  ↓ stripe.webhook.ts → constructEvent() → payment_intent.succeeded
  ↓ deliverReward(userId, itemId, orderId, intentId)
  ↓   → check DB: order.rewardDelivered? → markOrderSuccess → markRewardDelivered
```

---

## 5. 🐛 Bug Tracker

### Đã Fix

| ID | Mô tả | Ngày |
|----|-------|------|
| BUG-001 | Slots tràn ngang trên iPhone SE | 2026-05-11 |
| BUG-002 | Tay bài bị cắt mất đầu thẻ | 2026-05-11 |
| BUG-003 | Thẻ úp đối thủ to hơn thẻ mở | 2026-05-11 |
| BUG-004 | Hiệu ứng kỹ năng bị cắt bởi overflow | 2026-05-11 |
| BUG-005 | GameOverModal dark theme lệch app | 2026-05-11 |
| BUG-006 | RoundResultModal tràn màn hình | 2026-05-11 |
| BUG-007 | AI bỏ cuộc khi không có lượt hợp lệ | 2026-05-10 |
| BUG-008 | Safe area không áp dụng trên iOS | 2026-05-10 |
| BUG-009 | Duplicate Transaction interface trong shop.types.ts | 2026-05-11 |
| **BUG-010** | **Idempotency mất sau server restart** | **2026-05-17** |
| **BUG-014** | **Tailwind deprecated class `flex-shrink-0`** | **2026-05-17** |
| **BUG-015** | **Tailwind verbose class `h-[100dvh]`** | **2026-05-17** |
| **BUG-016** | **ESLint: `_next` unused in error handler** | **2026-05-17** |

### Còn Tồn Tại

| ID | Mô tả | Mức độ | Kế hoạch |
|----|-------|--------|----------|
| BUG-011 | Stripe Elements chưa tích hợp vào UI | 🟡 Trung | Sprint Stripe Elements |
| BUG-012 | Campaign map chưa test đủ màn hình nhỏ | 🟢 Thấp | QA Sprint |
| BUG-013 | Kỹ năng có thể tạo giá trị trung gian âm | 🟢 Thấp | Đã có guard `Math.max(0)` ở finalize |

---

## 6. 🗓️ Lịch Công Việc Tiếp Theo

### Sprint Stripe Elements UI (Ưu tiên cao)

```
[ ] npm install @stripe/react-stripe-js @stripe/stripe-js
[ ] Tạo StripePaymentModal.tsx sử dụng clientSecret từ paymentClient
[ ] Thêm nút "Stripe (Quốc tế)" trong ShopPage bên cạnh MoMo
[ ] Test với thẻ test 4242 4242 4242 4242
[ ] Thêm redirect tới /shop/success?orderId=... sau payment
```

### Sprint Testing & Live (Ưu tiên cao)

```
[ ] Điền STRIPE_SECRET_KEY + MOMO_SECRET_KEY thật vào server/.env
[ ] Chạy server: cd server && npm run dev
[ ] Chạy Stripe CLI: stripe listen --forward-to localhost:3001/api/webhooks/stripe
[ ] Test end-to-end Stripe: intent → pay → webhook → reward → poll
[ ] Test MoMo sandbox: create → redirect → IPN → reward → poll
[ ] Verify idempotency: gọi webhook 2 lần → reward chỉ phát 1 lần
```

### Sprint Production Deploy (Ưu tiên trung)

```
[ ] Chuyển DATABASE_URL từ SQLite sang PostgreSQL (Supabase/Neon free tier)
[ ] npx prisma migrate deploy (production)
[ ] Deploy backend lên Railway/Render
[ ] Cập nhật FRONTEND_URL + ipnUrl về production domain
[ ] Enable HTTPS
[ ] Test end-to-end với webhook production
[ ] Thay test keys bằng live keys
```

### Sprint Server-side Validation (Ưu tiên trung)

```
[ ] Tạo bảng UserBalance (gems, coins) trong Prisma schema
[ ] Xác thực gem balance trước khi tạo order (chống hack localStorage)
[ ] API endpoint GET /api/user/:userId/balance
[ ] Sync frontend store với backend balance sau mỗi giao dịch
```

---

## 7. 📦 Cấu Trúc File

```
math-battle-offline-mobile/
├── server/                             ← Backend Payment v2
│   ├── prisma/
│   │   ├── schema.prisma              ✅ Order model + prisma-client-js
│   │   └── migrations/                ✅ SQLite migration
│   ├── src/
│   │   ├── index.ts                   ✅ Express + middleware + env check
│   │   ├── generated/prisma/          ⚙️ Auto-generated (prisma generate)
│   │   ├── routes/payment.routes.ts   ✅ Zod validation + rate limit + polling
│   │   ├── services/
│   │   │   ├── order.service.ts       ✅ Prisma CRUD — Order lifecycle
│   │   │   ├── stripe.service.ts      ✅ PaymentIntent + idempotencyKey
│   │   │   ├── momo.service.ts        ✅ HMAC + orderId in extraData
│   │   │   └── reward.service.ts      ✅ DB-backed idempotency
│   │   ├── webhooks/
│   │   │   ├── stripe.webhook.ts      ✅ Verify + orderId dispatch
│   │   │   └── momo.webhook.ts        ✅ Fixed field order HMAC
│   │   └── utils/currency.ts          ✅ USD/VND/Cents
│   ├── .env.example                   ✅ Template với DATABASE_URL
│   ├── prisma.config.ts               ✅ Prisma v7 config
│   ├── package.json                   ✅ +@prisma/client, zod, prisma
│   └── tsconfig.json                  ✅ 0 TypeScript errors
│
└── src/
    ├── services/paymentClient.ts      ✅ + orderStatus() polling method
    ├── types/shop.types.ts            ✅ + priceUsd field
    ├── data/shopData.ts               ✅ + priceUsd cho 13 cash items
    ├── components/features/
    │   └── MomoPaymentModal.tsx       ✅ Gọi backend + fallback simulate
    ├── pages/Shop/
    │   ├── ShopPage.tsx               ✅ Shop UI
    │   └── ShopSuccessPage.tsx        ✅ Backend polling + fallback
    └── pages/Game/
        └── GamePage.tsx               ✅ Fixed Tailwind deprecated classes
```

---

## 8. 📱 Thiết Bị Đã Test

| Thiết bị | OS | Kết quả |
|----------|----|---------| 
| iPhone 14 Pro (simulator) | iOS 17 | ✅ Ổn |
| iPhone SE 2020 (simulator) | iOS 16 | ✅ Ổn sau BUG-001 |
| Samsung Galaxy S21 (thật) | Android 13 | ✅ Ổn |
| Chrome Desktop 1440px | - | ✅ Ổn |
| Chrome Mobile 390px | - | ✅ Ổn |

---

## 9. 🔄 Lịch Sử Cập Nhật

| Ngày | Sprint | Highlights |
|------|--------|------------|
| 2026-05-17 | Database & Security | Prisma, Zod, DB idempotency, MoMo IPN fix, order polling |
| 2026-05-11 | Thanh Toán v1 | Backend framework, MoMo frontend, ShopSuccessPage |
| 2026-05-11 | UI Mobile | Fix 6 layout bugs (BUG-001 → BUG-006) |
| 2026-05-10 | AI & UX | AI fallback, safe area iOS |

---

> **Repository:** `github.com/DatSpirit/math-battle-offline-mobile`  
> **Nhánh production:** `main`  
> **TypeScript:** ✅ 0 errors (cả frontend + backend)  
> **IDE Problems:** ✅ 0 errors, 0 warnings
