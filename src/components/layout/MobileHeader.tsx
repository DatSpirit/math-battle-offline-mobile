import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { usePlayerStore } from '../../store/playerStore';
import { CoinIcon, GemIcon, VolumeIcon, VolumeMuteIcon } from '../shared/Icons';
import { useSound } from '../../hooks/useSound';
import { useUIStore } from '../../store/uiStore';

const MobileHeader: React.FC = () => {
  const { user } = useAuthStore();
  const { level, coins, gems, redAscensionBooks, isMuted, toggleMute } = usePlayerStore();
  const { playSound } = useSound();
  const { setIsProfileOpen } = useUIStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#fcf9f2]/80 backdrop-blur-md border-b border-black/5 pt-safe h-[calc(3.5rem+var(--sat))] px-4 flex items-center justify-between">
      {/* Profile Info */}
      <button 
        onClick={() => { playSound('click'); setIsProfileOpen(true); }}
        className="flex items-center gap-3 active:scale-95 transition-transform"
      >
        <div className="w-10 h-10 bg-primary/10 rounded-xl border-2 border-primary flex items-center justify-center text-xl shadow-inner">
          {user?.avatar || '👤'}
        </div>
        <div className="flex flex-col items-start leading-none">
          <span className="text-[10px] font-black text-primary/50 uppercase tracking-widest mb-0.5">LV.{level}</span>
          <span className="text-sm font-black text-primary italic uppercase tracking-tighter truncate max-w-[100px]">
            {user?.name || 'GUEST'}
          </span>
        </div>
      </button>

      {/* Stats & Settings */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10 shadow-sm">
          <CoinIcon size={14} className="text-yellow-500" />
          <span className="text-xs font-black text-primary">{(coins || 0).toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2 bg-blue-500/5 px-3 py-1.5 rounded-xl border border-blue-500/10 shadow-sm">
          <GemIcon size={14} className="text-blue-500" />
          <span className="text-xs font-black text-blue-600">{(gems || 0).toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-2 bg-red-500/5 px-3 py-1.5 rounded-xl border border-red-500/10 shadow-sm">
          <span className="text-[14px]">📜</span>
          <span className="text-xs font-black text-red-600">{(redAscensionBooks || 0).toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={() => { playSound('click'); toggleMute(); }}
            className={`p-2 rounded-lg transition-colors ${isMuted ? 'bg-red-50 text-red-500' : 'bg-primary/5 text-primary'}`}
          >
            {isMuted ? <VolumeMuteIcon size={16} /> : <VolumeIcon size={16} />}
          </button>
        </div>
      </div>

    </header>
  );
};

export default MobileHeader;
