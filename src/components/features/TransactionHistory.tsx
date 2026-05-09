import React from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { SHOP_PRODUCTS } from '../../data/shopData';
import type { ShopItem } from '../../types/shop.types';
import { XIcon, CoinIcon, GemIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '../shared/Icons';

interface TransactionHistoryProps {
  onClose: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ onClose }) => {
  const { transactions } = usePlayerStore();

  const getProduct = (id: string) => SHOP_PRODUCTS.find((p: ShopItem) => p.id === id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'pending': return '#f59e0b';
      case 'failed': return '#ef4444';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon size={14} />;
      case 'pending': return <ClockIcon size={14} />;
      case 'failed': return <XCircleIcon size={14} />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, 
        width: '100%', maxWidth: 450, zIndex: 110,
        background: '#fff', boxShadow: '-20px 0 60px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '32px 24px', borderBottom: '1px solid #f0f0f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#1c1c0f' }}>Lịch sử giao dịch</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#666' }}>Theo dõi các lần nạp kim cương và mua vàng.</p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: '#f5f5f5', border: 'none', width: 44, height: 44,
            borderRadius: '50%', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', cursor: 'pointer', color: '#333'
          }}
        >
          <XIcon size={20} />
        </button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#999' }}>
            <div style={{ opacity: 0.1, marginBottom: 16 }}>💰</div>
            <p>Bạn chưa có giao dịch nào.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {transactions.map(tx => {
              const product = getProduct(tx.itemId);
              return (
                <div key={tx.id} style={{
                  padding: 16, borderRadius: 20, border: '1px solid #f0f0f0',
                  display: 'flex', alignItems: 'center', gap: 16,
                  transition: 'background 0.2s'
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16,
                    background: product?.color || '#f5f5f5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.05)'
                  }}>
                    {tx.currency === 'coins' ? <CoinIcon size={24} style={{ color: '#fff' }} /> : <GemIcon size={24} style={{ color: '#fff' }} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#333' }}>
                      {product?.name || 'Sản phẩm đã xóa'}
                    </div>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                      {new Date(tx.timestamp).toLocaleString('vi-VN')}
                    </div>
                    <div style={{ 
                        display: 'flex', alignItems: 'center', gap: 4, 
                        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                        color: getStatusColor(tx.status), marginTop: 6
                    }}>
                        {getStatusIcon(tx.status)}
                        {tx.status === 'completed' ? 'Thành công' : tx.status === 'pending' ? 'Chờ thanh toán' : 'Thất bại'}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: 16, color: '#1c1c0f' }}>
                      {tx.currency === 'cash' ? `${tx.amount.toLocaleString()}đ` : tx.amount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 10, color: '#999' }}>ID: {tx.id.split('_')[1]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Support */}
      <div style={{ padding: 24, background: '#fcfcfc', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
          Gặp vấn đề? Liên hệ Fanpage để được hỗ trợ 24/7.
        </p>
      </div>
    </motion.div>
  );
};

export default TransactionHistory;
