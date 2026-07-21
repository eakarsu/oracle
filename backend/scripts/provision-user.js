const bcrypt = require('bcryptjs');
const { getPool } = require('../config/database');

function required(name, maximum = 255) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  if (value.length > maximum) throw new Error(`${name} is too long`);
  return value;
}

async function provision() {
  const email = required('PROVISION_EMAIL').toLowerCase();
  const fullName = required('PROVISION_NAME');
  const password = required('PROVISION_PASSWORD', 1024);
  const role = required('PROVISION_ROLE', 20);
  const department = process.env.PROVISION_DEPARTMENT?.trim() || 'General';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('PROVISION_EMAIL is invalid');
  if (password.length < 14) throw new Error('PROVISION_PASSWORD must contain at least 14 characters');
  if (!['user', 'manager', 'admin'].includes(role)) throw new Error('PROVISION_ROLE must be user, manager, or admin');
  if (department.length > 100) throw new Error('PROVISION_DEPARTMENT is too long');

  const passwordHash = await bcrypt.hash(password, 12);
  const pool = getPool();
  try {
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role, department)
       VALUES ($1, $2, $3, $4, $5)`,
      [email, passwordHash, fullName, role, department],
    );
    console.log('User provisioned.');
  } finally {
    await pool.end();
  }
}

provision().catch((error) => {
  console.error(`Provisioning failed: ${error.code === '23505' ? 'email already exists' : error.message}`);
  process.exitCode = 1;
});
