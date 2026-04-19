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

// ─── Section header réutilisable ───────────────────────────────────────────
const SectionHeader: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="text-xl">{icon}</span>
    <h2 className="text-xl font-bold text-primary whitespace-nowrap">{title}</h2>
    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-slate-700 to-transparent" />
  </div>
);

// ─── Page principale ───────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState<FavoriteArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
    } catch (err) {
      console.error('Erreur lors du chargement des favoris:', err);
      setError('Impossible de charger les statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = React.useMemo(() => {
    if (!favorites.length) return { totalArtists: 0, avgPopularity: 0, totalFollowers: 0 };
    const totalArtists = favorites.length;
    const avgPopularity = Math.round(
      favorites.reduce((s, f) => s + (f.artist.popularity || 0), 0) / totalArtists
    );
    const totalFollowers = favorites.reduce((s, f) => s + (f.artist.followers || 0), 0);
    return { totalArtists, avgPopularity, totalFollowers };
  }, [favorites]);

  // ── Top artistes (popularité desc) ────────────────────────────────────
  const topArtists = React.useMemo(
    () =>
      [...favorites]
        .sort((a, b) => (b.artist.popularity || 0) - (a.artist.popularity || 0))
        .slice(0, 4),
    [favorites]
  );

  // ── Répartition genres ────────────────────────────────────────────────
  const genreDistribution = React.useMemo(() => {
    if (!favorites.length) return [];
    const count: Record<string, number> = {};
    favorites.forEach(f => (f.artist.genres || []).forEach(g => (count[g] = (count[g] || 0) + 1)));
    return Object.entries(count)
      .map(([name, c]) => ({ name, count: c, percentage: Math.round((c / favorites.length) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [favorites]);

  // ── Genres uniques ────────────────────────────────────────────────────
  const totalGenres = React.useMemo(() => {
    const s = new Set<string>();
    favorites.forEach(f => (f.artist.genres || []).forEach(g => s.add(g)));
    return s.size;
  }, [favorites]);

  // ── Format followers ──────────────────────────────────────────────────
  const formatFollowers = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-primary">
      <Header />

      {/* ══════════ HERO ══════════ */}
      <div className="relative overflow-hidden border-b border-gray-100 dark:border-slate-800/60">
        {/* Fond dégradé */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20" />

        {/* Orbes décoratifs */}
        <div
          className="absolute -top-28 -right-28 w-80 h-80 rounded-full blur-3xl opacity-25 dark:opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-20 dark:opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

            {/* Texte de bienvenue */}
            <div className="animate-entrance">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full border border-primary-100 dark:border-primary-800/30">
                  🎵 Music Tracker
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2 leading-tight">
                Bonjour,{' '}
                <span className="gradient-text">
                  {user?.firstName || user?.username}
                </span>{' '}
                👋
              </h1>
              <p className="text-secondary text-sm sm:text-base">
                Votre hub musical personnel
                {!isLoading && stats.totalArtists > 0 && (
                  <> · <span className="font-medium text-primary">{stats.totalArtists}</span> artiste{stats.totalArtists !== 1 ? 's' : ''} suivi{stats.totalArtists !== 1 ? 's' : ''}</>
                )}
              </p>
            </div>

            {/* Actions rapides */}
            <div
              className="flex gap-3 animate-entrance"
              style={{ animationDelay: '150ms' }}
            >
              <button
                onClick={() => navigate('/artists')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium text-primary"
              >
                🎤 <span className="hidden sm:inline">Mes</span> Artistes
              </button>
              <button
                onClick={() => navigate('/releases')}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium text-white"
              >
                📅 <span className="hidden sm:inline">Voir les</span> Sorties
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ STATISTIQUES ══════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-4">
        <SectionHeader icon="📈" title="Vos Statistiques" />

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
              value={stats.totalArtists}
              icon="🎵"
              subtitle={
                stats.totalArtists > 0
                  ? 'dans votre collection'
                  : 'Ajoutez vos premiers artistes'
              }
              gradient="from-blue-500 to-blue-600"
              delay={1}
            />
            <StatsCard
              title="Popularité moyenne"
              value={stats.totalArtists > 0 ? `${stats.avgPopularity}/100` : '—'}
              icon="⭐"
              subtitle={
                stats.totalArtists > 0 ? 'score Spotify moyen' : 'Aucune donnée'
              }
              gradient="from-amber-500 to-orange-500"
              delay={2}
            />
            <StatsCard
              title="Followers cumulés"
              value={
                stats.totalArtists > 0
                  ? formatFollowers(stats.totalFollowers)
                  : '—'
              }
              icon="👥"
              subtitle={stats.totalArtists > 0 ? 'fans au total' : 'Aucune donnée'}
              gradient="from-emerald-500 to-green-600"
              delay={3}
            />
          </div>
        )}
      </div>

      {/* ══════════ TOP ARTISTES ══════════ */}
      {!isLoading && topArtists.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">🌟</span>
            <h2 className="text-xl font-bold text-primary whitespace-nowrap">Vos Top Artistes</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-slate-700 to-transparent" />
            <button
              onClick={() => navigate('/artists')}
              className="text-sm font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors shrink-0 flex items-center gap-1"
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
          <SectionHeader icon="📊" title="Répartition par Genres" />
          <GenreDistribution genres={genreDistribution} />
        </div>
      )}

      {/* ══════════ PROFIL ══════════ */}
      {!isLoading && user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-16">
          <SectionHeader icon="👤" title="Votre Profil" />
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
