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
  delay = 0,
}) => {
  const handleClick = () => {
    if (spotifyUrl) window.open(spotifyUrl, '_blank');
    else if (deezerUrl) window.open(deezerUrl, '_blank');
  };

  const getPopularityGradient = (pop: number) => {
    if (pop >= 80) return '#10b981, #059669';   // vert
    if (pop >= 60) return '#f59e0b, #f97316';   // ambre → orange
    if (pop >= 40) return '#f97316, #ef4444';   // orange → rouge
    return '#ef4444, #dc2626';                   // rouge
  };

  const getMedal = (r: number) => {
    if (r === 1) return '🥇';
    if (r === 2) return '🥈';
    if (r === 3) return '🥉';
    return `#${r}`;
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 shadow-card hover:shadow-card-hover hover:-translate-y-1.5 cursor-pointer group transition-all duration-300 animate-entrance"
      onClick={handleClick}
      style={{ animationDelay: `${delay * 80}ms` }}
    >
      {/* Rank badge */}
      <div className="absolute top-2.5 left-2.5 z-10">
        <div className="bg-black/50 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-xs font-bold shadow-md">
          {getMedal(rank)}
        </div>
      </div>

      {/* TOP badge pour le #1 */}
      {rank === 1 && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md animate-pulse-slow flex items-center gap-1">
            ⭐ Top
          </div>
        </div>
      )}

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary-500/20 to-accent-500/20">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            🎵
          </div>
        )}

        {/* Overlay au survol */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2">
          {spotifyUrl && (
            <div className="bg-[#1db954] text-white p-1.5 rounded-full shadow-md">
              <SpotifyIcon className="w-4 h-4" />
            </div>
          )}
          {deezerUrl && (
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white p-1.5 rounded-full shadow-md">
              <DeezerIcon className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Infos */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-primary truncate mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {name}
        </h3>

        {/* Jauge popularité */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-secondary font-medium">Popularité</span>
            <span className="font-bold text-primary tabular-nums">{popularity}<span className="text-secondary font-normal">/100</span></span>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${popularity}%`,
                background: `linear-gradient(90deg, ${getPopularityGradient(popularity)})`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
    </div>
  );
};

export default TopArtistCard;
