const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./db');

const app = express();

// 1. Permettre le chargement de toutes les ressources locales
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';"
  );
  next();
});

// 2. Configuration CORS
const allowedOrigins = process.env.CLIENT_URL 
  ? [process.env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:5000']
  : ['http://localhost:3000', 'http://localhost:5000'];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// 3. Middlewares d'analyse du corps des requêtes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 4. Initialisation de la base de données
db.initialize();

// Endpoint de téléchargement de sauvegarde de la base de données (SQLite .db ou Fallback JSON)
app.get('/api/backup-db', async (req, res) => {
  try {
    const dbPath = db.dbPath || path.join(__dirname, 'pattes_douces.db');
    if (fs.existsSync(dbPath)) {
      return res.download(dbPath, `pattes_douces_backup_${new Date().toISOString().slice(0,10)}.db`);
    }
    
    // Fallback : Génère un fichier JSON complet si le fichier .db physique n'est pas sur le disque standard
    const clients = await db.all('SELECT * FROM clients');
    const animals = await db.all('SELECT * FROM animals');
    const boxes = await db.all('SELECT * FROM boxes');
    const reservations = await db.all('SELECT * FROM reservations');
    const invoices = await db.all('SELECT * FROM invoices');
    const config = await db.get('SELECT * FROM pension_config');
    const services = await db.all('SELECT * FROM services');

    const backupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      config,
      clients,
      animals,
      boxes,
      reservations,
      invoices,
      services
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=pattes_douces_backup_${new Date().toISOString().slice(0,10)}.json`);
    return res.send(JSON.stringify(backupData, null, 2));
  } catch (err) {
    console.error('Erreur génération sauvegarde :', err);
    res.status(500).json({ error: 'Erreur lors de la génération de la sauvegarde.' });
  }
});

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

// 6. Middleware global de gestion des erreurs
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
      if (db.close) db.close();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));