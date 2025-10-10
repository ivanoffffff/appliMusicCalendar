// Fichier: backend/src/test-deezer.ts
// Script pour tester l'intégration Deezer

import deezerService from './services/deezerService';

async function testDeezerIntegration() {
  console.log('🧪 Test de l\'intégration Deezer\n');

  try {
    // Test 1: Connexion à l'API
    console.log('1️⃣ Test de connexion à l\'API Deezer...');
    const isConnected = await deezerService.testConnection();
    console.log(isConnected ? '✅ Connexion OK\n' : '❌ Connexion échouée\n');

    // Test 2: Recherche d'artiste
    console.log('2️⃣ Test de recherche d\'artiste (Daft Punk)...');
    const artists = await deezerService.searchArtists('Daft Punk', 5);
    if (artists.length > 0) {
      console.log(`✅ ${artists.length} artiste(s) trouvé(s)`);
      console.log(`   - Nom: ${artists[0].name}`);
      console.log(`   - ID: ${artists[0].deezerId}`);
      console.log(`   - Fans: ${artists[0].fans}`);
      console.log(`   - URL: ${artists[0].deezerUrl}\n`);
    } else {
      console.log('❌ Aucun artiste trouvé\n');
    }

    // Test 3: Récupération des albums d'un artiste
    if (artists.length > 0) {
      console.log('3️⃣ Test de récupération des albums...');
      const albums = await deezerService.getArtistAlbums(artists[0].deezerId, 5);
      if (albums.length > 0) {
        console.log(`✅ ${albums.length} album(s) trouvé(s)`);
        albums.slice(0, 3).forEach((album, index) => {
          console.log(`   ${index + 1}. ${album.name} (${album.releaseType}) - ${album.releaseDate}`);
        });
        console.log('');
      } else {
        console.log('❌ Aucun album trouvé\n');
      }
    }

    // Test 4: Recherche par nom exact
    console.log('4️⃣ Test de recherche par nom exact...');
    const exactMatch = await deezerService.findArtistByName('The Weeknd');
    if (exactMatch) {
      console.log(`✅ Correspondance trouvée`);
      console.log(`   - Nom: ${exactMatch.name}`);
      console.log(`   - ID: ${exactMatch.deezerId}`);
      console.log(`   - URL: ${exactMatch.deezerUrl}\n`);
    } else {
      console.log('❌ Aucune correspondance trouvée\n');
    }

    console.log('🎉 Tests terminés avec succès !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Exécuter les tests
testDeezerIntegration();