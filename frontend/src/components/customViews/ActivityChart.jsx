// ActivityChart.jsx — Query/Integration activity (VIZ)
import React, { useEffect, useState } from 'react';

export default function ActivityChart() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/custom-views/activity', {
      headers: token ? { Authorization: 'Bearer ' + token } : {},
    })
      .then(r => r.json())
      .then(setData)
      .catch(e => setError(String(e)));
  }, []);

  if (error) return <div style={{ color: '#c33', padding: 12 }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: 12 }}>Loading activity…</div>;

  const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const W = 760;
  const H = 220;
  const PAD = 32;
  const days = data.series[0].points.length;
  const maxVal = Math.max(
    1,
    ...data.series.flatMap(s => s.points.map(p => p.queries + p.integrations))
  );
  const xStep = (W - PAD * 2) / (days - 1);
  const y = (v) => H - PAD - (v / maxVal) * (H - PAD * 2);

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Query / Integration Activity (14d)</h3>
          <div style={{ fontSize: 12, color: '#6b7280' }}>Per integration system, queries + integrations</div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {data.systems.map((s, i) => (
            <span key={s} style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, background: colors[i % colors.length], borderRadius: 2 }} />
              {s}
            </span>
          ))}
        </div>
      </div>
      <svg width={W} height={H} style={{ width: '100%', height: H }}>
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#e5e7eb" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#e5e7eb" />
        {data.series.map((s, i) => {
          const pts = s.points
            .map((p, idx) => `${PAD + idx * xStep},${y(p.queries + p.integrations)}`)
            .join(' ');
          return (
            <g key={s.system}>
              <polyline points={pts} fill="none" stroke={colors[i % colors.length]} strokeWidth="2" />
              {s.points.map((p, idx) => (
                <circle
                  key={idx}
                  cx={PAD + idx * xStep}
                  cy={y(p.queries + p.integrations)}
                  r="2.5"
                  fill={colors[i % colors.length]}
                />
              ))}
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8, marginTop: 8 }}>
        {data.totals.map((t, i) => (
          <div key={t.system} style={{ padding: 8, background: '#f9fafb', borderRadius: 6, fontSize: 12 }}>
            <div style={{ fontWeight: 700, color: colors[i % colors.length] }}>{t.system}</div>
            <div>{t.totalQueries} queries</div>
            <div>{t.totalIntegrations} integrations</div>
          </div>
        ))}
      </div>
    </div>
  );
}
