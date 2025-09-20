import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/ui/Header';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Mes Artistes',
      description: 'Gérez vos artistes favoris et découvrez-en de nouveaux',
      icon: '🎤',
      gradient: 'from-blue-500 to-blue-600',
      hoverGradient: 'hover:from-blue-600 hover:to-blue-700',
      action: () => navigate('/artists'),
      stats: 'Recherche & Favoris'
    },
    {
      title: 'Calendrier des Sorties',
      description: 'Suivez les nouvelles sorties de vos artistes préférés',
      icon: '📅',
      gradient: 'from-green-500 to-green-600',
      hoverGradient: 'hover:from-green-600 hover:to-green-700',
      action: () => navigate('/releases'),
      stats: 'Sorties & Notifications'
    },
    {
      title: 'Découvertes',
      description: 'Explorez de nouveaux artistes et tendances musicales',
      icon: '🔍',
      gradient: 'from-purple-500 to-purple-600',
      hoverGradient: 'hover:from-purple-600 hover:to-purple-700',
      action: () => navigate('/artists'),
      stats: 'Tendances & Nouveautés'
    },
    {
      title: 'Statistiques',
      description: 'Analysez vos habitudes d\'écoute et préférences',
      icon: '📊',
      gradient: 'from-orange-500 to-orange-600',
      hoverGradient: 'hover:from-orange-600 hover:to-orange-700',
      action: () => {},
      stats: 'Bientôt disponible',
      disabled: true
    }
  ];

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/10 to-spotify-500/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center animate-entrance">
            <div className="flex justify-center mb-6">
              <div className="text-6xl animate-bounce-subtle">🎵</div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              Bienvenue, {user?.firstName || user?.username} !
            </h1>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Votre hub musical personnel pour suivre vos artistes favoris et ne manquer aucune sortie
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div
              key={card.title}
              className={`group music-card card-hover cursor-pointer relative overflow-hidden animate-entrance-delay-${index + 1} ${
                card.disabled ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              onClick={!card.disabled ? card.action : undefined}
            >
              {/* Background gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative">
                {/* Icon avec animation */}
                <div className="text-4xl mb-4 group-hover:scale-110 group-hover:animate-bounce-subtle transition-transform duration-300">
                  {card.icon}
                </div>
                
                {/* Contenu */}
                <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                  {card.title}
                </h3>
                
                <p className="text-secondary text-sm mb-4 leading-relaxed">
                  {card.description}
                </p>
                
                {/* Stats/Status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                    {card.stats}
                  </span>
                  
                  {!card.disabled && (
                    <div className="text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Info Section */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="music-card animate-entrance-delay-3">
          <div className="flex items-center space-x-4">
            {/* Avatar avec gradient */}
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 via-accent-500 to-spotify-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-glow">
              {(user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-primary mb-1">Informations du compte</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-secondary">Nom d'utilisateur</span>
                  <p className="font-medium text-primary">{user?.username}</p>
                </div>
                <div>
                  <span className="text-secondary">Email</span>
                  <p className="font-medium text-primary">{user?.email}</p>
                </div>
                <div>
                  <span className="text-secondary">Nom complet</span>
                  <p className="font-medium text-primary">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : 'Non renseigné'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
