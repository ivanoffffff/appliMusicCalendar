// Fichier: backend/src/refresh-spotify-cache.ts
// Script pour forcer le rafraîchissement du cache Spotify de tous les artistes

import prisma from './config/database';
import spotifyService from './services/spotifyService';

async function refreshAllSpotifyCache() {
  console.log('🔄 Rafraîchissement du cache Spotify pour tous les artistes\n');

  try {
    // Récupérer tous les artistes avec un spotifyId
    const artists = await prisma.artist.findMany({
      where: {
        spotifyId: { not: null }
      }
    });

    console.log(`📊 ${artists.length} artiste(s) à rafraîchir\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const artist of artists) {
      try {
        console.log(`🔄 ${artist.name}...`);
        
        const spotifyData = await spotifyService.getArtistById(artist.spotifyId!);
        
        if (spotifyData) {
          await prisma.artist.update({
            where: { id: artist.id },
            data: {
              popularity: spotifyData.popularity,
              followers: spotifyData.followers,
              lastSyncAt: new Date(),
            },
          });
          
          console.log(`✅ ${artist.name} - Pop: ${spotifyData.popularity}, Followers: ${spotifyData.followers}`);
          successCount++;
        }
        
        // Petit délai pour éviter de dépasser les limites de l'API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Erreur pour ${artist.name}:`, error);
        errorCount++;
      }
    }

    console.log(`\n🎉 Rafraîchissement terminé !`);
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);

  } catch (error) {
    console.error('❌ Erreur lors du rafraîchissement:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
refreshAllSpotifyCache();