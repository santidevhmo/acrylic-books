import { destroyAuthenticatedSession } from "../session/sessionHelpers.js";
import { AuthError } from "../services/authService.js";

// Controller = a design pattern that means "a place where business logic lives".
export function createAuthController({ authService }) {
  
  // Handle errors: map AuthError to HTTP status codes, standardize other errors to 500.
  function handleError(error, res) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Internal server error." });
  }

  return {
    // Create a new user account: validate inputs, hash password, store user, and authenticate the session.
    async signup(req, res) {
      try {
        const user = await authService.signup({
          email: req.body?.email,
          password: req.body?.password,
          session: req.session,
        });

        res.status(201).json({ user });
      } catch (error) {
        handleError(error, res);
      }
    },

    // Authenticate an existing user: validate credentials against stored password hash and authenticate the session.
    async login(req, res) {
      try {
        const user = await authService.login({
          email: req.body?.email,
          password: req.body?.password,
          session: req.session,
        });

        res.status(200).json({ user });
      } catch (error) {
        handleError(error, res);
      }
    },

    // Logout the current user: destroy the session and clear the browser cookie.
    async logout(req, res) {
      try {
        await destroyAuthenticatedSession(req, res);
        res.status(200).json({ success: true });
      } catch {
        res.status(500).json({ error: "Internal server error." });
      }
    },

    // Retrieve the authenticated user from the session; returns null if session is empty or user is deleted.
    async me(req, res) {
      try {
        const user = await authService.getCurrentUser({
          session: req.session,
        });

        res.status(200).json({ user });
      } catch (error) {
        handleError(error, res);
      }
    },
  };
}
