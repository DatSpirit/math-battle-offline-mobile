import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import type { CardType, Rarity } from '../../types/game';
import Card from '../shared/Card';
import './GachaRevealOverlay.css';

export interface GachaCard {
  value: string;
  type: CardType;
  rarity: Rarity;
  id?: string;
  stars?: number;
  level?: number;
  name?: string;
  flavorText?: string;
  abilityName?: string;
  abilityDesc?: string;
}

interface GachaRevealOverlayProps {
  cards: GachaCard[];
  onClose: () => void;
  title?: string;
}

const GachaCardItem: React.FC<{ card: GachaCard, isRevealed: boolean, onReveal: () => void, index: number, isSingle: boolean }> = ({ card, isRevealed, onReveal, index, isSingle }) => {
  const isSR = card.rarity === 'super';
  const isUR = card.rarity === 'ultra';

  return (
    <div className={`gro-card-wrapper ${isSingle ? 'gro-single-card' : ''}`} onClick={onReveal}>
      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div 
            key="back"
            className={`gro-card-back ${isUR ? 'shake' : ''}`}
            whileHover={{ scale: 1.05 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: isSR ? 0.6 : isUR ? 0.8 : 0.3 }}
          >
            <Star size={32} className={`text-white ${isUR ? 'text-red-500 opacity-100' : 'opacity-20'}`} />
          </motion.div>
        ) : (
          <motion.div 
            key="front"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            className={`gro-card-front ${isSR ? 'glow-sr' : isUR ? 'glow-ur' : ''}`}
            style={{ borderRadius: '16px' }}
            transition={{ duration: isSR ? 0.6 : isUR ? 0.8 : 0.3 }}
          >
            <Card {...card} id={`gro-reward-${index}`} isDraggable={false} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GachaRevealOverlay: React.FC<GachaRevealOverlayProps> = ({ 
  cards, 
  onClose, 
  title = "KHAI PHÁ THẺ BÀI",
}) => {
  const [revealed, setRevealed] = useState<boolean[]>(new Array(cards.length).fill(false));
  const [showcaseCard, setShowcaseCard] = useState<number | null>(null);
  const [isAutoOpening, setIsAutoOpening] = useState(false);

  const allRevealed = revealed.every(v => v);

  const handleReveal = (idx: number) => {
    setRevealed(prev => {
      if (prev[idx]) return prev;
      const next = [...prev];
      next[idx] = true;
      return next;
    });

    const card = cards[idx];
    if (card?.rarity === 'ultra') {
      setShowcaseCard(idx);
    }
  };

  const handleQuickOpen = async () => {
    if (isAutoOpening) return;
    setIsAutoOpening(true);

    for (let i = 0; i < cards.length; i++) {
      if (!revealed[i]) {
        const isUR = cards[i].rarity === 'ultra';
        
        // Reveal card
        handleReveal(i);
        
        if (isUR) {
          // Pause for Ultra card showcase
          await new Promise(resolve => setTimeout(resolve, 1500));
          setShowcaseCard(null);
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          // Normal card delay
          await new Promise(resolve => setTimeout(resolve, 250));
        }
      }
    }
    
    setIsAutoOpening(false);
  };

  const row1 = cards.slice(0, 2);
  const row2 = cards.slice(2, 5);
  const row3 = cards.slice(5, 8);
  const row4 = cards.slice(8, 10);

  return (
    <motion.div 
      className="gro-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => allRevealed && onClose()}
      style={{ cursor: allRevealed ? 'pointer' : 'default' }}
    >
      <div className="gro-content" onClick={() => allRevealed && onClose()}>
        <h2 className="gro-title">{title}</h2>
        
        <div className="gro-grid-dynamic">
          {row1.length > 0 && (
            <div className="gro-row">
              {row1.map((card, i) => <GachaCardItem key={i} card={card} isRevealed={revealed[i]} onReveal={() => handleReveal(i)} index={i} isSingle={cards.length === 1} />)}
            </div>
          )}
          {row2.length > 0 && (
            <div className="gro-row">
              {row2.map((card, i) => <GachaCardItem key={i+2} card={card} isRevealed={revealed[i+2]} onReveal={() => handleReveal(i+2)} index={i+2} isSingle={cards.length === 1} />)}
            </div>
          )}
          {row3.length > 0 && (
            <div className="gro-row">
              {row3.map((card, i) => <GachaCardItem key={i+5} card={card} isRevealed={revealed[i+5]} onReveal={() => handleReveal(i+5)} index={i+5} isSingle={cards.length === 1} />)}
            </div>
          )}
          {row4.length > 0 && (
            <div className="gro-row">
              {row4.map((card, i) => <GachaCardItem key={i+8} card={card} isRevealed={revealed[i+8]} onReveal={() => handleReveal(i+8)} index={i+8} isSingle={cards.length === 1} />)}
            </div>
          )}
        </div>

        <div className="gro-footer-actions">
          {!allRevealed && !isAutoOpening && (
            <button className="gro-quick-btn" onClick={handleQuickOpen}>MỞ NHANH</button>
          )}
        </div>

        {allRevealed && (
          <motion.p 
            className="gro-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            CHẠM BẤT KỲ ĐÂU ĐỂ TIẾP TỤC
          </motion.p>
        )}
      </div>

      <AnimatePresence>
        {showcaseCard !== null && (
          <motion.div 
            className="gro-showcase-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowcaseCard(null)}
          >
            <div className="gro-showcase-card">
              <Card {...cards[showcaseCard]} id="gro-showcase" isDraggable={false} />
            </div>
            <motion.p 
              className="gro-hint" 
              style={{ marginTop: '15rem', color: '#fff' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              CHẠM ĐỂ TIẾP TỤC
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GachaRevealOverlay;
