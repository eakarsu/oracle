// CustomViewsPage.jsx — Oracle Views landing
import React, { useState } from 'react';
import ActivityChart from '../components/customViews/ActivityChart';
import SyncHeatmap from '../components/customViews/SyncHeatmap';
import IntegrationReport from '../components/customViews/IntegrationReport';
import MappingRulesEditor from '../components/customViews/MappingRulesEditor';

const TABS = [
  { id: 'activity', label: 'Activity Chart' },
  { id: 'heatmap', label: 'Sync Heatmap' },
  { id: 'report', label: 'Integration Report' },
  { id: 'rules', label: 'Mapping Rules' },
];

export default function CustomViewsPage() {
  const [tab, setTab] = useState('activity');

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }} data-testid="oracle-views-title">
          Oracle Views — Custom Integration Console
        </h1>
        <p style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>
          Visualize query/integration activity, monitor entity sync health, generate integration
          reports, and manage mapping rules between Oracle ERP and external systems.
        </p>
      </header>

      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #e5e7eb', marginBottom: 16 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            data-testid={`tab-${t.id}`}
            style={{
              padding: '8px 14px',
              border: 0,
              borderBottom: tab === t.id ? '2px solid #2563eb' : '2px solid transparent',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: tab === t.id ? 700 : 500,
              color: tab === t.id ? '#2563eb' : '#374151',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === 'activity' && <ActivityChart />}
        {tab === 'heatmap' && <SyncHeatmap />}
        {tab === 'report' && <IntegrationReport />}
        {tab === 'rules' && <MappingRulesEditor />}
      </div>
    </div>
  );
}
