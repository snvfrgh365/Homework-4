const path = require('path');

const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function runCallback(error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

async function main() {
  await run(
    `CREATE TABLE IF NOT EXISTS prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  );

  await run('DELETE FROM prices');

  const samples = [
    { date: '2026-05-01', name: 'Intel Core i5-13400F', price: 5790 },
    { date: '2026-05-08', name: 'Intel Core i5-13400F', price: 5590 },
    { date: '2026-05-01', name: 'AMD Ryzen 7 7800X3D', price: 12950 },
    { date: '2026-05-08', name: 'AMD Ryzen 7 7800X3D', price: 12790 },
  ];

  for (const item of samples) {
    await run('INSERT INTO prices (date, name, price) VALUES (?, ?, ?)', [
      item.date,
      item.name,
      item.price,
    ]);
  }

  console.log(`Seeded ${samples.length} rows into ${dbPath}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    db.close();
  });
