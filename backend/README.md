# Backend - Music Tracker API

API REST Node.js/TypeScript pour l'application Music Tracker, permettant de gérer les utilisateurs, les artistes favoris et les sorties musicales via l'API Spotify.

## 📋 Table des matières

- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancement](#lancement)
- [Scripts disponibles](#scripts-disponibles)
- [API Endpoints](#api-endpoints)
- [Base de données](#base-de-données)
- [Architecture](#architecture)

## 🛠 Technologies utilisées

- **Node.js** >= 18.x
- **TypeScript** 5.x
- **Express** 5.x - Framework web
- **Prisma** 6.x - ORM pour la gestion de la base de données
- **SQLite** - Base de données (développement)
- **JWT** - Authentification par tokens
- **bcryptjs** - Hashage des mots de passe
- **Axios** - Client HTTP pour l'API Spotify
- **Zod** - Validation des données
- **Helmet** - Sécurité HTTP
- **CORS** - Gestion des requêtes cross-origin
- **Front** - Vercel
- **Back** - Render
- **BDD** - Neon
- **Uptime** - uptimerobot

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Un compte Spotify Developer pour obtenir les clés API

## 📁 Structure du projet

```
backend/
├── prisma/
│   ├── schema.prisma      # Schéma de la base de données
│   ├── dev.db             # Base SQLite (généré)
│   └── migrations/        # Migrations Prisma
├── src/
│   ├── config/
│   │   └── database.ts    # Configuration Prisma
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── artistController.ts
│   │   └── releaseController.ts
│   ├── middleware/
│   │   └── auth.ts        # Middleware d'authentification JWT
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── artists.ts
│   │   └── releases.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── artistService.ts
│   │   ├── releaseService.ts
│   │   └── spotifyService.ts
│   ├── types/
│   │   ├── auth.ts
│   │   └── spotify.ts
│   ├── server.ts          # Point d'entrée de l'application
│   └── test-db.ts         # Script de test de connexion DB
├── .env                   # Variables d'environnement (à créer)
├── .env.example           # Exemple de variables d'environnement
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Installation

1. **Cloner le dépôt et naviguer vers le dossier backend** :
```bash
cd backend
```

2. **Installer les dépendances** :
```bash
npm install
```

3. **Configurer les variables d'environnement** :
Créez un fichier `.env` à la racine du dossier backend (voir section [Configuration](#configuration))

4. **Générer le client Prisma** :
```bash
npx prisma generate
```

5. **Créer la base de données et exécuter les migrations** :
```bash
npx prisma migrate dev --name init
```

## ⚙️ Configuration

Créez un fichier `.env` à la racine du dossier `backend/` avec les variables suivantes :

```env
# Port du serveur
PORT=3001

# Base de données
DATABASE_URL="file:./dev.db"

# JWT Secrets (générez des chaînes aléatoires sécurisées)
JWT_ACCESS_SECRET="votre_secret_access_token_très_sécurisé"
JWT_REFRESH_SECRET="votre_secret_refresh_token_très_sécurisé"

# Spotify API
SPOTIFY_CLIENT_ID="votre_client_id_spotify"
SPOTIFY_CLIENT_SECRET="votre_client_secret_spotify"

# Environnement
NODE_ENV="development"
```

### Obtenir les clés Spotify :

1. Allez sur [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Créez une nouvelle application
3. Récupérez le `Client ID` et le `Client Secret`
4. Ajoutez-les dans votre fichier `.env`

### Générer les secrets JWT :

Vous pouvez générer des secrets aléatoires avec Node.js :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🎯 Lancement

### Mode développement (avec hot-reload)
```bash
npm run dev
```
Le serveur démarre sur `http://localhost:3001`

### Mode production
```bash
# Compiler le TypeScript
npm run build

# Lancer l'application compilée
npm start
```

### Tester la connexion à la base de données
```bash
npm run db:test
```

## 📜 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Lance le serveur en mode développement avec nodemon |
| `npm run build` | Compile le TypeScript en JavaScript |
| `npm start` | Lance l'application compilée (production) |
| `npm run db:test` | Teste la connexion à la base de données |
| `npm run db:studio` | Ouvre Prisma Studio (interface graphique pour la DB) |
| `npm run db:reset` | Réinitialise la base de données |

## 🔌 API Endpoints

### Authentification (`/api/auth`)

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/auth/register` | Créer un nouveau compte | Non |
| POST | `/auth/login` | Se connecter | Non |
| GET | `/auth/me` | Récupérer le profil utilisateur | Oui |

**Exemple de requête - Inscription** :
```json
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "motdepasse123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Exemple de requête - Connexion** :
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

### Artistes (`/api/artists`)

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| GET | `/artists/search?q=query&limit=20` | Rechercher des artistes | Oui |
| POST | `/artists/favorites` | Ajouter un artiste aux favoris | Oui |
| GET | `/artists/favorites` | Récupérer les artistes favoris | Oui |
| DELETE | `/artists/favorites/:artistId` | Retirer un artiste des favoris | Oui |
| GET | `/artists/test-spotify` | Tester la connexion Spotify | Oui |

**Exemple de requête - Recherche d'artistes** :
```bash
GET /api/artists/search?q=Daft%20Punk&limit=10
Authorization: Bearer <votre_token>
```

**Exemple de requête - Ajouter aux favoris** :
```json
POST /api/artists/favorites
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "spotifyId": "4tZwfgrHOc3mvqYlEYSvVi",
  "category": "default"
}
```

### Sorties musicales (`/api/releases`)

| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/releases/sync` | Synchroniser les sorties des artistes favoris | Oui |
| GET | `/releases?startDate=...&endDate=...` | Récupérer les sorties | Oui |

**Exemple de requête - Synchronisation** :
```bash
POST /api/releases/sync
Authorization: Bearer <votre_token>
```

## 🗄️ Base de données

### Schéma Prisma

L'application utilise SQLite en développement avec le schéma suivant :

#### Modèles principaux :

- **User** : Utilisateurs de l'application
  - `id`, `email`, `username`, `password`, `firstName`, `lastName`
  - Relations : `favorites`, `spotifyToken`

- **Artist** : Artistes musicaux
  - `id`, `spotifyId`, `name`, `genres`, `imageUrl`
  - Relations : `favorites`, `releases`

- **UserFavorite** : Table de liaison pour les favoris
  - `id`, `userId`, `artistId`, `category`, `addedAt`

- **Release** : Sorties musicales (albums, singles, EP)
  - `id`, `spotifyId`, `name`, `releaseType`, `releaseDate`, `imageUrl`, `spotifyUrl`, `trackCount`, `artistId`

- **SpotifyToken** : Tokens d'accès Spotify (pour future extension OAuth)

### Commandes Prisma utiles

```bash
# Ouvrir Prisma Studio (interface graphique)
npx prisma studio

# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Réinitialiser la base de données
npx prisma migrate reset

# Générer le client Prisma après modification du schéma
npx prisma generate

# Formater le schéma Prisma
npx prisma format
```

## 🏗 Architecture

### Couches de l'application

1. **Routes** (`src/routes/`) : Définition des endpoints et association avec les contrôleurs
2. **Controllers** (`src/controllers/`) : Gestion des requêtes HTTP, validation et réponses
3. **Services** (`src/services/`) : Logique métier et interactions avec la base de données
4. **Middleware** (`src/middleware/`) : Authentification, validation, gestion des erreurs
5. **Config** (`src/config/`) : Configuration de Prisma et autres services

### Flux d'authentification

1. L'utilisateur envoie ses identifiants à `/auth/login`
2. Le mot de passe est vérifié avec bcrypt
3. Un JWT access token est généré et renvoyé
4. Le client stocke le token et l'envoie dans le header `Authorization: Bearer <token>`
5. Le middleware `authenticateToken` vérifie le token sur les routes protégées

### Intégration Spotify

- **SpotifyService** gère l'authentification avec l'API Spotify via Client Credentials Flow
- Les tokens Spotify sont renouvelés automatiquement
- Les artistes sont recherchés via l'API Spotify puis stockés en base de données
- Les sorties musicales sont récupérées périodiquement pour chaque artiste favori

## 🔐 Sécurité

- **Hashage des mots de passe** : bcryptjs avec salt rounds
- **JWT** : Tokens sécurisés avec expiration
- **Helmet** : Protection contre les vulnérabilités courantes
- **CORS** : Configuration stricte des origines autorisées
- **Validation** : Zod pour valider toutes les entrées utilisateur

## 🐛 Débogage

### Logs de développement

En mode développement, Prisma affiche les requêtes SQL :
```typescript
log: ['query', 'error', 'warn']
```

### Problèmes courants

**Erreur : Port 3001 déjà utilisé**
```bash
# Trouver le processus
lsof -i :3001
# Tuer le processus
kill -9 <PID>
```

**Erreur Prisma : Schema not found**
```bash
npx prisma generate
npx prisma migrate dev
```

**Erreur Spotify : Invalid credentials**
- Vérifiez que `SPOTIFY_CLIENT_ID` et `SPOTIFY_CLIENT_SECRET` sont corrects dans `.env`

## 📝 Licence

MIT
