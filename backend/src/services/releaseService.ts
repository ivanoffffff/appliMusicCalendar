import prisma from '../config/database';
import spotifyService from './spotifyService';
import deezerService from './deezerService';

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
                // 🆕 Chercher la sortie sur Deezer pour enrichir les données
                let deezerId: string | undefined;
                let deezerUrl: string | undefined;

                if (artist.deezerId) {
                  try {
                    const deezerAlbums = await deezerService.getArtistAlbums(artist.deezerId, 50);
                    
                    // Chercher une correspondance par nom (en normalisant)
                    const normalizedReleaseName = this.normalizeName(release.name);
                    const matchingDeezerAlbum = deezerAlbums.find(
                      album => this.normalizeName(album.name) === normalizedReleaseName
                    );

                    if (matchingDeezerAlbum) {
                      deezerId = matchingDeezerAlbum.deezerId;
                      deezerUrl = matchingDeezerAlbum.deezerUrl;
                      console.log(`✅ Deezer match found for release: ${release.name}`);
                    }
                  } catch (error) {
                    console.log(`⚠️ Could not find Deezer match for release: ${release.name}`);
                  }
                }

                // Créer la nouvelle sortie avec les données Deezer si disponibles
                const newRelease = await prisma.release.create({
                  data: {
                    spotifyId: release.id,
                    deezerId: deezerId,        // 🆕 Ajout deezerId
                    name: release.name,
                    releaseType: this.mapAlbumType(release.album_type),
                    releaseDate: new Date(release.release_date),
                    imageUrl: release.images[0]?.url,
                    spotifyUrl: release.external_urls.spotify,
                    deezerUrl: deezerUrl,      // 🆕 Ajout deezerUrl
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
        `https://api.spotify.com/v1/artists/${spotifyArtistId}/albums?include_groups=album,single&market=FR&limit=50`,
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
      
      // ✅ MODIFICATION : Inclure les sorties passées ET futures
      // Sorties depuis 6 mois en arrière jusqu'à 6 mois dans le futur
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const sixMonthsAhead = new Date();
      sixMonthsAhead.setMonth(sixMonthsAhead.getMonth() + 6);
      
      return data.items.filter((album: SpotifyAlbum) => {
        const releaseDate = new Date(album.release_date);
        // Inclure les sorties entre 6 mois avant et 6 mois après
        return releaseDate >= sixMonthsAgo && releaseDate <= sixMonthsAhead;
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
            deezerId: true,  // 🆕 Inclure deezerId
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

  // 🆕 Fonction helper pour normaliser les noms (pour le matching)
  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
      .replace(/[^a-z0-9\s]/g, '')     // Retirer caractères spéciaux
      .trim();
  }
}

export default new ReleaseService();
