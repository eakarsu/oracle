const test = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const { getConfig } = require('../config/environment');
const { migrationManifest, runMigrations } = require('../migrations/run');
const { createApp } = require('../server');

const enabled = process.env.ALLOW_TEST_DATABASE_RESET === '1';

function uuid() {
  return crypto.randomUUID();
}

async function jsonRequest(base, path, { cookie, method = 'GET', body, key } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(key ? { 'Idempotency-Key': key } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = response.status === 204 ? null : await response.json();
  return { response, data };
}

test('persistent procurement workflow enforces identity, scope, transitions, retries, and audit', { skip: !enabled }, async (t) => {
  const config = getConfig({ NODE_ENV: 'test' });
  const pool = new Pool({ connectionString: config.databaseUrl });
  const database = await pool.query('SELECT current_database() AS name');
  assert.match(database.rows[0].name, /(^oracle_verify_|_test$)/, 'refusing to reset a non-test database');

  await runMigrations(pool);
  await runMigrations(pool);
  await pool.query('TRUNCATE procurement_events, procurement_orders, users RESTART IDENTITY CASCADE');

  const password = 'test-only-password-12345';
  const passwordHash = await bcrypt.hash(password, 4);
  await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role, department) VALUES
      ('requester@example.test', $1, 'Rita Requester', 'user', 'Operations'),
      ('other@example.test', $1, 'Omar Other', 'user', 'Operations'),
      ('manager@example.test', $1, 'Manny Manager', 'manager', 'Procurement')`,
    [passwordHash],
  );

  const app = createApp({ pool, config, disableRateLimit: true });
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener));
  });
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
  });
  const address = server.address();
  const base = `http://127.0.0.1:${address.port}/api`;

  const allowedOrigin = await fetch(`${base}/health/live`, {
    headers: { Origin: 'http://127.0.0.1:3000' },
  });
  assert.equal(allowedOrigin.status, 200);
  assert.equal(allowedOrigin.headers.get('access-control-allow-origin'), 'http://127.0.0.1:3000');
  assert.equal(allowedOrigin.headers.get('cache-control'), 'no-store');
  assert.equal(allowedOrigin.headers.get('x-content-type-options'), 'nosniff');
  const [expectedMigration] = await migrationManifest();
  await pool.query(
    'UPDATE procurement_schema_migrations SET checksum = $2 WHERE name = $1',
    [expectedMigration.name, '0'.repeat(64)],
  );
  const checksumMismatch = await fetch(`${base}/health/ready`);
  assert.equal(checksumMismatch.status, 503);
  await pool.query(
    'UPDATE procurement_schema_migrations SET checksum = $2 WHERE name = $1',
    [expectedMigration.name, expectedMigration.checksum],
  );
  const checksumRestored = await fetch(`${base}/health/ready`);
  assert.equal(checksumRestored.status, 200);
  const forbiddenOrigin = await fetch(`${base}/health/live`, {
    headers: { Origin: 'https://attacker.example' },
  });
  assert.equal(forbiddenOrigin.status, 403);
  const unauthenticated = await jsonRequest(base, '/procurement');
  assert.equal(unauthenticated.response.status, 401);
  const retiredSurface = await jsonRequest(base, '/finance');
  assert.equal(retiredSurface.response.status, 404);
  const registration = await jsonRequest(base, '/auth/register', { method: 'POST', body: {} });
  assert.equal(registration.response.status, 404);

  async function login(email) {
    const { response, data } = await jsonRequest(base, '/auth/login', {
      method: 'POST', body: { email, password },
    });
    assert.equal(response.status, 200);
    assert.equal(Object.hasOwn(data, 'token'), false);
    const cookie = response.headers.get('set-cookie').split(';', 1)[0];
    assert.match(response.headers.get('set-cookie'), /HttpOnly/i);
    assert.match(response.headers.get('set-cookie'), /SameSite=Strict/i);
    return { cookie, user: data.user };
  }

  const requester = await login('requester@example.test');
  const other = await login('other@example.test');
  const manager = await login('manager@example.test');
  const badLogin = await jsonRequest(base, '/auth/login', {
    method: 'POST', body: { email: 'missing@example.test', password: 'wrong' },
  });
  assert.equal(badLogin.response.status, 401);

  const payload = {
    supplier_name: 'Acme Safety',
    supplier_email: 'orders@acme.example',
    item_description: 'Ten safety kits',
    quantity: 10,
    unit_cost: '12.50',
    total_cost: '0.01',
    status: 'approved',
  };
  const missingKey = await jsonRequest(base, '/procurement', {
    cookie: requester.cookie, method: 'POST', body: payload,
  });
  assert.equal(missingKey.response.status, 400);

  const createKey = uuid();
  const created = await jsonRequest(base, '/procurement', {
    cookie: requester.cookie, method: 'POST', key: createKey, body: payload,
  });
  assert.equal(created.response.status, 201);
  assert.equal(created.data.status, 'draft');
  assert.equal(created.data.total_cost, '125.00');
  assert.equal(created.data.created_by_user_id, requester.user.id);

  const replay = await jsonRequest(base, '/procurement', {
    cookie: requester.cookie, method: 'POST', key: createKey, body: payload,
  });
  assert.equal(replay.response.status, 200);
  assert.equal(replay.data.id, created.data.id);
  assert.equal(replay.data.idempotent_replay, true);
  const conflictingReplay = await jsonRequest(base, '/procurement', {
    cookie: requester.cookie,
    method: 'POST',
    key: createKey,
    body: { ...payload, quantity: 11 },
  });
  assert.equal(conflictingReplay.response.status, 409);

  const otherList = await jsonRequest(base, '/procurement', { cookie: other.cookie });
  assert.equal(otherList.response.status, 200);
  assert.deepEqual(otherList.data, []);
  const hidden = await jsonRequest(base, `/procurement/${created.data.id}`, { cookie: other.cookie });
  assert.equal(hidden.response.status, 404);
  const managerList = await jsonRequest(base, '/procurement', { cookie: manager.cookie });
  assert.equal(managerList.data.length, 1);

  const submitKey = uuid();
  const [submitted, submitReplay] = await Promise.all([
    jsonRequest(base, `/procurement/${created.data.id}/submit`, {
      cookie: requester.cookie, method: 'POST', key: submitKey,
    }),
    jsonRequest(base, `/procurement/${created.data.id}/submit`, {
      cookie: requester.cookie, method: 'POST', key: submitKey,
    }),
  ]);
  assert.equal(submitted.response.status, 200);
  assert.equal(submitted.data.status, 'submitted');
  assert.equal(submitReplay.response.status, 200);
  assert.equal(submitReplay.data.version, submitted.data.version);

  const requesterDecision = await jsonRequest(base, `/procurement/${created.data.id}/decision`, {
    cookie: requester.cookie, method: 'POST', key: uuid(), body: { decision: 'approved' },
  });
  assert.equal(requesterDecision.response.status, 403);
  const rejectedWithoutNote = await jsonRequest(base, `/procurement/${created.data.id}/decision`, {
    cookie: manager.cookie, method: 'POST', key: uuid(), body: { decision: 'rejected' },
  });
  assert.equal(rejectedWithoutNote.response.status, 400);
  const approvalKey = uuid();
  const approved = await jsonRequest(base, `/procurement/${created.data.id}/decision`, {
    cookie: manager.cookie, method: 'POST', key: approvalKey, body: { decision: 'approved', note: 'Within budget' },
  });
  assert.equal(approved.response.status, 200);
  assert.equal(approved.data.status, 'approved');
  const approvalReplay = await jsonRequest(base, `/procurement/${created.data.id}/decision`, {
    cookie: manager.cookie, method: 'POST', key: approvalKey, body: { decision: 'approved', note: 'Within budget' },
  });
  assert.equal(approvalReplay.response.status, 200);
  const changedApprovalReplay = await jsonRequest(base, `/procurement/${created.data.id}/decision`, {
    cookie: manager.cookie, method: 'POST', key: approvalKey, body: { decision: 'approved', note: 'Changed note' },
  });
  assert.equal(changedApprovalReplay.response.status, 409);

  const repeatDecision = await jsonRequest(base, `/procurement/${created.data.id}/decision`, {
    cookie: manager.cookie, method: 'POST', key: uuid(), body: { decision: 'approved' },
  });
  assert.equal(repeatDecision.response.status, 409);
  const deletion = await jsonRequest(base, `/procurement/${created.data.id}`, {
    cookie: manager.cookie, method: 'DELETE',
  });
  assert.equal(deletion.response.status, 405);

  const history = await jsonRequest(base, `/procurement/${created.data.id}/events`, { cookie: requester.cookie });
  assert.deepEqual(history.data.map((entry) => entry.event_type), ['created', 'submitted', 'approved']);
  await assert.rejects(
    pool.query("UPDATE procurement_events SET note = 'tampered' WHERE order_id = $1", [created.data.id]),
    (error) => error.code === '55000',
  );
  await assert.rejects(
    pool.query('DELETE FROM procurement_events WHERE order_id = $1', [created.data.id]),
    (error) => error.code === '55000',
  );
  await assert.rejects(
    pool.query("DELETE FROM users WHERE email = 'manager@example.test'"),
    (error) => error.code === '23503',
  );

  const managerOwned = await jsonRequest(base, '/procurement', {
    cookie: manager.cookie, method: 'POST', key: uuid(), body: payload,
  });
  await jsonRequest(base, `/procurement/${managerOwned.data.id}/submit`, {
    cookie: manager.cookie, method: 'POST', key: uuid(),
  });
  const selfDecision = await jsonRequest(base, `/procurement/${managerOwned.data.id}/decision`, {
    cookie: manager.cookie, method: 'POST', key: uuid(), body: { decision: 'approved' },
  });
  assert.equal(selfDecision.response.status, 403);

  const legacy = await pool.query(
    `INSERT INTO procurement_orders
       (po_number, supplier_name, item_description, quantity, unit_cost, total_cost, status, currency)
     VALUES ('LEGACY-SUBMITTED', 'Legacy Supplier', 'Unassigned legacy row', 1, 10, 10, 'submitted', 'USD')
     RETURNING id`,
  );
  const legacyDecision = await jsonRequest(base, `/procurement/${legacy.rows[0].id}/decision`, {
    cookie: manager.cookie, method: 'POST', key: uuid(), body: { decision: 'approved' },
  });
  assert.equal(legacyDecision.response.status, 409);

  const cancelledDraft = await jsonRequest(base, '/procurement', {
    cookie: other.cookie, method: 'POST', key: uuid(), body: payload,
  });
  const cancellationKey = uuid();
  const cancelled = await jsonRequest(base, `/procurement/${cancelledDraft.data.id}/cancel`, {
    cookie: other.cookie, method: 'POST', key: cancellationKey, body: { note: 'No longer required' },
  });
  assert.equal(cancelled.response.status, 200);
  assert.equal(cancelled.data.status, 'cancelled');
  const cancellationReplay = await jsonRequest(base, `/procurement/${cancelledDraft.data.id}/cancel`, {
    cookie: other.cookie, method: 'POST', key: cancellationKey, body: { note: 'No longer required' },
  });
  assert.equal(cancellationReplay.response.status, 200);
  const changedCancellationReplay = await jsonRequest(base, `/procurement/${cancelledDraft.data.id}/cancel`, {
    cookie: other.cookie, method: 'POST', key: cancellationKey, body: { note: 'Different reason' },
  });
  assert.equal(changedCancellationReplay.response.status, 409);

  const rejectedDraft = await jsonRequest(base, '/procurement', {
    cookie: requester.cookie, method: 'POST', key: uuid(), body: { ...payload, item_description: 'Over-budget item' },
  });
  await jsonRequest(base, `/procurement/${rejectedDraft.data.id}/submit`, {
    cookie: requester.cookie, method: 'POST', key: uuid(),
  });
  const rejected = await jsonRequest(base, `/procurement/${rejectedDraft.data.id}/decision`, {
    cookie: manager.cookie, method: 'POST', key: uuid(), body: { decision: 'rejected', note: 'Outside approved budget' },
  });
  assert.equal(rejected.response.status, 200);
  assert.equal(rejected.data.status, 'rejected');

  await pool.query("UPDATE users SET active = FALSE WHERE email = 'requester@example.test'");
  const disabled = await jsonRequest(base, '/procurement', { cookie: requester.cookie });
  assert.equal(disabled.response.status, 401);
});
