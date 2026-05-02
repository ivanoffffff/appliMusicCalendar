import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { artistService } from '../services/api';
import type { FavoriteArtist } from '../types';
import Header from '../components/ui/Header';
import StatsCard from '../components/stats/StatsCard';
import TopArtistCard from '../components/artists/TopArtistCard';
import GenreDistribution from '../components/stats/GenreDistribution';
import ProfileBadges from '../components/profile/ProfileBadges';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import {
  MusicNoteIcon,
  WaveIcon,
  MicrophoneIcon,
  CalendarIcon,
  TrendingUpIcon,
  StarIcon,
  UsersIcon,
  SparkleIcon,
  ChartBarIcon,
  UserIcon,
} from '../components/ui/Icons';

// ─── Section header réutilisable ───────────────────────────────────────────
const SectionHeader: React.FC<{ Icon: React.FC<{ className?: string }>; title: string }> = ({ Icon, title }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-white" />
    </div>
    <h2 className="text-xl font-bold text-primary whitespace-nowrap">{title}</h2>
    <div className="flex-1 h-px bg-gradient-to-r from-primary-200/50 dark:from-white/10 to-transparent" />
  </div>
);

// ─── Page principale ───────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites]   = useState<FavoriteArtist[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setIsLoading(true);
      const response = await artistService.getFavorites();
      if (response.success && response.data) {
        setFavorites(response.data);
      }
    } catch {
      setError('Impossible de charger les statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = React.useMemo(() => {
    if (!favorites.length) return { totalArtists: 0, avgPopularity: 0, totalFollowers: 0 };
    const totalArtists   = favorites.length;
    const avgPopularity  = Math.round(favorites.reduce((s, f) => s + (f.artist.popularity || 0), 0) / totalArtists);
    const totalFollowers = favorites.reduce((s, f) => s + (f.artist.followers || 0), 0);
    return { totalArtists, avgPopularity, totalFollowers };
  }, [favorites]);

  const topArtists = React.useMemo(
    () => [...favorites].sort((a, b) => (b.artist.popularity || 0) - (a.artist.popularity || 0)).slice(0, 4),
    [favorites]
  );

  const genreDistribution = React.useMemo(() => {
    if (!favorites.length) return [];
    const count: Record<string, number> = {};
    favorites.forEach(f => (f.artist.genres || []).forEach(g => (count[g] = (count[g] || 0) + 1)));
    return Object.entries(count)
      .map(([name, c]) => ({ name, count: c, percentage: Math.round((c / favorites.length) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [favorites]);

  const totalGenres = React.useMemo(() => {
    const s = new Set<string>();
    favorites.forEach(f => (f.artist.genres || []).forEach(g => s.add(g)));
    return s.size;
  }, [favorites]);

  const formatFollowers = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen mesh-bg">
      <Header />

      {/* ══════════ HERO ══════════ */}
      <div className="relative overflow-hidden">

        {/* Animated orbs */}
        <div
          className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.07] dark:opacity-[0.12] pointer-events-none animate-orb-float-1"
          style={{ background: 'radial-gradient(circle, #818cf8 0%, #6366f1 40%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full opacity-[0.06] dark:opacity-[0.1] pointer-events-none animate-orb-float-2"
          style={{ background: 'radial-gradient(circle, #a78bfa 0%, #8b5cf6 40%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-[0.04] dark:opacity-[0.07] pointer-events-none animate-orb-float-3"
          style={{ background: 'radial-gradient(ellipse, #6366f1 0%, transparent 70%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">

            {/* ── Welcome text ── */}
            <div className="animate-entrance">
              {/* Eyebrow label */}
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-primary-200/60 dark:border-primary-500/20 bg-primary-50/80 dark:bg-primary-500/10 backdrop-blur-sm">
                <MusicNoteIcon className="w-3.5 h-3.5 text-primary-500" />
                <span className="text-[11px] font-semibold tracking-widest uppercase text-primary-600 dark:text-primary-400">
                  Music Tracker
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-primary mb-3 leading-[1.1] flex items-center gap-3 flex-wrap">
                Bonjour,{' '}
                <span className="gradient-text">
                  {user?.firstName || user?.username}
                </span>
                <WaveIcon className="w-9 h-9 text-amber-400" />
              </h1>

              <p className="text-secondary text-base sm:text-lg max-w-md">
                Votre hub musical personnel
                {!isLoading && stats.totalArtists > 0 && (
                  <>
                    {' '}·{' '}
                    <span className="font-semibold text-primary">{stats.totalArtists}</span>
                    {' '}artiste{stats.totalArtists !== 1 ? 's' : ''} suivi{stats.totalArtists !== 1 ? 's' : ''}
                  </>
                )}
              </p>
            </div>

            {/* ── Quick actions ── */}
            <div className="flex gap-3 animate-entrance" style={{ animationDelay: '100ms' }}>
              <button
                onClick={() => navigate('/artists')}
                className="flex items-center gap-2 px-5 py-3 bg-white/90 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 rounded-2xl border border-gray-200/80 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-sm font-semibold text-primary backdrop-blur-sm cursor-pointer"
              >
                <MicrophoneIcon className="w-4 h-4 text-primary-500" />
                <span>Artistes</span>
              </button>
              <button
                onClick={() => navigate('/releases')}
                className="btn-primary flex items-center gap-2 px-5 py-3 text-sm rounded-2xl"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Sorties</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-b from-transparent to-[rgb(var(--bg-primary))] pointer-events-none" />
      </div>

      {/* ══════════ STATISTIQUES ══════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-4">
        <SectionHeader Icon={TrendingUpIcon} title="Vos Statistiques" />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="music-card bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30">
            <p className="text-red-500 text-center">{error}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            <StatsCard
              title="Artistes suivis"
              icon={MicrophoneIcon}
              value={stats.totalArtists}
              subtitle={stats.totalArtists > 0 ? 'dans votre collection' : 'Ajoutez vos premiers artistes'}
              gradient="from-blue-500 to-indigo-600"
              glowColor="#6366f1"
              delay={1}
            />
            <StatsCard
              title="Popularité moyenne"
              icon={StarIcon}
              value={stats.totalArtists > 0 ? `${stats.avgPopularity}/100` : '—'}
              subtitle={stats.totalArtists > 0 ? 'score Spotify moyen' : 'Aucune donnée'}
              gradient="from-amber-400 to-orange-500"
              glowColor="#f59e0b"
              delay={2}
            />
            <StatsCard
              title="Followers cumulés"
              icon={UsersIcon}
              value={stats.totalArtists > 0 ? formatFollowers(stats.totalFollowers) : '—'}
              subtitle={stats.totalArtists > 0 ? 'fans au total' : 'Aucune donnée'}
              gradient="from-emerald-400 to-green-600"
              glowColor="#10b981"
              delay={3}
            />
          </div>
        )}
      </div>

      {/* ══════════ TOP ARTISTES ══════════ */}
      {!isLoading && topArtists.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
              <SparkleIcon className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-primary whitespace-nowrap">Vos Top Artistes</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-amber-200/50 dark:from-white/10 to-transparent" />
            <button
              onClick={() => navigate('/artists')}
              className="text-sm font-semibold text-primary-500 hover:text-primary-400 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
            >
              Voir tous <span aria-hidden>→</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {topArtists.map((favorite, index) => (
              <TopArtistCard
                key={favorite.id}
                rank={index + 1}
                name={favorite.artist.name}
                imageUrl={favorite.artist.imageUrl}
                popularity={favorite.artist.popularity || 0}
                spotifyUrl={favorite.artist.spotifyUrl}
                deezerUrl={favorite.artist.deezerUrl}
                delay={index + 1}
              />
            ))}
          </div>
        </div>
      )}

      {/* ══════════ GENRES ══════════ */}
      {!isLoading && genreDistribution.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <SectionHeader Icon={ChartBarIcon} title="Répartition par Genres" />
          <GenreDistribution genres={genreDistribution} />
        </div>
      )}

      {/* ══════════ PROFIL ══════════ */}
      {!isLoading && user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-16">
          <SectionHeader Icon={UserIcon} title="Votre Profil" />
          <ProfileBadges
            totalArtists={stats.totalArtists}
            totalGenres={totalGenres}
            username={user.username}
            firstName={user.firstName}
          />
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
