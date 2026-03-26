const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./admin.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      whatsapp TEXT,
      theme JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      category TEXT,
      image TEXT,
      popular INTEGER DEFAULT 0,
      FOREIGN KEY (store_id) REFERENCES stores (id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      store_id TEXT NOT NULL,
      customer_name TEXT,
      customer_phone TEXT,
      customer_address TEXT,
      customer_notes TEXT,
      payment_method TEXT,
      total REAL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (store_id) REFERENCES stores (id)
    )
  `);

  // Seed QG Marmitas store
  db.run(`INSERT OR IGNORE INTO stores (id, slug, name, whatsapp) VALUES ('qg-marmitas', 'qgmarmitas', 'QG Marmitas', '5534991400189')`, (err) => {
    if (err) console.error(err);
    else console.log('✅ Stores table ready');
  });

  // Seed products for QG Marmitas
  const products = [
    ['marmita1', 'qg-marmitas', 'Marmita Completa', 25.90, 'Arroz, feijão, bife acebolado, salada', 'principal', null, 1],
    ['marmita2', 'qg-marmitas', 'Marmita Fitness', 22.90, 'Frango grelhado, legumes, batata doce', 'fitness', null, 0],
    ['marmita3', 'qg-marmitas', 'Marmita Kids', 18.90, 'Macarrão, salsicha, purê', 'kids', null, 1],
    ['marmita4', 'qg-marmitas', 'Marmita Vegetariana', 20.90, 'Arroz integral, legumes, tofu', 'vegetariana', null, 0]
  ];

  products.forEach(([id, store_id, name, price, desc, cat, image, popular]) => {
    db.run(`INSERT OR IGNORE INTO products (id, store_id, name, price, description, category, image, popular) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [id, store_id, name, price, desc, cat, image, popular]);
  });

  console.log('✅ DB schema + QG Marmitas data seeded (stores/products/orders tables)');
});

db.close(() => {
  console.log('DB connection closed');
});
