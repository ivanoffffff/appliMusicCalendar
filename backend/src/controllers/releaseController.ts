import { Request, Response } from 'express';
import releaseService from '../services/releaseService';

class ReleaseController {
  async syncReleases(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const result = await releaseService.syncReleasesForUser(userId);
      
      res.json({
        success: true,
        message: result.message,
        data: result.releases,
      });
    } catch (error) {
      console.error('Sync releases error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la synchronisation',
      });
    }
  }

  async getUserReleases(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const releases = await releaseService.getUserReleases(userId, start, end);
      
      res.json({
        success: true,
        data: releases,
        total: releases.length,
      });
    } catch (error) {
      console.error('Get releases error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des sorties',
      });
    }
  }
}

export default new ReleaseController();
