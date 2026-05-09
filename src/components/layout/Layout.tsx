import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MobileHeader from './MobileHeader';
import MobileNavbar from './MobileNavbar';
import { usePlayerStore } from '../../store/playerStore';
import AchievementToast from '../feedback/AchievementToast';
import RewardToast from '../feedback/RewardToast';
import NotificationToast from '../feedback/NotificationToast';
import ConfirmModal from '../feedback/ConfirmModal';

const Layout: React.FC = () => {
  const location = useLocation();
  const performanceMode = usePlayerStore(s => s.performanceMode);
  const isArena = location.pathname.includes('/battle/arena');
  const showNav = !isArena;

  return (
    <div className={`flex h-dvh overflow-hidden bg-[#fcf9f2] text-on-surface font-body flex-col perf-${performanceMode.toLowerCase()}`}>
      {showNav && <MobileHeader />}
      
      {/* Structural Spacer: Ensures content starts below the fixed header */}
      {showNav && <div className='h-[calc(3.5rem+env(safe-area-inset-top,0))]' />}

      <main className={`flex-1 overflow-y-auto relative flex flex-col ${showNav ? 'pb-24' : ''}`}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col w-full"
            style={{ minHeight: 0 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {showNav && <MobileNavbar />}

      <AchievementToast />
      <RewardToast />
      <NotificationToast />
      <ConfirmModal />
    </div>
  );
};

export default Layout;
