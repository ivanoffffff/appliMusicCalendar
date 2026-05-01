import React, {
  createContext, useContext, useEffect, useState, useCallback, useRef,
} from 'react';
import { spotifyAccountService } from '../services/api';
import { useAuth } from './AuthContext';

// ─── Types SDK Spotify ────────────────────────────────────────────────────────

interface SpotifyImage { url: string; }
interface SpotifyArtistSimple { name: string; }

interface WebPlaybackTrack {
  uri:     string;
  name:    string;
  artists: SpotifyArtistSimple[];
  album:   { name: string; images: SpotifyImage[] };
  duration_ms: number;
}

interface WebPlaybackState {
  paused:       boolean;
  position:     number;
  duration:     number;
  track_window: {
    current_track:   WebPlaybackTrack;
    next_tracks:     WebPlaybackTrack[];
    previous_tracks: WebPlaybackTrack[];
  };
}

declare global {
  interface Window {
    Spotify: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayerInstance;
    };
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

interface SpotifyPlayerInstance {
  connect():    Promise<boolean>;
  disconnect(): void;
  addListener(event: 'ready',                cb: (data: { device_id: string }) => void): void;
  addListener(event: 'not_ready',            cb: (data: { device_id: string }) => void): void;
  addListener(event: 'player_state_changed', cb: (state: WebPlaybackState | null) => void): void;
  addListener(event: 'initialization_error', cb: (e: { message: string }) => void): void;
  addListener(event: 'authentication_error', cb: (e: { message: string }) => void): void;
  addListener(event: 'account_error',        cb: (e: { message: string }) => void): void;
  togglePlay(): Promise<void>;
  previousTrack(): Promise<void>;
  nextTrack():     Promise<void>;
  seek(pos: number): Promise<void>;
  setVolume(vol: number): Promise<void>;
  getCurrentState(): Promise<WebPlaybackState | null>;
}

// ─── Context type ─────────────────────────────────────────────────────────────

export interface PlayerTrack {
  name:       string;
  artist:     string;
  albumName:  string;
  imageUrl:   string;
  uri:        string;
  durationMs: number;
}

interface SpotifyPlayerContextType {
  isReady:        boolean;
  isPlaying:      boolean;
  isPremiumError: boolean;
  currentTrack:   PlayerTrack | null;
  currentAlbumId: string | null;   // spotifyId de l'album en lecture
  positionMs:     number;
  // queue: liste des spotifyAlbumIds dans l'ordre d'affichage
  playAlbum: (spotifyAlbumId: string, queue?: string[], index?: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  nextTrack:  () => Promise<void>;
  prevTrack:  () => Promise<void>;
  seekTo:     (ms: number) => Promise<void>;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const SpotifyPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [isSDKLoaded,      setIsSDKLoaded]      = useState(false);
  const [isReady,          setIsReady]          = useState(false);
  const [isPlaying,        setIsPlaying]        = useState(false);
  const [isPremiumError,   setIsPremiumError]   = useState(false);
  const [currentTrack,     setCurrentTrack]     = useState<PlayerTrack | null>(null);
  const [currentAlbumId,   setCurrentAlbumId]   = useState<string | null>(null);
  const [positionMs,       setPositionMs]       = useState(0);
  const [spotifyConnected, setSpotifyConnected] = useState(false);

  const playerRef           = useRef<SpotifyPlayerInstance | null>(null);
  const deviceIdRef         = useRef<string>('');
  const positionIntervalRef = useRef<number>(0);

  // ── File de lecture (refs pour éviter les closures périmées) ─────────────
  const queueRef      = useRef<string[]>([]);   // spotifyAlbumIds dans l'ordre affiché
  const queueIndexRef = useRef<number>(-1);

  // ── Ref vers startPlayback pour l'utiliser dans les listeners ────────────
  const startPlaybackRef = useRef<((id: string) => Promise<void>) | null>(null);

  // ── Flag auto-play : Spotify peut démarrer en pause la 1ère fois ─────────
  const pendingAutoPlayRef = useRef(false);

  // ── Watchdog fin d'album ──────────────────────────────────────────────────
  // Timer armé sur la dernière piste de chaque album. À l'expiration, on vérifie
  // si le player est en pause → l'album est terminé → on avance dans la file.
  const albumEndTimerRef = useRef<number>(0);

  // ── Vérifier si Spotify est connecté ──────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    spotifyAccountService.getStatus()
      .then(res => setSpotifyConnected(res.connected))
      .catch(() => {});
  }, [isAuthenticated]);

  // ── Charger le SDK via <script> ───────────────────────────────────────────
  useEffect(() => {
    if (!spotifyConnected || isSDKLoaded) return;

    const existing = document.querySelector('script[src="https://sdk.scdn.co/spotify-player.js"]');
    if (existing) { setIsSDKLoaded(true); return; }

    const script = document.createElement('script');
    script.src   = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => setIsSDKLoaded(true);
  }, [spotifyConnected, isSDKLoaded]);

  // ── Initialiser le player quand le SDK est prêt ───────────────────────────
  useEffect(() => {
    if (!isSDKLoaded || playerRef.current) return;

    const player = new window.Spotify.Player({
      name: 'Music Tracker',
      getOAuthToken: (cb) => {
        spotifyAccountService.getToken()
          .then(({ access_token }) => cb(access_token))
          .catch(() => console.error('Impossible de récupérer le token Spotify'));
      },
      volume: 0.7,
    });

    player.addListener('ready', ({ device_id }) => {
      console.log('🎵 Spotify Player prêt, device_id:', device_id);
      deviceIdRef.current = device_id;
      setIsReady(true);
    });

    player.addListener('not_ready', () => setIsReady(false));

    player.addListener('player_state_changed', (state) => {
      if (!state) return;

      // ── Fix auto-play : si Spotify démarre en pause, on force la reprise ──
      if (pendingAutoPlayRef.current) {
        pendingAutoPlayRef.current = false;
        if (state.paused) {
          player.togglePlay();
          return; // attendre le prochain événement d'état
        }
      }

      // ── Watchdog fin d'album : annuler le timer à chaque changement d'état ──
      clearTimeout(albumEndTimerRef.current);

      // ── Si on joue la dernière piste, armer le watchdog ───────────────────
      const isLastTrack = !state.paused && state.track_window.next_tracks.length === 0;
      if (isLastTrack) {
        const remaining = state.duration - state.position;
        // +1 500 ms de marge pour laisser Spotify traiter la fin
        albumEndTimerRef.current = window.setTimeout(async () => {
          const s = await playerRef.current?.getCurrentState();
          // Si paused (ou player disparu), l'album est fini → avancer dans la file
          if (!s || s.paused) {
            const queue = queueRef.current;
            const idx   = queueIndexRef.current;
            if (idx >= 0 && idx < queue.length - 1) {
              const nextIdx = idx + 1;
              queueIndexRef.current = nextIdx;
              startPlaybackRef.current?.(queue[nextIdx]);
            }
          }
        }, remaining + 1500);
      }

      const track = state.track_window.current_track;
      setIsPlaying(!state.paused);
      setPositionMs(state.position);
      setCurrentTrack({
        name:       track.name,
        artist:     track.artists.map(a => a.name).join(', '),
        albumName:  track.album.name,
        imageUrl:   track.album.images[0]?.url ?? '',
        uri:        track.uri,
        durationMs: state.duration,
      });

      // Ticker de position
      clearInterval(positionIntervalRef.current);
      if (!state.paused) {
        let pos = state.position;
        positionIntervalRef.current = window.setInterval(() => {
          pos += 1000;
          setPositionMs(pos);
        }, 1000);
      }
    });

    player.addListener('account_error', () => {
      console.warn('⚠️ Spotify Premium requis pour le lecteur web');
      setIsPremiumError(true);
    });
    player.addListener('authentication_error', ({ message }) =>
      console.error('Spotify auth error:', message));
    player.addListener('initialization_error', ({ message }) =>
      console.error('Spotify init error:', message));

    player.connect().then(ok => {
      if (ok) console.log('✅ Spotify Player connecté');
    });

    playerRef.current = player;

    return () => {
      clearInterval(positionIntervalRef.current);
      clearTimeout(albumEndTimerRef.current);
      player.disconnect();
      playerRef.current = null;
    };
  }, [isSDKLoaded]);

  // ── Appel API Spotify pour lancer la lecture d'un album ───────────────────
  const startPlayback = useCallback(async (spotifyAlbumId: string) => {
    if (!deviceIdRef.current) return;
    const { access_token } = await spotifyAccountService.getToken();

    pendingAutoPlayRef.current = true;

    await fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceIdRef.current}`,
      {
        method:  'PUT',
        headers: {
          Authorization:  `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context_uri: `spotify:album:${spotifyAlbumId}`,
          offset:       { position: 0 },
          position_ms:  0,
        }),
      }
    );

    setCurrentAlbumId(spotifyAlbumId);
  }, []);

  // Garder startPlaybackRef à jour pour les listeners (qui capturent la ref, pas la valeur)
  useEffect(() => {
    startPlaybackRef.current = startPlayback;
  }, [startPlayback]);

  // ── playAlbum : point d'entrée public, accepte une queue optionnelle ──────
  const playAlbum = useCallback(async (
    spotifyAlbumId: string,
    queue?: string[],
    index?: number,
  ) => {
    if (!isReady) return;
    try {
      if (queue) {
        queueRef.current      = queue;
        queueIndexRef.current = index ?? queue.indexOf(spotifyAlbumId);
      }
      await startPlayback(spotifyAlbumId);
    } catch (err) {
      console.error('Erreur lecture album:', err);
    }
  }, [isReady, startPlayback]);

  // ── ⏭ Piste suivante dans l'album (SDK natif) ────────────────────────────
  const nextTrack = useCallback(async () => {
    await playerRef.current?.nextTrack();
  }, []);

  // ── ⏮ Piste précédente dans l'album (SDK natif) ──────────────────────────
  const prevTrack = useCallback(async () => {
    await playerRef.current?.previousTrack();
  }, []);

  const togglePlay = useCallback(async () => {
    await playerRef.current?.togglePlay();
  }, []);

  const seekTo = useCallback(async (ms: number) => {
    await playerRef.current?.seek(ms);
    setPositionMs(ms);
  }, []);

  return (
    <SpotifyPlayerContext.Provider value={{
      isReady, isPlaying, isPremiumError, currentTrack, currentAlbumId, positionMs,
      playAlbum, togglePlay, nextTrack, prevTrack, seekTo,
    }}>
      {children}
    </SpotifyPlayerContext.Provider>
  );
};

export const useSpotifyPlayer = (): SpotifyPlayerContextType => {
  const ctx = useContext(SpotifyPlayerContext);
  if (!ctx) throw new Error('useSpotifyPlayer must be used within SpotifyPlayerProvider');
  return ctx;
};
