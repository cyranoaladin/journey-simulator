/**
 * Admin Authentication Middleware
 * Vérifie le header x-api-key contre ADMIN_API_KEY
 * Utilisé pour protéger les endpoints admin sensibles
 */

function adminAuth(req, res, next) {
  const apiKey = req.header('x-api-key');
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.error('[adminAuth] ADMIN_API_KEY not configured in environment');
    return res.status(500).json({
      success: false,
      error: 'Admin authentication not configured'
    });
  }

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'Admin API key required (x-api-key header)'
    });
  }

  if (apiKey !== expectedKey) {
    return res.status(403).json({
      success: false,
      error: 'Invalid admin API key'
    });
  }

  next();
}

module.exports = adminAuth;
