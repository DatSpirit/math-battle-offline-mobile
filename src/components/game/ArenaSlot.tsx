import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import './BattleArena.css';

interface ArenaSlotProps {
  id: string;
  isOccupied?: boolean;
  isGlowing?: boolean;
  children?: React.ReactNode;
}

const ArenaSlot: React.FC<ArenaSlotProps> = ({ id, isOccupied, isGlowing, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <motion.div 
      ref={setNodeRef}
      animate={{ 
        scale: isOver ? 1.1 : 1,
        borderColor: isOver ? 'var(--accent-primary)' : 'rgba(139, 80, 0, 0.15)',
        backgroundColor: isOver ? 'rgba(139, 80, 0, 0.05)' : 'rgba(255, 255, 255, 0.5)'
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`arena-slot ${isOccupied ? 'occupied' : 'empty'} ${isOver ? 'over' : ''}`}
      style={isGlowing ? { overflow: 'visible', zIndex: 1000, position: 'relative' } : undefined}
    >
      {children || <div className="slot-placeholder">+</div>}
    </motion.div>
  );
};


export default React.memo(ArenaSlot);
