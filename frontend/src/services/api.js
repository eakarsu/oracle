const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: getHeaders(),
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (res.status === 403) {
    const data = await res.json();
    throw new Error(data.error || 'Insufficient permissions');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request('/auth/me'),

  // Generic CRUD
  getAll: (resource) => request(`/${resource}`),
  getOne: (resource, id) => request(`/${resource}/${id}`),
  create: (resource, data) => request(`/${resource}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (resource, id, data) => request(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (resource, id) => request(`/${resource}/${id}`, { method: 'DELETE' }),

  // Approval workflow
  approve: (resource, id) => request(`/${resource}/${id}/approve`, { method: 'PUT' }),
  reject: (resource, id) => request(`/${resource}/${id}/reject`, { method: 'PUT' }),

  // Analytics
  dashboard: () => request('/analytics/dashboard'),
  analyticsFinance: () => request('/analytics/finance'),
  analyticsHR: () => request('/analytics/hr'),
  analyticsSales: () => request('/analytics/sales'),
  analyticsCRM: () => request('/analytics/crm'),

  // AI
  aiChat: (message, context) => request('/ai/chat', { method: 'POST', body: JSON.stringify({ message, context }) }),
  aiAnalyzeFinance: () => request('/ai/analyze-finance', { method: 'POST' }),
  aiAnalyzeHR: () => request('/ai/analyze-hr', { method: 'POST' }),
  aiForecastSales: () => request('/ai/forecast-sales', { method: 'POST' }),
  aiOptimizeInventory: () => request('/ai/optimize-inventory', { method: 'POST' }),
  aiAssessRisk: () => request('/ai/assess-risk', { method: 'POST' }),
  aiHistory: () => request('/ai/history'),
  aiFillFields: (module, moduleTitle, fields, description, existingData) =>
    request('/ai/fill-fields', { method: 'POST', body: JSON.stringify({ module, moduleTitle, fields, description, existingData }) }),
  aiSummarizeRecords: (module, moduleTitle, records, recordCount, customPrompt) =>
    request('/ai/summarize-records', { method: 'POST', body: JSON.stringify({ module, moduleTitle, records, recordCount, customPrompt }) }),
  aiRecordSummary: (module, moduleTitle, record) =>
    request('/ai/record-summary', { method: 'POST', body: JSON.stringify({ module, moduleTitle, record }) }),
  aiRecordInsights: (module, moduleTitle, record, allRecords) =>
    request('/ai/record-insights', { method: 'POST', body: JSON.stringify({ module, moduleTitle, record, allRecords }) }),
};
