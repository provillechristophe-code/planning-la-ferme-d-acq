# 🐾 PattesDouces - Plateforme de Gestion de Pensions Animalières

Une application complète pour gérer les pensions animalières avec clients, animaux, réservations, planning et facturation.

## 🚀 Features

✅ **Authentification** - Login/Register sécurisé  
✅ **Gestion des Clients** - Ajouter, modifier, supprimer des clients  
✅ **Gestion des Animaux** - Suivi des animaux en pension  
✅ **Réservations** - Créer et gérer les réservations  
✅ **Planning** - Calendrier des réservations  
✅ **Facturation** - Générer des factures  
✅ **Statistiques** - Tableaux de bord avec KPIs  
✅ **Dashboard** - Vue d'ensemble de l'activité  

## 📋 Stack Technologique

- **Frontend**: React 18
- **Backend**: Node.js + Express
- **Base de données**: SQLite
- **Authentification**: JWT + bcrypt

## 🛠️ Installation

### 1. Cloner et installer les dépendances

```bash
cd pattes-douces
npm install
cd client && npm install && cd ..
```

### 2. Démarrer le serveur et le client

**Option 1: Deux terminaux séparés**

Terminal 1 - Serveur:
```bash
npm run dev
```

Terminal 2 - Client:
```bash
npm run client
```

**Option 2: Avec concurrently**
```bash
npm run dev-all
```

### 3. Accéder à l'application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📝 Premiers Pas

1. **S'inscrire** - Créer un compte sur `/register`
2. **Se connecter** - Login sur `/login`
3. **Ajouter des clients** - Aller sur `/clients`
4. **Ajouter des animaux** - Aller sur `/animals`
5. **Créer des réservations** - Aller sur `/reservations`
6. **Consulter le planning** - Aller sur `/planning`
7. **Facturer** - Aller sur `/invoices`
8. **Statistiques** - Voir le dashboard

## 🗄️ Structure de la Base de Données

### Tables principales:
- **users** - Utilisateurs de la plateforme
- **clients** - Propriétaires d'animaux
- **animals** - Animaux en pension
- **reservations** - Réservations de pensions
- **invoices** - Factures générées
- **price_config** - Configuration des tarifs

## 🔒 Sécurité

- Les mots de passe sont hashés avec bcrypt
- Authentification par JWT tokens
- Tokens valides 7 jours

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion

### Clients
- `GET /api/clients` - Liste tous
- `POST /api/clients` - Créer
- `GET /api/clients/:id` - Détails
- `PUT /api/clients/:id` - Modifier
- `DELETE /api/clients/:id` - Supprimer

### Animals
- `GET /api/animals` - Liste tous
- `POST /api/animals` - Créer
- `GET /api/animals/:id` - Détails
- `PUT /api/animals/:id` - Modifier
- `DELETE /api/animals/:id` - Supprimer

### Reservations
- `GET /api/reservations` - Liste tous
- `POST /api/reservations` - Créer
- `GET /api/reservations/:id` - Détails
- `PUT /api/reservations/:id` - Modifier
- `DELETE /api/reservations/:id` - Supprimer

### Invoices
- `GET /api/invoices` - Liste tous
- `POST /api/invoices` - Créer
- `GET /api/invoices/:id` - Détails
- `PUT /api/invoices/:id` - Modifier
- `DELETE /api/invoices/:id` - Supprimer

### Stats
- `GET /api/stats` - Statistiques générales
- `GET /api/stats/revenue/monthly` - Revenu par mois

## 🚢 Déploiement

### Build pour production
```bash
npm run build-client
npm start
```

## 📧 Support

Pour toute question, consultez la documentation ou ouvrez une issue.

## 📄 Licence

MIT
