const jwt = require('jsonwebtoken');
const { getConfig } = require('../config/environment');
const { getPool } = require('../config/database');

function signAccessToken(user, config = getConfig()) {
  return jwt.sign(
    {
      sub: String(user.id),
      ver: user.auth_version,
    },
    config.jwtSecret,
    {
      algorithm: 'HS256',
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
      expiresIn: config.accessTokenTtl,
    },
  );
}

function decodeCookie(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return '';
  }
}

function createAuthenticateToken({ pool = getPool(), config = getConfig() } = {}) {
  return async function authenticateToken(req, res, next) {
    try {
      const authorization = req.get('authorization') || '';
      const match = /^Bearer ([^\s]+)$/.exec(authorization);
      const cookies = Object.fromEntries(
        (req.headers.cookie || '').split(';').map((part) => {
          const separator = part.indexOf('=');
          if (separator < 0) return ['', ''];
          return [part.slice(0, separator).trim(), decodeCookie(part.slice(separator + 1))];
        }).filter(([name]) => name),
      );
      const token = match?.[1] || cookies.oracle_procurement_session;
      if (!token) return res.status(401).json({ error: 'Authentication required' });

      const claims = jwt.verify(token, config.jwtSecret, {
        algorithms: ['HS256'],
        issuer: config.jwtIssuer,
        audience: config.jwtAudience,
      });
      if (!/^\d+$/.test(String(claims.sub || '')) || !Number.isInteger(claims.ver)) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      const result = await pool.query(
        `SELECT id, email, full_name, role, department, active, auth_version
         FROM users WHERE id = $1`,
        [claims.sub],
      );
      const user = result.rows[0];
      if (!user || !user.active || user.auth_version !== claims.ver) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      req.user = {
        id: Number(user.id),
        email: user.email,
        name: user.full_name,
        role: user.role,
        department: user.department,
      };
      return next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError' || error.name === 'NotBeforeError') {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
      return next(error);
    }
  };
}

let defaultMiddleware;

function authenticateToken(req, res, next) {
  if (!defaultMiddleware) defaultMiddleware = createAuthenticateToken();
  return defaultMiddleware(req, res, next);
}

module.exports = { authenticateToken, createAuthenticateToken, signAccessToken };
