import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { SHOP_PRODUCTS } from '../../data/shopData';
import type { ShopItem } from '../../types/shop.types';
import { useSound } from '../../hooks/useSound';
import { CheckIcon, XIcon, LoaderIcon } from '../shared/Icons';

interface MomoPaymentModalProps {
  itemId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const MomoPaymentModal: React.FC<MomoPaymentModalProps> = ({ itemId, onClose, onSuccess }) => {
  const { initiatePayment, completePayment } = usePlayerStore();
  const { playSound } = useSound();
  
  const [step, setStep] = useState<'qr' | 'processing' | 'success'>('qr');
  const [txId] = useState(() => initiatePayment(itemId));
  
  const product = SHOP_PRODUCTS.find((p: ShopItem) => p.id === itemId);

  const handleSimulatePayment = () => {
    setStep('processing');
    playSound('submit');
    
    // Simulate MoMo callback delay
    setTimeout(() => {
      completePayment(txId);
      setStep('success');
      playSound('win');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    }, 2500);
  };

  if (!product) return null;

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
            {step === 'qr' && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Tổng thanh toán</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: '#ae1471' }}>
                    {product.price.toLocaleString()}đ
                  </div>
                </div>

                <div style={{ 
                  width: 200, height: 200, background: '#f5f5f5', 
                  margin: '0 auto 24px', borderRadius: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px dashed #ddd', position: 'relative'
                }}>
                  {/* Mock QR */}
                  <div style={{ width: 160, height: 160, background: '#000', opacity: 0.05 }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: 12, color: '#333' }}>MÃ QR THỬ NGHIỆM</div>
                      <div style={{ fontSize: 10, color: '#999' }}>{txId}</div>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, marginBottom: 24 }}>
                  Quét mã QR bằng ứng dụng MoMo <br/> để hoàn tất giao dịch.
                </p>

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
                        onClick={handleSimulatePayment}
                        style={{
                            flex: 2, padding: '16px', borderRadius: 16,
                            background: '#ae1471', color: '#fff', fontWeight: 800,
                            border: 'none', cursor: 'pointer', boxShadow: '0 8px 20px rgba(174,20,113,0.3)'
                        }}
                    >Xác nhận thanh toán</button>
                </div>
              </motion.div>
            )}

            {step === 'processing' && (
              <motion.div
                key="processing"
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
                <h3 style={{ fontWeight: 800, color: '#333' }}>Đang xác thực...</h3>
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
                  Đã nhận được {typeof product.rewardValue === 'number' ? product.rewardValue.toLocaleString() : product.rewardValue.cards} {product.rewardType === 'card_pack' ? 'lá bài mới' : product.rewardType}.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Close Button */}
      {step === 'qr' && (
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
