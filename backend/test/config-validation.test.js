const test = require('node:test');
const assert = require('node:assert/strict');
const { getConfig } = require('../config/environment');
const {
  ValidationError,
  decisionInput,
  orderInput,
} = require('../lib/procurement-validation');
const { destructiveResetSettings } = require('../seed');
const fs = require('node:fs');
const path = require('node:path');

const VALID = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:test@127.0.0.1:5432/oracle_test',
  JWT_SECRET: 'unit-test-secret-that-is-longer-than-thirty-two-characters',
  CORS_ORIGINS: 'http://127.0.0.1:3000',
};

test('configuration rejects weak secrets and malformed origins', () => {
  assert.throws(() => getConfig({ ...VALID, JWT_SECRET: 'short' }), /JWT_SECRET/);
  assert.throws(() => getConfig({ ...VALID, JWT_SECRET: 'replace-with-at-least-32-random-characters' }), /JWT_SECRET/);
  assert.throws(() => getConfig({ ...VALID, DATABASE_URL: 'postgresql://test:replace-me@127.0.0.1/oracle_test' }), /placeholder password/);
  assert.throws(() => getConfig({ ...VALID, CORS_ORIGINS: '*' }), /CORS_ORIGINS/);
  assert.throws(() => getConfig({ ...VALID, BACKEND_PORT: '3001junk' }), /BACKEND_PORT/);
  assert.throws(() => getConfig({ ...VALID, BACKEND_HOST: '0.0.0.0' }), /ALLOW_PUBLIC_BIND/);
  assert.throws(
    () => getConfig({ ...VALID, NODE_ENV: 'production', CORS_ORIGINS: 'http://example.com' }),
    /https/,
  );
  const config = getConfig(VALID);
  assert.equal(config.backendHost, '127.0.0.1');
});

test('order validation calculates totals and never trusts a caller total or status', () => {
  const parsed = orderInput({
    supplier_name: 'Acme',
    item_description: 'Safety equipment',
    quantity: 3,
    unit_cost: '12.25',
    total_cost: '1.00',
    status: 'approved',
  });
  assert.equal(parsed.totalCost, '36.75');
  assert.equal(Object.hasOwn(parsed, 'status'), false);
  assert.throws(() => orderInput({
    supplier_name: 'Acme', item_description: 'Thing', quantity: 1.5, unit_cost: 2,
  }), ValidationError);
  assert.throws(() => orderInput({
    supplier_name: 'Acme', item_description: 'Thing', quantity: 1, unit_cost: '2.999',
  }), /decimal places/);
  assert.throws(() => orderInput({
    supplier_name: 'Acme', item_description: 'Thing', quantity: 1, unit_cost: '2.00', delivery_date: '2026-02-30',
  }), /delivery_date/);
});

test('rejections require an attributable note', () => {
  assert.deepEqual(decisionInput({ decision: 'approved' }), { decision: 'approved', note: null });
  assert.throws(() => decisionInput({ decision: 'rejected', note: ' ' }), /rejection note/);
});

test('destructive demo reset is fail-closed', () => {
  const original = {
    NODE_ENV: process.env.NODE_ENV,
    CONFIRM_DESTRUCTIVE_RESET: process.env.CONFIRM_DESTRUCTIVE_RESET,
    DEMO_USER_PASSWORD: process.env.DEMO_USER_PASSWORD,
  };
  try {
    process.env.NODE_ENV = 'development';
    delete process.env.CONFIRM_DESTRUCTIVE_RESET;
    delete process.env.DEMO_USER_PASSWORD;
    assert.throws(() => destructiveResetSettings(), /CONFIRM_DESTRUCTIVE_RESET/);
    process.env.CONFIRM_DESTRUCTIVE_RESET = 'DELETE_ALL_ORACLE_DEMO_DATA';
    process.env.DEMO_USER_PASSWORD = 'password123';
    assert.throws(() => destructiveResetSettings(), /non-default/);
    process.env.NODE_ENV = 'production';
    process.env.DEMO_USER_PASSWORD = 'a-unique-long-test-password';
    assert.throws(() => destructiveResetSettings(), /disabled in production/);
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('normal startup cannot install, seed, migrate, kill ports, or start PostgreSQL', () => {
  const launcher = fs.readFileSync(path.join(__dirname, '../../start.sh'), 'utf8');
  assert.doesNotMatch(launcher, /^[ \t]*(?:npm|npx)(?:[ \t]+--prefix[ \t]+\S+)?[ \t]+(?:install|ci|run[ \t]+(?:migrate|reset:demo))\b|seed\/index|brew services|systemctl start|kill -9|xargs kill/m);
  assert.match(launcher, /kill "\$BACKEND_PID"/);
  assert.match(launcher, /check:ready/);
});
