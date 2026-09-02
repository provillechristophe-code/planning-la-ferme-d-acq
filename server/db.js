const path = require('path');
const isPg = Boolean(process.env.DATABASE_URL);

let pgPool = null;
let sqliteDb = null;

if (isPg) {
  const { Pool } = require('pg');
  const dbUrl = new URL(process.env.DATABASE_URL);
  
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : {
      rejectUnauthorized: false,
      servername: dbUrl.hostname
    }
  });
  console.log('🐘 Connexion à PostgreSQL configurée');
} else {
  const sqlite3 = require('sqlite3').verbose();
  const fs = require('fs');
  let dbPath = process.env.SQLITE_DB_PATH;
  if (!dbPath) {
    if (fs.existsSync('/var/data')) {
      dbPath = '/var/data/pattes_douces.db';
    } else {
      dbPath = path.join(__dirname, 'pattes_douces.db');
    }
  }
  sqliteDb = new sqlite3.Database(dbPath);
  sqliteDb.run('PRAGMA journal_mode = WAL;');
  console.log('📁 Connexion à SQLite (WAL) configurée sur :', dbPath);
}

const initialize = async () => {
  if (isPg) {
    try {
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS clients (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          address TEXT,
          city TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS animals (
          id SERIAL PRIMARY KEY,
          client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          species TEXT NOT NULL,
          breed TEXT,
          age INTEGER,
          weight REAL,
          medical_notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS boxes (
          id SERIAL PRIMARY KEY,
          box_number TEXT UNIQUE NOT NULL,
          box_type TEXT NOT NULL,
          capacity INTEGER DEFAULT 1,
          daily_rate REAL NOT NULL,
          is_active INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS reservations (
          id SERIAL PRIMARY KEY,
          animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
          client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
          box_id INTEGER REFERENCES boxes(id) ON DELETE SET NULL,
          check_in DATE NOT NULL,
          check_out DATE NOT NULL,
          daily_rate REAL NOT NULL,
          services TEXT,
          status TEXT DEFAULT 'confirmed',
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS invoices (
          id SERIAL PRIMARY KEY,
          reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
          client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
          amount REAL NOT NULL,
          tax REAL DEFAULT 0,
          total REAL NOT NULL,
          payment_status TEXT DEFAULT 'pending',
          invoice_date DATE NOT NULL,
          due_date DATE,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS price_config (
          id SERIAL PRIMARY KEY,
          service_type TEXT UNIQUE NOT NULL,
          daily_rate REAL NOT NULL,
          description TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS pension_config (
          id SERIAL PRIMARY KEY,
          pension_name TEXT DEFAULT 'PattesDouces',
          total_boxes INTEGER DEFAULT 10,
          box_types TEXT DEFAULT 'standard,grand,petit',
          phone TEXT,
          address TEXT,
          tax_rate REAL DEFAULT 0.2,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS services (
          id SERIAL PRIMARY KEY,
          service_name TEXT NOT NULL,
          service_type TEXT,
          price REAL NOT NULL,
          description TEXT,
          is_active INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS reservation_services (
          id SERIAL PRIMARY KEY,
          reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
          service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
          quantity INTEGER DEFAULT 1,
          unit_price REAL NOT NULL
        );
      `);
      console.log('✅ Base de données PostgreSQL initialisée');
    } catch (err) {
      console.error('❌ Erreur initialisation PostgreSQL:', err);
    }
  } else {
    sqliteDb.serialize(() => {
      sqliteDb.run('PRAGMA foreign_keys = ON;');
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
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS price_config (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          service_type TEXT UNIQUE NOT NULL,
          daily_rate REAL NOT NULL,
          description TEXT,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
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
      console.log('✅ Base de données SQLite initialisée');
    });
  }
};

const convertParams = (sql, params) => {
  if (!isPg || !params || params.length === 0) return { sql, params };
  let paramIndex = 1;
  const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
  return { sql: pgSql, params };
};

const run = async (query, params = []) => {
  if (isPg) {
    let q = query;
    if (q.trim().toUpperCase().startsWith('INSERT') && !q.toUpperCase().includes('RETURNING')) {
      q += ' RETURNING id';
    }
    const { sql, params: pgParams } = convertParams(q, params);
    const res = await pgPool.query(sql, pgParams);
    return res.rows && res.rows[0] ? res.rows[0].id : null;
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.run(query, params, function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }
};

const get = async (query, params = []) => {
  if (isPg) {
    const { sql, params: pgParams } = convertParams(query, params);
    const res = await pgPool.query(sql, pgParams);
    return res.rows[0] || null;
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

const all = async (query, params = []) => {
  if (isPg) {
    const { sql, params: pgParams } = convertParams(query, params);
    const res = await pgPool.query(sql, pgParams);
    return res.rows || [];
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
};

module.exports = { db: isPg ? pgPool : sqliteDb, initialize, run, get, all };