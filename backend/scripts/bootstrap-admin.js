const bcrypt = require('bcryptjs');
const { getPool } = require('../config/database');

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function bootstrap() {
  if (process.env.BOOTSTRAP_ACKNOWLEDGEMENT !== 'create-initial-admin') {
    throw new Error('Set BOOTSTRAP_ACKNOWLEDGEMENT=create-initial-admin to confirm one-time administrator creation');
  }
  const email = required('BOOTSTRAP_ADMIN_EMAIL').toLowerCase();
  const password = required('BOOTSTRAP_ADMIN_PASSWORD');
  const fullName = required('BOOTSTRAP_ADMIN_NAME');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
    throw new Error('BOOTSTRAP_ADMIN_EMAIL is invalid');
  }
  if (password.length < 14 || password.length > 1024) {
    throw new Error('BOOTSTRAP_ADMIN_PASSWORD must contain 14 to 1024 characters');
  }
  if (fullName.length > 255) throw new Error('BOOTSTRAP_ADMIN_NAME is too long');

  const pool = getPool();
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('LOCK TABLE users IN EXCLUSIVE MODE');
      const count = await client.query("SELECT COUNT(*)::integer AS count FROM users WHERE role = 'admin'");
      if (count.rows[0].count !== 0) throw new Error('An administrator already exists; bootstrap is one-time only');
      const passwordHash = await bcrypt.hash(password, 12);
      await client.query(
        `INSERT INTO users (email, password_hash, full_name, role, department)
         VALUES ($1, $2, $3, 'admin', 'Administration')`,
        [email, passwordHash, fullName],
      );
      await client.query('COMMIT');
      console.log('Initial administrator created.');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

bootstrap().catch((error) => {
  console.error(`Bootstrap failed: ${error.message}`);
  process.exitCode = 1;
});
