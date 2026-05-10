import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from '../shared/Icons';
import './RulesModal.css';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const [page, setPage] = useState(1);

  const nextPage = () => setPage(p => Math.min(p + 1, 4));
  const prevPage = () => setPage(p => Math.max(p - 1, 1));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="rules-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="rules-card"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="rules-header">
               <div className="rules-title-group">
                  <div className="rules-meta">Tactical Manual v3.1</div>
                  <h3 className="rules-title">SỔ TAY CHIẾN THUẬT {page}/4</h3>
               </div>
               <button className="rules-close-btn" onClick={onClose}>
                  <XIcon size={20} />
               </button>
            </div>
            
            <div className="rules-content-body stealth-scroll-v2">
              <AnimatePresence mode="wait">
                {page === 1 && (
                  <motion.div
                    key="page1"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <section className="rules-section">
                      <div className="rules-section-label">1. CÔNG THỨC TÍNH ĐIỂM</div>
                      <p className="text-on-surface/60 text-xs md:text-sm leading-relaxed mb-4">
                        Toàn bộ điểm số được tính toán thông qua hệ thống xử lý trung tâm theo quy trình sau:
                      </p>
                      <div className="formula-box">
                         <p className="font-black text-sm md:text-base tracking-tight text-primary uppercase italic">
                           TỔNG = [ ĐIỂM GỐC × (1 + %BONUS) × HỆ SỐ ] + KHO
                         </p>
                      </div>
                      <p className="text-[10px] italic text-on-surface/30 text-center uppercase tracking-widest mt-2">
                        * Điểm Gốc là kết quả biểu thức toán học từ các thẻ số.
                      </p>
                    </section>

                    <section className="rules-section">
                      <div className="rules-section-label">2. HỆ SỐ LƯỢT & SAO (STARS)</div>
                      <div className="multiplier-grid">
                        {[1.0, 1.5, 2.0, 2.5, 3.0, 3.5].map((val, i) => (
                          <div key={i} className="m-item">
                            <span className="text-[9px] font-black text-on-surface/20 uppercase tracking-widest">Lượt {i+1}</span>
                            <span className="m-val text-primary">x{val.toFixed(1)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-black/5 p-4 rounded-2xl border border-black/5 flex items-start gap-3">
                         <div className="size-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-black">⭐</div>
                         <p className="text-xs text-on-surface/70 leading-relaxed">
                           <span className="text-amber-500 font-black">Mỗi ⭐ cộng thêm +10%</span> sức mạnh kỹ năng. Thẻ 5⭐ sẽ mạnh hơn <span className="text-on-surface font-black">50%</span> so với thẻ thường.
                         </p>
                      </div>
                    </section>
                  </motion.div>
                )}

                {page === 2 && (
                  <motion.div
                    key="page2"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <section className="rules-section">
                      <div className="rules-section-label">3. GIAI ĐOẠN KHỞI TẠO (P1-P2)</div>
                      <div className="priority-list">
                        <div className="p-step">
                          <div className="p-badge bg-red-500/20 text-red-500 border border-red-500/30">Phase 1</div>
                          <div className="flex-1">
                            <p className="font-black text-on-surface text-sm mb-1 uppercase italic tracking-tight">Vô hiệu hóa (0, 1, 7)</p>
                            <p className="text-[11px] text-on-surface/50 leading-relaxed">
                              • Thẻ 0/1: Khóa kỹ năng hoặc triệt tiêu giá trị.<br/>
                              • Thẻ 7: Khóa các lá số Lẻ của đối phương.
                            </p>
                          </div>
                        </div>
                        <div className="p-step">
                          <div className="p-badge bg-blue-500/20 text-blue-500 border border-blue-500/30">Phase 2</div>
                          <div className="flex-1">
                            <p className="font-black text-on-surface text-sm mb-1 uppercase italic tracking-tight">Biến thiên (6, 3)</p>
                            <p className="text-[11px] text-on-surface/50 leading-relaxed">
                              • Thẻ 6: Thay đổi giá trị thẻ ngẫu nhiên.<br/>
                              • Thẻ 3: Nhân x3 giá trị của một thẻ số khác.
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="rules-section mt-6">
                       <div className="bg-red-500/10 p-5 rounded-3xl border border-red-500/20">
                          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2">NGUYÊN TẮC ĐỐI KHÁNG TRỰC DIỆN</p>
                          <p className="text-xs text-on-surface/60 leading-relaxed">
                            Thẻ hiếm hơn luôn thắng! Nếu cùng cấp phẩm chất, hai kỹ năng sẽ tự triệt tiêu nhau trong vùng nhiễu động.
                          </p>
                       </div>
                    </section>
                  </motion.div>
                )}

                {page === 3 && (
                  <motion.div
                    key="page3"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <section className="rules-section">
                      <div className="rules-section-label">4. GIAI ĐOẠN KHUẾCH ĐẠI (P3-P5)</div>
                      <div className="priority-list">
                        <div className="p-step">
                          <div className="p-badge bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">Phase 3</div>
                          <div className="flex-1">
                            <p className="font-black text-on-surface text-sm mb-1 uppercase italic tracking-tight">Bonus Thẻ [+]</p>
                            <p className="text-[11px] text-on-surface/50">Tăng mạnh tỷ lệ % điểm thưởng dựa trên phẩm chất thẻ.</p>
                          </div>
                        </div>
                        <div className="p-step">
                          <div className="p-badge bg-purple-500/20 text-purple-500 border border-purple-500/30">Phase 4</div>
                          <div className="flex-1">
                            <p className="font-black text-on-surface text-sm mb-1 uppercase italic tracking-tight">Hệ số (*, /, 5, 8)</p>
                            <p className="text-[11px] text-on-surface/50">Tác động trực tiếp vào hệ số nhân của lượt đấu hiện tại.</p>
                          </div>
                        </div>
                        <div className="p-step">
                          <div className="p-badge bg-amber-600/20 text-amber-600 border border-amber-600/30">Phase 5</div>
                          <div className="flex-1">
                            <p className="font-black text-on-surface text-sm mb-1 uppercase italic tracking-tight">Can thiệp (2, 4, -)</p>
                            <p className="text-[11px] text-on-surface/50">Cướp điểm, cân bằng hoặc chặn chiêu thức đối thủ.</p>
                          </div>
                        </div>
                      </div>
                    </section>
                  </motion.div>
                )}

                {page === 4 && (
                  <motion.div
                    key="page4"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <section className="rules-section">
                      <div className="rules-section-label">5. QUY TẮC VÀNG SINH TỒN</div>
                      <div className="space-y-4">
                         <div className="bg-black/5 p-4 rounded-2xl border border-black/5">
                            <p className="text-xs text-on-surface/80 leading-relaxed">
                               <span className="text-primary font-black uppercase">Thẻ 9 (Phase 6):</span> Trích xuất tới <span className="text-on-surface font-black text-sm">90%</span> tổng điểm để lưu trữ cho lượt đấu quyết định tiếp theo.
                            </p>
                         </div>
                         <div className="bg-black/5 p-4 rounded-2xl border border-black/5">
                            <p className="text-xs text-on-surface/80 leading-relaxed">
                               <span className="text-purple-500 font-black uppercase">Phẩm chất:</span> UR &gt; SR &gt; R &gt; N. Thẻ hiếm hơn luôn sở hữu chỉ số và hiệu ứng vượt giới hạn.
                            </p>
                         </div>
                         <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                            <p className="text-xs text-red-400 font-black leading-relaxed italic">
                               CẢNH BÁO: Phép Chia cho 0 hoặc kết quả âm sẽ khiến hệ thống sụp đổ và nhận 0đ ngay lập tức!
                            </p>
                         </div>
                      </div>
                    </section>

                    <section className="rules-section mt-6">
                      <div className="bg-primary/10 p-5 rounded-3xl border-2 border-primary/20 shadow-inner">
                        <p className="text-xs text-primary font-black italic leading-snug">
                          Mẹo Pro: Dùng thẻ [/] cấp Ultra để phá nát hệ số nhân tích lũy của đối thủ ở các lượt 5-6!
                        </p>
                      </div>
                    </section>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="rules-footer">
               <button 
                 className="nav-btn" 
                 onClick={prevPage}
                 disabled={page === 1}
               >
                 <div className="flex items-center gap-2"><ChevronLeftIcon size={16} /> TRƯỚC</div>
               </button>

               <div className="flex gap-1">
                 {[1, 2, 3, 4].map(p => (
                   <div key={p} className={`size-1.5 rounded-full transition-all ${p === page ? 'bg-primary w-4' : 'bg-black/10'}`} />
                 ))}
               </div>

               {page < 4 ? (
                 <button className="nav-btn" onClick={nextPage}>
                    <div className="flex items-center gap-2">TIẾP <ChevronRightIcon size={16} /></div>
                 </button>
               ) : (
                 <button className="nav-btn nav-btn-primary" onClick={onClose}>
                    ĐÃ HIỂU RÕ
                 </button>
               )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RulesModal;
