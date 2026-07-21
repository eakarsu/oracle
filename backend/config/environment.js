const path = require('path');
const dotenv = require('dotenv');

const PLACEHOLDER_SECRETS = new Set([
  'oracle-erp-jwt-secret',
  'change-me',
  'changeme',
  'secret',
  'replace-with-at-least-32-random-characters',
]);

let loaded = false;

function loadEnvironmentFile() {
  if (loaded) return;
  dotenv.config({ path: path.join(__dirname, '../../.env'), override: false, quiet: true });
  loaded = true;
}

function parseInteger(name, value, fallback, minimum, maximum) {
  const raw = value === undefined || value === '' ? String(fallback) : String(value);
  if (!/^\d+$/.test(raw)) {
    throw new Error(`${name} must be an integer between ${minimum} and ${maximum}`);
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} must be an integer between ${minimum} and ${maximum}`);
  }
  return parsed;
}

function parseBoolean(name, value, fallback = false) {
  if (value === undefined || value === '') return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`${name} must be either true or false`);
}

function parseOrigins(value, nodeEnv) {
  if (!value && nodeEnv === 'test') return ['http://127.0.0.1:3000'];
  if (!value) throw new Error('CORS_ORIGINS is required');

  const origins = value.split(',').map((entry) => entry.trim()).filter(Boolean);
  if (!origins.length) throw new Error('CORS_ORIGINS must contain at least one origin');

  for (const origin of origins) {
    let url;
    try {
      url = new URL(origin);
    } catch {
      throw new Error('CORS_ORIGINS entries must be absolute http(s) origins');
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin || url.pathname !== '/') {
      throw new Error('CORS_ORIGINS entries must be absolute http(s) origins without paths');
    }
    if (nodeEnv === 'production' && url.protocol !== 'https:') {
      throw new Error('Production CORS_ORIGINS entries must use https');
    }
  }
  return origins;
}

function parseTokenTtl(value = '15m') {
  const match = /^([1-9]\d*)(s|m|h)$/.exec(value);
  if (!match) throw new Error('ACCESS_TOKEN_TTL must use a duration such as 15m');
  const multiplier = { s: 1000, m: 60_000, h: 3_600_000 }[match[2]];
  const milliseconds = Number(match[1]) * multiplier;
  if (!Number.isSafeInteger(milliseconds) || milliseconds < 5 * 60_000 || milliseconds > 60 * 60_000) {
    throw new Error('ACCESS_TOKEN_TTL must be between 5m and 60m');
  }
  return { value, milliseconds };
}

function getConfig(overrides = {}) {
  loadEnvironmentFile();
  const env = { ...process.env, ...overrides };
  const nodeEnv = env.NODE_ENV || 'development';

  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be development, test, or production');
  }
  if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required');

  let databaseUrl;
  try {
    databaseUrl = new URL(env.DATABASE_URL);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL URL');
  }
  if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol)) {
    throw new Error('DATABASE_URL must use the postgres or postgresql scheme');
  }
  if (['replace-me', 'changeme', 'password'].includes(databaseUrl.password.toLowerCase())) {
    throw new Error('DATABASE_URL contains a placeholder password');
  }

  const jwtSecret = env.JWT_SECRET || '';
  if (jwtSecret.length < 32 || PLACEHOLDER_SECRETS.has(jwtSecret.toLowerCase())) {
    throw new Error('JWT_SECRET must be a non-placeholder value of at least 32 characters');
  }

  const backendHost = env.BACKEND_HOST || '127.0.0.1';
  if (!/^[A-Za-z0-9.:[\]-]{1,253}$/.test(backendHost)) {
    throw new Error('BACKEND_HOST is invalid');
  }
  const loopbackHosts = new Set(['127.0.0.1', 'localhost', '::1', '[::1]']);
  if (!loopbackHosts.has(backendHost) && !parseBoolean('ALLOW_PUBLIC_BIND', env.ALLOW_PUBLIC_BIND, false)) {
    throw new Error('Set ALLOW_PUBLIC_BIND=true explicitly before using a non-loopback BACKEND_HOST');
  }

  const tokenTtl = parseTokenTtl(env.ACCESS_TOKEN_TTL || '15m');
  return Object.freeze({
    nodeEnv,
    databaseUrl: env.DATABASE_URL,
    databaseSsl: parseBoolean('DATABASE_SSL', env.DATABASE_SSL, false),
    jwtSecret,
    jwtIssuer: env.JWT_ISSUER || 'oracle-procurement',
    jwtAudience: env.JWT_AUDIENCE || 'oracle-procurement-web',
    accessTokenTtl: tokenTtl.value,
    accessTokenTtlMs: tokenTtl.milliseconds,
    backendHost,
    backendPort: parseInteger('BACKEND_PORT', env.BACKEND_PORT, 3001, 1, 65535),
    frontendPort: parseInteger('FRONTEND_PORT', env.FRONTEND_PORT, 3000, 1, 65535),
    corsOrigins: parseOrigins(env.CORS_ORIGINS, nodeEnv),
    trustProxy: parseBoolean('TRUST_PROXY', env.TRUST_PROXY, false),
    loginWindowMs: parseInteger('LOGIN_RATE_WINDOW_MS', env.LOGIN_RATE_WINDOW_MS, 15 * 60 * 1000, 1000, 24 * 60 * 60 * 1000),
    loginMax: parseInteger('LOGIN_RATE_MAX', env.LOGIN_RATE_MAX, 10, 1, 10000),
  });
}

module.exports = { getConfig };
