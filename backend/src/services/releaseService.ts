import prisma from '../config/database';
import { spotifyClient } from '../config/httpClient';
import spotifyService from './spotifyService';
import deezerService, { NormalizedDeezerAlbum } from './deezerService';
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
      const userFavorites = await prisma.userFavorite.findMany({
        where: { userId },
        include: { artist: true },
      });

      console.log(`[sync] userId=${userId} — ${userFavorites.length} artiste(s) favori(s)`);

      if (userFavorites.length === 0) {
        return { message: 'Aucun artiste favori trouvé', releases: [] };
      }

      // ── Étape 1 : fetch Spotify séquentiellement, stop immédiat sur 429 ────────
      const artistReleasesList: Array<{ artist: any; releases: SpotifyAlbum[] }> = [];
      for (const { artist } of userFavorites) {
        if (!artist.spotifyId) continue;
        try {
          const releases = await this.getArtistReleases(artist.spotifyId);
          console.log(`[sync] ${artist.name} → ${releases.length} release(s) dans la fenêtre`);
          if (releases.length > 0) artistReleasesList.push({ artist, releases });
        } catch (err: any) {
          if (err?.response?.status === 429) {
            const retryAfter = err?.response?.headers?.['retry-after'];
            console.warn(`⚠️ Rate limit Spotify (429) après ${artistReleasesList.length} artiste(s). Retry-after: ${retryAfter}s.`);
            break;
          }
          console.error(`Erreur albums ${artist.name}:`, err?.message ?? err);
        }
        await new Promise(r => setTimeout(r, 300));
      }

      // ── Étape 2 : une seule requête DB pour savoir quelles releases existent ──
      const allSpotifyIds = artistReleasesList.flatMap(({ releases }) => releases.map(r => r.id));

      console.log(`[sync] ${allSpotifyIds.length} release(s) Spotify trouvée(s) au total`);

      if (allSpotifyIds.length === 0) {
        return { message: '0 nouvelles sorties synchronisées', releases: [] };
      }

      const existingRows = await prisma.release.findMany({
        where: { spotifyId: { in: allSpotifyIds } },
        select: { spotifyId: true },
      });
      const existingIds = new Set(existingRows.map(r => r.spotifyId));
      console.log(`[sync] ${existingIds.size} déjà en DB, ${allSpotifyIds.length - existingIds.size} nouvelle(s) à insérer`);

      // ── Étape 3 : fetch Deezer une seule fois par artiste qui a des nouveautés
      const artistsNeedingDeezer = artistReleasesList.filter(({ artist, releases }) =>
        artist.deezerId && releases.some(r => !existingIds.has(r.id))
      );

      const deezerAlbumsByArtistId = new Map<string, NormalizedDeezerAlbum[]>();

      await Promise.allSettled(
        artistsNeedingDeezer.map(async ({ artist }) => {
          try {
            const albums = await deezerService.getArtistAlbums(artist.deezerId!, 50);
            deezerAlbumsByArtistId.set(artist.id, albums);
          } catch {
            console.warn(`⚠️ Deezer indisponible pour ${artist.name}`);
          }
        })
      );

      // ── Étape 4 : upsert uniquement les nouvelles releases ────────────────────
      const newReleases: any[] = [];

      for (const { artist, releases } of artistReleasesList) {
        const deezerAlbums = deezerAlbumsByArtistId.get(artist.id) ?? [];

        for (const release of releases) {
          if (existingIds.has(release.id)) continue;

          // Matching Deezer par nom normalisé
          let deezerId: string | undefined;
          let deezerUrl: string | undefined;

          if (deezerAlbums.length > 0) {
            const normalized = this.normalizeName(release.name);
            const match = deezerAlbums.find(a => this.normalizeName(a.name) === normalized);
            if (match) {
              deezerId = match.deezerId;
              deezerUrl = match.deezerUrl;
              console.log(`✅ Deezer match: ${release.name}`);
            }
          }

          try {
            const newRelease = await prisma.release.upsert({
              where: { spotifyId: release.id },
              update: {
                deezerId,
                deezerUrl,
                imageUrl: release.images[0]?.url,
                spotifyUrl: release.external_urls.spotify,
                trackCount: release.total_tracks,
              },
              create: {
                spotifyId: release.id,
                deezerId,
                name: release.name,
                releaseType: this.mapAlbumType(release.album_type),
                releaseDate: new Date(release.release_date),
                imageUrl: release.images[0]?.url,
                spotifyUrl: release.external_urls.spotify,
                deezerUrl,
                trackCount: release.total_tracks,
                artistId: artist.id,
              },
            });

            newReleases.push(newRelease);
            this.maybeNotify(newRelease.id, release.release_date);
          } catch (error: any) {
            // Conflit deezerId → collaboration entre artistes
            if (error.code === 'P2002' && error.meta?.target?.includes('deezerId')) {
              console.log(`⚠️ Collaboration détectée, création sans deezerId : ${release.name}`);
              try {
                const newRelease = await prisma.release.create({
                  data: {
                    spotifyId: release.id,
                    name: release.name,
                    releaseType: this.mapAlbumType(release.album_type),
                    releaseDate: new Date(release.release_date),
                    imageUrl: release.images[0]?.url,
                    spotifyUrl: release.external_urls.spotify,
                    trackCount: release.total_tracks,
                    artistId: artist.id,
                  },
                });
                newReleases.push(newRelease);
                this.maybeNotify(newRelease.id, release.release_date);
              } catch (createError) {
                console.error(`Erreur création release sans deezerId: ${release.name}`, createError);
              }
            } else {
              console.error(`Erreur upsert release: ${release.name}`, error);
            }
          }
        }
      }

      console.log(`[sync] ✅ ${newReleases.length}/${allSpotifyIds.length - existingIds.size} release(s) insérée(s) en DB`);

      return {
        message: `${newReleases.length} nouvelles sorties synchronisées`,
        releases: newReleases,
      };
    } catch (error) {
      console.error('Erreur sync releases:', error);
      throw new Error('Erreur lors de la synchronisation des sorties');
    }
  }

  /** Synchronise les sorties d'un seul artiste (appelé après addToFavorites) */
  async syncReleasesForArtist(
    artist: { id: string; spotifyId: string | null; deezerId: string | null; name: string },
    userId?: string,
  ): Promise<void> {
    if (!artist.spotifyId) return;
    try {
      const releases = await this.getArtistReleases(artist.spotifyId);
      if (releases.length === 0) return;

      const existingRows = await prisma.release.findMany({
        where: { spotifyId: { in: releases.map(r => r.id) } },
        select: { spotifyId: true },
      });
      const existingIds = new Set(existingRows.map(r => r.spotifyId));
      const newReleases = releases.filter(r => !existingIds.has(r.id));
      if (newReleases.length === 0) return;

      let deezerAlbums: NormalizedDeezerAlbum[] = [];
      if (artist.deezerId) {
        try { deezerAlbums = await deezerService.getArtistAlbums(artist.deezerId, 50); } catch {}
      }

      for (const release of newReleases) {
        let deezerId: string | undefined;
        let deezerUrl: string | undefined;
        if (deezerAlbums.length > 0) {
          const match = deezerAlbums.find(a => this.normalizeName(a.name) === this.normalizeName(release.name));
          if (match) { deezerId = match.deezerId; deezerUrl = match.deezerUrl; }
        }
        try {
          const created = await prisma.release.upsert({
            where: { spotifyId: release.id },
            update: { deezerId, deezerUrl, imageUrl: release.images[0]?.url, spotifyUrl: release.external_urls.spotify, trackCount: release.total_tracks },
            create: {
              spotifyId: release.id, deezerId, name: release.name,
              releaseType: this.mapAlbumType(release.album_type),
              releaseDate: new Date(release.release_date),
              imageUrl: release.images[0]?.url, spotifyUrl: release.external_urls.spotify,
              deezerUrl, trackCount: release.total_tracks, artistId: artist.id,
            },
          });
          this.maybeNotify(created.id, release.release_date);
        } catch (err: any) {
          if (err.code === 'P2002' && err.meta?.target?.includes('deezerId')) {
            try {
              await prisma.release.create({
                data: {
                  spotifyId: release.id, name: release.name,
                  releaseType: this.mapAlbumType(release.album_type),
                  releaseDate: new Date(release.release_date),
                  imageUrl: release.images[0]?.url, spotifyUrl: release.external_urls.spotify,
                  trackCount: release.total_tracks, artistId: artist.id,
                },
              });
            } catch {}
          }
        }
      }
      console.log(`✅ Sync immédiat : ${newReleases.length} sortie(s) pour ${artist.name}`);
    } catch (err) {
      console.error(`❌ Sync immédiat échoué pour ${artist.name}:`, err);
    }
  }

  /** Envoie une notification si la sortie date de moins de 7 jours (fire-and-forget) */
  private maybeNotify(releaseId: string, releaseDateStr: string): void {
    const daysDiff = Math.floor(
      (Date.now() - new Date(releaseDateStr).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff >= 0 && daysDiff <= 7) {
      notificationService
        .sendNewReleaseNotifications(releaseId)
        .catch(e => console.error('Erreur envoi notification:', e));
    }
  }

  async getArtistReleases(spotifyArtistId: string, accessToken?: string): Promise<SpotifyAlbum[]> {
    const token = accessToken ?? await spotifyService.getAppToken();

    // Laisser remonter les erreurs (429 notamment) pour que l'appelant puisse réagir
    const { data } = await spotifyClient.get<{ items: SpotifyAlbum[] }>(
      `https://api.spotify.com/v1/artists/${spotifyArtistId}/albums`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { include_groups: 'album,single,compilation', limit: 50 },
      }
    );

    const threeMonthsAgo   = new Date(); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const threeMonthsAhead = new Date(); threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);

    return data.items.filter((album: SpotifyAlbum) => {
      const d = new Date(album.release_date);
      return d >= threeMonthsAgo && d <= threeMonthsAhead;
    });
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
