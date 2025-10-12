import React from 'react';
import { SpotifyIcon, DeezerIcon } from '../common/PlatformIcons';

interface TopArtistCardProps {
  rank: number;
  name: string;
  imageUrl?: string;
  popularity: number;
  spotifyUrl?: string;
  deezerUrl?: string;
  delay?: number;
}

const TopArtistCard: React.FC<TopArtistCardProps> = ({
  rank,
  name,
  imageUrl,
  popularity,
  spotifyUrl,
  deezerUrl,
  delay = 0
}) => {
  const handleClick = () => {
    if (spotifyUrl) {
      window.open(spotifyUrl, '_blank');
    } else if (deezerUrl) {
      window.open(deezerUrl, '_blank');
    }
  };

  // Calcul de la couleur de la jauge selon la popularité
  const getPopularityColor = (pop: number) => {
    if (pop >= 80) return 'from-green-500 to-emerald-600';
    if (pop >= 60) return 'from-yellow-500 to-orange-500';
    if (pop >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-700';
  };

  // Médailles pour le top 3
  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div
      className="music-card group cursor-pointer relative overflow-hidden hover:scale-105 transition-all duration-300"
      onClick={handleClick}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      {/* Badge de rang en haut à gauche */}
      <div className="absolute top-3 left-3 z-10">
        <div className="bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary shadow-lg">
          {getMedalEmoji(rank)}
        </div>
      </div>

      {/* Badge "Plus populaire" pour le #1 */}
      {rank === 1 && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
            ⭐ Top
          </div>
        </div>
      )}

      {/* Image de l'artiste */}
      <div className="relative mb-4 aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary-500/20 to-accent-500/20">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🎵
          </div>
        )}
        
        {/* Overlay au survol */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <div className="flex gap-2">
            {spotifyUrl && (
              <div className="bg-spotify-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                <SpotifyIcon className="w-3.5 h-3.5" />
              </div>
            )}
            {deezerUrl && (
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                <DeezerIcon className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nom de l'artiste */}
      <h3 className="text-base font-bold text-primary mb-2 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {name}
      </h3>

      {/* Jauge de popularité */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-secondary font-medium">Popularité</span>
          <span className="text-primary font-bold">{popularity}/100</span>
        </div>
        
        {/* Barre de progression */}
        <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getPopularityColor(popularity)} transition-all duration-500 rounded-full`}
            style={{ width: `${popularity}%` }}
          />
        </div>
      </div>

      {/* Effet de brillance */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </div>
  );
};

export default TopArtistCard;