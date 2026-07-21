const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const { getPool } = require('../config/database');

const MIGRATIONS_DIR = __dirname;
const ADVISORY_LOCK_ID = 781004219;

async function migrationFiles() {
  const entries = await fs.readdir(MIGRATIONS_DIR);
  return entries.filter((name) => /^\d+.*\.sql$/.test(name)).sort();
}

async function migrationManifest() {
  return Promise.all((await migrationFiles()).map(async (name) => {
    const sql = await fs.readFile(path.join(MIGRATIONS_DIR, name), 'utf8');
    return {
      name,
      sql,
      checksum: crypto.createHash('sha256').update(sql).digest('hex'),
    };
  }));
}

async function runMigrations(pool = getPool()) {
  const client = await pool.connect();
  let locked = false;
  try {
    await client.query('SELECT pg_advisory_lock($1)', [ADVISORY_LOCK_ID]);
    locked = true;
    await client.query(`
      CREATE TABLE IF NOT EXISTS procurement_schema_migrations (
        name TEXT PRIMARY KEY,
        checksum CHAR(64) NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    for (const { name, sql, checksum } of await migrationManifest()) {
      const prior = await client.query(
        'SELECT checksum FROM procurement_schema_migrations WHERE name = $1',
        [name],
      );
      if (prior.rowCount) {
        if (prior.rows[0].checksum !== checksum) {
          throw new Error(`Applied migration checksum mismatch: ${name}`);
        }
        continue;
      }

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO procurement_schema_migrations (name, checksum) VALUES ($1, $2)',
          [name, checksum],
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    try {
      if (locked) await client.query('SELECT pg_advisory_unlock($1)', [ADVISORY_LOCK_ID]);
    } finally {
      client.release();
    }
  }
}

if (require.main === module) {
  const pool = getPool();
  runMigrations(pool)
    .then(() => {
      console.log('Database migrations are current.');
    })
    .catch((error) => {
      console.error(`Migration failed: ${error.message}`);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { migrationManifest, runMigrations };
