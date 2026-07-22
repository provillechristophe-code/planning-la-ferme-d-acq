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

// Calculer le montant d'une réservation (box + services)
router.post('/calculate', async (req, res) => {
  try {
    const { reservation_id } = req.body;
    const reservation = await get('SELECT * FROM reservations WHERE id = ?', [reservation_id]);
    
    if (!reservation) return res.status(404).json({ error: 'Réservation non trouvée' });
    
    // Calcul de la durée
    const start = new Date(reservation.check_in);
    const end = new Date(reservation.check_out);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    // Tarif box
    const boxRate = reservation.daily_rate || 0;
    const boxAmount = boxRate * days;
    
    // Services additionnels
    const services = await all(
      `SELECT rs.*, s.service_name FROM reservation_services rs
       JOIN services s ON rs.service_id = s.id
       WHERE rs.reservation_id = ?`,
      [reservation_id]
    );
    
    const servicesAmount = services.reduce((sum, s) => sum + (s.unit_price * s.quantity), 0);
    
    // Sous-total
    const subtotal = boxAmount + servicesAmount;
    
    // Récupérer le taux de TVA
const config = await get('SELECT tax_rate FROM pension_config LIMIT 1');
var taxRate = 0.2;

if (config && config.tax_rate !== undefined && config.tax_rate !== null) {
  taxRate = Number(config.tax_rate);
}

if (isNaN(taxRate) || taxRate < 0.001) {
  taxRate = 0;
}
    const tax = subtotal * taxRate;
    
    const total = subtotal + tax;
    
    res.json({
      days,
      boxRate,
      boxAmount,
      services,
      servicesAmount,
      subtotal,
      taxRate: taxRate * 100,
      tax,
      total,
      breakdown: {
        'Pension': `${boxAmount.toFixed(2)}€`,
        'Services': `${servicesAmount.toFixed(2)}€`,
        'Sous-total': `${subtotal.toFixed(2)}€`,
        'TVA': `${tax.toFixed(2)}€ (${(taxRate * 100).toFixed(0)}%)`,
        'Total': `${total.toFixed(2)}€`
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Créer une facture avec calcul automatique
router.post('/', async (req, res) => {
  try {
    const { reservation_id, client_id } = req.body;
    const reservation = await get('SELECT * FROM reservations WHERE id = ?', [reservation_id]);
    
    if (!reservation) return res.status(404).json({ error: 'Réservation non trouvée' });
    
    // Calcul automatique
    const start = new Date(reservation.check_in);
    const end = new Date(reservation.check_out);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    const boxAmount = reservation.daily_rate * days;
    
    // Services
    const services = await all(
      `SELECT SUM(unit_price * quantity) as total FROM reservation_services WHERE reservation_id = ?`,
      [reservation_id]
    );
    
  const servicesAmount = (services[0] && services[0].total) ? services[0].total : 0;


    const subtotal = boxAmount + servicesAmount;
    
    // TVA
const config = await get('SELECT tax_rate FROM pension_config LIMIT 1');
var taxRate = 0.2;

if (config && config.tax_rate !== undefined && config.tax_rate !== null) {
  taxRate = Number(config.tax_rate);
}

if (isNaN(taxRate) || taxRate < 0.001) {
  taxRate = 0;
}
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    const invoice_date = new Date().toISOString().split('T')[0];
    const due_date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const id = await run(
      `INSERT INTO invoices (reservation_id, client_id, amount, tax, total, invoice_date, due_date, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [reservation_id, client_id, subtotal, tax, total, invoice_date, due_date, `Facture auto-générée pour ${days} jours`]
    );
    
    res.json({
      id,
      message: 'Facture créée',
      details: {
        boxAmount,
        servicesAmount,
        subtotal,
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
