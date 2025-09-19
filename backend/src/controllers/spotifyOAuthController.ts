import { Request, Response } from 'express';
import prisma from '../config/database';
import spotifyOAuthService from '../services/spotifyOAuthService';

class SpotifyOAuthController {
  async initiateAuth(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const state = spotifyOAuthService.generateRandomState();
      
      // Stocker temporairement le state en session ou en base
      // Pour simplifier, on va l'encoder avec l'userId
      const encodedState = Buffer.from(JSON.stringify({ state, userId })).toString('base64');
      
      const authUrl = spotifyOAuthService.generateAuthUrl(encodedState);
      
      res.json({
        success: true,
        authUrl,
        message: 'Redirect to this URL to authorize Spotify access',
      });
    } catch (error) {
      console.error('Spotify auth initiation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initiate Spotify authorization',
      });
    }
  }

  async handleCallback(req: Request, res: Response) {
    try {
      const { code, state, error } = req.query;

      if (error) {
        return res.redirect(`${process.env.FRONTEND_URL}/artists?spotify_error=${error}`);
      }

      if (!code || !state) {
        return res.redirect(`${process.env.FRONTEND_URL}/artists?spotify_error=missing_params`);
      }

      // Décoder le state pour récupérer l'userId
      let decodedState;
      try {
        decodedState = JSON.parse(Buffer.from(state as string, 'base64').toString());
      } catch {
        return res.redirect(`${process.env.FRONTEND_URL}/artists?spotify_error=invalid_state`);
      }

      const { userId } = decodedState;

      // Échanger le code contre des tokens
      const tokens = await spotifyOAuthService.exchangeCodeForTokens(code as string);
      
      // Sauvegarder les tokens
      await spotifyOAuthService.saveUserTokens(userId, tokens);

      // Rediriger vers le frontend avec succès
      res.redirect(`${process.env.FRONTEND_URL}/artists?spotify_connected=true`);
    } catch (error) {
      console.error('Spotify callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/artists?spotify_error=callback_failed`);
    }
  }

  async syncFavorites(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      
      const result = await spotifyOAuthService.syncUserFavorites(userId);
      
      res.json({
        success: true,
        message: `Synchronisation terminée: ${result.imported} nouveaux artistes importés, ${result.existing} déjà présents`,
        data: result,
      });
    } catch (error) {
      console.error('Sync favorites error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to sync Spotify favorites',
      });
    }
  }

  async getConnectionStatus(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      
      const tokenRecord = await prisma.spotifyToken.findUnique({
        where: { userId },
      });

      const isConnected = !!tokenRecord && tokenRecord.expiresAt > new Date();
      
      res.json({
        success: true,
        isConnected,
        connectedAt: tokenRecord?.createdAt,
      });
    } catch (error) {
      console.error('Connection status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get Spotify connection status',
      });
    }
  }

  async disconnect(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      
      await prisma.spotifyToken.deleteMany({
        where: { userId },
      });
      
      res.json({
        success: true,
        message: 'Spotify account disconnected successfully',
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to disconnect Spotify account',
      });
    }
  }
}

export default new SpotifyOAuthController();
