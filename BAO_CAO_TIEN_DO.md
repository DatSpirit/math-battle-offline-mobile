# 📊 Báo Cáo Tiến Độ — Math Battle Mobile

> **Cập nhật lần cuối:** 2026-05-17 — Sprint 7 (PvP + Payment Integration) hoàn tất  
> **Nhánh:** `main`  
> **Phiên bản:** Pre-production (Full Stack: Payment + Auth + PvP + Balance)

---

## 1. 📈 Tổng Quan Tiến Độ

| Module | Hoàn thành | Trạng thái |
|--------|-----------|-----------|
| Game Engine (logic) | ✅ 100% | Ổn định |
| UI / Design System | ✅ 95% | Đang polish |
| AI Opponent | ✅ 90% | Tối ưu hóa |
| Mobile Responsive | ✅ 95% | Fix Tailwind class |
| Tutorial | ✅ 100% | Ổn định |
| Summon / Deck | ✅ 90% | Ổn định |
| Campaign Map | ✅ 80% | Cần test thêm |
| Shop UI | ✅ 85% | Đã kết nối paymentClient |
| **Thanh Toán — Backend v2** | **✅ 100%** | **DB + Zod + Order lifecycle** |
| **Thanh Toán — MoMo Frontend** | **✅ 90%** | **Chờ key để test thật** |
| **Thanh Toán — Stripe Frontend** | **⬜ 20%** | Chưa tích hợp Stripe Elements |
| **Trang /shop/success** | **✅ 100%** | **Backend polling + fallback** |
| **Database (Prisma + SQLite)** | **✅ 100%** | **Order + User + PvpRoom models** |
| **API Validation (Zod)** | **✅ 100%** | **Schema-based validation** |
| **Auth (Supabase)** | **✅ 100%** | **Google + Email + Offline** |
| **Data Sync (Offline-First)** | **✅ 100%** | **MAX merge + debounce 3s** |
| **Leaderboard** | **✅ 100%** | **Top 100 + "around me"** |
| **PvP Engine (Server)** | **✅ 100%** | **Socket.IO + anti-cheat + ELO** |
| **PvP UI (Frontend)** | **✅ 100%** | **Lobby → Battle → Result** |
| **Payment → User Balance** | **✅ 100%** | **Atomic reward delivery** |

---

## 2. 🔧 Công Việc Đã Hoàn Thành

### 2.1 Sprint 1–7: PvP + Auth + Payment Integration (2026-05-17)

#### Sprint 1: Supabase Auth
| Hạng mục | Mô tả |
|----------|-------|
| Supabase Auth SDK | Google OAuth + Email/Password |
| 3-Tab Onboarding | Offline / Đăng Nhập / Đăng Ký |
| Server Middleware | JWT verification via `getUser()` |
| User Profile API | `/api/auth/{register,me,profile}` |

#### Sprint 2: Offline-First Data Sync
| Hạng mục | Mô tả |
|----------|-------|
| Safe Merge Strategy | `MAX(coins,gems,level,xp)` — không mất tài sản |
| Server-only fields | `elo`, `wins` — chống hack |
| Frontend debounce | 3s delay + offline queue |

#### Sprint 3: Leaderboard
| Hạng mục | Mô tả |
|----------|-------|
| Public ranking | Top 100 by ELO |
| "Around me" | 5 trên + 5 dưới rank mình (auth required) |

#### Sprint 4–5: PvP Game Engine + Socket.IO
| Hạng mục | Mô tả |
|----------|-------|
| Quick Match | In-memory matchmaking queue |
| Turn-based PvP | 6 turns, server-dealt hands |
| Anti-cheat | Server validates card ownership + play legality |
| ELO Calculator | K=32 standard, atomic DB transactions |
| Disconnect Recovery | 30s window to reconnect |
| Turn Timer | 65s timeout → auto-forfeit |

