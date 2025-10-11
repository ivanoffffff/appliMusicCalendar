import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { artistService } from '../services/api';
import type { FavoriteArtist } from '../types';
import Header from '../components/ui/Header';
import StatsCard from '../components/stats/StatsCard';
import TopArtistCard from '../components/artists/TopArtistCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [favorites, setFavorites] = useState<FavoriteArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const response = await artistService.getFavorites();
      if (response.success && response.data) {
        setFavorites(response.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des favoris:', err);
      setError('Impossible de charger les statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  // 📊 CALCUL DES STATISTIQUES
  const stats = React.useMemo(() => {
    if (!favorites.length) {
      return {
        totalArtists: 0,
        avgPopularity: 0,
        totalFollowers: 0
      };
    }

    const totalArtists = favorites.length;
    
    // Popularité moyenne
    const totalPopularity = favorites.reduce((sum, fav) => {
      return sum + (fav.artist.popularity || 0);
    }, 0);
    const avgPopularity = Math.round(totalPopularity / totalArtists);
    
    // Total de followers
    const totalFollowers = favorites.reduce((sum, fav) => {
      return sum + (fav.artist.followers || 0);
    }, 0);

    return { totalArtists, avgPopularity, totalFollowers };
  }, [favorites]);

  // 🌟 CALCUL DES TOP ARTISTES (par popularité)
  const topArtists = React.useMemo(() => {
    return [...favorites]
      .sort((a, b) => (b.artist.popularity || 0) - (a.artist.popularity || 0))
      .slice(0, 5); // Top 5
  }, [favorites]);

  // 📐 FORMATAGE DES NOMBRES (2500000 → "2.5M")
  const formatFollowers = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

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
              Votre hub musical personnel pour suivre vos artistes favoris
            </p>
          </div>
        </div>
      </div>

      {/* 📊 SECTION STATISTIQUES */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-primary mb-6">
          📈 Vos Statistiques
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="music-card bg-red-500/10 border border-red-500/20">
            <p className="text-red-500 text-center">{error}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <StatsCard
              title="Artistes suivis"
              value={stats.totalArtists}
              icon="🎵"
              subtitle={stats.totalArtists > 0 ? "favoris dans votre collection" : "Ajoutez vos premiers artistes"}
              gradient="from-blue-500 to-blue-600"
              delay={1}
            />

            <StatsCard
              title="Popularité moyenne"
              value={stats.totalArtists > 0 ? `${stats.avgPopularity}/100` : "—"}
              icon="⭐"
              subtitle={stats.totalArtists > 0 ? "score Spotify de vos artistes" : "Aucune donnée"}
              gradient="from-yellow-500 to-orange-600"
              delay={2}
            />

            <StatsCard
              title="Followers cumulés"
              value={stats.totalArtists > 0 ? formatFollowers(stats.totalFollowers) : "—"}
              icon="👥"
              subtitle={stats.totalArtists > 0 ? "fans au total" : "Aucune donnée"}
              gradient="from-green-500 to-emerald-600"
              delay={3}
            />
          </div>
        )}
      </div>

      {/* 🌟 SECTION TOP ARTISTES - NOUVEAU */}
      {!isLoading && topArtists.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-primary">
              🌟 Vos Top Artistes
            </h2>
            <button
              onClick={() => navigate('/artists')}
              className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              Voir tous →
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {topArtists.map((favorite, index) => (
              <TopArtistCard
                key={favorite.id}
                rank={index + 1}
                name={favorite.artist.name}
                imageUrl={favorite.artist.imageUrl}
                popularity={favorite.artist.popularity || 0}
                spotifyUrl={favorite.artist.spotifyUrl}
                deezerUrl={favorite.artist.deezerUrl}
                delay={index + 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* Cards Grid - Actions Rapides */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-primary mb-6">
          🚀 Actions Rapides
        </h2>
        
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div
              key={card.title}
              className={`group music-card card-hover cursor-pointer relative overflow-hidden animate-entrance-delay-${index + 1} ${
                card.disabled ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              onClick={!card.disabled ? card.action : undefined}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative">
                <div className="text-4xl mb-4 group-hover:scale-110 group-hover:animate-bounce-subtle transition-transform duration-300">
                  {card.icon}
                </div>
                
                <h3 className="text-xl font-bold text-primary mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                  {card.title}
                </h3>
                
                <p className="text-secondary text-sm mb-4 leading-relaxed">
                  {card.description}
                </p>
                
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