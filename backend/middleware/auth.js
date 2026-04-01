export function requireAdmin(req, res, next) {
  const adminPassword = process.env.ADMIN_PASSWORD || 'VALADMIN';
  const providedPassword = req.headers['x-admin-password'];

  if (providedPassword !== adminPassword) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  return next();
}
