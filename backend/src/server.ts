import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import artistRoutes from './routes/artists';
import releaseRoutes from './routes/releases';
import notificationRoutes from './routes/notificationRoutes';  // 🆕 AJOUT
import cronService from './services/cronService';  // 🆕 AJOUT

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173'];

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: (origin, callback) => {
    // Permettre les requêtes sans origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    message: 'Music Tracker API is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Routes pour les artistes
app.use('/api/artists', artistRoutes);

// Routes pour les sorties musicales
app.use('/api/releases', releaseRoutes);

// 🆕 NOUVEAU : Routes pour les notifications
app.use('/api/notifications', notificationRoutes);

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
  console.log(`🔒 CORS enabled for: ${allowedOrigins.join(', ')}`);
  console.log(`📚 Endpoints available:`);
  console.log(`   Auth: POST/GET /api/auth/*`);
  console.log(`   Artists: GET /api/artists/*`);
  console.log(`   Releases: GET/POST /api/releases/*`);
  console.log(`   Notifications: GET/POST /api/notifications/*`);  // 🆕 AJOUT
  
  // 🆕 NOUVEAU : Initialiser le service cron pour les tâches planifiées
  cronService.init();
});