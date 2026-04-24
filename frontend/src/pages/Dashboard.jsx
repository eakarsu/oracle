import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

const MODULES = [
  // Finance
  { key: 'finance', path: '/finance', icon: '💰', label: 'Finance & Accounting', desc: 'Manage transactions, budgets, and financial reporting', color: '#e94560', group: 'Finance' },
  { key: 'general-ledger', path: '/general-ledger', icon: '📒', label: 'General Ledger', desc: 'Chart of accounts, journal entries, and balances', color: '#ff6b81', group: 'Finance' },
  { key: 'accounts-payable', path: '/accounts-payable', icon: '📤', label: 'Accounts Payable', desc: 'Vendor invoices, bills, and payment processing', color: '#ff4757', group: 'Finance' },
  { key: 'accounts-receivable', path: '/accounts-receivable', icon: '📥', label: 'Accounts Receivable', desc: 'Customer invoices, collections, and aging', color: '#00d68f', group: 'Finance' },
  { key: 'budgets', path: '/budgets', icon: '💵', label: 'Budget Management', desc: 'Budget planning, allocation, and tracking', color: '#ffaa00', group: 'Finance' },
  { key: 'tax', path: '/tax', icon: '🏛️', label: 'Tax Management', desc: 'Tax filing, compliance, and reporting', color: '#845ef7', group: 'Finance' },
  { key: 'expenses', path: '/expenses', icon: '🧾', label: 'Expense Reports', desc: 'Employee expense submission and approval', color: '#f06595', group: 'Finance' },
  { key: 'cash-management', path: '/cash-management', icon: '🏦', label: 'Cash Management', desc: 'Bank accounts, transfers, and cash flow tracking', color: '#20c997', group: 'Finance' },
  { key: 'fixed-assets', path: '/fixed-assets', icon: '🏗️', label: 'Fixed Assets', desc: 'Asset depreciation, book value, and lifecycle', color: '#748ffc', group: 'Finance' },
  // Sales & CRM
  { key: 'sales', path: '/sales', icon: '🛒', label: 'Sales Orders', desc: 'Track orders, revenue, and customer purchases', color: '#339af0', group: 'Sales & CRM' },
  { key: 'crm', path: '/crm', icon: '🤝', label: 'CRM', desc: 'Customer relationships, leads, and pipeline', color: '#00d68f', group: 'Sales & CRM' },
  { key: 'contracts', path: '/contracts', icon: '📝', label: 'Contracts', desc: 'Contract lifecycle, renewals, and terms', color: '#748ffc', group: 'Sales & CRM' },
  { key: 'pricing', path: '/pricing', icon: '💲', label: 'Pricing & Quotes', desc: 'Quote generation, pricing rules, and discounts', color: '#e94560', group: 'Sales & CRM' },
  // Marketing
  { key: 'marketing', path: '/marketing', icon: '📣', label: 'Marketing Campaigns', desc: 'Campaign management, leads, ROI tracking', color: '#f06595', group: 'Marketing' },
  // Procurement
  { key: 'procurement', path: '/procurement', icon: '📦', label: 'Procurement', desc: 'Purchase orders, suppliers, and vendor management', color: '#ffaa00', group: 'Procurement' },
  { key: 'vendors', path: '/vendors', icon: '🏪', label: 'Vendor Management', desc: 'Vendor profiles, ratings, and spend analysis', color: '#20c997', group: 'Procurement' },
  // HR & People
  { key: 'hr', path: '/hr', icon: '👥', label: 'Human Resources', desc: 'Employee management, profiles, and directory', color: '#845ef7', group: 'HR & People' },
  { key: 'payroll', path: '/payroll', icon: '💳', label: 'Payroll', desc: 'Payroll processing, deductions, and tax withholding', color: '#e94560', group: 'HR & People' },
  { key: 'recruitment', path: '/recruitment', icon: '🎯', label: 'Recruitment', desc: 'Job postings, applicants, and hiring pipeline', color: '#339af0', group: 'HR & People' },
  { key: 'training', path: '/training', icon: '🎓', label: 'Training', desc: 'Training courses, certifications, and development', color: '#00d68f', group: 'HR & People' },
  { key: 'timesheet', path: '/timesheet', icon: '⏰', label: 'Timesheets', desc: 'Time tracking, attendance, and clock in/out', color: '#ffaa00', group: 'HR & People' },
  { key: 'benefits', path: '/benefits', icon: '🩺', label: 'Benefits Admin', desc: 'Health, dental, vision, retirement plan management', color: '#ff6b81', group: 'HR & People' },
  { key: 'leave-management', path: '/leave-management', icon: '🌴', label: 'Leave Management', desc: 'Vacation, sick leave, and time-off requests', color: '#748ffc', group: 'HR & People' },
  { key: 'performance-reviews', path: '/performance-reviews', icon: '⭐', label: 'Performance Reviews', desc: '360-degree reviews, goals, and development plans', color: '#f06595', group: 'HR & People' },
  // Operations
  { key: 'inventory', path: '/inventory', icon: '🏭', label: 'Inventory', desc: 'Stock management, warehousing, and reorder', color: '#ff6b81', group: 'Operations' },
  { key: 'supply-chain', path: '/supply-chain', icon: '🚚', label: 'Supply Chain', desc: 'Shipment tracking, logistics, and delivery', color: '#20c997', group: 'Operations' },
  { key: 'manufacturing', path: '/manufacturing', icon: '⚙️', label: 'Manufacturing', desc: 'Work orders, production lines, and output', color: '#748ffc', group: 'Operations' },
  { key: 'assets', path: '/assets', icon: '🏢', label: 'Asset Management', desc: 'Company assets, depreciation, and maintenance', color: '#f06595', group: 'Operations' },
  { key: 'quality', path: '/quality', icon: '🔍', label: 'Quality Management', desc: 'Inspections, defect tracking, and corrective actions', color: '#e94560', group: 'Operations' },
  { key: 'warehouse', path: '/warehouse', icon: '📦', label: 'Warehouse Mgmt', desc: 'Warehouse zones, capacity, and utilization tracking', color: '#339af0', group: 'Operations' },
  { key: 'work-orders', path: '/work-orders', icon: '🔧', label: 'Work Orders', desc: 'Maintenance scheduling, repairs, and inspections', color: '#845ef7', group: 'Operations' },
  { key: 'shipping', path: '/shipping', icon: '✈️', label: 'Shipping', desc: 'Shipment management, carriers, and tracking', color: '#ffaa00', group: 'Operations' },
  { key: 'returns', path: '/returns', icon: '↩️', label: 'Returns & RMA', desc: 'Return merchandise authorization and refunds', color: '#ff4757', group: 'Operations' },
  // Support & Docs
  { key: 'helpdesk', path: '/helpdesk', icon: '🎧', label: 'Helpdesk & Support', desc: 'Support tickets, SLAs, and resolution tracking', color: '#339af0', group: 'Support' },
  { key: 'documents', path: '/documents', icon: '📄', label: 'Documents', desc: 'Document management, versioning, and access control', color: '#845ef7', group: 'Support' },
  { key: 'notifications', path: '/notifications', icon: '🔔', label: 'Notifications', desc: 'System alerts, reminders, and action items', color: '#ffaa00', group: 'Support' },
  { key: 'knowledge-base', path: '/knowledge-base', icon: '📚', label: 'Knowledge Base', desc: 'Articles, guides, FAQs, and documentation', color: '#00d68f', group: 'Support' },
  // Governance
  { key: 'compliance', path: '/compliance', icon: '✅', label: 'Compliance & Audit', desc: 'Regulatory compliance, risk, and audit trails', color: '#ff8787', group: 'Governance' },
  { key: 'projects', path: '/projects', icon: '📋', label: 'Projects', desc: 'Project planning, tracking, and milestones', color: '#339af0', group: 'Governance' },
  { key: 'risk-management', path: '/risk-management', icon: '⚠️', label: 'Risk Management', desc: 'Risk identification, assessment, and mitigation', color: '#e94560', group: 'Governance' },
  { key: 'audit-trail', path: '/audit-trail', icon: '🔏', label: 'Audit Trail', desc: 'System activity log, security events, and tracking', color: '#748ffc', group: 'Governance' },
  { key: 'analytics', path: '/analytics', icon: '📈', label: 'Analytics', desc: 'Business intelligence, reports, and dashboards', color: '#845ef7', group: 'Governance' },
  // Admin & AI
  { key: 'user-management', path: '/user-management', icon: '🔐', label: 'User Management', desc: 'User accounts, roles, permissions, and access control', color: '#ff6b81', group: 'Admin' },
  { key: 'ai', path: '/ai', icon: '🤖', label: 'AI Assistant', desc: 'AI-powered analysis, forecasting, and insights', color: '#e94560', group: 'AI' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.dashboard().then(setStats).catch(console.error);
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Oracle ERP - 42 Enterprise Modules</p>
        </div>
      </div>

      {stats && (
        <div className="stat-cards">
          <div className="stat-card">
            <div className="stat-label">Total Revenue</div>
            <div className="stat-value" style={{ color: '#00d68f' }}>${Number(stats.sales?.revenue || 0).toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Employees</div>
            <div className="stat-value" style={{ color: '#845ef7' }}>{stats.hr?.active_employees || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">CRM Pipeline</div>
            <div className="stat-value" style={{ color: '#339af0' }}>${Number(stats.crm?.pipeline_value || 0).toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Inventory Value</div>
            <div className="stat-value" style={{ color: '#ffaa00' }}>${Number(stats.inventory?.total_value || 0).toLocaleString()}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Projects</div>
            <div className="stat-value" style={{ color: '#20c997' }}>{stats.projects?.active_projects || 0}</div>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        {MODULES.map((mod) => (
          <div key={mod.key} className="dash-card" onClick={() => navigate(mod.path)}>
            <div className="card-icon" style={{ background: `${mod.color}15`, color: mod.color }}>
              {mod.icon}
            </div>
            <h3>{mod.label}</h3>
            <p className="card-desc">{mod.desc}</p>
            <div className="card-stat-label" style={{ color: mod.color, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {mod.group}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
