import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useEffect } from 'react';

import Layout from './components/layout/Layout';
import HomePage from './pages/Home/HomePage';
import GamePage from './pages/Game/GamePage';
import QuestsPage from './pages/Quests/QuestsPage';
import DecksPage from './pages/Decks/DecksPage';
import ShopPage from './pages/Shop/ShopPage';
import HistoryPage from './pages/History/HistoryPage';
import ErrorBoundary from './components/shared/ErrorBoundary';
import OnboardingPage from './pages/Onboarding/OnboardingPage';
import CampaignMapPage from './pages/Home/CampaignMapPage';
import SummonPage from './pages/Summon/SummonPage';
import { useAuthStore } from './store/authStore';
import { usePlayerStore } from './store/playerStore';
import { useUIStore } from './store/uiStore';
import { useSound } from './hooks/useSound';
import { detectHardwarePerformance } from './utils/performance';
import LoadingScreen from './components/feedback/LoadingScreen';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/onboarding" />;
}

/**
 * Component xử lý hiển thị Loading Screen tự động khi chuyển trang
 */
function PageLoader() {
  const { pathname } = useLocation();
  const { isLoading, setIsLoading } = useUIStore();
  const [isFirstLoad, setIsFirstLoad] = React.useState(true);

  useEffect(() => {
    // Chỉ hiển thị loading khi chuyển trang, hoặc lần đầu vào app
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (isFirstLoad) setIsFirstLoad(false);
    }, 1200);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, setIsLoading, isFirstLoad]);

  // Kích hoạt loading khi pathname thay đổi
  useEffect(() => {
    if (!isFirstLoad) {
      setIsLoading(true);
    }
  }, [pathname, setIsLoading, isFirstLoad]);

  return <LoadingScreen isLoading={isLoading} />;
}

function App() {
  const { checkAndResetQuests, hasHydrated, performanceMode, setPerformanceMode } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();
  const { playBGM } = useSound();

  if (!hasHydrated) return <LoadingScreen isLoading={true} message="Đang nạp dữ liệu..." />;


  useEffect(() => {
    // Tự động nhận diện cấu hình máy nếu chưa có thiết lập (lần đầu chạy)
    if (hasHydrated && !localStorage.getItem('math-battle-perf-set')) {
      const detected = detectHardwarePerformance();
      setPerformanceMode(detected);
      localStorage.setItem('math-battle-perf-set', 'true');
    }
  }, [hasHydrated, setPerformanceMode]);

  useEffect(() => {
    const mode = performanceMode ?? 'BALANCED';
    document.body.classList.remove('perf-eco', 'perf-balanced', 'perf-ultra', 'lite-mode');
    document.body.classList.add(`perf-${mode.toLowerCase()}`);
    
    if (mode === 'ECO') {
      document.body.classList.add('lite-mode');
    }
  }, [performanceMode]);


  useEffect(() => {
    checkAndResetQuests();
    
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
  }, [checkAndResetQuests, isAuthenticated, playBGM]);

  return (
    <ErrorBoundary>
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
            <Route path="campaign" element={<CampaignMapPage />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

