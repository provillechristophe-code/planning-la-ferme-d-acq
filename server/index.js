const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // 🛡️ Module de sécurité des en-têtes HTTP
require('dotenv').config();

const db = require('./db');

const app = express();

// 1. Sécurisation des en-têtes HTTP
// 1. Sécurisation des en-têtes HTTP (sans blocage CSP en local)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false
}));

app.use((req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  next();
});

// 2. Configuration CORS restrictive
const allowedOrigins = process.env.CLIENT_URL 
  ? [process.env.CLIENT_URL, 'http://localhost:3000']
  : ['http://localhost:3000'];

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

// 6. Middleware global de gestion des erreurs (évite le crash du serveur)
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur non interceptée :', err.stack);
  res.status(err.status || 500).json({
    error: 'Une erreur interne est survenue sur le serveur.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 7. Lancement du serveur
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🐾 Serveur La Ferme d'Acq lancé sur http://localhost:${PORT}`);
});

// 8. Fermeture propre du serveur (évite le verrouillage de la DB SQLite ou les erreurs EADDRINUSE)
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Signal ${signal} reçu : Fermeture du serveur Express...`);
  server.close(() => {
    console.log('✅ Serveur HTTP fermé.');
    if (db.close) db.close(); // Ferme la connexion SQLite si la méthode existe
    process.exit(0);
  });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));