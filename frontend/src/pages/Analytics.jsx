import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function BarChart({ data, labelKey, valueKey, color = 'var(--accent)' }) {
  if (!data?.length) return <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No data available</p>;
  const max = Math.max(...data.map(d => Number(d[valueKey]) || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 120, fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>
            {String(d[labelKey]).replace(/_/g, ' ')}
          </div>
          <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 4, height: 24, overflow: 'hidden' }}>
            <div style={{
              width: max > 0 ? `${(Number(d[valueKey]) / max) * 100}%` : '0%',
              height: '100%',
              background: color,
              borderRadius: 4,
              transition: 'width 0.5s ease',
              minWidth: Number(d[valueKey]) > 0 ? 4 : 0,
            }} />
          </div>
          <div style={{ width: 80, fontSize: 12, fontWeight: 600 }}>
            {Number(d[valueKey]).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, labelKey, valueKey }) {
  if (!data?.length) return <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No data available</p>;
  const total = data.reduce((s, d) => s + Number(d[valueKey] || 0), 0);
  const colors = ['#e94560', '#339af0', '#00d68f', '#ffaa00', '#845ef7', '#ff6b81', '#20c997', '#748ffc'];

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        {data.reduce((acc, d, i) => {
          const pct = total > 0 ? Number(d[valueKey]) / total : 0;
          const startAngle = acc.angle;
          const endAngle = acc.angle + pct * 360;
          const largeArc = pct > 0.5 ? 1 : 0;
          const x1 = 60 + 50 * Math.cos((startAngle - 90) * Math.PI / 180);
          const y1 = 60 + 50 * Math.sin((startAngle - 90) * Math.PI / 180);
          const x2 = 60 + 50 * Math.cos((endAngle - 90) * Math.PI / 180);
          const y2 = 60 + 50 * Math.sin((endAngle - 90) * Math.PI / 180);

          if (pct > 0) {
            acc.elements.push(
              <path key={i} d={`M60,60 L${x1},${y1} A50,50 0 ${largeArc},1 ${x2},${y2} Z`}
                fill={colors[i % colors.length]} />
            );
          }
          acc.angle = endAngle;
          return acc;
        }, { elements: [], angle: 0 }).elements}
        <circle cx="60" cy="60" r="30" fill="var(--bg-card)" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: colors[i % colors.length] }} />
            <span style={{ color: 'var(--text-secondary)' }}>
              {String(d[labelKey]).replace(/_/g, ' ')} ({Number(d[valueKey]).toLocaleString()})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    async function load() {
      try {
        const [dashboard, finance, hr, sales, crm] = await Promise.all([
          api.dashboard(),
          api.analyticsFinance(),
          api.analyticsHR(),
          api.analyticsSales(),
          api.analyticsCRM(),
        ]);
        setData({ dashboard, finance, hr, sales, crm });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'finance', label: 'Finance' },
    { id: 'hr', label: 'HR' },
    { id: 'sales', label: 'Sales' },
    { id: 'crm', label: 'CRM' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Analytics & Reports</h2>
          <p>Business intelligence and data visualization</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {tabs.map(t => (
          <button key={t.id}
            className={`btn ${tab === t.id ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && data.dashboard && (
        <div>
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value" style={{ color: '#00d68f' }}>${Number(data.dashboard.sales?.revenue || 0).toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Transactions</div>
              <div className="stat-value" style={{ color: '#e94560' }}>{data.dashboard.finance?.transactions || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Employees</div>
              <div className="stat-value" style={{ color: '#845ef7' }}>{data.dashboard.hr?.active_employees || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">CRM Pipeline</div>
              <div className="stat-value" style={{ color: '#339af0' }}>${Number(data.dashboard.crm?.pipeline_value || 0).toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Inventory Items</div>
              <div className="stat-value" style={{ color: '#ffaa00' }}>{data.dashboard.inventory?.items || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active Projects</div>
              <div className="stat-value" style={{ color: '#20c997' }}>{data.dashboard.projects?.active_projects || 0}</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'finance' && data.finance && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Revenue by Category</h3>
            <BarChart
              data={data.finance.by_category?.filter(d => d.type === 'income')}
              labelKey="category" valueKey="total" color="#00d68f"
            />
          </div>
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Expenses by Category</h3>
            <BarChart
              data={data.finance.by_category?.filter(d => d.type === 'expense')}
              labelKey="category" valueKey="total" color="#e94560"
            />
          </div>
        </div>
      )}

      {tab === 'hr' && data.hr && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Employees by Department</h3>
            <BarChart data={data.hr.by_department} labelKey="department" valueKey="count" color="#845ef7" />
          </div>
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Average Salary by Department</h3>
            <BarChart data={data.hr.by_department} labelKey="department" valueKey="avg_salary" color="#339af0" />
          </div>
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Employee Status</h3>
            <DonutChart data={data.hr.by_status} labelKey="status" valueKey="count" />
          </div>
        </div>
      )}

      {tab === 'sales' && data.sales && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Sales by Status</h3>
            <BarChart data={data.sales.by_status} labelKey="status" valueKey="total" color="#339af0" />
          </div>
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Orders by Status</h3>
            <DonutChart data={data.sales.by_status} labelKey="status" valueKey="count" />
          </div>
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Monthly Revenue</h3>
            <BarChart data={data.sales.by_month} labelKey="month" valueKey="total" color="#00d68f" />
          </div>
        </div>
      )}

      {tab === 'crm' && data.crm && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Pipeline by Stage</h3>
            <BarChart data={data.crm.by_stage} labelKey="stage" valueKey="total_value" color="#00d68f" />
          </div>
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Contacts by Stage</h3>
            <DonutChart data={data.crm.by_stage} labelKey="stage" valueKey="count" />
          </div>
        </div>
      )}
    </div>
  );
}
