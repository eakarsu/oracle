// customViews.js — Oracle ERP Custom Views
// Provides 4 endpoints for Integration/Query analytics, Entity sync heatmap,
// Integration report (PDF-ready payload), and Mapping rules CRUD.

const express = require('express');
const router = express.Router();

// ---- In-memory stores (seeded) ----------------------------------------------

const ORACLE_ENTITIES = [
  'GeneralLedger', 'AccountsPayable', 'AccountsReceivable', 'Employees',
  'Payroll', 'Inventory', 'SalesOrders', 'PurchaseOrders', 'Vendors',
  'Customers', 'Assets', 'Projects', 'Budgets', 'Contracts',
];

const INTEGRATION_SYSTEMS = ['SAP', 'Salesforce', 'NetSuite', 'Workday', 'Snowflake'];

function seedActivity() {
  // 14 days of integration/query activity per system
  const today = new Date();
  const series = INTEGRATION_SYSTEMS.map((sys, i) => {
    const points = [];
    for (let d = 13; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(today.getDate() - d);
      const day = date.toISOString().slice(0, 10);
      // deterministic-ish synthetic values
      const queries = 40 + ((i * 17 + d * 11) % 80);
      const integrations = 10 + ((i * 7 + d * 5) % 30);
      points.push({ date: day, queries, integrations });
    }
    return { system: sys, points };
  });
  return series;
}

function seedHeatmap() {
  // sync success-rate per entity per system (0..100)
  return ORACLE_ENTITIES.map((entity, e) => ({
    entity,
    cells: INTEGRATION_SYSTEMS.map((sys, s) => {
      const base = 70 + ((e * 13 + s * 19) % 30);
      const errors = (e * s) % 7;
      const inflight = (e + s) % 4;
      return {
        system: sys,
        successRate: base,
        errors,
        inflight,
        lastSync: new Date(Date.now() - ((e + s) * 37) * 60 * 1000).toISOString(),
      };
    }),
  }));
}

let mappingRules = [
  {
    id: 'rule_1',
    name: 'GL Account → SAP GL',
    sourceEntity: 'GeneralLedger',
    sourceField: 'account_code',
    targetSystem: 'SAP',
    targetField: 'GL_ACCT',
    transform: 'UPPER',
    active: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'rule_2',
    name: 'Customer → Salesforce Account',
    sourceEntity: 'Customers',
    sourceField: 'customer_id',
    targetSystem: 'Salesforce',
    targetField: 'Account.ExternalId__c',
    transform: 'NONE',
    active: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'rule_3',
    name: 'Employee → Workday Worker',
    sourceEntity: 'Employees',
    sourceField: 'employee_id',
    targetSystem: 'Workday',
    targetField: 'Worker_ID',
    transform: 'PREFIX:EMP-',
    active: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'rule_4',
    name: 'PO → NetSuite PurchaseOrder',
    sourceEntity: 'PurchaseOrders',
    sourceField: 'po_number',
    targetSystem: 'NetSuite',
    targetField: 'tranId',
    transform: 'NONE',
    active: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// ---- VIZ 1: Activity chart ---------------------------------------------------
router.get('/activity', (req, res) => {
  const series = seedActivity();
  const totals = series.map(s => ({
    system: s.system,
    totalQueries: s.points.reduce((a, p) => a + p.queries, 0),
    totalIntegrations: s.points.reduce((a, p) => a + p.integrations, 0),
  }));
  res.json({
    generatedAt: new Date().toISOString(),
    range: '14d',
    systems: INTEGRATION_SYSTEMS,
    series,
    totals,
  });
});

// ---- VIZ 2: Entity sync heatmap ---------------------------------------------
router.get('/heatmap', (req, res) => {
  const rows = seedHeatmap();
  res.json({
    generatedAt: new Date().toISOString(),
    entities: ORACLE_ENTITIES,
    systems: INTEGRATION_SYSTEMS,
    rows,
  });
});

// ---- NON-VIZ 1: Integration report (PDF-ready payload) ----------------------
router.get('/report', (req, res) => {
  const series = seedActivity();
  const heatmap = seedHeatmap();
  const totalQueries = series.reduce((a, s) => a + s.points.reduce((b, p) => b + p.queries, 0), 0);
  const totalIntegrations = series.reduce((a, s) => a + s.points.reduce((b, p) => b + p.integrations, 0), 0);
  const flatCells = heatmap.flatMap(r => r.cells.map(c => ({ entity: r.entity, ...c })));
  const avgSuccess = Math.round(
    flatCells.reduce((a, c) => a + c.successRate, 0) / flatCells.length
  );
  const totalErrors = flatCells.reduce((a, c) => a + c.errors, 0);
  const worst = [...flatCells].sort((a, b) => a.successRate - b.successRate).slice(0, 5);
  const best = [...flatCells].sort((a, b) => b.successRate - a.successRate).slice(0, 5);
  const activeRules = mappingRules.filter(r => r.active).length;
  res.json({
    title: 'Oracle ERP Integration Report',
    generatedAt: new Date().toISOString(),
    summary: {
      totalQueries,
      totalIntegrations,
      averageSuccessRate: avgSuccess,
      totalErrors,
      activeMappingRules: activeRules,
      totalMappingRules: mappingRules.length,
      systems: INTEGRATION_SYSTEMS.length,
      entities: ORACLE_ENTITIES.length,
    },
    topPerformers: best,
    underPerformers: worst,
    ruleStatus: mappingRules.map(r => ({
      id: r.id, name: r.name, active: r.active, targetSystem: r.targetSystem,
    })),
    pdfHint: 'Client may render this payload to PDF (e.g. window.print or jsPDF).',
  });
});

// ---- NON-VIZ 2: Mapping rules CRUD ------------------------------------------
router.get('/rules', (req, res) => {
  res.json({ rules: mappingRules, total: mappingRules.length });
});

router.post('/rules', express.json(), (req, res) => {
  const body = req.body || {};
  if (!body.name || !body.sourceEntity || !body.targetSystem) {
    return res.status(400).json({ error: 'name, sourceEntity, targetSystem are required' });
  }
  const rule = {
    id: 'rule_' + Date.now(),
    name: String(body.name),
    sourceEntity: String(body.sourceEntity),
    sourceField: String(body.sourceField || ''),
    targetSystem: String(body.targetSystem),
    targetField: String(body.targetField || ''),
    transform: String(body.transform || 'NONE'),
    active: body.active !== false,
    createdAt: new Date().toISOString(),
  };
  mappingRules.unshift(rule);
  res.status(201).json({ rule, total: mappingRules.length });
});

router.put('/rules/:id', express.json(), (req, res) => {
  const idx = mappingRules.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
  mappingRules[idx] = { ...mappingRules[idx], ...req.body, id: mappingRules[idx].id };
  res.json({ rule: mappingRules[idx] });
});

router.delete('/rules/:id', (req, res) => {
  const idx = mappingRules.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Rule not found' });
  const [removed] = mappingRules.splice(idx, 1);
  res.json({ removed, total: mappingRules.length });
});

module.exports = router;
