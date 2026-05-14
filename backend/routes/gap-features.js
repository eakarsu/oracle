// === Batch 11 Gaps & Frontend Mounts ===
// Gap features (AI counterparts + Non-AI features) for oracle.
// Lazy gap_features table (in-memory), OpenRouter via native fetch.

const express = require('express');
const router = express.Router();

const gapFeatures = new Map();

async function llm(systemPrompt, userMsg, maxTokens = 1400) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) { const e = new Error('OPENROUTER_API_KEY not configured'); e.status = 503; throw e; }
  const model = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json', 'HTTP-Referer': 'http://localhost:3000', 'X-Title': 'oracle Gap Features' },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMsg }], max_tokens: maxTokens }),
  });
  const data = await r.json();
  if (data && data.error) throw new Error(data.error.message || 'LLM error');
  return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
}

function track(slug, payload) {
  const list = gapFeatures.get(slug) || [];
  list.push({ at: new Date().toISOString(), payload });
  gapFeatures.set(slug, list);
}

function safe(res, e) { return res.status((e && e.status) || 500).json({ error: (e && e.message) || 'request failed' }); }

// ---- AI Gap Counterparts ----

router.post('/gap-budget-simulator', async (req, res) => {
  try {
    const body = req.body || {};
    const sys = "You simulate budget what-if scenarios. Given current budget and adjustments, project P&L impact across departments.";
    const user = `Body: ${JSON.stringify(body).slice(0, 4000)}`;
    const out = await llm(sys, user);
    track('budget-simulator', { keys: Object.keys(body) });
    res.json({ simulation: out });
  } catch (e) { safe(res, e); }
});

router.post('/gap-tax-optimizer', async (req, res) => {
  try {
    const body = req.body || {};
    const sys = "You recommend tax optimization strategies (deductions, credits, entity structuring) appropriate to the jurisdiction.";
    const user = `Body: ${JSON.stringify(body).slice(0, 4000)}`;
    const out = await llm(sys, user);
    track('tax-optimizer', { keys: Object.keys(body) });
    res.json({ recommendations: out });
  } catch (e) { safe(res, e); }
});

router.post('/gap-contract-clause-analyzer', async (req, res) => {
  try {
    const body = req.body || {};
    const sys = "You analyze contract clauses for risks, missing protections, and recommended revisions.";
    const user = `Body: ${JSON.stringify(body).slice(0, 4000)}`;
    const out = await llm(sys, user);
    track('contract-clause-analyzer', { keys: Object.keys(body) });
    res.json({ analysis: out });
  } catch (e) { safe(res, e); }
});

router.post('/gap-fraud-anomaly-detector', async (req, res) => {
  try {
    const body = req.body || {};
    const sys = "You detect fraud and compliance anomalies across GL and AP transactions. Surface unusual patterns with severity.";
    const user = `Body: ${JSON.stringify(body).slice(0, 4000)}`;
    const out = await llm(sys, user);
    track('fraud-anomaly-detector', { keys: Object.keys(body) });
    res.json({ flags: out });
  } catch (e) { safe(res, e); }
});

router.post('/gap-skills-matcher', async (req, res) => {
  try {
    const body = req.body || {};
    const sys = "You match employees and candidates to roles and training needs based on skills and gaps.";
    const user = `Body: ${JSON.stringify(body).slice(0, 4000)}`;
    const out = await llm(sys, user);
    track('skills-matcher', { keys: Object.keys(body) });
    res.json({ matches: out });
  } catch (e) { safe(res, e); }
});

router.post('/gap-invoice-ocr', async (req, res) => {
  try {
    const body = req.body || {};
    const sys = "You extract structured fields from invoice text and auto-code to GL accounts.";
    const user = `Body: ${JSON.stringify(body).slice(0, 4000)}`;
    const out = await llm(sys, user);
    track('invoice-ocr', { keys: Object.keys(body) });
    res.json({ extraction: out });
  } catch (e) { safe(res, e); }
});

// ---- Non-AI Gap Features ----

router.post('/gap-multi-entity-consolidation', (req, res) => {
  const body = req.body || {};
  const record = { id: 'multi-entity-consolidation_' + Date.now(), ...body, createdAt: new Date().toISOString() };
  track('multi-entity-consolidation', record);
  res.json({ job: record, status: 'recorded' });
});

router.post('/gap-approval-engine', (req, res) => {
  const body = req.body || {};
  const record = { id: 'approval-engine_' + Date.now(), ...body, createdAt: new Date().toISOString() };
  track('approval-engine', record);
  res.json({ approval: record, status: 'recorded' });
});

router.post('/gap-external-accounting-sync', (req, res) => {
  const body = req.body || {};
  const record = { id: 'external-accounting-sync_' + Date.now(), ...body, createdAt: new Date().toISOString() };
  track('external-accounting-sync', record);
  res.json({ job: record, status: 'recorded' });
});

router.post('/gap-mobile-self-service', (req, res) => {
  const body = req.body || {};
  const record = { id: 'mobile-self-service_' + Date.now(), ...body, createdAt: new Date().toISOString() };
  track('mobile-self-service', record);
  res.json({ request: record, status: 'recorded' });
});

router.post('/gap-field-ops-app', (req, res) => {
  const body = req.body || {};
  const record = { id: 'field-ops-app_' + Date.now(), ...body, createdAt: new Date().toISOString() };
  track('field-ops-app', record);
  res.json({ workOrder: record, status: 'recorded' });
});

router.post('/gap-api-gateway', (req, res) => {
  const body = req.body || {};
  const record = { id: 'api-gateway_' + Date.now(), ...body, createdAt: new Date().toISOString() };
  track('api-gateway', record);
  res.json({ tenant: record, status: 'recorded' });
});

router.get('/gap-features/_audit', (req, res) => {
  const rows = [];
  for (const [k, v] of gapFeatures.entries()) rows.push({ feature: k, events: v.length });
  res.json({ rows });
});

module.exports = router;
