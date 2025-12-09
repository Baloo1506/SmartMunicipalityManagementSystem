# 🏛️ SMMS Backend API

API REST pour le Système de Gestion Municipale Intelligente.

## 🚀 Démarrage rapide

```bash
# Installation
npm install

# Configuration
cp .env.example .env
# Éditez .env avec vos paramètres

# Initialiser la DB avec des données de test
npm run seed

# Démarrer en développement
npm run dev
```

## 📚 Documentation API

### Authentification

Toutes les routes protégées nécessitent un header `Authorization: Bearer <token>`.

### Endpoints

#### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil courant

#### Posts
- `GET /api/posts` - Liste des publications
- `POST /api/posts` - Créer une publication
- `GET /api/posts/:id` - Détail publication
- `PUT /api/posts/:id` - Modifier
- `DELETE /api/posts/:id` - Supprimer
- `POST /api/posts/:id/like` - Liker

#### Events
- `GET /api/events` - Liste des événements
- `POST /api/events` - Créer un événement
- `GET /api/events/:id` - Détail événement
- `POST /api/events/:id/attend` - S'inscrire
- `DELETE /api/events/:id/attend` - Se désinscrire

#### Comments
- `GET /api/posts/:postId/comments` - Commentaires d'un post
- `POST /api/posts/:postId/comments` - Ajouter un commentaire

#### Notifications
- `GET /api/notifications` - Mes notifications
- `PUT /api/notifications/:id/read` - Marquer comme lu
- `PUT /api/notifications/read-all` - Tout marquer comme lu

#### Admin (requiert rôle admin)
- `GET /api/admin/users` - Liste utilisateurs
- `PUT /api/admin/users/:id/role` - Changer le rôle
- `PUT /api/admin/users/:id/status` - Changer le statut
- `GET /api/admin/reports` - Liste signalements
- `PUT /api/admin/reports/:id` - Traiter signalement

## 🔐 Rôles

- **citizen** - Utilisateur standard
- **staff** - Personnel municipal
- **admin** - Administrateur

## 🌐 WebSocket

Connexion Socket.io pour les notifications en temps réel :

```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'votre_jwt_token' }
})

socket.on('notification', (data) => {
  console.log('Nouvelle notification:', data)
})
```

## 📂 Structure

```
src/
├── config/       # Configuration
├── middleware/   # Middlewares
├── models/       # Modèles Mongoose
├── routes/       # Routes API
├── services/     # Services métier
├── app.js        # Config Express
└── index.js      # Point d'entrée
```
