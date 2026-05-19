// MappingRulesEditor.jsx — CRUD editor for integration mapping rules (NON-VIZ)
import React, { useEffect, useState } from 'react';

const EMPTY = {
  name: '', sourceEntity: '', sourceField: '',
  targetSystem: '', targetField: '', transform: 'NONE', active: true,
};

export default function MappingRulesEditor() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = () => localStorage.getItem('token');
  const headers = () => ({
    'Content-Type': 'application/json',
    ...(token() ? { Authorization: 'Bearer ' + token() } : {}),
  });

  const load = async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch('/api/custom-views/rules', { headers: headers() });
      const j = await r.json();
      setRules(j.rules || []);
    } catch (e) { setError(String(e)); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const reset = () => { setForm(EMPTY); setEditingId(null); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = editingId ? `/api/custom-views/rules/${editingId}` : '/api/custom-views/rules';
      const method = editingId ? 'PUT' : 'POST';
      const r = await fetch(url, { method, headers: headers(), body: JSON.stringify(form) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Save failed');
      reset();
      load();
    } catch (e) { setError(String(e.message || e)); }
  };

  const startEdit = (rule) => {
    setEditingId(rule.id);
    setForm({
      name: rule.name, sourceEntity: rule.sourceEntity, sourceField: rule.sourceField,
      targetSystem: rule.targetSystem, targetField: rule.targetField,
      transform: rule.transform, active: rule.active,
    });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this mapping rule?')) return;
    try {
      await fetch(`/api/custom-views/rules/${id}`, { method: 'DELETE', headers: headers() });
      if (editingId === id) reset();
      load();
    } catch (e) { setError(String(e)); }
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Mapping Rules Editor</h3>
      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
        Define how Oracle entities map into external integration systems.
      </div>

      <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, marginBottom: 12 }}>
        <input style={inp} placeholder="Rule name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input style={inp} placeholder="Source entity (e.g. Customers)" value={form.sourceEntity} onChange={e => setForm({ ...form, sourceEntity: e.target.value })} required />
        <input style={inp} placeholder="Source field" value={form.sourceField} onChange={e => setForm({ ...form, sourceField: e.target.value })} />
        <input style={inp} placeholder="Target system (e.g. SAP)" value={form.targetSystem} onChange={e => setForm({ ...form, targetSystem: e.target.value })} required />
        <input style={inp} placeholder="Target field" value={form.targetField} onChange={e => setForm({ ...form, targetField: e.target.value })} />
        <input style={inp} placeholder="Transform (NONE / UPPER / PREFIX:X)" value={form.transform} onChange={e => setForm({ ...form, transform: e.target.value })} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
          <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
          Active
        </label>
        <div style={{ display: 'flex', gap: 8, gridColumn: '1 / -1' }}>
          <button type="submit" style={btnPrimary}>{editingId ? 'Update Rule' : 'Add Rule'}</button>
          {editingId && <button type="button" onClick={reset} style={btnGhost}>Cancel</button>}
        </div>
      </form>

      {error && <div style={{ padding: 8, background: '#fee', color: '#c33', borderRadius: 6, fontSize: 12, marginBottom: 8 }}>{error}</div>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
              <th style={th}>Name</th>
              <th style={th}>Source</th>
              <th style={th}>Target</th>
              <th style={th}>Transform</th>
              <th style={th}>Active</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} style={{ padding: 12, textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && rules.length === 0 && <tr><td colSpan={6} style={{ padding: 12, textAlign: 'center', color: '#6b7280' }}>No rules yet.</td></tr>}
            {rules.map(r => (
              <tr key={r.id}>
                <td style={td}>{r.name}</td>
                <td style={td}>{r.sourceEntity}.{r.sourceField}</td>
                <td style={td}>{r.targetSystem} → {r.targetField}</td>
                <td style={td}>{r.transform}</td>
                <td style={td}>{r.active ? 'Yes' : 'No'}</td>
                <td style={td}>
                  <button onClick={() => startEdit(r)} style={btnGhostSm}>Edit</button>{' '}
                  <button onClick={() => remove(r.id)} style={btnDangerSm}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inp = { padding: 8, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12 };
const btnPrimary = { background: '#2563eb', color: '#fff', border: 0, padding: '8px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer' };
const btnGhost = { background: '#fff', color: '#374151', border: '1px solid #d1d5db', padding: '8px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer' };
const btnGhostSm = { background: '#fff', color: '#374151', border: '1px solid #d1d5db', padding: '2px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer' };
const btnDangerSm = { background: '#fee', color: '#c33', border: '1px solid #fcc', padding: '2px 8px', borderRadius: 4, fontSize: 11, cursor: 'pointer' };
const th = { padding: 6, borderBottom: '1px solid #e5e7eb' };
const td = { padding: 6, borderBottom: '1px solid #f3f4f6' };
