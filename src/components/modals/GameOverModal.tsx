import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import type { TurnResult } from '../../types/game';
import { fmtExpression, fmtResult } from '../../core/game/matchEngine';
import { 
  Flame, 
  Star, 
  TrendingUp, 
  Trophy, 
  Zap, 
  RotateCcw,
  Sparkles 
} from 'lucide-react';
import { CoinIcon, GemIcon } from '../shared/Icons';
import './GameOverModal.css';
import RewardClaimModal from './RewardClaimModal';
import RewardClaimModalMobile from './RewardClaimModal';

interface GameOverProps {
  history: TurnResult[];
  playerScore: number;
  aiScore: number;
  onRematch: () => void;
  onHome: () => void;
  onNextStage?: () => void;
  onMap?: () => void;
  isMobile?: boolean;
}

const GameOver: React.FC<GameOverProps> = ({ 
  history, playerScore, aiScore, onRematch, onHome, onNextStage, onMap, isMobile
}) => {
  const winner = playerScore > aiScore ? 'player' : playerScore < aiScore ? 'ai' : 'tie';
  const lastMatchRewards = useGameStore(s => s.lastMatchRewards);
  const gameMode = useGameStore(s => s.gameMode);

  const isPassPlay = gameMode === 'pass_play';
  const isCampaign = gameMode === 'campaign';
  const oppName = isPassPlay ? 'NGƯỜI CHƠI 2' : 'MÁY (AI)';
  const playerName = isPassPlay ? 'NGƯỜI CHƠI 1' : 'BẠN';

  const [isClaiming, setIsClaiming] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const handleAction = (action: () => void) => {
    if (winner === 'player' && lastMatchRewards && (lastMatchRewards.coins > 0 || (lastMatchRewards.gems || 0) > 0)) {
        setPendingAction(() => action);
        setIsClaiming(true);
    } else {
        action();
    }
  };

  // Stars logic for campaign
  const stars = lastMatchRewards?.stars || 0;
  const gems = lastMatchRewards?.gems || 0;
  const pack = lastMatchRewards?.pack || null;

  return (
    <>
      <motion.div
        className="go-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => !isClaiming && handleAction(onHome)}
      >
        <motion.div
          className="go-card glass relative"
          initial={{ scale: 0.9, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Win Streak Badge */}
          {lastMatchRewards && lastMatchRewards.streak > 1 && (
              <div className="go-streak-badge">
                  <Flame size={16} fill="currentColor" />
                  {lastMatchRewards.streak} TRẬN THẮNG LIÊN TIẾP!
              </div>
          )}

          {/* Winner banner */}
          <div className={`go-banner go-banner--${winner}`}>
            {winner === 'player' && (
              <>
                <Trophy size={28} />
                <span>{isCampaign ? 'VƯỢT ẢI THÀNH CÔNG!' : (isPassPlay ? 'NGƯỜI CHƠI 1 CHIẾN THẮNG!' : 'CHIẾN THẮNG!')}</span>
              </>
            )}
            {winner === 'ai' && (
              <>
                <Zap size={28} />
                <span>{isCampaign ? 'NHIỆM VỤ THẤT BẠI' : (isPassPlay ? 'NGƯỜI CHƠI 2 CHIẾN THẮNG!' : `MÁY (AI) CHIẾN THẮNG`)}</span>
              </>
            )}
            {winner === 'tie' && <span>⚖️ TRẬN HÒA</span>}
          </div>

          {/* Campaign Stars Animation */}
          {isCampaign && winner === 'player' && (
            <div className="go-stars-container">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={i <= stars ? { scale: 1, rotate: 0 } : { scale: 0.8, opacity: 0.3 }}
                  transition={{ 
                    delay: 0.5 + i * 0.2, 
                    type: 'spring', 
                    stiffness: 200 
                  }}
                >
                  <Star 
                    size={48} 
                    fill={i <= stars ? "#f59e0b" : "transparent"} 
                    className={i <= stars ? "text-amber-500 drop-shadow-xl" : "text-gray-300"} 
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Rewards Summary */}
          {!isPassPlay && lastMatchRewards && (
              <div className="go-rewards">
                   <div className="go-reward-item">
                       <span className="go-reward-label">Vàng</span>
                       <span className="go-reward-val flex items-center gap-1">
                           <CoinIcon size={18} className="text-amber-500" />
                           +{lastMatchRewards.coins.toLocaleString()}
                       </span>
                   </div>
                   {gems > 0 && (
                     <div className="go-reward-item">
                         <span className="go-reward-label">Kim Cương</span>
                         <span className="go-reward-val flex items-center gap-1">
                             <GemIcon size={18} className="text-sky-500" />
                             +{gems}
                         </span>
                     </div>
                   )}
                  {pack && (
                    <div className="rc-pack-preview flex flex-col items-center gap-1 opacity-60">
                        <span className="go-reward-label">Gói Bài</span>
                        <span className="go-reward-val text-sm">
                            <Sparkles size={16} className="text-purple-500" />
                            {pack}
                        </span>
                    </div>
                  )}
                  {!isCampaign && (
                    <div className="go-reward-item">
                        <span className="go-reward-label">Hạng</span>
                        <span className="go-reward-val">
                            <TrendingUp size={18} className="text-green-500" />
                            {lastMatchRewards.elo > 0 ? `+${lastMatchRewards.elo}` : lastMatchRewards.elo}
                        </span>
                    </div>
                  )}
              </div>
          )}

          {/* Score summary */}
          <div className="go-scores">
            <div className={`go-score-box ${winner === 'player' ? 'go-score-box--win' : ''}`}>
              <span className="go-score-label">{playerName}</span>
              <span className="go-score-num">{playerScore.toLocaleString()}</span>
            </div>
            <div className="go-score-sep">vs</div>
            <div className={`go-score-box ${winner === 'ai' ? 'go-score-box--win' : ''}`}>
              <span className="go-score-label">{oppName}</span>
              <span className="go-score-num">{aiScore.toLocaleString()}</span>
            </div>
          </div>

          {/* Turn history table */}
          <div className="go-history">
            <h3 className="go-history-title">BẢNG ĐỐI CHIẾU CHIẾN THUẬT</h3>
            <div className="go-table-container">
                <table className="go-table">
                  <thead>
                    <tr>
                      <th>LƯỢT</th>
                      <th>{playerName}</th>
                      <th className="go-vs-cell"></th>
                      <th>{oppName}</th>
                      <th>KẾT QUẢ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r) => (
                      <tr key={r.turn} className={`go-row go-row--${r.winner}`}>
                        <td className="go-turn-cell">T{r.turn}</td>
                        <td>
                          <div className="go-play-info">
                            <span className="go-expr">{fmtExpression(r.playerCards)}</span>
                            <span className="go-val">= {fmtResult(r.playerValue)}</span>
                            <div className="go-pts-split">
                              <span className="go-pts-logic">{r.playerLogicScore}L</span>
                              <span className="go-pts-plus">+</span>
                              <span className="go-pts-tactical">{r.playerTacticalScore}T</span>
                            </div>
                          </div>
                        </td>
                        <td className="go-vs-cell">vs</td>
                        <td>
                          <div className="go-play-info">
                            <span className="go-expr">{fmtExpression(r.aiCards)}</span>
                            <span className="go-val">= {fmtResult(r.aiValue)}</span>
                            <div className="go-pts-split">
                              <span className="go-pts-logic">{r.aiLogicScore}L</span>
                              <span className="go-pts-plus">+</span>
                              <span className="go-pts-tactical">{r.aiTacticalScore}T</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`go-result-badge go-result-badge--${r.winner}`}>
                            {r.winner === 'player' ? 'THẮNG' : r.winner === 'ai' ? 'BẠI' : 'HÒA'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>

          {/* Actions */}
          <div className="go-actions">
            {isCampaign ? (
              <>
                <motion.button
                  className="go-btn go-btn--secondary"
                  onClick={() => onMap && handleAction(onMap)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🗺️ VỀ BẢN ĐỒ
                </motion.button>

                {winner === 'player' ? (
                  <motion.button
                    className="go-btn go-btn--primary"
                    onClick={() => onNextStage && handleAction(onNextStage)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles size={18} /> ẢI TIẾP THEO
                  </motion.button>
                ) : (
                  <motion.button
                    className="go-btn go-btn--primary"
                    onClick={() => handleAction(onRematch)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <RotateCcw size={18} /> THỬ LẠI
                  </motion.button>
                )}
              </>
            ) : (
              <>
                <motion.button
                  className="go-btn go-btn--secondary"
                  onClick={() => handleAction(onHome)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🏠 VỀ TRANG CHỦ
                </motion.button>

                <motion.button
                  className="go-btn go-btn--primary"
                  onClick={() => handleAction(onRematch)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw size={18} /> CHƠI LẠI
                </motion.button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isClaiming && lastMatchRewards && (
            isMobile ? (
              <RewardClaimModalMobile 
                  rewards={{
                      coins: lastMatchRewards.coins,
                      gems: lastMatchRewards.gems || 0,
                      cards: lastMatchRewards.cards
                  }}
                  onComplete={() => {
                      setIsClaiming(false);
                      if (pendingAction) pendingAction();
                  }}
              />
            ) : (
              <RewardClaimModal 
                  rewards={{
                      coins: lastMatchRewards.coins,
                      gems: lastMatchRewards.gems || 0,
                      cards: lastMatchRewards.cards
                  }}
                  onComplete={() => {
                      setIsClaiming(false);
                      if (pendingAction) pendingAction();
                  }}
              />
            )
        )}
      </AnimatePresence>
    </>
  );
};

export default GameOver;
