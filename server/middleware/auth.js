/* eslint-env node */

/**
 * requireAdmin middleware
 * Reads x-user-email header sent from the frontend with every request.
 * If it doesn't match ADMIN_EMAIL, returns 403.
 *
 * Frontend must send: headers: { 'x-user-email': user.email }
 */
export const requireAdmin = (req, res, next) => {
  const userEmail  = req.headers['x-user-email'];
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    return res.status(500).json({ error: 'ADMIN_EMAIL is not configured on the server.' });
  }

  if (!userEmail || userEmail.toLowerCase() !== adminEmail.toLowerCase()) {
    return res.status(403).json({ error: 'Access denied. Admin only.' });
  }

  next();
};
