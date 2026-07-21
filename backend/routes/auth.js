const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { getPool } = require('../config/database');
const { getConfig } = require('../config/environment');
const { createAuthenticateToken, signAccessToken } = require('../middleware/auth');

const DUMMY_PASSWORD_HASH = '$2a$12$hXUrQHnrsPkBNfht2myZpu8LXXb1yfXKQKqj5P1qBqQNuJwOqL9iK';

function publicUser(user) {
  return {
    id: Number(user.id),
    email: user.email,
    name: user.full_name,
    role: user.role,
    department: user.department,
  };
}

function validCredentialsShape(email, password) {
  return typeof email === 'string'
    && email.length >= 3
    && email.length <= 255
    && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    && typeof password === 'string'
    && password.length >= 1
    && password.length <= 1024;
}

function createAuthRouter({ pool = getPool(), config = getConfig(), disableRateLimit = false } = {}) {
  const router = express.Router();
  const authenticateToken = createAuthenticateToken({ pool, config });
  const loginLimiter = rateLimit({
    windowMs: config.loginWindowMs,
    limit: config.loginMax,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => disableRateLimit,
    handler: (_req, res) => res.status(429).json({ error: 'Too many login attempts; try again later' }),
  });

  router.post('/login', loginLimiter, async (req, res, next) => {
    try {
      const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
      const password = req.body?.password;
      if (!validCredentialsShape(email, password)) {
        await bcrypt.compare(String(password || ''), DUMMY_PASSWORD_HASH);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const result = await pool.query(
        `SELECT id, email, password_hash, full_name, role, department, active, auth_version
         FROM users WHERE email = $1`,
        [email],
      );
      const user = result.rows[0];
      const passwordHash = user?.password_hash || DUMMY_PASSWORD_HASH;
      const validPassword = await bcrypt.compare(password, passwordHash);
      if (!user || !user.active || !validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      res.cookie('oracle_procurement_session', signAccessToken(user, config), {
        httpOnly: true,
        sameSite: 'strict',
        secure: config.nodeEnv === 'production',
        path: '/api',
        maxAge: config.accessTokenTtlMs,
      });
      return res.json({ user: publicUser(user) });
    } catch (error) {
      return next(error);
    }
  });

  router.post('/register', (_req, res) => {
    res.status(404).json({ error: 'Self-registration is disabled' });
  });

  router.get('/me', authenticateToken, (req, res) => res.json(req.user));
  router.post('/logout', (_req, res) => {
    res.clearCookie('oracle_procurement_session', {
      httpOnly: true,
      sameSite: 'strict',
      secure: config.nodeEnv === 'production',
      path: '/api',
    });
    res.status(204).end();
  });
  return router;
}

module.exports = createAuthRouter;
module.exports.createAuthRouter = createAuthRouter;
module.exports.validCredentialsShape = validCredentialsShape;
