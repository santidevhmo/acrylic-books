import argon2 from "argon2";
import isEmail from "validator/lib/isEmail.js";
import { setAuthenticatedSession } from "../session/sessionHelpers.js";

// AuthError = a semantic bridge between the business logic and the HTTP layer.
//             It's a custom error class that extends the built-in Error class so that the controller can throw it and the HTTP layer can catch it.
// Without this, the controller would need to throw a new Error object with a status code, and the HTTP layer would need to catch it and return the appropriate response.
// Regular Error only has a message. AuthError has both message + status, so the controller knows exactly what to do without parsing the message or adding extra logic. 

class AuthError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

// Standardize email format: trim whitespace and convert to lowercase for consistent lookups.
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

// Validate and normalize email: check type, format, and return standardized version.
function validateEmail(email) {
  if (typeof email !== "string") {
    throw new AuthError("Email is required.", 400);
  }

  const normalizedEmail = normalizeEmail(email);
  if (!isEmail(normalizedEmail)) {
    throw new AuthError("Email must be valid.", 400);
  }

  return normalizedEmail;
}

// Validate password: check type, non-empty, and optional minimum length requirement.
function validatePassword(password, { requireMinLength }) {
  if (typeof password !== "string" || password.length === 0) {
    throw new AuthError("Password is required.", 400);
  }

  if (requireMinLength && password.length < 8) {
    throw new AuthError("Password must be at least 8 characters long.", 400);
  }

  return password;
}

// Extract only non-sensitive fields (id, email) to send to client; never expose password_hash.
function toSafeUser(user) {
  return {
    id: user.id,
    email: user.email,
  };
}

// Detect if a database error is a duplicate-email constraint violation (race condition guard).
function isUniqueConstraintError(error) {
  return (
    error &&
    typeof error.message === "string" &&
    error.message.includes("UNIQUE constraint failed: users.email")
  );
}

// AuthService = a reference to business logic methods that interact with the repository, which internally uses the DB.
// In app.js, when we pass the userRepository to the authService, we are giving it access to all the auth business logic methods.

export function createAuthService({ userRepository }) {
  return {
    // Create a new user account: validate inputs, hash password, store user, and authenticate the session.
    async signup({ email, password, session }) {
      const normalizedEmail = validateEmail(email);
      const validPassword = validatePassword(password, { requireMinLength: true });

      const existingUser = await userRepository.findUserByEmail(normalizedEmail);
      if (existingUser) {
        throw new AuthError("Email is already in use.", 409);
      }

      const passwordHash = await argon2.hash(validPassword);

      let createdUser;
      try {
        createdUser = await userRepository.createUser({
          email: normalizedEmail,
          passwordHash,
        });
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new AuthError("Email is already in use.", 409);
        }

        throw error;
      }

      setAuthenticatedSession(session, createdUser.id);
      return toSafeUser(createdUser);
    },

    // Authenticate an existing user: validate credentials against stored password hash and authenticate the session.
    async login({ email, password, session }) {
      const normalizedEmail = validateEmail(email);
      const validPassword = validatePassword(password, { requireMinLength: false });

      const user = await userRepository.findUserByEmail(normalizedEmail);
      if (!user) {
        throw new AuthError("Invalid email or password.", 401);
      }

      const isValidPassword = await argon2.verify(user.password_hash, validPassword);
      if (!isValidPassword) {
        throw new AuthError("Invalid email or password.", 401);
      }

      setAuthenticatedSession(session, user.id);
      return toSafeUser(user);
    },

    // Retrieve the authenticated user from the session; returns null if session is empty or user is deleted.
    async getCurrentUser({ session }) {
      if (!session?.userId) {
        return null;
      }

      const user = await userRepository.findUserById(session.userId);
      return user ? toSafeUser(user) : null;
    },
  };
}

export { AuthError };
