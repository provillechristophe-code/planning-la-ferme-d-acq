const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

// Lister toutes les réservations
router.get('/', async (req, res) => {
  try {
    const reservations = await all('SELECT * FROM reservations ORDER BY check_in DESC');
    res.json(reservations);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Vérifier disponibilité d'un box
router.get('/check-availability', async (req, res) => {
  try {
    const { box_id, check_in, check_out } = req.query;
    if (!box_id || !check_in || !check_out) {
      return res.json({ available: true });
    }
    const conflict = await get(
      `SELECT id FROM reservations 
       WHERE box_id = ? 
       AND status != 'cancelled'
       AND check_in < ? 
       AND check_out > ?`,
      [box_id, check_out, check_in]
    );
    res.json({ available: !conflict });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ajouter une réservation
router.post('/', async (req, res) => {
  try {
    const { animal_id, client_id, box_id, check_in, check_out, daily_rate, services, notes } = req.body;

    // Vérifier dispo du box si choisi
    if (box_id) {
      const conflict = await get(
        `SELECT id FROM reservations 
         WHERE box_id = ? 
         AND status != 'cancelled'
         AND check_in < ? 
         AND check_out > ?`,
        [box_id, check_out, check_in]
      );
      if (conflict) {
        return res.status(400).json({ error: 'Ce box est déjà occupé pour ces dates' });
      }
    }

    const id = await run(
      'INSERT INTO reservations (animal_id, client_id, box_id, check_in, check_out, daily_rate, services, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [animal_id, client_id, box_id || null, check_in, check_out, daily_rate, services, notes]
    );
    res.json({ id, message: 'Réservation créée' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtenir une réservation
router.get('/:id', async (req, res) => {
  try {
    const reservation = await get('SELECT * FROM reservations WHERE id = ?', [req.params.id]);
    res.json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mettre à jour une réservation
router.put('/:id', async (req, res) => {
  try {
    const { check_in, check_out, daily_rate, box_id, services, status, notes } = req.body;

    if (box_id) {
      const conflict = await get(
        `SELECT id FROM reservations 
         WHERE box_id = ? 
         AND id != ?
         AND status != 'cancelled'
         AND check_in < ? 
         AND check_out > ?`,
        [box_id, req.params.id, check_out, check_in]
      );
      if (conflict) {
        return res.status(400).json({ error: 'Ce box est déjà occupé pour ces dates' });
      }
    }

    await run(
      'UPDATE reservations SET check_in = ?, check_out = ?, daily_rate = ?, box_id = ?, services = ?, status = ?, notes = ? WHERE id = ?',
      [check_in, check_out, daily_rate, box_id || null, services, status, notes, req.params.id]
    );
    res.json({ message: 'Réservation mise à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Supprimer une réservation
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM reservations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Réservation supprimée' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;