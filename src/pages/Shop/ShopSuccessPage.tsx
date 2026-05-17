/**
 * PAGE: Shop Payment Success
 * v2: Poll backend /api/payment/order/:orderId thay vì chỉ dùng URL params
 * MoMo redirect về URL này: /shop/success?orderId=MB_xxx
 * Stripe redirect về URL này: /shop/success?orderId=MB_xxx
 */
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePlayerStore } from '../../store/playerStore';
import { paymentClient } from '../../services/paymentClient';
import { CheckIcon, XIcon } from '../../components/shared/Icons';

const ShopSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { completePayment } = usePlayerStore();
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const orderId = params.get('orderId') ?? '';
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!orderId) {
      navigate('/shop');
      return;
    }

    // Poll backend mỗi 2s, tối đa 15 lần (30s)
    let attempts = 0;
    pollingRef.current = setInterval(async () => {
      attempts++;

      try {
        const data = await paymentClient.orderStatus(orderId);

        if (data.status === 'SUCCESS') {
          setStatus('success');
          if (pollingRef.current) clearInterval(pollingRef.current);

          // Cập nhật UI lạc quan
          completePayment(orderId);

          // Tự động quay về shop sau 3s
          setTimeout(() => navigate('/shop'), 3000);
        } else if (data.status === 'FAILED' || attempts >= 15) {
          setStatus(data.status === 'FAILED' ? 'failed' : 'failed');
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {
        // Backend chưa sẵn sàng — fallback sang URL params
        if (attempts >= 15) {
          // Fallback: dùng resultCode từ MoMo URL params
          const resultCode = parseInt(params.get('resultCode') ?? '1', 10);
          if (resultCode === 0) {
            completePayment(orderId);
            setStatus('success');
            setTimeout(() => navigate('/shop'), 3000);
          } else {
            setStatus('failed');
          }
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      }
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [orderId, navigate, completePayment, params]);

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#faf9f4',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: 'var(--font-body, sans-serif)',
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        style={{
          background: '#fff',
          borderRadius: 32,
          padding: 40,
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          border: '2px solid rgba(139, 80, 0, 0.08)',
        }}
      >
        {status === 'pending' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ fontSize: 48, marginBottom: 16 }}
            >⏳</motion.div>
            <h2 style={{ fontWeight: 800, color: '#333', margin: '0 0 8px' }}>
              Đang xử lý thanh toán...
            </h2>
            <p style={{ color: '#888', fontSize: 13 }}>
              Vui lòng chờ trong giây lát. Hệ thống đang xác nhận giao dịch.
            </p>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 30, ease: 'linear' }}
              style={{
                height: 4, borderRadius: 2, marginTop: 20,
                background: 'linear-gradient(90deg, #ae1471, #f59e0b)',
              }}
            />
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.6 }}
              style={{
                width: 88, height: 88,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                borderRadius: '50%', margin: '0 auto 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 12px 30px rgba(34,197,94,0.35)',
              }}
            >
              <CheckIcon size={44} style={{ color: '#fff' }} />
            </motion.div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#166534', margin: '0 0 8px' }}>
              Thanh toán thành công!
            </h1>
            <p style={{ color: '#6b7280', marginBottom: 8, fontSize: 14 }}>
              Phần thưởng đã được ghi nhận vào tài khoản của bạn.
            </p>
            {orderId && (
              <p style={{ fontSize: 11, color: '#9ca3af', fontFamily: 'monospace' }}>
                Mã GD: {orderId}
              </p>
            )}
          </>
        )}

        {status === 'failed' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.6 }}
              style={{
                width: 88, height: 88,
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                borderRadius: '50%', margin: '0 auto 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 12px 30px rgba(239,68,68,0.3)',
              }}
            >
              <XIcon size={44} style={{ color: '#fff' }} />
            </motion.div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#991b1b', margin: '0 0 8px' }}>
              Thanh toán thất bại
            </h1>
            <p style={{ color: '#6b7280', fontSize: 14 }}>
              Giao dịch chưa hoàn tất. Tiền của bạn không bị trừ.
            </p>
          </>
        )}

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => navigate('/shop')}
          style={{
            marginTop: 28,
            width: '100%',
            padding: '16px',
            borderRadius: 18,
            background: 'var(--color-primary, #8b5000)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 15,
            border: 'none',
            cursor: 'pointer',
            letterSpacing: '0.05em',
          }}
        >
          {status === 'success' ? 'Quay lại Cửa hàng' : status === 'pending' ? 'Đang xử lý...' : 'Thử lại'}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ShopSuccessPage;
