/**
 * PAGE: Shop Payment Success
 * MoMo redirect về URL này sau khi thanh toán hoàn tất.
 * URL: /shop/success?orderId=MB_xxx&resultCode=0
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../../store/playerStore';
import { CheckIcon, XIcon } from '../../components/shared/Icons';

const ShopSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { completePayment } = usePlayerStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resultCode = parseInt(params.get('resultCode') ?? '1', 10);
    const order = params.get('orderId') ?? '';

    setOrderId(order);

    if (resultCode === 0) {
      // MoMo thành công (resultCode 0)
      // Phần thưởng thực sự được phát qua webhook backend
      // Đây chỉ là UI redirect — completePayment cập nhật UI lạc quan
      if (order) completePayment(order);
      setStatus('success');
    } else {
      setStatus('failed');
    }
  }, [completePayment]);

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
        {status === 'loading' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              style={{ fontSize: 48, marginBottom: 16 }}
            >⏳</motion.div>
            <p style={{ color: '#888' }}>Đang xác nhận giao dịch...</p>
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
              Phần thưởng đang được xử lý và sẽ vào tài khoản trong vài giây.
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
          {status === 'success' ? 'Quay lại Cửa hàng' : 'Thử lại'}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ShopSuccessPage;
