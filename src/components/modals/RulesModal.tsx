import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
            className="rules-paper"
            initial={{ scale: 0.5, rotate: -10, y: 100 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0.5, rotate: 10, y: 100 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="rules-close-btn" onClick={onClose}>×</button>
            
            <div className="rules-content">
              <h1 className="scribble-title text-xl md:text-2xl">Sổ Tay Chiến Thuật {page}/4</h1>
              
              <AnimatePresence mode="wait">
                {page === 1 && (
                  <motion.div
                    key="page1"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <section className="scribble-section">
                      <p className="scribble-text text-sm md:text-base">1. Công thức tính điểm Tổng:</p>
                      <div className="formula-box bg-primary/5 p-4 rounded-xl border-2 border-dashed border-primary/30 my-3">
                         <p className="text-center font-black text-xs md:text-sm tracking-tight text-primary">
                           TỔNG = [ ĐIỂM GỐC × (1 + %BONUS) × HỆ SỐ ] + KHO
                         </p>
                      </div>
                      <p className="scribble-subtext italic text-xs mb-3 opacity-70">→ Điểm Gốc là kết quả biểu thức toán học sau khi tính toán các thẻ số.</p>
                    </section>

                    <section className="scribble-section">
                      <p className="scribble-text text-sm">2. Hệ số Lượt & Sao (Stars):</p>
                      <div className="multiplier-grid grid-cols-3! gap-2 mb-3">
                        <div className="m-item text-xs!">L1: <span className="m-val text-sm">x1.0</span></div>
                        <div className="m-item text-xs!">L2: <span className="m-val text-sm">x1.5</span></div>
                        <div className="m-item text-xs!">L3: <span className="m-val text-sm">x2.0</span></div>
                        <div className="m-item text-xs!">L4: <span className="m-val text-sm">x2.5</span></div>
                        <div className="m-item text-xs!">L5: <span className="m-val text-sm">x3.0</span></div>
                        <div className="m-item text-xs!">L6: <span className="m-val text-sm">x3.5</span></div>
                      </div>
                      <p className="text-xs leading-relaxed">
                        <span className="font-bold underline text-blue-600">Mỗi ⭐ cộng thêm +10%</span> sức mạnh kỹ năng. Thẻ 5⭐ mạnh hơn 50% so với thẻ thường.
                      </p>
                    </section>

                    <div className="flex justify-end mt-4">
                       <button className="next-btn text-sm" onClick={nextPage}>Tiếp tục ➔</button>
                    </div>
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
                    <section className="scribble-section">
                      <p className="scribble-text text-sm">3. Giai đoạn 1 & 2 (Khởi tạo):</p>
                      <div className="priority-list space-y-3">
                        <div className="p-step flex gap-3 items-start">
                          <span className="bg-red-500 text-white rounded-lg px-2 py-0.5 text-xs font-bold shadow-sm">GĐ1</span>
                          <div className="text-xs leading-snug">
                            <p className="font-bold text-sm mb-1">Vô hiệu hóa (Thẻ 0, 1, 7)</p>
                            <p className="opacity-80">• Thẻ 0/1: Khóa kỹ năng hoặc đưa giá trị về 0.</p>
                            <p className="opacity-80">• Thẻ 7: Tự động khóa lá số Lẻ của đối thủ.</p>
                          </div>
                        </div>
                        <div className="p-step flex gap-3 items-start">
                          <span className="bg-blue-500 text-white rounded-lg px-2 py-0.5 text-xs font-bold shadow-sm">GĐ2</span>
                          <div className="text-xs leading-snug">
                            <p className="font-bold text-sm mb-1">Biến thiên (Thẻ 6, 3)</p>
                            <p className="opacity-80">• Thẻ 6: Thay đổi giá trị thẻ ngẫu nhiên.</p>
                            <p className="opacity-80">• Thẻ 3: Nhân x3 giá trị của 1 thẻ số khác.</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="scribble-section mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                       <p className="text-xs italic font-bold text-red-600">Nguyên tắc đối kháng:</p>
                       <p className="text-[11px] leading-tight opacity-90 mt-1">
                         Thẻ hiếm hơn luôn thắng! Nếu cùng cấp phẩm chất, hai kỹ năng sẽ tự triệt tiêu nhau.
                       </p>
                    </section>

                    <div className="flex justify-between mt-4">
                       <button className="next-btn text-sm" onClick={prevPage}>⬅ Trước</button>
                       <button className="next-btn text-sm" onClick={nextPage}>Sau ➔</button>
                    </div>
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
                    <section className="scribble-section">
                      <p className="scribble-text text-sm">4. Giai đoạn 3, 4 & 5 (Khuếch đại):</p>
                      <div className="priority-list space-y-3">
                        <div className="p-step flex gap-3 items-start">
                          <span className="bg-emerald-500 text-white rounded-lg px-2 py-0.5 text-xs font-bold shadow-sm">GĐ3</span>
                          <div className="text-xs leading-snug">
                            <p className="font-bold text-sm mb-1">Bonus Thẻ [+]</p>
                            <p className="opacity-80">Tăng mạnh % điểm thưởng dựa trên độ hiếm.</p>
                          </div>
                        </div>
                        <div className="p-step flex gap-3 items-start">
                          <span className="bg-purple-500 text-white rounded-lg px-2 py-0.5 text-xs font-bold shadow-sm">GĐ4</span>
                          <div className="text-xs leading-snug">
                            <p className="font-bold text-sm mb-1">Hệ số (*, /, 5, 8)</p>
                            <p className="opacity-80">• Thẻ * và /: Tác động thẳng vào hệ số lượt.</p>
                            <p className="opacity-80">• Thẻ 8 (Vô cực): Tích lũy bonus cho 2-3 lượt sau.</p>
                          </div>
                        </div>
                        <div className="p-step flex gap-3 items-start">
                          <span className="bg-amber-600 text-white rounded-lg px-2 py-0.5 text-xs font-bold shadow-sm">GĐ5</span>
                          <div className="text-xs leading-snug">
                            <p className="font-bold text-sm mb-1">Can thiệp (2, 4, -)</p>
                            <p className="opacity-80">• Thẻ 2: Cướp điểm/Cân bằng điểm số.</p>
                            <p className="opacity-80">• Thẻ 4 (Trực Giao): Chặn chiêu & cộng điểm.</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="flex justify-between mt-4">
                       <button className="next-btn text-sm" onClick={prevPage}>⬅ Trước</button>
                       <button className="next-btn text-sm" onClick={nextPage}>Sau ➔</button>
                    </div>
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
                    <section className="scribble-section">
                      <p className="scribble-text text-sm">5. Kết quả & Quy tắc Vàng:</p>
                      <ul className="scribble-list text-xs space-y-2">
                        <li><span className="bg-slate-700 text-white px-1 rounded font-bold mr-1">GĐ6</span> <span className="font-bold underline text-blue-700">Thẻ 9 (Kho điểm)</span>: Trích tới 90% tổng điểm lượt thắng để dùng cho lượt kế tiếp.</li>
                        <li><span className="font-bold text-purple-700">Phẩm chất ưu tiên</span>: <span className="font-black">UR &gt; SR &gt; R &gt; N</span>. Thẻ hiếm hơn luôn có chỉ số và hiệu ứng vượt trội.</li>
                        <li><span className="font-bold text-red-600">Lưu ý sinh tử</span>: Phép Chia cho 0 hoặc kết quả âm sẽ khiến bạn nhận <span className="font-black">0đ</span> ngay lập tức.</li>
                      </ul>
                    </section>

                    <section className="scribble-section mt-4 bg-yellow-50 p-3 rounded-lg border border-yellow-200 shadow-inner">
                      <p className="text-xs italic leading-snug">
                        <span className="font-bold">Mẹo Pro:</span> Dùng thẻ [/] cấp Ultra để phá nát hệ số nhân tích lũy của đối thủ ở các lượt 5-6!
                      </p>
                    </section>

                    <div className="flex justify-start mt-4">
                       <button className="next-btn text-sm" onClick={prevPage}>⬅ Trang trước</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="scribble-footer mt-6">
                <p className="text-xs md:text-sm">Ký tên: Bé Học Toán (Lớp 1A chuyên Toán - Beta Tester)</p>
                <div className="crayon-doodle text-base md:text-xl">🖍️ ⭐ 🚀 💣 💎 🎓 🎒</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RulesModal;
