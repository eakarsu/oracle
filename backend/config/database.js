const { Pool } = require('pg');
const { getConfig } = require('./environment');

function createPool(config = getConfig()) {
  const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: config.databaseSsl ? { rejectUnauthorized: true } : false,
    max: 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
  });

  pool.on('error', (error) => {
    console.error('Unexpected idle PostgreSQL client error', {
      name: error.name,
      code: error.code || 'unknown',
    });
  });
  return pool;
}

let defaultPool;

function getPool() {
  if (!defaultPool) defaultPool = createPool();
  return defaultPool;
}

module.exports = new Proxy({}, {
  get(_target, property) {
    if (property === 'createPool') return createPool;
    if (property === 'getPool') return getPool;
    const value = getPool()[property];
    return typeof value === 'function' ? value.bind(getPool()) : value;
  },
});
