import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { FlagIcon } from '../shared/Icons';

const ConfirmModal: React.FC = () => {
  const { confirm, closeConfirm } = useUIStore();

  if (!confirm) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-3000 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          onClick={closeConfirm}
        />
        
        <motion.div 
          initial={{ scale: 0.9, y: 20, opacity: 0 }} 
          animate={{ scale: 1, y: 0, opacity: 1 }} 
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative bg-white rounded-[40px] p-10 w-full max-w-sm text-center shadow-2xl border-2 border-rose-100"
        >
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <FlagIcon size={32} className="text-rose-500" />
          </div>
          
          <h2 className="text-2xl font-black text-primary uppercase tracking-tighter italic mb-3">
            {confirm.message.includes('thoát') || confirm.message.includes('hàng') ? 'ĐẦU HÀNG?' : 'XÁC NHẬN?'}
          </h2>
          
          <p className="text-sm text-primary/60 font-bold mb-8 leading-relaxed">
            {confirm.message}
          </p>
          
          <div className="flex gap-4">
            <button 
              onClick={() => {
                if (confirm.onCancel) confirm.onCancel();
                closeConfirm();
              }}
              className="flex-1 py-4 bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest text-primary shadow-sm hover:bg-slate-200 active:scale-95 transition-all"
            >
              HỦY BỎ
            </button>
            <button 
              onClick={() => {
                confirm.onConfirm();
                closeConfirm();
              }}
              className="flex-1 py-4 bg-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 active:scale-95 transition-all"
            >
              ĐỒNG Ý
            </button>
          </div>
          
          <p className="mt-6 text-primary/20 text-[8px] font-black uppercase tracking-[0.3em]">
            Hệ thống quản trị trận đấu
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
