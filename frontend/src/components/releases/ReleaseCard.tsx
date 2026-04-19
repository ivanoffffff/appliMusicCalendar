import React, { useState } from 'react';
import type { Release } from '../../types';
import { SpotifyIcon, DeezerIcon } from '../common/PlatformIcons';

interface ReleaseCardProps {
  release: Release;
  compact?: boolean;
}

const TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string; badgeCls: string }> = {
  ALBUM:  { label: 'Album',  emoji: '💿', color: '#8b5cf6', badgeCls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  SINGLE: { label: 'Single', emoji: '🎵', color: '#10b981', badgeCls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  EP:     { label: 'EP',     emoji: '📀', color: '#3b82f6', badgeCls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
};

const FALLBACK_CONFIG = { label: 'Sortie', emoji: '🎵', color: '#6b7280', badgeCls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' };

const ReleaseCard: React.FC<ReleaseCardProps> = ({ release, compact = false }) => {
  const [imageError, setImageError] = useState(false);

  const config = TYPE_CONFIG[release.releaseType] ?? FALLBACK_CONFIG;

  const formatDate = (ds: string) =>
    new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(ds));

  const releaseDate = new Date(release.releaseDate);
  const now         = new Date();
  const isNew       = releaseDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && releaseDate <= now;
  const isUpcoming  = releaseDate > now;
  const daysDiff    = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div
      className={`group relative flex items-center gap-4 bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 border-l-4 rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 animate-entrance ${compact ? 'p-3' : 'p-4'}`}
      style={{ borderLeftColor: config.color }}
    >
      {/* ── Image ── */}
      <div className={`shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/40 dark:to-accent-900/40 shadow-md group-hover:shadow-lg transition-shadow duration-300 ${compact ? 'w-14 h-14' : 'w-20 h-20'}`}>
        {release.imageUrl && !imageError ? (
          <img
            src={release.imageUrl}
            alt={release.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">🎵</div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">
        {/* Titre + badge temporel */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <h3 className={`font-bold text-primary truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors ${compact ? 'text-sm' : 'text-base'}`}>
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
            {config.emoji} {config.label}
          </span>
          <span className={`text-xs ${isUpcoming ? 'text-orange-500 dark:text-orange-400 font-medium' : 'text-secondary'}`}>
            {isUpcoming ? '🗓️' : '📅'} {formatDate(release.releaseDate)}
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
            {release.spotifyUrl && (
              <a
                href={release.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#1db954] hover:bg-[#17a349] text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md"
                title={isUpcoming ? 'Pré-enregistrer sur Spotify' : 'Écouter sur Spotify'}
              >
                <SpotifyIcon className="w-3.5 h-3.5" />
                <span>{isUpcoming ? 'Pré-save' : 'Écouter'}</span>
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
