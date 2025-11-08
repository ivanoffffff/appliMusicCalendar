import React from 'react';
import logo from '../../assets/logo.svg';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const { user } = useAuth();
  
  // Gestion sécurisée du thème avec fallback
  let theme = 'dark';
  let toggleTheme = () => {};
  
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch (error) {
    console.warn('ThemeProvider not available, using default theme');
  }
  
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Header Desktop & Mobile - Version minimaliste */}
      <header className="bg-secondary/80 backdrop-blur-md border-b border-custom sticky top-0 z-50 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <div className="animate-bounce-subtle">
                <img
                  src={logo}
                  alt="Logo musique"
                  className="w-16 h-16 md:w-20 md:h-20 mx-auto"
                />
              </div>
              <h1 className="text-lg md:text-xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">
                Music Tracker
              </h1>
            </div>

            {/* Navigation Desktop uniquement */}
            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => navigate('/artists')}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isActive('/artists')
                    ? 'bg-primary-500 text-white shadow-glow'
                    : 'text-secondary hover:text-primary hover:bg-primary/10'
                }`}
              >
                Artistes
              </button>
              <button
                onClick={() => navigate('/releases')}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                  isActive('/releases')
                    ? 'bg-primary-500 text-white shadow-glow'
                    : 'text-secondary hover:text-primary hover:bg-primary/10'
                }`}
              >
                Calendrier
              </button>
            </nav>

            {/* Actions utilisateur */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Bouton thème */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110"
                title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>

              {/* Info utilisateur */}
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-primary">
                    {user?.firstName || user?.username}
                  </p>
                  <p className="text-xs text-secondary">
                    Connecté
                  </p>
                </div>
                
                {/* Avatar */}
                <div 
                  onClick={() => navigate('/settings/notifications')}
                  className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform duration-300 hover:shadow-xl"
                  title="Voir mon profil et notifications"
                >
                  {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom Navigation - Mobile uniquement - Style flottant */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-secondary/95 backdrop-blur-md border border-custom z-50 rounded-full shadow-2xl">
        <div className="grid grid-cols-2 h-16">
          {/* Bouton Calendrier */}
          <button
            onClick={() => navigate('/releases')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${
              isActive('/releases')
                ? 'text-primary-500'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <div className={`text-2xl transition-transform duration-300 ${
              isActive('/releases') ? 'scale-110' : ''
            }`}>
              📅
            </div>
            <span className={`text-xs font-medium ${
              isActive('/releases') ? 'font-bold' : ''
            }`}>
              Calendrier
            </span>
          </button>


          {/* Bouton Artistes */}
          <button
            onClick={() => navigate('/artists')}
            className={`flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${
              isActive('/artists')
                ? 'text-primary-500'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <div className={`text-2xl transition-transform duration-300 ${
              isActive('/artists') ? 'scale-110' : ''
            }`}>
              🎤
            </div>
            <span className={`text-xs font-medium ${
              isActive('/artists') ? 'font-bold' : ''
            }`}>
              Artistes
            </span>
          </button>
        </div>
      </nav>


    </>
  );
};

export default Header;