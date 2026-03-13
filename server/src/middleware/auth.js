import { supabase } from "../lib/supabase.js";

/**
 * Middleware: verify the Supabase JWT from the Authorization header.
 * Attaches the authenticated user to req.user.
 */
export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ error: "Missing authorization token" });
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  req.user = user;
  next();
}
