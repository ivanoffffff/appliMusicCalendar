import { Router } from 'express';
import spotifyOAuthController from '../controllers/spotifyOAuthController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Routes protégées (nécessitent une authentification)
router.get('/connect', authenticateToken, spotifyOAuthController.initiateAuth);
router.get('/status', authenticateToken, spotifyOAuthController.getConnectionStatus);
router.post('/sync', authenticateToken, spotifyOAuthController.syncFavorites);
router.delete('/disconnect', authenticateToken, spotifyOAuthController.disconnect);

// Route publique pour le callback (pas d'auth requise car Spotify redirige directement)
router.get('/callback', spotifyOAuthController.handleCallback);

export default router;
