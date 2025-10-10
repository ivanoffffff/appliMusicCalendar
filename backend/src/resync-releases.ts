// Fichier: backend/src/resync-releases.ts
// Script pour resynchroniser toutes les releases avec enrichissement Deezer

import prisma from './config/database';
import releaseService from './services/releaseService';

async function resyncAllReleases() {
  console.log('🔄 Resynchronisation des releases avec enrichissement Deezer\n');

  try {
    // 1. Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      select: { id: true, username: true }
    });

    console.log(`👥 ${users.length} utilisateur(s) trouvé(s)\n`);

    if (users.length === 0) {
      console.log('⚠️ Aucun utilisateur trouvé. Créez un compte d\'abord.');
      return;
    }

    // 2. Option : Supprimer les releases existantes pour forcer la resync
    console.log('🗑️  Suppression des releases existantes...');
    const deleted = await prisma.release.deleteMany({});
    console.log(`✅ ${deleted.count} release(s) supprimée(s)\n`);

    // 3. Resynchroniser pour chaque utilisateur
    for (const user of users) {
      console.log(`🔄 Synchronisation pour ${user.username}...`);
      const result = await releaseService.syncReleasesForUser(user.id);
      console.log(`✅ ${result.message}\n`);
    }

    console.log('🎉 Resynchronisation terminée avec succès !');
    console.log('\n💡 Vérifie maintenant ton application - les boutons Deezer devraient apparaître !');

  } catch (error) {
    console.error('❌ Erreur lors de la resynchronisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
resyncAllReleases();