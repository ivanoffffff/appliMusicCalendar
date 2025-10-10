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
        release: log.release ? {
          name: log.release.name,
          releaseType: log.release.releaseType,
          artist: {
            name: log.release.artist.name
          }
        } : null
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

  /**
   * 🆕 NOUVELLE MÉTHODE : Envoie un récapitulatif hebdomadaire à tous les utilisateurs
   * Liste toutes les sorties de leurs artistes favoris de la semaine
   */
  async sendWeeklySummary(): Promise<void> {
    try {
      console.log('📊 Génération des récapitulatifs hebdomadaires...');

      // Calculer les dates de début et fin de la semaine (lundi à dimanche)
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0 = dimanche, 1 = lundi, ..., 5 = vendredi
      
      // Calculer le lundi de cette semaine
      const startOfWeek = new Date(now);
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      startOfWeek.setDate(now.getDate() - daysToMonday);
      startOfWeek.setHours(0, 0, 0, 0);
      
      // Calculer le dimanche de cette semaine
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      console.log(`📅 Période : ${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`);

      // Récupérer tous les utilisateurs avec leurs préférences
      const users = await prisma.user.findMany({
        where: {
          notificationPreferences: {
            emailNotifications: true,
            // weeklySummary: true  // Décommenter si vous avez ajouté ce champ
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
                      releaseDate: {
                        gte: startOfWeek,
                        lte: endOfWeek
                      }
                    },
                    orderBy: {
                      releaseDate: 'asc'
                    }
                  }
                }
              }
            }
          }
        }
      });

      console.log(`👥 ${users.length} utilisateur(s) à traiter`);

      let emailsSent = 0;
      let usersWithReleases = 0;

      // Pour chaque utilisateur
      for (const user of users) {
        // Collecter toutes les sorties de la semaine de ses artistes favoris
        const weeklyReleases = user.favorites
          .flatMap(favorite => 
            favorite.artist.releases.map(release => ({
              artistName: favorite.artist.name,
              artistImage: favorite.artist.imageUrl,
              releaseName: release.name,
              releaseType: release.releaseType,
              releaseDate: release.releaseDate,
              imageUrl: release.imageUrl,
              spotifyUrl: release.spotifyUrl,
              trackCount: release.trackCount
            }))
          )
          .sort((a, b) => a.releaseDate.getTime() - b.releaseDate.getTime());

        // Ne rien envoyer si aucune sortie cette semaine
        if (weeklyReleases.length === 0) {
          console.log(`⏭️ Pas de sortie cette semaine pour ${user.email}`);
          continue;
        }

        usersWithReleases++;

        // Préparer les données pour l'email
        const emailData = {
          userEmail: user.email,
          userName: user.firstName || user.username,
          releases: weeklyReleases,
          startDate: startOfWeek,
          endDate: endOfWeek,
          totalReleases: weeklyReleases.length
        };

        // Envoyer l'email récapitulatif
        const sent = await emailService.sendWeeklySummaryEmail(emailData);

        if (sent) {
          emailsSent++;
          console.log(`✅ Récapitulatif envoyé à ${user.email} (${weeklyReleases.length} sortie(s))`);
          
          // Logger l'envoi
          await this.logWeeklySummary(user.id, weeklyReleases.length);
        } else {
          console.error(`❌ Échec de l'envoi à ${user.email}`);
        }
      }

      console.log(`📧 Résumé : ${emailsSent}/${usersWithReleases} emails envoyés`);

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi des récapitulatifs hebdomadaires:', error);
      throw error;
    }
  }

  /**
   * Logger l'envoi d'un récapitulatif hebdomadaire
   */
  private async logWeeklySummary(userId: string, releaseCount: number): Promise<void> {
    try {
      await prisma.notificationLog.create({
        data: {
          userId,
          type: 'weekly_summary',
          status: 'sent',
          sentAt: new Date(),
          metadata: JSON.stringify({ releaseCount })
        },
      });
    } catch (error) {
      console.error('❌ Erreur lors du log du récapitulatif:', error);
    }
  }
}

export default new NotificationService();