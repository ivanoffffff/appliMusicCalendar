import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { getRecommendations, getRecommendationsByArtist } from '../controllers/recommendationController';

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticateToken);

// GET /api/recommendations - Recommandations basées sur les favoris de l'utilisateur
router.get('/', getRecommendations);

// GET /api/recommendations/artist/:artistId - Recommandations basées sur un artiste spécifique
router.get('/artist/:artistId', getRecommendationsByArtist);

export default router;