#### Sprint 6: Frontend PvP UI
| Hạng mục | Mô tả |
|----------|-------|
| PvPPage.tsx | 5 phases: Idle → Searching → Found → Playing → GameOver |
| pvpStore.ts | Zustand store managing Socket.IO lifecycle |
| Home PvP Card | "PvP Arena" button with 🔴 LIVE / 🔒 OFFLINE badge |
| Animations | Framer Motion transitions between all phases |

#### Sprint 7: Payment → User Balance
| Hạng mục | Mô tả |
|----------|-------|
| Atomic Rewards | `prisma.$transaction` → order success + gem increment + flag |
| Balance API | `GET /api/balance` — server-authoritative gems/coins |
| Prisma v7 Adapter | `@prisma/adapter-better-sqlite3` for runtime |

#### Files tạo mới (Sprint 1–7)

| File | Sprint | Mô tả |
|------|--------|-------|
| `server/src/lib/prisma.ts` | 1 | Shared PrismaClient + better-sqlite3 adapter |
| `server/src/middleware/auth.middleware.ts` | 1 | JWT verification |
| `server/src/services/auth.service.ts` | 1 | User CRUD |
| `server/src/routes/auth.routes.ts` | 1 | Auth endpoints |
| `server/src/services/sync.service.ts` | 2 | Safe merge |
| `server/src/routes/sync.routes.ts` | 2 | Sync endpoints |
| `server/src/routes/leaderboard.routes.ts` | 3 | Ranking |
| `server/src/routes/balance.routes.ts` | 7 | Balance API |
| `server/src/pvp/eloCalculator.ts` | 4 | ELO system |
| `server/src/pvp/validator.ts` | 4 | Anti-cheat |
| `server/src/pvp/gameHandler.ts` | 5 | Socket.IO PvP |
| `src/lib/supabase.ts` | 1 | Supabase client |
| `src/store/slices/syncSlice.ts` | 2 | Debounced sync |
| `src/store/pvpStore.ts` | 6 | PvP Zustand store |
| `src/pages/PvP/PvPPage.tsx` | 6 | PvP page |
| `src/pages/PvP/PvP.css` | 6 | PvP styles |

#### Files sửa đổi (Sprint 1–7)

| File | Thay đổi |
|------|----------|
| `server/src/index.ts` | +Socket.IO, +auth/sync/leaderboard/balance routes |
| `server/prisma/schema.prisma` | +User, +PvpRoom models |
| `server/src/services/reward.service.ts` | v3: atomic Prisma transaction |
| `src/store/authStore.ts` | +signInWithEmail state, +signUpWithEmail state, +initAuthListener |
| `src/store/playerStore.ts` | +auto-sync subscription |
| `src/App.tsx` | +PvP route, +initAuthListener |
| `src/pages/Home/MobileHomePage.tsx` | +PvP Arena card |
| `src/pages/Onboarding/OnboardingPage.tsx` | +3-tab auth UI |
| `src/pages/Onboarding/Onboarding.css` | +auth tab styles |

#### Dependencies mới

| Package | Loại | Mục đích |
|---------|------|----------|
| `@supabase/supabase-js` | Both | Auth SDK |
| `socket.io` | Server | PvP realtime |
| `socket.io-client` | Frontend | PvP client |
| `jsonwebtoken` | Server | JWT parsing |
| `@prisma/adapter-better-sqlite3` | Server | Prisma v7 SQLite driver |

---

### 2.2 Sprint Database & Security (2026-05-17 — Trước đó)

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

---

## 3. 🔐 Bảo Mật

### 3.1 Đã Triển Khai

