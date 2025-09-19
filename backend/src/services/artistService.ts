import prisma from '../config/database';
import spotifyService from './spotifyService';
import { NormalizedArtist } from '../types/spotify';

class ArtistService {
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

      artist = await prisma.artist.create({
        data: {
          spotifyId: spotifyArtist.spotifyId,
          name: spotifyArtist.name,
          genres: JSON.stringify(spotifyArtist.genres),
          imageUrl: spotifyArtist.imageUrl,
        },
      });

      console.log(`✅ Artist created in database: ${artist.name}`);
    }

    return artist;
  }

  async addToFavorites(userId: string, spotifyId: string, category: string = 'default') {
    // S'assurer que l'artiste existe en base
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

    return favorites.map(fav => ({
      id: fav.id,
      category: fav.category,
      addedAt: fav.addedAt,
      artist: {
        id: fav.artist.id,
        spotifyId: fav.artist.spotifyId,
        name: fav.artist.name,
        genres: JSON.parse(fav.artist.genres),
        imageUrl: fav.artist.imageUrl,
      },
    }));
  }
}

export default new ArtistService();
