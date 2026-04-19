import sqlite3 from "sqlite3"; // sqlite3 : wrapper that enables JS code to talk to sqlite
import { open } from "sqlite"; // sqlite : the the most widely deployed database engine in the world. DB locally on Disk
import path from "node:path"; // node core module to get the path no matter the OS and its File System

export async function getDBConnection() {
  const dbPath = path.join("database.db");

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  await db.exec("PRAGMA foreign_keys = ON"); // Enforcing the practice to validate that foreign keys values do exist in the DB
  return db;
}

/*
------------
Why "open"?
------------
The term comes directly from how operating systems think about files.
In OS/C terminology, you don't just "use" a file — you open it first, work with it, then close it when you're done.
This is literal: the OS function is called fopen() in C, open() in Unix syscalls.
It's been this way since the 1960s-70s. SQLite inherited that vocabulary because it is a file under the hood.

If the file doesn't exist → it creates it
If the file already exists → it just opens it
Either way, you get back a handle to work with

*/