| Biện pháp | Mô tả | File |
|-----------|-------|------|
| ✅ Webhook signature | Stripe: `constructEvent()`, MoMo: HMAC-SHA256 | `*.webhook.ts` |
| ✅ Secret key isolation | Key chỉ tồn tại trong `server/.env` | `.env` + `.gitignore` |
| ✅ Rate limiting | 10 req/phút/IP cho `/api/payment/*` | `payment.routes.ts` |
| ✅ Input validation (Zod) | Schema-based validation | `payment.routes.ts` |
| ✅ CORS restriction | Chỉ cho phép `FRONTEND_URL` | `index.ts` |
| ✅ Helmet security headers | Chống XSS, clickjacking | `index.ts` |
| ✅ Idempotency (database) | Prisma `order.rewardDelivered` | `order.service.ts` |
| ✅ JWT Auth Middleware | Supabase `getUser()` verify | `auth.middleware.ts` |
| ✅ Server-side ELO | Client không hack được elo/wins | `sync.service.ts` |
| ✅ Anti-cheat PvP | Server validates card ownership | `validator.ts` |
| ✅ Atomic rewards | `prisma.$transaction` cho payment | `reward.service.ts` |
| ✅ Server-side balance | `GET /api/balance` authoritative | `balance.routes.ts` |

### 3.2 Cần Bổ Sung Trước Production

| Cần làm | Mức độ | Khi nào |
|---------|--------|---------|
| HTTPS bắt buộc | 🔴 Cao | Khi deploy |
| Stripe KYC xác minh | 🟡 Trung | Khi nhận tiền thật |
| MoMo hồ sơ doanh nghiệp | 🟡 Trung | Khi live |
| Chuyển SQLite → PostgreSQL | 🟡 Trung | Khi deploy production |

---

## 4. 🏗️ Kiến Trúc Hệ Thống

```
┌──────────────────────────────────────────────┐
│              FRONTEND (Vite + React)          │
│                                               │
│  authStore ──→ Supabase Auth (Google/Email)   │
│  playerStore ──→ syncSlice (debounce 3s)      │
│  pvpStore ──→ Socket.IO Client                │
│  paymentClient ──→ REST API                   │
└─────────────────┬─────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │   Express + Socket.IO   │
        │   (http://localhost:3001)   │
        ├─────────────────────────┤
        │  REST:                  │
        │    /api/auth/*         │
        │    /api/sync           │
        │    /api/leaderboard/*  │
        │    /api/balance        │
        │    /api/payment/*      │
        │    /api/webhooks/*     │
        ├─────────────────────────┤
        │  Socket.IO:             │
        │    quick_match          │
        │    submit_cards         │
        │    turn_start/result    │
        │    game_over            │
        └─────────┬───────────────┘
                  │
        ┌─────────┴──────────┐
        │  Prisma + SQLite    │
        │  (Order, User, PvP) │
        └────────────────────┘
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
| BUG-010 | Idempotency mất sau server restart | 2026-05-17 |
| **BUG-017** | **Prisma v7 PrismaClient cần adapter** | **2026-05-17** |
| **BUG-018** | **Login không hoạt động sau đăng ký** | **2026-05-17** |
| **BUG-019** | **initAuthListener chưa bao giờ được gọi** | **2026-05-17** |
| **BUG-020** | **signUpWithEmail không set local state** | **2026-05-17** |
| **BUG-021** | **PvPPage setState in useEffect warning** | **2026-05-17** |

### Còn Tồn Tại

| ID | Mô tả | Mức độ | Kế hoạch |
|----|-------|--------|----------|
| BUG-011 | Stripe Elements chưa tích hợp vào UI | 🟡 Trung | Sprint Stripe Elements |
| BUG-012 | Campaign map chưa test đủ màn hình nhỏ | 🟢 Thấp | QA Sprint |
| BUG-013 | Kỹ năng có thể tạo giá trị trung gian âm | 🟢 Thấp | Đã có guard |

---

## 6. 🗓️ Lịch Công Việc Tiếp Theo

### Sprint Stripe Elements UI (Ưu tiên cao)

```
[ ] npm install @stripe/react-stripe-js @stripe/stripe-js
[ ] Tạo StripePaymentModal.tsx
[ ] Test với thẻ test 4242 4242 4242 4242
```

### Sprint Production Deploy (Ưu tiên trung)

```
[ ] Chuyển DATABASE_URL từ SQLite → PostgreSQL
[ ] Deploy backend lên Railway/Render
[ ] Enable HTTPS
[ ] Thay test keys bằng live keys
```

---

## 7. 📦 Cấu Trúc File

```
math-battle-offline-mobile/
├── server/                              ← Backend Full Stack
│   ├── prisma/
│   │   └── schema.prisma               ✅ Order + User + PvpRoom
│   ├── src/
│   │   ├── index.ts                    ✅ Express + Socket.IO + all routes
│   │   ├── lib/prisma.ts              ✅ Prisma v7 + better-sqlite3 adapter
│   │   ├── middleware/auth.middleware   ✅ JWT verification
│   │   ├── routes/
│   │   │   ├── payment.routes.ts      ✅ Zod + rate limit
│   │   │   ├── auth.routes.ts         ✅ Register/Me/Profile
│   │   │   ├── sync.routes.ts         ✅ Offline-first sync
│   │   │   ├── leaderboard.routes.ts  ✅ Top 100 + around me
│   │   │   └── balance.routes.ts      ✅ Server-side balance
│   │   ├── services/
│   │   │   ├── auth.service.ts        ✅ User CRUD
│   │   │   ├── sync.service.ts        ✅ MAX merge
│   │   │   ├── order.service.ts       ✅ Order lifecycle
│   │   │   ├── reward.service.ts      ✅ v3: atomic Prisma rewards
│   │   │   ├── stripe.service.ts      ✅ PaymentIntent
│   │   │   └── momo.service.ts        ✅ HMAC signing
│   │   ├── pvp/
│   │   │   ├── gameHandler.ts         ✅ Socket.IO matchmaking + game
│   │   │   ├── validator.ts           ✅ Anti-cheat
│   │   │   └── eloCalculator.ts       ✅ ELO K=32
│   │   └── webhooks/                  ✅ Stripe + MoMo
│   └── package.json
│
└── src/
    ├── lib/supabase.ts                ✅ Supabase client
    ├── store/
    │   ├── authStore.ts               ✅ Online + offline auth
    │   ├── playerStore.ts             ✅ Auto-sync subscription
    │   ├── pvpStore.ts                ✅ Socket.IO PvP state
    │   └── slices/syncSlice.ts        ✅ Debounced sync
    ├── pages/
    │   ├── PvP/PvPPage.tsx            ✅ 5-phase PvP UI
    │   ├── Onboarding/OnboardingPage  ✅ 3-tab auth
    │   └── Home/MobileHomePage.tsx     ✅ +PvP Arena card
    └── App.tsx                        ✅ +PvP route + auth listener
