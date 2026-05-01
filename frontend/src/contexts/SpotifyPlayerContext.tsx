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

export interface QueueTrack {
  uri:     string;
  albumId: string; // spotifyId de la sortie à laquelle appartient ce titre
}

interface SpotifyPlayerContextType {
  isReady:        boolean;
  isPlaying:      boolean;
  isPremiumError: boolean;
  currentTrack:   PlayerTrack | null;
  currentAlbumId: string | null;
  positionMs:     number;
  playQueue:  (tracks: QueueTrack[], startUri: string) => Promise<void>;
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

  // Maps track URI → spotifyId de la sortie, pour mettre à jour currentAlbumId
  const trackToAlbumRef = useRef<Map<string, string>>(new Map());

  // Flag auto-play : Spotify peut démarrer en pause la 1ère fois
  const pendingAutoPlayRef = useRef(false);

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

      // Fix auto-play : si Spotify démarre en pause, on force la reprise
      if (pendingAutoPlayRef.current) {
        pendingAutoPlayRef.current = false;
        if (state.paused) {
          player.togglePlay();
          return;
        }
      }

      const track = state.track_window.current_track;

      // Mettre à jour la sortie en cours depuis la map trackUri → albumId
      const albumId = trackToAlbumRef.current.get(track.uri) ?? null;
      setCurrentAlbumId(albumId);

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
      player.disconnect();
      playerRef.current = null;
    };
  }, [isSDKLoaded]);

  // ── Lance la lecture avec une liste plate de track URIs ───────────────────
  const startPlayback = useCallback(async (uris: string[], startUri: string) => {
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
          uris,
          offset:      { uri: startUri },
          position_ms: 0,
        }),
      }
    );
  }, []);

  // ── playQueue : point d'entrée public ────────────────────────────────────
  // tracks = liste plate de tous les titres (toutes sorties confondues, dans
  // l'ordre d'affichage). startUri = URI du premier titre à jouer.
  const playQueue = useCallback(async (tracks: QueueTrack[], startUri: string) => {
    if (!isReady) return;
    try {
      // Construire la map trackUri → albumId avant de lancer la lecture
      const map = new Map<string, string>();
      tracks.forEach(t => map.set(t.uri, t.albumId));
      trackToAlbumRef.current = map;

      await startPlayback(tracks.map(t => t.uri), startUri);
    } catch (err) {
      console.error('Erreur lecture queue:', err);
    }
  }, [isReady, startPlayback]);

  // nextTrack / prevTrack naviguent nativement dans le tableau uris passé
  // à Spotify — donc titre par titre à travers toutes les sorties.
  const nextTrack = useCallback(async () => {
    await playerRef.current?.nextTrack();
  }, []);

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
      playQueue, togglePlay, nextTrack, prevTrack, seekTo,
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
