import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';

const EMPTY_ORDER = {
  supplier_name: '',
  supplier_email: '',
  item_description: '',
  quantity: 1,
  unit_cost: '',
  currency: 'USD',
  delivery_date: '',
  payment_terms: '',
};

const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });

function formatMoney(value, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(value));
  } catch {
    return money.format(Number(value));
  }
}

function formatTime(value) {
  return value ? new Date(value).toLocaleString() : '—';
}

export default function ProcurementApprovals({ user }) {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(EMPTY_ORDER);
  const [notes, setNotes] = useState({});
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const pendingKeys = useRef(new Map());

  const refresh = useCallback(async () => {
    setError('');
    try {
      setOrders(await api.procurement.list());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const total = useMemo(() => {
    const amount = Number(form.unit_cost) * Number(form.quantity);
    return Number.isFinite(amount) ? amount : 0;
  }, [form.quantity, form.unit_cost]);

  const runMutation = async (operation) => {
    setError('');
    setSaving(true);
    try {
      await operation();
      await refresh();
    } catch (requestError) {
      setError(`${requestError.message}${requestError.requestId ? ` (request ${requestError.requestId})` : ''}`);
    } finally {
      setSaving(false);
    }
  };

  const idempotentOperation = async (operationId, payload, operation) => {
    const fingerprint = JSON.stringify(payload ?? null);
    const pending = pendingKeys.current.get(operationId);
    const key = pending?.fingerprint === fingerprint ? pending.key : crypto.randomUUID();
    pendingKeys.current.set(operationId, { fingerprint, key });
    try {
      const result = await operation(key);
      pendingKeys.current.delete(operationId);
      return result;
    } catch (requestError) {
      if (requestError.status) pendingKeys.current.delete(operationId);
      throw requestError;
    }
  };

  const createOrder = (event) => {
    event.preventDefault();
    runMutation(async () => {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        supplier_email: form.supplier_email || undefined,
        delivery_date: form.delivery_date || undefined,
        payment_terms: form.payment_terms || undefined,
      };
      await idempotentOperation('create-order', payload, (key) => api.procurement.create(payload, key));
      setForm(EMPTY_ORDER);
    });
  };

  const showEvents = async (orderId) => {
    if (events[orderId]) {
      setEvents((current) => ({ ...current, [orderId]: undefined }));
      return;
    }
    try {
      const orderEvents = await api.procurement.events(orderId);
      setEvents((current) => ({ ...current, [orderId]: orderEvents }));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const isDecisionMaker = ['manager', 'admin'].includes(user.role);

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Purchase-order approvals</h2>
          <p>Requesters submit persistent orders; a different manager or administrator records the decision.</p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={refresh} disabled={loading || saving}>Refresh</button>
      </div>

      <div className="boundary-note">
        Retained product boundary: procurement approval only. Other historical ERP screens were generated prototypes and are intentionally not exposed.
      </div>
      {error && <div className="login-error workflow-error" role="alert">{error}</div>}

      <div className="workflow-grid">
        <form className="workflow-panel" onSubmit={createOrder}>
          <h3>New draft</h3>
          <label>Supplier name
            <input className="form-control" maxLength={255} value={form.supplier_name} onChange={(event) => setForm({ ...form, supplier_name: event.target.value })} required />
          </label>
          <label>Supplier email
            <input className="form-control" type="email" maxLength={255} value={form.supplier_email} onChange={(event) => setForm({ ...form, supplier_email: event.target.value })} />
          </label>
          <label>Item description
            <textarea className="form-control" maxLength={4000} value={form.item_description} onChange={(event) => setForm({ ...form, item_description: event.target.value })} required />
          </label>
          <div className="workflow-row">
            <label>Quantity
              <input className="form-control" type="number" min="1" max="1000000" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} required />
            </label>
            <label>Unit cost
              <input className="form-control" type="number" min="0.01" max="1000000000" step="0.01" value={form.unit_cost} onChange={(event) => setForm({ ...form, unit_cost: event.target.value })} required />
            </label>
          </div>
          <div className="workflow-row">
            <label>Currency
              <input className="form-control" pattern="[A-Za-z]{3}" maxLength={3} value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase() })} required />
            </label>
            <label>Delivery date
              <input className="form-control" type="date" value={form.delivery_date} onChange={(event) => setForm({ ...form, delivery_date: event.target.value })} />
            </label>
          </div>
          <label>Payment terms
            <input className="form-control" maxLength={100} value={form.payment_terms} onChange={(event) => setForm({ ...form, payment_terms: event.target.value })} />
          </label>
          <p className="calculated-total">Server-calculated total: {formatMoney(total, form.currency)}</p>
          <button className="btn btn-primary" type="submit" disabled={saving}>Create draft</button>
        </form>

        <div className="workflow-orders">
          <h3>{isDecisionMaker ? 'Approval queue and all orders' : 'My orders'}</h3>
          {loading ? <div className="loading-inline">Loading orders…</div> : orders.length === 0 ? <p className="empty-state">No orders yet.</p> : orders.map((order) => (
            <article className="order-card" key={order.id}>
              <div className="order-heading">
                <div>
                  <strong>{order.po_number}</strong>
                  <span>{order.supplier_name}</span>
                </div>
                <span className={`status-badge status-${order.status}`}>{order.status}</span>
              </div>
              <p>{order.item_description}</p>
              <dl className="order-facts">
                <div><dt>Total</dt><dd>{formatMoney(order.total_cost, order.currency)}</dd></div>
                <div><dt>Requester</dt><dd>{order.created_by_name || 'Legacy/unassigned'}</dd></div>
                <div><dt>Created</dt><dd>{formatTime(order.created_at)}</dd></div>
                <div><dt>Version</dt><dd>{order.version}</dd></div>
              </dl>
              {order.decision_note && <p className="decision-note"><strong>Decision note:</strong> {order.decision_note}</p>}
              <div className="order-actions">
                {order.status === 'draft' && order.created_by_user_id === user.id && (
                  <button className="btn btn-primary btn-sm" disabled={saving} onClick={() => runMutation(() => idempotentOperation(`submit-${order.id}`, null, (key) => api.procurement.submit(order.id, key)))}>Submit</button>
                )}
                {['draft', 'submitted'].includes(order.status) && order.created_by_user_id === user.id && (
                  <button className="btn btn-secondary btn-sm" disabled={saving || !notes[order.id]?.trim()} onClick={() => runMutation(() => idempotentOperation(`cancel-${order.id}`, { note: notes[order.id] }, (key) => api.procurement.cancel(order.id, notes[order.id], key)))}>Cancel</button>
                )}
                <button className="btn btn-secondary btn-sm" type="button" onClick={() => showEvents(order.id)}>{events[order.id] ? 'Hide history' : 'Show history'}</button>
              </div>
              {((isDecisionMaker && order.status === 'submitted' && order.created_by_user_id !== user.id) || (['draft', 'submitted'].includes(order.status) && order.created_by_user_id === user.id)) && (
                <label className="action-note">Decision/cancellation note
                  <textarea className="form-control" maxLength={2000} value={notes[order.id] || ''} onChange={(event) => setNotes({ ...notes, [order.id]: event.target.value })} />
                </label>
              )}
              {isDecisionMaker && order.status === 'submitted' && order.created_by_user_id !== user.id && (
                <div className="order-actions">
                  <button className="btn btn-success btn-sm" disabled={saving} onClick={() => runMutation(() => idempotentOperation(`approve-${order.id}`, { note: notes[order.id] || '' }, (key) => api.procurement.decide(order.id, 'approved', notes[order.id] || '', key)))}>Approve</button>
                  <button className="btn btn-danger btn-sm" disabled={saving || !notes[order.id]?.trim()} onClick={() => runMutation(() => idempotentOperation(`reject-${order.id}`, { note: notes[order.id] }, (key) => api.procurement.decide(order.id, 'rejected', notes[order.id], key)))}>Reject</button>
                </div>
              )}
              {events[order.id] && (
                <ol className="event-list">
                  {events[order.id].map((entry) => (
                    <li key={entry.id}>
                      <strong>{entry.event_type}</strong> by {entry.actor_name} ({entry.actor_role}) · {formatTime(entry.occurred_at)}
                      {entry.note && <span>{entry.note}</span>}
                    </li>
                  ))}
                </ol>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
