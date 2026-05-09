import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  fill?: string;
}

export const SwordIcon: React.FC<IconProps> = ({ size = 20, className = '', style, fill }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill={fill || "currentColor"}>
    <path d="M6.92 5H5l9 9 1-.94m4.96 6.06-.56.56a1 1 0 0 1-1.41 0l-4.24-4.24 1.41-1.41 4.24 4.24a1 1 0 0 1 .01 1.41zM3.66 15.9 2.24 17.31A1 1 0 0 0 3.66 18.73l1.11-1.12-1.11-1.71zM14.41 4.83 12.29 2.7a1 1 0 0 0-1.41 0L9.17 4.41l1.41 1.41.71-.71 1.42 1.41-1.42 1.42 1.41 1.41 2.83-2.83a1 1 0 0 0-.12-1.29z"/>
    <path d="m2.41 9.41 1.42 1.41L5.24 9.41l1.41 1.42-1.41 1.41 1.41 1.42 2.83-2.83a1 1 0 0 0 0-1.41L7.07 7.01a1 1 0 0 0-1.41 0L2.41 10.24v-.83z"/>
  </svg>
);

export const ShieldIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
  </svg>
);

export const ShieldCheckIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
  </svg>
);


export const StarIcon: React.FC<IconProps> = ({ size = 20, className = '', style, fill }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill={fill || "currentColor"}>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);

export const ScrollIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
  </svg>
);

export const LayersIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/>
  </svg>
);

export const CartIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.9 18 9 18h12v-2H9.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 23.5 5H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
  </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

export const CoinIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
  </svg>
);

export const GemIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 2L2 8l10 14L22 8l-4-6H6zm6 14.5L3.5 8.5 6.5 4h11l3 4.5L12 16.5z"/>
  </svg>
);

export const PlayIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

export const FlagIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
  </svg>
);

export const BotIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H4a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M7 15h2v2H7v-2m8 0h2v2h-2v-2m-4 1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
  </svg>
);

export const BrainIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M21.33 12.91a3 3 0 1 0-4.24 0l2.12 2.12 2.12-2.12zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
  </svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08-2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
  </svg>
);

export const TrophyIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V18H8v2h8v-2h-3v-2.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM7 11.7C5.84 11.37 5 10.28 5 9V7h2v4.7zM19 9c0 1.28-.84 2.37-2 2.7V7h2v2z"/>
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
  </svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
  </svg>
);

export const LightbulbIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>
  </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

export const GiftIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 6h-2.18c.07-.23.18-.5.18-.82C18 3.88 16.12 2 13.82 2c-1.19 0-2.28.51-3.01 1.41L12 4.48l-1.81-1.07C9.46 2.51 8.37 2 7.18 2 4.88 2 3 3.88 3 6.18c0 .32.11.59.18.82H1v2h22V6h-3zM7.18 6c-.65 0-1.18-.53-1.18-1.18C6 4.23 6.53 4 7.18 4c.65 0 1.18.53 1.18 1.18C8.36 5.47 7.83 6 7.18 6zm9.64 0c-.65 0-1.18-.53-1.18-1.18C15.64 4.23 16.17 4 16.82 4 17.47 4 18 4.53 18 5.18 18 5.83 17.47 6 16.82 6zM3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-1H3v1z"/>
    <path d="M11 10H3v8h8v-8zm-2 6H5v-4h4v4zm10-6h-8v8h8v-8zm-2 6h-4v-4h4v4z"/>
  </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L9.5 7.5 4 10l5.5 2.5L12 18l2.5-5.5L20 10l-5.5-2.5z"/>
    <path d="M5 4L4 6.5 1.5 8 4 9.5 5 12l1-2.5L8.5 8 6 6.5z" opacity=".7"/>
    <path d="M19 12l-1 2.5-2.5 1.5 2.5 1-1 2.5 1-2.5 2.5-1-2.5-1z" opacity=".7"/>
  </svg>
);

export const XIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);

export const ArrowUpIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
  </svg>
);

export const ZapIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
  </svg>
);

export const FlameIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2c0 0-2 4-2 6s1 3 3 4c-3 0-5-3-5-6 0 2.21 1.79 4 4 4 0-2-1.5-4-1.5-6 0 5 4 8 4 8s1-1 1-3c0-4-4-7-4-7z"/>
  </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
  </svg>
);

export const InfoIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
);

export const MedalIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 4.8 5.3.8-3.8 3.7.9 5.3L12 14.1 7.2 16.6l.9-5.3-3.8-3.7 5.3-.8L12 2z"/>
    <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" opacity=".2"/>
  </svg>
);
export const SearchIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

export const UserPlusIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

export const LoaderIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

export const XCircleIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

export const CreditCardIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
  </svg>
);

export const PackageIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

export const TrendingUpIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
export const VolumeIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);

export const VolumeMuteIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>
  </svg>
);

export const LogOutIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export const UserIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

export const CrownIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1h14z"/>
  </svg>
);

export const LockIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-9h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9V6z"/>
  </svg>
);

export const CoinsIcon = CoinIcon;

export const PlusIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export const MinusIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

export const MapIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="m20.5 3-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>
  </svg>
);

export const ActivityIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

export const TargetIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
  </svg>
);

export const BookOpenIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
  </svg>
);

export const AwardIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
);

export const AlertTriangleIcon: React.FC<IconProps> = ({ size = 20, className = '', style }) => (
  <svg width={size} height={size} className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export const TimerIcon = ClockIcon;
