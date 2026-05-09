import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { AVATAR_OPTIONS } from '../../types/auth.types';
import './Onboarding.css';

const OnboardingPage: React.FC = () => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const { enterName } = useAuthStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length >= 2) {
      enterName(name.trim(), selectedAvatar);
    }
  };

  return (
    <div className="onboarding-container">
      <motion.div 
        className="onboarding-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="onboarding-header">
          <motion.h1 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            Chào mừng Chiến Binh!
          </motion.h1>
          <p>Nhập tên của bạn để bắt đầu cuộc hành trình toán học</p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="input-group">
            <label htmlFor="playerName">Tên nhân vật</label>
            <input
              id="playerName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên từ 2-20 ký tự..."
              maxLength={20}
            />
          </div>

          <div className="avatar-selection">
            <label>Chọn linh thú đại diện</label>
            <div className="avatar-grid">
              {AVATAR_OPTIONS.map((avatar) => (
                <motion.button
                  key={avatar}
                  type="button"
                  className={`avatar-item ${selectedAvatar === avatar ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(avatar)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="avatar-emoji">{avatar}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            type="submit"
            className="submit-button"
            disabled={name.trim().length < 2}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            VÀO TRẬN!
          </motion.button>
        </form>
      </motion.div>
      
      <div className="onboarding-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
    </div>
  );
};

export default OnboardingPage;
