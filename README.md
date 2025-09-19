# Music Tracker

Music Tracker est une application web permettant de suivre les sorties musicales, gérer ses artistes favoris et consulter les nouveautés.

## Structure du projet

- `backend/` : API Node.js/TypeScript avec Prisma pour la gestion des données.
- `frontend/` : Application React + Vite pour l'interface utilisateur.

## Prérequis

- Node.js >= 18
- npm ou yarn
- (optionnel) Docker pour la base de données

## Installation

1. Clone le dépôt :
	```bash
	git clone https://github.com/ivanoffffff/appliMusicCalendar.git
	cd appliMusicCalendar
	```
2. Installe les dépendances :
	```bash
	cd backend && npm install
	cd ../frontend && npm install
	```
3. Configure la base de données dans `backend/prisma/schema.prisma` et les variables d'environnement (`.env`).
4. Lance les migrations Prisma :
	```bash
	cd backend
	npx prisma migrate dev
	```

## Lancement

- Backend :
  ```bash
  cd backend
  npm run dev
  ```
- Frontend :
  ```bash
  cd frontend
  npm run dev
  ```

## Fonctionnalités principales

- Authentification (inscription, connexion)
- Suivi des artistes et sorties
- Ajout de favoris
- Consultation des nouveautés

## Contribuer

Les contributions sont les bienvenues !

1. Fork le projet
2. Crée une branche
3. Propose une pull request

## Licence

MIT
