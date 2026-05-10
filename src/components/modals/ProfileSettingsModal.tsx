/**
 * MODAL: Profile & Settings (Modernized Bento)
 */
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { usePlayerStore } from '../../store/playerStore';
import { 
  XIcon, LogOutIcon, CheckIcon, 
  VolumeIcon, VolumeMuteIcon, ZapIcon, UserIcon, TrophyIcon, ChevronLeftIcon
} from '../shared/Icons';
import { useSound } from '../../hooks/useSound';
import AchievementsModal from './AchievementsModal';
import './ProfileSettings.css';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_OPTIONS = ['🧙‍♂️', '🧝‍♀️', '🧛‍♂️', '🧚‍♀️', '🦸‍♂️', '🥷', '🧬', '🐲', '🦄', '🦊', '🐱‍👤', '🕵️‍♂️'];

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, logout } = useAuthStore();
  const { performanceMode, isMuted, setPerformanceMode, toggleMute, achievements } = usePlayerStore();
  const { playSound } = useSound();
  const location = useLocation();
  const [newName, setNewName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '🧙‍♂️');
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

  const lastPath = React.useRef(location.pathname);
  useEffect(() => {
    if (location.pathname !== lastPath.current) {
      if (isOpen) onClose();
      lastPath.current = location.pathname;
    }
  }, [location.pathname, onClose, isOpen]);

  const handleSave = () => {
    if (newName.trim()) {
      updateProfile(newName.trim(), selectedAvatar);
      playSound('submit');
      onClose();
    }
  };

  const handleLogout = () => {
    playSound('click');
    usePlayerStore.getState().resetAccount();
    logout();
    onClose();
  };

  const unlockedAchievements = achievements.filter(a => a.isUnlocked);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-0">
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full h-full sm:w-[500px] sm:h-[90vh] overflow-hidden flex flex-col relative bg-surface sm:rounded-[48px] border-l sm:border-2 border-on-surface/10 shadow-[0_0_80px_rgba(0,0,0,0.1)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative background effects */}
            <div className="absolute top-0 right-0 size-64 bg-primary/5 blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 size-64 bg-amber-500/3 blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="px-8 pt-10 pb-6 flex items-center justify-between relative z-10 shrink-0 bg-primary/5 border-b border-on-surface/5">
               <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                     <div className="chapter-badge scale-75 origin-left bg-amber-500/20 text-amber-500 border-amber-500/30">CONFIG-V2</div>
                     <div className="text-[8px] font-black text-on-surface/20 uppercase tracking-[0.4em]">Operational Parameters</div>
                  </div>
                  <h3 className="text-2xl font-black text-on-surface italic uppercase tracking-tighter m-0">TRUNG TÂM CHỈ HUY</h3>
               </div>
               <motion.button 
                 whileHover={{ scale: 1.1, rotate: 90 }}
                 whileTap={{ scale: 0.9 }}
                 onClick={onClose}
                 className="size-11 bg-black/5 rounded-2xl flex items-center justify-center text-on-surface/30 hover:text-on-surface border border-black/10 transition-all active:scale-90"
               >
                 <XIcon size={22} />
               </motion.button>
            </div>

            {/* Content - Scrollable Area */}
            <div className="flex-1 overflow-y-auto px-8 pb-10 stealth-scroll-v2 space-y-6 pt-8">
               
               {/* Section 1: Identity & Avatar */}
               <div className="space-y-6">
                    {/* Identity Input */}
                     <div className="bg-black/3 p-6 rounded-[32px] border border-black/5 shadow-inner">
                        <label className="text-[9px] font-black text-on-surface/30 uppercase tracking-[0.3em] mb-4 block">MÃ ĐỊNH DANH (IDENTITY)</label>
                        <div className="relative group">
                           <div className="absolute inset-y-0 left-5 flex items-center text-on-surface/10 group-focus-within:text-primary transition-colors">
                              <UserIcon size={20} />
                           </div>
                           <input 
                            type="text" 
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-white/40 border border-black/10 rounded-2xl focus:border-primary/50 outline-none font-black text-on-surface italic text-xl transition-all shadow-xl"
                            placeholder="Commander..."
                          />
                        </div>
                     </div>

                    {/* Avatar Selection */}
                    <div className="bg-black/3 p-6 rounded-[32px] border border-black/5 shadow-inner">
                       <label className="text-[9px] font-black text-on-surface/30 uppercase tracking-[0.3em] mb-4 block">HÌNH ĐẠI DIỆN (ICON)</label>
                       <div className="grid grid-cols-6 gap-3">
                         {AVATAR_OPTIONS.map((avatar) => (
                           <button
                             key={avatar}
                             onClick={() => { playSound('click'); setSelectedAvatar(avatar); }}
                             className={`size-11 flex items-center justify-center text-2xl rounded-xl border-2 transition-all active:scale-90 ${
                              selectedAvatar === avatar 
                                ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]' 
                                : 'bg-white/40 border-black/5 hover:border-black/20'
                            }`}
                          >
                            {avatar}
                          </button>
                        ))}
                      </div>
                   </div>
               </div>

               {/* Section 2: Big Action Grid (Consolidated) */}
               <div className="grid grid-cols-1 gap-4">
                  {/* Sound Toggle */}
                  <button
                    onClick={() => { playSound('click'); toggleMute(); }}
                    className={`p-6 rounded-[32px] border-2 transition-all flex items-center justify-between group ${
                      isMuted ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-green-500/10 border-green-500/20 text-green-500'
                    }`}
                  >
                     <div className="flex items-center gap-5">
                        <div className={`size-14 rounded-2xl flex items-center justify-center border-2 shadow-lg transition-transform group-active:scale-90 ${
                         isMuted ? 'bg-red-500 text-white border-red-400' : 'bg-green-500 text-white border-green-400'
                        }`}>
                          {isMuted ? <VolumeMuteIcon size={24} /> : <VolumeIcon size={24} />}
                        </div>
                        <div className="flex flex-col items-start">
                           <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Audio Interface</span>
                           <span className="text-lg font-black uppercase italic leading-none mt-1">{isMuted ? 'DISABLED' : 'OPERATIONAL'}</span>
                        </div>
                     </div>
                     <div className={`size-6 rounded-full border-2 ${isMuted ? 'bg-red-500 border-red-400' : 'bg-green-500 border-green-400'}`} />
                  </button>

                  {/* Performance Switch */}
                  <button
                    onClick={() => { 
                      playSound('click'); 
                      const nextMode = performanceMode === 'ECO' ? 'BALANCED' : performanceMode === 'BALANCED' ? 'ULTRA' : 'ECO';
                      setPerformanceMode(nextMode); 
                    }}
                    className={`p-6 rounded-[32px] border-2 transition-all flex items-center justify-between group ${
                      performanceMode === 'ECO' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 
                      performanceMode === 'BALANCED' ? 'bg-sky-500/10 border-sky-500/20 text-sky-500' : 
                      'bg-primary/10 border-primary/20 text-primary'
                    }`}
                  >
                     <div className="flex items-center gap-5">
                        <div className={`size-14 rounded-2xl flex items-center justify-center border-2 shadow-lg transition-transform group-active:scale-90 ${
                          performanceMode === 'ECO' ? 'bg-amber-500 text-white border-amber-400' : 
                          performanceMode === 'BALANCED' ? 'bg-sky-500 text-white border-sky-400' : 
                          'bg-primary text-white border-white/20'
                        }`}>
                          <ZapIcon size={24} />
                        </div>
                        <div className="flex flex-col items-start">
                           <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Visual Processor</span>
                           <span className="text-lg font-black uppercase italic leading-none mt-1">
                              {performanceMode === 'ECO' ? 'SIÊU TIẾT KIỆM' : performanceMode === 'BALANCED' ? 'CÂN BẰNG' : 'TỐI ĐA (ULTRA)'}
                           </span>
                        </div>
                     </div>
                     <div className="text-[10px] font-black opacity-30 tracking-widest">SWITCH</div>
                  </button>

                  {/* Achievements Big Button */}
                  <button
                    onClick={() => { playSound('click'); setIsAchievementsOpen(true); }}
                    className="p-6 rounded-[32px] bg-amber-500/5 border-2 border-amber-500/20 transition-all flex items-center justify-between group hover:bg-amber-500/10 active:scale-[0.98]"
                  >
                     <div className="flex items-center gap-5">
                        <div className="size-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center border-2 border-amber-400 shadow-lg transition-transform group-active:scale-90">
                           <TrophyIcon size={24} />
                        </div>
                        <div className="flex flex-col items-start">
                           <span className="text-[9px] font-black uppercase tracking-widest text-amber-600/60">Player Mastery</span>
                           <span className="text-lg font-black uppercase italic leading-none mt-1 text-on-surface">THÀNH TỰU</span>
                        </div>
                     </div>
                     <div className="flex items-center -space-x-3">
                        {unlockedAchievements.slice(0, 3).map(ach => (
                           <div key={ach.id} className="size-10 rounded-full bg-white border-2 border-amber-500/20 flex items-center justify-center text-lg shadow-sm">
                              {ach.emoji}
                           </div>
                        ))}
                        <div className="size-10 rounded-full bg-amber-500 text-white border-2 border-white flex items-center justify-center text-[10px] font-black shadow-md">
                           {unlockedAchievements.length}
                        </div>
                     </div>
                  </button>

                  {/* Update Big Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    className="p-6 rounded-[32px] bg-primary border-2 border-primary shadow-2xl shadow-primary/20 transition-all flex items-center justify-between group relative overflow-hidden"
                  >
                     <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                     <div className="flex items-center gap-5 relative z-10">
                        <div className="size-14 rounded-2xl bg-white/20 text-white flex items-center justify-center border-2 border-white/30 shadow-lg">
                           <CheckIcon size={24} />
                        </div>
                        <div className="flex flex-col items-start">
                           <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Save changes</span>
                           <span className="text-lg font-black uppercase italic leading-none mt-1 text-white">XÁC NHẬN CẬP NHẬT</span>
                        </div>
                     </div>
                     <ChevronLeftIcon size={20} className="text-white/30 rotate-180" />
                  </motion.button>

                  {/* Logout Big Button */}
                  <button
                    onClick={handleLogout}
                    className="p-6 rounded-[32px] bg-red-500/5 border-2 border-red-500/20 transition-all flex items-center justify-between group hover:bg-red-500 hover:text-white"
                  >
                     <div className="flex items-center gap-5">
                        <div className="size-14 rounded-2xl bg-red-500 text-white flex items-center justify-center border-2 border-red-400 shadow-lg transition-transform group-hover:bg-white group-hover:text-red-500">
                           <LogOutIcon size={24} />
                        </div>
                        <div className="flex flex-col items-start">
                           <span className="text-[9px] font-black uppercase tracking-widest opacity-40 group-hover:text-white/60">System Exit</span>
                           <span className="text-lg font-black uppercase italic leading-none mt-1 group-hover:text-white">ĐĂNG XUẤT</span>
                        </div>
                     </div>
                     <span className="text-[9px] font-black opacity-20 uppercase group-hover:text-white/40">OFFLINE</span>
                  </button>
               </div>

               <div className="text-center pt-4">
                  <p className="text-[9px] text-on-surface/10 font-black uppercase tracking-[0.5em]">MATH-OPS CORE INTERFACE V3.1</p>
               </div>
            </div>
          </motion.div>
          
          {/* Sub-Modal for Achievements - Rendered inside the overlay for proper z-index stacking */}
          <AchievementsModal isOpen={isAchievementsOpen} onClose={() => setIsAchievementsOpen(false)} />
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileSettingsModal;
