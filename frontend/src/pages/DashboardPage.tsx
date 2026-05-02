import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { artistService, releaseService } from '../services/api';
import type { FavoriteArtist, Release } from '../types';
import Header from '../components/ui/Header';
import ReleaseCard from '../components/releases/ReleaseCard';
import { useSpotifyPlayer } from '../contexts/SpotifyPlayerContext';
import {
  MusicNoteIcon,
  MicrophoneIcon,
  CalendarIcon,
  StarIcon,
  ChartBarIcon,
  SparkleIcon,
  FireIcon,
  ArrowRightIcon,
} from '../components/ui/Icons';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatFollowers = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const formatDate = (ds: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(new Date(ds));

const daysUntil = (ds: string) =>
  Math.ceil((new Date(ds).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

const TYPE_LABEL: Record<string, string> = { ALBUM: 'Album', EP: 'EP', SINGLE: 'Single' };
const TYPE_GRADIENT: Record<string, string> = {
  ALBUM:  'from-violet-500 to-purple-600',
  EP:     'from-blue-500 to-indigo-600',
  SINGLE: 'from-emerald-500 to-green-600',
};

// ─── Block : Sorties récentes (bloc principal) ────────────────────────────────

const RecentReleasesBlock: React.FC<{
  releases: Release[];
  isLoading: boolean;
  onSeeAll: () => void;
  onPlay?: (spotifyId: string) => void;
  currentAlbumId?: string | null;
  isPlaying?: boolean;
}> = ({ releases, isLoading, onSeeAll, onPlay, currentAlbumId, isPlaying }) => {
  if (isLoading) {
    return (
      <div className="h-full min-h-[300px] rounded-2xl bg-white/60 dark:bg-white/5 border border-gray-100 dark:border-white/8 animate-pulse" />
    );
  }

  if (releases.length === 0) {
    return (
      <div className="h-full min-h-[300px] rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/8 flex flex-col items-center justify-center gap-3 p-8 text-center dark:backdrop-blur-sm">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-500/15 dark:to-green-500/15 flex items-center justify-center">
          <SparkleIcon className="w-8 h-8 text-emerald-500" />
        </div>
        <p className="font-bold text-primary text-lg">Aucune sortie cette semaine</p>
        <p className="text-secondary text-sm max-w-xs">
          Les prochaines sorties de vos artistes apparaîtront ici.
        </p>
        <button onClick={onSeeAll} className="btn-primary px-5 py-2 text-sm flex items-center gap-2 cursor-pointer mt-1">
          <CalendarIcon className="w-4 h-4" /> Voir le calendrier
        </button>
      </div>
    );
  }

  return (
    <div className="h-full rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/8 p-5 dark:backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
            <SparkleIcon className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="font-bold text-primary">Sorties cette semaine</h3>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            {releases.length} nouvelle{releases.length > 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={onSeeAll}
          className="text-xs text-secondary hover:text-primary font-semibold transition-colors flex items-center gap-1 cursor-pointer"
        >
          Voir tout <ArrowRightIcon className="w-3 h-3" />
        </button>
      </div>

      {/* Grille de ReleaseCards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 flex-1">
        {releases.slice(0, 6).map((release, i) => (
          <div key={release.id} className="animate-entrance" style={{ animationDelay: `${i * 40}ms` }}>
            <ReleaseCard
              release={release}
              onPlay={onPlay}
              isPlaying={isPlaying && currentAlbumId === release.spotifyId}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Block : Prochaine sortie (bannière compacte) ─────────────────────────────

const NextReleaseBanner: React.FC<{ release: Release }> = ({ release }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const days     = daysUntil(release.releaseDate);
  const gradient = TYPE_GRADIENT[release.releaseType] ?? TYPE_GRADIENT.SINGLE;
  const url      = release.spotifyUrl || release.deezerUrl;

  return (
    <div className="rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/8 p-4 flex items-center gap-4 dark:backdrop-blur-sm group">
      {/* Cover — ouvre Spotify/Deezer */}
      <a
        href={url ?? undefined}
        target="_blank"
        rel="noopener noreferrer"
        className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 cursor-pointer"
        onClick={e => !url && e.preventDefault()}
      >
        {release.imageUrl && !imgError ? (
          <img src={release.imageUrl} alt={release.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" onError={() => setImgError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MusicNoteIcon className="w-6 h-6 text-primary-400" />
          </div>
        )}
      </a>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r ${gradient} text-white`}>
            {TYPE_LABEL[release.releaseType]}
          </span>
          <span className="text-[10px] font-semibold text-secondary uppercase tracking-wider">Prochaine sortie</span>
        </div>
        <p className="text-sm font-bold text-primary truncate">{release.name}</p>
        <p className="text-xs text-secondary truncate">
          <span
            className="hover:text-primary-500 dark:hover:text-primary-400 transition-colors cursor-pointer"
            onClick={() => release.artist.spotifyId && navigate(`/artists/${release.artist.spotifyId}`)}
          >
            {release.artist.name}
          </span>
          {' · '}{formatDate(release.releaseDate)}
        </p>
      </div>

      {/* Countdown */}
      <div className={`shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} text-white`}>
        <p className="text-xl font-black leading-none">{days}</p>
        <p className="text-[9px] font-semibold opacity-80">jour{days > 1 ? 's' : ''}</p>
      </div>
    </div>
  );
};

// ─── Block : Stats rapides ─────────────────────────────────────────────────────

interface QuickStats {
  totalArtists: number;
  avgPopularity: number;
  totalGenres: number;
}

const StatsBlock: React.FC<{ stats: QuickStats; isLoading: boolean }> = ({ stats, isLoading }) => {
  const rows = [
    { Icon: MicrophoneIcon, label: 'Artistes suivis',    value: stats.totalArtists,                          color: 'text-primary-500' },
    { Icon: StarIcon,       label: 'Popularité moyenne', value: `${stats.avgPopularity}/100`,                 color: 'text-amber-500'   },
    { Icon: ChartBarIcon,   label: 'Genres écoutés',     value: stats.totalGenres,                           color: 'text-violet-500'  },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/8 p-5 dark:backdrop-blur-sm flex flex-col gap-4">
      <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Statistiques</h3>

      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/8 shrink-0" />
              <div className="flex-1 h-4 bg-gray-100 dark:bg-white/8 rounded" />
              <div className="w-12 h-4 bg-gray-100 dark:bg-white/8 rounded" />
            </div>
          ))}
        </div>
      ) : stats.totalArtists === 0 ? (
        <p className="text-secondary text-sm">Ajoutez des artistes pour voir vos stats.</p>
      ) : (
        <div className="space-y-3">
          {rows.map(({ Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-white/8 flex items-center justify-center shrink-0">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <span className="flex-1 text-sm text-secondary truncate">{label}</span>
              <span className="text-sm font-black text-primary tabular-nums">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Block : Top artiste ──────────────────────────────────────────────────────

const TopArtistBlock: React.FC<{ favorite: FavoriteArtist | undefined; isLoading: boolean }> = ({ favorite, isLoading }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  if (isLoading) {
    return <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-gray-100 dark:border-white/8 h-40 animate-pulse" />;
  }

  if (!favorite) {
    return (
      <div className="rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/8 p-5 flex flex-col items-center justify-center gap-2 text-center h-40">
        <MicrophoneIcon className="w-8 h-8 text-secondary" />
        <p className="text-secondary text-sm">Aucun artiste suivi</p>
      </div>
    );
  }

  const { artist } = favorite;
  const hasImage = !!artist.imageUrl && !imgError;

  return (
    <div
      onClick={() => artist.spotifyId && navigate(`/artists/${artist.spotifyId}`)}
      className="relative rounded-2xl overflow-hidden block group cursor-pointer h-40"
    >
      {/* Background image */}
      {hasImage ? (
        <>
          <img
            src={artist.imageUrl!}
            alt={artist.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20" />
      )}

      {/* Badge top */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
        <FireIcon className="w-3 h-3" />
        Top artiste
      </div>

      {/* Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="text-white font-black text-base leading-tight truncate">{artist.name}</p>
        <p className="text-white/60 text-xs mt-0.5">
          {formatFollowers(artist.followers || 0)} fans · {artist.popularity || 0}/100
        </p>
      </div>
    </div>
  );
};


// ─── Page principale ──────────────────────────────────────────────────────────

const DashboardPage: React.FC = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const { isReady, playAlbum, currentAlbumId, isPlaying } = useSpotifyPlayer();

  const [favorites, setFavorites] = useState<FavoriteArtist[]>([]);
  const [releases,  setReleases]  = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const SYNC_KEY      = 'releases_last_sync';
  const SYNC_INTERVAL = 60 * 60 * 1000;

  const loadData = React.useCallback(async () => {
    const start = new Date(); start.setMonth(start.getMonth() - 1);
    const end   = new Date(); end.setMonth(end.getMonth() + 12);

    const [favsRes, relRes] = await Promise.all([
      artistService.getFavorites(),
      releaseService.getUserReleases(start.toISOString(), end.toISOString()),
    ]);
    if (favsRes.success && favsRes.data) setFavorites(favsRes.data);
    if (relRes.success && relRes.data)   setReleases(relRes.data);
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        // Auto-sync silencieux si les données ont plus d'une heure
        const last = Number(localStorage.getItem(SYNC_KEY) ?? 0);
        if (Date.now() - last >= SYNC_INTERVAL) {
          await releaseService.syncReleases();
          localStorage.setItem(SYNC_KEY, String(Date.now()));
        }
        await loadData();
      } catch {
        // silencieux
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [loadData]);

  // ── Dérivations ──────────────────────────────────────────────────────────
  const now = new Date();

  const nextRelease = releases
    .filter(r => new Date(r.releaseDate) > now)
    .sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime())[0] ?? null;

  const thisWeekReleases = releases
    .filter(r => {
      const d = new Date(r.releaseDate);
      return d <= now && d >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    })
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

  const topFavorite = favorites.length > 0
    ? [...favorites].sort((a, b) => (b.artist.popularity || 0) - (a.artist.popularity || 0))[0]
    : undefined;

  const totalGenres = React.useMemo(() => {
    const s = new Set<string>();
    favorites.forEach(f => (f.artist.genres || []).forEach(g => s.add(g)));
    return s.size;
  }, [favorites]);

  const stats: QuickStats = {
    totalArtists:   favorites.length,
    avgPopularity:  favorites.length
      ? Math.round(favorites.reduce((s, f) => s + (f.artist.popularity || 0), 0) / favorites.length)
      : 0,
    totalGenres,
  };

  const handlePlay = (spotifyId: string) => {
    if (!isReady) return;
    const queue = thisWeekReleases
      .filter(r => r.spotifyId && new Date(r.releaseDate) <= new Date())
      .map(r => r.spotifyId!);
    const index = queue.indexOf(spotifyId);
    playAlbum(spotifyId, queue, index);
  };

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Bonjour' : greetingHour < 18 ? 'Bon après-midi' : 'Bonsoir';

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen mesh-bg">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-28 md:pb-12">

        {/* ── Greeting ── */}
        <div className="flex items-center justify-between mb-6 animate-entrance">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-primary">
              {greeting},{' '}
              <span className="gradient-text">{user?.firstName || user?.username}</span>
            </h1>
            <p className="text-secondary text-sm mt-0.5">Voici ce qui se passe dans ta musique</p>
          </div>
          <button
            onClick={() => navigate('/releases')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 btn-secondary text-sm rounded-xl cursor-pointer"
          >
            <CalendarIcon className="w-4 h-4" />
            Calendrier complet
          </button>
        </div>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Bloc gauche — sorties cette semaine (bloc principal) */}
          <div className="lg:col-span-2 animate-entrance" style={{ animationDelay: '60ms' }}>
            <RecentReleasesBlock
              releases={thisWeekReleases}
              isLoading={isLoading}
              onSeeAll={() => navigate('/releases')}
              onPlay={isReady ? handlePlay : undefined}
              currentAlbumId={currentAlbumId}
              isPlaying={isPlaying}
            />
          </div>

          {/* Bloc droite — stats + top artiste */}
          <div className="flex flex-col gap-4 animate-entrance" style={{ animationDelay: '120ms' }}>
            <StatsBlock stats={stats} isLoading={isLoading} />
            <TopArtistBlock favorite={topFavorite} isLoading={isLoading} />
          </div>

          {/* Bannière prochaine sortie — discrète, pleine largeur */}
          {!isLoading && nextRelease && (
            <div className="lg:col-span-3 animate-entrance" style={{ animationDelay: '180ms' }}>
              <NextReleaseBanner release={nextRelease} />
            </div>
          )}
        </div>

        {/* ── Empty state global ── */}
        {!isLoading && favorites.length === 0 && (
          <div className="mt-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/8 p-10 text-center animate-entrance" style={{ animationDelay: '200ms' }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-glow">
              <MicrophoneIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-black text-primary mb-2">Commencez par suivre des artistes</h2>
            <p className="text-secondary text-sm max-w-xs mx-auto mb-6">
              Ajoutez vos artistes favoris pour voir leurs prochaines sorties directement ici.
            </p>
            <button
              onClick={() => navigate('/artists')}
              className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <MicrophoneIcon className="w-4 h-4" />
              Découvrir des artistes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
