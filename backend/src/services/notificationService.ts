import prisma from '../config/database';
import emailService from './emailService';

interface NotificationPreferences {
  emailNotifications: boolean;
  notificationTypes: {
    newAlbum: boolean;
    newSingle: boolean;
    newCompilation: boolean;
  };
  frequency: 'immediate' | 'daily' | 'weekly';
}

class NotificationService {
  
  async sendNewReleaseNotifications(releaseId: string): Promise<void> {
    try {
      // Récupérer les détails de la sortie
      const release = await prisma.release.findUnique({
        where: { id: releaseId },
        include: {
          artist: {
            include: {
              favorites: {
                include: {
                  user: {
                    include: {
                      notificationPreferences: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!release) {
        console.error('❌ Release non trouvée:', releaseId);
        return;
      }

      const artist = release.artist;
      const usersToNotify = artist.favorites;

      console.log(`📧 Envoi de notifications pour "${release.name}" de ${artist.name} à ${usersToNotify.length} utilisateur(s)`);

      // Envoyer les notifications à chaque utilisateur
      for (const favorite of usersToNotify) {
        const user = favorite.user;
        const preferences = user.notificationPreferences;

        // Vérifier si l'utilisateur veut recevoir des notifications
        if (!this.shouldSendNotification(preferences, release.releaseType)) {
          console.log(`⏭️ Notification ignorée pour ${user.email} (préférences)`);
          continue;
        }

        // Envoyer l'email
        const emailSent = await emailService.sendNewReleaseNotification({
          userEmail: user.email,
          userName: user.username,
          artistName: artist.name,
          releaseName: release.name,
          releaseType: release.releaseType,
          releaseDate: release.releaseDate,
          spotifyUrl: release.spotifyUrl || '',
          imageUrl: release.imageUrl || undefined,
        });

        // Enregistrer la notification en base
        if (emailSent) {
          await this.logNotification(user.id, releaseId, 'email', 'sent');
        } else {
          await this.logNotification(user.id, releaseId, 'email', 'failed');
        }
      }

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des notifications:', error);
    }
  }

  private shouldSendNotification(
    preferences: any, 
    releaseType: string
  ): boolean {
    if (!preferences?.emailNotifications) {
      return false;
    }

    const typeMapping: { [key: string]: string } = {
      'album': 'newAlbum',
      'single': 'newSingle',
      'compilation': 'newCompilation'
    };

    const prefKey = typeMapping[releaseType];
    return prefKey ? preferences.notificationTypes?.[prefKey] !== false : true;
  }

  private async logNotification(
    userId: string,
    releaseId: string,
    type: string,
    status: string
  ): Promise<void> {
    try {
      await prisma.notificationLog.create({
        data: {
          userId,
          releaseId,
          type,
          status,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement du log:', error);
    }
  }

  async updateUserNotificationPreferences(
    userId: string, 
    preferences: NotificationPreferences
  ): Promise<void> {
    try {
      await prisma.notificationPreferences.upsert({
        where: { userId },
        update: {
          emailNotifications: preferences.emailNotifications,
          notificationTypes: JSON.stringify(preferences.notificationTypes),
          frequency: preferences.frequency,
          updatedAt: new Date(),
        },
        create: {
          userId,
          emailNotifications: preferences.emailNotifications,
          notificationTypes: JSON.stringify(preferences.notificationTypes),
          frequency: preferences.frequency,
        },
      });
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des préférences:', error);
      throw error;
    }
  }

  async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const preferences = await prisma.notificationPreferences.findUnique({
        where: { userId },
      });

      if (!preferences) {
        return null;
      }

      return {
        emailNotifications: preferences.emailNotifications,
        notificationTypes: JSON.parse(preferences.notificationTypes),
        frequency: preferences.frequency as 'immediate' | 'daily' | 'weekly',
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des préférences:', error);
      return null;
    }
  }

  async getNotificationHistory(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const logs = await prisma.notificationLog.findMany({
        where: { userId },
        include: {
          release: {
            include: {
              artist: true
            }
          }
        },
        orderBy: { sentAt: 'desc' },
        take: limit,
      });

      return logs.map(log => ({
        id: log.id,
        type: log.type,
        status: log.status,
        sentAt: log.sentAt,
        release: {
          name: log.release.name,
          releaseType: log.release.releaseType,
          artist: {
            name: log.release.artist.name
          }
        }
      }));
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'historique:', error);
      return [];
    }
  }

  // Méthode pour les notifications en lot (quotidiennes/hebdomadaires)
  async sendBatchNotifications(frequency: 'daily' | 'weekly'): Promise<void> {
    try {
      // Récupérer les utilisateurs avec cette fréquence
      const users = await prisma.user.findMany({
        where: {
          notificationPreferences: {
            frequency: frequency,
            emailNotifications: true
          }
        },
        include: {
          notificationPreferences: true,
          favorites: {
            include: {
              artist: {
                include: {
                  releases: {
                    where: {
                      createdAt: {
                        gte: frequency === 'daily' 
                          ? new Date(Date.now() - 24 * 60 * 60 * 1000)
                          : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      for (const user of users) {
        const allReleases = user.favorites
          .flatMap(fav => fav.artist.releases)
          .filter(release => release.createdAt >= (
            frequency === 'daily' 
              ? new Date(Date.now() - 24 * 60 * 60 * 1000)
              : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ));

        if (allReleases.length > 0) {
          await this.sendBatchEmail(user, allReleases, frequency);
        }
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi des notifications ${frequency}:`, error);
    }
  }

  private async sendBatchEmail(user: any, releases: any[], frequency: string): Promise<void> {
    // Logique pour envoyer un email récapitulatif
    // À implémenter selon vos besoins
    console.log(`📧 Envoi du récapitulatif ${frequency} à ${user.email} pour ${releases.length} sortie(s)`);
  }
}

export default new NotificationService();