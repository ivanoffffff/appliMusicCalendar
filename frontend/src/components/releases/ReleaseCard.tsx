import React, { useState } from 'react';
import type { Release } from '../../types';
import { SpotifyIcon, DeezerIcon } from '../common/PlatformIcons';
import { MusicNoteIcon, DiscIcon, VinylIcon, CalendarIcon, ClockIcon } from '../ui/Icons';

interface ReleaseCardProps {
  release:    Release;
  compact?:   boolean;
  onPlay?:    (spotifyId: string) => void;
  isPlaying?: boolean;
}

type TypeConfig = { label: string; Icon: React.FC<{ className?: string }>; color: string; badgeCls: string };

const TYPE_CONFIG: Record<string, TypeConfig> = {
  ALBUM:  { label: 'Album',  Icon: DiscIcon,      color: '#8b5cf6', badgeCls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  SINGLE: { label: 'Single', Icon: MusicNoteIcon,  color: '#10b981', badgeCls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  EP:     { label: 'EP',     Icon: VinylIcon,      color: '#3b82f6', badgeCls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
};

const FALLBACK_CONFIG: TypeConfig = { label: 'Sortie', Icon: MusicNoteIcon, color: '#6b7280', badgeCls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };

// Icône play/pause inline
const PlayPauseIcon: React.FC<{ playing: boolean }> = ({ playing }) =>
  playing ? (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
    </svg>
  ) : (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"/>
    </svg>
  );

const ReleaseCard: React.FC<ReleaseCardProps> = ({
  release, compact = false, onPlay, isPlaying = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const config = TYPE_CONFIG[release.releaseType] ?? FALLBACK_CONFIG;
  const { Icon: TypeIcon } = config;

  const formatDate = (ds: string) =>
    new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(new Date(ds));

  const releaseDate = new Date(release.releaseDate);
  const now         = new Date();
  const isNew       = releaseDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && releaseDate <= now;
  const isUpcoming  = releaseDate > now;
  const daysDiff    = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Lecture possible si Spotify connecté (onPlay fourni) et id présent
  const canPlay = !!onPlay && !!release.spotifyId && !isUpcoming;

  const handleCoverClick = () => {
    if (canPlay) onPlay!(release.spotifyId!);
  };

  return (
    <div
      className={`group relative flex items-center gap-4 bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 border-l-4 rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 animate-entrance ${compact ? 'p-3' : 'p-4'} ${isPlaying ? 'ring-2 ring-[#1db954]/40' : ''}`}
      style={{ borderLeftColor: isPlaying ? '#1db954' : config.color }}
    >
      {/* ── Pochette (cliquable si lecteur dispo) ── */}
      <div
        className={`relative shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/40 dark:to-accent-900/40 shadow-md transition-all duration-300 ${compact ? 'w-14 h-14' : 'w-20 h-20'} ${canPlay ? 'cursor-pointer' : ''}`}
        onClick={handleCoverClick}
      >
        {release.imageUrl && !imageError ? (
          <img
            src={release.imageUrl}
            alt={release.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${canPlay ? 'group-hover:scale-110' : 'group-hover:scale-110'}`}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MusicNoteIcon className="w-8 h-8 text-primary-400" />
          </div>
        )}

        {/* Overlay play/pause au survol */}
        {canPlay && (
          <div className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity duration-200 ${isPlaying ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
            <div className="text-white drop-shadow-lg">
              <PlayPauseIcon playing={isPlaying} />
            </div>
          </div>
        )}

        {/* Indicateur "en lecture" */}
        {isPlaying && (
          <div className="absolute bottom-1 right-1 flex gap-px items-end h-3">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="w-1 bg-[#1db954] rounded-sm animate-bar-fill"
                style={{ animationDelay: `${i * 0.15}s`, height: `${40 + i * 20}%` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">
        {/* Titre + badge temporel */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <h3 className={`font-bold truncate transition-colors ${compact ? 'text-sm' : 'text-base'} ${isPlaying ? 'text-[#1db954]' : 'text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400'}`}>
              {release.name}
            </h3>
            <p className="text-xs text-secondary truncate mt-0.5">{release.artist.name}</p>
          </div>

          {/* Badges NEW / J-x / BIENTÔT */}
          {isNew && (
            <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-sm animate-pulse-slow">
              NEW
            </span>
          )}
          {isUpcoming && (
            <span className="shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-sm">
              {daysDiff <= 7 ? `J-${daysDiff}` : daysDiff <= 30 ? `${daysDiff}j` : 'BIENTÔT'}
            </span>
          )}
        </div>

        {/* Méta-données */}
        <div className="flex flex-wrap items-center gap-2 mb-2.5">
          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${config.badgeCls}`}>
            <TypeIcon className="w-3 h-3" /> {config.label}
          </span>
          <span className={`inline-flex items-center gap-1 text-xs ${isUpcoming ? 'text-orange-500 dark:text-orange-400 font-medium' : 'text-secondary'}`}>
            {isUpcoming
              ? <ClockIcon className="w-3 h-3" />
              : <CalendarIcon className="w-3 h-3" />
            }
            {formatDate(release.releaseDate)}
          </span>
          {release.trackCount && (
            <span className="text-xs text-secondary">
              · {release.trackCount} piste{release.trackCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Liens */}
        {!compact && (
          <div className="flex items-center gap-2">
            {canPlay && (
              <button
                onClick={handleCoverClick}
                className="inline-flex items-center gap-1.5 bg-[#1db954] hover:bg-[#17a349] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
              >
                <PlayPauseIcon playing={isPlaying} />
                <span>{isPlaying ? 'En lecture' : 'Écouter'}</span>
              </button>
            )}
            {!canPlay && release.spotifyUrl && (
              <a
                href={release.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#1db954] hover:bg-[#17a349] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                title={isUpcoming ? 'Pré-enregistrer sur Spotify' : 'Écouter sur Spotify'}
              >
                <SpotifyIcon className="w-3.5 h-3.5" />
                <span>{isUpcoming ? 'Pré-save' : 'Spotify'}</span>
              </a>
            )}
            {release.deezerUrl && (
              <a
                href={release.deezerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                title={isUpcoming ? 'Pré-enregistrer sur Deezer' : 'Écouter sur Deezer'}
              >
                <DeezerIcon className="w-3.5 h-3.5" />
                <span>Deezer</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReleaseCard;
