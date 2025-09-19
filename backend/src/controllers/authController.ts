import { Request, Response } from 'express';
import authService from '../services/authService';
import { AuthResponse } from '../types/auth';

class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { user, accessToken } = await authService.register(req.body);
      
      const response: AuthResponse = {
        success: true,
        message: 'Compte créé avec succès',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
        },
        accessToken
      };

      res.status(201).json(response);
    } catch (error) {
      console.error('Registration error:', error);
      
      const response: AuthResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la création du compte'
      };

      res.status(400).json(response);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { user, accessToken } = await authService.login(req.body);
      
      const response: AuthResponse = {
        success: true,
        message: 'Connexion réussie',
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
        },
        accessToken
      };

      res.json(response);
    } catch (error) {
      console.error('Login error:', error);
      
      const response: AuthResponse = {
        success: false,
        message: error instanceof Error ? error.message : 'Erreur lors de la connexion'
      };

      res.status(400).json(response);
    }
  }

  async me(req: Request, res: Response) {
    try {
      // req.user est défini grâce au middleware authenticateToken
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Non authentifié'
        });
      }

      // Récupérer les infos complètes de l'utilisateur
      const user = await authService.getUserById(req.user.userId);
      
      res.json({
        success: true,
        user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erreur serveur'
      });
    }
  }
}

export default new AuthController();
