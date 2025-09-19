import prisma from '../config/database';
import spotifyService from './spotifyService';
import { NormalizedArtist } from '../types/spotify';

interface SpotifyAlbum {
  id: string;
  name: string;
  album_type: 'album' | 'single' | 'compilation';
  release_date: string;
  images: Array<{ url: string; height: number | null; width: number | null }>;
  external_urls: { spotify: string };
  total_tracks: number;
  artists: Array<{ id: string; name: string }>;
}

interface SpotifyNewReleasesResponse {
  albums: {
    items: SpotifyAlbum[];
    total: number;
    limit: number;
    offset: number;
  };
}

class ReleaseService {
  async syncReleasesForUser(userId: string) {
    try {
      // Récupérer les artistes favoris de l'utilisateur
      const userFavorites = await prisma.userFavorite.findMany({
        where: { userId },
        include: { artist: true },
      });

      if (userFavorites.length === 0) {
        return { message: 'Aucun artiste favori trouvé', releases: [] };
      }

      const newReleases: any[] = [];

      // Pour chaque artiste favori, récupérer ses albums récents
      for (const favorite of userFavorites) {
        const artist = favorite.artist;
        if (artist.spotifyId) {
          try {
            const artistReleases = await this.getArtistReleases(artist.spotifyId);
            
            for (const release of artistReleases) {
              // Vérifier si la sortie existe déjà en base
              const existingRelease = await prisma.release.findUnique({
                where: { spotifyId: release.id },
              });

              if (!existingRelease) {
                // Créer la nouvelle sortie
                const newRelease = await prisma.release.create({
                  data: {
                    spotifyId: release.id,
                    name: release.name,
                    releaseType: this.mapAlbumType(release.album_type),
                    releaseDate: new Date(release.release_date),
                    imageUrl: release.images[0]?.url,
                    spotifyUrl: release.external_urls.spotify,
                    trackCount: release.total_tracks,
                    artistId: artist.id,
                  },
                });
                newReleases.push(newRelease);
              }
            }
          } catch (error) {
            console.error(`Erreur sync releases pour ${artist.name}:`, error);
          }
        }
      }

      return { 
        message: `${newReleases.length} nouvelles sorties synchronisées`, 
        releases: newReleases 
      };
    } catch (error) {
      console.error('Erreur sync releases:', error);
      throw new Error('Erreur lors de la synchronisation des sorties');
    }
  }

  async getArtistReleases(spotifyArtistId: string): Promise<SpotifyAlbum[]> {
    try {
      const accessToken = await (spotifyService as any).getAccessToken();
      
      const response = await fetch(
        `https://api.spotify.com/v1/artists/${spotifyArtistId}/albums?include_groups=album,single&market=FR&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Filtrer les sorties récentes (derniers 6 mois)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      return data.items.filter((album: SpotifyAlbum) => {
        const releaseDate = new Date(album.release_date);
        return releaseDate >= sixMonthsAgo;
      });
    } catch (error) {
      console.error('Erreur récupération albums artiste:', error);
      return [];
    }
  }

  async getUserReleases(userId: string, startDate?: Date, endDate?: Date) {
    const whereClause: any = {
      artist: {
        favorites: {
          some: { userId }
        }
      }
    };

    if (startDate && endDate) {
      whereClause.releaseDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const releases = await prisma.release.findMany({
      where: whereClause,
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            spotifyId: true,
          }
        }
      },
      orderBy: { releaseDate: 'desc' },
    });

    return releases;
  }

  private mapAlbumType(spotifyType: string): 'ALBUM' | 'SINGLE' | 'EP' {
    switch (spotifyType) {
      case 'album': return 'ALBUM';
      case 'single': return 'SINGLE';
      case 'compilation': return 'EP';
      default: return 'SINGLE';
    }
  }
}

export default new ReleaseService();
