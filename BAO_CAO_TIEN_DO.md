# 📊 Báo Cáo Tiến Độ — Math Battle Mobile

> **Cập nhật lần cuối:** 2026-05-11 — Sprint Thanh Toán hoàn tất  
> **Nhánh:** `main` | **Commit:** `6db6222`  
> **Phiên bản:** Pre-production (UI Complete, Payment Framework Done)

---

## 1. 📈 Tổng Quan Tiến Độ

| Module | Hoàn thành | Trạng thái |
|--------|-----------|-----------|
| Game Engine (logic) | ✅ 100% | Ổn định |
| UI / Design System | ✅ 95% | Đang polish |
| AI Opponent | ✅ 90% | Tối ưu hóa |
| Mobile Responsive | ✅ 90% | Đã fix toàn bộ vấn đề layout |
| Tutorial | ✅ 100% | Ổn định |
| Summon / Deck | ✅ 90% | Ổn định |
| Campaign Map | ✅ 80% | Cần test thêm |
| Shop UI | ✅ 85% | Đã kết nối paymentClient |
| **Thanh Toán — Backend Framework** | **✅ 100%** | **Hoàn thành** |
| **Thanh Toán — MoMo Frontend** | **✅ 90%** | **Chờ key để test thật** |
| **Thanh Toán — Stripe Frontend** | **⬜ 20%** | Chưa tích hợp Stripe Elements |
| **Trang /shop/success** | **✅ 100%** | **Hoàn thành** |

---

## 2. 🔧 Công Việc Đã Hoàn Thành

### 2.1 Sprint Thanh Toán (2026-05-11)

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

### 2.2 Sprint UI Mobile (2026-05-11 — Trước đó)

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
| ✅ Webhook signature | Stripe: `constructEvent()`, MoMo: HMAC-SHA256 | `*.webhook.ts` |
| ✅ Secret key isolation | Key chỉ tồn tại trong `server/.env`, không bao giờ ở frontend | `.env` + `.gitignore` |
| ✅ Rate limiting | 10 req/phút/IP cho `/api/payment/*` | `payment.routes.ts` |
| ✅ Input validation | Kiểm tra type, range, và format userId/itemId | `payment.routes.ts` |
| ✅ CORS restriction | Chỉ cho phép `FRONTEND_URL` | `index.ts` |
| ✅ Helmet security headers | Chống XSS, clickjacking, MIME sniffing | `index.ts` |
| ✅ Idempotency (in-memory) | Set `deliveredOrders` chống phát thưởng 2 lần | `reward.service.ts` |
| ✅ Env validation | Server từ chối khởi động nếu thiếu key | `index.ts` |

### 3.2 Cần Bổ Sung Trước Production

> [!CAUTION]
> **Idempotency in-memory sẽ mất khi server restart.** Phải dùng database (Redis/Postgres) trước khi live.

> [!WARNING]
> **localStorage không mã hóa.** Dữ liệu gems/deck có thể bị chỉnh sửa bởi user qua DevTools. Cần server-side validation khi nhận yêu cầu mua hàng.

| Cần làm | Mức độ | Khi nào |
|---------|--------|---------|
| DB persistence cho idempotency | 🔴 Cao | Trước production |
| Server-side gem validation | 🔴 Cao | Trước production |
| HTTPS bắt buộc | 🔴 Cao | Khi deploy |
| Stripe KYC xác minh danh tính | 🟡 Trung | Khi nhận tiền thật |
| MoMo hồ sơ doanh nghiệp | 🟡 Trung | Khi live |
| Audit log giao dịch | 🟡 Trung | Sau production |

---

## 4. 🧠 Logic Đã Kiểm Tra

### 4.1 Luồng Thanh Toán MoMo (đã verify code)

```
User bấm mua
  ↓ MomoPaymentModal.tsx → paymentClient.momoCreate()
  ↓ POST /api/payment/momo/create
  ↓ momo.service.ts → HMAC ký → gọi MoMo API
  ↓ Nhận payUrl → redirect window.location.href
  ↓ User thanh toán trên app MoMo
  ↓ MoMo gọi ipnUrl → POST /api/webhooks/momo
  ↓ momo.webhook.ts → xác thực HMAC → resultCode === 0
  ↓ deliverReward(userId, itemId, orderId)
  ↓ MoMo redirect → /shop/success?resultCode=0&orderId=...
  ↓ ShopSuccessPage.tsx → hiển thị thành công
```

