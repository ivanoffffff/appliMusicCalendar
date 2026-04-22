import prisma from '../config/database';
import { spotifyClient } from '../config/httpClient';
import spotifyService from './spotifyService';
import deezerService from './deezerService';
import notificationService from './notificationService';

interface SpotifyAlbum {
  id: string;
  name: string;
  album_type: 'album' | 'single' | 'compilation';
  release_date: string;
  images: Array<{ url: string; height: number | null; width: number | null }>;
  external_urls: { spotify: string };
  total_tracks: number;
  artists: Array<{ id: string; name: string }>;
}

interface SpotifyNewReleasesResponse {
  albums: {
    items: SpotifyAlbum[];
    total: number;
    limit: number;
    offset: number;
  };
}

class ReleaseService {
  
  /**
   * 🆕 NOUVELLE MÉTHODE : Synchronise les sorties pour TOUS les utilisateurs
   * Utilisée par le cron pour la synchronisation automatique
   */
  async syncAllReleases(): Promise<void> {
    try {
      console.log('🔄 Début de la synchronisation globale des sorties...');
      
      // Récupérer tous les utilisateurs
      const users = await prisma.user.findMany({
        select: { id: true, username: true, email: true }
      });

      if (users.length === 0) {
        console.log('⚠️ Aucun utilisateur trouvé');
        return;
      }

      console.log(`👥 ${users.length} utilisateur(s) à synchroniser`);

      let totalNewReleases = 0;

      // Synchroniser les sorties pour chaque utilisateur
      for (const user of users) {
        try {
          const result = await this.syncReleasesForUser(user.id);
          totalNewReleases += result.releases.length;
          
          if (result.releases.length > 0) {
            console.log(`✅ ${user.username}: ${result.releases.length} nouvelle(s) sortie(s)`);
          }
        } catch (error) {
          console.error(`❌ Erreur sync pour ${user.username}:`, error);
        }
      }

      console.log(`🎉 Synchronisation terminée : ${totalNewReleases} nouvelle(s) sortie(s) au total`);
      
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation globale:', error);
      throw error;
    }
  }

