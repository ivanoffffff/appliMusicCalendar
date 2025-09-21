import cron from 'node-cron';
import releaseService from './releaseService';
import notificationService from './notificationService';

class CronService {
  private isInitialized = false;
  private scheduledTasks: cron.ScheduledTask[] = [];

  init() {
    if (this.isInitialized) {
      console.log('⚠️ Service cron déjà initialisé');
      return;
    }

    console.log('⏰ Initialisation du service de planification...');

    this.scheduledTasks.push(
      cron.schedule('0 * * * *', async () => {
        console.log('🔄 Début de la synchronisation horaire des sorties...');
        try {
          await releaseService.syncAllReleases();
          console.log('✅ Synchronisation horaire terminée');
        } catch (error) {
          console.error('❌ Erreur lors de la synchronisation horaire:', error);
        }
      }, {
        scheduled: true,
        timezone: "Europe/Paris"
      })
    );

    // Notifications quotidiennes (à 9h00)
    this.scheduledTasks.push(
      cron.schedule('0 9 * * *', async () => {
        console.log('📧 Envoi des notifications quotidiennes...');
        try {
          await notificationService.sendBatchNotifications('daily');
          console.log('✅ Notifications quotidiennes envoyées');
        } catch (error) {
          console.error('❌ Erreur lors de l\'envoi des notifications quotidiennes:', error);
        }
      }, {
        scheduled: true,
        timezone: "Europe/Paris"
      })
    );

    // Notifications hebdomadaires (le lundi à 9h00)
    this.scheduledTasks.push(
      cron.schedule('0 9 * * 1', async () => {
        console.log('📧 Envoi des notifications hebdomadaires...');
        try {
          await notificationService.sendBatchNotifications('weekly');
          console.log('✅ Notifications hebdomadaires envoyées');
        } catch (error) {
          console.error('❌ Erreur lors de l\'envoi des notifications hebdomadaires:', error);
        }
      }, {
        scheduled: true,
        timezone: "Europe/Paris"
      })
    );

    // Nettoyage des logs anciens (tous les dimanches à 2h00)
    this.scheduledTasks.push(
      cron.schedule('0 2 * * 0', async () => {
        console.log('🧹 Nettoyage des anciens logs...');
        try {
          await this.cleanupOldLogs();
          console.log('✅ Nettoyage terminé');
        } catch (error) {
          console.error('❌ Erreur lors du nettoyage:', error);
        }
    }, {
      scheduled: true,
      timezone: "Europe/Paris"
    })
  );

  this.isInitialized = true;
  console.log('✅ Service de planification initialisé avec succès');
}

  private async cleanupOldLogs(): Promise<void> {
    try {
      // Import dynamique pour éviter les dépendances circulaires
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      // Supprimer les logs de plus de 3 mois
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const deletedCount = await prisma.notificationLog.deleteMany({
        where: {
          sentAt: {
            lt: threeMonthsAgo
          }
        }
      });

      console.log(`🗑️ ${deletedCount.count} logs supprimés`);
      await prisma.$disconnect();
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des logs:', error);
    }
  }

  // Méthode pour déclencher manuellement les tâches (utile pour les tests)
  async triggerManualSync(): Promise<void> {
    console.log('🔄 Synchronisation manuelle déclenchée...');
    // Ajoutez ici la logique de synchronisation manuelle si nécessaire
  }

  // Arrêter tous les crons
  destroy(): void {
    this.scheduledTasks.forEach(task => task.stop());
    this.scheduledTasks = [];
    this.isInitialized = false;
    console.log('🛑 Service de planification arrêté');
  }
}

export default new CronService();

function destroy() {
    throw new Error('Function not implemented.');
}
