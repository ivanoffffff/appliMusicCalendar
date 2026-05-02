import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Release } from '../../types';
import { SpotifyIcon, DeezerIcon } from '../common/PlatformIcons';
import { MusicNoteIcon, DiscIcon, VinylIcon, CalendarIcon, ClockIcon } from '../ui/Icons';

interface ReleaseCardProps {
  release:    Release;
  onPlay?:    (spotifyId: string) => void;
  isPlaying?: boolean;
}

type TypeConfig = { label: string; Icon: React.FC<{ className?: string }>; color: string; gradientFrom: string; gradientTo: string };

const TYPE_CONFIG: Record<string, TypeConfig> = {
  ALBUM:  { label: 'Album',  Icon: DiscIcon,       color: '#8b5cf6', gradientFrom: 'from-purple-500', gradientTo: 'to-violet-600'  },
  SINGLE: { label: 'Single', Icon: MusicNoteIcon,  color: '#10b981', gradientFrom: 'from-emerald-500', gradientTo: 'to-green-600'  },
  EP:     { label: 'EP',     Icon: VinylIcon,      color: '#3b82f6', gradientFrom: 'from-blue-500',   gradientTo: 'to-indigo-600'  },
};
const FALLBACK_CONFIG: TypeConfig = {
  label: 'Sortie', Icon: MusicNoteIcon, color: '#6b7280', gradientFrom: 'from-gray-400', gradientTo: 'to-gray-500',
};

const PlayIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
);
const PauseIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
);

const ReleaseCard: React.FC<ReleaseCardProps> = ({ release, onPlay, isPlaying = false }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const config     = TYPE_CONFIG[release.releaseType] ?? FALLBACK_CONFIG;
  const { Icon: TypeIcon } = config;

  const formatDate = (ds: string) =>
    new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(ds));

  const releaseDate = new Date(release.releaseDate);
  const now         = new Date();
  const isNew       = releaseDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && releaseDate <= now;
  const isUpcoming  = releaseDate > now;
  const daysDiff    = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const canPlay = !!onPlay && !!release.spotifyId && !isUpcoming;

  return (
    <div className={`group relative rounded-2xl overflow-hidden bg-white dark:bg-white/5 border border-gray-100 dark:border-white/8 shadow-card dark:shadow-none hover:shadow-card-hover dark:hover:shadow-glow hover:-translate-y-1.5 transition-all duration-300 animate-entrance dark:backdrop-blur-sm ${isPlaying ? 'ring-2 ring-[#1db954]/50' : ''}`}>

      {/* ── Image pleine largeur ── */}
      <div
        className={`relative aspect-square overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/40 dark:to-accent-900/40 ${canPlay ? 'cursor-pointer' : ''}`}
        onClick={canPlay ? () => onPlay!(release.spotifyId!) : undefined}
      >
        {release.imageUrl && !imageError ? (
          <img
            src={release.imageUrl}
            alt={release.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MusicNoteIcon className="w-16 h-16 text-primary-400" />
          </div>
        )}

        {/* Gradient overlay bas */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badge type (top-left) */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`flex items-center gap-1 bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm`}>
            <TypeIcon className="w-3 h-3" />
            {config.label}
          </span>
        </div>

        {/* Badge temporel (top-right) */}
        {isNew && (
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-sm animate-pulse-slow">
              NEW
            </span>
          </div>
        )}
        {isUpcoming && (
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-sm">
              {daysDiff <= 7 ? `J-${daysDiff}` : daysDiff <= 30 ? `${daysDiff}j` : 'BIENTÔT'}
            </span>
          </div>
        )}

        {/* Overlay play au survol */}
        {canPlay && (
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isPlaying ? 'opacity-100 bg-black/20' : 'opacity-0 group-hover:opacity-100 bg-black/30'}`}>
            <div className="w-12 h-12 bg-[#1db954] hover:bg-[#17a349] rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition-transform duration-200 text-white">
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </div>
          </div>
        )}

        {/* Barres "en lecture" */}
        {isPlaying && (
          <div className="absolute bottom-3 right-3 flex gap-px items-end h-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="w-1 bg-[#1db954] rounded-sm animate-bar-fill"
                style={{ animationDelay: `${i * 0.15}s`, height: `${40 + i * 20}%` }}
              />
            ))}
          </div>
        )}

        {/* Liens plateforme — apparaissent au survol */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex gap-2 justify-end">
          {!canPlay && release.spotifyUrl && (
            <a
              href={release.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="bg-[#1db954] p-1.5 rounded-full shadow-md hover:scale-110 transition-transform"
              title={isUpcoming ? 'Pré-enregistrer sur Spotify' : 'Ouvrir sur Spotify'}
            >
              <SpotifyIcon className="w-4 h-4 text-white" />
            </a>
          )}
          {release.deezerUrl && (
            <a
              href={release.deezerUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="bg-gradient-to-r from-orange-500 to-pink-500 p-1.5 rounded-full shadow-md hover:scale-110 transition-transform"
              title={isUpcoming ? 'Pré-enregistrer sur Deezer' : 'Ouvrir sur Deezer'}
            >
              <DeezerIcon className="w-4 h-4 text-white" />
            </a>
          )}
        </div>
      </div>

      {/* ── Infos ── */}
      <div className="p-3">
        <h3 className={`font-bold truncate mb-0.5 transition-colors duration-200 text-sm group-hover:text-primary-600 dark:group-hover:text-primary-400 ${isPlaying ? 'text-[#1db954]' : 'text-primary'}`}>
          {release.spotifyUrl ? (
            <a
              href={release.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="hover:underline"
            >
              {release.name}
            </a>
          ) : release.name}
        </h3>
        <p
          className="text-xs text-secondary truncate mb-2 hover:text-primary-500 dark:hover:text-primary-400 transition-colors cursor-pointer"
          onClick={e => { e.stopPropagation(); release.artist.spotifyId && navigate(`/artists/${release.artist.spotifyId}`); }}
        >
          {release.artist.name}
        </p>

        <div className="flex items-center gap-2 text-[11px] text-secondary">
          <span className="flex items-center gap-1">
            {isUpcoming
              ? <ClockIcon className="w-3 h-3 text-orange-400" />
              : <CalendarIcon className="w-3 h-3" />
            }
            <span className={isUpcoming ? 'text-orange-500 dark:text-orange-400 font-medium' : ''}>
              {formatDate(release.releaseDate)}
            </span>
          </span>
          {release.trackCount && (
            <span className="text-secondary">· {release.trackCount} piste{release.trackCount > 1 ? 's' : ''}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReleaseCard;
