// === Batch 11 Gaps & Frontend Mounts ===
import GapBudgetSimulatorPage from './pages/gap/GapBudgetSimulatorPage'
import GapTaxOptimizerPage from './pages/gap/GapTaxOptimizerPage'
import GapContractClauseAnalyzerPage from './pages/gap/GapContractClauseAnalyzerPage'
import GapFraudAnomalyDetectorPage from './pages/gap/GapFraudAnomalyDetectorPage'
import GapSkillsMatcherPage from './pages/gap/GapSkillsMatcherPage'
import GapInvoiceOcrPage from './pages/gap/GapInvoiceOcrPage'
import GapMultiEntityConsolidationPage from './pages/gap/GapMultiEntityConsolidationPage'
import GapApprovalEnginePage from './pages/gap/GapApprovalEnginePage'
import GapExternalAccountingSyncPage from './pages/gap/GapExternalAccountingSyncPage'
import GapMobileSelfServicePage from './pages/gap/GapMobileSelfServicePage'
import GapFieldOpsAppPage from './pages/gap/GapFieldOpsAppPage'
import GapApiGatewayPage from './pages/gap/GapApiGatewayPage'
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';
import AIAssistant from './pages/AIAssistant';
import AIAdvanced from './pages/AIAdvanced';
import Analytics from './pages/Analytics';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { section: 'FINANCE' },
  { path: '/finance', label: 'Transactions', icon: '💰' },
  { path: '/general-ledger', label: 'General Ledger', icon: '📒' },
  { path: '/accounts-payable', label: 'Accounts Payable', icon: '📤' },
  { path: '/accounts-receivable', label: 'Accounts Receivable', icon: '📥' },
  { path: '/budgets', label: 'Budgets', icon: '💵' },
  { path: '/tax', label: 'Tax Management', icon: '🏛️' },
  { path: '/expenses', label: 'Expenses', icon: '🧾' },
  { path: '/cash-management', label: 'Cash Management', icon: '🏦' },
  { path: '/fixed-assets', label: 'Fixed Assets', icon: '🏗️' },
  { section: 'SALES & CRM' },
  { path: '/sales', label: 'Sales Orders', icon: '🛒' },
  { path: '/crm', label: 'CRM', icon: '🤝' },
  { path: '/contracts', label: 'Contracts', icon: '📝' },
  { path: '/pricing', label: 'Pricing & Quotes', icon: '💲' },
  { section: 'PROCUREMENT' },
  { path: '/procurement', label: 'Purchase Orders', icon: '📦' },
  { path: '/vendors', label: 'Vendors', icon: '🏪' },
  { section: 'HR & PEOPLE' },
  { path: '/hr', label: 'Employees', icon: '👥' },
  { path: '/payroll', label: 'Payroll', icon: '💳' },
  { path: '/recruitment', label: 'Recruitment', icon: '🎯' },
  { path: '/training', label: 'Training', icon: '🎓' },
  { path: '/timesheet', label: 'Timesheets', icon: '⏰' },
  { path: '/benefits', label: 'Benefits', icon: '🩺' },
  { path: '/leave-management', label: 'Leave Mgmt', icon: '🌴' },
  { path: '/performance-reviews', label: 'Reviews', icon: '⭐' },
  { section: 'MARKETING' },
  { path: '/marketing', label: 'Campaigns', icon: '📣' },
  { section: 'OPERATIONS' },
  { path: '/inventory', label: 'Inventory', icon: '🏭' },
  { path: '/supply-chain', label: 'Supply Chain', icon: '🚚' },
  { path: '/manufacturing', label: 'Manufacturing', icon: '⚙️' },
  { path: '/assets', label: 'Assets', icon: '🏢' },
  { path: '/quality', label: 'Quality Mgmt', icon: '🔍' },
  { path: '/warehouse', label: 'Warehouse', icon: '📦' },
  { path: '/work-orders', label: 'Work Orders', icon: '🔧' },
  { path: '/shipping', label: 'Shipping', icon: '✈️' },
  { path: '/returns', label: 'Returns/RMA', icon: '↩️' },
  { section: 'SUPPORT & DOCS' },
  { path: '/helpdesk', label: 'Helpdesk', icon: '🎧' },
  { path: '/documents', label: 'Documents', icon: '📄' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/knowledge-base', label: 'Knowledge Base', icon: '📚' },
  { section: 'GOVERNANCE' },
  { path: '/compliance', label: 'Compliance', icon: '✅' },
  { path: '/projects', label: 'Projects', icon: '📋' },
  { path: '/risk-management', label: 'Risk Mgmt', icon: '⚠️' },
  { path: '/audit-trail', label: 'Audit Trail', icon: '🔏' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { section: 'ADMIN & AI' },
  { path: '/user-management', label: 'User Mgmt', icon: '🔐' },
  { path: '/ai', label: 'AI Assistant', icon: '🤖' },
  { path: '/ai-advanced', label: 'AI Advanced', icon: '✨' },
];

function Sidebar({ user, onLogout }) {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">O</div>
        <div>
          <h1>Oracle ERP</h1>
          <span>Enterprise Platform</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item, i) =>
          item.section ? (
            <div key={i} className="sidebar-section">{item.section}</div>
          ) : (
            <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'active' : ''}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          )
        )}
        <div className="sidebar-section">ACCOUNT</div>
        <button onClick={onLogout}>
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </nav>
      {user && (
        <div className="sidebar-user">
          <div className="avatar">{user.name?.[0] || 'U'}</div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppLayout({ children, user, onLogout }) {
  return (
    <div className="app-layout">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="main-content">{children}</main>
    </div>
  );
}

function ProtectedRoutes({ user, onLogout }) {
  return (
    <AppLayout user={user} onLogout={onLogout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/finance" element={<ModulePage module="finance" title="Finance & Accounting" user={user} />} />
        <Route path="/general-ledger" element={<ModulePage module="general-ledger" title="General Ledger" user={user} />} />
        <Route path="/accounts-payable" element={<ModulePage module="accounts-payable" title="Accounts Payable" user={user} />} />
        <Route path="/accounts-receivable" element={<ModulePage module="accounts-receivable" title="Accounts Receivable" user={user} />} />
        <Route path="/budgets" element={<ModulePage module="budgets" title="Budget Management" user={user} />} />
        <Route path="/tax" element={<ModulePage module="tax" title="Tax Management" user={user} />} />
        <Route path="/expenses" element={<ModulePage module="expenses" title="Expense Reports" user={user} />} />
        <Route path="/cash-management" element={<ModulePage module="cash-management" title="Cash Management" user={user} />} />
        <Route path="/fixed-assets" element={<ModulePage module="fixed-assets" title="Fixed Assets" user={user} />} />
        <Route path="/hr" element={<ModulePage module="hr" title="Human Resources" user={user} />} />
        <Route path="/payroll" element={<ModulePage module="payroll" title="Payroll" user={user} />} />
        <Route path="/recruitment" element={<ModulePage module="recruitment" title="Recruitment" user={user} />} />
        <Route path="/training" element={<ModulePage module="training" title="Training & Development" user={user} />} />
        <Route path="/timesheet" element={<ModulePage module="timesheet" title="Time & Attendance" user={user} />} />
        <Route path="/benefits" element={<ModulePage module="benefits" title="Benefits Administration" user={user} />} />
        <Route path="/leave-management" element={<ModulePage module="leave-management" title="Leave Management" user={user} />} />
        <Route path="/performance-reviews" element={<ModulePage module="performance-reviews" title="Performance Reviews" user={user} />} />
        <Route path="/inventory" element={<ModulePage module="inventory" title="Inventory Management" user={user} />} />
        <Route path="/crm" element={<ModulePage module="crm" title="CRM" user={user} />} />
        <Route path="/sales" element={<ModulePage module="sales" title="Sales Orders" user={user} />} />
        <Route path="/procurement" element={<ModulePage module="procurement" title="Procurement" user={user} />} />
        <Route path="/vendors" element={<ModulePage module="vendors" title="Vendor Management" user={user} />} />
        <Route path="/contracts" element={<ModulePage module="contracts" title="Contract Management" user={user} />} />
        <Route path="/pricing" element={<ModulePage module="pricing" title="Pricing & Quotes" user={user} />} />
        <Route path="/projects" element={<ModulePage module="projects" title="Project Management" user={user} />} />
        <Route path="/assets" element={<ModulePage module="assets" title="Asset Management" user={user} />} />
        <Route path="/supply-chain" element={<ModulePage module="supply-chain" title="Supply Chain" user={user} />} />
        <Route path="/manufacturing" element={<ModulePage module="manufacturing" title="Manufacturing" user={user} />} />
        <Route path="/quality" element={<ModulePage module="quality" title="Quality Management" user={user} />} />
        <Route path="/warehouse" element={<ModulePage module="warehouse" title="Warehouse Management" user={user} />} />
        <Route path="/work-orders" element={<ModulePage module="work-orders" title="Work Orders & Maintenance" user={user} />} />
        <Route path="/shipping" element={<ModulePage module="shipping" title="Shipping Management" user={user} />} />
        <Route path="/returns" element={<ModulePage module="returns" title="Returns & RMA" user={user} />} />
        <Route path="/marketing" element={<ModulePage module="marketing" title="Marketing Campaigns" user={user} />} />
        <Route path="/helpdesk" element={<ModulePage module="helpdesk" title="Helpdesk & Support" user={user} />} />
        <Route path="/documents" element={<ModulePage module="documents" title="Document Management" user={user} />} />
        <Route path="/notifications" element={<ModulePage module="notifications" title="Notifications" user={user} />} />
        <Route path="/knowledge-base" element={<ModulePage module="knowledge-base" title="Knowledge Base" user={user} />} />
        <Route path="/compliance" element={<ModulePage module="compliance" title="Compliance & Audit" user={user} />} />
        <Route path="/risk-management" element={<ModulePage module="risk-management" title="Risk Management" user={user} />} />
        <Route path="/audit-trail" element={<ModulePage module="audit-trail" title="Audit Trail" user={user} />} />
        <Route path="/user-management" element={<ModulePage module="user-management" title="User Management" user={user} />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai" element={<AIAssistant />} />
        <Route path="/ai-advanced" element={<AIAdvanced />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <BrowserRouter>
      {user ? (
        <ProtectedRoutes user={user} onLogout={handleLogout} />
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
              {/* === Batch 11 Gaps & Frontend Mounts === */}
        <Route path="/gap/budget-simulator" element={<GapBudgetSimulatorPage />} />
        <Route path="/gap/tax-optimizer" element={<GapTaxOptimizerPage />} />
        <Route path="/gap/contract-clause-analyzer" element={<GapContractClauseAnalyzerPage />} />
        <Route path="/gap/fraud-anomaly-detector" element={<GapFraudAnomalyDetectorPage />} />
        <Route path="/gap/skills-matcher" element={<GapSkillsMatcherPage />} />
        <Route path="/gap/invoice-ocr" element={<GapInvoiceOcrPage />} />
        <Route path="/gap/multi-entity-consolidation" element={<GapMultiEntityConsolidationPage />} />
        <Route path="/gap/approval-engine" element={<GapApprovalEnginePage />} />
        <Route path="/gap/external-accounting-sync" element={<GapExternalAccountingSyncPage />} />
        <Route path="/gap/mobile-self-service" element={<GapMobileSelfServicePage />} />
        <Route path="/gap/field-ops-app" element={<GapFieldOpsAppPage />} />
        <Route path="/gap/api-gateway" element={<GapApiGatewayPage />} />
      </Routes>
      )}
    </BrowserRouter>
  );
}
