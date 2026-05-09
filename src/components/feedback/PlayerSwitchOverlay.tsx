import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PlayerSwitchOverlay.css';

interface PlayerSwitchOverlayProps {
  isVisible: boolean;
  playerName: string;
  onReady: () => void;
}

const PlayerSwitchOverlay: React.FC<PlayerSwitchOverlayProps> = ({ isVisible, playerName, onReady }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="player-switch-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="overlay-content"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
          >
            <div className="switch-icon">🔁</div>
            <h2>Đến lượt của</h2>
            <h1 className="target-player-name">{playerName}</h1>
            <p>Hãy chuyền máy cho {playerName}</p>
            
            <motion.button
              className="ready-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onReady}
            >
              TÔI ĐÃ SẴN SÀNG
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PlayerSwitchOverlay;
