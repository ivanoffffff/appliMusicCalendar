import { Router } from 'express';
import artistController from '../controllers/artistController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Routes publiques
router.get('/search', artistController.searchArtists);
router.get('/test-spotify', artistController.testSpotify);

// Routes protégées (nécessitent une authentification)
router.post('/favorites', authenticateToken, artistController.addToFavorites);
router.delete('/favorites/:artistId', authenticateToken, artistController.removeFromFavorites);
router.get('/favorites', authenticateToken, artistController.getFavorites);

export default router;
