import { Request, Response } from 'express';
import notificationService from '../services/notificationService';
import emailService from '../services/emailService';
import prisma from '../config/database';

class NotificationController {
  
  async updatePreferences(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { emailNotifications, notificationTypes, frequency } = req.body;

      if (typeof emailNotifications !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'emailNotifications doit être un booléen',
        });
      }

      const validFrequencies = ['immediate', 'daily', 'weekly'];
      if (frequency && !validFrequencies.includes(frequency)) {
        return res.status(400).json({
          success: false,
          message: 'Fréquence invalide. Valeurs acceptées: immediate, daily, weekly',
        });
      }

      await notificationService.updateUserNotificationPreferences(userId, {
        emailNotifications,
        notificationTypes: notificationTypes || {
          newAlbum: true,
          newSingle: true,
          newCompilation: true,
        },
        frequency: frequency || 'immediate',
      });

      res.json({
        success: true,
        message: 'Préférences de notification mises à jour',
      });
    } catch (error) {
      console.error('Erreur mise à jour préférences:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour des préférences',
      });
    }
  }

  async getPreferences(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const preferences = await notificationService.getUserNotificationPreferences(userId);

      if (!preferences) {
        // Retourner les préférences par défaut
        return res.json({
          success: true,
          data: {
            emailNotifications: true,
            notificationTypes: {
              newAlbum: true,
              newSingle: true,
              newCompilation: true,
            },
            frequency: 'immediate',
          },
        });
      }

      res.json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      console.error('Erreur récupération préférences:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des préférences',
      });
    }
  }

  async getNotificationHistory(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { limit = 50 } = req.query;
      
      const history = await notificationService.getNotificationHistory(
        userId, 
        parseInt(limit as string)
      );

      res.json({
        success: true,
        data: history,
        total: history.length,
      });
    } catch (error) {
      console.error('Erreur récupération historique:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de l\'historique',
      });
    }
  }

  async testEmail(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const userEmail = email || req.user!.email;

      if (!userEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email requis',
        });
      }

      const testData = {
        userEmail,
        userName: req.user!.username || 'Utilisateur',
        artistName: 'Artiste Test',
        releaseName: 'Album de Test',
        releaseType: 'album',
        releaseDate: new Date(),
        spotifyUrl: 'https://open.spotify.com/album/test',
        imageUrl: 'https://via.placeholder.com/300x300',
      };

      const success = await emailService.sendNewReleaseNotification(testData);

      res.json({
        success,
        message: success 
          ? 'Email de test envoyé avec succès' 
          : 'Échec de l\'envoi de l\'email de test',
      });
    } catch (error) {
      console.error('Erreur test email:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi de l\'email de test',
      });
    }
  }

  async testEmailConnection(req: Request, res: Response) {
    try {
      const isConnected = await emailService.testConnection();
      
      res.json({
        success: true,
        emailServiceConnected: isConnected,
        message: isConnected 
          ? 'Service email configuré correctement' 
          : 'Problème de configuration du service email',
      });
    } catch (error) {
      console.error('Erreur test connexion email:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du test de connexion email',
      });
    }
  }

  async triggerReleaseSync(req: Request, res: Response) {
    try {
      const releaseService = (await import('../services/releaseService')).default;
      
      await releaseService.syncAllReleases();

      res.json({
        success: true,
        message: 'Synchronisation des sorties déclenchée avec notifications',
      });
    } catch (error) {
      console.error('Erreur sync releases:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la synchronisation',
      });
    }
  }

  /**
   * 🆕 NOUVELLE MÉTHODE : Déclencher manuellement l'envoi du récapitulatif hebdomadaire
   */
  async sendManualWeeklySummary(req: Request, res: Response) {
    try {
      console.log('📧 Envoi manuel du récapitulatif hebdomadaire demandé...');
      
      await notificationService.sendWeeklySummary();

      res.json({
        success: true,
        message: 'Récapitulatif hebdomadaire envoyé avec succès',
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi manuel du récapitulatif:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'envoi du récapitulatif hebdomadaire',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  }

  /**
   * 🆕 Mettre à jour les préférences de récapitulatif hebdomadaire
   */
  async updateWeeklySummaryPreference(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { weeklySummary } = req.body;

      if (typeof weeklySummary !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'weeklySummary doit être un booléen',
        });
      }

      // Mettre à jour ou créer les préférences
      await prisma.notificationPreferences.upsert({
        where: { userId },
        update: {
          weeklySummary,
          updatedAt: new Date(),
        },
        create: {
          userId,
          weeklySummary,
          emailNotifications: true,
          notificationTypes: JSON.stringify({
            newAlbum: true,
            newSingle: true,
            newCompilation: true,
          }),
          frequency: 'immediate',
        },
      });

      res.json({
        success: true,
        message: `Récapitulatif hebdomadaire ${weeklySummary ? 'activé' : 'désactivé'}`,
      });
    } catch (error) {
      console.error('Erreur mise à jour préférence récapitulatif:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la mise à jour de la préférence',
      });
    }
  }
}

export default new NotificationController();