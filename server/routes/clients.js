const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

// Lister tous les clients
router.get('/', async (req, res) => {
  try {
    const clients = await all('SELECT * FROM clients');
    res.json(clients);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ajouter un client
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address, city } = req.body;
    const safeName = (name || '').trim();
    if (!safeName) {
      return res.status(400).json({ error: 'Le nom est obligatoire' });
    }
    const safeEmail = email && email.trim() ? email.trim() : null;
    const id = await run(
      'INSERT INTO clients (name, email, phone, address, city) VALUES (?, ?, ?, ?, ?)',
      [safeName, safeEmail, phone || null, address || null, city || null]
    );
    res.json({ id, message: 'Client créé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtenir un client
router.get('/:id', async (req, res) => {
  try {
    const client = await get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    res.json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mettre à jour un client
router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone, address, city } = req.body;
    await run(
      'UPDATE clients SET name = ?, email = ?, phone = ?, address = ?, city = ? WHERE id = ?',
      [name, email, phone, address, city, req.params.id]
    );
    res.json({ message: 'Client mis à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Supprimer un client
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM clients WHERE id = ?', [req.params.id]);
    res.json({ message: 'Client supprimé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
