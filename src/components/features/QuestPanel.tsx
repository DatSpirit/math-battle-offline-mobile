import React, { useState } from 'react';
import { usePlayerStore } from '../../store/playerStore';
import type { Quest } from '../../types/player.types';
import { CheckCircle, Circle, Gift } from 'lucide-react';
import Confetti from 'react-confetti';
import { useSound } from '../../hooks/useSound';

const QuestPanel: React.FC = () => {
  const { activeQuests, claimQuestReward } = usePlayerStore();
  const { playSound } = useSound();
  const [showConfetti, setShowConfetti] = useState(false);

  const handleClaim = (id: string) => {
    playSound('reward');
    setShowConfetti(true);
    claimQuestReward(id);
    setTimeout(() => setShowConfetti(false), 5000);
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.2}
          style={{ zIndex: 200, position: 'fixed', top: 0, left: 0 }}
        />
      )}
      <div className="bg-surface-container rounded-4xl p-6 border-4 border-surface-variant shadow-inner">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
          <h3 className="font-headline font-black text-xl text-primary uppercase">Daily Quests</h3>
        </div>

        <div className="space-y-3">
          {(activeQuests || []).map((quest: Quest) => (
            <div
              key={quest.id}
              className={`p-4 rounded-2xl flex items-center justify-between transition-all ${quest.completed ? 'bg-secondary/10 border-2 border-secondary/20' : 'bg-white/40 border-2 border-transparent'}`}
            >
              <div className="flex flex-col gap-1 flex-1 mr-3">
                <span className={`text-xs font-bold ${quest.completed ? 'text-secondary' : 'text-on-surface'}`}>
                  {quest.description}
                </span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${quest.completed ? 'bg-secondary' : 'bg-primary'}`}
                      style={{ width: `${Math.min(100, (quest.current / quest.goal) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black opacity-40">{quest.current}/{quest.goal}</span>
                </div>
              </div>

              {quest.completed && !quest.claimed ? (
                <button
                  onClick={() => handleClaim(quest.id)}
                  className="bg-secondary text-white px-3 py-1.5 rounded-xl text-[10px] font-black hover:scale-105 active:scale-95 shadow-lg flex items-center gap-1 whitespace-nowrap"
                >
                  <Gift size={12} /> NHẬN 5K
                </button>
              ) : quest.claimed ? (
                <CheckCircle className="text-secondary shrink-0" size={20} />
              ) : (
                <Circle className="text-on-surface/10 shrink-0" size={20} />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default QuestPanel;
