import axios from 'axios';

// Types pour les réponses de l'API Deezer
interface DeezerArtist {
  id: number;
  name: string;
  link: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  nb_album: number;
  nb_fan: number;
  tracklist: string;
  type: string;
}

interface DeezerSearchArtistResponse {
  data: DeezerArtist[];
  total: number;
}

interface DeezerAlbum {
  id: number;
  title: string;
  link: string;
  cover: string;
  cover_small: string;
  cover_medium: string;
  cover_big: string;
  cover_xl: string;
  genre_id: number;
  fans: number;
  release_date: string;
  record_type: 'album' | 'single' | 'ep';
  tracklist: string;
  explicit_lyrics: boolean;
  type: string;
  nb_tracks?: number;
}

interface DeezerArtistAlbumsResponse {
  data: DeezerAlbum[];
  total: number;
}

export interface NormalizedDeezerArtist {
  deezerId: string;
  name: string;
  imageUrl?: string;
  fans: number;
  deezerUrl: string;
  albumCount: number;
}

export interface NormalizedDeezerAlbum {
  deezerId: string;
  name: string;
  releaseType: 'ALBUM' | 'SINGLE' | 'EP';
  releaseDate: string;
  imageUrl?: string;
  deezerUrl: string;
  trackCount?: number;
  isExplicit: boolean;
}

class DeezerService {
  private readonly API_URL = 'https://api.deezer.com';

  /**
   * Recherche des artistes sur Deezer
   */
  async searchArtists(query: string, limit: number = 20): Promise<NormalizedDeezerArtist[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const response = await axios.get<DeezerSearchArtistResponse>(
        `${this.API_URL}/search/artist`,
        {
          params: {
            q: query,
            limit: Math.min(limit, 100), // Deezer limite à 100
          },
        }
      );

      return response.data.data.map(artist => this.normalizeArtist(artist));
    } catch (error) {
      console.error('❌ Deezer search error:', error);
      throw new Error('Erreur lors de la recherche d\'artistes sur Deezer');
    }
  }

  /**
   * Récupère un artiste par son ID Deezer
   */
  async getArtistById(deezerId: string): Promise<NormalizedDeezerArtist | null> {
    try {
      const response = await axios.get<DeezerArtist>(
        `${this.API_URL}/artist/${deezerId}`
      );

      return this.normalizeArtist(response.data);
    } catch (error) {
      console.error('❌ Error fetching Deezer artist by ID:', error);
      return null;
    }
  }

  /**
   * Récupère les albums d'un artiste
   */
  async getArtistAlbums(deezerId: string, limit: number = 50): Promise<NormalizedDeezerAlbum[]> {
    try {
      const response = await axios.get<DeezerArtistAlbumsResponse>(
        `${this.API_URL}/artist/${deezerId}/albums`,
        {
          params: {
            limit: Math.min(limit, 100),
          },
        }
      );

      return response.data.data.map(album => this.normalizeAlbum(album));
    } catch (error) {
      console.error('❌ Error fetching Deezer albums:', error);
      return [];
    }
  }

  /**
   * Recherche un artiste spécifique par nom exact (pour le matching)
   */
  async findArtistByName(artistName: string): Promise<NormalizedDeezerArtist | null> {
    try {
      const results = await this.searchArtists(artistName, 10);
      
      // Chercher une correspondance exacte (insensible à la casse)
      const exactMatch = results.find(
        artist => artist.name.toLowerCase() === artistName.toLowerCase()
      );

      if (exactMatch) {
        return exactMatch;
      }

      // Sinon, retourner le premier résultat si disponible
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('❌ Error finding artist by name:', error);
      return null;
    }
  }

  /**
   * Teste la connexion à l'API Deezer
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.API_URL}/artist/27`); // Daft Punk comme test
      return response.status === 200;
    } catch (error) {
      console.error('❌ Deezer connection test failed:', error);
      return false;
    }
  }

  /**
   * Normalise un artiste Deezer
   */
  private normalizeArtist = (deezerArtist: DeezerArtist): NormalizedDeezerArtist => {
    return {
      deezerId: deezerArtist.id.toString(),
      name: deezerArtist.name,
      imageUrl: deezerArtist.picture_big || deezerArtist.picture_medium || undefined,
      fans: deezerArtist.nb_fan || 0,
      deezerUrl: deezerArtist.link,
      albumCount: deezerArtist.nb_album || 0,
    };
  }

  /**
   * Normalise un album Deezer
   */
  private normalizeAlbum = (deezerAlbum: DeezerAlbum): NormalizedDeezerAlbum => {
    return {
      deezerId: deezerAlbum.id.toString(),
      name: deezerAlbum.title,
      releaseType: this.mapRecordType(deezerAlbum.record_type),
      releaseDate: deezerAlbum.release_date,
      imageUrl: deezerAlbum.cover_big || deezerAlbum.cover_medium || undefined,
      deezerUrl: deezerAlbum.link,
      trackCount: deezerAlbum.nb_tracks,
      isExplicit: deezerAlbum.explicit_lyrics || false,
    };
  }

  /**
   * Convertit le type d'enregistrement Deezer en type de notre app
   */
  private mapRecordType = (recordType: string): 'ALBUM' | 'SINGLE' | 'EP' => {
    switch (recordType.toLowerCase()) {
      case 'album':
        return 'ALBUM';
      case 'single':
        return 'SINGLE';
      case 'ep':
        return 'EP';
      default:
        return 'SINGLE';
    }
  }
}

export default new DeezerService();