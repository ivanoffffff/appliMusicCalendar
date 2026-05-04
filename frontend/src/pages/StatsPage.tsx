import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { statsService } from '../services/api';
import { ChartBarIcon, MicrophoneIcon, MusicNoteIcon } from '../components/ui/Icons';

// ─── Types ────────────────────────────────────────────────────────────────────
type TimeRange = 'short_term' | 'medium_term' | 'long_term';

interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string }>;
  followers: { total: number };
  product: string;
  external_urls: { spotify: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  short_term:  '4 semaines',
  medium_term: '6 mois',
  long_term:   'Tout le temps',
};

const RANGE_OPTIONS: TimeRange[] = ['short_term', 'medium_term', 'long_term'];

const HOUR_LABELS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? '0h' : i === 12 ? '12h' : i % 6 === 0 ? `${i}h` : '',
);

const GRADIENT_COLORS = [
  '#6366f1', '#7c3aed', '#8b5cf6', '#a78bfa',
  '#06b6d4', '#0891b2', '#0e7490', '#155e75',
  '#10b981', '#059669', '#047857', '#065f46',
  '#f59e0b', '#d97706', '#b45309', '#92400e',
  '#ef4444', '#dc2626', '#b91c1c', '#991b1b',
];

function aggregateGenres(artists: any[]): Array<{ genre: string; count: number }> {
  const map = new Map<string, number>();
  for (const artist of artists) {
    for (const genre of (artist.genres ?? [])) {
      map.set(genre, (map.get(genre) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);
}

function aggregateByHour(items: any[]): Array<{ hour: number; label: string; count: number }> {
  const counts = new Array(24).fill(0);
  for (const item of items) {
    const played = item.played_at;
    if (played) {
      const h = new Date(played).getHours();
      counts[h]++;
    }
  }
  return counts.map((count, hour) => ({
    hour,
    label: HOUR_LABELS[hour] || '',
    count,
  }));
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-xl bg-gray-100 dark:bg-white/5 ${className}`} />
);

// ─── Profile card skeleton ────────────────────────────────────────────────────
const ProfileSkeleton = () => (
  <div className="flex items-center gap-4 p-5 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/8 rounded-2xl">
    <Skeleton className="w-16 h-16 rounded-full shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-36" />
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-3 w-20" />
    </div>
  </div>
);

// ─── Track/artist row skeleton ────────────────────────────────────────────────
const RowSkeleton = () => (
  <div className="flex items-center gap-3 p-3 rounded-xl">
    <Skeleton className="w-4 h-4 shrink-0" />
    <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
    <div className="flex-1 space-y-1.5">
      <Skeleton className="h-3.5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-3 w-10 shrink-0" />
  </div>
);

// ─── Custom chart tooltip (genres) ───────────────────────────────────────────
const ChartTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 rounded-xl px-3 py-2 shadow-lg text-xs font-semibold text-primary">
      {label && <p className="text-secondary mb-0.5">{label}</p>}
      <p>{payload[0].value}</p>
    </div>
  );
};

// ─── Tooltip dédié au graphique horaire ───────────────────────────────────────
const HourTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { hour, isPeak } = payload[0].payload as { hour: number; isPeak: boolean };
  const count = payload[0].value as number;

  const nextHour = (hour + 1) % 24;

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-white/10 rounded-xl px-3.5 py-2.5 shadow-lg text-xs pointer-events-none">
      <p className="font-semibold text-primary mb-1">{hour}h &ndash; {nextHour}h</p>
      {count > 0 ? (
        <>
          <p className="text-secondary">
            <span className="font-black text-indigo-500">{count}</span>
            {' '}écoute{count > 1 ? 's' : ''}
          </p>
          {isPeak && (
            <p className="text-[10px] font-semibold text-indigo-400 mt-1">★ Pic d'écoute</p>
          )}
        </>
      ) : (
        <p className="text-secondary">Aucune écoute</p>
      )}
    </div>
  );
};

// ─── Period toggle ────────────────────────────────────────────────────────────
const PeriodToggle: React.FC<{
  value: TimeRange;
  onChange: (v: TimeRange) => void;
}> = ({ value, onChange }) => (
  <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
    {RANGE_OPTIONS.map(r => (
      <button
        key={r}
        onClick={() => onChange(r)}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
          value === r
            ? 'bg-white dark:bg-white/10 text-primary shadow-sm'
            : 'text-secondary hover:text-primary'
        }`}
      >
        {TIME_RANGE_LABELS[r]}
      </button>
    ))}
  </div>
);

