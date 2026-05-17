import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { AVATAR_OPTIONS } from '../../types/auth.types';
import './Onboarding.css';

type AuthTab = 'offline' | 'login' | 'signup';

const OnboardingPage: React.FC = () => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [tab, setTab] = useState<AuthTab>('offline');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { enterName, signInWithGoogle, signInWithEmail, signUpWithEmail, isLoading } = useAuthStore();

  const handleOfflineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length >= 2) {
      enterName(name.trim(), selectedAvatar);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    await signInWithGoogle();
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await signInWithEmail(email, password);
    if (result?.error) setError(result.error);
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (name.trim().length < 2) { setError('Tên phải có ít nhất 2 ký tự'); return; }
    const result = await signUpWithEmail(email, password, name.trim());
    if (result?.error) setError(result.error);
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

        {/* ─── Tab Switcher ─── */}
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${tab === 'offline' ? 'active' : ''}`}
            onClick={() => { setTab('offline'); setError(''); }}
          >
            ⚡ Chơi Ngay
          </button>
          <button 
            className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            🌐 Đăng Nhập
          </button>
          <button 
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError(''); }}
          >
            ✨ Đăng Ký
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* ─── OFFLINE TAB (giữ nguyên logic cũ) ─── */}
          {tab === 'offline' && (
            <motion.form
              key="offline"
              onSubmit={handleOfflineSubmit}
              className="onboarding-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
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

              <p className="offline-note">⚠️ Chế độ offline — tiến trình chỉ lưu trên máy này</p>

              <motion.button
                type="submit"
                className="submit-button"
                disabled={name.trim().length < 2}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                VÀO TRẬN!
              </motion.button>
            </motion.form>
          )}

          {/* ─── LOGIN TAB ─── */}
          {tab === 'login' && (
            <motion.div
              key="login"
              className="onboarding-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                type="button"
                className="google-button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="google-icon">G</span>
                Đăng nhập bằng Google
              </motion.button>

              <div className="divider"><span>hoặc</span></div>

              <form onSubmit={handleEmailLogin} className="email-form">
                <div className="input-group">
                  <label htmlFor="loginEmail">Email</label>
                  <input
                    id="loginEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="loginPassword">Mật khẩu</label>
                  <input
                    id="loginPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                {error && <p className="auth-error">❌ {error}</p>}

                <motion.button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading || !email || !password}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* ─── SIGNUP TAB ─── */}
          {tab === 'signup' && (
            <motion.form
              key="signup"
              onSubmit={handleEmailSignup}
              className="onboarding-form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="input-group">
                <label htmlFor="signupName">Tên nhân vật</label>
                <input
                  id="signupName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên từ 2-20 ký tự..."
                  maxLength={20}
                  required
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

              <div className="input-group">
                <label htmlFor="signupEmail">Email</label>
                <input
                  id="signupEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="signupPassword">Mật khẩu</label>
                <input
                  id="signupPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ít nhất 6 ký tự"
                  required
                  minLength={6}
                />
              </div>

              {error && <p className="auth-error">❌ {error}</p>}

              <motion.button
                type="submit"
                className="submit-button"
                disabled={isLoading || !email || !password || name.trim().length < 2}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isLoading ? 'ĐANG XỬ LÝ...' : 'TẠO TÀI KHOẢN'}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
      
      <div className="onboarding-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
    </div>
  );
};

export default OnboardingPage;
