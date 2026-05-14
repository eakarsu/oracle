# Audit Note - oracle

Source: `_AUDIT/reports/batch_11.md` (lines 211-261).

## Original Audit Recommendations

### Missing AI Counterparts
- `/budget-simulator` for budget planning (budgets.js exists).
- `/tax-optimizer` for tax planning (tax.js exists).
- `/contract-analyzer` for procurement (contracts.js exists).
- `/anomaly-detector` for fraud/compliance monitoring (compliance.js exists).
- `/skills-matcher` for workforce planning (hr.js/training.js exist).

### Missing Non-AI Features
- Multi-entity/multi-company consolidation workflows.
- Workflow/approval routing for transactions.
- Integration with external accounting packages (QuickBooks sync).
- Self-service portal for employees (expenses, leave).
- Mobile app for field operations.

### Custom Feature Suggestions
1. Agentic Procurement Agent.
2. Real-time Financial Dashboard with anomaly alerts.
3. Tax Compliance Automation.
4. Multi-Entity Consolidation Agent.
5. Predictive Cash Flow.
6. Self-Service Voice Requests.

## Implementations Applied

Added 3 AI endpoints to `backend/routes/ai.js` (preserving existing OpenRouter pattern, auth middleware, and pg-driven structure):
- `POST /api/ai/budget-simulator`
- `POST /api/ai/tax-optimizer`
- `POST /api/ai/contract-analyzer`

All use the same `callOpenRouter` helper, return `response/model/usage/timestamp`, and validate API key configuration. No new dependencies.

## Backlog (Prioritized)

### High
- `/anomaly-detector` for compliance/fraud (needs decision: rules-based vs LLM only — leaving for product decision).
- `/skills-matcher` for workforce planning.
- Approval/workflow routing system (state machine across modules).

### Medium
- Multi-entity consolidation (data model changes).
- QuickBooks sync (external SDK dep).
- Self-service employee portal (UI work).

### Low / Product Decisions
- Mobile app.
- Voice request agent.
- Real-time streaming GL with WebSocket.

## Apply pass 3 (frontend)

- **Status:** LEFT-AS-IS. Frontend already wires the apply-2 endpoints.
- `frontend/src/pages/AIAdvanced.jsx` provides a tabbed UI (Budget Simulator / Tax Optimizer / Contract Analyzer) calling `api.aiBudgetSimulator`, `api.aiTaxOptimizer`, `api.aiContractAnalyzer`.
- Wrappers defined in `frontend/src/services/api.js` (lines 74-79) targeting `/ai/budget-simulator`, `/ai/tax-optimizer`, `/ai/contract-analyzer`.
- Page registered in `App.jsx` at `/ai-advanced` with sidebar nav link.
- JWT Bearer auth via `getHeaders()` helper reading `localStorage.token`; 401 redirects to `/login`.
- Results render through `react-markdown` and surface model/usage metadata.
- No FE changes needed. No deps installed.
