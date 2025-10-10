import prisma from '../config/database';
import spotifyService from './spotifyService';
import deezerService from './deezerService';
import { NormalizedArtist } from '../types/spotify';

class ArtistService {
  // Durée de validité du cache (en heures)
  private CACHE_DURATION_HOURS = 24;

  async searchArtists(query: string, limit: number = 20): Promise<NormalizedArtist[]> {
    // Rechercher via Spotify
    return await spotifyService.searchArtists(query, limit);
  }

  async getOrCreateArtist(spotifyId: string): Promise<any> {
    // Vérifier si l'artiste existe déjà en base
    let artist = await prisma.artist.findUnique({
      where: { spotifyId },
    });

    if (!artist) {
      // Si pas en base, récupérer depuis Spotify et créer
      const spotifyArtist = await spotifyService.getArtistById(spotifyId);
      
      if (!spotifyArtist) {
        throw new Error('Artiste non trouvé sur Spotify');
      }

      // Chercher aussi sur Deezer pour enrichir les données
      let deezerId: string | undefined;
      try {
        const deezerArtist = await deezerService.findArtistByName(spotifyArtist.name);
        if (deezerArtist) {
          deezerId = deezerArtist.deezerId;
          console.log(`✅ Deezer match found for ${spotifyArtist.name}: ${deezerId}`);
        }
      } catch (error) {
        console.log(`⚠️ Could not find Deezer match for ${spotifyArtist.name}`);
      }

      artist = await prisma.artist.create({
        data: {
          spotifyId: spotifyArtist.spotifyId,
          deezerId: deezerId,
          name: spotifyArtist.name,
          genres: JSON.stringify(spotifyArtist.genres),
          imageUrl: spotifyArtist.imageUrl,
          // 🆕 Sauvegarder les données Spotify dans le cache
          popularity: spotifyArtist.popularity,
          followers: spotifyArtist.followers,
          lastSyncAt: new Date(),
        },
      });

      console.log(`✅ Artist created in database: ${artist.name}`);
    } else if (!artist.deezerId) {
      // Si l'artiste existe mais n'a pas de deezerId, essayer de l'enrichir
      try {
        const deezerArtist = await deezerService.findArtistByName(artist.name);
        if (deezerArtist) {
          artist = await prisma.artist.update({
            where: { id: artist.id },
            data: { deezerId: deezerArtist.deezerId },
          });
          console.log(`✅ Artist enriched with Deezer ID: ${artist.name}`);
        }
      } catch (error) {
        console.log(`⚠️ Could not enrich artist with Deezer: ${artist.name}`);
      }
    }

    return artist;
  }

  async addToFavorites(userId: string, spotifyId: string, category: string = 'default') {
    // S'assurer que l'artiste existe en base (avec enrichissement Deezer automatique)
    const artist = await this.getOrCreateArtist(spotifyId);

    // Vérifier si déjà en favoris
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        userId_artistId: {
          userId,
          artistId: artist.id,
        },
      },
    });

    if (existingFavorite) {
      throw new Error('Artiste déjà dans vos favoris');
    }

    // Ajouter aux favoris
    const favorite = await prisma.userFavorite.create({
      data: {
        userId,
        artistId: artist.id,
        category,
      },
      include: {
        artist: true,
      },
    });

    return favorite;
  }

  async removeFromFavorites(userId: string, artistId: string) {
    const deleted = await prisma.userFavorite.deleteMany({
      where: {
        userId,
        artistId,
      },
    });

    if (deleted.count === 0) {
      throw new Error('Artiste non trouvé dans vos favoris');
    }

    return { success: true, message: 'Artiste retiré des favoris' };
  }

  /**
   * 🆕 Vérifie si le cache est valide (moins de X heures)
   */
  private isCacheValid(lastSyncAt: Date | null): boolean {
    if (!lastSyncAt) return false;
    
    const now = new Date();
    const diffInHours = (now.getTime() - lastSyncAt.getTime()) / (1000 * 60 * 60);
    
    return diffInHours < this.CACHE_DURATION_HOURS;
  }

  /**
   * 🆕 Met à jour les données Spotify d'un artiste
   */
  private async refreshSpotifyData(artist: any): Promise<any> {
    if (!artist.spotifyId) return artist;

    try {
      const spotifyData = await spotifyService.getArtistById(artist.spotifyId);
      if (spotifyData) {
        return await prisma.artist.update({
          where: { id: artist.id },
          data: {
            popularity: spotifyData.popularity,
            followers: spotifyData.followers,
            lastSyncAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error(`Erreur refresh Spotify pour ${artist.name}:`, error);
    }
    
    return artist;
  }

  async getUserFavorites(userId: string) {
    const favorites = await prisma.userFavorite.findMany({
      where: { userId },
      include: {
        artist: true,
      },
      orderBy: {
        addedAt: 'desc',
      },
    });

    // Enrichir les favoris avec les URLs Spotify et Deezer
    const enrichedFavorites = await Promise.all(
      favorites.map(async (fav) => {
        let artist = fav.artist;

        // 🆕 Vérifier si le cache est expiré et mettre à jour si nécessaire
        if (!this.isCacheValid(artist.lastSyncAt)) {
          console.log(`🔄 Refreshing cache for ${artist.name}`);
          artist = await this.refreshSpotifyData(artist);
        } else {
          console.log(`✅ Using cached data for ${artist.name}`);
        }

        // Construire les URLs
        const spotifyUrl = artist.spotifyId 
          ? `https://open.spotify.com/artist/${artist.spotifyId}`
          : undefined;
        
        const deezerUrl = artist.deezerId 
          ? `https://www.deezer.com/artist/${artist.deezerId}`
          : undefined;

        return {
          id: fav.id,
          category: fav.category,
          addedAt: fav.addedAt,
          artist: {
            id: artist.id,
            spotifyId: artist.spotifyId,
            deezerId: artist.deezerId,
            name: artist.name,
            genres: JSON.parse(artist.genres),
            imageUrl: artist.imageUrl,
            spotifyUrl: spotifyUrl,
            deezerUrl: deezerUrl,
            popularity: artist.popularity || 0,
            followers: artist.followers || 0,
          },
        };
      })
    );

    return enrichedFavorites;
  }
}

export default new ArtistService();