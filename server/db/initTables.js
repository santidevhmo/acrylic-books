export async function initTables(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cover_url TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('read', 'to_read')),
      UNIQUE(user_id, book_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (book_id) REFERENCES books(id)
    );
  `);
}
