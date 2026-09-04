const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

// Lister toutes les réservations
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

// Ajouter une réservation
router.post('/', async (req, res) => {
  try {
    let { 
      animal_id, client_id, box_id, check_in, check_out, daily_rate, services, notes,
      is_new_client, new_client, is_new_animal, new_animal
    } = req.body;

    if (is_new_client && new_client) {
      client_id = await run(
        'INSERT INTO clients (name, phone, email) VALUES (?, ?, ?)',
        [new_client.name, new_client.phone || '', new_client.email || '']
      );
    }

    if (is_new_animal && new_animal) {
      animal_id = await run(
        'INSERT INTO animals (name, species, breed, client_id) VALUES (?, ?, ?, ?)',
        [new_animal.name, new_animal.species || 'Chien', new_animal.breed || '', client_id]
      );
    }

    if (!client_id || !animal_id) {
      return res.status(400).json({ error: 'Le client et l\'animal sont obligatoires.' });
    }

    if (box_id) {
      const conflict = await get(
        `SELECT id FROM reservations WHERE box_id = ? AND status != 'cancelled' AND check_in < ? AND check_out > ?`,
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
        `SELECT id FROM reservations WHERE box_id = ? AND id != ? AND status != 'cancelled' AND check_in < ? AND check_out > ?`,
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
    const reservationId = req.params.id;
    await run('DELETE FROM reservation_services WHERE reservation_id = ?', [reservationId]);
    await run('DELETE FROM invoices WHERE reservation_id = ?', [reservationId]);
    await run('DELETE FROM reservations WHERE id = ?', [reservationId]);
    res.json({ message: 'Réservation supprimée' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Restaurer ou synchroniser automatiquement toute la base de données depuis la sauvegarde
router.post('/restore-full', async (req, res) => {
  try {
    const { clients, animals, boxes, reservations, invoices, services, config } = req.body;
    var restoredCounts = { clients: 0, animals: 0, boxes: 0, reservations: 0, invoices: 0, services: 0 };

    // Désactiver temporairement les contraintes de clés étrangères pendant la réinsertion
    try { await run('PRAGMA foreign_keys = OFF;'); } catch (e) {}

    if (clients && clients.length > 0) {
      for (const c of clients) {
        if (!c.name) continue;
        if (c.id) {
          await run(
            'INSERT OR REPLACE INTO clients (id, name, email, phone, address, city) VALUES (?, ?, ?, ?, ?, ?)',
            [c.id, c.name, c.email || null, c.phone || null, c.address || null, c.city || null]
          );
        } else {
          await run(
            'INSERT INTO clients (name, email, phone, address, city) VALUES (?, ?, ?, ?, ?)',
            [c.name, c.email || null, c.phone || null, c.address || null, c.city || null]
          );
        }
        restoredCounts.clients++;
      }
    }

    if (animals && animals.length > 0) {
      for (const a of animals) {
        if (!a.name || !a.client_id) continue;
        if (a.id) {
          await run(
            'INSERT OR REPLACE INTO animals (id, client_id, name, species, breed, age, weight, medical_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [a.id, a.client_id, a.name, a.species || 'Chien', a.breed || null, a.age || null, a.weight || null, a.medical_notes || null]
          );
        } else {
          await run(
            'INSERT INTO animals (client_id, name, species, breed, age, weight, medical_notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [a.client_id, a.name, a.species || 'Chien', a.breed || null, a.age || null, a.weight || null, a.medical_notes || null]
          );
        }
        restoredCounts.animals++;
      }
    }

    if (boxes && boxes.length > 0) {
      for (const b of boxes) {
        if (!b.box_number) continue;
        if (b.id) {
          await run(
            'INSERT OR REPLACE INTO boxes (id, box_number, box_type, capacity, daily_rate, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [b.id, b.box_number, b.box_type || 'standard', b.capacity || 1, b.daily_rate || 30, b.is_active !== undefined ? b.is_active : 1]
          );
        } else {
          await run(
            'INSERT OR IGNORE INTO boxes (box_number, box_type, capacity, daily_rate, is_active) VALUES (?, ?, ?, ?, ?)',
            [b.box_number, b.box_type || 'standard', b.capacity || 1, b.daily_rate || 30, b.is_active !== undefined ? b.is_active : 1]
          );
        }
        restoredCounts.boxes++;
      }
    }

    if (reservations && reservations.length > 0) {
      for (const r of reservations) {
        if (!r.animal_id || !r.client_id || !r.check_in || !r.check_out) continue;
        if (r.id) {
          await run(
            'INSERT OR REPLACE INTO reservations (id, animal_id, client_id, box_id, check_in, check_out, daily_rate, services, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [r.id, r.animal_id, r.client_id, r.box_id || null, r.check_in, r.check_out, r.daily_rate || 30, r.services || null, r.status || 'confirmed', r.notes || null]
          );
        } else {
          await run(
            'INSERT INTO reservations (animal_id, client_id, box_id, check_in, check_out, daily_rate, services, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [r.animal_id, r.client_id, r.box_id || null, r.check_in, r.check_out, r.daily_rate || 30, r.services || null, r.status || 'confirmed', r.notes || null]
          );
        }
        restoredCounts.reservations++;
      }
    }

    if (invoices && invoices.length > 0) {
      for (const inv of invoices) {
        if (!inv.reservation_id || !inv.client_id) continue;
        if (inv.id) {
          await run(
            'INSERT OR REPLACE INTO invoices (id, reservation_id, client_id, amount, tax, total, payment_status, invoice_date, due_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [inv.id, inv.reservation_id, inv.client_id, inv.amount || 0, inv.tax || 0, inv.total || 0, inv.payment_status || 'pending', inv.invoice_date, inv.due_date || null, inv.notes || null]
          );
        } else {
          await run(
            'INSERT INTO invoices (reservation_id, client_id, amount, tax, total, payment_status, invoice_date, due_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [inv.reservation_id, inv.client_id, inv.amount || 0, inv.tax || 0, inv.total || 0, inv.payment_status || 'pending', inv.invoice_date, inv.due_date || null, inv.notes || null]
          );
        }
        restoredCounts.invoices++;
      }
    }

    if (services && services.length > 0) {
      for (const s of services) {
        if (!s.service_name) continue;
        if (s.id) {
          await run(
            'INSERT OR REPLACE INTO services (id, service_name, service_type, price, description, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [s.id, s.service_name, s.service_type || null, s.price || 0, s.description || null, s.is_active !== undefined ? s.is_active : 1]
          );
        } else {
          await run(
            'INSERT INTO services (service_name, service_type, price, description, is_active) VALUES (?, ?, ?, ?, ?)',
            [s.service_name, s.service_type || null, s.price || 0, s.description || null, s.is_active !== undefined ? s.is_active : 1]
          );
        }
        restoredCounts.services++;
      }
    }

    if (config && config.pension_name) {
      await run(
        'UPDATE pension_config SET pension_name = ?, total_boxes = ?, phone = ?, address = ?, tax_rate = ?, default_daily_rate = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
        [config.pension_name, config.total_boxes || 10, config.phone || '', config.address || '', config.tax_rate || 0, config.default_daily_rate || 30]
      );
    }

    // Réactiver les clés étrangères
    try { await run('PRAGMA foreign_keys = ON;'); } catch (e) {}

    res.json({ message: 'Restauration effectuée avec succès', counts: restoredCounts });
  } catch (err) {
    console.error('Erreur /restore-full :', err);
    try { await run('PRAGMA foreign_keys = ON;'); } catch (e) {}
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;