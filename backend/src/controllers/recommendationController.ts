import type { Request, Response } from 'express';
import recommendationService from '../services/recommendationService';

export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId; // ✅ Changement ici
    const limit = parseInt(req.query.limit as string) || 20;
    const excludeFavorites = req.query.excludeFavorites !== 'false';

    console.log(`📥 GET /api/recommendations - User: ${userId}, Limit: ${limit}`);

    const recommendations = await recommendationService.getRecommendationsForUser(userId, {
      limit,
      excludeFavorites,
    });

    res.json({
      success: true,
      message: 'Recommandations récupérées avec succès',
      data: recommendations,
      total: recommendations.length,
    });
  } catch (error) {
    console.error('❌ Error in getRecommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des recommandations',
      data: null,
    });
  }
};

export const getRecommendationsByArtist = async (req: Request, res: Response): Promise<void> => {
  try {
    const { artistId } = req.params;
    const limit = parseInt(req.query.limit as string) || 20;

    console.log(`📥 GET /api/recommendations/artist/${artistId} - Limit: ${limit}`);

    const recommendations = await recommendationService.getRecommendationsByArtist(artistId, limit);

    res.json({
      success: true,
      message: 'Recommandations récupérées avec succès',
      data: recommendations,
      total: recommendations.length,
    });
  } catch (error) {
    console.error('❌ Error in getRecommendationsByArtist:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des recommandations',
      data: null,
    });
  }
};