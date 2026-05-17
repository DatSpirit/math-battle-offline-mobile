import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';

import Layout from './components/layout/Layout';
import HomePage from './pages/Home/HomePage';
import GamePage from './pages/Game/GamePage';
import QuestsPage from './pages/Quests/QuestsPage';
import DecksPage from './pages/Decks/DecksPage';
import ShopPage from './pages/Shop/ShopPage';
import ShopSuccessPage from './pages/Shop/ShopSuccessPage';
import HistoryPage from './pages/History/HistoryPage';
import ErrorBoundary from './components/shared/ErrorBoundary';
import OnboardingPage from './pages/Onboarding/OnboardingPage';
import CampaignMapPage from './pages/Home/CampaignMapPage';
import SummonPage from './pages/Summon/SummonPage';
import PvPPage from './pages/PvP/PvPPage';
import LeaderboardPage from './pages/Leaderboard/LeaderboardPage';
import { useAuthStore } from './store/authStore';
import { usePlayerStore } from './store/playerStore';
import { useUIStore } from './store/uiStore';
import { useSound } from './hooks/useSound';
import { detectHardwarePerformance } from './utils/performance';
import LoadingScreen from './components/feedback/LoadingScreen';
import AppSetupScreen from './components/feedback/AppSetupScreen';
import { AnimatePresence } from 'framer-motion';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/onboarding" />;
}

/**
 * Component xử lý hiển thị Loading Screen tự động khi chuyển trang
 */
function PageLoader() {
  const { pathname } = useLocation();
  const { isLoading, setIsLoading, setLoadingProgress } = useUIStore();
  const [isFirstLoad, setIsFirstLoad] = React.useState(true);

  useEffect(() => {
    if (!isLoading) return;

    let progress = 0;
    const interval = setInterval(() => {
      // Simulate progress: Fast at first, slows down at the end
      const remaining = 100 - progress;
      const step = Math.max(1, remaining * 0.2);
      progress += step;
      
      if (progress >= 99) {
        progress = 100;
        setLoadingProgress(100);
        clearInterval(interval);
        
        // Give time for the progress bar to show 100% and exit
        setTimeout(() => {
          setIsLoading(false);
          if (isFirstLoad) setIsFirstLoad(false);
        }, 300);
      } else {
        setLoadingProgress(progress);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [isLoading, setIsLoading, setLoadingProgress, isFirstLoad]);

  // Kích hoạt loading khi pathname thay đổi
  useEffect(() => {
    setLoadingProgress(0);
    setIsLoading(true);
  }, [pathname, setIsLoading, setLoadingProgress]);

  return <LoadingScreen isLoading={isLoading} />;
}

function App() {
  const { checkAndResetQuests, hasHydrated, performanceMode, setPerformanceMode, isPerformanceSet, setIsPerformanceSet } = usePlayerStore();
  const { isAuthenticated, initAuthListener } = useAuthStore();
  const { playBGM } = useSound();
  const { appInitialized } = useUIStore();

  // Khởi tạo Supabase auth listener (Google OAuth redirect, session recovery)
  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  useEffect(() => {
    // Tự động nhận diện cấu hình máy nếu chưa có thiết lập (lần đầu chạy)
    if (hasHydrated && !isPerformanceSet) {
      const detected = detectHardwarePerformance();
      setPerformanceMode(detected);
      setIsPerformanceSet(true);
    }
  }, [hasHydrated, isPerformanceSet, setPerformanceMode, setIsPerformanceSet]);

  useEffect(() => {
    const mode = performanceMode ?? 'BALANCED';
    document.body.classList.remove('perf-eco', 'perf-balanced', 'perf-ultra', 'lite-mode');
    document.body.classList.add(`perf-${mode.toLowerCase()}`);
    
    if (mode === 'ECO') {
      document.body.classList.add('lite-mode');
    }
  }, [performanceMode]);


  useEffect(() => {
    if (hasHydrated) {
      checkAndResetQuests();
    }
    
    const handleFirstInteraction = () => {
      if (isAuthenticated) {
        playBGM();
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [checkAndResetQuests, isAuthenticated, playBGM, hasHydrated]);

  if (!hasHydrated) {
    return <LoadingScreen isLoading={true} message="Đang nạp dữ liệu..." />;
  }

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        {!appInitialized && <AppSetupScreen key="setup" />}
      </AnimatePresence>
      
      <Router>
        <PageLoader />
        <Routes>
          <Route 
            path="/onboarding" 
            element={isAuthenticated ? <Navigate to="/" /> : <OnboardingPage />} 
          />
          
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<HomePage />} />
            <Route path="battle/arena" element={<GamePage />} />
            <Route path="summon" element={<SummonPage />} />
            <Route path="quests" element={<QuestsPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="decks" element={<DecksPage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="shop/success" element={<ShopSuccessPage />} />
            <Route path="campaign" element={<CampaignMapPage />} />
            <Route path="pvp" element={<PvPPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}


export default App;

