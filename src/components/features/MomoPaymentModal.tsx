import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import { SHOP_PRODUCTS } from '../../data/shopData';
import type { ShopItem } from '../../types/shop.types';
import { useSound } from '../../hooks/useSound';
import { paymentClient } from '../../services/paymentClient';
import { CheckIcon, XIcon, LoaderIcon } from '../shared/Icons';

interface MomoPaymentModalProps {
  itemId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const MomoPaymentModal: React.FC<MomoPaymentModalProps> = ({ itemId, onClose, onSuccess }) => {
  const { initiatePayment } = usePlayerStore();
  const { user } = useAuthStore();
  const { playSound } = useSound();
  
  const [step, setStep] = useState<'confirm' | 'loading' | 'success' | 'error'>('confirm');
  const [errorMsg, setErrorMsg] = useState('');
  const [txId] = useState(() => initiatePayment(itemId));
  
  const product = SHOP_PRODUCTS.find((p: ShopItem) => p.id === itemId);

  const handlePay = async () => {
    if (!product?.priceUsd) {
      // Fallback: nếu sản phẩm không có priceUsd, giữ mode simulate
      setStep('loading');
      playSound('submit');
      setTimeout(() => {
        setStep('success');
        playSound('win');
        setTimeout(() => { onSuccess(); onClose(); }, 2000);
      }, 2500);
      return;
    }

    setStep('loading');
    playSound('submit');

    try {
      const userId = user?.id ?? txId; // dùng txId làm userId nếu chưa có auth
      const { payUrl } = await paymentClient.momoCreate(
        product.priceUsd,
        userId,
        product.id,
      );

      // Redirect sang MoMo — sau khi thanh toán xong MoMo sẽ redirect về /shop/success
      window.location.href = payUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối';
      console.error('[MoMo] Payment error:', err);
      setErrorMsg(msg);
      setStep('error');
      playSound('fail');
    }
  };

  if (!product) return null;

  const isBackendReady = !!product.priceUsd;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          background: '#fff', width: '100%', maxWidth: 400,
          borderRadius: 32, overflow: 'hidden', position: 'relative',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
        }}
      >
        {/* Header */}
        <div style={{ background: '#ae1471', padding: '24px 20px', color: '#fff', textAlign: 'center' }}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" 
            alt="MoMo" 
            style={{ width: 40, height: 40, marginBottom: 12, borderRadius: 8 }}
          />
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Thanh toán MoMo</h3>
          <p style={{ margin: '4px 0 0', opacity: 0.8, fontSize: 13 }}>Giao dịch an toàn & bảo mật</p>
        </div>

        <div style={{ padding: 32, textAlign: 'center' }}>
          <AnimatePresence mode="wait">
            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Tổng thanh toán</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#ae1471' }}>
                    {product.price.toLocaleString()}đ
                  </div>
                  {isBackendReady && (
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                      ≈ ${product.priceUsd?.toFixed(2)} USD
                    </div>
                  )}
                </div>

                {/* Product info */}
                <div style={{ 
                  background: '#fdf4ff', borderRadius: 16, padding: '16px',
                  marginBottom: 24, textAlign: 'left', border: '1px solid #f0e6ff'
                }}>
                  <div style={{ fontWeight: 800, fontSize: 15, color: '#1a1a1a' }}>{product.name}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                    +{typeof product.rewardValue === 'number' 
                      ? product.rewardValue.toLocaleString() 
                      : product.rewardValue.cards} {product.rewardType === 'gems' ? '💎 Kim cương' : '🪙 Vàng'}
                  </div>
                </div>

                {!isBackendReady && (
                  <div style={{ 
                    fontSize: 11, color: '#f59e0b', background: '#fffbeb',
                    padding: '8px 12px', borderRadius: 8, marginBottom: 16,
                    border: '1px solid #fde68a'
                  }}>
                    ⚠️ Chế độ thử nghiệm — Backend chưa kết nối
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                    <button 
                        onClick={onClose}
                        style={{
                            flex: 1, padding: '16px', borderRadius: 16,
                            background: '#f5f5f5', color: '#666', fontWeight: 700,
                            border: 'none', cursor: 'pointer'
                        }}
                    >Hủy</button>
                    <button 
                        onClick={handlePay}
                        style={{
                            flex: 2, padding: '16px', borderRadius: 16,
                            background: '#ae1471', color: '#fff', fontWeight: 800,
                            border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(174,20,113,0.3)'
                        }}
                    >{isBackendReady ? 'Thanh toán MoMo' : 'Xác nhận (thử nghiệm)'}</button>
                </div>
              </motion.div>
            )}

            {step === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ paddingTop: 40, paddingBottom: 40 }}
              >
                <div style={{ marginBottom: 24 }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ display: 'inline-block' }}
                  >
                    <LoaderIcon size={64} style={{ color: '#ae1471' }} />
                  </motion.div>
                </div>
                <h3 style={{ fontWeight: 800, color: '#333' }}>
                  {isBackendReady ? 'Đang kết nối MoMo...' : 'Đang xử lý...'}
                </h3>
                <p style={{ color: '#666' }}>Vui lòng không đóng cửa sổ này.</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ paddingTop: 40, paddingBottom: 40 }}
              >
                <div style={{ 
                  width: 80, height: 80, background: '#22c55e', 
                  borderRadius: '50%', margin: '0 auto 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 10px 30px rgba(34,197,94,0.4)'
                }}>
                  <CheckIcon size={40} style={{ color: '#fff' }} />
                </div>
                <h3 style={{ fontWeight: 900, color: '#16a34a', fontSize: 24 }}>Thành công!</h3>
                <p style={{ color: '#666' }}>
                  Đã nhận: {typeof product.rewardValue === 'number' 
                    ? product.rewardValue.toLocaleString() 
                    : product.rewardValue.cards} {product.rewardType === 'gems' ? 'kim cương' : 'vàng'}.
                </p>
              </motion.div>
            )}

            {step === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ paddingTop: 40, paddingBottom: 40 }}
              >
                <div style={{ 
                  width: 80, height: 80, background: '#ef4444', 
                  borderRadius: '50%', margin: '0 auto 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <XIcon size={40} style={{ color: '#fff' }} />
                </div>
                <h3 style={{ fontWeight: 900, color: '#dc2626', fontSize: 20 }}>Lỗi kết nối</h3>
                <p style={{ color: '#888', fontSize: 13 }}>{errorMsg}</p>
                <button 
                  onClick={() => setStep('confirm')}
                  style={{ marginTop: 16, padding: '12px 24px', borderRadius: 16,
                    background: '#ae1471', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                >Thử lại</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Close Button */}
      {step === 'confirm' && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 32, right: 32,
            background: 'rgba(255,255,255,0.1)', border: 'none',
            width: 48, height: 48, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff'
          }}
        >
          <XIcon size={24} />
        </button>
      )}
    </motion.div>
  );
};

export default MomoPaymentModal;