  async syncReleasesForUser(userId: string) {
    try {
      // Récupérer les artistes favoris de l'utilisateur
      const userFavorites = await prisma.userFavorite.findMany({
        where: { userId },
        include: { artist: true },
      });

      if (userFavorites.length === 0) {
        return { message: 'Aucun artiste favori trouvé', releases: [] };
      }

      const newReleases: any[] = [];

      // Pour chaque artiste favori, récupérer ses albums récents
      for (const favorite of userFavorites) {
        const artist = favorite.artist;
        if (artist.spotifyId) {
          try {
            const artistReleases = await this.getArtistReleases(artist.spotifyId);
            
            for (const release of artistReleases) {
              // Vérifier si la sortie existe déjà en base
              const existingRelease = await prisma.release.findUnique({
                where: { spotifyId: release.id },
              });

              if (!existingRelease) {
                // 🎵 Chercher la sortie sur Deezer pour enrichir les données
                let deezerId: string | undefined;
                let deezerUrl: string | undefined;

                if (artist.deezerId) {
                  try {
                    const deezerAlbums = await deezerService.getArtistAlbums(artist.deezerId, 50);
                    
                    // Chercher une correspondance par nom (en normalisant)
                    const normalizedReleaseName = this.normalizeName(release.name);
                    const matchingDeezerAlbum = deezerAlbums.find(
                      album => this.normalizeName(album.name) === normalizedReleaseName
                    );

                    if (matchingDeezerAlbum) {
                      deezerId = matchingDeezerAlbum.deezerId;
                      deezerUrl = matchingDeezerAlbum.deezerUrl;
                      console.log(`✅ Deezer match found for release: ${release.name}`);
                    }
                  } catch (error) {
                    console.log(`⚠️ Could not find Deezer match for release: ${release.name}`);
                  }
                }

                // Créer la nouvelle sortie avec les données Deezer si disponibles
                try {
                  const newRelease = await prisma.release.upsert({
                    where: { spotifyId: release.id },
                    update: {
                      // Mettre à jour si existe déjà
                      deezerId: deezerId || undefined,
                      deezerUrl: deezerUrl || undefined,
                      imageUrl: release.images[0]?.url,
                      spotifyUrl: release.external_urls.spotify,
                      trackCount: release.total_tracks,
                    },
                    create: {
                      // Créer si n'existe pas
                      spotifyId: release.id,
                      deezerId: deezerId || undefined,
                      name: release.name,
                      releaseType: this.mapAlbumType(release.album_type),
                      releaseDate: new Date(release.release_date),
                      imageUrl: release.images[0]?.url,
                      spotifyUrl: release.external_urls.spotify,
                      deezerUrl: deezerUrl || undefined,
                      trackCount: release.total_tracks,
                      artistId: artist.id,
                    },
                  });

                  newReleases.push(newRelease);
                } catch (error: any) {
                  // Si erreur de contrainte unique sur deezerId, c'est une collab
                  if (error.code === 'P2002' && error.meta?.target?.includes('deezerId')) {
                    console.log(`⚠️ Collaboration détectée: ${release.name} existe déjà avec ce deezerId`);
                    
                    // Créer quand même la release mais SANS deezerId pour éviter le conflit
                    const newRelease = await prisma.release.create({
                      data: {
                        spotifyId: release.id,
                        // Pas de deezerId pour éviter le conflit sur les collabs
                        name: release.name,
                        releaseType: this.mapAlbumType(release.album_type),
                        releaseDate: new Date(release.release_date),
                        imageUrl: release.images[0]?.url,
                        spotifyUrl: release.external_urls.spotify,
                        // Pas de deezerUrl non plus
                        trackCount: release.total_tracks,
                        artistId: artist.id,
                      },
                    });
                    newReleases.push(newRelease);
                    // 🆕 AJOUT : Envoyer une notification pour cette nouvelle sortie
                    // Uniquement si la date de sortie est récente (dans les 7 derniers jours)
                    const releaseDate = new Date(release.release_date);
                    const now = new Date();
                    const daysDiff = Math.floor((now.getTime() - releaseDate.getTime()) / (1000 * 60 * 60 * 24));
                    
                    // Si la sortie date de moins de 7 jours, envoyer une notification
                    if (daysDiff >= 0 && daysDiff <= 7) {
                      try {
                        await notificationService.sendNewReleaseNotifications(newRelease.id);
                      } catch (notifError) {
                        console.error('Erreur envoi notification:', notifError);
                      }
                    }
                  } else {
                    // Autre erreur, on la propage
                    throw error;
                  }
                }

                
              }
            }
          } catch (error) {
            console.error(`Erreur sync releases pour ${artist.name}:`, error);
          }
        }
      }

      return { 
        message: `${newReleases.length} nouvelles sorties synchronisées`, 
        releases: newReleases 
      };
    } catch (error) {
      console.error('Erreur sync releases:', error);
      throw new Error('Erreur lors de la synchronisation des sorties');
    }
  }

  async getArtistReleases(spotifyArtistId: string): Promise<SpotifyAlbum[]> {
    try {
      const accessToken = await (spotifyService as any).getAccessToken();

      const { data } = await spotifyClient.get<{ items: SpotifyAlbum[] }>(
        `https://api.spotify.com/v1/artists/${spotifyArtistId}/albums`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { include_groups: 'album,single,compilation', limit: 50 },
        }
      );
      
      // Inclure les sorties depuis 3 mois en arrière jusqu'à 6 mois dans le futur
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const threeMonthsAhead = new Date();
      threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);

      return data.items.filter((album: SpotifyAlbum) => {
        const releaseDate = new Date(album.release_date);
        return releaseDate >= threeMonthsAgo && releaseDate <= threeMonthsAhead;
      });
    } catch (error) {
      console.error('Erreur récupération albums artiste:', error);
      return [];
    }
  }

  async getUserReleases(userId: string, startDate?: Date, endDate?: Date) {
    const whereClause: any = {
      artist: {
        favorites: {
          some: { userId }
        }
      }
    };

    if (startDate && endDate) {
      whereClause.releaseDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    const releases = await prisma.release.findMany({
      where: whereClause,
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            spotifyId: true,
            deezerId: true,
            imageUrl: true,
            genres: true,
          }
        }
      },
      orderBy: { releaseDate: 'desc' },
    });

    return releases;
  }

  private mapAlbumType(spotifyType: string): 'ALBUM' | 'SINGLE' | 'EP' {
    switch (spotifyType) {
      case 'album': return 'ALBUM';
      case 'single': return 'SINGLE';
      case 'compilation': return 'EP';
      default: return 'SINGLE';
    }
  }

  // Fonction helper pour normaliser les noms (pour le matching Deezer)
  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
      .replace(/[^a-z0-9\s]/g, '')     // Retirer caractères spéciaux
      .trim();
  }
}

export default new ReleaseService();
