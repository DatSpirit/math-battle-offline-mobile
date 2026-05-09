import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, rotate: -3, scale: 0.9 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 3, scale: 0.9 }}
            className="relative bg-[#fffef0] w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 overflow-hidden"
            style={{ 
              backgroundImage: 'linear-gradient(#e1eef4 1px, transparent 1px)',
              backgroundSize: '100% 1.8rem',
              border: '1px solid #e5e5e5',
              fontFamily: '"Comic Sans MS", "Chalkboard SE", cursive'
            }}
          >
            {/* Notebook Margin Line */}
            <div className="absolute left-10 top-0 bottom-0 w-px bg-red-100"></div>

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-400 text-white shadow-md active:scale-90 transition-transform z-10"
            >
              <X size={16} strokeWidth={3} />
            </button>

            <div className="relative pl-8">
              <h2 className="text-xl font-bold text-blue-500 mb-6 underline decoration-pink-300 decoration-wavy">
                Bí kíp thắng trận nè!
              </h2>

              <div className="space-y-3">
                {instructions.map((item) => (
                  <div 
                    key={item.t} 
                    className={`p-2 rounded-lg border border-transparent transition-all ${item.t === turn ? 'bg-amber-100/40 border-amber-200 rotate-1' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg shrink-0 mt-0.5">
                        {item.t === turn ? '👉' : '✏️'}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-700 m-0 leading-tight">
                          Lượt {item.t}: {item.text}
                        </p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="text-[9px] uppercase font-black tracking-widest text-blue-400">Mẫu:</span>
                          <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                            {item.layout.split(' ').map((part, i) => (
                              <span key={i} className={part === '[Số]' || part === 'Số' || part === '[ ]' ? 'text-blue-500' : 'text-amber-500'}>
                                {part}{' '}
                              </span>
                            ))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-dashed border-slate-200 text-center">
                <p className="text-[10px] italic text-slate-400">
                  "Chúc bạn chơi vui, đừng để thua máy nha! Hi hi"
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="mt-3 px-8 py-2 bg-blue-400 text-white rounded-full font-bold text-xs shadow-md shadow-blue-100"
                >
                  Đóng tập lại
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

