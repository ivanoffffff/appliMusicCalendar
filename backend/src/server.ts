import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import artistRoutes from './routes/artists';
import releaseRoutes from './routes/releases';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Music Tracker API is running!', 
    timestamp: new Date().toISOString() 
  });
});

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Routes pour les artistes
app.use('/api/artists', artistRoutes);

// Routes pour les sorties musicales
app.use('/api/releases', releaseRoutes);

// Gestion des erreurs globales
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur interne'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Endpoints available:`);
  console.log(`   Auth: POST/GET /api/auth/*`);
  console.log(`   Artists: GET /api/artists/*`);
  console.log(`   Releases: GET/POST /api/releases/*`);
});