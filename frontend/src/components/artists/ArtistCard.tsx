import React, { useState } from 'react';
import type { Artist } from '../../types';
import { SpotifyIcon, DeezerIcon } from '../common/PlatformIcons';
import { MicrophoneIcon, FireIcon, StarIcon, HeartIcon, UsersIcon } from '../ui/Icons';

interface ArtistCardProps {
  artist: Artist;
  isFavorite?: boolean;
  onToggleFavorite?: (artist: Artist) => void;
}

const GENRE_COLORS = [
  'bg-primary-50 text-primary-600 dark:bg-primary-900/25 dark:text-primary-400',
  'bg-accent-50 text-accent-600 dark:bg-accent-900/25 dark:text-accent-400',
  'bg-spotify-50 text-spotify-700 dark:bg-spotify-900/25 dark:text-spotify-400',
];

const ArtistCard: React.FC<ArtistCardProps> = ({
  artist,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onToggleFavorite || isLoading) return;
    setIsLoading(true);
    try {
      await onToggleFavorite(artist);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFollowers = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
    return n.toString();
  };

  const getPopularityGradient = (p: number) => {
    if (p >= 80) return '#10b981, #059669';
    if (p >= 60) return '#f59e0b, #f97316';
    if (p >= 40) return '#f97316, #ef4444';
    return '#ef4444, #dc2626';
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 animate-entrance">

      {/* ── Image ── */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/40 dark:to-accent-900/40">
        {artist.imageUrl && !imageError ? (
          <img
            src={artist.imageUrl}
            alt={artist.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MicrophoneIcon className="w-16 h-16 text-primary-400" />
          </div>
        )}

        {/* Gradient overlay bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        {/* Badge popularité (top-left) */}
        {artist.popularity > 75 && (
          <div className="absolute top-2.5 left-2.5">
            <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {artist.popularity > 85
                ? <><FireIcon className="w-3 h-3" /> Tendance</>
                : <><StarIcon className="w-3 h-3" filled /> Populaire</>
              }
            </span>
          </div>
        )}

        {/* Bouton favori (top-right) */}
        <button
          onClick={handleToggleFavorite}
          disabled={isLoading}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-60 shadow-md ${
            isFavorite
              ? 'bg-red-500/80 text-white'
              : 'bg-black/40 hover:bg-red-500/70 text-white'
          }`}
          title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          {isLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeOpacity=".25" strokeWidth={2} />
              <path d="M12 2a10 10 0 0 1 10 10" strokeWidth={2} />
            </svg>
          ) : (
            <HeartIcon className="w-4 h-4" filled={isFavorite} />
          )}
        </button>

        {/* Liens plateforme — apparaissent au survol */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex gap-2 justify-end">
          {artist.spotifyUrl && (
            <a
              href={artist.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="bg-[#1db954] p-1.5 rounded-full shadow-md hover:scale-110 transition-transform"
              title="Ouvrir sur Spotify"
            >
              <SpotifyIcon className="w-4 h-4 text-white" />
            </a>
          )}
          {artist.deezerUrl && (
            <a
              href={artist.deezerUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="bg-gradient-to-r from-orange-500 to-pink-500 p-1.5 rounded-full shadow-md hover:scale-110 transition-transform"
              title="Ouvrir sur Deezer"
            >
              <DeezerIcon className="w-4 h-4 text-white" />
            </a>
          )}
        </div>
      </div>

      {/* ── Infos ── */}
      <div className="p-4">
        {/* Nom */}
        <h3 className="font-bold text-primary truncate mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
          {artist.name}
        </h3>

        {/* Genres */}
        {artist.genres && artist.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {artist.genres.slice(0, 2).map((genre, i) => (
              <span
                key={i}
                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${GENRE_COLORS[i % GENRE_COLORS.length]}`}
              >
                {genre}
              </span>
            ))}
            {artist.genres.length > 2 && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-secondary font-medium">
                +{artist.genres.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Stats + jauge popularité */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-secondary">
            <span className="flex items-center gap-1">
              <UsersIcon className="w-3.5 h-3.5" />
              <span className="font-medium text-primary">{formatFollowers(artist.followers)}</span>
              <span>fans</span>
            </span>
            <span className="font-bold tabular-nums" style={{ color: artist.popularity >= 70 ? '#10b981' : undefined }}>
              {artist.popularity}<span className="text-secondary font-normal">/100</span>
            </span>
          </div>

          {/* Barre popularité */}
          <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${artist.popularity}%`,
                background: `linear-gradient(90deg, ${getPopularityGradient(artist.popularity)})`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistCard;
