import { Router } from 'express';
import notificationController from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Gestion des préférences de notification
router.put('/preferences', notificationController.updatePreferences);
router.get('/preferences', notificationController.getPreferences);

// Historique des notifications
router.get('/history', notificationController.getNotificationHistory);

// Tests et diagnostic
router.post('/test-email', notificationController.testEmail);
router.get('/test-connection', notificationController.testEmailConnection);

// Synchronisation manuelle (pour les admins/tests)
router.post('/sync-releases', notificationController.triggerReleaseSync);

export default router;