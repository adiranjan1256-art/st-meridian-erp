// middleware/auth.js
// Verifies the Firebase ID token sent in the Authorization header.
// Attaches the decoded token to req.user on success.

import { auth } from "../config/firebase.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header." });
  }

  const idToken = header.split("Bearer ")[1];

  try {
    const decoded = await auth.verifyIdToken(idToken);
    req.user = decoded;          // uid, email, name, etc.
    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}
