// Fichier: backend/src/test-josman.ts
// Script de diagnostic pour tester la synchronisation de Josman

import prisma from './config/database';
import spotifyService from './services/spotifyService';

async function testJosmanSync() {
  console.log('🔍 Diagnostic de synchronisation Josman\n');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Étape 1: Rechercher Josman
    console.log('1️⃣ Recherche de Josman sur Spotify...');
    const searchResults = await spotifyService.searchArtists('Josman', 5);
    
    if (searchResults.length === 0) {
      console.log('❌ Josman introuvable sur Spotify\n');
      return;
    }

    const josman = searchResults[0];
    console.log(`✅ Josman trouvé!`);
    console.log(`   - Nom: ${josman.name}`);
    console.log(`   - Spotify ID: ${josman.spotifyId}`);
    console.log(`   - Popularité: ${josman.popularity}/100\n`);

    // Étape 2: Vérifier s'il est dans les favoris
    console.log('2️⃣ Vérification des favoris en base de données...');
    const artistInDb = await prisma.artist.findUnique({
      where: { spotifyId: josman.spotifyId },
      include: { favorites: true }
    });

    if (!artistInDb) {
      console.log('⚠️ Josman n\'est pas encore en base de données');
      console.log('   → Ajoutez-le d\'abord à vos favoris dans l\'application\n');
      return;
    }

    console.log(`✅ Josman trouvé en base de données (ID: ${artistInDb.id})`);
    console.log(`   - Nombre de favoris: ${artistInDb.favorites.length}\n`);

    // Étape 3: Récupérer ses albums directement depuis l'API Spotify
    console.log('3️⃣ Récupération des albums depuis l\'API Spotify...');
    console.log('   Paramètres de la requête:');
    console.log('   - include_groups: album,single');
    console.log('   - market: FR');
    console.log('   - limit: 50\n');

    const accessToken = await (spotifyService as any).getAccessToken();
    
    // Requête 1: Albums + Singles (marché FR)
    console.log('   Requête 1: album,single avec market=FR');
    const response1 = await fetch(
      `https://api.spotify.com/v1/artists/${josman.spotifyId}/albums?include_groups=album,single&market=FR&limit=50`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    const data1 = await response1.json();
    console.log(`   → ${data1.items?.length || 0} résultats\n`);
    
    // Requête 2: Tous les types avec marché FR
    console.log('   Requête 2: tous types avec market=FR');
    const response2 = await fetch(
      `https://api.spotify.com/v1/artists/${josman.spotifyId}/albums?include_groups=album,single,compilation,appears_on&market=FR&limit=50`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    const data2 = await response2.json();
    console.log(`   → ${data2.items?.length || 0} résultats\n`);

    // Requête 3: Albums + Singles SANS restriction de marché
    console.log('   Requête 3: album,single SANS market (tous pays)');
    const response3 = await fetch(
      `https://api.spotify.com/v1/artists/${josman.spotifyId}/albums?include_groups=album,single&limit=50`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    const data3 = await response3.json();
    console.log(`   → ${data3.items?.length || 0} résultats\n`);

    // Requête 4: TOUS les types SANS restriction de marché
    console.log('   Requête 4: tous types SANS market (tous pays)');
    const response4 = await fetch(
      `https://api.spotify.com/v1/artists/${josman.spotifyId}/albums?include_groups=album,single,compilation,appears_on&limit=50`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    const data4 = await response4.json();
    console.log(`   → ${data4.items?.length || 0} résultats\n`);

    // Utiliser la requête la plus complète pour l'analyse
    const dataMostComplete = data4;

    // Analyser les sorties
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAhead = new Date();
    sixMonthsAhead.setMonth(sixMonthsAhead.getMonth() + 6);

    console.log('4️⃣ Analyse des sorties trouvées:\n');
    
    console.log(`   📊 Comparaison des résultats:`);
    console.log(`   - Requête 1 (album,single + FR): ${data1.items?.length || 0} sorties`);
    console.log(`   - Requête 2 (tous types + FR): ${data2.items?.length || 0} sorties`);
    console.log(`   - Requête 3 (album,single sans market): ${data3.items?.length || 0} sorties`);
    console.log(`   - Requête 4 (tous types sans market): ${data4.items?.length || 0} sorties\n`);
    
    console.log(`   Fenêtre temporelle:`);
    console.log(`   - De: ${sixMonthsAgo.toLocaleDateString('fr-FR')}`);
    console.log(`   - À: ${sixMonthsAhead.toLocaleDateString('fr-FR')}`);
    console.log(`   - Aujourd'hui: ${now.toLocaleDateString('fr-FR')}\n`);

    if (dataMostComplete.items && dataMostComplete.items.length > 0) {
      console.log(`   📋 Liste des sorties (les 20 plus récentes):\n`);
      
      dataMostComplete.items.slice(0, 20).forEach((album: any, index: number) => {
        const releaseDate = new Date(album.release_date);
        const daysFromNow = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isInWindow = releaseDate >= sixMonthsAgo && releaseDate <= sixMonthsAhead;
        const isFuture = releaseDate > now;
        
        console.log(`   ${index + 1}. "${album.name}"`);
        console.log(`      - Type: ${album.album_type}`);
        console.log(`      - Date: ${album.release_date} ${isFuture ? `(dans ${daysFromNow} jours)` : `(il y a ${Math.abs(daysFromNow)} jours)`}`);
        console.log(`      - Dans fenêtre de 6 mois: ${isInWindow ? '✅ OUI' : '❌ NON'}`);
        console.log(`      - Spotify ID: ${album.id}`);
        console.log(`      - Tracks: ${album.total_tracks}\n`);
      });

      // Chercher spécifiquement les albums à venir
      const upcomingAlbums = dataMostComplete.items.filter((album: any) => {
        const releaseDate = new Date(album.release_date);
        return releaseDate > now && releaseDate <= sixMonthsAhead;
      });

      console.log(`\n   🎯 Sorties à venir dans les 6 prochains mois: ${upcomingAlbums.length}`);
      
      if (upcomingAlbums.length > 0) {
        console.log(`\n   ⭐ Détails des sorties à venir:\n`);
        upcomingAlbums.forEach((album: any, index: number) => {
          const releaseDate = new Date(album.release_date);
          const daysFromNow = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          console.log(`   ${index + 1}. "${album.name}"`);
          console.log(`      - Type: ${album.album_type}`);
          console.log(`      - Sortie prévue: ${album.release_date} (dans ${daysFromNow} jours)`);
          console.log(`      - Spotify ID: ${album.id}\n`);
        });
      }
    } else {
      console.log('   ⚠️ Aucune sortie trouvée\n');
    }

    // Étape 5: Vérifier ce qui est déjà en base
    console.log('5️⃣ Vérification des sorties en base de données...\n');
    const releasesInDb = await prisma.release.findMany({
      where: { artistId: artistInDb.id },
      orderBy: { releaseDate: 'desc' }
    });

    console.log(`   📊 Sorties de Josman en base: ${releasesInDb.length}`);
    
    if (releasesInDb.length > 0) {
      console.log(`\n   Dernières sorties enregistrées:\n`);
      releasesInDb.slice(0, 5).forEach((release, index) => {
        const isFuture = new Date(release.releaseDate) > now;
        console.log(`   ${index + 1}. "${release.name}"`);
        console.log(`      - Type: ${release.releaseType}`);
        console.log(`      - Date: ${release.releaseDate.toLocaleDateString('fr-FR')} ${isFuture ? '(à venir)' : ''}`);
        console.log(`      - Spotify ID: ${release.spotifyId}\n`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ Diagnostic terminé!\n');
    
    console.log('💡 Que faire maintenant:');
    console.log('   1. Si un album à venir apparaît dans la liste Spotify mais pas en base:');
    console.log('      → Le système devrait le synchroniser lors du prochain sync');
    console.log('   2. Si l\'album n\'apparaît pas du tout dans la liste Spotify:');
    console.log('      → Vérifiez le type (album/single/compilation/appears_on)');
    console.log('      → Vérifiez la disponibilité sur le marché FR');
    console.log('   3. Si l\'album est déjà en base:');
    console.log('      → Vérifiez qu\'il s\'affiche bien dans le calendrier frontend\n');

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le test
testJosmanSync();