```

---

## 8. 📱 Thiết Bị Đã Test

| Thiết bị | OS | Kết quả |
|----------|----|---------| 
| iPhone 14 Pro (simulator) | iOS 17 | ✅ Ổn |
| iPhone SE 2020 (simulator) | iOS 16 | ✅ Ổn |
| Samsung Galaxy S21 (thật) | Android 13 | ✅ Ổn |
| Chrome Desktop 1440px | - | ✅ Ổn |
| Chrome Mobile 390px | - | ✅ Ổn |

---

## 9. 🔄 Lịch Sử Cập Nhật

| Ngày | Sprint | Highlights |
|------|--------|------------|
| **2026-05-17** | **Sprint 1–7: PvP + Auth + Balance** | **Supabase Auth, Data Sync, Leaderboard, PvP Socket.IO, Frontend PvP UI, Atomic Reward Delivery, Balance API** |
| 2026-05-17 | Database & Security | Prisma, Zod, DB idempotency, MoMo IPN fix, order polling |
| 2026-05-11 | Thanh Toán v1 | Backend framework, MoMo frontend, ShopSuccessPage |
| 2026-05-11 | UI Mobile | Fix 6 layout bugs (BUG-001 → BUG-006) |
| 2026-05-10 | AI & UX | AI fallback, safe area iOS |

---

> **Repository:** `github.com/DatSpirit/math-battle-offline-mobile`  
> **Nhánh production:** `main`  
> **TypeScript:** ✅ 0 errors (cả frontend + backend)  
> **Server:** ✅ Chạy thành công trên localhost:3001
