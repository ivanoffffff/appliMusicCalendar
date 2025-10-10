import React, { useState } from 'react';
import type { Release } from '../../types';

interface ReleaseCardProps {
  release: Release;
}

const ReleaseCard: React.FC<ReleaseCardProps> = ({ release }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const getReleaseTypeLabel = (type: string) => {
    switch (type) {
      case 'ALBUM':
        return '💿 Album';
      case 'SINGLE':
        return '🎵 Single';
      case 'EP':
        return '📀 EP';
      default:
        return '🎵 Sortie';
    }
  };

  const getReleaseTypeColor = (type: string) => {
    switch (type) {
      case 'ALBUM':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'SINGLE':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'EP':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="group music-card card-hover animate-entrance">
      <div className="flex items-start space-x-4">
        {/* Image de la sortie */}
        <div className="flex-shrink-0 relative">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-200 to-accent-200 dark:from-primary-800 dark:to-accent-800 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
            {release.imageUrl ? (
              <>
                {!imageLoaded && (
                  <div className="w-full h-full shimmer bg-primary-200 dark:bg-primary-700" />
                )}
                <img
                  src={release.imageUrl}
                  alt={release.name}
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">
                🎵
              </div>
            )}
          </div>
        </div>

        {/* Informations de la sortie */}
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-primary truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
              {release.name}
            </h3>
            <p className="text-sm text-secondary mt-1">{release.artist.name}</p>

            {/* Type et date */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getReleaseTypeColor(release.releaseType)}`}>
                {getReleaseTypeLabel(release.releaseType)}
              </span>
              <span className="text-xs text-secondary flex items-center space-x-1">
                <span>📅</span>
                <span>{formatDate(release.releaseDate)}</span>
              </span>
            </div>

            {/* Nombre de pistes */}
            {release.trackCount && (
              <div className="text-xs text-secondary mt-2">
                {release.trackCount} piste{release.trackCount > 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              {/* Lien Spotify */}
              {release.spotifyUrl && (
                <a
                  href={release.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-spotify text-sm px-4 py-2 flex items-center space-x-2 hover:shadow-spotify"
                  title="Écouter sur Spotify"
                >
                  <span>🎵</span>
                  <span>Spotify</span>
                </a>
              )}

              {/* 🆕 Lien Deezer */}
              {release.deezerUrl && (
                <a
                  href={release.deezerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm px-4 py-2 rounded-xl flex items-center space-x-2 hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
                  title="Écouter sur Deezer"
                >
                  <span>🎧</span>
                  <span>Deezer</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseCard;