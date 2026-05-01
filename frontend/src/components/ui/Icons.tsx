import React from 'react';

// ─── Shared stroke props ───────────────────────────────────────────────────────
const S = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// ─── SunIcon ☀️ ────────────────────────────────────────────────────────────────
export const SunIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

// ─── MoonIcon 🌙 ───────────────────────────────────────────────────────────────
export const MoonIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
  </svg>
);

// ─── MusicNoteIcon 🎵 ─────────────────────────────────────────────────────────
export const MusicNoteIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

// ─── MicrophoneIcon 🎤 ────────────────────────────────────────────────────────
export const MicrophoneIcon: React.FC<{ className?: string; filled?: boolean }> = ({ className = 'w-5 h-5', filled }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    {filled ? (
      <>
        <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" />
        <path stroke="currentColor" d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" />
      </>
    ) : (
      <>
        <rect x="9" y="2" width="6" height="11" rx="3" stroke="currentColor" />
        <path stroke="currentColor" d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" />
      </>
    )}
  </svg>
);

// ─── CalendarIcon 📅 ──────────────────────────────────────────────────────────
export const CalendarIcon: React.FC<{ className?: string; filled?: boolean }> = ({ className = 'w-5 h-5', filled }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    {filled ? (
      <>
        <rect x="3" y="5" width="18" height="17" rx="2" fill="currentColor" opacity=".2" stroke="currentColor" />
        <path stroke="currentColor" d="M3 10h18M8 3v4M16 3v4" />
        <rect x="7" y="14" width="3" height="3" rx=".5" fill="currentColor" />
        <rect x="14" y="14" width="3" height="3" rx=".5" fill="currentColor" />
      </>
    ) : (
      <>
        <rect x="3" y="5" width="18" height="17" rx="2" stroke="currentColor" />
        <path stroke="currentColor" d="M3 10h18M8 3v4M16 3v4" />
        <rect x="7" y="14" width="3" height="3" rx=".5" fill="currentColor" />
        <rect x="14" y="14" width="3" height="3" rx=".5" fill="currentColor" />
      </>
    )}
  </svg>
);

// ─── BellIcon 🔔 ──────────────────────────────────────────────────────────────
export const BellIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

// ─── SearchIcon 🔍 ────────────────────────────────────────────────────────────
export const SearchIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

// ─── RefreshIcon 🔄 ───────────────────────────────────────────────────────────
export const RefreshIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

// ─── AlertIcon ⚠️ ─────────────────────────────────────────────────────────────
export const AlertIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="m10.29 3.86-8.18 14.17A1 1 0 0 0 3 19.5h18a1 1 0 0 0 .89-1.47L13.71 3.86a1 1 0 0 0-1.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// ─── StarIcon ⭐ ──────────────────────────────────────────────────────────────
export const StarIcon: React.FC<{ className?: string; filled?: boolean }> = ({ className = 'w-5 h-5', filled }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

// ─── FireIcon 🔥 ──────────────────────────────────────────────────────────────
export const FireIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

// ─── HeartIcon ❤️/🤍 ──────────────────────────────────────────────────────────
export const HeartIcon: React.FC<{ className?: string; filled?: boolean }> = ({ className = 'w-5 h-5', filled }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// ─── UsersIcon 👥 ─────────────────────────────────────────────────────────────
export const UsersIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// ─── UserIcon 👤 ──────────────────────────────────────────────────────────────
export const UserIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

// ─── TrendingUpIcon 📈 ────────────────────────────────────────────────────────
export const TrendingUpIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

// ─── ChartBarIcon 📊 ──────────────────────────────────────────────────────────
export const ChartBarIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
    <line x1="2" y1="20" x2="22" y2="20" />
  </svg>
);

// ─── SparkleIcon ✨ ───────────────────────────────────────────────────────────
export const SparkleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    <path d="m4.93 4.93 2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// ─── ListIcon 📋 ──────────────────────────────────────────────────────────────
export const ListIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

// ─── CheckCircleIcon ✅ ───────────────────────────────────────────────────────
export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

// ─── XCircleIcon ❌ ───────────────────────────────────────────────────────────
export const XCircleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

// ─── FrownIcon 😔 ─────────────────────────────────────────────────────────────
export const FrownIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <circle cx="12" cy="12" r="10" />
    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

// ─── MailIcon 📧 ──────────────────────────────────────────────────────────────
export const MailIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

// ─── DiscIcon 💿 ──────────────────────────────────────────────────────────────
export const DiscIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// ─── VinylIcon 📀 ─────────────────────────────────────────────────────────────
export const VinylIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    <path d="M12 2a10 10 0 0 1 7 2.9" strokeOpacity=".4" />
    <path d="M20.3 16A10 10 0 0 1 4 19.6" strokeOpacity=".4" />
  </svg>
);

// ─── SaveIcon 💾 ──────────────────────────────────────────────────────────────
export const SaveIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

// ─── LogoutIcon 🚪 ────────────────────────────────────────────────────────────
export const LogoutIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

