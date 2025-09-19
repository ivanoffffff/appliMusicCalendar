import React from 'react';
import type { Release } from '../../types';

interface ReleaseCardProps {
  release: Release;
  onPlaySpotify?: (release: Release) => void;
}

const ReleaseCard: React.FC<ReleaseCardProps> = ({ release, onPlaySpotify }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getReleaseTypeColor = (type: string) => {
    switch (type) {
      case 'ALBUM': return 'bg-purple-100 text-purple-800';
      case 'EP': return 'bg-blue-100 text-blue-800';
      case 'SINGLE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReleaseTypeIcon = (type: string) => {
    switch (type) {
      case 'ALBUM': return '💿';
      case 'EP': return '🎵';
      case 'SINGLE': return '🎶';
      default: return '🎤';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start space-x-4">
        {/* Cover de l'album */}
        <div className="flex-shrink-0">
          {release.imageUrl ? (
            <img
              src={release.imageUrl}
              alt={release.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
              <span className="text-2xl">{getReleaseTypeIcon(release.releaseType)}</span>
            </div>
          )}
        </div>

        {/* Informations de la sortie */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {release.name}
              </h3>
              <p className="text-gray-600 text-sm">
                par <span className="font-medium">{release.artist.name}</span>
              </p>
            </div>
            
            {/* Type de sortie */}
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getReleaseTypeColor(release.releaseType)}`}>
              {release.releaseType}
            </span>
          </div>

          {/* Date et infos */}
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>📅 {formatDate(release.releaseDate)}</span>
            {release.trackCount && (
              <span>🎵 {release.trackCount} titre{release.trackCount > 1 ? 's' : ''}</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 mt-3">
            {release.spotifyUrl && (
              <a
                href={release.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 flex items-center space-x-1"
              >
                <span>🎵</span>
                <span>Écouter</span>
              </a>
            )}
            <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-sm hover:bg-gray-200">
              ❤️ Ajouter aux favoris
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseCard;
