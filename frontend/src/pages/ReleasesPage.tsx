import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import type { Release, CalendarEvent } from '../types';
import { releaseService, spotifyAccountService } from '../services/api';
import ReleaseCard from '../components/releases/ReleaseCard';
import Header from '../components/ui/Header';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useSpotifyPlayer } from '../contexts/SpotifyPlayerContext';
import {
  AlertIcon,
  CalendarIcon,
  ClockIcon,
  SparkleIcon,
  ListIcon,
  RefreshIcon,
  PinIcon,
  SearchIcon,
  MicrophoneIcon,
  CheckCircleIcon,
} from '../components/ui/Icons';

// ─── Icône playlist ───────────────────────────────────────────────────────────
const PlaylistAddIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17H5a2 2 0 00-2 2v0a2 2 0 002 2h4m6-4v4m2-2h-4M3 7h18M3 12h12" />
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

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
  const [isAutoSyncing,    setIsAutoSyncing]    = useState(false);
  const [toast,            setToast]            = useState<{ msg: string; ok: boolean } | null>(null);
  const [selectedRelease,  setSelectedRelease]  = useState<Release | null>(null);
  const [view,             setView]             = useState<View>('list');
  const [filter,           setFilter]           = useState<Filter>('all');

  // ── Mode création de playlist ──────────────────────────────────────────
  const [isSelecting,    setIsSelecting]    = useState(false);
  const [selectedIds,    setSelectedIds]    = useState<Set<string>>(new Set());
  const [playlistModal,  setPlaylistModal]  = useState(false);
  const [playlistName,   setPlaylistName]   = useState('');
  const [isCreating,     setIsCreating]     = useState(false);
  const [createdUrl,     setCreatedUrl]     = useState<string | null>(null);
  const [needsReauth,    setNeedsReauth]    = useState(false);

  const { isReady, playAlbum, currentAlbumId, isPlaying, isPremiumError, currentTrack } = useSpotifyPlayer();

  const handlePlay = (spotifyId: string) => {
    if (!isReady) return;
    // File = toutes les sorties affichées qui ont un spotifyId et sont déjà sorties
    const queue = filteredReleases
      .filter(r => r.spotifyId && new Date(r.releaseDate) <= now)
      .map(r => r.spotifyId!);
    const index = queue.indexOf(spotifyId);
    playAlbum(spotifyId, queue, index);
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

  // ── Auto-sync silencieux au chargement si données potentiellement périmées ─
  const SYNC_KEY      = 'releases_last_sync';
  const SYNC_INTERVAL = 60 * 60 * 1000; // 1 heure

  useEffect(() => {
    const last = Number(localStorage.getItem(SYNC_KEY) ?? 0);
    if (Date.now() - last < SYNC_INTERVAL) return; // données fraîches, pas besoin

    setIsAutoSyncing(true);
    releaseService.syncReleases()
      .then(res => { if (res.success) return loadReleases(); })
      .then(() => localStorage.setItem(SYNC_KEY, String(Date.now())))
      .catch(() => {}) // silencieux : l'utilisateur voit quand même les données en cache
      .finally(() => setIsAutoSyncing(false));
  }, [loadReleases]);

  // ── Sync manuel ────────────────────────────────────────────────────────
  const syncReleases = async () => {
    try {
      setIsSyncing(true);
      const res = await releaseService.syncReleases();
      if (res.success) {
        await loadReleases();
        localStorage.setItem(SYNC_KEY, String(Date.now()));
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

  // ── Sélection pour playlist ────────────────────────────────────────────
  const toggleSelect = (spotifyId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(spotifyId) ? next.delete(spotifyId) : next.add(spotifyId);
      return next;
    });
  };

  const exitSelecting = () => {
    setIsSelecting(false);
    setSelectedIds(new Set());
    setPlaylistModal(false);
    setCreatedUrl(null);
    setNeedsReauth(false);
    setPlaylistName('');
  };

  const openPlaylistModal = () => {
    const now = new Date();
    const month = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(now);
    setPlaylistName(`Mes sorties – ${month}`);
    setCreatedUrl(null);
    setNeedsReauth(false);
    setPlaylistModal(true);
  };

  const createPlaylist = async () => {
    if (!playlistName.trim() || selectedIds.size === 0) return;
    setIsCreating(true);
    try {
      const result = await spotifyAccountService.createPlaylist(
        playlistName.trim(),
        Array.from(selectedIds),
      );
      setCreatedUrl(result.playlistUrl);
      showToast(`Playlist créée ! ${result.trackCount} titre${result.trackCount > 1 ? 's' : ''} ajouté${result.trackCount > 1 ? 's' : ''}`, true);
    } catch (err: any) {
      if (err?.response?.data?.message === 'MISSING_PLAYLIST_SCOPE') {
        setNeedsReauth(true);
      } else {
        showToast(err?.response?.data?.message || 'Erreur lors de la création de la playlist', false);
        setPlaylistModal(false);
      }
    } finally {
      setIsCreating(false);
    }
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
      <div className="min-h-screen mesh-bg">
        <Header />
        <div className="flex flex-col items-center justify-center py-20">
          <LoadingSpinner size="xl" type="musical" />
          <p className="text-secondary mt-4 text-sm">Chargement du calendrier…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg">
      <Header />

      {/* ══════════ HERO ══════════ */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary-50/30 to-accent-50/20 dark:via-primary-900/10 dark:to-accent-900/8 pointer-events-none" />
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-10 dark:opacity-12 pointer-events-none animate-orb-float-1"
          style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-8 dark:opacity-10 pointer-events-none animate-orb-float-2"
          style={{ background: 'radial-gradient(circle, #a78bfa 0%, transparent 70%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

          {/* Banner Premium requis */}
          {isPremiumError && (
            <div className="mb-6 flex items-center gap-3 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-700/40 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-2xl text-sm animate-entrance">
              <AlertIcon className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-semibold">Spotify Premium requis</p>
                <p className="text-xs opacity-80 mt-0.5">Le lecteur web Spotify nécessite un abonnement Premium. Tu peux toujours ouvrir les titres directement sur Spotify.</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

            {/* Texte + quick stats */}
            <div className="animate-entrance">
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-widest uppercase text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-500/10 px-3 py-1 rounded-full border border-primary-100 dark:border-primary-500/20">
                  <CalendarIcon className="w-3.5 h-3.5" /> Sorties musicales
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-primary mb-1 leading-tight">
                Mon <span className="gradient-text">Calendrier</span>
              </h1>
              {releases.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className="text-sm text-secondary">
                    <span className="font-semibold text-primary">{releases.length}</span> sortie{releases.length !== 1 ? 's' : ''} au total
                  </span>
                  {upcomingCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-2.5 py-1 rounded-full border border-orange-100 dark:border-orange-800/30">
                      <ClockIcon className="w-3 h-3" /> {upcomingCount} à venir
                    </span>
                  )}
                  {newCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/30">
                      <SparkleIcon className="w-3 h-3" /> {newCount} cette semaine
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
      <div className="sticky top-14 md:top-16 z-40 bg-white/85 dark:bg-[#0a0a1e]/85 backdrop-blur-xl border-b border-gray-100/60 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">

            <div className="flex flex-wrap items-center gap-2">
              {/* Toggle Vue */}
              <div className="flex gap-1 bg-gray-100/80 dark:bg-white/5 p-1 rounded-xl border border-gray-200/50 dark:border-white/5">
                {([
                  { id: 'list',     Icon: ListIcon,     label: 'Liste' },
                  { id: 'calendar', Icon: CalendarIcon, label: 'Calendrier' },
                ] as { id: View; Icon: React.FC<{ className?: string }>; label: string }[]).map(v => (
                  <button
                    key={v.id}
                    onClick={() => setView(v.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                      view === v.id
                        ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    <v.Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{v.label}</span>
                  </button>
                ))}
              </div>

              {/* Filtres (liste uniquement) */}
              {view === 'list' && (
                <div className="flex gap-1 bg-gray-100/80 dark:bg-white/5 p-1 rounded-xl border border-gray-200/50 dark:border-white/5">
                  {([
                    { id: 'all',      label: 'Toutes',   icon: null },
                    { id: 'upcoming', label: 'À venir',  icon: <ClockIcon className="w-3 h-3" /> },
                    { id: 'past',     label: 'Passées',  icon: <CheckCircleIcon className="w-3 h-3" /> },
                  ] as { id: Filter; label: string; icon: React.ReactNode }[]).map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        filter === f.id
                          ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                          : 'text-secondary hover:text-primary'
                      }`}
                    >
                      {f.icon}
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Bouton Créer une playlist */}
              {view === 'list' && releases.length > 0 && !isSelecting && (
                <button
                  onClick={() => setIsSelecting(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 hover:opacity-90 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <PlaylistAddIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Créer une playlist</span>
                </button>
              )}

              {/* Bouton Sync */}
              <div className="relative">
                <button
                  onClick={syncReleases}
                  disabled={isSyncing || isAutoSyncing}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-spotify-500 to-spotify-600 hover:from-spotify-600 hover:to-spotify-700 text-white text-xs font-semibold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <RefreshIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{isSyncing ? 'Sync…' : 'Synchroniser'}</span>
                </button>
                {isAutoSyncing && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm" />
                )}
              </div>
            </div>
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
            {toast.ok
              ? <CheckCircleIcon className="w-4 h-4 shrink-0" />
              : <AlertIcon className="w-4 h-4 shrink-0" />
            }
            {toast.msg}
          </div>
        </div>
      )}

      {/* ══════════ CONTENU PRINCIPAL ══════════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-10">

        {/* ── Empty state ── */}
        {releases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center mb-6 shadow-card">
              <CalendarIcon className="w-12 h-12 text-primary-500" />
            </div>
            <h2 className="text-xl font-bold text-primary mb-2">Aucune sortie trouvée</h2>
            <p className="text-secondary text-sm text-center max-w-xs mb-8">
              Ajoutez des artistes à vos favoris puis synchronisez pour voir leurs sorties apparaître ici.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/artists')} className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2">
                <MicrophoneIcon className="w-4 h-4" /> Ajouter des artistes
              </button>
              <button onClick={syncReleases} disabled={isSyncing} className="btn-secondary px-6 py-2.5 text-sm disabled:opacity-50 flex items-center gap-2">
                <RefreshIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> {isSyncing ? 'Sync…' : 'Synchroniser'}
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
                <div className="flex justify-center mb-3">
                  <SearchIcon className="w-10 h-10 text-secondary" />
                </div>
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
                        <h2 className={`flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider whitespace-nowrap ${
                          current ? 'text-primary-500 dark:text-primary-400'
                          : future ? 'text-orange-500 dark:text-orange-400'
                          : 'text-secondary'
                        }`}>
                          {current && <PinIcon className="w-3.5 h-3.5" />}
                          {future  && <ClockIcon className="w-3.5 h-3.5" />}
                          {label}
                        </h2>
                        <span className="text-xs text-secondary bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                          {monthReleases.length} sortie{monthReleases.length > 1 ? 's' : ''}
                        </span>
                        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-slate-700 to-transparent" />
                      </div>

                      {/* Cards du mois */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                                onPlay={isSelecting || !isReady ? undefined : handlePlay}
                                isPlaying={!isSelecting && isPlaying && currentAlbumId === release.spotifyId}
                                selected={release.spotifyId ? selectedIds.has(release.spotifyId) : false}
                                onSelect={isSelecting && release.spotifyId ? () => toggleSelect(release.spotifyId!) : undefined}
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

      {/* ══════════ BARRE FLOTTANTE SÉLECTION ══════════ */}
      {isSelecting && (
        <div className={`fixed left-0 right-0 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-auto z-50 animate-entrance transition-all duration-300
          ${currentTrack ? 'bottom-[140px]' : 'bottom-[80px]'}
          md:bottom-6`}>
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-5 md:rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border-t md:border border-gray-100 dark:border-white/10 backdrop-blur-xl">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Playlist</span>
              <span className="text-sm font-bold text-primary">
                {selectedIds.size === 0
                  ? 'Sélectionnez des sorties'
                  : `${selectedIds.size} sortie${selectedIds.size > 1 ? 's' : ''} choisie${selectedIds.size > 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={exitSelecting}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl btn-secondary text-xs font-semibold cursor-pointer"
              >
                <XIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Annuler</span>
              </button>
              <button
                onClick={openPlaylistModal}
                disabled={selectedIds.size === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity cursor-pointer"
              >
                <PlaylistAddIcon className="w-4 h-4" />
                <span>Créer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ MODAL PLAYLIST ══════════ */}
      {playlistModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => !isCreating && setPlaylistModal(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 animate-entrance"
            onClick={e => e.stopPropagation()}
          >
            {createdUrl ? (
              /* ── Succès ── */
              <>
                <div className="flex flex-col items-center text-center gap-3 py-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg">
                    <CheckCircleIcon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-black text-lg text-primary">Playlist créée !</h3>
                  <p className="text-sm text-secondary">Ta playlist <span className="font-semibold text-primary">"{playlistName}"</span> est maintenant disponible sur Spotify.</p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={exitSelecting} className="flex-1 btn-secondary py-2.5 text-sm font-semibold rounded-xl cursor-pointer">Fermer</button>
                  <a
                    href={createdUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1db954] hover:bg-[#17a349] text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                    Ouvrir sur Spotify
                  </a>
                </div>
              </>
            ) : needsReauth ? (
              /* ── Scopes manquants ── */
              <>
                <h3 className="font-black text-lg text-primary mb-2">Permissions requises</h3>
                <p className="text-sm text-secondary mb-5">
                  Pour créer des playlists, tu dois reconnecter ton compte Spotify avec les nouvelles permissions.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setPlaylistModal(false)} className="flex-1 btn-secondary py-2.5 text-sm font-semibold rounded-xl cursor-pointer">Annuler</button>
                  <button
                    onClick={async () => {
                      const { url } = await spotifyAccountService.getAuthUrl();
                      window.location.href = url;
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1db954] hover:bg-[#17a349] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Reconnecter Spotify
                  </button>
                </div>
              </>
            ) : (
              /* ── Formulaire ── */
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-black text-lg text-primary">Nouvelle playlist</h3>
                  <button onClick={() => setPlaylistModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-slate-700 text-secondary hover:text-primary transition-colors cursor-pointer">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm text-secondary mb-4">
                  <span className="font-semibold text-primary">{selectedIds.size} sortie{selectedIds.size > 1 ? 's' : ''}</span> sélectionnée{selectedIds.size > 1 ? 's' : ''} · Toutes les pistes seront ajoutées.
                </p>

                <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1.5">
                  Nom de la playlist
                </label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={e => setPlaylistName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createPlaylist()}
                  placeholder="Ma playlist..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 transition mb-5"
                  autoFocus
                />

                <div className="flex gap-3">
                  <button onClick={() => setPlaylistModal(false)} className="flex-1 btn-secondary py-2.5 text-sm font-semibold rounded-xl cursor-pointer">Annuler</button>
                  <button
                    onClick={createPlaylist}
                    disabled={isCreating || !playlistName.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition cursor-pointer"
                  >
                    {isCreating ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeOpacity=".25" strokeWidth={2}/><path d="M12 2a10 10 0 0 1 10 10" strokeWidth={2}/></svg>
                        Création…
                      </>
                    ) : (
                      <>
                        <PlaylistAddIcon className="w-4 h-4" />
                        Créer
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
              isPlaying={isPlaying && currentAlbumId === selectedRelease.spotifyId}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReleasesPage;
