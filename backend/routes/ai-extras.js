// AI Extras — Custom Feature Suggestions (batch 11)
// Procurement Agent, Real-time Financial Dashboard, Tax Compliance, Multi-Entity Consolidation,
// Predictive Cash Flow, Self-Service Voice Requests.

const express = require('express');
const https = require('https');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const router = express.Router();
router.use(authenticateToken);

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

function callLLM(systemPrompt, userPrompt, options = {}) {
  return new Promise((resolve, reject) => {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) return reject(Object.assign(new Error('OPENROUTER_API_KEY not configured'), { status: 503 }));

    const body = JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: options.maxTokens || 1800,
      temperature: options.temperature ?? 0.4,
    });

    const req = https.request({
      hostname: 'openrouter.ai',
      port: 443,
      path: '/api/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Oracle ERP AI Extras',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (resp) => {
      let chunks = '';
      resp.on('data', (c) => (chunks += c));
      resp.on('end', () => {
        try {
          const parsed = JSON.parse(chunks);
          if (parsed.error) return reject(new Error(parsed.error.message || 'LLM error'));
          resolve(parsed.choices?.[0]?.message?.content || '');
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function fail(res, err) {
  const status = err?.status || 500;
  return res.status(status).json({ error: err?.message || 'AI request failed' });
}

// 1) Agentic Procurement Agent — review RFQs, compare quotes, recommend best.
router.post('/procurement-agent', async (req, res) => {
  try {
    const { rfqId, vendorQuotes = [], criteria = {} } = req.body || {};
    if (!rfqId) return res.status(400).json({ error: 'rfqId required' });
    const sys = 'You are an enterprise procurement agent. Evaluate vendor quotes vs. criteria (price, delivery, quality, terms). Simulate one round of negotiation suggestions. Output JSON: { ranked: [{ vendorId, score, rationale, negotiationLeverPts }], recommendedAwardee, redFlags }.';
    const user = `RFQ: ${rfqId}\nCriteria: ${JSON.stringify(criteria)}\nQuotes: ${JSON.stringify(vendorQuotes).slice(0, 6000)}`;
    const out = await callLLM(sys, user, { maxTokens: 1800 });
    res.json({ raw: out });
  } catch (e) { fail(res, e); }
});

// 2) Real-time Financial Dashboard with anomaly alerts.
router.get('/financial-pulse', async (req, res) => {
  try {
    let snapshot = {};
    try {
      const ar = await pool.query('SELECT COUNT(*)::int AS open, COALESCE(SUM(amount),0)::float AS total FROM accounts_receivable_invoices WHERE status NOT IN (\'paid\',\'void\') LIMIT 1');
      snapshot.ar = ar.rows?.[0] || null;
    } catch {}
    try {
      const ap = await pool.query('SELECT COUNT(*)::int AS open, COALESCE(SUM(amount),0)::float AS total FROM accounts_payable_invoices WHERE status NOT IN (\'paid\',\'void\') LIMIT 1');
      snapshot.ap = ap.rows?.[0] || null;
    } catch {}
    const sys = 'You are a finance analyst. Given a live AR/AP snapshot, produce 3 anomaly callouts + 3 prioritized actions. Be terse.';
    const out = await callLLM(sys, `Snapshot: ${JSON.stringify(snapshot)}`, { maxTokens: 700 });
    res.json({ snapshot, narrative: out, at: new Date().toISOString() });
  } catch (e) { fail(res, e); }
});

// 3) Tax Compliance Automation — review transactions for flagged jurisdictions.
router.post('/tax-compliance-scan', async (req, res) => {
  try {
    const { transactions = [], jurisdiction = 'US', recentRuleChanges = '' } = req.body || {};
    if (!transactions.length) return res.status(400).json({ error: 'transactions[] required' });
    const sys = 'You are an enterprise tax compliance agent. Flag transactions that conflict with current rules. Suggest corrections / nexus implications. Output JSON: { flags: [{ transactionId, rule, severity, suggestedCorrection }], summary }.';
    const user = `Jurisdiction: ${jurisdiction}\nRecent rules: ${recentRuleChanges.slice(0, 2000)}\nTransactions: ${JSON.stringify(transactions).slice(0, 6000)}`;
    const out = await callLLM(sys, user, { maxTokens: 1800 });
    res.json({ raw: out });
  } catch (e) { fail(res, e); }
});

// 4) Multi-Entity Consolidation Agent — auto-reconcile inter-company.
router.post('/consolidate', async (req, res) => {
  try {
    const { entities = [], period } = req.body || {};
    if (!entities.length) return res.status(400).json({ error: 'entities[] required' });
    const sys = 'You are a controller running multi-entity consolidations. Identify inter-company transactions, propose eliminating journal entries, and produce a consolidated balance summary. Output JSON.';
    const user = `Period: ${period || 'current'}\nEntities: ${JSON.stringify(entities).slice(0, 6000)}`;
    const out = await callLLM(sys, user, { maxTokens: 1800 });
    res.json({ raw: out });
  } catch (e) { fail(res, e); }
});

// 5) Predictive Cash Flow — combine AR/AP/payroll/capex.
router.post('/cash-flow-forecast', async (req, res) => {
  try {
    const { arAging = [], apAging = [], payrollCadence = 'biweekly', capexPipeline = [], horizonWeeks = 12 } = req.body || {};
    const sys = 'You are a treasurer. Forecast weekly cash flow for the horizon, flag shortfalls, suggest financing or AR acceleration. Output JSON: { weeks: [{ week, inflow, outflow, ending }], shortfalls, recommendations }.';
    const user = `Horizon: ${horizonWeeks} weeks\nAR: ${JSON.stringify(arAging).slice(0, 3000)}\nAP: ${JSON.stringify(apAging).slice(0, 3000)}\nPayroll: ${payrollCadence}\nCapex: ${JSON.stringify(capexPipeline).slice(0, 2000)}`;
    const out = await callLLM(sys, user, { maxTokens: 2000 });
    res.json({ raw: out });
  } catch (e) { fail(res, e); }
});

// 6) Self-Service Voice Requests — voice command -> structured action.
router.post('/voice-action', async (req, res) => {
  try {
    const { transcript, userRole = 'employee' } = req.body || {};
    if (!transcript) return res.status(400).json({ error: 'transcript required' });
    const sys = 'You are a voice-to-action parser for an ERP. Convert spoken command into an action plan. Output JSON: { intent: "approve_expense|submit_pto|run_report|other", parameters: {...}, requiredApprovers: [...], confidence: 0-1 }.';
    const out = await callLLM(sys, `Role: ${userRole}\nTranscript: ${transcript}`, { maxTokens: 600 });
    res.json({ raw: out });
  } catch (e) { fail(res, e); }
});

module.exports = router;
