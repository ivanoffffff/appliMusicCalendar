import React, { useState } from 'react';
import type { Artist } from '../../types';
import { artistService } from '../../services/api';

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

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Image de l'artiste */}
        <div className="flex-shrink-0">
          {artist.imageUrl ? (
            <img
              src={artist.imageUrl}
              alt={artist.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-2xl">🎤</span>
            </div>
          )}
        </div>

        {/* Informations de l'artiste */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {artist.name}
          </h3>
          
          {/* Genres */}
          <div className="flex flex-wrap gap-1 mt-1">
            {artist.genres.slice(0, 3).map((genre, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>👥 {formatFollowers(artist.followers)}</span>
            <span>⭐ {artist.popularity}/100</span>
          </div>
        </div>

        {/* Bouton favoris */}
        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className={`p-2 rounded-full transition-colors ${
              isFavorite
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-red-500'
            } disabled:opacity-50`}
          >
            {isLoading ? '⏳' : isFavorite ? '❤️' : '🤍'}
          </button>

          {/* Lien Spotify */}
          <a
            href={artist.spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 text-sm"
            title="Ouvrir sur Spotify"
          >
            🎵 Spotify
          </a>
        </div>
      </div>
    </div>
  );
};

export default ArtistCard;
