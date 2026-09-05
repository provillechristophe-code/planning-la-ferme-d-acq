const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

// Obtenir la configuration actuelle
router.get('/config', async (req, res) => {
  try {
    let config = await get('SELECT * FROM pension_config LIMIT 1');
    if (!config) {
      try {
        await run(
          'INSERT INTO pension_config (pension_name, total_boxes, default_daily_rate) VALUES (?, ?, ?)',
          ['La Ferme d Acq', 10, 30]
        );
      } catch (e) {
        await run(
          'INSERT INTO pension_config (pension_name, total_boxes) VALUES (?, ?)',
          ['La Ferme d Acq', 10]
        );
      }
      config = await get('SELECT * FROM pension_config LIMIT 1');
    }
    if (config && config.default_daily_rate === undefined) {
      config.default_daily_rate = 30;
    }
    res.json(config || { pension_name: 'La Ferme d Acq', total_boxes: 10, default_daily_rate: 30 });
  } catch (err) {
    res.json({ pension_name: 'La Ferme d Acq', total_boxes: 10, default_daily_rate: 30 });
  }
});

// Mettre à jour la configuration
router.put('/config', async (req, res) => {
  try {
    const { pension_name, total_boxes, phone, address, tax_rate, default_daily_rate } = req.body;
    await run(
      'UPDATE pension_config SET pension_name = ?, total_boxes = ?, phone = ?, address = ?, tax_rate = ?, default_daily_rate = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
      [pension_name, total_boxes, phone, address, tax_rate, default_daily_rate]
    );
    res.json({ message: 'Configuration mise à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Lister tous les box
router.get('/boxes', async (req, res) => {
  try {
    const boxes = await all('SELECT * FROM boxes ORDER BY box_number');
    res.json(boxes);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ajouter un box
router.post('/boxes', async (req, res) => {
  try {
    const { box_number, box_type, capacity, daily_rate } = req.body;
    const id = await run(
      'INSERT INTO boxes (box_number, box_type, capacity, daily_rate) VALUES (?, ?, ?, ?)',
      [box_number, box_type, capacity, daily_rate]
    );
    res.json({ id, message: 'Box créé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mettre à jour un box
router.put('/boxes/:id', async (req, res) => {
  try {
    const { box_number, box_type, capacity, daily_rate, is_active } = req.body;
    await run(
      'UPDATE boxes SET box_number = ?, box_type = ?, capacity = ?, daily_rate = ?, is_active = ? WHERE id = ?',
      [box_number, box_type, capacity, daily_rate, is_active, req.params.id]
    );
    res.json({ message: 'Box mis à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Supprimer un box
router.delete('/boxes/:id', async (req, res) => {
  try {
    await run('DELETE FROM boxes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Box supprimé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Lister tous les services
router.get('/services', async (req, res) => {
  try {
    const services = await all('SELECT * FROM services WHERE is_active = 1');
    res.json(services);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ajouter un service
router.post('/services', async (req, res) => {
  try {
    const { service_name, service_type, price, description } = req.body;
    const id = await run(
      'INSERT INTO services (service_name, service_type, price, description) VALUES (?, ?, ?, ?)',
      [service_name, service_type, price, description]
    );
    res.json({ id, message: 'Service créé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mettre à jour un service
router.put('/services/:id', async (req, res) => {
  try {
    const { service_name, service_type, price, description, is_active } = req.body;
    await run(
      'UPDATE services SET service_name = ?, service_type = ?, price = ?, description = ?, is_active = ? WHERE id = ?',
      [service_name, service_type, price, description, is_active, req.params.id]
    );
    res.json({ message: 'Service mis à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Supprimer un service
router.delete('/services/:id', async (req, res) => {
  try {
    await run('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ message: 'Service supprimé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtenir les box disponibles pour une période
router.get('/availability/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const allBoxes = await all('SELECT * FROM boxes WHERE is_active = 1');
    const occupiedBoxes = await all(
      'SELECT DISTINCT box_id FROM reservations WHERE status != ? AND check_in < ? AND check_out > ?',
      ['cancelled', endDate, startDate]
    );
    var occupiedIds = occupiedBoxes.map(function(b) { return b.box_id; });
    var available = allBoxes.filter(function(b) { return occupiedIds.indexOf(b.id) === -1; });
    res.json({
      total: allBoxes.length,
      available: available.length,
      occupied: occupiedBoxes.length,
      availableBoxes: available
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Endpoint pour consulter l'ensemble des tables de la base de données
router.get('/db-tables', async (req, res) => {
  try {
    const clients = await all('SELECT * FROM clients ORDER BY id DESC');
    const animals = await all('SELECT * FROM animals ORDER BY id DESC');
    const boxes = await all('SELECT * FROM boxes ORDER BY id ASC');
    const reservations = await all('SELECT * FROM reservations ORDER BY id DESC');
    const invoices = await all('SELECT * FROM invoices ORDER BY id DESC');
    res.json({ clients, animals, boxes, reservations, invoices });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint pour supprimer un enregistrement spécifique dans n'importe quelle table
router.delete('/db-table-row/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    const allowedTables = ['clients', 'animals', 'boxes', 'reservations', 'invoices', 'services'];
    
    if (allowedTables.indexOf(table) === -1) {
      return res.status(400).json({ error: 'Table non autorisée' });
    }

    try { await run('PRAGMA foreign_keys = OFF;'); } catch (e) {}

    if (table === 'clients') {
      const reservations = await all('SELECT id FROM reservations WHERE client_id = ?', [id]);
      for (const r of reservations) {
        await run('DELETE FROM reservation_services WHERE reservation_id = ?', [r.id]);
      }
      await run('DELETE FROM invoices WHERE client_id = ?', [id]);
      await run('DELETE FROM reservations WHERE client_id = ?', [id]);
      await run('DELETE FROM animals WHERE client_id = ?', [id]);
    } else if (table === 'animals') {
      const reservations = await all('SELECT id FROM reservations WHERE animal_id = ?', [id]);
      for (const r of reservations) {
        await run('DELETE FROM reservation_services WHERE reservation_id = ?', [r.id]);
        await run('DELETE FROM invoices WHERE reservation_id = ?', [r.id]);
      }
      await run('DELETE FROM reservations WHERE animal_id = ?', [id]);
    } else if (table === 'reservations') {
      await run('DELETE FROM reservation_services WHERE reservation_id = ?', [id]);
      await run('DELETE FROM invoices WHERE reservation_id = ?', [id]);
    }

    await run('DELETE FROM ' + table + ' WHERE id = ?', [id]);

    try { await run('PRAGMA foreign_keys = ON;'); } catch (e) {}

    res.json({ message: 'Enregistrement supprimé avec succès' });
  } catch (err) {
    try { await run('PRAGMA foreign_keys = ON;'); } catch (e) {}
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;