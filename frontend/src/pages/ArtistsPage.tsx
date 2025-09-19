import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Artist, FavoriteArtist } from '../types';
import { artistService } from '../services/api';
import ArtistCard from '../components/artists/ArtistCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ArtistsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [favorites, setFavorites] = useState<FavoriteArtist[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>('search');

  // Charger les favoris au montage du composant
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
        // Supprimer des favoris
        const favorite = favorites.find(fav => fav.artist.spotifyId === artist.spotifyId);
        if (favorite) {
          await artistService.removeFromFavorites(favorite.artist.id);
          setFavorites(prev => prev.filter(fav => fav.id !== favorite.id));
        }
      } else {
        // Ajouter aux favoris
        const response = await artistService.addToFavorites(artist.spotifyId, 'default');
        if (response.success) {
          await loadFavorites(); // Recharger pour avoir les données complètes
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">🎵 Music Tracker</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">👋 {user?.firstName || user?.username}</span>
            <a
              href="/dashboard"
              className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
            >
              Dashboard
            </a>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'search'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🔍 Rechercher des artistes
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'favorites'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              ❤️ Mes favoris ({favorites.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'search' && (
          <div>
            {/* Formulaire de recherche */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <form onSubmit={handleSearch} className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un artiste (ex: Drake, Taylor Swift...)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? 'Recherche...' : 'Rechercher'}
                </button>
              </form>
            </div>

            {/* Erreurs */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                {error}
              </div>
            )}

            {/* Résultats de recherche */}
            {isSearching ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : searchResults.length > 0 ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Résultats de recherche ({searchResults.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                  {searchResults.map((artist) => (
                    <ArtistCard
                      key={artist.spotifyId}
                      artist={artist}
                      isFavorite={isArtistFavorite(artist)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              </div>
            ) : searchQuery && !isSearching ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Aucun résultat pour "{searchQuery}"</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">🔍 Utilisez la barre de recherche pour trouver des artistes</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Mes artistes favoris
            </h2>
            
            {isLoadingFavorites ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : favorites.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                {favorites.map((favorite) => (
                  <ArtistCard
                    key={favorite.id}
                    artist={{
                      spotifyId: favorite.artist.spotifyId!,
                      name: favorite.artist.name,
                      genres: favorite.artist.genres,
                      imageUrl: favorite.artist.imageUrl || undefined,
                      popularity: 0, // Pas stocké en base pour l'instant
                      followers: 0, // Pas stocké en base pour l'instant
                      spotifyUrl: `https://open.spotify.com/artist/${favorite.artist.spotifyId}`,
                    }}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Vous n'avez pas encore d'artistes favoris</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Rechercher des artistes
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ArtistsPage;
