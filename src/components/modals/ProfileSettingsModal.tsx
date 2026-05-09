/**
 * MODAL: Profile & Settings (Modernized Bento)
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { usePlayerStore } from '../../store/playerStore';
import { 
  XIcon, LogOutIcon, CheckIcon, TrophyIcon, 
  VolumeIcon, VolumeMuteIcon, ZapIcon, UserIcon, ShieldIcon
} from '../shared/Icons';
import { useSound } from '../../hooks/useSound';
import './ProfileSettings.css';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_OPTIONS = ['🧙‍♂️', '🧝‍♀️', '🧛‍♂️', '🧚‍♀️', '🦸‍♂️', '🥷', '🧬', '🐲', '🦄', '🦊', '🐱‍👤', '🕵️‍♂️'];

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, logout } = useAuthStore();
  const { achievements, performanceMode, isMuted, setPerformanceMode, toggleMute } = usePlayerStore();
  const { playSound } = useSound();
  const [newName, setNewName] = useState(user?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '🧙‍♂️');

  if (!isOpen) return null;

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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 30 }}
          className="profile-modal-glass max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col relative"
        >
          {/* Header */}
          <div className="px-6 md:px-10 pt-6 md:pt-10 pb-4 md:pb-6 flex items-center justify-between relative z-10 shrink-0">
             <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                   <div className="chapter-badge scale-50 origin-left">Profile Ops</div>
                   <div className="text-[8px] font-black text-primary/40 uppercase tracking-[0.2em]">System Config</div>
                </div>
                <h3 className="text-xl md:text-3xl font-black text-primary italic uppercase tracking-tighter m-0">TRUNG TÂM CHỈ HUY</h3>
             </div>
             <motion.button 
               whileHover={{ scale: 1.1, rotate: 90 }}
               whileTap={{ scale: 0.9 }}
               onClick={onClose}
               className="size-10 bg-white/60 rounded-xl flex items-center justify-center text-primary/40 hover:text-primary shadow-sm border border-primary/10 transition-all"
             >
               <XIcon size={20} />
             </motion.button>
          </div>

          {/* Content - Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-8 md:pb-10 stealth-scroll-v2 space-y-6">
             
             {/* Section 1: Identity & Avatar (Bento Row) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Identity Input */}
                 <div className="settings-bento-tile flex flex-col justify-center">
                    <label className="text-[8px] font-black text-primary/30 uppercase tracking-widest mb-3 block">MÃ ĐỊNH DANH (NAME)</label>
                    <div className="relative group">
                       <div className="absolute inset-y-0 left-4 flex items-center text-primary/20 group-focus-within:text-primary transition-colors">
                          <UserIcon size={16} />
                       </div>
                       <input 
                        type="text" 
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-primary/5 rounded-xl focus:border-primary/20 outline-none font-black text-primary italic text-lg transition-all shadow-sm"
                        placeholder="Commander Name..."
                      />
                    </div>
                 </div>

                 {/* Avatar Selection */}
                 <div className="settings-bento-tile">
                    <label className="text-[8px] font-black text-primary/30 uppercase tracking-widest mb-3 block">HÌNH ĐẠI DIỆN (AVATAR)</label>
                    <div className="grid grid-cols-6 md:grid-cols-4 gap-2">
                      {AVATAR_OPTIONS.map((avatar) => (
                        <button
                          key={avatar}
                          onClick={() => { playSound('click'); setSelectedAvatar(avatar); }}
                          className={`avatar-selection-ring size-10 flex items-center justify-center text-xl rounded-xl border-2 border-white/50 ${
                           selectedAvatar === avatar ? 'active' : 'bg-white/20'
                         }`}
                       >
                         {avatar}
                       </button>
                     ))}
                   </div>
                </div>
             </div>

             {/* Section 2: Tactical Settings & Performance */}
             <div className="grid grid-cols-2 gap-6">
                <button
                  onClick={() => { playSound('click'); toggleMute(); }}
                  className={`settings-bento-tile flex items-center gap-5 border-white/80 transition-all ${
                    isMuted ? 'text-red-500 bg-red-500/5' : 'text-emerald-600 bg-emerald-500/5'
                  }`}
                >
                   <div className={`size-10 md:size-14 rounded-xl md:rounded-2xl flex items-center justify-center border-2 border-white shadow-lg ${
                    isMuted ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {isMuted ? <VolumeMuteIcon size={18} /> : <VolumeIcon size={18} />}
                  </div>
                  <div className="flex flex-col items-start">
                     <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Audio Link</span>
                     <span className="text-sm md:text-lg font-black uppercase italic leading-none mt-1">{isMuted ? 'OFFLINE' : 'ACTIVE'}</span>
                  </div>
                </button>

                <button
                  onClick={() => { 
                    playSound('click'); 
                    const nextMode = performanceMode === 'ECO' ? 'BALANCED' : performanceMode === 'BALANCED' ? 'ULTRA' : 'ECO';
                    setPerformanceMode(nextMode); 
                  }}
                  className={`settings-bento-tile flex items-center gap-5 border-white/80 transition-all ${
                    performanceMode === 'ECO' ? 'text-amber-600 bg-amber-500/5' : 
                    performanceMode === 'BALANCED' ? 'text-sky-600 bg-sky-500/5' : 
                    'text-purple-600 bg-purple-500/10'
                  }`}
                >
                   <div className={`size-10 md:size-14 rounded-xl md:rounded-2xl flex items-center justify-center border-2 border-white shadow-lg ${
                    performanceMode === 'ECO' ? 'bg-amber-500 text-white' : 
                    performanceMode === 'BALANCED' ? 'bg-sky-500 text-white' : 
                    'bg-purple-600 text-white shadow-purple-500/20'
                  }`}>
                    <ZapIcon size={18} />
                  </div>
                  <div className="flex flex-col items-start">
                     <span className="text-[8px] font-black uppercase tracking-widest opacity-40">Visual FX</span>
                     <span className="text-sm md:text-lg font-black uppercase italic leading-none mt-1">
                        {performanceMode === 'ECO' ? 'SIÊU TIẾT KIỆM' : performanceMode === 'BALANCED' ? 'CÂN BẰNG' : 'TỐI ĐA (ULTRA)'}
                     </span>
                  </div>
                </button>
             </div>

             {/* Section 3: Military Merits (Achievements) */}
             <div className="settings-bento-tile">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500 text-white rounded-lg shadow-lg">
                         <ShieldIcon size={18} />
                      </div>
                      <label className="text-[10px] font-black text-primary/30 uppercase tracking-widest m-0">BẢNG PHONG THƯỞNG (ACHIEVEMENTS)</label>
                   </div>
                   <span className="text-primary/40 font-black text-[10px] uppercase">{achievements.filter(a => a.isUnlocked).length} / {achievements.length} UNLOCKED</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-4 stealth-scroll-v2">
                   {achievements.map((ach) => (
                     <div 
                       key={ach.id} 
                       className={`achievement-badge-hologram p-4 flex items-center gap-4 ${ach.isUnlocked ? 'unlocked' : 'opacity-40 grayscale'}`}
                     >
                       <div className={`size-12 rounded-xl flex items-center justify-center border-2 border-white shrink-0 shadow-sm ${
                         ach.isUnlocked ? 'bg-emerald-500 text-white achievement-icon-glow' : 'bg-white/20 text-primary/20'
                       }`}>
                         <TrophyIcon size={20} />
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="text-[11px] font-black uppercase tracking-tight text-primary leading-tight truncate">{ach.title}</p>
                         <p className="text-[9px] font-bold text-primary/40 leading-none mt-1">{ach.description}</p>
                       </div>
                       {ach.isUnlocked && <CheckIcon size={14} className="text-emerald-500" />}
                     </div>
                   ))}
                </div>
             </div>

             {/* Section 4: Operational Actions */}
             <div className="flex flex-col md:flex-row gap-4 pt-4">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  className="flex-1 py-6 bg-primary text-white rounded-[32px] font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 border-b-4 border-black/20"
                >
                  <CheckIcon size={20} /> XÁC NHẬN CẬP NHẬT
                </motion.button>
                
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="px-10 py-6 bg-red-500/10 text-red-600 rounded-[32px] font-black uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-3 border-4 border-white shadow-xl"
                >
                  <LogOutIcon size={18} /> ĐĂNG XUẤT
                </motion.button>
             </div>

             <div className="text-center">
                <p className="text-[9px] text-primary/20 font-black uppercase tracking-[0.4em]">STITCH-OPS COMMAND INTERFACE V2.5</p>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileSettingsModal;
