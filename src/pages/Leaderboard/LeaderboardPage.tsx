// LeaderboardPage.tsx — Bảng xếp hạng ELO
import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import './Leaderboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface LeaderboardEntry {
  id: string;
  username: string;
  avatarEmoji: string;
  elo: number;
  wins: number;
  level: number;
  rank: number;
  isMe?: boolean;
}

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { isOnlineMode, accessToken, user } = useAuthStore();
  const [top100, setTop100] = useState<LeaderboardEntry[]>([]);
  const [aroundMe, setAroundMe] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'top' | 'around'>('top');

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      // Public: Top 100
      const topRes = await fetch(`${API_URL}/api/leaderboard`);
      if (topRes.ok) {
        const { data } = await topRes.json();
        setTop100(data);
      }

      // Auth: Around me
      if (accessToken) {
        const aroundRes = await fetch(`${API_URL}/api/leaderboard/around`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (aroundRes.ok) {
          const { data, myRank: rank } = await aroundRes.json();
          setAroundMe(data);
          setMyRank(rank);
        }
      }
    } catch (err) {
      console.error('[Leaderboard] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isOnlineMode) fetchLeaderboard();
    else setLoading(false);
  }, [isOnlineMode, fetchLeaderboard]);

  if (!isOnlineMode) {
    return (
      <div className="lb-container">
        <div className="lb-offline">
          <span style={{ fontSize: '4rem' }}>🌐</span>
          <h2>Cần Đăng Nhập Online</h2>
          <p>Đăng nhập để xem bảng xếp hạng</p>
          <motion.button className="lb-back-btn" onClick={() => navigate('/')} whileTap={{ scale: 0.95 }}>
            VỀ TRANG CHỦ
          </motion.button>
        </div>
      </div>
    );
  }

  const currentList = tab === 'top' ? top100 : aroundMe;

  return (
    <div className="lb-container">
      {/* Header */}
      <div className="lb-header">
        <motion.button className="lb-back-arrow" onClick={() => navigate('/')} whileTap={{ scale: 0.9 }}>
          ←
        </motion.button>
        <h1 className="lb-title">🏆 Bảng Xếp Hạng</h1>
        {myRank && <div className="lb-my-rank">Rank #{myRank}</div>}
      </div>

      {/* Tabs */}
      <div className="lb-tabs">
        <button className={`lb-tab ${tab === 'top' ? 'active' : ''}`} onClick={() => setTab('top')}>
          Top 100
        </button>
        <button
          className={`lb-tab ${tab === 'around' ? 'active' : ''}`}
          onClick={() => setTab('around')}
          disabled={!accessToken}
        >
          Quanh Tôi
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="lb-loading">
          <div className="lb-spinner" />
          <p>Đang tải...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="lb-empty">
          <span style={{ fontSize: '3rem' }}>📋</span>
          <p>Chưa có dữ liệu xếp hạng</p>
        </div>
      ) : (
        <div className="lb-list">
          {currentList.map((entry, idx) => (
            <motion.div
              key={entry.id}
              className={`lb-row ${entry.isMe || entry.id === user?.id ? 'is-me' : ''} ${entry.rank <= 3 ? `top-${entry.rank}` : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <div className="lb-rank">
                {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
              </div>
              <div className="lb-avatar">{entry.avatarEmoji}</div>
              <div className="lb-info">
                <span className="lb-name">{entry.username}</span>
                <span className="lb-level">Lv.{entry.level} · {entry.wins}W</span>
              </div>
              <div className="lb-elo">
                <span className="lb-elo-value">{entry.elo}</span>
                <span className="lb-elo-label">ELO</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
