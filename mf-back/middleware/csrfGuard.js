/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const csrf = require('csurf');

const csrfProtection = csrf({ cookie: { httpOnly: true, sameSite: 'lax' } });
const noopCsrf = csrf({ cookie: false, ignoreMethods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE'] });

function csrfGuard(req, res, next) {
  const allowCookieAuth = process.env.ALLOW_COOKIE_AUTH === 'true';
  const hasCookies = Boolean(req.headers.cookie);
  const hasBearer = Boolean(req.headers.authorization);

  if (hasCookies && !allowCookieAuth && !hasBearer) {
    return res.status(400).json({
      success: false,
      error: 'Cookie-based auth is disabled; use Authorization: Bearer',
    });
  }

  if (hasCookies && allowCookieAuth) {
    return csrfProtection(req, res, next);
  }

  // Stateless API (Bearer-only) or no cookies: skip csurf to avoid misconfiguration errors in tests
  return next();
}

module.exports = { csrfGuard };
