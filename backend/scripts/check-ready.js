const { getPool } = require('../config/database');
const { readiness } = require('../server');

const pool = getPool();
readiness(pool)
  .then((ready) => {
    if (!ready) throw new Error('required migrations or tables are missing');
    console.log('Database readiness check passed.');
  })
  .catch((error) => {
    console.error(`Database not ready: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
