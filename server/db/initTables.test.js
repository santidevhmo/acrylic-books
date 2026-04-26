import { describe, it, expect, beforeEach } from "vitest";
import { initTables } from "./initTables.js";
import { openMemoryDB } from "../test/openMemoryDB.js";

describe("initTables", () => {
  let db;

  beforeEach(async () => {
    db = await openMemoryDB();
  });

  it("creates all three tables", async () => {
    await initTables(db);
    const rows = await db.all(
      `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`
    );
    const names = rows.map((r) => r.name);
    expect(names).toContain("users");
    expect(names).toContain("books");
    expect(names).toContain("user_books");
  });

  it("users table has correct columns", async () => {
    await initTables(db);
    const cols = await db.all("PRAGMA table_info(users)");
    const byName = Object.fromEntries(cols.map((c) => [c.name, c]));
    expect(byName.id.pk).toBe(1);
    expect(byName.email.notnull).toBe(1);
    expect(byName.password_hash.notnull).toBe(1);
  });

  it("books table has correct columns", async () => {
    await initTables(db);
    const cols = await db.all("PRAGMA table_info(books)");
    const byName = Object.fromEntries(cols.map((c) => [c.name, c]));
    expect(byName.id.pk).toBe(1);
    expect(byName.cover_url.notnull).toBe(1);
  });

  it("is idempotent (calling twice does not throw)", async () => {
    await initTables(db);
    await expect(initTables(db)).resolves.toBeUndefined();
  });

  it("user_books CHECK constraint rejects invalid status", async () => {
    await initTables(db);
    await db.run("INSERT INTO users (email, password_hash) VALUES (?, ?)", ["a@b.com", "hash"]);
    await db.run("INSERT INTO books (cover_url) VALUES (?)", ["http://example.com/img.jpg"]);
    await expect(
      db.run(
        "INSERT INTO user_books (user_id, book_id, status) VALUES (?, ?, ?)",
        [1, 1, "invalid"]
      )
    ).rejects.toThrow();
  });

  it("user_books UNIQUE(user_id, book_id) rejects duplicates", async () => {
    await initTables(db);
    await db.run("INSERT INTO users (email, password_hash) VALUES (?, ?)", ["a@b.com", "hash"]);
    await db.run("INSERT INTO books (cover_url) VALUES (?)", ["http://example.com/img.jpg"]);
    await db.run(
      "INSERT INTO user_books (user_id, book_id, status) VALUES (?, ?, ?)",
      [1, 1, "read"]
    );
    await expect(
      db.run(
        "INSERT INTO user_books (user_id, book_id, status) VALUES (?, ?, ?)",
        [1, 1, "to_read"]
      )
    ).rejects.toThrow();
  });
});
