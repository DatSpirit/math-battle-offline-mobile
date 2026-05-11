/**
 * ATOM: Math Card (PURE UI)
 * SKILL_UI: Atomic Design Layer 1
 * 
 * Pure visual component. No DND or Layout logic inside.
 */
import React from 'react';
import type { CardType, Rarity } from '../../types/game';
import { CARD_METADATA, resolveAbilityDesc } from '../../data/cardMetadata';
import { usePerformance } from '../../hooks/usePerformance';
import './Card.css';

export interface CardProps {
  id?: string; // Keep for type compatibility
  value: string;
  isDraggable?: boolean; // Keep for compatibility, not used in Pure UI
  type?: CardType;
  rarity?: Rarity;
  stars?: number;
  redStars?: number;
  level?: number;
  name?: string;
  abilityName?: string;
  abilityDesc?: string;
  isSelected?: boolean;
  isLocked?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  style?: React.CSSProperties;
  isGlowing?: boolean;
  isFaceDown?: boolean;
  className?: string;
}

const StarBar: React.FC<{ count: number, redCount?: number }> = ({ count, redCount = 0 }) => {
  return (
    <div className="card-star-bar">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`mini-star ${s <= redCount ? 'red-active' : s <= count ? 'active' : ''}`}>★</span>
      ))}
    </div>
  );
};

const Card: React.FC<CardProps> = ({
  value,
  type = 'number',
  rarity = 'normal',
  stars = 0,
  redStars = 0,
  level = 0,
  name: propName,
  abilityName: propAbilityName,
  abilityDesc: propAbilityDesc,
  isSelected = false,
  isLocked = false,
  onClick,
  onDoubleClick,
  style: customStyle,
  isGlowing = false,
  isFaceDown = false,
  className = '',
}) => {
  const { isEco } = usePerformance();

  if (isFaceDown) {
    return (
      <div 
        className={`math-card math-card--back relative rounded-xl bg-[#2A1A12] border-2 border-[#5A3A22] shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center overflow-hidden ${className}`}
        style={customStyle}
      >
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #FF9900 2px, transparent 2px)',
          backgroundSize: '16px 16px'
        }} />
        <div className="w-10 h-10 rounded-full border-2 border-[#FF9900]/30 flex items-center justify-center relative z-10 bg-black/40">
          <span className="text-[#FF9900]/60 text-xl font-display font-black">?</span>
        </div>
      </div>
    );
  }

  const meta = CARD_METADATA[value];
  const name = propName ?? meta?.name;
  
  const finalAbilityName = propAbilityName ?? meta?.abilityName;
  const finalAbilityDesc = propAbilityDesc ?? resolveAbilityDesc(value, rarity);

  const inlineStyle: React.CSSProperties = {
    ...customStyle,
    opacity: isLocked ? 0.45 : 1,
    cursor: isLocked ? 'not-allowed' : 'pointer',
  };

  return (
    <div
      translate="no"
      className={[
        'math-card',
        `math-card--${type}`,
        `math-card--${rarity}`,
        isSelected ? 'math-card--selected' : '',
        isGlowing ? 'math-card--glowing' : '',
        redStars > 0 ? 'math-card--has-red-star' : '',
        className
      ].join(' ')}
      onClick={!isLocked ? onClick : undefined}
      onDoubleClick={!isLocked ? onDoubleClick : undefined}
      style={inlineStyle}
    >
      {rarity !== 'normal' && !isEco && <div className="card-fx-layer card-shimmer" aria-hidden />}
      
      {finalAbilityDesc && (
        <div className="card-tooltip">
          <span className="tooltip-title">{finalAbilityName || 'Kỹ Năng'}</span>
          <p className="tooltip-text">{finalAbilityDesc}</p>
        </div>
      )}

      <div className="card-inner">
        <div className="card-header">
          <StarBar count={stars} redCount={redStars} />
          <div 
            className="card-rarity-badge"
            style={{ 
              background: 'transparent',
              border: `1.5px solid ${rarity === 'ultra' ? '#ef4444' : 
                                     rarity === 'super' ? '#f97316' : 
                                     rarity === 'rare' ? '#22c55e' : '#666666'}`,
              color: rarity === 'ultra' ? '#ef4444' : 
                     rarity === 'super' ? '#f97316' : 
                     rarity === 'rare' ? '#22c55e' : '#666666'
            }}
          >
            <span>
              {rarity === 'normal' ? 'N' : rarity === 'rare' ? 'R' : rarity === 'super' ? 'SR' : 'UR'}
            </span>
          </div>
        </div>

        <div className="card-body">
          <span className="card-value">{value === '*' ? '×' : value === '/' ? '÷' : value}</span>
          <div className="card-main-info">
            {name && <span className="card-name-label">{name}</span>}
          </div>
        </div>

        <div className="card-footer">
          <span className="card-type-tag">{type === 'operator' ? 'OP' : 'NUM'}</span>
          {level > 0 && <span className="card-lv-tag"><span>Lv.</span>{level}</span>}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Card);
