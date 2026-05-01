import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { Release, CalendarEvent } from '../types';
import { releaseService } from '../services/api';
import ReleaseCard from '../components/releases/ReleaseCard';
import Header from '../components/ui/Header';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useSpotifyPlayer } from '../contexts/SpotifyPlayerContext';

// ─── Types ──────────────────────────────────────────────────────────────────
type View   = 'list' | 'calendar';
type Filter = 'all' | 'upcoming' | 'past';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, { bg: string; border: string }> = {
  ALBUM:  { bg: '#8b5cf6', border: '#7c3aed' },
  EP:     { bg: '#3b82f6', border: '#2563eb' },
  SINGLE: { bg: '#10b981', border: '#059669' },
};

const groupByMonth = (list: Release[]): [string, Release[]][] => {
  const map: Record<string, Release[]> = {};
  list.forEach(r => {
    const d   = new Date(r.releaseDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map[key]) map[key] = [];
    map[key].push(r);
  });
  return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
};

const formatMonthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  const date = new Date(y, m - 1);
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date);
};

const isCurrentMonth = (key: string) => {
  const now = new Date();
  return key === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const isFutureMonth = (key: string) => {
  const now = new Date();
  const cur = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  return key > cur;
};

// ─── Page ────────────────────────────────────────────────────────────────────
const ReleasesPage: React.FC = () => {
  const navigate = useNavigate();

  const [releases,         setReleases]         = useState<Release[]>([]);
  const [calendarEvents,   setCalendarEvents]   = useState<CalendarEvent[]>([]);
  const [isLoading,        setIsLoading]        = useState(true);
  const [isSyncing,        setIsSyncing]        = useState(false);
  const [toast,            setToast]            = useState<{ msg: string; ok: boolean } | null>(null);
  const [selectedRelease,  setSelectedRelease]  = useState<Release | null>(null);
  const [view,             setView]             = useState<View>('list');
  const [filter,           setFilter]           = useState<Filter>('all');

  const { isReady, playAlbum, currentTrack, isPlaying, isPremiumError } = useSpotifyPlayer();

  const handlePlay = (spotifyId: string) => {
    if (isReady) playAlbum(spotifyId);
  };

  // ── Stats rapides ──────────────────────────────────────────────────────
  const now = new Date();
  const upcomingCount = releases.filter(r => new Date(r.releaseDate) > now).length;
  const newCount      = releases.filter(r => {
    const d = new Date(r.releaseDate);
    return d >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && d <= now;
  }).length;

  // ── Load ───────────────────────────────────────────────────────────────
  const loadReleases = useCallback(async () => {
    try {
      setIsLoading(true);
      const start = new Date(); start.setMonth(start.getMonth() - 6);
      const end   = new Date(); end.setMonth(end.getMonth() + 6);

      const res = await releaseService.getUserReleases(start.toISOString(), end.toISOString());
      if (res.success && res.data) {
        setReleases(res.data);
        setCalendarEvents(
          res.data.map(r => ({
            id: r.id,
            title: `${r.artist.name} — ${r.name}`,
            date: r.releaseDate,
            allDay: true,
            backgroundColor: (TYPE_COLORS[r.releaseType] ?? TYPE_COLORS.SINGLE).bg,
            borderColor:     (TYPE_COLORS[r.releaseType] ?? TYPE_COLORS.SINGLE).border,
            extendedProps: { release: r },
          }))
        );
      }
    } catch {
      showToast('Erreur de connexion au serveur', false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadReleases(); }, [loadReleases]);

  // ── Sync ───────────────────────────────────────────────────────────────
  const syncReleases = async () => {
    try {
      setIsSyncing(true);
      const res = await releaseService.syncReleases();
      if (res.success) {
        await loadReleases();
        showToast('Synchronisation réussie !', true);
      } else {
        showToast(res.message || 'Erreur lors de la synchronisation', false);
      }
    } catch {
      showToast('Erreur lors de la synchronisation', false);
    } finally {
      setIsSyncing(false);
    }
  };

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Filtrage ──────────────────────────────────────────────────────────
  const filteredReleases = releases.filter(r => {
    const d = new Date(r.releaseDate);
    if (filter === 'upcoming') return d > now;
    if (filter === 'past')     return d <= now;
    return true;
  });

  const groupedReleases = groupByMonth(filteredReleases);

  // ─────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <LoadingSpinner size="xl" type="musical" />
          <p className="text-secondary mt-4 text-sm">Chargement du calendrier…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Header />

      {/* ══════════ HERO ══════════ */}
      <div className="relative overflow-hidden border-b border-gray-100 dark:border-slate-800/60">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-purple-50/20 to-blue-50/20 dark:from-slate-900 dark:via-purple-950/15 dark:to-blue-950/10" />
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 dark:opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

          {/* Banner Premium requis */}
          {isPremiumError && (
            <div className="mb-6 flex items-center gap-3 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-2xl text-sm animate-entrance">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold">Spotify Premium requis</p>
                <p className="text-xs opacity-80 mt-0.5">Le lecteur web Spotify nécessite un abonnement Premium. Tu peux toujours ouvrir les titres directement sur Spotify.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

            {/* Texte + quick stats */}
            <div className="animate-entrance">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/20 px-3 py-1 rounded-full border border-accent-100 dark:border-accent-800/30">
                  📅 Sorties musicales
                </span>
              </div>
              <h1 className="text-3xl font-bold text-primary mb-1 leading-tight">
                Mon <span className="gradient-text">Calendrier</span>
              </h1>
              {releases.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="text-sm text-secondary">
                    <span className="font-semibold text-primary">{releases.length}</span> sortie{releases.length !== 1 ? 's' : ''} au total
                  </span>
                  {upcomingCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2.5 py-1 rounded-full border border-orange-100 dark:border-orange-800/30">
                      ⏰ {upcomingCount} à venir
                    </span>
                  )}
                  {newCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/30">
                      ✨ {newCount} cette semaine
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Légende types */}
            <div className="flex items-center gap-3 animate-entrance" style={{ animationDelay: '120ms' }}>
              {[
                { label: 'Album',  color: '#8b5cf6' },
                { label: 'Single', color: '#10b981' },
                { label: 'EP',     color: '#3b82f6' },
              ].map(t => (
                <div key={t.label} className="flex items-center gap-1.5 text-xs text-secondary">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.color }} />
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ CONTRÔLES STICKY ══════════ */}
      <div className="sticky top-14 md:top-16 z-40 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">

            <div className="flex flex-wrap items-center gap-2">
              {/* Toggle Vue */}
              <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                {([
                  { id: 'list',     emoji: '📋', label: 'Liste' },
                  { id: 'calendar', emoji: '📅', label: 'Calendrier' },
                ] as { id: View; emoji: string; label: string }[]).map(v => (
                  <button
                    key={v.id}
                    onClick={() => setView(v.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      view === v.id
                        ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    <span>{v.emoji}</span>
                    <span className="hidden sm:inline">{v.label}</span>
                  </button>
                ))}
              </div>

              {/* Filtres (liste uniquement) */}
              {view === 'list' && (
                <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
                  {([
                    { id: 'all',      label: 'Toutes' },
                    { id: 'upcoming', label: '⏰ À venir' },
                    { id: 'past',     label: '✅ Passées' },
                  ] as { id: Filter; label: string }[]).map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        filter === f.id
                          ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                          : 'text-secondary hover:text-primary'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bouton Sync */}
            <button
              onClick={syncReleases}
              disabled={isSyncing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-spotify-500 to-spotify-600 hover:from-spotify-600 hover:to-spotify-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              <span className={isSyncing ? 'animate-spin inline-block' : ''}>🔄</span>
              <span className="hidden sm:inline">{isSyncing ? 'Sync…' : 'Synchroniser'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════ TOAST ══════════ */}
      {toast && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium animate-entrance ${
            toast.ok
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400'
              : 'bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/40 text-red-600 dark:text-red-400'
          }`}>
            <span>{toast.ok ? '✅' : '⚠️'}</span>
            {toast.msg}
          </div>
        </div>
      )}

      {/* ══════════ CONTENU PRINCIPAL ══════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-10">

        {/* ── Empty state ── */}
        {releases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center text-5xl mb-6 shadow-card">
              📅
            </div>
            <h2 className="text-xl font-bold text-primary mb-2">Aucune sortie trouvée</h2>
            <p className="text-secondary text-sm text-center max-w-xs mb-8">
              Ajoutez des artistes à vos favoris puis synchronisez pour voir leurs sorties apparaître ici.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/artists')} className="btn-primary px-6 py-2.5 text-sm">
                🎤 Ajouter des artistes
              </button>
              <button onClick={syncReleases} disabled={isSyncing} className="btn-secondary px-6 py-2.5 text-sm disabled:opacity-50">
                🔄 {isSyncing ? 'Sync…' : 'Synchroniser'}
              </button>
            </div>
          </div>

        ) : view === 'calendar' ? (

          /* ── Vue calendrier ── */
          <div className="bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 rounded-2xl shadow-card p-4 md:p-6">
            <FullCalendar
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              eventClick={(info) => setSelectedRelease(info.event.extendedProps.release as Release)}
              headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
              height="auto"
              locale="fr"
              eventDisplay="block"
              dayMaxEvents={3}
            />
          </div>

        ) : (

          /* ── Vue liste groupée par mois ── */
          <>
            {filteredReleases.length === 0 ? (
              <div className="text-center py-12 music-card">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-secondary text-sm">Aucune sortie pour ce filtre</p>
                <button onClick={() => setFilter('all')} className="mt-4 text-xs text-primary-500 hover:underline">
                  Voir toutes les sorties
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {groupedReleases.map(([monthKey, monthReleases]) => {
                  const current = isCurrentMonth(monthKey);
                  const future  = isFutureMonth(monthKey);
                  const label   = formatMonthLabel(monthKey);

                  return (
                    <section key={monthKey}>
                      {/* En-tête de mois */}
                      <div className="flex items-center gap-3 mb-4">
                        <h2 className={`text-sm font-bold uppercase tracking-wider whitespace-nowrap ${
                          current ? 'text-primary-500 dark:text-primary-400'
                          : future ? 'text-orange-500 dark:text-orange-400'
                          : 'text-secondary'
                        }`}>
                          {current && '📍 '}
                          {future  && '⏰ '}
                          {label}
                        </h2>
                        <span className="text-xs text-secondary bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                          {monthReleases.length} sortie{monthReleases.length > 1 ? 's' : ''}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-slate-700 to-transparent" />
                      </div>

                      {/* Cards du mois */}
                      <div className="space-y-3">
                        {monthReleases
                          .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
                          .map((release, i) => (
                            <div
                              key={release.id}
                              className="animate-entrance"
                              style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}
                            >
                              <ReleaseCard
                                release={release}
                                onPlay={isReady ? handlePlay : undefined}
                                isPlaying={isPlaying && currentTrack?.uri === `spotify:track:${release.spotifyId}` || isPlaying && currentTrack?.albumName === release.name}
                              />
                            </div>
                          ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* ══════════ MODAL CALENDRIER ══════════ */}
      {selectedRelease && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelectedRelease(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Panel */}
          <div
            className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 animate-entrance"
            onClick={e => e.stopPropagation()}
          >
            {/* Header modal */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-primary text-base">Détails de la sortie</h3>
              <button
                onClick={() => setSelectedRelease(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 text-secondary hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ReleaseCard
              release={selectedRelease}
              onPlay={isReady ? handlePlay : undefined}
              isPlaying={isPlaying && currentTrack?.albumName === selectedRelease.name}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReleasesPage;
