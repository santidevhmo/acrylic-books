import session from "express-session";

// config = runs once at app startup. It's a good place to put things that need to be done only once.

// This is the browser cookie key that will hold the session id.
// "sid" is a common shorthand for "session id", but the name itself is arbitrary.
export const sessionCookieName = "acrylic.sid";

export const sessionCookieOptions = {
  httpOnly: true, // Hide the cookie from regular browser JavaScript.
  sameSite: "lax", // Allow normal same-site use while reducing cross-site cookie sending.
  secure: false, // Local development runs on plain HTTP, so this stays false here. In production over HTTPS, this should usually be true.
  path: "/", // Make the cookie available across the whole app.
};

export function createSessionMiddleware() {
  // Configure express-session once, then mount it on the app so every request can read or write req.session when needed.
  return session({
    name: sessionCookieName,
    // Use an environment secret when available; the fallback is only for local development.
    secret: process.env.SESSION_SECRET ?? "acrylic-books-dev-secret",
    // Do not rewrite the session store when nothing changed during the request.
    resave: false,
    // Do not create empty sessions for anonymous visitors before we store anything in them.
    saveUninitialized: false,
    cookie: sessionCookieOptions,
  });
}