import React, { useState } from 'react';
import type { Release } from '../../types';

interface ReleaseCardProps {
  release: Release;
  onPlaySpotify?: (release: Release) => void;
}

const ReleaseCard: React.FC<ReleaseCardProps> = ({ release, onPlaySpotify }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getReleaseTypeStyle = (type: string) => {
    switch (type) {
      case 'ALBUM': 
        return {
          bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
          icon: '💿',
          label: 'Album'
        };
      case 'EP': 
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-blue-600',
          icon: '🎵',
          label: 'EP'
        };
      case 'SINGLE': 
        return {
          bg: 'bg-gradient-to-r from-green-500 to-green-600',
          icon: '🎶',
          label: 'Single'
        };
      default: 
        return {
          bg: 'bg-gradient-to-r from-gray-500 to-gray-600',
          icon: '🎤',
          label: 'Release'
        };
    }
  };

  const typeStyle = getReleaseTypeStyle(release.releaseType);
  const isNew = new Date(release.releaseDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="group music-card card-hover animate-entrance relative overflow-hidden">
      {/* Effet de brillance au hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-all duration-700 ease-out"></div>
      
      <div className="relative flex items-start space-x-4">
        {/* Cover de l'album */}
        <div className="flex-shrink-0 relative">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-200 to-accent-200 dark:from-primary-800 dark:to-accent-800 shadow-lg">
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
              <div className="w-full h-full flex items-center justify-center text-3xl animate-pulse">
                {typeStyle.icon}
              </div>
            )}
          </div>
          
          {/* Badge "Nouveau" */}
          {isNew && (
            <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold rounded-full animate-bounce-subtle shadow-lg">
              NEW
            </div>
          )}
        </div>

        {/* Informations de la sortie */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-primary truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                {release.name}
              </h3>
              <p className="text-secondary text-sm font-medium">
                par <span className="text-primary">{release.artist.name}</span>
              </p>
            </div>
            
            {/* Type de sortie */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${typeStyle.bg}`}>
              <span className="mr-1">{typeStyle.icon}</span>
              {typeStyle.label}
            </span>
          </div>

          {/* Date et infos avec icônes animées */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-secondary mb-4">
            <div className="flex items-center space-x-1 group/date">
              <span className="group-hover/date:scale-110 transition-transform duration-300">📅</span>
              <span className="font-medium">{formatDate(release.releaseDate)}</span>
            </div>
            {release.trackCount && (
              <div className="flex items-center space-x-1 group/tracks">
                <span className="group-hover/tracks:scale-110 transition-transform duration-300">🎵</span>
                <span className="font-medium">{release.trackCount} titre{release.trackCount > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {release.spotifyUrl && (
                <a
                  href={release.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-spotify text-sm px-4 py-2 flex items-center space-x-2 hover:shadow-spotify"
                >
                  <span>🎵</span>
                  <span>Écouter</span>
                </a>
              )}
              
              <button className="btn-secondary text-sm px-3 py-2 flex items-center space-x-1">
                <span>❤️</span>
                <span>Favoris</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseCard;
