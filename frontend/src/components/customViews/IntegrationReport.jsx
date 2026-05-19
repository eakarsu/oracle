// IntegrationReport.jsx — PDF-ready integration report (NON-VIZ)
import React, { useEffect, useState } from 'react';

export default function IntegrationReport() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    const token = localStorage.getItem('token');
    fetch('/api/custom-views/report', {
      headers: token ? { Authorization: 'Bearer ' + token } : {},
    })
      .then(r => r.json())
      .then(setData)
      .catch(e => setError(String(e)));
  };

  useEffect(load, []);

  const printPdf = () => {
    window.print();
  };

  const downloadJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'oracle-integration-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) return <div style={{ color: '#c33', padding: 12 }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: 12 }}>Loading report…</div>;

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{data.title}</h3>
          <div style={{ fontSize: 11, color: '#6b7280' }}>
            Generated {new Date(data.generatedAt).toLocaleString()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={load} style={btnGhost}>Refresh</button>
          <button onClick={downloadJson} style={btnGhost}>Download JSON</button>
          <button onClick={printPdf} style={btnPrimary}>Print / Save as PDF</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
        {Object.entries(data.summary).map(([k, v]) => (
          <div key={k} style={card}>
            <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>{k.replace(/([A-Z])/g, ' $1')}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <h4 style={sectionTitle}>Top Performers</h4>
          <ul style={{ paddingLeft: 16, fontSize: 12, margin: 0 }}>
            {data.topPerformers.map((p, i) => (
              <li key={i}>
                <strong>{p.entity}</strong> @ {p.system} — {p.successRate}%
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={sectionTitle}>Under Performers</h4>
          <ul style={{ paddingLeft: 16, fontSize: 12, margin: 0 }}>
            {data.underPerformers.map((p, i) => (
              <li key={i}>
                <strong>{p.entity}</strong> @ {p.system} — {p.successRate}% · {p.errors} errors
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <h4 style={sectionTitle}>Mapping Rule Status</h4>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
              <th style={th}>Name</th>
              <th style={th}>Target System</th>
              <th style={th}>Active</th>
            </tr>
          </thead>
          <tbody>
            {data.ruleStatus.map(r => (
              <tr key={r.id}>
                <td style={td}>{r.name}</td>
                <td style={td}>{r.targetSystem}</td>
                <td style={td}>{r.active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const btnPrimary = { background: '#2563eb', color: '#fff', border: 0, padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' };
const btnGhost = { background: '#fff', color: '#374151', border: '1px solid #d1d5db', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer' };
const card = { padding: 10, background: '#f9fafb', borderRadius: 6, border: '1px solid #e5e7eb' };
const sectionTitle = { fontSize: 13, fontWeight: 700, margin: '4px 0 8px' };
const th = { padding: 6, borderBottom: '1px solid #e5e7eb' };
const td = { padding: 6, borderBottom: '1px solid #f3f4f6' };
