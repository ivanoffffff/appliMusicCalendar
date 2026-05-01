import React from 'react';
import logo from '../../assets/logo.svg';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSpotifyPlayer } from '../../contexts/SpotifyPlayerContext';

// ─── Icônes SVG ──────────────────────────────────────────────────────────────
const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

// ─── Icônes nav mobile ────────────────────────────────────────────────────────

const HomeIcon = ({ filled }: { filled: boolean }) => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    {filled ? (
      <path fill="currentColor" d="M10.707 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 19 11h-1v9a1 1 0 0 1-1 1h-4v-5h-2v5H7a1 1 0 0 1-1-1v-9H5a1 1 0 0 1-.707-1.707l7-7Z" />
    ) : (
      <path stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
        d="m3 12 9-9 9 9M5 10v9a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1v-9" />
    )}
  </svg>
);

const MicIcon = ({ filled }: { filled: boolean }) => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    {filled ? (
      <>
        <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" />
        <path stroke="currentColor" strokeWidth={1.75} strokeLinecap="round"
          d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" />
      </>
    ) : (
      <>
        <rect x="9" y="2" width="6" height="11" rx="3" stroke="currentColor" strokeWidth={1.75} />
        <path stroke="currentColor" strokeWidth={1.75} strokeLinecap="round"
          d="M5 10a7 7 0 0 0 14 0M12 19v3M9 22h6" />
      </>
    )}
  </svg>
);

const CalendarIcon = ({ filled }: { filled: boolean }) => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    {filled ? (
      <>
        <rect x="3" y="5" width="18" height="17" rx="2" fill="currentColor" opacity=".2" stroke="currentColor" strokeWidth={1.75} />
        <path stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" d="M3 10h18M8 3v4M16 3v4" />
        <rect x="7" y="14" width="3" height="3" rx=".5" fill="currentColor" />
        <rect x="14" y="14" width="3" height="3" rx=".5" fill="currentColor" />
      </>
    ) : (
      <>
        <rect x="3" y="5" width="18" height="17" rx="2" stroke="currentColor" strokeWidth={1.75} />
        <path stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" d="M3 10h18M8 3v4M16 3v4" />
        <rect x="7" y="14" width="3" height="3" rx=".5" fill="currentColor" />
        <rect x="14" y="14" width="3" height="3" rx=".5" fill="currentColor" />
      </>
    )}
  </svg>
);

// ─── Config navigation ────────────────────────────────────────────────────────
const NAV_DESKTOP = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/artists',   label: 'Artistes'  },
  { path: '/releases',  label: 'Calendrier'},
];

const NAV_MOBILE = [
  { path: '/dashboard', label: 'Accueil',    Icon: HomeIcon     },
  { path: '/artists',   label: 'Artistes',   Icon: MicIcon      },
  { path: '/releases',  label: 'Calendrier', Icon: CalendarIcon },
];

// ─── Composant ────────────────────────────────────────────────────────────────
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
  const initials = (user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase();

  return (
    <>
      {/* ══════════ HEADER DESKTOP ══════════ */}
      <header className="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 md:h-16 gap-4">

            {/* ── Logo ── */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2.5 group shrink-0"
            >
              <img
                src={logo}
                alt="Music Tracker"
                className="w-8 h-8 group-hover:scale-110 transition-transform duration-300"
              />
              <span className="text-base font-bold gradient-text hidden sm:block group-hover:opacity-80 transition-opacity duration-200">
                Music Tracker
              </span>
            </button>

            {/* ── Nav desktop ── */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              {NAV_DESKTOP.map(item => {
                const active = isActive(item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                    {/* Indicateur actif — point en bas */}
                    {active && (
                      <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ── Actions droite ── */}
            <div className="flex items-center gap-2 shrink-0">

              {/* Bouton thème — SVG sun/moon */}
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-slate-800 text-secondary hover:text-primary hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105"
                title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
              >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </button>

              {/* Nom + avatar */}
              <div className="flex items-center gap-2.5">
                <div className="hidden md:block text-right leading-tight">
                  <p className="text-sm font-semibold text-primary">
                    {user?.firstName || user?.username}
                  </p>
                  <p className="text-[11px] text-secondary">Connecté</p>
                </div>

                <button
                  onClick={() => navigate('/settings/notifications')}
                  className="relative w-9 h-9 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md hover:shadow-glow hover:scale-105 transition-all duration-200"
                  title="Paramètres notifications"
                >
                  {initials}
                  {/* Indicateur online */}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════ BOTTOM NAV MOBILE ══════════ */}
      {/* Remonte au-dessus du MiniPlayer (~68 px) quand le lecteur est actif */}
      <nav className={`md:hidden fixed left-4 right-4 z-50 transition-all duration-300 ${hasPlayer ? 'bottom-[72px]' : 'bottom-4'}`}>
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-gray-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-3 h-16">
            {NAV_MOBILE.map(({ path, label, Icon }) => {
              const active = isActive(path);
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                    active ? 'text-primary-500' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                  }`}
                >
                  {/* Pill indicatrice en haut */}
                  {active && (
                    <span className="absolute top-0 left-6 right-6 h-[2.5px] rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
                  )}

                  <span className={`transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                    <Icon filled={active} />
                  </span>
                  <span className={`text-[10px] font-semibold tracking-wide leading-none ${
                    active ? 'text-primary-500' : 'text-gray-400 dark:text-slate-500'
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
