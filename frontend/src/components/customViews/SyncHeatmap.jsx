// SyncHeatmap.jsx — Entity sync success-rate heatmap (VIZ)
import React, { useEffect, useState } from 'react';

function colorFor(v) {
  if (v >= 95) return '#15803d';
  if (v >= 85) return '#22c55e';
  if (v >= 75) return '#eab308';
  if (v >= 65) return '#f97316';
  return '#dc2626';
}

export default function SyncHeatmap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [hover, setHover] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/custom-views/heatmap', {
      headers: token ? { Authorization: 'Bearer ' + token } : {},
    })
      .then(r => r.json())
      .then(setData)
      .catch(e => setError(String(e)));
  }, []);

  if (error) return <div style={{ color: '#c33', padding: 12 }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: 12 }}>Loading heatmap…</div>;

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Entity Sync Heatmap</h3>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
        Sync success-rate (%) per Oracle entity per integration system
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'separate', borderSpacing: 4, fontSize: 12 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 4 }}>Entity</th>
              {data.systems.map(s => (
                <th key={s} style={{ padding: 4, textAlign: 'center' }}>{s}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map(row => (
              <tr key={row.entity}>
                <td style={{ padding: 4, fontWeight: 600 }}>{row.entity}</td>
                {row.cells.map(cell => (
                  <td
                    key={cell.system}
                    onMouseEnter={() => setHover({ entity: row.entity, ...cell })}
                    onMouseLeave={() => setHover(null)}
                    style={{
                      width: 64,
                      height: 32,
                      background: colorFor(cell.successRate),
                      color: '#fff',
                      textAlign: 'center',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontWeight: 700,
                    }}
                  >
                    {cell.successRate}%
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11, alignItems: 'center' }}>
        <span>Legend:</span>
        {[60, 70, 80, 90, 100].map(v => (
          <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 14, height: 14, background: colorFor(v), borderRadius: 2 }} />
            {v}%
          </span>
        ))}
      </div>
      {hover && (
        <div style={{ marginTop: 10, padding: 10, background: '#f9fafb', borderRadius: 6, fontSize: 12 }}>
          <strong>{hover.entity} → {hover.system}</strong>: {hover.successRate}% success ·{' '}
          {hover.errors} errors · {hover.inflight} in-flight · last sync{' '}
          {new Date(hover.lastSync).toLocaleString()}
        </div>
      )}
    </div>
  );
}
