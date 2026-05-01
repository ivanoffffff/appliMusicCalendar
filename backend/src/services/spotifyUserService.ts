import prisma from '../config/database';
import { spotifyClient } from '../config/httpClient';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpotifyUserToken {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

export interface SpotifyFollowedArtist {
  id: string;
  name: string;
  genres: string[];
  images: Array<{ url: string; height: number; width: number }>;
  popularity: number;
  followers: { total: number };
  external_urls: { spotify: string };
}

interface SpotifyFollowedArtistsResponse {
  artists: {
    items: SpotifyFollowedArtist[];
    next: string | null;
    total: number;
    cursors: { after: string };
    limit: number;
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

class SpotifyUserService {
  private readonly AUTH_URL = 'https://accounts.spotify.com/authorize';
  private readonly TOKEN_URL = 'https://accounts.spotify.com/api/token';
  private readonly API_URL   = 'https://api.spotify.com/v1';
  private readonly SCOPES = [
    'user-follow-read',
    'streaming',
    'user-read-email',
    'user-read-private',
    'user-modify-playback-state',
    'user-read-playback-state',
    'user-library-modify',
    'user-library-read',
    'user-follow-modify',
  ].join(' ');

  // Lus à l'appel (pas à l'instanciation) pour que dotenv soit déjà chargé
  private get CLIENT_ID()     { return process.env.SPOTIFY_CLIENT_ID!; }
  private get CLIENT_SECRET() { return process.env.SPOTIFY_CLIENT_SECRET!; }
  private get REDIRECT_URI()  { return process.env.SPOTIFY_REDIRECT_URI!; }

  // ── Génère l'URL de consentement Spotify ─────────────────────────────────
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id:     this.CLIENT_ID,
      response_type: 'code',
      redirect_uri:  this.REDIRECT_URI,
      scope:         this.SCOPES,
      state,
    });
    return `${this.AUTH_URL}?${params.toString()}`;
  }

  // ── Échange le code d'autorisation contre des tokens ─────────────────────
  async exchangeCode(code: string): Promise<SpotifyUserToken> {
    const credentials = Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString('base64');

    const { data } = await spotifyClient.post<SpotifyUserToken>(
      this.TOKEN_URL,
      new URLSearchParams({
        grant_type:   'authorization_code',
        code,
        redirect_uri: this.REDIRECT_URI,
      }).toString(),
      {
        headers: {
          Authorization:  `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return data;
  }

  // ── Rafraîchit l'access token et met à jour la DB ────────────────────────
  async refreshAccessToken(userId: string): Promise<string> {
    const record = await prisma.spotifyToken.findUnique({ where: { userId } });
    if (!record) throw new Error('Compte Spotify non connecté');

    const credentials = Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString('base64');

    const { data } = await spotifyClient.post<Partial<SpotifyUserToken>>(
      this.TOKEN_URL,
      new URLSearchParams({
        grant_type:    'refresh_token',
        refresh_token: record.refreshToken,
      }).toString(),
      {
        headers: {
          Authorization:  `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    await prisma.spotifyToken.update({
      where: { userId },
      data: {
        accessToken: data.access_token!,
        expiresAt:   new Date(Date.now() + (data.expires_in ?? 3600) * 1000),
        // Spotify renvoie parfois un nouveau refresh_token
        ...(data.refresh_token && { refreshToken: data.refresh_token }),
      },
    });

    return data.access_token!;
  }

  // ── Renvoie un access token valide (rafraîchi si nécessaire) ─────────────
  async getValidAccessToken(userId: string): Promise<string> {
    const record = await prisma.spotifyToken.findUnique({ where: { userId } });
    if (!record) throw new Error('Compte Spotify non connecté');

    // Rafraîchir si le token expire dans moins de 5 min
    const FIVE_MIN = 5 * 60 * 1000;
    if (record.expiresAt.getTime() - Date.now() < FIVE_MIN) {
      return this.refreshAccessToken(userId);
    }
    return record.accessToken;
  }

  // ── Sauvegarde les tokens en base (upsert) ────────────────────────────────
  async saveToken(userId: string, token: SpotifyUserToken): Promise<void> {
    await prisma.spotifyToken.upsert({
      where: { userId },
      update: {
        accessToken:  token.access_token,
        refreshToken: token.refresh_token,
        expiresAt:    new Date(Date.now() + token.expires_in * 1000),
        scope:        token.scope,
      },
      create: {
        userId,
        accessToken:  token.access_token,
        refreshToken: token.refresh_token,
        expiresAt:    new Date(Date.now() + token.expires_in * 1000),
        scope:        token.scope,
      },
    });
  }

  // ── Récupère tous les artistes suivis (pagination automatique) ────────────
  async getFollowedArtists(userId: string): Promise<SpotifyFollowedArtist[]> {
    const accessToken = await this.getValidAccessToken(userId);
    const artists: SpotifyFollowedArtist[] = [];

    const fetchPage = async (url: string): Promise<void> => {
      const result = await spotifyClient.get<SpotifyFollowedArtistsResponse>(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      artists.push(...result.data.artists.items);
      if (result.data.artists.next) {
        await fetchPage(result.data.artists.next);
      }
    };

    await fetchPage(`${this.API_URL}/me/following?type=artist&limit=50`);
    return artists;
  }

  // ── Helpers statut ────────────────────────────────────────────────────────
  async isConnected(userId: string): Promise<boolean> {
    const record = await prisma.spotifyToken.findUnique({
      where: { userId },
      select: { id: true },
    });
    return !!record;
  }

  async disconnect(userId: string): Promise<void> {
    await prisma.spotifyToken.delete({ where: { userId } }).catch(() => {});
  }
}

export default new SpotifyUserService();
