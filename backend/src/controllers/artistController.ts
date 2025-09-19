import { Request, Response } from 'express';
import artistService from '../services/artistService';
import spotifyService from '../services/spotifyService';

class ArtistController {
  async searchArtists(req: Request, res: Response) {
    try {
      const { q: query, limit = 20 } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Paramètre de recherche "q" requis',
        });
      }

      const artists = await artistService.searchArtists(query, parseInt(limit as string));

      res.json({
        success: true,
        data: artists,
        total: artists.length,
      });
    } catch (error) {
      console.error('Search artists error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la recherche',
      });
    }
  }

  async addToFavorites(req: Request, res: Response) {
    try {
      const { spotifyId, category = 'default' } = req.body;
      const userId = req.user!.userId;

      if (!spotifyId) {
        return res.status(400).json({
          success: false,
          message: 'spotifyId requis',
        });
      }

      const favorite = await artistService.addToFavorites(userId, spotifyId, category);

      res.status(201).json({
        success: true,
        message: 'Artiste ajouté aux favoris',
        data: favorite,
      });
    } catch (error) {
      console.error('Add to favorites error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de l\'ajout aux favoris',
      });
    }
  }

  async removeFromFavorites(req: Request, res: Response) {
    try {
      const { artistId } = req.params;
      const userId = req.user!.userId;

      const result = await artistService.removeFromFavorites(userId, artistId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Remove from favorites error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la suppression',
      });
    }
  }

  async getFavorites(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const favorites = await artistService.getUserFavorites(userId);

      res.json({
        success: true,
        data: favorites,
        total: favorites.length,
      });
    } catch (error) {
      console.error('Get favorites error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des favoris',
      });
    }
  }

  // Test de connexion Spotify
  async testSpotify(req: Request, res: Response) {
    try {
      const isConnected = await spotifyService.testConnection();
      res.json({
        success: true,
        spotifyConnected: isConnected,
        message: isConnected ? 'Spotify connecté' : 'Problème de connexion Spotify',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur lors du test Spotify',
      });
    }
  }
}

export default new ArtistController();
