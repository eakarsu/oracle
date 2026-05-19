import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';

const TOOLS = [
  {
    id: 'budget',
    icon: '🧮',
    label: 'Budget Simulator',
    desc: 'Simulate budget scenarios and stress-test allocations',
    fields: [
      { key: 'scenario', label: 'Scenario', type: 'text', placeholder: 'e.g., 10% revenue drop, hiring freeze' },
      { key: 'fiscalYear', label: 'Fiscal Year', type: 'text', placeholder: 'e.g., FY2026' },
      { key: 'assumptions', label: 'Key Assumptions', type: 'textarea', rows: 4, placeholder: 'List assumptions (one per line)' },
    ],
    submit: (form) => api.aiBudgetSimulator({
      scenario: form.scenario,
      fiscalYear: form.fiscalYear,
      assumptions: form.assumptions ? form.assumptions.split(/\r?\n/).filter(Boolean) : [],
    }),
  },
  {
    id: 'tax',
    icon: '📑',
    label: 'Tax Optimizer',
    desc: 'Identify tax-saving opportunities and risks',
    fields: [
      { key: 'jurisdiction', label: 'Jurisdiction', type: 'text', placeholder: 'e.g., US Federal + California' },
      { key: 'entityType', label: 'Entity Type', type: 'text', placeholder: 'e.g., C-Corp, LLC' },
      { key: 'context', label: 'Financial Context', type: 'textarea', rows: 5, placeholder: 'Revenue, expenses, deductions, credits...' },
    ],
    submit: (form) => api.aiTaxOptimizer({
      jurisdiction: form.jurisdiction,
      entityType: form.entityType,
      context: form.context,
    }),
  },
  {
    id: 'contract',
    icon: '📜',
    label: 'Contract Analyzer',
    desc: 'Highlight risks, ambiguities, and key terms in a contract',
    fields: [
      { key: 'contractType', label: 'Contract Type', type: 'text', placeholder: 'e.g., MSA, NDA, vendor agreement' },
      { key: 'contractText', label: 'Contract Text', type: 'textarea', rows: 10, placeholder: 'Paste contract text here...' },
      { key: 'focus', label: 'Focus Areas', type: 'text', placeholder: 'e.g., termination, liability, IP' },
    ],
    submit: (form) => api.aiContractAnalyzer({
      contractType: form.contractType,
      contractText: form.contractText,
      focus: form.focus ? form.focus.split(',').map((s) => s.trim()).filter(Boolean) : [],
    }),
  },
  {
    id: 'skills',
    icon: '🧑‍💼',
    label: 'Skills Matcher',
    desc: 'Match employees / candidates against role skill requirements',
    fields: [
      { key: 'roleTitle', label: 'Role Title', type: 'text', placeholder: 'e.g., Senior Backend Engineer' },
      { key: 'requiredSkills', label: 'Required Skills (comma-separated)', type: 'text', placeholder: 'e.g., Node.js, PostgreSQL, AWS' },
      { key: 'niceToHaveSkills', label: 'Nice-to-have Skills (comma-separated, optional)', type: 'text', placeholder: 'e.g., Kafka, Terraform' },
      { key: 'candidates', label: 'Candidate Pool JSON (optional, leave empty to use employees table)', type: 'textarea', rows: 6, placeholder: '[{"name":"...","skills":["..."]}, ...]' },
    ],
    submit: (form) => {
      let candidates;
      if (form.candidates && form.candidates.trim()) {
        try { candidates = JSON.parse(form.candidates); } catch (e) {
          throw new Error('Candidates must be valid JSON array (or leave blank to use DB)');
        }
      }
      return api.aiSkillsMatcher({
        roleTitle: form.roleTitle,
        requiredSkills: form.requiredSkills ? form.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        niceToHaveSkills: form.niceToHaveSkills ? form.niceToHaveSkills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        ...(candidates ? { candidates } : {}),
      });
    },
  },
];

export default function AIAdvanced() {
  const [activeId, setActiveId] = useState('budget');
  const [forms, setForms] = useState({});
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState({});

  const tool = TOOLS.find((t) => t.id === activeId);
  const form = forms[activeId] || {};

  const setField = (key, value) => {
    setForms((prev) => ({ ...prev, [activeId]: { ...(prev[activeId] || {}), [key]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, [activeId]: true }));
    setErrors((prev) => ({ ...prev, [activeId]: null }));
    setResults((prev) => ({ ...prev, [activeId]: null }));
    try {
      const result = await tool.submit(form);
      setResults((prev) => ({ ...prev, [activeId]: result }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [activeId]: err.message || 'Request failed' }));
    } finally {
      setLoading((prev) => ({ ...prev, [activeId]: false }));
    }
  };

  const result = results[activeId];
  const error = errors[activeId];
  const isLoading = !!loading[activeId];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>AI Advanced</h2>
          <p>Budget simulation, tax optimization, and contract analysis</p>
        </div>
      </div>

      <div className="ai-container">
        <div className="ai-chat" style={{ padding: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
            {TOOLS.map((t) => (
              <button
                key={t.id}
                className={`btn ${activeId === t.id ? 'btn-primary' : ''}`}
                onClick={() => setActiveId(t.id)}
                type="button"
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: 8 }}>{tool.label}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{tool.desc}</p>

            {tool.fields.map((f) => (
              <div className="form-group" key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 4, fontSize: 13 }}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea
                    rows={f.rows || 3}
                    value={form[f.key] || ''}
                    onChange={(e) => setField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4, fontFamily: 'inherit', fontSize: 14 }}
                  />
                ) : (
                  <input
                    type={f.type}
                    value={form[f.key] || ''}
                    onChange={(e) => setField(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    style={{ width: '100%', padding: 8, border: '1px solid var(--border)', borderRadius: 4, fontSize: 14 }}
                  />
                )}
              </div>
            ))}

            <button className="btn btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Analyzing...' : `Run ${tool.label}`}
            </button>
          </form>

          {error && (
            <div className="ai-message ai" style={{ marginTop: 16, color: 'var(--danger, #c0392b)' }}>
              <div className="msg-label">Error</div>
              <div className="msg-content">{error}</div>
            </div>
          )}

          {isLoading && (
            <div className="ai-message ai" style={{ marginTop: 16 }}>
              <div className="msg-label">AI Assistant</div>
              <div className="msg-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  <span>Analyzing...</span>
                </div>
              </div>
            </div>
          )}

          {result && !isLoading && (
            <div className="ai-message ai" style={{ marginTop: 16 }}>
              <div className="msg-label">AI Assistant</div>
              <div className="msg-content">
                {result.response ? (
                  <ReactMarkdown>{result.response}</ReactMarkdown>
                ) : (
                  <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(result, null, 2)}</pre>
                )}
              </div>
              {(result.model || result.usage) && (
                <div className="msg-meta">
                  {result.model && <span>Model: {result.model}</span>}
                  {result.usage?.total_tokens && <span>Tokens: {result.usage.total_tokens}</span>}
                  {result.timestamp && <span>{new Date(result.timestamp).toLocaleTimeString()}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
