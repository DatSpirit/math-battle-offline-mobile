import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { usePerformance } from '../../hooks/usePerformance';
import Card, { type CardProps } from './Card';

interface DraggableCardProps extends CardProps {
  id: string; // Required for DND
  layoutId?: string; // For Framer Motion
  isDraggable?: boolean;
  sourceSlot?: number; // For arena cards
  [key: string]: unknown;
}

const DraggableCard: React.FC<DraggableCardProps> = (props) => {
  const { 
    id, 
    layoutId, 
    isDraggable = true, 
    isLocked, 
    isFaceDown, 
    style: customStyle,
    className: customClassName,
    ...cardProps 
  } = props;
  
  const canDrag = isDraggable && !isLocked && !isFaceDown;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { ...props },
    disabled: !canDrag,
  });

  // Use transform from dnd-kit if we are dragging (for visual feedback before overlay takes over)
  // Actually, dnd-kit handles the overlay separately, but we want the original to disappear.
  
  const { isEco, isUltra } = usePerformance();

  return (
    <motion.div
      ref={setNodeRef}
      layout={isEco ? false : !isDragging}
      layoutId={isEco ? undefined : (isDragging ? undefined : layoutId)}
      className={`draggable-card-wrapper ${customClassName || ''}`}
      style={{
        ...customStyle,
        position: (customStyle?.position as React.CSSProperties['position']) || 'relative',
        touchAction: 'none',
        display: 'inline-block',
        minWidth: '10px',
        minHeight: '10px',
        opacity: isDragging ? (isUltra ? 0.35 : 0.5) : 1,
        filter: isDragging ? (isUltra ? 'grayscale(40%)' : 'none') : 'none',
        zIndex: isDragging ? 999 : (customStyle?.zIndex as number || 1),
        pointerEvents: 'auto',
      }}
      whileTap={isEco ? {} : (canDrag ? { scale: 1.05, rotate: isUltra ? -2 : -1 } : {})}
      transition={isEco ? { duration: 0 } : { 
         type: "spring", 
         stiffness: isUltra ? 500 : 300, 
         damping: isUltra ? 30 : 25,
      }}
      {...(canDrag ? { ...listeners, ...attributes } : {})}
    >
      <div className="draggable-card-content relative">
        <Card 
          {...cardProps} 
          id={id}
          isLocked={isLocked}
          isFaceDown={isFaceDown}
        />
      </div>
    </motion.div>
  );
};

export default DraggableCard;
