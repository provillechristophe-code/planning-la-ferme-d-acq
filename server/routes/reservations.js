const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

// Lister toutes les réservations (triées par date d'arrivée par ordre chronologique ASC)
router.get('/', async (req, res) => {
  try {
    const reservations = await all('SELECT * FROM reservations ORDER BY check_in ASC');
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

// Ajouter une réservation (avec option de créer client et/ou animal à la volée)
router.post('/', async (req, res) => {
  try {
    let { 
      animal_id, 
      client_id, 
      box_id, 
      check_in, 
      check_out, 
      daily_rate, 
      services, 
      notes,
      is_new_client,
      new_client, // Objet : { name, phone, email }
      is_new_animal,
      new_animal // Objet : { name, species, breed }
    } = req.body;

    // 1. Si nouveau client, création dans la table 'clients'
    if (is_new_client && new_client) {
      client_id = await run(
        'INSERT INTO clients (name, phone, email) VALUES (?, ?, ?)',
        [new_client.name, new_client.phone || '', new_client.email || '']
      );
    }

    // 2. Si nouvel animal, création dans la table 'animals' (lié au client_id)
    if (is_new_animal && new_animal) {
      animal_id = await run(
        'INSERT INTO animals (name, species, breed, client_id) VALUES (?, ?, ?, ?)',
        [
          new_animal.name, 
          new_animal.species || 'Chien', 
          new_animal.breed || '', 
          client_id
        ]
      );
    }

    // Vérification de sécurité
    if (!client_id || !animal_id) {
      return res.status(400).json({ error: 'Le client et l\'animal sont obligatoires.' });
    }

    // 3. Vérifier la disponibilité du box
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

    // 4. Créer la réservation finale
    const id = await run(
      'INSERT INTO reservations (animal_id, client_id, box_id, check_in, check_out, daily_rate, services, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [animal_id, client_id, box_id || null, check_in, check_out, daily_rate, services, notes]
    );

    res.json({ id, message: 'Réservation créée avec succès !' });
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