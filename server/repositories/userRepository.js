// Repository = a design pattern that means "a place where data lives". 
//              It abstracts away the database access logic.

// Functions inside a Function = Factory Pattern
// Why we used this pattern:
//   1. Cleaner code: No repeating db everywhere. The repository "owns" the database connection.                
//   2. Encapsulation: The database is hidden inside the repository. If you later switch databases, only           
//                     userRepository.js changes — not 20 files that were passing db around.                                               
//   3. Testing: You can swap the database easily

export function createUserRepository(db) {

  // This is the public API that the service will use.
  return {
    // Create a new user account: validate inputs, hash password, store user, and authenticate the session.
    async createUser({ email, passwordHash }) {
      const result = await db.run(
        "INSERT INTO users (email, password_hash) VALUES (?, ?)",
        [email, passwordHash]
      );

      return { // Return the new user details.
        id: result.lastID,
        email,
        password_hash: passwordHash,
      };
    },

    // Retrieve a user by email: check if email exists and return user details without password_hash.
    async findUserByEmail(email) {
      const user = await db.get(
        "SELECT id, email, password_hash FROM users WHERE email = ?",
        [email]
      );

      return user ?? null;
    },

    // Retrieve a user by id: check if id exists and return user details without password_hash.
    async findUserById(id) {
      const user = await db.get(
        "SELECT id, email, password_hash FROM users WHERE id = ?",
        [id]
      );

      return user ?? null; // Return null if user not found.
    },
  };
}
