import React from 'react';
import logo from '../../assets/logo.svg';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

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

// ─── Config navigation ────────────────────────────────────────────────────────
const NAV_DESKTOP = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/artists',   label: 'Artistes'  },
  { path: '/releases',  label: 'Calendrier'},
];

const NAV_MOBILE = [
  { path: '/dashboard', label: 'Accueil',    emoji: '🏠' },
  { path: '/artists',   label: 'Artistes',   emoji: '🎤' },
  { path: '/releases',  label: 'Calendrier', emoji: '📅' },
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
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-gray-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid grid-cols-3 h-16">
            {NAV_MOBILE.map(item => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
                    active ? 'text-primary-500' : 'text-secondary hover:text-primary'
                  }`}
                >
                  {/* Barre indicatrice en haut */}
                  {active && (
                    <span className="absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-primary-500 to-accent-500" />
                  )}

                  <span className={`text-xl transition-transform duration-200 ${active ? 'scale-110' : ''}`}>
                    {item.emoji}
                  </span>
                  <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-primary-500' : ''}`}>
                    {item.label}
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
