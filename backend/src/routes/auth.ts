import { Router } from 'express';
import authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);

// Routes protégées
router.get('/me', authenticateToken, authController.me);

export default router;
