import { Router } from 'express';
import releaseController from '../controllers/releaseController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent une authentification
router.post('/sync', authenticateToken, releaseController.syncReleases);
router.get('/', authenticateToken, releaseController.getUserReleases);

export default router;
