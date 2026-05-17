import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePvPStore } from '../../store/pvpStore';
import { useAuthStore } from '../../store/authStore';
import './PvP.css';

interface ServerCard {
  id: string;
  value: string;
  type: 'number' | 'operator';
}

const PvPPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    phase, players, myId, hand, currentTurn, timeLeft,
    scores, turnResult, gameOverData, hasSubmitted, error,
    connectAndSearch, submitCards, disconnect, resetPvP, setTimeLeft,
  } = usePvPStore();
  const { isOnlineMode } = useAuthStore();

  const [selectedCards, setSelectedCards] = useState<ServerCard[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown timer
  useEffect(() => {
    if (phase === 'playing' && !hasSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(Math.max(0, timeLeft - 1));
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, hasSubmitted, timeLeft, setTimeLeft]);

  // Reset selectedCards khi bắt đầu lượt mới
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setSelectedCards([]);
  }, [currentTurn]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { disconnect(); };
  }, [disconnect]);

  const handleCardToggle = useCallback((card: ServerCard) => {
    if (hasSubmitted) return;
    setSelectedCards(prev => {
      const exists = prev.find(c => c.id === card.id);
      if (exists) return prev.filter(c => c.id !== card.id);
      if (prev.length >= currentTurn) return prev;
      return [...prev, card];
    });
  }, [hasSubmitted, currentTurn]);

  const handleSubmit = () => {
    if (selectedCards.length !== currentTurn) return;
    submitCards(selectedCards.map(c => c.id));
  };

  const handleGoHome = () => {
    resetPvP();
    navigate('/');
  };

  const fmtVal = (v: string) => v === '*' ? '×' : v === '/' ? '÷' : v;

  // Not online? Show message
  if (!isOnlineMode) {
    return (
      <div className="pvp-container">
        <div className="pvp-not-online">
          <span style={{ fontSize: '4rem' }}>🌐</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#8b5000' }}>Cần Đăng Nhập Online</h2>
          <p>Đăng nhập bằng Google hoặc Email để chơi PvP</p>
          <motion.button
            className="pvp-home-btn"
            onClick={handleGoHome}
            whileTap={{ scale: 0.95 }}
          >
            VỀ TRANG CHỦ
          </motion.button>
        </div>
      </div>
    );
  }

  // Determine my role (p1 or p2)
  const amP1 = players.length > 0 && players[0]?.supabaseId === myId;
  const myScore = amP1 ? scores.p1 : scores.p2;
  const oppScore = amP1 ? scores.p2 : scores.p1;
  const opponent = players.find(p => p.supabaseId !== myId);

  return (
    <div className="pvp-container">
      <AnimatePresence mode="wait">
        {/* ─── LOBBY / IDLE ─── */}
        {phase === 'idle' && (
          <motion.div key="idle" className="pvp-lobby"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <span style={{ fontSize: '5rem' }}>⚔️</span>
            <h1 className="pvp-lobby-title">PvP Arena</h1>
            <p className="pvp-lobby-subtitle">Đấu với người chơi thật — thời gian thật</p>

            {error && <p className="pvp-error">{error}</p>}

            <motion.button className="pvp-search-btn"
              onClick={connectAndSearch} whileTap={{ scale: 0.95 }}>
              🔍 TÌM TRẬN
            </motion.button>

            <motion.button className="pvp-search-btn cancel"
              onClick={handleGoHome} whileTap={{ scale: 0.95 }}>
              ← QUAY LẠI
            </motion.button>
          </motion.div>
        )}

        {/* ─── SEARCHING ─── */}
        {phase === 'searching' && (
          <motion.div key="searching" className="pvp-lobby"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="pvp-searching">
              <div className="pvp-spinner" />
              <p className="pvp-searching-text">Đang tìm đối thủ...</p>
              <p className="pvp-lobby-subtitle">Chờ người chơi khác kết nối</p>
            </div>

            <motion.button className="pvp-search-btn cancel"
              onClick={() => { disconnect(); }} whileTap={{ scale: 0.95 }}>
              HỦY TÌM
            </motion.button>
          </motion.div>
        )}

        {/* ─── MATCH FOUND ─── */}
        {phase === 'found' && (
          <motion.div key="found" className="pvp-found"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.p className="pvp-found-badge"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}>
              ĐÃ TÌM THẤY!
            </motion.p>

            <div className="pvp-vs-card">
              <div className="pvp-player-card">
                <span className="pvp-player-avatar">🐼</span>
                <span className="pvp-player-name">{players.find(p => p.supabaseId === myId)?.username || 'Bạn'}</span>
                <span className="pvp-player-elo">⭐ {players.find(p => p.supabaseId === myId)?.elo || 1000}</span>
              </div>
              <span className="pvp-vs-text">VS</span>
              <div className="pvp-player-card">
                <span className="pvp-player-avatar">🦊</span>
                <span className="pvp-player-name">{opponent?.username || 'Đối thủ'}</span>
                <span className="pvp-player-elo">⭐ {opponent?.elo || 1000}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── PLAYING ─── */}
        {phase === 'playing' && (
          <motion.div key="playing" className="pvp-battle"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Header */}
            <div className="pvp-battle-header">
              <span className="pvp-turn-badge">Lượt {currentTurn}/6</span>
              <span className={`pvp-timer ${timeLeft > 30 ? 'normal' : timeLeft > 10 ? 'warning' : 'danger'}`}>
                {timeLeft}s
              </span>
            </div>

            {/* Scoreboard */}
            <div className="pvp-scoreboard">
              <div className="pvp-score-item me">
                <div className="pvp-score-label">Bạn</div>
                <div className="pvp-score-value">{myScore}</div>
              </div>
              <div className="pvp-score-item">
                <div className="pvp-score-label">{opponent?.username || 'Đối thủ'}</div>
                <div className="pvp-score-value">{oppScore}</div>
              </div>
            </div>

            {/* Selected Slots */}
            <div className="pvp-slots-section">
              <div className="pvp-slots-label">Biểu thức ({selectedCards.length}/{currentTurn})</div>
              <div className="pvp-slots-row">
                {Array.from({ length: currentTurn }, (_, i) => (
                  <motion.div key={i}
                    className={`pvp-slot ${selectedCards[i] ? 'filled' : ''}`}
                    onClick={() => {
                      if (selectedCards[i] && !hasSubmitted) {
                        setSelectedCards(prev => prev.filter((_, idx) => idx !== i));
                      }
                    }}
                    whileTap={selectedCards[i] ? { scale: 0.9 } : undefined}
                  >
                    {selectedCards[i] ? fmtVal(selectedCards[i].value) : ''}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Hand */}
            <div className="pvp-hand-section">
              <div className="pvp-hand-label">Bài trên tay</div>
              <div className="pvp-hand-grid">
                {hand.map(card => (
                  <motion.div key={card.id}
                    className={`pvp-card ${card.type} ${selectedCards.find(c => c.id === card.id) ? 'selected' : ''}`}
                    onClick={() => handleCardToggle(card)}
                    whileTap={{ scale: 0.9 }}
                    layout
                  >
                    {fmtVal(card.value)}
                  </motion.div>
                ))}
              </div>
            </div>

            {error && <p className="pvp-error">{error}</p>}

            {/* Submit */}
            {!hasSubmitted ? (
              <motion.button className="pvp-submit-btn"
                disabled={selectedCards.length !== currentTurn}
                onClick={handleSubmit}
                whileTap={{ scale: 0.95 }}>
                ĐẶT BÀI ({selectedCards.length}/{currentTurn})
              </motion.button>
            ) : (
              <div className="pvp-submit-btn waiting">
                ⏳ ĐỢI ĐỐI THỦ...
              </div>
            )}
          </motion.div>
        )}

        {/* ─── TURN RESULT OVERLAY ─── */}
        {phase === 'turn_result' && turnResult && (
          <motion.div key="result" className="pvp-result-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="pvp-result-card"
              initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }}>
              <p className="pvp-result-turn">Kết quả Lượt {turnResult.turn}</p>
              <div className="pvp-result-vs">
                <div className="pvp-result-side">
                  <p className="pvp-result-expr">
                    {(amP1 ? turnResult.p1.expression : turnResult.p2.expression) || '—'}
                  </p>
                  <p className={`pvp-result-points ${
                    (amP1 ? turnResult.p1.points : turnResult.p2.points) > (amP1 ? turnResult.p2.points : turnResult.p1.points)
                      ? 'win' : (amP1 ? turnResult.p1.points : turnResult.p2.points) < (amP1 ? turnResult.p2.points : turnResult.p1.points)
                      ? 'lose' : 'tie'
                  }`}>
                    +{amP1 ? turnResult.p1.points : turnResult.p2.points}
                  </p>
                  <div className="pvp-score-label">Bạn</div>
                </div>
                <span className="pvp-vs-text" style={{ fontSize: '1.2rem' }}>VS</span>
                <div className="pvp-result-side">
                  <p className="pvp-result-expr">
                    {(amP1 ? turnResult.p2.expression : turnResult.p1.expression) || '—'}
                  </p>
                  <p className={`pvp-result-points ${
                    (amP1 ? turnResult.p2.points : turnResult.p1.points) > (amP1 ? turnResult.p1.points : turnResult.p2.points)
                      ? 'win' : (amP1 ? turnResult.p2.points : turnResult.p1.points) < (amP1 ? turnResult.p1.points : turnResult.p2.points)
                      ? 'lose' : 'tie'
                  }`}>
                    +{amP1 ? turnResult.p2.points : turnResult.p1.points}
                  </p>
                  <div className="pvp-score-label">{opponent?.username || 'Đối thủ'}</div>
                </div>
              </div>
              <div className="pvp-scoreboard" style={{ marginTop: '0.5rem' }}>
                <div className="pvp-score-item me">
                  <div className="pvp-score-label">Tổng</div>
                  <div className="pvp-score-value">{amP1 ? turnResult.scores.p1 : turnResult.scores.p2}</div>
                </div>
                <div className="pvp-score-item">
                  <div className="pvp-score-label">Tổng</div>
                  <div className="pvp-score-value">{amP1 ? turnResult.scores.p2 : turnResult.scores.p1}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ─── GAME OVER ─── */}
        {phase === 'game_over' && gameOverData && (
          <motion.div key="gameover" className="pvp-gameover"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            {(() => {
              const iWon = gameOverData.winnerId === myId;
              const isTie = gameOverData.winnerId === null;
              const myEloChange = myId ? gameOverData.eloChanges[myId] : 0;

              return (
                <>
                  <motion.span style={{ fontSize: '5rem' }}
                    initial={{ scale: 0 }} animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                    transition={{ type: 'spring' }}>
                    {isTie ? '🤝' : iWon ? '🏆' : '💔'}
                  </motion.span>

                  <motion.h1 className={`pvp-gameover-result ${isTie ? 'tie' : iWon ? 'win' : 'lose'}`}
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}>
                    {isTie ? 'HÒA' : iWon ? 'CHIẾN THẮNG!' : 'THUA RỒI'}
                  </motion.h1>

                  <motion.div
                    className={`pvp-elo-change ${myEloChange >= 0 ? 'positive' : 'negative'}`}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}>
                    {myEloChange >= 0 ? '▲' : '▼'} {Math.abs(myEloChange)} ELO
                  </motion.div>

                  <div className="pvp-final-scores">
                    <div className="pvp-final-score">
                      <div className="pvp-final-label">Bạn</div>
                      <div className="pvp-final-value">{amP1 ? gameOverData.scores.p1 : gameOverData.scores.p2}</div>
                    </div>
                    <div className="pvp-final-score">
                      <div className="pvp-final-label">{opponent?.username || 'Đối thủ'}</div>
                      <div className="pvp-final-value">{amP1 ? gameOverData.scores.p2 : gameOverData.scores.p1}</div>
                    </div>
                  </div>

                  {gameOverData.reason === 'forfeit' && (
                    <p className="pvp-lobby-subtitle">Đối thủ đã rời trận</p>
                  )}

                  <motion.button className="pvp-home-btn"
                    onClick={handleGoHome} whileTap={{ scale: 0.95 }}>
                    VỀ TRANG CHỦ
                  </motion.button>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PvPPage;
