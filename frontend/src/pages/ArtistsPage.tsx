import React, { useState, useEffect } from 'react';
import type { Artist, FavoriteArtist } from '../types';
import { artistService } from '../services/api';
import ArtistCard from '../components/artists/ArtistCard';
import Header from '../components/ui/Header';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ArtistsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [favorites, setFavorites] = useState<FavoriteArtist[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoadingFavorites(true);
      const response = await artistService.getFavorites();
      if (response.success && response.data) {
        setFavorites(response.data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des favoris:', err);
    } finally {
      setIsLoadingFavorites(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError('');

    try {
      const response = await artistService.searchArtists(searchQuery, 20);
      if (response.success && response.data) {
        setSearchResults(response.data);
      } else {
        setError(response.message || 'Erreur lors de la recherche');
      }
    } catch (err) {
      setError('Erreur de connexion. Vérifiez que le backend est démarré.');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleFavorite = async (artist: Artist) => {
    try {
      const isCurrentlyFavorite = favorites.some(
        fav => fav.artist.spotifyId === artist.spotifyId
      );

      if (isCurrentlyFavorite) {
        const favorite = favorites.find(fav => fav.artist.spotifyId === artist.spotifyId);
        if (favorite) {
          await artistService.removeFromFavorites(favorite.artist.id);
          setFavorites(prev => prev.filter(fav => fav.id !== favorite.id));
        }
      } else {
        const response = await artistService.addToFavorites(artist.spotifyId, 'default');
        if (response.success) {
          await loadFavorites();
        }
      }
    } catch (err) {
      console.error('Erreur toggle favorite:', err);
      setError('Erreur lors de la modification des favoris');
    }
  };

  const isArtistFavorite = (artist: Artist) => {
    return favorites.some(fav => fav.artist.spotifyId === artist.spotifyId);
  };

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      {/* Tabs avec glassmorphism */}
      <div className="sticky top-[72px] z-40 bg-secondary/80 backdrop-blur-md border-b border-custom">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                activeTab === 'search'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-secondary hover:text-primary'
              }`}
            >
              🔍 Rechercher des artistes
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 relative ${
                activeTab === 'favorites'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-secondary hover:text-primary'
              }`}
            >
              ❤️ Mes favoris
              {favorites.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-primary-500 text-white text-xs rounded-full animate-pulse">
                  {favorites.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'search' && (
          <div className="animate-entrance">
            {/* Formulaire de recherche amélioré */}
            <div className="music-card mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-3xl">🔍</div>
                <div>
                  <h2 className="text-xl font-bold text-primary">Rechercher des artistes</h2>
                  <p className="text-secondary text-sm">Découvrez et ajoutez vos artistes préférés</p>
                </div>
              </div>
              
              <form onSubmit={handleSearch} className="flex space-x-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un artiste (ex: Drake, Taylor Swift, Daft Punk...)"
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-300"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? <LoadingSpinner size="sm" /> : 'Rechercher'}
                </button>
              </form>
            </div>

            {/* Messages d'erreur */}
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl animate-scale-in">
                {error}
              </div>
            )}

            {/* Résultats de recherche */}
            {isSearching ? (
              <div className="flex flex-col items-center justify-center py-16">
                <LoadingSpinner size="xl" type="musical" />
                <p className="text-secondary mt-4">Recherche en cours...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="animate-entrance-delay-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-primary">
                    Résultats de recherche ({searchResults.length})
                  </h3>
                  <button
                    onClick={() => setSearchResults([])}
                    className="text-sm text-secondary hover:text-primary transition-colors duration-300"
                  >
                    Effacer les résultats
                  </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                  {searchResults.map((artist, index) => (
                    <div key={artist.spotifyId} className={`animate-entrance-delay-${Math.min(index + 1, 3)}`}>
                      <ArtistCard
                        artist={artist}
                        isFavorite={isArtistFavorite(artist)}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : searchQuery && !isSearching ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">😔</div>
                <p className="text-secondary text-lg">Aucun résultat pour "{searchQuery}"</p>
                <p className="text-secondary text-sm mt-2">Essayez avec un autre nom d'artiste</p>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4 animate-bounce-subtle">🎵</div>
                <p className="text-secondary text-lg mb-2">Découvrez de nouveaux artistes</p>
                <p className="text-secondary text-sm">Utilisez la barre de recherche pour commencer</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="animate-entrance-delay-1">
            {isLoadingFavorites ? (
              <div className="flex flex-col items-center justify-center py-16">
                <LoadingSpinner size="xl" type="musical" />
                <p className="text-secondary mt-4">Chargement de vos favoris...</p>
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                {favorites.map((favorite, index) => (
                  <div key={favorite.id} className={`animate-entrance-delay-${Math.min(index + 1, 3)}`}>
                    <ArtistCard
                      artist={{
                        spotifyId: favorite.artist.spotifyId!,
                        deezerId: favorite.artist.deezerId,  // 🆕 Ajout deezerId
                        name: favorite.artist.name,
                        genres: favorite.artist.genres,
                        imageUrl: favorite.artist.imageUrl || undefined,
                        popularity: favorite.artist.popularity || 0,
                        followers: favorite.artist.followers || 0,
                        spotifyUrl: favorite.artist.spotifyUrl || `https://open.spotify.com/artist/${favorite.artist.spotifyId}`,
                        deezerUrl: favorite.artist.deezerUrl,  // 🆕 Ajout deezerUrl
                      }}
                      isFavorite={true}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="music-card max-w-md mx-auto">
                  <div className="text-6xl mb-4">🎤</div>
                  <h3 className="text-xl font-semibold text-primary mb-4">
                    Aucun artiste favori
                  </h3>
                  <p className="text-secondary mb-6">
                    Commencez par rechercher et ajouter vos artistes préférés pour suivre leurs sorties !
                  </p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="btn-primary px-6 py-3"
                  >
                    🔍 Rechercher des artistes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ArtistsPage;
