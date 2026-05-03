import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { artistService } from '../services/api';
import type { Release } from '../types';
import Header from '../components/ui/Header';
import ReleaseCard from '../components/releases/ReleaseCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { SpotifyIcon, DeezerIcon } from '../components/common/PlatformIcons';
import { useSpotifyPlayer } from '../contexts/SpotifyPlayerContext';
import {
  MicrophoneIcon, HeartIcon, UsersIcon, StarIcon, ChartBarIcon,
  ArrowRightIcon, MusicNoteIcon, DiscIcon, VinylIcon,
} from '../components/ui/Icons';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ArtistDetail {
  id: string;
  spotifyId: string;
  deezerId?: string;
  name: string;
  genres: string[];
  imageUrl?: string;
  popularity: number;
  followers: number;
  spotifyUrl?: string;
  deezerUrl?: string;
  isFavorite: boolean;
  releases: Release[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatFollowers = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
};

const TYPE_ORDER = ['ALBUM', 'EP', 'SINGLE'];
const TYPE_LABEL: Record<string, string> = { ALBUM: 'Albums', EP: 'EPs', SINGLE: 'Singles' };
const TYPE_ICON: Record<string, React.FC<{ className?: string }>> = {
  ALBUM:  DiscIcon,
  EP:     VinylIcon,
  SINGLE: MusicNoteIcon,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const ArtistDetailPage: React.FC = () => {
  const { spotifyId }    = useParams<{ spotifyId: string }>();
  const navigate         = useNavigate();
  const { isReady, playAlbum, currentAlbumId, isPlaying } = useSpotifyPlayer();

  const [artist,    setArtist]    = useState<ArtistDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFav,     setIsFav]     = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [imgError,  setImgError]  = useState(false);
  const [activeType, setActiveType] = useState<string>('ALL');

  useEffect(() => {
    if (!spotifyId) return;
    setIsLoading(true);
    artistService.getBySpotifyId(spotifyId)
      .then(res => {
        if (res.success && res.data) {
          setArtist(res.data);
          setIsFav(res.data.isFavorite);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [spotifyId]);

  const toggleFavorite = async () => {
    if (!artist || favLoading) return;
    setFavLoading(true);
    try {
      if (isFav) {
        await artistService.removeFromFavorites(artist.id);
        setIsFav(false);
      } else {
        await artistService.addToFavorites(artist.spotifyId, 'default');
        setIsFav(true);
      }
    } catch {
      // silencieux
    } finally {
      setFavLoading(false);
    }
  };

  const handlePlay = (spotifyId: string) => {
    if (!isReady) return;
    const queue = filteredReleases
      .filter(r => r.spotifyId && new Date(r.releaseDate) <= new Date())
      .map(r => r.spotifyId!);
    const index = queue.indexOf(spotifyId);
    playAlbum(spotifyId, queue, index);
  };

  // ── Filtrage par type ──────────────────────────────────────────────────
  const availableTypes = TYPE_ORDER.filter(t =>
    artist?.releases.some(r => r.releaseType === t)
  );

  const filteredReleases = (artist?.releases ?? []).filter(r =>
    activeType === 'ALL' || r.releaseType === activeType
  );

  const releaseCount = {
    ALL:    artist?.releases.length ?? 0,
    ALBUM:  artist?.releases.filter(r => r.releaseType === 'ALBUM').length ?? 0,
    EP:     artist?.releases.filter(r => r.releaseType === 'EP').length ?? 0,
    SINGLE: artist?.releases.filter(r => r.releaseType === 'SINGLE').length ?? 0,
  } as Record<string, number>;

  // ─────────────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen mesh-bg">
        <Header />
        <div className="flex flex-col items-center justify-center py-24">
          <LoadingSpinner size="xl" type="musical" />
          <p className="text-secondary mt-4 text-sm">Chargement de l'artiste…</p>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen mesh-bg">
        <Header />
        <div className="flex flex-col items-center justify-center py-24 text-center px-4">
          <MicrophoneIcon className="w-16 h-16 text-secondary mb-4" />
          <h2 className="text-xl font-bold text-primary mb-2">Artiste introuvable</h2>
          <p className="text-secondary text-sm mb-6">Cet artiste n'est pas dans votre bibliothèque.</p>
          <button onClick={() => navigate('/artists')} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
            <ArrowRightIcon className="w-4 h-4 rotate-180" /> Retour aux artistes
          </button>
        </div>
      </div>
    );
  }

  const hasImage = !!artist.imageUrl && !imgError;
  const popularityColor = artist.popularity >= 80 ? '#10b981' : artist.popularity >= 60 ? '#f59e0b' : '#6366f1';

  return (
    <div className="min-h-screen mesh-bg">
      <Header />

      {/* ══════════ HERO ══════════ */}
      <div className="relative overflow-hidden">
        {/* Image de fond floutée */}
        {hasImage && (
          <div
            className="absolute inset-0 scale-110 blur-2xl opacity-20 dark:opacity-30 pointer-events-none"
            style={{ backgroundImage: `url(${artist.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[rgb(var(--bg-primary))]/60 to-[rgb(var(--bg-primary))] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-12">
          {/* Bouton retour */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors mb-8 cursor-pointer group"
          >
            <ArrowRightIcon className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            Retour
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Photo */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/40 dark:to-accent-900/40 ring-4 ring-white/20 dark:ring-white/10">
                {hasImage ? (
                  <img
                    src={artist.imageUrl}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MicrophoneIcon className="w-16 h-16 text-primary-400" />
                  </div>
                )}
              </div>
              {/* Online dot */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0a0a1e] shadow-md" />
            </div>

            {/* Infos */}
            <div className="flex-1 min-w-0 animate-entrance">
              <p className="text-xs font-bold uppercase tracking-widest text-primary-500 dark:text-primary-400 mb-2">Artiste</p>
              <h1 className="text-4xl sm:text-5xl font-black text-primary leading-tight mb-4 truncate">
                {artist.name}
              </h1>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 mb-5">
                <div className="flex items-center gap-1.5 text-sm text-secondary">
                  <UsersIcon className="w-4 h-4 text-primary-400" />
                  <span className="font-bold text-primary">{formatFollowers(artist.followers)}</span>
                  <span>followers</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-secondary">
                  <StarIcon className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-primary">{artist.popularity}</span>
                  <span>/100</span>
                </div>
                {artist.releases.length > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-secondary">
                    <DiscIcon className="w-4 h-4 text-accent-400" />
                    <span className="font-bold text-primary">{artist.releases.length}</span>
                    <span>sortie{artist.releases.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {artist.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {artist.genres.slice(0, 5).map(g => (
                    <span
                      key={g}
                      className="text-xs px-3 py-1 rounded-full bg-white/80 dark:bg-white/8 border border-gray-200 dark:border-white/10 text-secondary font-medium capitalize"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={toggleFavorite}
                  disabled={favLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer disabled:opacity-60 ${
                    isFav
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'btn-secondary'
                  }`}
                >
                  <HeartIcon className="w-4 h-4" filled={isFav} />
                  {isFav ? 'Suivi' : 'Suivre'}
                </button>

                {artist.spotifyUrl && (
                  <a
                    href={artist.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-[#1db954] hover:bg-[#17a349] text-white transition-colors cursor-pointer"
                  >
                    <SpotifyIcon className="w-4 h-4" />
                    Ouvrir sur Spotify
                  </a>
                )}
                {artist.deezerUrl && (
                  <a
                    href={artist.deezerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 text-white transition-opacity cursor-pointer"
                  >
                    <DeezerIcon className="w-4 h-4" />
                    Deezer
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Barre popularité */}
          <div className="mt-8 max-w-md">
            <div className="flex items-center justify-between text-xs text-secondary mb-1.5">
              <span className="flex items-center gap-1"><ChartBarIcon className="w-3 h-3" /> Popularité Spotify</span>
              <span className="font-black tabular-nums" style={{ color: popularityColor }}>{artist.popularity}/100</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${artist.popularity}%`, background: `linear-gradient(90deg, ${popularityColor}99, ${popularityColor})` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ DISCOGRAPHIE ══════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-28 md:pb-16">

        {/* Onglets par type */}
        {artist.releases.length > 0 && (
          <div className="sticky top-0 z-40 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2.5 mb-6 bg-[rgb(var(--bg-primary))]/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2 overflow-x-auto">
              {/* Onglet Tout */}
              <TypeTab
                label="Tout"
                count={releaseCount.ALL}
                active={activeType === 'ALL'}
                onClick={() => setActiveType('ALL')}
              />
              {availableTypes.map(t => (
                <TypeTab
                  key={t}
                  label={TYPE_LABEL[t]}
                  count={releaseCount[t]}
                  Icon={TYPE_ICON[t]}
                  active={activeType === t}
                  onClick={() => setActiveType(t)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Grille */}
        {filteredReleases.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredReleases.map((release, i) => (
              <div
                key={release.id}
                className="animate-entrance"
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <ReleaseCard
                  release={release}
                  onPlay={isReady ? handlePlay : undefined}
                  isPlaying={isPlaying && currentAlbumId === release.spotifyId}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MusicNoteIcon className="w-12 h-12 text-secondary mb-3" />
            {activeType !== 'ALL' ? (
              <p className="text-primary font-semibold">Aucune sortie dans cette catégorie</p>
            ) : !isFav ? (
              <>
                <p className="text-primary font-semibold mb-1">Aucune sortie trackée</p>
                <p className="text-secondary text-sm">Suis cet artiste pour tracker ses sorties automatiquement.</p>
              </>
            ) : (
              <p className="text-primary font-semibold">Aucune sortie disponible</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Tab component ────────────────────────────────────────────────────────────

const TypeTab: React.FC<{
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  Icon?: React.FC<{ className?: string }>;
}> = ({ label, count, active, onClick, Icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 ${
      active
        ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-sm'
        : 'text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5'
    }`}
  >
    {Icon && <Icon className="w-3.5 h-3.5" />}
    {label}
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/25' : 'bg-gray-100 dark:bg-white/10 text-secondary'}`}>
      {count}
    </span>
  </button>
);

export default ArtistDetailPage;
