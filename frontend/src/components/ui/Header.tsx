import React from 'react';
import logo from '../../assets/logo.svg';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSpotifyPlayer } from '../../contexts/SpotifyPlayerContext';
import { SunIcon, MoonIcon, HomeIcon, MicrophoneIcon, CalendarIcon } from './Icons';

const NAV_MOBILE = [
  { path: '/dashboard', label: 'Accueil',    Icon: HomeIcon        },
  { path: '/artists',   label: 'Artistes',   Icon: MicrophoneIcon  },
  { path: '/releases',  label: 'Calendrier', Icon: CalendarIcon    },
];

const Header: React.FC = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  let theme       = 'dark';
  let toggleTheme = () => {};
  try {
    const ctx = useTheme();
    theme       = ctx.theme;
    toggleTheme = ctx.toggleTheme;
  } catch {
    console.warn('ThemeProvider not available');
  }

  const { currentTrack } = useSpotifyPlayer();
  const hasPlayer = !!currentTrack;

  const isActive = (path: string) => location.pathname === path;
  const initials  = (user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase();

  return (
    <>
      {/* ══════════ HEADER MOBILE UNIQUEMENT ══════════ */}
      <header className="md:hidden sticky top-0 z-50 animate-slide-down">
        <div className="absolute inset-0 bg-white/80 dark:bg-[#0a0a1e]/85 backdrop-blur-xl border-b border-gray-100/80 dark:border-white/5" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary-400/30 dark:via-primary-500/20 to-transparent" />

        <div className="relative px-4">
          <div className="flex items-center justify-between h-14 gap-4">

            {/* Logo */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2.5 group shrink-0 cursor-pointer"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 dark:bg-primary-400/25 rounded-lg blur-md group-hover:blur-lg transition-all duration-300" />
                <img src={logo} alt="Music Tracker" className="relative w-7 h-7" />
              </div>
              <span className="text-sm font-black gradient-text">Music Tracker</span>
            </button>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100/80 dark:bg-white/5 text-secondary transition-all duration-200 cursor-pointer"
              >
                {theme === 'dark'
                  ? <SunIcon className="w-4 h-4 text-amber-400" />
                  : <MoonIcon className="w-4 h-4" />
                }
              </button>

              <button
                onClick={() => navigate('/settings/notifications')}
                className="relative w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow-md cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
              >
                {initials}
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 border-2 border-white dark:border-[#0a0a1e] rounded-full" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════ BOTTOM NAV MOBILE ══════════ */}
      <nav className={`md:hidden fixed left-4 right-4 z-50 transition-all duration-300 ${hasPlayer ? 'bottom-[76px]' : 'bottom-4'}`}>
        <div className="bg-white/92 dark:bg-[#0a0a1e]/92 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/60 dark:border-white/8">
          <div className="grid grid-cols-3 h-16">
            {NAV_MOBILE.map(({ path, label, Icon }) => {
              const active = isActive(path);
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                    active
                      ? 'text-primary-500 dark:text-primary-400'
                      : 'text-gray-400 dark:text-slate-600 hover:text-gray-600 dark:hover:text-slate-400'
                  }`}
                >
                  {active && (
                    <span className="absolute top-0 left-6 right-6 h-[2.5px] rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
                  )}
                  <span className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                    <Icon className="w-6 h-6" filled={active} />
                  </span>
                  <span className={`text-[10px] font-bold tracking-wide leading-none ${
                    active ? 'text-primary-500 dark:text-primary-400' : 'text-gray-400 dark:text-slate-500'
                  }`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
