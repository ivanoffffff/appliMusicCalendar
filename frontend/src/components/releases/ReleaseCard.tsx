import React, { useState } from 'react';
import type { Release } from '../../types';
import { SpotifyIcon, DeezerIcon } from '../common/PlatformIcons';

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

  // ✨ Nouvelles fonctions pour les sorties futures
  const releaseDate = new Date(release.releaseDate);
  const now = new Date();
  const isNew = releaseDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && releaseDate <= now;
  const isUpcoming = releaseDate > now;

  // Calculer le nombre de jours avant/après la sortie
  const daysDiff = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="group music-card card-hover animate-entrance relative">
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

          {/* ✨ Badge "Nouveau" ou "À venir" */}
          {isNew && (
            <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-green-400 to-green-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
              NEW
            </div>
          )}
          {isUpcoming && (
            <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
              {daysDiff <= 7 ? `J-${daysDiff}` : 'BIENTÔT'}
            </div>
          )}
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
              <span className={`text-xs flex items-center space-x-1 ${isUpcoming ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-secondary'}`}>
                <span>{isUpcoming ? '🗓️' : '📅'}</span>
                <span>
                  {formatDate(release.releaseDate)}
                  {isUpcoming && daysDiff <= 30 && (
                    <span className="ml-1">
                      ({daysDiff} jour{daysDiff > 1 ? 's' : ''})
                    </span>
                  )}
                </span>
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
                  title={isUpcoming ? "Pré-enregistrer sur Spotify" : "Écouter sur Spotify"}
                >
                  <SpotifyIcon className="w-4 h-4" />
                </a>
              )}

              {/* Lien Deezer */}
              {release.deezerUrl && (
                <a
                  href={release.deezerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm px-4 py-2 rounded-xl flex items-center space-x-2 hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
                  title={isUpcoming ? "Pré-enregistrer sur Deezer" : "Écouter sur Deezer"}
                >
                  <DeezerIcon className="w-4 h-4" />
                </a>
              )}

              {/* ✨ Indicateur "Sortie prévue" */}
              {isUpcoming && (
                <div className="flex items-center text-xs text-orange-600 dark:text-orange-400 font-medium ml-2">
                  <span className="mr-1">⏰</span>
                  <span>Sortie prévue</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseCard;