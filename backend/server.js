const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/hr', require('./routes/hr'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/crm', require('./routes/crm'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/procurement', require('./routes/procurement'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/assets', require('./routes/assets'));
app.use('/api/supply-chain', require('./routes/supply-chain'));
app.use('/api/compliance', require('./routes/compliance'));
app.use('/api/general-ledger', require('./routes/general-ledger'));
app.use('/api/accounts-payable', require('./routes/accounts-payable'));
app.use('/api/accounts-receivable', require('./routes/accounts-receivable'));
app.use('/api/payroll', require('./routes/payroll'));
app.use('/api/recruitment', require('./routes/recruitment'));
app.use('/api/training', require('./routes/training'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/quality', require('./routes/quality'));
app.use('/api/manufacturing', require('./routes/manufacturing'));
app.use('/api/helpdesk', require('./routes/helpdesk'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/timesheet', require('./routes/timesheet'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/tax', require('./routes/tax'));
app.use('/api/cash-management', require('./routes/cash-management'));
app.use('/api/fixed-assets', require('./routes/fixed-assets'));
app.use('/api/benefits', require('./routes/benefits'));
app.use('/api/leave-management', require('./routes/leave-management'));
app.use('/api/performance-reviews', require('./routes/performance-reviews'));
app.use('/api/marketing', require('./routes/marketing'));
app.use('/api/work-orders', require('./routes/work-orders'));
app.use('/api/warehouse', require('./routes/warehouse'));
app.use('/api/returns', require('./routes/returns'));
app.use('/api/pricing', require('./routes/pricing'));
app.use('/api/risk-management', require('./routes/risk-management'));
app.use('/api/audit-trail', require('./routes/audit-trail'));
app.use('/api/user-management', require('./routes/user-management'));
app.use('/api/knowledge-base', require('./routes/knowledge-base'));
app.use('/api/shipping', require('./routes/shipping'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n  🚀 Oracle ERP Backend running on http://localhost:${PORT}\n`);
});
