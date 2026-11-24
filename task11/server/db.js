const Database = require('better-sqlite3');
const path = require('path');


const dbPath = process.env.VERCEL
  ? path.join('/tmp', 'database.sqlite')
  : path.join(__dirname, 'database.sqlite');

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense'))
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      category_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      comment TEXT,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );
  `);

  const { count } = db.prepare('SELECT COUNT(*) AS count FROM categories').get();
  if (count === 0) {
    const insert = db.prepare('INSERT INTO categories (name, type) VALUES (?, ?)');
    insert.run('Еда', 'expense');
    insert.run('Транспорт', 'expense');
    insert.run('Зарплата', 'income');
    console.log('Таблица categories была пуста — добавлены стартовые категории.');
  }
}

module.exports = { db, initDb };
