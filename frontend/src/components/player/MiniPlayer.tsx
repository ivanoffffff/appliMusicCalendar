import React, { useState, useEffect } from 'react';
import { useSpotifyPlayer } from '../../contexts/SpotifyPlayerContext';
import { spotifyAccountService } from '../../services/api';
import { HeartIcon } from '../ui/Icons';

// ─── Icônes ──────────────────────────────────────────────────────────────────

const PlayIcon  = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
);
const PauseIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);
const PrevIcon  = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
  </svg>
);
const NextIcon  = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z"/>
  </svg>
);
const SpotifyIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

// Extrait l'ID depuis un URI "spotify:track:XXXXX" (pour l'endpoint contains)
const trackIdFromUri = (uri: string) => uri.split(':')[2] ?? '';

// ─── Composant ────────────────────────────────────────────────────────────────

const MiniPlayer: React.FC = () => {
  const { currentTrack, isPlaying, positionMs, togglePlay, nextTrack, prevTrack, seekTo } = useSpotifyPlayer();

  const [isSaved,  setIsSaved]  = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Vérifie si le titre est dans la bibliothèque Spotify dès qu'il change
  useEffect(() => {
    if (!currentTrack) return;
    const trackId = trackIdFromUri(currentTrack.uri);
    if (!trackId) return;

    let cancelled = false;
    spotifyAccountService.getToken()
      .then(({ access_token }) =>
        fetch(`https://api.spotify.com/v1/me/tracks/contains?ids=${trackId}`, {
          headers: { Authorization: `Bearer ${access_token}` },
        })
      )
      .then(r => r.json())
      .then((data: boolean[]) => {
        if (!cancelled) setIsSaved(data[0] ?? false);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [currentTrack?.uri]);

  const toggleSave = async () => {
    if (!currentTrack || isSaving) return;

    setIsSaving(true);
    try {
      const { access_token } = await spotifyAccountService.getToken();
      // PUT /me/library accepte directement l'URI Spotify
      await fetch(
        `https://api.spotify.com/v1/me/library?uris=${encodeURIComponent(currentTrack.uri)}`,
        {
          method:  isSaved ? 'DELETE' : 'PUT',
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      setIsSaved(prev => !prev);
    } catch {
      // silencieux
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentTrack) return null;

  const progress = currentTrack.durationMs > 0
    ? (positionMs / currentTrack.durationMs) * 100
    : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect  = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    seekTo(Math.floor(ratio * currentTrack.durationMs));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      {/* Barre de progression */}
      <div
        className="h-1 bg-gray-200 dark:bg-slate-700 cursor-pointer group"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-[#1db954] relative transition-all duration-300"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#1db954] scale-0 group-hover:scale-100 transition-transform duration-150 shadow-md" />
        </div>
      </div>

      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-100 dark:border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">

          {/* ── Pochette + info piste ── */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative shrink-0">
              <img
                src={currentTrack.imageUrl}
                alt={currentTrack.albumName}
                className={`w-10 h-10 rounded-lg object-cover shadow-md ${isPlaying ? 'animate-spin-slow' : ''}`}
                style={{ animationDuration: '8s' }}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#1db954] rounded-full flex items-center justify-center">
                <SpotifyIcon />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary truncate">{currentTrack.name}</p>
              <p className="text-xs text-secondary truncate">{currentTrack.artist}</p>
            </div>
          </div>

          {/* ── Contrôles ── */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Bouton favori Spotify */}
            <button
              onClick={toggleSave}
              disabled={isSaving}
              title={isSaved ? 'Retirer des favoris Spotify' : 'Ajouter aux favoris Spotify'}
              className={`p-2 rounded-xl transition-all duration-200 disabled:opacity-50 ${
                isSaved
                  ? 'text-[#1db954] hover:bg-green-50 dark:hover:bg-green-900/20'
                  : 'text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <HeartIcon className="w-4 h-4" filled={isSaved} />
            </button>

            <button
              onClick={prevTrack}
              className="p-2 text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
            >
              <PrevIcon />
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 bg-[#1db954] hover:bg-[#17a349] text-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-all duration-200"
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>

            <button
              onClick={nextTrack}
              className="p-2 text-secondary hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
            >
              <NextIcon />
            </button>
          </div>

          {/* ── Durée ── */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-secondary shrink-0 tabular-nums">
            <span>{fmt(positionMs)}</span>
            <span>/</span>
            <span>{fmt(currentTrack.durationMs)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
