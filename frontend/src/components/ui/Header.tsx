import React from 'react';
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
    // Si ThemeProvider n'est pas disponible, utiliser les valeurs par défaut
    console.warn('ThemeProvider not available, using default theme');
  }
  
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-secondary/80 backdrop-blur-md border-b border-custom sticky top-0 z-50 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo et navigation */}
          <div className="flex items-center space-x-8">
            <div 
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 cursor-pointer group"
            >
              <div className="text-3xl animate-bounce-subtle">🎵</div>
              <h1 className="text-xl font-bold gradient-text group-hover:scale-105 transition-transform duration-300">
                Music Tracker
              </h1>
            </div>

            {/* Navigation Desktop */}
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
          </div>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            {/* Bouton thème */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-300 hover:scale-110"
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Info utilisateur */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-primary">
                  {user?.firstName || user?.username}
                </p>
                <p className="text-xs text-secondary">
                  Connecté
                </p>
              </div>
              
              {/* Avatar - Cliquable pour ouvrir les notifications */}
              <div 
                onClick={() => navigate('/settings/notifications')}
                className="w-10 h-10 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:scale-110 transition-transform duration-300 hover:shadow-xl"
                title="Voir mon profil et notifications"
              >
                {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation mobile */}
        <nav className="md:hidden mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate('/artists')}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              isActive('/artists')
                ? 'bg-primary-500 text-white'
                : 'text-secondary hover:text-primary hover:bg-primary/10'
            }`}
          >
            Artistes
          </button>
          <button
            onClick={() => navigate('/releases')}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              isActive('/releases')
                ? 'bg-primary-500 text-white'
                : 'text-secondary hover:text-primary hover:bg-primary/10'
            }`}
          >
            Calendrier
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;