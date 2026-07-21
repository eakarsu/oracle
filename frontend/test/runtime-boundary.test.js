import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
const login = await readFile(new URL('../src/pages/Login.jsx', import.meta.url), 'utf8');
const api = await readFile(new URL('../src/services/api.js', import.meta.url), 'utf8');
const procurement = await readFile(new URL('../src/pages/ProcurementApprovals.jsx', import.meta.url), 'utf8');

test('frontend exposes only the retained procurement boundary', () => {
  assert.match(app, /ProcurementApprovals/);
  assert.doesNotMatch(app, /Gap|ModulePage|OrderToCash|AIAdvanced/);
});

test('frontend does not persist bearer tokens or expose shared demo credentials', () => {
  assert.doesNotMatch(`${app}\n${api}`, /localStorage|sessionStorage|Bearer/);
  assert.doesNotMatch(login, /password123|Demo Accounts|auto-fill/i);
  assert.match(api, /credentials: 'same-origin'/);
  assert.match(procurement, /pendingKeys/);
});
