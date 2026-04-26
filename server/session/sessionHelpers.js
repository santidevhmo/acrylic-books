import { sessionCookieName, sessionCookieOptions } from "../config/session.js";

// Keep the session minimal: the cookie identifies the session, and the session stores only the authenticated user's id.
export function setAuthenticatedSession(session, userId) {
  session.userId = userId;
}

export function destroyAuthenticatedSession(req, res) {
  return new Promise((resolve, reject) => {
    // We clear the cookie whether or not a live server-side session exists.
    // This keeps logout idempotent and removes any stale client cookie.
    const clearCookie = () => {
      res.clearCookie(sessionCookieName, {
        path: sessionCookieOptions.path,
      });
    };

    if (!req.session) {
      clearCookie();
      resolve();
      return;
    }

    // express-session exposes destroy as a callback API, so we wrap it in a Promise to let callers await the logout flow.
    req.session.destroy((error) => {
      if (error) {
        reject(error);
        return;
      }

      // Destroying the server session and clearing the browser cookie are separate steps; logout should do both.
      clearCookie();
      resolve();
    });
  });
}
