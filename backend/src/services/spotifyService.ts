import axios from 'axios';
import { SpotifySearchResponse, SpotifyTokenResponse, NormalizedArtist, SpotifyArtist } from '../types/spotify';

class SpotifyService {
  private readonly CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
  private readonly CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
  private readonly AUTH_URL = 'https://accounts.spotify.com/api/token';
  private readonly API_URL = 'https://api.spotify.com/v1';
  
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  private async getAccessToken(): Promise<string> {
    // Si on a déjà un token valide, on l'utilise
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString('base64');
      
      const response = await axios.post<SpotifyTokenResponse>(
        this.AUTH_URL,
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      // Token expire dans expires_in secondes, on retire 5 minutes de sécurité
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 300) * 1000);
      
      console.log('✅ Spotify access token obtained successfully');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Failed to get Spotify access token:', error);
      throw new Error('Impossible de se connecter à Spotify');
    }
  }

  async searchArtists(query: string, limit: number = 20): Promise<NormalizedArtist[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get<SpotifySearchResponse>(
        `${this.API_URL}/search`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          params: {
            q: query,
            type: 'artist',
            limit: Math.min(limit, 50), // Spotify limite à 50
          },
        }
      );

      return response.data.artists.items.map(this.normalizeArtist);
    } catch (error) {
      console.error('❌ Spotify search error:', error);
      throw new Error('Erreur lors de la recherche d\'artistes');
    }
  }

  async getArtistById(spotifyId: string): Promise<NormalizedArtist | null> {
    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get<SpotifyArtist>(
        `${this.API_URL}/artists/${spotifyId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      return this.normalizeArtist(response.data);
    } catch (error) {
      console.error('❌ Error fetching artist by ID:', error);
      return null;
    }
  }

  private normalizeArtist(spotifyArtist: SpotifyArtist): NormalizedArtist {
    return {
      spotifyId: spotifyArtist.id,
      name: spotifyArtist.name,
      genres: spotifyArtist.genres,
      imageUrl: spotifyArtist.images?.[0]?.url,
      popularity: spotifyArtist.popularity,
      followers: spotifyArtist.followers.total,
      spotifyUrl: spotifyArtist.external_urls.spotify,
    };
  }

  // Test de connexion
  async testConnection(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new SpotifyService();