// ─── TrophyIcon 🏆 ────────────────────────────────────────────────────────────
export const TrophyIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
  </svg>
);

// ─── MedalIcon 🥇🥈🥉 ────────────────────────────────────────────────────────
const MEDAL_COLORS: Record<number, string> = {
  1: '#f59e0b', // gold
  2: '#94a3b8', // silver
  3: '#cd7c2f', // bronze
};

export const MedalIcon: React.FC<{ className?: string; rank: 1 | 2 | 3 }> = ({ className = 'w-5 h-5', rank }) => {
  const color = MEDAL_COLORS[rank] ?? '#6b7280';
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="14" r="6" stroke={color} />
      <path d="M8 2h8l-2 6H10L8 2z" stroke={color} fill={`${color}33`} />
      <text x="12" y="18" textAnchor="middle" fontSize="8" fontWeight="bold" fill={color} stroke="none">{rank}</text>
    </svg>
  );
};

// ─── PinIcon 📍 ───────────────────────────────────────────────────────────────
export const PinIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// ─── ClockIcon ⏰ ─────────────────────────────────────────────────────────────
export const ClockIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// ─── GlobeIcon 🌍 ─────────────────────────────────────────────────────────────
export const GlobeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// ─── LightningIcon ⚡ ─────────────────────────────────────────────────────────
export const LightningIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

// ─── TargetIcon 🎯 ────────────────────────────────────────────────────────────
export const TargetIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

// ─── SeedlingIcon 🌱 ──────────────────────────────────────────────────────────
export const SeedlingIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M7 20h10" />
    <path d="M10 20c5.5-2.5.8-6.4 3-10" />
    <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
    <path d="M14.1 6a7 7 0 0 1 1.3 7.6c-1.5-.5-2.8-1.4-3.7-2.6 1-.8 1.7-2.2 2.4-5z" />
  </svg>
);

// ─── GuitarIcon 🎸 ────────────────────────────────────────────────────────────
export const GuitarIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="m11.25 11.25-4.34 4.34a1 1 0 0 0 0 1.42l.5.5a1 1 0 0 0 1.42 0l4.34-4.34" />
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    <path d="m14.12 9.88 2.54-2.54A2 2 0 0 0 17 6V4a1 1 0 0 1 2 0l1 1a1 1 0 0 1 0 1.41l-2.26 2.27" />
    <path d="m6.36 14.64-1.7 1.7a2 2 0 1 0 2.83 2.83l1.7-1.7" />
  </svg>
);

// ─── MasksIcon 🎭 ─────────────────────────────────────────────────────────────
export const MasksIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M2 12c0-3.87 3.13-7 7-7 1.93 0 3.68.78 4.95 2.05" />
    <path d="M9 17c-3.87 0-7-3.13-7-7" />
    <path d="M7 9h4" />
    <path d="M8 13a1 1 0 0 0 2 0" />
    <path d="M15 5c3.87 0 7 3.13 7 7" />
    <path d="M22 12c0 3.87-3.13 7-7 7" />
    <path d="M13 9h4" />
    <path d="M15 13c0 .55.45 1 1 1s1-.45 1-1" />
  </svg>
);

// ─── RainbowIcon 🌈 ───────────────────────────────────────────────────────────
export const RainbowIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 17a10 10 0 0 0-20 0" stroke="#ef4444" strokeWidth={1.75} />
    <path d="M6 17a6 6 0 0 1 12 0" stroke="#f59e0b" strokeWidth={1.75} />
    <path d="M10 17a2 2 0 0 1 4 0" stroke="#10b981" strokeWidth={1.75} />
  </svg>
);

// ─── MusicalNotesIcon 🎼 ──────────────────────────────────────────────────────
export const MusicalNotesIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
    <path d="M9 9l12-2" />
  </svg>
);

// ─── WaveIcon 👋 ──────────────────────────────────────────────────────────────
export const WaveIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" {...S}>
    <path d="M18.4 5.6a2 2 0 0 0-2.83 0l-.59.59L14 5.17a2 2 0 0 0-2.83 2.83l.41.41" />
    <path d="M12.17 7.41 8.59 3.83a2 2 0 0 0-2.83 2.83l5.07 5.07" />
    <path d="M14.42 9.66 10 5.24" />
    <path d="M5.41 11.24A3 3 0 0 0 5 12.83v.34A8 8 0 0 0 13 21h0a8 8 0 0 0 8-8 6 6 0 0 0-6-6h0" />
  </svg>
);

// ─── HomeIcon 🏠 ──────────────────────────────────────────────────────────────
export const HomeIcon: React.FC<{ className?: string; filled?: boolean }> = ({ className = 'w-6 h-6', filled }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    {filled ? (
      <path fill="currentColor" d="M10.707 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 19 11h-1v9a1 1 0 0 1-1 1h-4v-5h-2v5H7a1 1 0 0 1-1-1v-9H5a1 1 0 0 1-.707-1.707l7-7Z" />
    ) : (
      <path stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
        d="m3 12 9-9 9 9M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" />
    )}
  </svg>
);
