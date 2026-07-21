const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = require('./db');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/animals', require('./routes/animals'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/config', require('./routes/configuration'));

// Initialiser la BD au démarrage
db.initialize();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🐾 Serveur La Ferme d'Acq lancé sur http://localhost:${PORT}`);
});
