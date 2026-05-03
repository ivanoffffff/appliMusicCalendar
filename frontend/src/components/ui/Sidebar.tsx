import React from 'react';
import logo from '../../assets/logo.svg';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { SunIcon, MoonIcon, HomeIcon, MicrophoneIcon, CalendarIcon } from './Icons';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard',  Icon: HomeIcon       },
  { path: '/artists',   label: 'Artistes',   Icon: MicrophoneIcon },
  { path: '/releases',  label: 'Calendrier', Icon: CalendarIcon   },
];

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const Sidebar: React.FC = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  let theme       = 'dark';
  let toggleTheme = () => {};
  try {
    const ctx = useTheme();
    theme       = ctx.theme;
    toggleTheme = ctx.toggleTheme;
  } catch {}

  const isActive = (path: string) => location.pathname === path;
  const initials  = (user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase();

  return (
    <aside className="fixed left-0 top-0 h-full z-50 flex flex-col w-14 md:w-60">
      {/* Glass background */}
      <div className="absolute inset-0 bg-white/90 dark:bg-[#0a0a1e]/95 backdrop-blur-xl border-r border-gray-100/80 dark:border-white/5" />

      <div className="relative flex flex-col h-full py-4 px-2 md:px-3">

        {/* ── Logo ── */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center md:justify-start gap-3 mb-8 md:px-2 group cursor-pointer"
          title="Dashboard"
        >
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-primary-500/20 dark:bg-primary-400/25 rounded-lg blur-md group-hover:blur-lg transition-all duration-300" />
            <img src={logo} alt="Music Tracker" className="relative w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="hidden md:block text-base font-black gradient-text whitespace-nowrap">Music Tracker</span>
        </button>

        {/* ── Navigation ── */}
        <nav className="flex flex-col gap-1 flex-1">
          <p className="hidden md:block text-[10px] font-bold text-secondary uppercase tracking-widest px-3 mb-2">Navigation</p>
          {NAV_ITEMS.map(({ path, label, Icon }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={label}
                className={`relative flex items-center justify-center md:justify-start gap-3 md:px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer group ${
                  active
                    ? 'bg-gradient-to-r from-primary-500/10 to-accent-500/10 text-primary-600 dark:text-primary-300'
                    : 'text-secondary hover:text-primary hover:bg-gray-100/80 dark:hover:bg-white/5'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-gradient-to-b from-primary-500 to-accent-500" />
                )}
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`}
                  filled={active}
                />
                <span className="hidden md:block">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Bas de sidebar ── */}
        <div className="flex flex-col gap-1">
          {/* Toggle thème */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            className="flex items-center justify-center md:justify-start gap-3 md:px-3 py-2.5 rounded-xl text-sm font-semibold text-secondary hover:text-primary hover:bg-gray-100/80 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
          >
            {theme === 'dark'
              ? <SunIcon className="w-5 h-5 text-amber-400 shrink-0" />
              : <MoonIcon className="w-5 h-5 shrink-0" />
            }
            <span className="hidden md:block">{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
          </button>

          {/* Divider */}
          <div className="h-px bg-gray-100 dark:bg-white/5 mx-1 my-1" />

          {/* Profil */}
          <button
            onClick={() => navigate('/settings/notifications')}
            title="Paramètres"
            className="flex items-center justify-center md:justify-start gap-3 md:px-3 py-2.5 rounded-xl hover:bg-gray-100/80 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer group"
          >
            <div className="relative shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md group-hover:shadow-glow group-hover:scale-105 transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
              >
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white dark:border-[#0a0a1e] rounded-full" />
            </div>
            <div className="hidden md:flex flex-1 items-center justify-between min-w-0">
              <div className="min-w-0">
                <p className="text-sm font-bold text-primary truncate">{user?.firstName || user?.username}</p>
                <p className="text-[11px] text-secondary">Connecté</p>
              </div>
              <SettingsIcon className="w-4 h-4 text-secondary group-hover:text-primary transition-colors shrink-0 ml-2" />
            </div>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