### 4.2 Luồng Thanh Toán Stripe (backend sẵn sàng, frontend chưa hoàn thiện)

```
User bấm mua (Stripe)
  ↓ paymentClient.stripeIntent() → POST /api/payment/stripe/intent
  ↓ stripe.service.ts → PaymentIntent.create()
  ↓ Trả về clientSecret
  ↓ [TODO] Frontend dùng @stripe/react-stripe-js để confirm
  ↓ Stripe gọi → POST /api/webhooks/stripe
  ↓ stripe.webhook.ts → constructEvent() → payment_intent.succeeded
  ↓ deliverReward(userId, itemId, intentId)
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

### Còn Tồn Tại

| ID | Mô tả | Mức độ |
|----|-------|--------|
| BUG-010 | Idempotency mất sau server restart | 🔴 Cao |
| BUG-011 | Stripe Elements chưa tích hợp vào UI | 🟡 Trung |
| BUG-012 | Campaign map chưa test đủ màn hình nhỏ | 🟢 Thấp |
| BUG-013 | Kỹ năng số âm edge case | 🟢 Thấp |

---

## 6. 🗓️ Lịch Công Việc Tiếp Theo

### Sprint Thanh Toán — Giai Đoạn 2 (Testing & Live)

```
[ ] Điền STRIPE_SECRET_KEY + MOMO_SECRET_KEY vào server/.env
[ ] Chạy server: cd server && npm run dev
[ ] Chạy Stripe CLI: stripe listen --forward-to localhost:3001/api/webhooks/stripe
[ ] Test Stripe với thẻ 4242 4242 4242 4242
[ ] Test MoMo sandbox (xem HUONG_DAN_SETUP_PAYMENT.md)
[ ] Deploy backend lên Railway/Render
[ ] Cập nhật FRONTEND_URL về production URL
[ ] Test end-to-end với webhook production
```

### Stripe Elements UI (chưa bắt đầu)

```
[ ] npm install @stripe/react-stripe-js @stripe/stripe-js (trong src/)
[ ] Tạo StripePaymentModal.tsx sử dụng clientSecret từ paymentClient
[ ] Thêm nút "Stripe (Quốc tế)" trong ShopPage bên cạnh MoMo
```

### Database Production (khi cần)

```
[ ] Chọn: Supabase (free) hoặc PlanetScale (free tier)
[ ] Tạo bảng transactions(userId, orderId, itemId, status, createdAt)
[ ] Thay Set<string> trong reward.service.ts bằng DB query
```

---

## 7. 📦 Cấu Trúc File Đã Tạo

```
math-battle-offline-mobile/
├── server/                         ← Backend mới
│   ├── src/
│   │   ├── index.ts               ✅ Express + middleware + env check
│   │   ├── routes/payment.routes.ts ✅ Rate limit + validation
│   │   ├── services/
│   │   │   ├── stripe.service.ts  ✅ PaymentIntent
│   │   │   ├── momo.service.ts    ✅ HMAC + create order
│   │   │   └── reward.service.ts  ✅ deliverReward + idempotency
│   │   ├── webhooks/
│   │   │   ├── stripe.webhook.ts  ✅ Verify + dispatch reward
│   │   │   └── momo.webhook.ts    ✅ HMAC verify + dispatch
│   │   └── utils/currency.ts      ✅ USD/VND/Cents
│   ├── .env.example               ✅ Template với hướng dẫn
│   ├── package.json               ✅
│   └── tsconfig.json              ✅ 0 TypeScript errors
│
└── src/
    ├── services/paymentClient.ts  ✅ Frontend API wrapper
    ├── types/shop.types.ts        ✅ + priceUsd field
    ├── data/shopData.ts           ✅ + priceUsd cho 13 cash items
    ├── components/features/
    │   └── MomoPaymentModal.tsx   ✅ Gọi backend + fallback simulate
    └── pages/Shop/
        └── ShopSuccessPage.tsx    ✅ Trang sau redirect MoMo
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

> **Repository:** `github.com/DatSpirit/math-battle-offline-mobile`  
> **Nhánh production:** `main`  
> **Commit mới nhất:** `6db6222` — feat: wire frontend payment client
