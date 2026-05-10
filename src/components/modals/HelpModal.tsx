import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, HelpCircleIcon } from '../shared/Icons';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  turn: number;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, turn }) => {
  const instructions = [
    { t: 1, text: "Bỏ một bạn số vào đây là xong nè!", layout: "[ Số ]" },
    { t: 2, text: "Hai bạn số đứng sát nhau cho nó to nha.", layout: "[ Số ] [ Số ]" },
    { t: 3, text: "Hai bạn số kẹp bạn dấu ở giữa cho vui.", layout: "[ Số ] [ Dấu ] [ Số ]" },
    { t: 4, text: "Số to đứng trước, xong tới dấu rồi tới số nhỏ.", layout: "[ Số ] [ Số ] [ Dấu ] [ Số ]" },
    { t: 5, text: "Ba bạn số và hai bạn dấu đứng xen kẽ nhau.", layout: "[ Số ] [ Dấu ] [ Số ] [ Dấu ] [ Số ]" },
    { t: 6, text: "Số siêu to luôn! Hai bạn đầu sát nhau rồi tới dấu.", layout: "[ Số ] [ Số ] [ Dấu ] [ Số ] [ Dấu ] [ Số ]" }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-2000 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#fcfae4] rounded-[40px] border-2 border-white shadow-[0_40px_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-8 pt-10 pb-6 flex items-center justify-between bg-primary/5 border-b border-white/5">
               <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                     <HelpCircleIcon size={14} className="text-primary" />
                     <div className="text-[8px] font-black text-on-surface/40 uppercase tracking-[0.4em]">Tactical Guide</div>
                  </div>
                  <h3 className="text-2xl font-black text-on-surface italic uppercase tracking-tighter m-0">BÍ KÍP THẮNG TRẬN</h3>
               </div>
               <button 
                 onClick={onClose}
                 className="size-11 bg-black/5 rounded-2xl flex items-center justify-center text-on-surface/30 hover:text-on-surface border border-black/10 transition-all active:scale-90"
               >
                 <XIcon size={20} />
               </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto stealth-scroll-v2">
              {instructions.map((item) => (
                <div 
                  key={item.t} 
                  className={`p-5 rounded-3xl border-2 transition-all ${
                    item.t === turn 
                      ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.1)]' 
                      : 'bg-black/3 border-black/5 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`size-10 rounded-xl flex items-center justify-center font-black text-sm border-2 ${
                       item.t === turn ? 'bg-primary text-white border-white/20' : 'bg-black text-white/30 border-white/10'
                    }`}>
                      {item.t}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-on-surface mb-2 leading-relaxed">
                        Lượt {item.t}: {item.text}
                      </p>
                      <div className="flex items-center gap-3 bg-black/5 p-3 rounded-2xl border border-black/5">
                        <span className="text-[8px] font-black uppercase tracking-widest text-primary/60">Layout:</span>
                        <span className="text-[10px] font-black text-on-surface/80 tracking-wider font-mono italic">
                          {item.layout}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-8 pt-4 bg-primary/5 border-t border-black/5 text-center">
               <p className="text-[10px] font-black italic text-on-surface/20 uppercase tracking-widest mb-6">
                 "MATH-OPS CORE INTERFACE V3.1"
               </p>
               <motion.button
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={onClose}
                 className="w-full py-5 bg-primary text-white rounded-[28px] font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20 border-2 border-primary/30"
               >
                 ĐÃ HIỂU CHIẾN THUẬT
               </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
