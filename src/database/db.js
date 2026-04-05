const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
let dbPromise;
async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: path.join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database
    }).then(async (db) => {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS images (
          id TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          upload_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_access DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      return db;
    }).catch(err => {
      console.error('Database connection error:', err);
    });
  }
  return dbPromise;
}
module.exports = { getDb };
