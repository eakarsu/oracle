const API_BASE = '/api';

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (options.body) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'same-origin',
  });
  const data = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error || `Request failed (${response.status})`);
    error.status = response.status;
    error.requestId = data?.request_id || response.headers.get('x-request-id');
    if (response.status === 401 && path !== '/auth/login' && path !== '/auth/me') {
      window.dispatchEvent(new Event('oracle-auth-expired'));
    }
    throw error;
  }
  return data;
}

function mutation(path, body, idempotencyKey = crypto.randomUUID()) {
  return request(path, {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export const api = {
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
  procurement: {
    list: () => request('/procurement'),
    events: (id) => request(`/procurement/${id}/events`),
    create: (order, key) => mutation('/procurement', order, key),
    submit: (id, key) => mutation(`/procurement/${id}/submit`, undefined, key),
    decide: (id, decision, note, key) => mutation(`/procurement/${id}/decision`, { decision, note }, key),
    cancel: (id, note, key) => mutation(`/procurement/${id}/cancel`, { note }, key),
  },
};
