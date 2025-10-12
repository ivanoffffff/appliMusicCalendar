import React, { useState } from 'react';
import type { Artist } from '../../types';
import { SpotifyIcon, DeezerIcon } from '../common/PlatformIcons';

interface ArtistCardProps {
  artist: Artist;
  isFavorite?: boolean;
  onToggleFavorite?: (artist: Artist) => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ 
  artist, 
  isFavorite = false, 
  onToggleFavorite 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleToggleFavorite = async () => {
    if (!onToggleFavorite || isLoading) return;
    
    setIsLoading(true);
    try {
      await onToggleFavorite(artist);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(0)}k`;
    }
    return count.toString();
  };

  const getGenreColor = (index: number) => {
    const colors = [
      'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
      'bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300',
      'bg-spotify-100 text-spotify-700 dark:bg-spotify-900/30 dark:text-spotify-300',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="group music-card card-hover animate-entrance">
      <div className="flex items-start space-x-4">
        {/* Image de l'artiste avec effet de chargement */}
        <div className="flex-shrink-0 relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-200 to-accent-200 dark:from-primary-800 dark:to-accent-800">
            {artist.imageUrl ? (
              <>
                {!imageLoaded && (
                  <div className="w-full h-full shimmer bg-primary-200 dark:bg-primary-700" />
                )}
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                🎤
              </div>
            )}
          </div>
          
          {/* Badge de popularité */}
          {artist.popularity > 70 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce-subtle">
              <span className="text-xs">🔥</span>
            </div>
          )}
        </div>

        {/* Informations de l'artiste */}
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-primary truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
              {artist.name}
            </h3>
            
            {/* Genres */}
            {artist.genres && artist.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {artist.genres.slice(0, 3).map((genre, index) => (
                  <span
                    key={index}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 ${getGenreColor(index)}`}
                  >
                    {genre}
                  </span>
                ))}
                {artist.genres.length > 3 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                    +{artist.genres.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-secondary">
            <div className="flex items-center space-x-1 group/stat">
              <span className="group-hover/stat:scale-110 transition-transform duration-300">👥</span>
              <span className="font-medium">{formatFollowers(artist.followers)}</span>
            </div>
            <div className="flex items-center space-x-1 group/stat">
              <span className="group-hover/stat:scale-110 transition-transform duration-300">⭐</span>
              <span className="font-medium">{artist.popularity}/100</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Bouton favoris avec animation */}
              <button
                onClick={handleToggleFavorite}
                disabled={isLoading}
                className={`relative p-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 ${
                  isFavorite
                    ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 shadow-lg hover:shadow-xl'
                    : 'bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500 dark:bg-gray-800 dark:text-gray-500 dark:hover:bg-red-900/30 dark:hover:text-red-400'
                }`}
                title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                {isLoading ? (
                  <div className="w-5 h-5 animate-spin">⏳</div>
                ) : (
                  <div className={`text-lg transition-transform duration-300 ${isFavorite ? 'animate-pulse' : ''}`}>
                    {isFavorite ? '❤️' : '🤍'}
                  </div>
                )}
              </button>

              {/* Lien Spotify */}
              {artist.spotifyUrl && (
                <a
                  href={artist.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-spotify text-sm px-3 py-2 flex items-center space-x-1 hover:shadow-spotify"
                  title="Ouvrir sur Spotify"
                >
                  <SpotifyIcon className="w-4 h-4" />
                </a>
              )}

              {/* 🆕 Lien Deezer */}
              {artist.deezerUrl && (
                <a
                  href={artist.deezerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm px-3 py-2 rounded-xl flex items-center space-x-1 hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
                  title="Ouvrir sur Deezer"
                >
                  <DeezerIcon className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Indicateur de tendance */}
            {artist.popularity > 80 && (
              <div className="flex items-center space-x-1 text-green-600 dark:text-green-400 animate-pulse">
                <span className="text-sm">📈</span>
                <span className="text-xs font-medium">Tendance</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistCard;