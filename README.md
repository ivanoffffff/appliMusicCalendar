# 🎵 Music Tracker

Application web moderne permettant de suivre les sorties musicales de vos artistes favoris grâce à l'intégration de l'API Spotify. Recevez des notifications sur les nouveaux albums, singles et EP de vos artistes préférés dans un calendrier interactif.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation complète](#installation-complète)
- [Configuration](#configuration)
- [Lancement de l'application](#lancement-de-lapplication)
- [Structure du projet](#structure-du-projet)
- [Documentation détaillée](#documentation-détaillée)
- [Utilisation](#utilisation)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Contribution](#contribution)
- [Roadmap](#roadmap)
- [Licence](#licence)

## 🎯 Aperçu

Music Tracker est une application full-stack qui vous permet de :
- 🔍 Rechercher et suivre vos artistes musicaux favoris
- 📅 Visualiser les sorties à venir dans un calendrier interactif
- 🔔 Recevoir des notifications pour les nouvelles sorties
- 🎨 Profiter d'une interface moderne avec thème sombre/clair
- 📱 Accéder à l'application sur tous vos appareils (responsive)

## ✨ Fonctionnalités principales

### Authentification sécurisée
- Inscription et connexion avec JWT
- Gestion de session persistante
- Protection des routes et des données

### Gestion des artistes
- Recherche en temps réel via l'API Spotify
- Ajout/suppression d'artistes favoris
- Informations complètes (genres, popularité, image)
- Catégorisation personnalisable

### Calendrier des sorties
- Vue mensuelle, hebdomadaire et liste
- Synchronisation automatique avec Spotify
- Filtrage par date et type de sortie
- Liens directs vers Spotify
- Badge par type (Album, Single, EP)

### Interface utilisateur
- Design moderne et épuré
- Thème sombre et clair
- Animations fluides
- Responsive design (mobile, tablette, desktop)
- Accessibilité WCAG

## 🏗 Architecture

```
Music Tracker
│
├── Backend (API REST)
│   ├── Node.js + Express
│   ├── TypeScript
│   ├── Prisma ORM
│   ├── SQLite Database
│   └── API Spotify Integration
│
└── Frontend (SPA)
    ├── React 19
    ├── TypeScript
    ├── Vite
    ├── Tailwind CSS
    └── React Router
```

### Flux de données

```
User → Frontend (React)
        ↓
    API Request (Axios)
        ↓
Backend (Express) → Spotify API
        ↓
    Database (Prisma + SQLite)
        ↓
    Response → Frontend
        ↓
    UI Update
```

## 🛠 Technologies

### Backend
- **Runtime** : Node.js 18+
- **Framework** : Express 5.x
- **Langage** : TypeScript 5.x
- **ORM** : Prisma 6.x
- **Database** : SQLite (dev), PostgreSQL (prod recommandé)
- **Auth** : JWT (jsonwebtoken)
- **Sécurité** : bcryptjs, Helmet, CORS
- **Validation** : Zod
- **HTTP Client** : Axios

### Frontend
- **Framework** : React 19.x
- **Langage** : TypeScript 5.x
- **Build Tool** : Vite 7.x
- **Routing** : React Router 7.x
- **Styling** : Tailwind CSS 3.x
- **Forms** : React Hook Form + Zod
- **HTTP Client** : Axios
- **Calendar** : FullCalendar
- **UI Components** : Headless UI
- **Icons** : Heroicons

### API externe
- **Spotify Web API** : Recherche d'artistes et récupération des sorties

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

### Logiciels requis
- **Node.js** >= 18.0.0 (avec npm)
- **Git** (pour cloner le dépôt)
- Un éditeur de code (VS Code recommandé)

### Comptes et clés API
- **Compte Spotify Developer** (gratuit)
  - Créez une application sur [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
  - Récupérez le `Client ID` et le `Client Secret`

### Vérification des versions

```bash
# Vérifier Node.js
node --version  # Doit être >= 18.0.0

# Vérifier npm
npm --version   # Doit être >= 9.0.0

# Vérifier Git
git --version
```

## 🚀 Installation complète

### 1. Cloner le dépôt

```bash
git clone https://github.com/ivanoffffff/appliMusicCalendar.git
cd appliMusicCalendar
```

### 2. Installation du Backend

```bash
# Naviguer vers le dossier backend
cd backend

# Installer les dépendances
npm install

# Générer le client Prisma
npx prisma generate

# Créer la base de données et exécuter les migrations
npx prisma migrate dev --name init

# Retour à la racine
cd ..
```

### 3. Installation du Frontend

```bash
# Naviguer vers le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Retour à la racine
cd ..
```

## ⚙️ Configuration

### Configuration du Backend

Créez un fichier `.env` dans le dossier `backend/` :

```env
# Port du serveur
PORT=3001

# Base de données
DATABASE_URL="file:./dev.db"

# JWT Secrets (générez des chaînes aléatoires sécurisées)
JWT_ACCESS_SECRET="votre_secret_access_token_très_long_et_sécurisé"
JWT_REFRESH_SECRET="votre_secret_refresh_token_très_long_et_sécurisé"

# Spotify API (récupérez vos clés sur https://developer.spotify.com/dashboard)
SPOTIFY_CLIENT_ID="votre_spotify_client_id"
SPOTIFY_CLIENT_SECRET="votre_spotify_client_secret"

# Environnement
NODE_ENV="development"
```

#### Générer les secrets JWT

Utilisez cette commande pour générer des secrets aléatoires sécurisés :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Obtenir les clés Spotify

1. Allez sur [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Cliquez sur "Create an App"
3. Remplissez les informations de l'application
4. Copiez le `Client ID` et le `Client Secret`
5. Ajoutez-les dans votre fichier `.env`

### Configuration du Frontend

Créez un fichier `.env` dans le dossier `frontend/` :

```env
# URL de l'API backend
VITE_API_URL=http://localhost:3001/api
```

**Note** : Si vous déployez l'application, remplacez par l'URL de votre API en production.

## 🎯 Lancement de l'application

### Option 1 : Lancement manuel (2 terminaux)

#### Terminal 1 - Backend

```bash
cd backend
npm run dev
```

Le backend démarre sur `http://localhost:3001`

#### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

### Option 2 : Script de lancement (futur)

Vous pouvez créer un script `start.sh` à la racine :

```bash
#!/bin/bash

# Lancer le backend en arrière-plan
cd backend && npm run dev &

# Lancer le frontend en arrière-plan
cd frontend && npm run dev &

# Attendre et afficher les logs
wait
```

Puis lancer avec :
```bash
chmod +x start.sh
./start.sh
```

### Accéder à l'application

Une fois les deux serveurs lancés :
- **Frontend** : Ouvrez [http://localhost:5173](http://localhost:5173)
- **Backend API** : Disponible sur [http://localhost:3001](http://localhost:3001)
- **Prisma Studio** : `cd backend && npx prisma studio` (interface DB graphique)

## 📁 Structure du projet

```
appliMusicCalendar/
│
├── backend/                    # API REST Node.js
│   ├── prisma/
│   │   ├── schema.prisma      # Schéma de la base de données
│   │   ├── dev.db             # Base SQLite (généré)
│   │   └── migrations/        # Migrations
│   ├── src/
│   │   ├── config/            # Configuration (DB, etc.)
│   │   ├── controllers/       # Contrôleurs des routes
│   │   ├── middleware/        # Middleware (auth, etc.)
│   │   ├── routes/            # Définition des routes
│   │   ├── services/          # Logique métier
│   │   ├── types/             # Types TypeScript
│   │   └── server.ts          # Point d'entrée
│   ├── .env                   # Variables d'environnement
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Application React
│   ├── public/                # Fichiers statiques
│   ├── src/
│   │   ├── components/        # Composants React
│   │   │   ├── ui/           # Composants UI réutilisables
│   │   │   ├── artists/      # Composants liés aux artistes
│   │   │   └── releases/     # Composants liés aux sorties
│   │   ├── contexts/          # React Context (Auth, Theme)
│   │   ├── pages/             # Pages de l'application
│   │   ├── services/          # Services API
│   │   ├── types/             # Types TypeScript
│   │   ├── App.tsx            # Composant racine
│   │   ├── main.tsx           # Point d'entrée
│   │   └── index.css          # Styles globaux
│   ├── .env                   # Variables d'environnement
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── .gitignore
├── README.md                   # Ce fichier
└── LICENSE
```

## 📚 Documentation détaillée

Pour plus d'informations sur chaque partie du projet, consultez :

- [📘 README Backend](./backend/README.md) - Documentation complète de l'API
- [📗 README Frontend](./frontend/README.md) - Documentation de l'interface utilisateur

## 🎮 Utilisation

### 1. Créer un compte

1. Ouvrez l'application sur `http://localhost:5173`
2. Cliquez sur "S'inscrire"
3. Remplissez le formulaire (email, username, mot de passe)
4. Validez votre inscription

### 2. Se connecter

1. Utilisez vos identifiants pour vous connecter
2. Vous êtes redirigé vers le dashboard

### 3. Ajouter des artistes favoris

1. Allez dans la section "Artistes"
2. Utilisez la barre de recherche pour trouver un artiste
3. Cliquez sur "Ajouter aux favoris"
4. L'artiste apparaît dans votre liste de favoris

### 4. Synchroniser les sorties

1. Allez dans la section "Calendrier"
2. Cliquez sur "Synchroniser les sorties"
3. Les nouvelles sorties de vos artistes favoris s'affichent dans le calendrier

### 5. Consulter les sorties

- **Vue calendrier** : Visualisez les sorties par mois
- **Vue liste** : Liste chronologique des sorties
- Cliquez sur une sortie pour voir les détails
- Cliquez sur "Écouter sur Spotify" pour ouvrir Spotify

## 🔌 API Endpoints

### Authentification

```
POST   /api/auth/register    Créer un compte
POST   /api/auth/login       Se connecter
GET    /api/auth/me          Profil utilisateur (auth requise)
```

### Artistes

```
GET    /api/artists/search?q=...      Rechercher des artistes (auth requise)
POST   /api/artists/favorites         Ajouter aux favoris (auth requise)
GET    /api/artists/favorites         Liste des favoris (auth requise)
DELETE /api/artists/favorites/:id     Retirer des favoris (auth requise)
```

### Sorties musicales

```
POST   /api/releases/sync                Synchroniser les sorties (auth requise)
GET    /api/releases?startDate=...       Récupérer les sorties (auth requise)
```

### Format des réponses

Toutes les réponses de l'API suivent ce format :

```json
{
  "success": true,
  "message": "Message descriptif",
  "data": { ... },
  "total": 10
}
```

## 📸 Screenshots

### Page de connexion
*Interface de connexion moderne avec validation des champs*

### Dashboard
*Vue d'ensemble avec statistiques et prochaines sorties*

### Recherche d'artistes
*Recherche en temps réel avec résultats Spotify*

### Calendrier des sorties
*Calendrier interactif avec filtres et badges*

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

### 1. Fork le projet

```bash
git clone https://github.com/votre-username/appliMusicCalendar.git
cd appliMusicCalendar
```

### 2. Créer une branche

```bash
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### 3. Faire vos modifications

- Respectez les conventions de code existantes
- Ajoutez des tests si nécessaire
- Commentez le code complexe
- Mettez à jour la documentation

### 4. Commit et Push

```bash
git add .
git commit -m "feat: ajout de la fonctionnalité X"
git push origin feature/ma-nouvelle-fonctionnalite
```

### 5. Créer une Pull Request

- Décrivez vos modifications
- Ajoutez des captures d'écran si pertinent
- Référencez les issues liées

### Conventions de commit

Utilisez les préfixes suivants :
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `style:` Formatage, style
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Maintenance

## 🗺 Roadmap

### Version 1.1 (en cours)
- [ ] Notifications push pour nouvelles sorties
- [ ] Export du calendrier (iCal)
- [ ] Partage de listes d'artistes
- [ ] Mode hors ligne (PWA)

### Version 1.2 (prévu)
- [ ] Statistiques détaillées
- [ ] Recommandations d'artistes
- [ ] Playlists automatiques
- [ ] Intégration Apple Music

### Version 2.0 (futur)
- [ ] Application mobile native
- [ ] OAuth Spotify complet
- [ ] Notifications email personnalisables
- [ ] API publique
- [ ] Mode multi-utilisateurs / équipes

## 🐛 Problèmes connus

### Backend ne démarre pas
- Vérifiez que le port 3001 n'est pas utilisé
- Vérifiez les variables d'environnement dans `.env`
- Assurez-vous que Prisma est bien configuré : `npx prisma generate`

### Erreur de connexion Spotify
- Vérifiez vos clés `SPOTIFY_CLIENT_ID` et `SPOTIFY_CLIENT_SECRET`
- Assurez-vous que les clés sont valides sur le Dashboard Spotify

### Frontend ne se connecte pas au backend
- Vérifiez que `VITE_API_URL` pointe vers le bon port
- Vérifiez que le backend est bien démarré
- Vérifiez la configuration CORS du backend

## 🔒 Sécurité

- Les mots de passe sont hashés avec bcrypt (10 rounds)
- JWT avec expiration pour l'authentification
- Helmet.js pour les headers de sécurité
- Validation stricte avec Zod
- CORS configuré pour autoriser uniquement le frontend

**⚠️ Important en production** :
- Changez tous les secrets dans `.env`
- Utilisez PostgreSQL au lieu de SQLite
- Configurez HTTPS
- Activez les rate limits
- Utilisez des variables d'environnement sécurisées

## 📊 Performance

### Backend
- Connexion Prisma réutilisée
- Cache des tokens Spotify
- Requêtes optimisées avec `include`

### Frontend
- Code splitting automatique avec Vite
- Lazy loading des images
- Debouncing sur la recherche
- Memoization avec React.memo

## 🧪 Tests

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

*Note : Les tests sont en cours de développement*

## 📝 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Auteur

**Ivan COCUSSE**
- GitHub: [@ivanoffffff](https://github.com/ivanoffffff)

## 🙏 Remerciements

- [Spotify Web API](https://developer.spotify.com/documentation/web-api/) pour l'accès aux données musicales
- [Prisma](https://www.prisma.io/) pour l'ORM excellent
- [Tailwind CSS](https://tailwindcss.com/) pour le framework CSS
- [FullCalendar](https://fullcalendar.io/) pour le composant calendrier

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez la documentation
2. Consultez les [Issues GitHub](https://github.com/ivanoffffff/appliMusicCalendar/issues)
3. Ouvrez une nouvelle issue si nécessaire

---

**⭐ Si vous aimez ce projet, n'hésitez pas à mettre une étoile sur GitHub !**