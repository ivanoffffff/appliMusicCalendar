import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-spotify-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-xl glassmorphism hover:scale-110 transition-all duration-300 text-2xl z-10"
        title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="relative w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8 animate-entrance">
          <div className="text-6xl mb-4 animate-bounce-subtle">🎵</div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Rejoignez Music Tracker</h1>
          <p className="text-secondary">Créez votre compte et découvrez votre espace musical</p>
        </div>

        {/* Formulaire avec glassmorphism */}
        <div className="glassmorphism rounded-2xl p-8 shadow-2xl animate-entrance-delay-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom et prénom */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-primary mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-secondary/50 border border-custom rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-primary placeholder-secondary"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-primary mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-secondary/50 border border-custom rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-primary placeholder-secondary"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-primary mb-2">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-secondary/50 border border-custom rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-primary placeholder-secondary"
                placeholder="johndoe"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-primary mb-2">
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-secondary/50 border border-custom rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-primary placeholder-secondary"
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-primary mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-secondary/50 border border-custom rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-primary placeholder-secondary"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <p className="text-xs text-secondary mt-1">Minimum 6 caractères</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm animate-scale-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Création du compte...</span>
                </div>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-secondary text-sm">
              Déjà un compte ?{' '}
              <a href="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors duration-300">
                Se connecter
              </a>
            </p>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 glassmorphism rounded-xl p-6 animate-entrance-delay-2">
          <h3 className="text-lg font-semibold text-primary mb-4 text-center">Pourquoi rejoindre Music Tracker ?</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🎯</div>
              <span className="text-sm text-secondary">Suivez vos artistes favoris facilement</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-2xl">⚡</div>
              <span className="text-sm text-secondary">Notifications instantanées des nouvelles sorties</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-2xl">📊</div>
              <span className="text-sm text-secondary">Calendrier personnalisé de vos sorties</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
