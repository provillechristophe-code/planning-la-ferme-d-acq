const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');

// Lister tous les animaux
router.get('/', async (req, res) => {
  try {
    const animals = await all('SELECT * FROM animals');
    res.json(animals);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Lister les animaux d'un client
router.get('/client/:clientId', async (req, res) => {
  try {
    const animals = await all('SELECT * FROM animals WHERE client_id = ?', [req.params.clientId]);
    res.json(animals);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Ajouter un animal
router.post('/', async (req, res) => {
  try {
    const { client_id, name, species, breed, age, weight, medical_notes } = req.body;
    const id = await run(
      'INSERT INTO animals (client_id, name, species, breed, age, weight, medical_notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [client_id, name, species, breed, age, weight, medical_notes]
    );
    res.json({ id, message: 'Animal créé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Obtenir un animal
router.get('/:id', async (req, res) => {
  try {
    const animal = await get('SELECT * FROM animals WHERE id = ?', [req.params.id]);
    res.json(animal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Mettre à jour un animal
router.put('/:id', async (req, res) => {
  try {
    const { client_id, name, species, breed, age, weight, medical_notes } = req.body;
    await run(
      'UPDATE animals SET client_id = ?, name = ?, species = ?, breed = ?, age = ?, weight = ?, medical_notes = ? WHERE id = ?',
      [client_id, name, species, breed, age, weight, medical_notes, req.params.id]
    );
    res.json({ message: 'Animal mis à jour' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Supprimer un animal
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM animals WHERE id = ?', [req.params.id]);
    res.json({ message: 'Animal supprimé' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
