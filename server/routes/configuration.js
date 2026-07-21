const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

// Obtenir la configuration actuelle
router.get('/config', async (req, res) => {
  try {
    let config = await get('SELECT * FROM pension_config LIMIT 1');
    if (!config) {
      await run(
        'INSERT INTO pension_config (pension_name, total_boxes) VALUES (?, ?)',
        ['PattesDouces', 10]
      );
      config = await get('SELECT * FROM pension_config LIMIT 1');
    }
    res.json(config);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mettre à jour la configuration
router.put('/config', async (req, res) => {
  try {
    const { pension_name, total_boxes, phone, address, tax_rate } = req.body;
    await run(
      'UPDATE pension_config SET pension_name = ?, total_boxes = ?, phone = ?, address = ?, tax_rate = ? WHERE id = 1',
      [pension_name, total_boxes, phone, address, tax_rate]
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
    
    // Tous les boxes
    const allBoxes = await all('SELECT * FROM boxes WHERE is_active = 1');
    
    // Boxes occupés
    const occupiedBoxes = await all(`
      SELECT DISTINCT b.id, b.box_number
      FROM boxes b
      JOIN animals a ON 1=1
      JOIN reservations r ON r.animal_id = a.id
      WHERE r.check_in <= ? AND r.check_out >= ?
    `, [endDate, startDate]);
    
    const occupiedIds = occupiedBoxes.map(b => b.id);
    const available = allBoxes.filter(b => !occupiedIds.includes(b.id));
    
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

module.exports = router;
