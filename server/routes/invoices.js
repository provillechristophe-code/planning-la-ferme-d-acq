const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

// Lister toutes les factures
router.get('/', async (req, res) => {
  try {
    const invoices = await all('SELECT * FROM invoices ORDER BY invoice_date DESC');
    res.json(invoices);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Helper pour calculer une réservation
const calculateSingleReservation = async (reservation_id) => {
  const reservation = await get('SELECT * FROM reservations WHERE id = ?', [reservation_id]);
  if (!reservation) return null;

  const animal = await get('SELECT * FROM animals WHERE id = ?', [reservation.animal_id]);
  const start = new Date(reservation.check_in);
  const end = new Date(reservation.check_out);
  const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

  const boxRate = reservation.daily_rate || 0;
  const boxAmount = boxRate * days;

  const services = await all(
    `SELECT rs.*, s.service_name FROM reservation_services rs
     JOIN services s ON rs.service_id = s.id
     WHERE rs.reservation_id = ?`,
    [reservation_id]
  );

  const servicesAmount = services.reduce((sum, s) => sum + (s.unit_price * s.quantity), 0);
  const subtotal = boxAmount + servicesAmount;

  return {
    reservation_id,
    animal_id: reservation.animal_id,
    animal_name: animal ? animal.name : 'Animal #' + reservation.animal_id,
    check_in: reservation.check_in,
    check_out: reservation.check_out,
    days,
    boxRate,
    boxAmount,
    services,
    servicesAmount,
    subtotal
  };
};

// Calculer le montant d'une ou plusieurs réservations
router.post('/calculate', async (req, res) => {
  try {
    const { reservation_id, reservation_ids } = req.body;
    let ids = [];

    if (reservation_ids && Array.isArray(reservation_ids) && reservation_ids.length > 0) {
      ids = reservation_ids;
    } else if (reservation_id) {
      ids = [reservation_id];
    }

    if (ids.length === 0) {
      return res.status(400).json({ error: 'Aucune réservation sélectionnée' });
    }

    const items = [];
    let totalSubtotal = 0;

    for (const rid of ids) {
      const calc = await calculateSingleReservation(rid);
      if (calc) {
        items.push(calc);
        totalSubtotal += calc.subtotal;
      }
    }

    if (items.length === 0) {
      return res.status(404).json({ error: 'Réservations non trouvées' });
    }

    // Récupérer le taux de TVA
    const config = await get('SELECT tax_rate FROM pension_config LIMIT 1');
    let taxRate = 0.2;
    if (config && config.tax_rate !== undefined && config.tax_rate !== null) {
      taxRate = Number(config.tax_rate);
    }
    if (isNaN(taxRate) || taxRate < 0.001) taxRate = 0;

    const tax = totalSubtotal * taxRate;
    const total = totalSubtotal + tax;

    res.json({
      items,
      count: items.length,
      subtotal: totalSubtotal,
      taxRate: taxRate * 100,
      tax,
      total
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Créer une facture (unique ou regroupée)
router.post('/', async (req, res) => {
  try {
    const { reservation_id, reservation_ids, client_id } = req.body;
    let ids = [];

    if (reservation_ids && Array.isArray(reservation_ids) && reservation_ids.length > 0) {
      ids = reservation_ids;
    } else if (reservation_id) {
      ids = [reservation_id];
    }

    if (ids.length === 0 || !client_id) {
      return res.status(400).json({ error: 'Réservation(s) et client obligatoires' });
    }

    const items = [];
    let totalSubtotal = 0;

    for (const rid of ids) {
      const calc = await calculateSingleReservation(rid);
      if (calc) {
        items.push(calc);
        totalSubtotal += calc.subtotal;
      }
    }

    if (items.length === 0) {
      return res.status(404).json({ error: 'Réservation(s) introuvable(s)' });
    }

    // TVA
    const config = await get('SELECT tax_rate FROM pension_config LIMIT 1');
    let taxRate = 0.2;
    if (config && config.tax_rate !== undefined && config.tax_rate !== null) {
      taxRate = Number(config.tax_rate);
    }
    if (isNaN(taxRate) || taxRate < 0.001) taxRate = 0;

    const tax = totalSubtotal * taxRate;
    const total = totalSubtotal + tax;

    const invoice_date = new Date().toISOString().split('T')[0];
    const due_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const notesObj = {
      type: items.length > 1 ? 'grouped' : 'single',
      reservation_ids: ids,
      items
    };

    const primaryReservationId = ids[0];

    const id = await run(
      `INSERT INTO invoices (reservation_id, client_id, amount, tax, total, invoice_date, due_date, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [primaryReservationId, client_id, totalSubtotal, tax, total, invoice_date, due_date, JSON.stringify(notesObj)]
    );

    res.json({
      id,
      message: 'Facture créée avec succès',
      details: {
        count: items.length,
        subtotal: totalSubtotal,
        tax,
        total
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtenir une facture
router.get('/:id', async (req, res) => {
  try {
    const invoice = await get('SELECT * FROM invoices WHERE id = ?', [req.params.id]);
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mettre à jour le statut de paiement
router.put('/:id', async (req, res) => {
  try {
    const { payment_status } = req.body;
    await run(
      'UPDATE invoices SET payment_status = ? WHERE id = ?',
      [payment_status, req.params.id]
    );
    res.json({ message: 'Facture mise à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Marquer une facture comme payée
router.put('/:id/pay', async (req, res) => {
  try {
    await run(
      'UPDATE invoices SET payment_status = ? WHERE id = ?',
      ['paid', req.params.id]
    );
    res.json({ message: 'Facture marquée comme payée' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Supprimer une facture
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM invoices WHERE id = ?', [req.params.id]);
    res.json({ message: 'Facture supprimée' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;