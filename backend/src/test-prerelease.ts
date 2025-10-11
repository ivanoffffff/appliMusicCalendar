// Fichier: backend/src/test-prerelease.ts
// Script pour tester l'accès à l'album pre-release de Josman

// 🔑 IMPORTANT : Charger les variables d'environnement
import dotenv from 'dotenv';
dotenv.config();

import spotifyService from './services/spotifyService';

async function testPrerelease() {
  console.log('🧪 Test de l\'album Pre-release de Josman\n');
  console.log('═══════════════════════════════════════════════════\n');

  const ALBUM_ID = '4n13cnKMXecQY8qskyIPa8';
  const JOSMAN_ID = '6dbdXbyAWk2qx8Qttw0knR';

  try {
    const accessToken = await (spotifyService as any).getAccessToken();
    console.log('✅ Token Spotify obtenu\n');

    // Test 1: Essayer d'accéder directement à l'album
    console.log('1️⃣ Tentative d\'accès direct à l\'album via /albums/{id}\n');
    try {
      const albumResponse = await fetch(
        `https://api.spotify.com/v1/albums/${ALBUM_ID}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      if (albumResponse.ok) {
        const albumData = await albumResponse.json();
        console.log('✅ Album accessible !');
        console.log(`   - Nom: ${albumData.name}`);
        console.log(`   - Date de sortie: ${albumData.release_date}`);
        console.log(`   - Type: ${albumData.album_type}`);
        console.log(`   - Tracks: ${albumData.total_tracks}`);
        console.log(`   - URL Spotify: ${albumData.external_urls.spotify}\n`);
      } else {
        console.log(`❌ Album non accessible (Status: ${albumResponse.status})`);
        const error = await albumResponse.json();
        console.log(`   Erreur: ${error.error?.message || 'Inconnu'}\n`);
      }
    } catch (error) {
      console.log('❌ Erreur lors de l\'accès à l\'album');
      console.log(`   ${error}\n`);
    }

    // Test 2: Vérifier les nouveautés générales
    console.log('2️⃣ Vérification des "new releases" (nouveautés Spotify)\n');
    try {
      const newReleasesResponse = await fetch(
        `https://api.spotify.com/v1/browse/new-releases?country=FR&limit=50`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      if (newReleasesResponse.ok) {
        const newReleasesData = await newReleasesResponse.json();
        const josmanAlbums = newReleasesData.albums.items.filter(
          (album: any) => album.artists.some((artist: any) => artist.id === JOSMAN_ID)
        );

        if (josmanAlbums.length > 0) {
          console.log(`✅ ${josmanAlbums.length} album(s) de Josman dans les nouveautés :`);
          josmanAlbums.forEach((album: any) => {
            console.log(`   - ${album.name} (${album.release_date})`);
          });
        } else {
          console.log('❌ Aucun album de Josman dans les nouveautés actuelles\n');
        }
      }
    } catch (error) {
      console.log('❌ Erreur lors de la vérification des nouveautés\n');
    }

    // Test 3: Rechercher l'album par nom
    console.log('\n3️⃣ Recherche de l\'album par nom "DOM PERIGNON CRYING"\n');
    try {
      const searchResponse = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent('DOM PERIGNON CRYING Josman')}&type=album&limit=10`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const albums = searchData.albums.items;

        if (albums.length > 0) {
          console.log(`✅ ${albums.length} résultat(s) trouvé(s) :`);
          albums.forEach((album: any) => {
            console.log(`   - "${album.name}" par ${album.artists[0].name}`);
            console.log(`     Date: ${album.release_date}`);
            console.log(`     ID: ${album.id}`);
            console.log(`     Match: ${album.id === ALBUM_ID ? '✅ OUI' : '❌ NON'}\n`);
          });
        } else {
          console.log('❌ Aucun résultat trouvé pour cette recherche\n');
        }
      }
    } catch (error) {
      console.log('❌ Erreur lors de la recherche\n');
    }

    // Test 4: Vérifier tous les albums de Josman avec pagination
    console.log('4️⃣ Récupération exhaustive des albums de Josman (avec pagination)\n');
    try {
      let allAlbums: any[] = [];
      let offset = 0;
      const limit = 50;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `https://api.spotify.com/v1/artists/${JOSMAN_ID}/albums?include_groups=album,single,compilation,appears_on&limit=${limit}&offset=${offset}`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          }
        );

        if (response.ok) {
          const data = await response.json();
          allAlbums = allAlbums.concat(data.items);
          
          console.log(`   Récupéré ${data.items.length} albums (offset: ${offset})`);
          
          hasMore = data.items.length === limit;
          offset += limit;

          if (hasMore && offset < 200) { // Limite de sécurité
            continue;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }

      console.log(`\n   📊 Total albums récupérés: ${allAlbums.length}`);
      
      // Chercher notre album
      const targetAlbum = allAlbums.find((album: any) => album.id === ALBUM_ID);
      
      if (targetAlbum) {
        console.log('\n   🎉 ALBUM TROUVÉ !');
        console.log(`   - Nom: ${targetAlbum.name}`);
        console.log(`   - Date: ${targetAlbum.release_date}`);
        console.log(`   - Type: ${targetAlbum.album_type}`);
      } else {
        console.log('\n   ❌ Album "DOM PERIGNON CRYING" non trouvé dans la liste complète');
      }

      // Afficher les albums futurs
      const now = new Date();
      const futureAlbums = allAlbums.filter((album: any) => {
        const releaseDate = new Date(album.release_date);
        return releaseDate > now;
      });

      if (futureAlbums.length > 0) {
        console.log(`\n   ⏰ Albums à venir détectés: ${futureAlbums.length}`);
        futureAlbums.forEach((album: any) => {
          console.log(`   - "${album.name}" (${album.release_date})`);
        });
      } else {
        console.log('\n   ⚠️ Aucun album à venir détecté dans l\'API');
      }

    } catch (error) {
      console.log('❌ Erreur lors de la récupération exhaustive\n');
    }

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ Tests terminés!\n');

    console.log('💡 Conclusions possibles:');
    console.log('   - Si l\'album est accessible via /albums/{id}: L\'API peut le voir');
    console.log('   - Si l\'album n\'est PAS dans /artists/{id}/albums: C\'est une pre-release non visible encore');
    console.log('   - Les pre-releases apparaissent généralement quelques jours avant la sortie\n');

  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

// Exécuter les tests
testPrerelease();