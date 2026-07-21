const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { getConfig } = require('./config/environment');
const { getPool } = require('./config/database');
const { createAuthenticateToken } = require('./middleware/auth');
const { createAuthRouter } = require('./routes/auth');
const { createProcurementRouter } = require('./routes/procurement');
const { migrationManifest } = require('./migrations/run');

async function readiness(pool) {
  const result = await pool.query(`
    SELECT
      to_regclass('public.procurement_schema_migrations') IS NOT NULL AS migrations,
      to_regclass('public.users') IS NOT NULL AS users,
      to_regclass('public.procurement_orders') IS NOT NULL AS orders,
      to_regclass('public.procurement_events') IS NOT NULL AS events
  `);
  if (!Object.values(result.rows[0]).every(Boolean)) return false;
  const expected = await migrationManifest();
  const applied = await pool.query('SELECT name, checksum FROM procurement_schema_migrations ORDER BY name');
  if (expected.length !== applied.rowCount) return false;
  return expected.every((migration, index) => (
    migration.name === applied.rows[index].name
    && migration.checksum === applied.rows[index].checksum
  ));
}

function createApp({ pool = getPool(), config = getConfig(), disableRateLimit = false } = {}) {
  const app = express();
  if (config.trustProxy) app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use((req, res, next) => {
    const startedAt = process.hrtime.bigint();
    const supplied = req.get('x-request-id');
    req.requestId = supplied && /^[A-Za-z0-9._:-]{1,100}$/.test(supplied)
      ? supplied
      : crypto.randomUUID();
    res.set('x-request-id', req.requestId);
    res.once('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      console.log(JSON.stringify({
        event: 'http_request',
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl.split('?', 1)[0],
        status: res.statusCode,
        durationMs: Number(durationMs.toFixed(1)),
      }));
    });
    next();
  });
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        upgradeInsecureRequests: config.nodeEnv === 'production' ? [] : null,
      },
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
    hsts: config.nodeEnv === 'production' ? undefined : false,
  }));
  app.use(cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      const error = new Error('Origin is not allowed');
      error.status = 403;
      return callback(error);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Idempotency-Key', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    credentials: true,
    maxAge: 600,
  }));
  app.use(express.json({ limit: '64kb', strict: true }));
  app.use('/api', (_req, res, next) => {
    res.set('cache-control', 'no-store');
    next();
  });

  app.get('/api/health/live', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/health/ready', async (_req, res) => {
    try {
      const ready = await readiness(pool);
      res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not_ready' });
    } catch {
      res.status(503).json({ status: 'not_ready' });
    }
  });

  app.use('/api/auth', createAuthRouter({ pool, config, disableRateLimit }));
  app.use('/api/procurement', createAuthenticateToken({ pool, config }), createProcurementRouter({ pool }));

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found in the retained procurement boundary' });
  });

  const frontendDirectory = path.join(__dirname, 'public');
  if (fs.existsSync(path.join(frontendDirectory, 'index.html'))) {
    app.use(express.static(frontendDirectory, { index: false, maxAge: config.nodeEnv === 'production' ? '1h' : 0 }));
    app.get('/{*splat}', (_req, res) => res.sendFile(path.join(frontendDirectory, 'index.html')));
  }

  app.use((error, req, res, _next) => {
    const status = Number.isInteger(error.status) ? error.status
      : error.type === 'entity.too.large' ? 413
        : error.type === 'entity.parse.failed' ? 400
          : error.code === '23505' ? 409
            : 500;
    if (status >= 500) {
      console.error('Request failed', {
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl.split('?', 1)[0],
        name: error.name,
        code: error.code || 'unknown',
      });
    }
    const message = status >= 500
      ? 'Internal server error'
      : error.type === 'entity.too.large'
        ? 'Request body is too large'
        : error.type === 'entity.parse.failed'
          ? 'Malformed JSON request body'
          : error.code === '23505'
            ? 'Request conflicts with an existing record'
            : error.message;
    res.status(status).json({ error: message, request_id: req.requestId });
  });
  return app;
}

async function startServer({ pool = getPool(), config = getConfig() } = {}) {
  if (!(await readiness(pool))) {
    throw new Error('Database is not ready; run npm run migrate before starting');
  }
  const app = createApp({ pool, config });
  const server = await new Promise((resolve, reject) => {
    const listener = app.listen(config.backendPort, config.backendHost, () => resolve(listener));
    listener.once('error', reject);
  });
  console.log(`Procurement API listening on http://${config.backendHost}:${config.backendPort}`);
  return server;
}

if (require.main === module) {
  const pool = getPool();
  startServer({ pool })
    .then((server) => {
      const shutdown = (signal) => {
        console.log(`Received ${signal}; shutting down.`);
        server.close(() => pool.end().finally(() => process.exit(0)));
        setTimeout(() => process.exit(1), 10000).unref();
      };
      process.once('SIGTERM', () => shutdown('SIGTERM'));
      process.once('SIGINT', () => shutdown('SIGINT'));
    })
    .catch((error) => {
      console.error(`Startup failed: ${error.message}`);
      pool.end().finally(() => { process.exitCode = 1; });
    });
}

module.exports = { createApp, readiness, startServer };