// ─── Section card ─────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-white/5 border border-gray-100 dark:border-white/8 rounded-2xl p-5 dark:backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const StatsPage: React.FC = () => {
  const navigate = useNavigate();

  const [profile,       setProfile]       = useState<SpotifyProfile | null>(null);
  const [topTracks,     setTopTracks]     = useState<any[]>([]);
  const [topArtists,    setTopArtists]    = useState<any[]>([]);
  const [recentItems,   setRecentItems]   = useState<any[]>([]);
  const [timeRange,     setTimeRange]     = useState<TimeRange>('medium_term');
  const [loadingTop,    setLoadingTop]    = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [notConnected,  setNotConnected]  = useState(false);
  const [freeAccount,   setFreeAccount]   = useState(false);

  // Load profile once
  useEffect(() => {
    (async () => {
      setLoadingProfile(true);
      try {
        const p = await statsService.getProfile();
        setProfile(p);
        if (p.product === 'free' || p.product === 'open') setFreeAccount(false); // free can still use top API
      } catch (err: any) {
        if (err?.response?.status === 400) setNotConnected(true);
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  // Load top items when timeRange changes
  const loadTop = useCallback(async (range: TimeRange) => {
    setLoadingTop(true);
    try {
      const [tracks, artists] = await Promise.all([
        statsService.getTopTracks(range, 20),
        statsService.getTopArtists(range, 20),
      ]);
      setTopTracks(tracks);
      setTopArtists(artists);
    } catch (err: any) {
      if (err?.response?.status === 403) setFreeAccount(true);
    } finally {
      setLoadingTop(false);
    }
  }, []);

  useEffect(() => { if (!notConnected) loadTop(timeRange); }, [timeRange, notConnected, loadTop]);

  // Load recently played once
  useEffect(() => {
    if (notConnected) return;
    (async () => {
      setLoadingRecent(true);
      try {
        const items = await statsService.getRecentlyPlayed(50);
        setRecentItems(items);
      } catch {}
      finally { setLoadingRecent(false); }
    })();
  }, [notConnected]);

  const genres   = aggregateGenres(topArtists);
  const hourDataRaw = aggregateByHour(recentItems);
  const peakHour    = hourDataRaw.reduce((max, d) => d.count > max.count ? d : max, { hour: 0, label: '0h', count: 0 });
  const hourData    = hourDataRaw.map(d => ({ ...d, isPeak: d.count === peakHour.count && d.count > 0 }));

  // ── Not connected state ───────────────────────────────────────────────────
  if (notConnected) {
    return (
      <div className="min-h-screen mesh-bg flex flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-500/10 flex items-center justify-center">
          <ChartBarIcon className="w-8 h-8 text-primary-500" />
        </div>
        <h1 className="text-2xl font-black text-primary">Compte Spotify requis</h1>
        <p className="text-secondary max-w-sm">
          Connecte ton compte Spotify pour accéder à tes statistiques musicales.
        </p>
        <button
          onClick={() => navigate('/settings/notifications')}
          className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
        >
          Connecter Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-28 space-y-5">

        {/* ── En-tête ── */}
        <div>
          <h1 className="text-2xl font-black text-primary flex items-center gap-2 mb-1">
            <ChartBarIcon className="w-6 h-6 text-primary-500 shrink-0" />
            Statistiques
          </h1>
          <p className="text-secondary text-sm">Tes habitudes musicales sur Spotify</p>
        </div>

        {/* ── Profil Spotify ── */}
        {loadingProfile ? <ProfileSkeleton /> : profile && (
          <Card className="flex items-center gap-4">
            {profile.images?.[0]?.url ? (
              <img
                src={profile.images[0].url}
                alt={profile.display_name}
                className="w-16 h-16 rounded-full object-cover shrink-0 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-2xl font-black shrink-0">
                {profile.display_name?.[0]?.toUpperCase() ?? 'S'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <a
                href={profile.external_urls?.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="font-black text-lg text-primary hover:text-primary-500 transition-colors truncate block"
              >
                {profile.display_name}
              </a>
              <p className="text-xs text-secondary truncate">{profile.email}</p>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="text-xs font-semibold text-secondary">
                  {profile.followers?.total?.toLocaleString('fr-FR')} abonnés
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black ${
                  profile.product === 'premium'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-gray-100 dark:bg-white/5 text-secondary'
                }`}>
                  {profile.product === 'premium' ? '✦ Premium' : 'Free'}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* ── Sélecteur de période ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm font-bold text-primary">Période</p>
          <PeriodToggle value={timeRange} onChange={setTimeRange} />
        </div>

        {/* ── Top Tracks ── */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MusicNoteIcon className="w-4 h-4 text-emerald-500 shrink-0" />
            <h2 className="text-sm font-bold text-primary">Top Titres</h2>
          </div>
          <div className="space-y-1">
            {loadingTop
              ? Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
              : topTracks.length === 0
                ? <p className="text-sm text-secondary text-center py-4">Aucune donnée pour cette période</p>
                : topTracks.slice(0, 10).map((track, i) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <span className="text-xs font-black text-secondary w-4 text-center shrink-0">{i + 1}</span>
                    <a
                      href={track.external_urls?.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                      onClick={e => e.stopPropagation()}
                    >
                      {track.album?.images?.[0]?.url ? (
                        <img
                          src={track.album.images[0].url}
                          alt={track.name}
                          className="w-10 h-10 rounded-lg object-cover shadow-sm hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600" />
                      )}
                    </a>
                    <div className="flex-1 min-w-0">
                      <a
                        href={track.external_urls?.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary truncate hover:text-primary-500 transition-colors block"
                      >
                        {track.name}
                      </a>
                      <p className="text-xs text-secondary truncate">
                        {track.artists?.map((a: any, idx: number) => (
                          <React.Fragment key={a.id}>
                            {idx > 0 && ', '}
                            <button
                              onClick={() => navigate(`/artists/${a.id}`)}
                              className="hover:text-primary-500 hover:underline transition-colors cursor-pointer"
                            >
                              {a.name}
                            </button>
                          </React.Fragment>
                        ))}
                      </p>
                    </div>
                    <span className="text-[10px] text-secondary shrink-0 font-mono">
                      {track.duration_ms ? `${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}` : ''}
                    </span>
                  </div>
                ))
            }
          </div>
        </Card>

        {/* ── Top Artistes ── */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MicrophoneIcon className="w-4 h-4 text-violet-500 shrink-0" />
            <h2 className="text-sm font-bold text-primary">Top Artistes</h2>
          </div>
          <div className="space-y-1">
            {loadingTop
              ? Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
              : topArtists.length === 0
                ? <p className="text-sm text-secondary text-center py-4">Aucune donnée pour cette période</p>
                : topArtists.slice(0, 10).map((artist, i) => (
                  <button
                    key={artist.id}
                    onClick={() => navigate(`/artists/${artist.id}`)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group cursor-pointer text-left"
                  >
                    <span className="text-xs font-black text-secondary w-4 text-center shrink-0">{i + 1}</span>
                    {artist.images?.[0]?.url ? (
                      <img
                        src={artist.images[0].url}
                        alt={artist.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary truncate group-hover:text-primary-500 transition-colors">{artist.name}</p>
                      <p className="text-xs text-secondary truncate">{artist.genres?.slice(0, 2).join(', ')}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-secondary font-mono">{artist.popularity}<span className="text-[9px]">%</span></div>
                    </div>
                  </button>
                ))
            }
          </div>
        </Card>

        {/* ── Top Genres ── */}
        {!loadingTop && genres.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <ChartBarIcon className="w-4 h-4 text-blue-500 shrink-0" />
              <h2 className="text-sm font-bold text-primary">Top Genres</h2>
            </div>
            <ResponsiveContainer width="100%" height={genres.length * 36 + 8}>
              <BarChart
                data={genres}
                layout="vertical"
                margin={{ top: 0, right: 12, left: 4, bottom: 0 }}
                barSize={14}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="genre"
                  width={110}
                  tick={{ fontSize: 11, fontWeight: 600, fill: 'currentColor' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'transparent' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {genres.map((_, index) => (
                    <Cell key={index} fill={GRADIENT_COLORS[index % GRADIENT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
        {loadingTop && (
          <Card>
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="w-full h-48" />
          </Card>
        )}

        {/* ── Activité horaire ── */}
        {!loadingRecent && recentItems.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-primary">Activité par heure</h2>
                <p className="text-xs text-secondary mt-0.5">Basé sur tes 50 dernières écoutes</p>
              </div>
              {peakHour.count > 0 && (
                <div className="text-right">
                  <p className="text-xs text-secondary">Pic d'écoute</p>
                  <p className="text-sm font-black gradient-text">{peakHour.hour}h–{peakHour.hour + 1}h</p>
                </div>
              )}
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={hourData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={8}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: 'currentColor' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip content={<HourTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {hourData.map((d, i) => (
                    <Cell key={i} fill={d.count === peakHour.count && d.count > 0 ? '#6366f1' : '#8b5cf650'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
        {loadingRecent && (
          <Card>
            <Skeleton className="h-4 w-40 mb-4" />
            <Skeleton className="w-full h-28" />
          </Card>
        )}

      </div>
    </div>
  );
};

export default StatsPage;
