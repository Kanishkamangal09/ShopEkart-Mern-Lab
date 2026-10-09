// Simple protection for development/admin-only routes.
// The request must send the header  x-admin-key: <ADMIN_KEY from .env>
function adminKeyMiddleware(req, res, next) {
  const adminKey = process.env.ADMIN_KEY;

  if (!adminKey || req.headers['x-admin-key'] !== adminKey) {
    return res.status(403).json({ message: 'Admin access only' });
  }

  next();
}

module.exports = adminKeyMiddleware;
