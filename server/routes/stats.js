const express = require('express');
const router = express.Router();
const { all } = require('../db');

// Statistiques générales
router.get('/', async (req, res) => {
  try {
    const totalClients = await all('SELECT COUNT(*) as count FROM clients');
    const totalAnimals = await all('SELECT COUNT(*) as count FROM animals');
    const totalReservations = await all('SELECT COUNT(*) as count FROM reservations');
    const totalRevenue = await all('SELECT SUM(total) as total FROM invoices WHERE payment_status = "paid"');
    
    const pendingInvoices = await all('SELECT COUNT(*) as count FROM invoices WHERE payment_status = "pending"');
      var todayStr = new Date().toISOString().split('T')[0];
    var currentMonth = new Date().toISOString().substring(0, 7);
    var currentYear = new Date().getFullYear().toString();

    const monthRevenue = await all(
      "SELECT SUM(total) as total FROM invoices WHERE payment_status = 'paid' AND strftime('%Y-%m', invoice_date) = ?",
      [currentMonth]
    );

    const yearRevenue = await all(
      "SELECT SUM(total) as total FROM invoices WHERE payment_status = 'paid' AND strftime('%Y', invoice_date) = ?",
      [currentYear]
    );
    const todayArrivals = await all(`
      SELECT 
        reservations.*,
        animals.name as animal_name,
        animals.species as animal_species,
        clients.name as client_name,
        clients.phone as client_phone,
        boxes.box_number as box_name
      FROM reservations
      LEFT JOIN animals ON reservations.animal_id = animals.id
      LEFT JOIN clients ON reservations.client_id = clients.id
      LEFT JOIN boxes ON reservations.box_id = boxes.id
      WHERE reservations.check_in = ?
      AND reservations.status != 'cancelled'
      ORDER BY reservations.created_at DESC
    `, [todayStr]);

    const todayDepartures = await all(`
      SELECT 
        reservations.*,
        animals.name as animal_name,
        animals.species as animal_species,
        clients.name as client_name,
        clients.phone as client_phone,
        boxes.box_number as box_name
      FROM reservations
      LEFT JOIN animals ON reservations.animal_id = animals.id
      LEFT JOIN clients ON reservations.client_id = clients.id
      LEFT JOIN boxes ON reservations.box_id = boxes.id
      WHERE reservations.check_out = ?
      AND reservations.status != 'cancelled'
      ORDER BY reservations.created_at DESC
    `, [todayStr]);  
    const recentReservations = await all(`
      SELECT 
        reservations.*,
        animals.name as animal_name,
        animals.species as animal_species,
        clients.name as client_name
      FROM reservations
      LEFT JOIN animals ON reservations.animal_id = animals.id
      LEFT JOIN clients ON reservations.client_id = clients.id
      ORDER BY reservations.check_in DESC
      LIMIT 5
    `);
    
    res.json({
      totalClients: totalClients[0] ? totalClients[0].count : 0,
      totalAnimals: totalAnimals[0] ? totalAnimals[0].count : 0,
      totalReservations: totalReservations[0] ? totalReservations[0].count : 0,
      totalRevenue: totalRevenue[0] ? totalRevenue[0].total || 0 : 0,
      pendingInvoices: pendingInvoices[0] ? pendingInvoices[0].count : 0,
                 recentReservations: recentReservations || [],
      monthRevenue: monthRevenue[0] ? monthRevenue[0].total || 0 : 0,
      yearRevenue: yearRevenue[0] ? yearRevenue[0].total || 0 : 0,
      todayArrivals: todayArrivals || [],
      todayDepartures: todayDepartures || []
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Revenu par mois
router.get('/revenue/monthly', async (req, res) => {
  try {
    const revenue = await all(`
      SELECT strftime('%Y-%m', invoice_date) as month, SUM(total) as total
      FROM invoices
      WHERE payment_status = 'paid'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);
    res.json(revenue);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;