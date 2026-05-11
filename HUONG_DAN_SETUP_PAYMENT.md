# 🚀 Hướng Dẫn Setup Thanh Toán — Math Battle

> **Thời gian setup:** ~15 phút  
> **Yêu cầu:** Node.js 18+, npm

---

## Tổng Quan

```
Bạn cần làm 2 việc:
  1. Lấy API key từ Stripe hoặc MoMo
  2. Điền key vào server/.env rồi chạy server
```

---

## PHẦN A — STRIPE (Quốc tế, duyệt ngay)

### A1. Đăng ký / Lấy key

1. Vào **[dashboard.stripe.com](https://dashboard.stripe.com)**
2. Đăng ký tài khoản (email + số điện thoại)
3. Vào **Developers → API Keys**
4. Copy **Secret key** (bắt đầu bằng `sk_test_...`)

```
⚠️ Dùng sk_test_... để test, KHÔNG dùng sk_live_... cho đến khi sẵn sàng nhận tiền thật
```

### A2. Cài Stripe CLI (để nhận webhook local)

**Windows:**
```powershell
# Tải installer tại: https://stripe.com/docs/stripe-cli
# Hoặc dùng Scoop:
scoop install stripe
```

**Đăng nhập Stripe CLI:**
```bash
stripe login
```

### A3. Lấy Webhook Secret

Chạy lệnh này trong terminal riêng (giữ mở khi test):
```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

Kết quả:
```
> Ready! Your webhook signing secret is whsec_abc123...  ← copy cái này
```

---

## PHẦN B — MOMO (Việt Nam)

### B1. Lấy key Sandbox (dùng ngay, không cần đăng ký)

MoMo cung cấp sẵn key sandbox cho developer:

```
MOMO_PARTNER_CODE = MOMO_ATM_TEST           ← đã có sẵn trong .env.example
MOMO_ACCESS_KEY   = F8BBA842ECF85            ← đã có sẵn trong .env.example
MOMO_SECRET_KEY   = bb97e977ea1e...          ← xem bên dưới
MOMO_ENDPOINT     = https://test-payment.momo.vn
```

**Lấy MOMO_SECRET_KEY sandbox chính xác:**
1. Vào **[developers.momo.vn](https://developers.momo.vn)**
2. Đăng nhập hoặc tạo tài khoản
3. Vào **Sandbox → Thông tin tích hợp**
4. Copy **secretKey**

> **Nếu không có tài khoản MoMo Developer:**  
> Dùng key sandbox public này (chỉ để test, có thể bị thay đổi):  
> `MOMO_SECRET_KEY=bb97e977ea1eda44a3f85ac019e18b2481cae392`

### B2. Số điện thoại test MoMo Sandbox

| SĐT | Kết quả |
|-----|---------|
| `0931 234 567` | ✅ Thành công |
| `0931 234 568` | ❌ Thất bại |
| `0931 234 569` | ⏳ Pending |

---

## PHẦN C — SETUP SERVER

### C1. Điền key vào `.env`

```bash
# Vào thư mục server
cd server

# Copy template
Copy-Item .env.example .env
```

Mở file `server/.env` và điền:

```env
# ════════ ĐIỀN VÀO ĐÂY ════════

STRIPE_SECRET_KEY=sk_test_ĐIỀN_KEY_CỦA_BẠN_VÀO_ĐÂY
STRIPE_WEBHOOK_SECRET=whsec_ĐIỀN_SECRET_TỪ_STRIPE_CLI

MOMO_SECRET_KEY=ĐIỀN_SECRET_KEY_CỦA_MOMO

# ════════ GIỮ NGUYÊN ════════

MOMO_PARTNER_CODE=MOMO_ATM_TEST
MOMO_ACCESS_KEY=F8BBA842ECF85
MOMO_ENDPOINT=https://test-payment.momo.vn
FRONTEND_URL=http://localhost:5173
PORT=3001
USD_TO_VND=25000
```

### C2. Cài dependencies

```bash
# Trong thư mục server/
npm install
```

### C3. Khởi động server

```powershell
# Terminal 1 — Backend
cd server
npm run dev

# Kết quả mong đợi:
# ╔═══════════════════════════════════════╗
# ║   Math Battle Payment Server — READY  ║
# ║   http://localhost:3001               ║
# ╚═══════════════════════════════════════╝
```

```bash
# Terminal 2 — Stripe Webhook forwarder (giữ mở khi test)
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

```bash
# Terminal 3 — Frontend
npm run dev
```

### C4. Kiểm tra server hoạt động

Mở trình duyệt vào: **http://localhost:3001/health**

Kết quả mong đợi:
```json
{
  "status": "ok",
  "timestamp": "2026-05-11T...",
  "env": "development"
}
```

---

## PHẦN D — TEST THANH TOÁN

### D1. Test Stripe

Vào Shop trong app → chọn gói Kim Cương → chọn Stripe

Dùng thẻ test:
| Số thẻ | Kết quả |
|--------|---------|
| `4242 4242 4242 4242` | ✅ Thành công |
| `4000 0000 0000 0002` | ❌ Thẻ bị từ chối |
| `4000 0025 0000 3155` | 🔐 Cần xác thực 3D Secure |

- **Ngày hết hạn:** Bất kỳ ngày trong tương lai (vd: `12/29`)
- **CVV:** Bất kỳ 3 số (vd: `123`)
- **ZIP:** Bất kỳ 5 số (vd: `12345`)

### D2. Test MoMo

Vào Shop → chọn gói Kim Cương → chọn MoMo  
→ App sẽ redirect sang MoMo sandbox  
→ Đăng nhập bằng số điện thoại test `0931 234 567`  
→ Sau khi thanh toán xong sẽ redirect về `/shop/success`

### D3. Kiểm tra webhook đã nhận

Trong terminal Stripe CLI, bạn sẽ thấy:
```
2026-05-11 10:30:00  --> payment_intent.succeeded [evt_xxx]
2026-05-11 10:30:00 <-- [200] POST http://localhost:3001/api/webhooks/stripe
```

Trong terminal server:
```
[Stripe Webhook] Event: payment_intent.succeeded
[REWARD] ✅ userId=user_xxx received: 200 Gems (order=pi_xxx)
```

---

## PHẦN E — DEPLOY LÊN PRODUCTION (Sau khi test xong)

### E1. Deploy backend lên Railway (free)

```bash
# Cài Railway CLI
npm install -g @railway/cli

# Đăng nhập
railway login

# Deploy từ thư mục server/
cd server
railway init
railway up
```

Sau khi deploy, Railway sẽ cho bạn URL kiểu:  
`https://math-battle-payment.railway.app`

### E2. Cập nhật biến môi trường trên Railway

Trong Railway dashboard → Variables:
```
STRIPE_SECRET_KEY=sk_live_...          ← đổi sang live key
STRIPE_WEBHOOK_SECRET=whsec_...        ← lấy từ Stripe Dashboard → Webhooks
MOMO_SECRET_KEY=...                    ← key production từ business.momo.vn
MOMO_ENDPOINT=https://payment.momo.vn ← bỏ "test-"
FRONTEND_URL=https://your-app.com     ← URL thật của app
```

### E3. Cập nhật Webhook URL trong Stripe Dashboard

1. Vào **[dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)**
2. **Add endpoint** → URL: `https://math-battle-payment.railway.app/api/webhooks/stripe`
3. Events: chọn `payment_intent.succeeded`
4. Copy **Signing secret** → dán vào `STRIPE_WEBHOOK_SECRET`

### E4. Cập nhật ipnUrl MoMo

Trong `server/.env` production:
```env
FRONTEND_URL=https://math-battle-payment.railway.app
```

MoMo sẽ tự gọi: `https://math-battle-payment.railway.app/api/webhooks/momo`

---

## PHẦN F — LẤY KEY MOMO PRODUCTION (Nhận tiền thật)

### F1. Đăng ký tài khoản doanh nghiệp

1. Vào **[business.momo.vn](https://business.momo.vn)**
2. Chọn **Đăng ký** → **Tài khoản cá nhân kinh doanh**
3. Chuẩn bị:
   - CMND/CCCD (scan 2 mặt)
   - Ảnh selfie cầm CMND
   - Tài khoản ngân hàng cá nhân

### F2. Thời gian duyệt

- Cá nhân: **3–7 ngày làm việc**
- Doanh nghiệp: **7–14 ngày làm việc**

### F3. Sau khi được duyệt

1. Vào **Tích hợp → Thông tin kết nối**
2. Copy `partnerCode`, `accessKey`, `secretKey` production
3. Cập nhật vào `server/.env` production

---

## ❓ Câu Hỏi Thường Gặp

**Q: Server báo lỗi "Missing environment variables"?**  
A: Bạn chưa điền đủ key vào `server/.env`. Xem lại Phần C1.

**Q: Stripe webhook báo "signature invalid"?**  
A: `STRIPE_WEBHOOK_SECRET` sai. Chạy lại `stripe listen` và copy secret mới.

**Q: MoMo trả về resultCode 99?**  
A: Lỗi tham số. Kiểm tra `MOMO_ACCESS_KEY` và `MOMO_SECRET_KEY` đúng với sandbox.

**Q: Webhook không được gọi?**  
A: Kiểm tra `ipnUrl` phải là địa chỉ công khai (không phải localhost) khi test với MoMo thật. Dùng `ngrok http 3001` để tạo địa chỉ công khai tạm thời.

**Q: Dùng ngrok với MoMo?**  
```bash
ngrok http 3001
# Lấy URL kiểu: https://abc123.ngrok.io
# Cập nhật: FRONTEND_URL=https://abc123.ngrok.io
```

---

## 📞 Liên Kết Tài Liệu

| Nguồn | URL |
|-------|-----|
| Stripe Dashboard | [dashboard.stripe.com](https://dashboard.stripe.com) |
| Stripe Docs | [stripe.com/docs](https://stripe.com/docs) |
| Stripe Test Cards | [stripe.com/docs/testing](https://stripe.com/docs/testing) |
| MoMo Developer | [developers.momo.vn](https://developers.momo.vn) |
| MoMo Business | [business.momo.vn](https://business.momo.vn) |
| Railway Deploy | [railway.app](https://railway.app) |

---

> **File kế hoạch chi tiết:** Xem `KE_HOACH_TICH_HOP_THANH_TOAN.md`  
> **Báo cáo tiến độ:** Xem `BAO_CAO_TIEN_DO.md`
