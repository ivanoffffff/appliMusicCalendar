import crypto from 'crypto';
import axios from 'axios';
import prisma from '../config/database';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string }>;
}

interface SpotifyFollowedArtists {
  artists: {
    items: Array<{
      id: string;
      name: string;
      genres: string[];
      images: Array<{ url: string }>;
      followers: { total: number };
      popularity: number;
      external_urls: { spotify: string };
    }>;
    total: number;
    cursors: {
      after?: string;
    };
  };
}

class SpotifyOAuthService {
  private readonly CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
  private readonly CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
  private readonly REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/auth/spotify/callback';
  private readonly SCOPES = [
    'user-follow-read',
    'user-library-read',
    'user-read-email',
    'user-read-private'
  ].join(' ');

  generateAuthUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.CLIENT_ID,
      scope: this.SCOPES,
      redirect_uri: this.REDIRECT_URI,
      state,
      show_dialog: 'true',
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<SpotifyTokenResponse> {
    try {
      const response = await axios.post<SpotifyTokenResponse>(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.REDIRECT_URI,
        }),
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange authorization code');
    }
  }

  async saveUserTokens(userId: string, tokens: SpotifyTokenResponse): Promise<void> {
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    await prisma.spotifyToken.upsert({
      where: { userId },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        scope: tokens.scope,
      },
      create: {
        userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        scope: tokens.scope,
      },
    });
  }

  async refreshAccessToken(userId: string): Promise<string> {
    const tokenRecord = await prisma.spotifyToken.findUnique({
      where: { userId },
    });

    if (!tokenRecord) {
      throw new Error('No Spotify token found for user');
    }

    // Si le token n'est pas encore expiré, le retourner
    if (tokenRecord.expiresAt > new Date()) {
      return tokenRecord.accessToken;
    }

    try {
      const response = await axios.post<{
        access_token: string;
        expires_in: number;
        refresh_token?: string;
      }>(
        'https://accounts.spotify.com/api/token',
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokenRecord.refreshToken,
        }),
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const newExpiresAt = new Date(Date.now() + response.data.expires_in * 1000);

      await prisma.spotifyToken.update({
        where: { userId },
        data: {
          accessToken: response.data.access_token,
          refreshToken: response.data.refresh_token || tokenRecord.refreshToken,
          expiresAt: newExpiresAt,
        },
      });

      return response.data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh Spotify token');
    }
  }

  async getFollowedArtists(userId: string): Promise<SpotifyFollowedArtists['artists']['items']> {
    try {
      const accessToken = await this.refreshAccessToken(userId);
      const allArtists: SpotifyFollowedArtists['artists']['items'] = [];
      let after: string | undefined;

      do {
        const params = new URLSearchParams({
          type: 'artist',
          limit: '50',
        });
        
        if (after) {
          params.append('after', after);
        }

        const response = await axios.get<SpotifyFollowedArtists>(
          `https://api.spotify.com/v1/me/following?${params.toString()}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        allArtists.push(...response.data.artists.items);
        after = response.data.artists.cursors.after;
      } while (after);

      return allArtists;
    } catch (error) {
      console.error('Error fetching followed artists:', error);
      throw new Error('Failed to fetch followed artists from Spotify');
    }
  }

  async syncUserFavorites(userId: string): Promise<{ imported: number; existing: number }> {
    try {
      const spotifyArtists = await this.getFollowedArtists(userId);
      let imported = 0;
      let existing = 0;

      for (const spotifyArtist of spotifyArtists) {
        // Créer ou récupérer l'artiste en base
        let artist = await prisma.artist.findUnique({
          where: { spotifyId: spotifyArtist.id },
        });

        if (!artist) {
          artist = await prisma.artist.create({
            data: {
              spotifyId: spotifyArtist.id,
              name: spotifyArtist.name,
              genres: JSON.stringify(spotifyArtist.genres),
              imageUrl: spotifyArtist.images[0]?.url,
            },
          });
        }

        // Vérifier si déjà en favoris
        const existingFavorite = await prisma.userFavorite.findUnique({
          where: {
            userId_artistId: {
              userId,
              artistId: artist.id,
            },
          },
        });

        if (!existingFavorite) {
          await prisma.userFavorite.create({
            data: {
              userId,
              artistId: artist.id,
              category: 'spotify-import',
            },
          });
          imported++;
        } else {
          existing++;
        }
      }

      return { imported, existing };
    } catch (error) {
      console.error('Error syncing favorites:', error);
      throw new Error('Failed to sync Spotify favorites');
    }
  }

  generateRandomState(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

export default new SpotifyOAuthService();
