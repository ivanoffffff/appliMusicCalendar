import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { artistService } from '../services/api';
import type { FavoriteArtist } from '../types';
import Header from '../components/ui/Header';
import StatsCard from '../components/stats/StatsCard';
import TopArtistCard from '../components/artists/TopArtistCard';
import GenreDistribution from '../components/stats/GenreDistribution';
import ProfileBadges from '../components/profile/ProfileBadges';
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
      .slice(0, 4); // Top 5
  }, [favorites]);

  // 🎵 CALCUL DE LA RÉPARTITION DES GENRES
  const genreDistribution = React.useMemo(() => {
    if (!favorites.length) return [];

    // Compteur de genres
    const genreCount: { [key: string]: number } = {};

    favorites.forEach(fav => {
      const genres = fav.artist.genres || [];
      genres.forEach(genre => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
    });

    // Convertir en tableau et trier par nombre décroissant
    const genreArray = Object.entries(genreCount)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / favorites.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 genres

    return genreArray;
  }, [favorites]);

  // 🎭 CALCUL DU NOMBRE DE GENRES UNIQUES
  const totalGenres = React.useMemo(() => {
    const uniqueGenres = new Set<string>();
    favorites.forEach(fav => {
      const genres = fav.artist.genres || [];
      genres.forEach(genre => uniqueGenres.add(genre));
    });
    return uniqueGenres.size;
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

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      {/* Hero Section - Version réduite */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/10 to-spotify-500/10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="text-center animate-entrance">
            <div className="flex justify-center mb-3">
              <div className="text-4xl animate-bounce-subtle">🎵</div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
              Bienvenue, {user?.firstName || user?.username} !
            </h1>
            <p className="text-base text-secondary max-w-2xl mx-auto">
              Votre hub musical personnel pour suivre vos artistes favoris
            </p>
          </div>
        </div>
      </div>

      {/* 🌟 SECTION TOP ARTISTES - Position 2 */}
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

      {/* 🎵 SECTION RÉPARTITION DES GENRES - Position 3 */}
      {!isLoading && genreDistribution.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold text-primary mb-6">
            📊 Répartition par Genres
          </h2>
          
          <GenreDistribution genres={genreDistribution} />
        </div>
      )}

      {/* 📊 SECTION STATISTIQUES - Position 4 */}
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
          <div className="grid md:grid-cols-3 gap-6">
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

      {/* 🏆 SECTION PROFIL AVEC BADGES - Position 5 */}
      {!isLoading && user && (
        <div className="max-w-7xl mx-auto px-4 py-8 pb-16">
          <h2 className="text-2xl font-bold text-primary mb-6">
            👤 Votre Profil
          </h2>
          
          <ProfileBadges
            totalArtists={stats.totalArtists}
            totalGenres={totalGenres}
            username={user.username}
            firstName={user.firstName}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;