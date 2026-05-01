import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth';
import spotifyUserService from '../services/spotifyUserService';
import prisma from '../config/database';

const router = Router();

const JWT_SECRET    = process.env.JWT_ACCESS_SECRET!;
const FRONTEND_URL  = process.env.FRONTEND_URL || 'http://localhost:5173';
const CALLBACK_PAGE = `${FRONTEND_URL}/spotify-callback`;

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/spotify/auth-url
// Renvoie l'URL de consentement Spotify. Requiert le JWT de l'utilisateur.
// Le userId est encodé dans le `state` (signé, expire dans 10 min) → CSRF safe.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/auth-url', authenticateToken, (req: Request, res: Response) => {
  try {
    const state = jwt.sign({ userId: req.user!.userId }, JWT_SECRET, { expiresIn: '10m' });
    const url   = spotifyUserService.getAuthorizationUrl(state);
    res.json({ success: true, url });
  } catch {
    res.status(500).json({ success: false, message: 'Erreur lors de la génération de l\'URL OAuth' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/spotify/callback
// Point de retour après le consentement Spotify.
// Échange le code, stocke les tokens, redirige vers le frontend.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query as {
    code?: string; state?: string; error?: string;
  };

  if (error) {
    return res.redirect(`${CALLBACK_PAGE}?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return res.redirect(`${CALLBACK_PAGE}?error=missing_params`);
  }

  try {
    const { userId } = jwt.verify(state, JWT_SECRET) as { userId: string };
    const token      = await spotifyUserService.exchangeCode(code);
    await spotifyUserService.saveToken(userId, token);

    console.log(`✅ Spotify connecté pour l'utilisateur ${userId}`);
    return res.redirect(`${CALLBACK_PAGE}?success=true`);
  } catch (err) {
    console.error('❌ Spotify callback error:', err);
    return res.redirect(`${CALLBACK_PAGE}?error=auth_failed`);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/spotify/status
// Indique si l'utilisateur a connecté son compte Spotify.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const connected = await spotifyUserService.isConnected(req.user!.userId);
    res.json({ success: true, connected });
  } catch {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/spotify/import-following
// Récupère les artistes suivis sur Spotify et les ajoute aux favoris.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/import-following', authenticateToken, async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  try {
    const followedArtists = await spotifyUserService.getFollowedArtists(userId);

    let imported = 0;
    let skipped  = 0;
    const failed: string[] = [];

    for (const sa of followedArtists) {
      try {
        // Upsert artiste
        const artist = await prisma.artist.upsert({
          where:  { spotifyId: sa.id },
          update: {
            name:       sa.name,
            imageUrl:   sa.images[0]?.url,
            popularity: sa.popularity,
            followers:  sa.followers.total,
            genres:     JSON.stringify(sa.genres),
          },
          create: {
            spotifyId:  sa.id,
            name:       sa.name,
            genres:     JSON.stringify(sa.genres),
            imageUrl:   sa.images[0]?.url,
            popularity: sa.popularity,
            followers:  sa.followers.total,
          },
        });

        // Ajouter aux favoris si pas déjà présent
        const existing = await prisma.userFavorite.findUnique({
          where: { userId_artistId: { userId, artistId: artist.id } },
        });

        if (!existing) {
          await prisma.userFavorite.create({
            data: { userId, artistId: artist.id },
          });
          imported++;
        } else {
          skipped++;
        }
      } catch (err) {
        console.error(`Erreur import artiste ${sa.name}:`, err);
        failed.push(sa.name);
      }
    }

    res.json({
      success:  true,
      message:  `${imported} artiste(s) importé(s), ${skipped} déjà en favoris`,
      imported,
      skipped,
      total:    followedArtists.length,
      ...(failed.length > 0 && { failed }),
    });
  } catch (err: any) {
    if (err.message === 'Compte Spotify non connecté') {
      return res.status(400).json({ success: false, message: err.message });
    }
    console.error('❌ Import following error:', err);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'import des artistes' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/spotify/disconnect
// Supprime le token Spotify de l'utilisateur.
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/disconnect', authenticateToken, async (req: Request, res: Response) => {
  try {
    await spotifyUserService.disconnect(req.user!.userId);
    res.json({ success: true, message: 'Compte Spotify déconnecté avec succès' });
  } catch {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

export default router;
