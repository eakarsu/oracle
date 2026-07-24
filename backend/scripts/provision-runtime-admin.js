const bcrypt = require('bcryptjs');
const { getPool } = require('../config/database');

async function main() {
  const email = String(process.env.PROVISION_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.PROVISION_ADMIN_PASSWORD || '');
  const fullName = String(process.env.PROVISION_ADMIN_NAME || 'Runtime Administrator').trim();
  if (!email || password.length < 12) throw new Error('Acceptance administrator credentials are required');
  const pool = getPool();
  try {
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO users(email,password_hash,full_name,role,department,active)
       VALUES($1,$2,$3,'admin','Administration',TRUE)
       ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash,
         full_name=EXCLUDED.full_name, role='admin', department='Administration', active=TRUE,
         auth_version=users.auth_version+1, updated_at=NOW()`,
      [email, hash, fullName]
    );
    console.log(`Oracle runtime administrator ready: ${email}`);
  } finally { await pool.end(); }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
