const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Utilisation du fichier SQLite local ou du dossier de données
let dbPath = process.env.SQLITE_DB_PATH;
if (!dbPath) {
  if (fs.existsSync('/var/data')) {
    dbPath = '/var/data/pattes_douces.db';
  } else {
    dbPath = path.join(__dirname, 'pattes_douces.db');
  }
}

const sqliteDb = new sqlite3.Database(dbPath);
console.log('📁 Connexion à la base de données SQLite configurée sur :', dbPath);

const initialize = () => {
  sqliteDb.serialize(() => {
    sqliteDb.run('PRAGMA foreign_keys = ON;');
    sqliteDb.run('PRAGMA journal_mode = WAL;');

    // Table Users
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table Clients
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT,
        city TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table Animals
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS animals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        species TEXT NOT NULL,
        breed TEXT,
        age INTEGER,
        weight REAL,
        medical_notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )
    `);

    // Table Box/Cages
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS boxes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        box_number TEXT UNIQUE NOT NULL,
        box_type TEXT NOT NULL,
        capacity INTEGER DEFAULT 1,
        daily_rate REAL NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table Reservations
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        animal_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        box_id INTEGER,
        check_in DATE NOT NULL,
        check_out DATE NOT NULL,
        daily_rate REAL NOT NULL,
        services TEXT,
        status TEXT DEFAULT 'confirmed',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (animal_id) REFERENCES animals(id),
        FOREIGN KEY (client_id) REFERENCES clients(id),
        FOREIGN KEY (box_id) REFERENCES boxes(id)
      )
    `);

    // Table Invoices
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reservation_id INTEGER NOT NULL,
        client_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        tax REAL DEFAULT 0,
        total REAL NOT NULL,
        payment_status TEXT DEFAULT 'pending',
        invoice_date DATE NOT NULL,
        due_date DATE,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reservation_id) REFERENCES reservations(id),
        FOREIGN KEY (client_id) REFERENCES clients(id)
      )
    `);

    // Table Price Configuration
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS price_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_type TEXT UNIQUE NOT NULL,
        daily_rate REAL NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table Pension Configuration
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS pension_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pension_name TEXT DEFAULT 'PattesDouces',
        total_boxes INTEGER DEFAULT 10,
        box_types TEXT DEFAULT 'standard,grand,petit',
        phone TEXT,
        address TEXT,
        tax_rate REAL DEFAULT 0.2,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table Services (extras)
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_name TEXT NOT NULL,
        service_type TEXT,
        price REAL NOT NULL,
        description TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table Reservation Services (relation)
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS reservation_services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reservation_id INTEGER NOT NULL,
        service_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        unit_price REAL NOT NULL,
        FOREIGN KEY (reservation_id) REFERENCES reservations(id),
        FOREIGN KEY (service_id) REFERENCES services(id)
      )
    `);

    console.log('✅ Base de données SQLite native initialisée avec succès');
  });
};

const run = (query, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
};

const get = (query, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const all = (query, params = []) => {
  return new Promise((resolve, reject) => {
    sqliteDb.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

module.exports = { db: sqliteDb, initialize, run, get, all };