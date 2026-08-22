const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // 🛡️ Module de sécurité des en-têtes HTTP
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./db');

const app = express();

// 1. Permettre le chargement de toutes les ressources locales (Chrome devtools, traductions, etc.)
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';"
  );
  next();
});

// 2. Configuration CORS autorisant localhost:3000 et localhost:5000
const allowedOrigins = process.env.CLIENT_URL 
  ? [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5000']
  : ['http://localhost:3000', 'http://localhost:5000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// 3. Middlewares d'analyse du corps des requêtes
app.use(express.json({ limit: '10mb' })); // Limite la taille des requêtes JSON pour éviter le déni de service (DoS)
app.use(express.urlencoded({ extended: true }));

// 4. Initialisation de la base de données
db.initialize();

// 5. Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/animals', require('./routes/animals'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/config', require('./routes/configuration'));

// Serveur de fichiers statiques React (production / mode application)
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const buildIndex = path.join(__dirname, '../client/build', 'index.html');
  if (fs.existsSync(buildIndex)) {
    res.sendFile(buildIndex);
  } else {
    next();
  }
});

// 6. Middleware global de gestion des erreurs (évite le crash du serveur)
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur non interceptée :', err.stack);
  res.status(err.status || 500).json({
    error: 'Une erreur interne est survenue sur le serveur.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 7. Lancement du serveur avec bascule automatique de port si EADDRINUSE
const PORT = process.env.PORT || 5000;
let activeServer = null;

const startServer = (portToUse) => {
  activeServer = app.listen(portToUse, '0.0.0.0', () => {
    console.log(`🐾 Serveur La Ferme d'Acq lancé sur http://localhost:${portToUse}`);
  });

  activeServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Le port ${portToUse} est déjà occupé. Essai automatique sur le port ${portToUse + 1}...`);
      setTimeout(() => startServer(portToUse + 1), 300);
    } else {
      console.error('❌ Erreur serveur :', err);
    }
  });
};

startServer(PORT);

// 8. Fermeture propre du serveur
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Signal ${signal} reçu : Fermeture du serveur Express...`);
  if (activeServer) {
    activeServer.close(() => {
      console.log('✅ Serveur HTTP fermé.');
      if (db.close) db.close(); // Ferme la connexion SQLite si la méthode existe
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));