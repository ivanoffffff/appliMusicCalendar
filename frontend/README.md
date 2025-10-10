# Frontend - Music Tracker

Application web React permettant de suivre les sorties musicales de vos artistes favoris, avec une interface moderne et responsive.

## 📋 Table des matières

- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Structure du projet](#structure-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Lancement](#lancement)
- [Scripts disponibles](#scripts-disponibles)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Composants principaux](#composants-principaux)

## 🛠 Technologies utilisées

- **React** 19.x - Bibliothèque UI
- **TypeScript** 5.x - Typage statique
- **Vite** 7.x - Build tool et dev server ultra-rapide
- **React Router** 7.x - Gestion du routing
- **Tailwind CSS** 3.x - Framework CSS utility-first
- **Axios** - Client HTTP
- **React Hook Form** - Gestion des formulaires
- **Zod** - Validation des données
- **FullCalendar** - Calendrier interactif
- **Headless UI** - Composants UI accessibles
- **Heroicons** - Icônes

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Le backend en cours d'exécution (voir README backend)

## 📁 Structure du projet

```
frontend/
├── public/                # Fichiers statiques
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Header.tsx           # En-tête avec navigation
│   │   │   ├── LoadingSpinner.tsx   # Indicateur de chargement
│   │   │   └── ...
│   │   ├── artists/
│   │   │   ├── ArtistCard.tsx       # Carte d'artiste
│   │   │   ├── ArtistSearch.tsx     # Recherche d'artistes
│   │   │   └── FavoriteArtistCard.tsx
│   │   └── releases/
│   │       └── ReleaseCalendar.tsx  # Calendrier des sorties
│   ├── contexts/
│   │   ├── AuthContext.tsx          # Context d'authentification
│   │   └── ThemeContext.tsx         # Context thème sombre/clair
│   ├── pages/
│   │   ├── LoginPage.tsx            # Page de connexion
│   │   ├── RegisterPage.tsx         # Page d'inscription
│   │   ├── DashboardPage.tsx        # Tableau de bord
│   │   ├── ArtistsPage.tsx          # Gestion des artistes
│   │   └── ReleasesPage.tsx         # Calendrier des sorties
│   ├── services/
│   │   └── api.ts                   # Services API
│   ├── types/
│   │   └── index.ts                 # Types TypeScript
│   ├── App.tsx                      # Composant racine
│   ├── main.tsx                     # Point d'entrée
│   └── index.css                    # Styles globaux
├── .env                             # Variables d'environnement (à créer)
├── .env.example                     # Exemple de variables
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🚀 Installation

1. **Naviguer vers le dossier frontend** :
```bash
cd frontend
```

2. **Installer les dépendances** :
```bash
npm install
```

3. **Configurer les variables d'environnement** :
Créez un fichier `.env` à la racine du dossier frontend (voir section [Configuration](#configuration))

## ⚙️ Configuration

Créez un fichier `.env` à la racine du dossier `frontend/` avec les variables suivantes :

```env
# URL de l'API backend
VITE_API_URL=http://localhost:3001/api
```

**Important** : Les variables d'environnement dans Vite doivent commencer par `VITE_` pour être exposées au code client.

## 🎯 Lancement

### Mode développement (avec hot-reload)
```bash
npm run dev
```
L'application démarre sur `http://localhost:5173` (ou un autre port si 5173 est occupé)

### Mode production

```bash
# Compiler l'application
npm run build

# Prévisualiser la version de production
npm run preview
```

Les fichiers compilés se trouvent dans le dossier `dist/`.

## 📜 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Lance le serveur de développement Vite |
| `npm run build` | Compile l'application pour la production |
| `npm run preview` | Prévisualise la version de production |
| `npm run lint` | Vérifie le code avec ESLint |

## ✨ Fonctionnalités

### 🔐 Authentification

- **Inscription** : Création de compte avec validation des données
- **Connexion** : Authentification par email et mot de passe
- **Session persistante** : Token JWT stocké localement
- **Déconnexion** : Suppression sécurisée du token
- **Routes protégées** : Redirection automatique vers login si non authentifié

### 🎵 Gestion des artistes

- **Recherche d'artistes** : Recherche en temps réel via l'API Spotify
- **Affichage des résultats** : Cartes avec photo, nom, genres et popularité
- **Ajout aux favoris** : Un clic pour suivre un artiste
- **Liste des favoris** : Visualisation de tous vos artistes favoris
- **Suppression** : Retirer un artiste de vos favoris

### 📅 Calendrier des sorties

- **Vue calendrier** : Visualisation mensuelle des sorties
- **Vue liste** : Liste chronologique des sorties
- **Synchronisation** : Récupération automatique des nouvelles sorties
- **Filtrage par période** : Affichage par mois/semaine
- **Détails des sorties** : Type (album/single/EP), date, image
- **Lien Spotify** : Accès direct à la sortie sur Spotify

### 🎨 Thème

- **Mode sombre / clair** : Basculement entre les deux thèmes
- **Persistance** : Le thème choisi est sauvegardé
- **Design moderne** : Interface élégante avec dégradés et animations

### 📱 Responsive Design

- **Mobile-first** : Interface adaptée aux mobiles
- **Tablettes** : Optimisé pour les écrans moyens
- **Desktop** : Expérience complète sur grand écran

## 🏗 Architecture

### Routing

L'application utilise React Router avec les routes suivantes :

- `/login` - Page de connexion (publique)
- `/register` - Page d'inscription (publique)
- `/dashboard` - Tableau de bord (protégée)
- `/artists` - Gestion des artistes (protégée)
- `/releases` - Calendrier des sorties (protégée)
- `/` - Redirection vers `/dashboard`

### Context API

#### AuthContext
Gère l'état d'authentification global :
- État de connexion
- Informations utilisateur
- Login / Logout / Register
- Vérification du token

#### ThemeContext
Gère le thème de l'application :
- Mode sombre / clair
- Persistance dans localStorage
- Application des classes Tailwind

### Services API

Le fichier `services/api.ts` centralise toutes les requêtes :

```typescript
// Exemple d'utilisation
import { authService, artistService } from './services/api';

// Connexion
const response = await authService.login({ email, password });

// Recherche d'artistes
const artists = await artistService.searchArtists('Daft Punk');

// Ajouter aux favoris
await artistService.addToFavorites(spotifyId);
```

Tous les services incluent :
- Gestion automatique des tokens JWT
- Intercepteurs pour les erreurs 401
- Types TypeScript stricts

## 🧩 Composants principaux

### Pages

#### LoginPage
- Formulaire de connexion
- Validation avec React Hook Form et Zod
- Gestion des erreurs
- Lien vers l'inscription

#### RegisterPage
- Formulaire d'inscription
- Validation complète des champs
- Création de compte
- Lien vers la connexion

#### DashboardPage
- Résumé des artistes favoris
- Prochaines sorties
- Statistiques
- Bouton de synchronisation

#### ArtistsPage
- Barre de recherche
- Résultats de recherche
- Liste des favoris
- Ajout/Suppression d'artistes

#### ReleasesPage
- Calendrier FullCalendar
- Vue mensuelle/hebdomadaire/liste
- Synchronisation des sorties
- Filtres et navigation

### Composants UI

#### Header
- Navigation principale
- Informations utilisateur
- Bouton de déconnexion
- Toggle thème
- Menu mobile responsive

#### LoadingSpinner
- Indicateur de chargement
- Multiple tailles (sm, md, lg, xl)
- Animations musicales

#### ArtistCard
- Affichage d'un artiste
- Image, nom, genres
- Bouton d'action (ajouter/retirer)
- Design responsive

#### ReleaseCalendar
- Calendrier interactif FullCalendar
- Événements cliquables
- Badges par type de sortie
- Responsive

## 🎨 Styling avec Tailwind

L'application utilise un système de design cohérent :

### Couleurs principales

```css
/* Thème clair */
primary: bleu (#3b82f6)
secondary: gris
accent: violet (#8b5cf6)

/* Thème sombre */
primary: bleu clair
secondary: gris clair
accent: violet clair
```

### Classes utilitaires personnalisées

- `shadow-glow` : Effet de lueur
- `gradient-primary` : Dégradé principal
- Animations : `fade-in`, `slide-up`, `pulse`

### Responsive Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🔐 Gestion de l'authentification

### Stockage du token

```typescript
// Sauvegarde après login
localStorage.setItem('accessToken', token);
localStorage.setItem('user', JSON.stringify(user));

// Lecture au chargement
const token = localStorage.getItem('accessToken');
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Suppression à la déconnexion
localStorage.removeItem('accessToken');
localStorage.removeItem('user');
```

### Protection des routes

```typescript
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  return isAuthenticated ? children : <Navigate to="/login" />;
};
```

### Intercepteur Axios

```typescript
// Ajout du token automatique
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Gestion des erreurs d'auth
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Déconnexion automatique
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 🐛 Débogage

### Outils de développement

- **React DevTools** : Extension pour inspecter les composants
- **Redux DevTools** : Pas utilisé dans ce projet
- **Console logs** : Activés en mode développement

### Problèmes courants

**Erreur : Cannot connect to backend**
- Vérifiez que le backend tourne sur le port 3001
- Vérifiez la variable `VITE_API_URL` dans `.env`

**Erreur : CORS policy**
- Vérifiez la configuration CORS du backend
- L'origine du frontend doit être autorisée

**Erreur : Token expired**
- Le token JWT expire après un certain temps
- L'utilisateur est automatiquement déconnecté
- Reconnectez-vous pour obtenir un nouveau token

**Build errors avec Tailwind**
```bash
# Régénérer les fichiers Tailwind
npx tailwindcss -i ./src/index.css -o ./dist/output.css
```

## 🚀 Optimisations

### Performance

- **Code splitting** : Routes chargées à la demande
- **Lazy loading** : Images chargées progressivement
- **Memoization** : React.memo pour composants fréquents
- **Debouncing** : Recherche d'artistes avec délai

### SEO

- Balises meta configurables
- Titre dynamique par page
- Structure HTML sémantique

### Accessibilité

- Composants Headless UI accessibles
- Navigation au clavier
- Labels ARIA
- Contraste des couleurs conforme WCAG

## 📱 Progressive Web App (future)

L'application peut être transformée en PWA avec :
- Service Worker pour cache offline
- Manifest.json pour installation
- Notifications push

## 📝 Bonnes pratiques

- ✅ TypeScript strict
- ✅ Composants fonctionnels avec hooks
- ✅ Props typées
- ✅ Gestion d'erreurs complète
- ✅ Loading states
- ✅ Code splitting
- ✅ Responsive design
- ✅ Accessibilité

## 📝 Licence

MIT