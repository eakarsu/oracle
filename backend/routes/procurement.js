const crypto = require('crypto');
const express = require('express');
const { getPool } = require('../config/database');
const {
  ValidationError,
  decisionInput,
  orderInput,
  positiveId,
  requestId,
} = require('../lib/procurement-validation');

const ORDER_COLUMNS = `
  po.id, po.po_number, po.supplier_name, po.supplier_email, po.item_description,
  po.quantity, po.unit_cost, po.total_cost, po.currency, po.status,
  po.delivery_date, po.payment_terms, po.version, po.submitted_at,
  po.decided_at, po.decision_note, po.order_date, po.created_at, po.updated_at,
  po.created_by_user_id, u.full_name AS created_by_name
`;

function canView(user, order) {
  return user.role === 'manager' || user.role === 'admin' || Number(order.created_by_user_id) === user.id;
}

function mapOrder(row) {
  const {
    idempotency_key: _idempotencyKey,
    request_fingerprint: _requestFingerprint,
    created_by: _legacyCreatedBy,
    ...publicRow
  } = row;
  return {
    ...publicRow,
    id: Number(row.id),
    created_by_user_id: row.created_by_user_id === null ? null : Number(row.created_by_user_id),
    quantity: Number(row.quantity),
    version: Number(row.version),
  };
}

async function withTransaction(pool, operation) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await operation(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function lockedOrder(client, id) {
  const result = await client.query(
    `SELECT po.*, u.full_name AS created_by_name
     FROM procurement_orders po
     LEFT JOIN users u ON u.id = po.created_by_user_id
     WHERE po.id = $1 FOR UPDATE OF po`,
    [id],
  );
  if (!result.rowCount) throw httpError(404, 'Order not found');
  return result.rows[0];
}

async function replayedTransition(client, orderId, key, eventType, actorUserId) {
  const result = await client.query(
    `SELECT po.*, u.full_name AS created_by_name,
            pe.request_fingerprint AS event_request_fingerprint
     FROM procurement_events pe
     JOIN procurement_orders po ON po.id = pe.order_id
     LEFT JOIN users u ON u.id = po.created_by_user_id
     WHERE pe.request_id = $1 AND pe.order_id = $2 AND pe.event_type = $3
       AND pe.actor_user_id = $4`,
    [key, orderId, eventType, actorUserId],
  );
  if (!result.rowCount) return null;
  const { event_request_fingerprint: fingerprint, ...order } = result.rows[0];
  return { fingerprint, order };
}

async function addEvent(client, { orderId, eventType, fromStatus, toStatus, user, key, fingerprint, note }) {
  await client.query(
    `INSERT INTO procurement_events
       (order_id, event_type, from_status, to_status, actor_user_id, actor_role,
        request_id, request_fingerprint, note)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [orderId, eventType, fromStatus, toStatus, user.id, user.role, key, fingerprint, note],
  );
}

function transitionFingerprint(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function replayOrderOrConflict(replay, fingerprint) {
  if (!replay) return null;
  if (replay.fingerprint !== fingerprint) {
    throw httpError(409, 'Idempotency-Key was already used with a different request');
  }
  return replay.order;
}

function createProcurementRouter({ pool = getPool() } = {}) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const requesterOnly = req.user.role === 'user';
      const result = await pool.query(
        `SELECT ${ORDER_COLUMNS}
         FROM procurement_orders po
         LEFT JOIN users u ON u.id = po.created_by_user_id
         ${requesterOnly ? 'WHERE po.created_by_user_id = $1' : ''}
         ORDER BY po.created_at DESC, po.id DESC`,
        requesterOnly ? [req.user.id] : [],
      );
      res.json(result.rows.map(mapOrder));
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id/events', async (req, res, next) => {
    try {
      const id = positiveId(req.params.id);
      const orderResult = await pool.query(
        'SELECT id, created_by_user_id FROM procurement_orders WHERE id = $1',
        [id],
      );
      if (!orderResult.rowCount) throw httpError(404, 'Order not found');
      if (!canView(req.user, orderResult.rows[0])) throw httpError(404, 'Order not found');
      const events = await pool.query(
        `SELECT pe.id, pe.event_type, pe.from_status, pe.to_status, pe.actor_role,
                pe.note, pe.occurred_at, u.full_name AS actor_name
         FROM procurement_events pe
         JOIN users u ON u.id = pe.actor_user_id
         WHERE pe.order_id = $1 ORDER BY pe.occurred_at, pe.id`,
        [id],
      );
      res.json(events.rows.map((event) => ({ ...event, id: Number(event.id) })));
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const id = positiveId(req.params.id);
      const result = await pool.query(
        `SELECT ${ORDER_COLUMNS}
         FROM procurement_orders po
         LEFT JOIN users u ON u.id = po.created_by_user_id WHERE po.id = $1`,
        [id],
      );
      if (!result.rowCount || !canView(req.user, result.rows[0])) throw httpError(404, 'Order not found');
      res.json(mapOrder(result.rows[0]));
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const input = orderInput(req.body);
      const key = requestId(req);
      const fingerprint = crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
      const response = await withTransaction(pool, async (client) => {
        const poNumber = `PO-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
        const created = await client.query(
          `INSERT INTO procurement_orders
             (po_number, supplier_name, supplier_email, item_description, quantity,
              unit_cost, total_cost, currency, status, delivery_date, payment_terms,
              created_by_user_id, idempotency_key, request_fingerprint)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'draft',$9,$10,$11,$12,$13)
           ON CONFLICT (created_by_user_id, idempotency_key)
             WHERE idempotency_key IS NOT NULL DO NOTHING
           RETURNING *`,
          [
            poNumber, input.supplierName, input.supplierEmail, input.itemDescription,
            input.quantity, input.unitCost, input.totalCost, input.currency,
            input.deliveryDate, input.paymentTerms, req.user.id, key, fingerprint,
          ],
        );
        if (!created.rowCount) {
          const replay = await client.query(
            `SELECT po.*, u.full_name AS created_by_name
             FROM procurement_orders po LEFT JOIN users u ON u.id = po.created_by_user_id
             WHERE po.created_by_user_id = $1 AND po.idempotency_key = $2`,
            [req.user.id, key],
          );
          if (replay.rows[0]?.request_fingerprint !== fingerprint) {
            throw httpError(409, 'Idempotency-Key was already used with a different request');
          }
          return { order: replay.rows[0], replay: true };
        }
        await addEvent(client, {
          orderId: created.rows[0].id,
          eventType: 'created',
          fromStatus: null,
          toStatus: 'draft',
          user: req.user,
          key,
          fingerprint,
          note: null,
        });
        return { order: { ...created.rows[0], created_by_name: req.user.name }, replay: false };
      });
      res.status(response.replay ? 200 : 201).json({ ...mapOrder(response.order), idempotent_replay: response.replay });
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/submit', async (req, res, next) => {
    try {
      const id = positiveId(req.params.id);
      const key = requestId(req);
      const fingerprint = transitionFingerprint({ action: 'submit' });
      const result = await withTransaction(pool, async (client) => {
        const order = await lockedOrder(client, id);
        if (Number(order.created_by_user_id) !== req.user.id) throw httpError(403, 'Only the requester can submit this order');
        const replay = replayOrderOrConflict(
          await replayedTransition(client, id, key, 'submitted', req.user.id),
          fingerprint,
        );
        if (replay) return replay;
        if (order.status !== 'draft') throw httpError(409, 'Only draft orders can be submitted');
        const updated = await client.query(
          `UPDATE procurement_orders SET status = 'submitted', submitted_at = NOW(),
             version = version + 1, updated_at = NOW() WHERE id = $1 RETURNING *`,
          [id],
        );
        await addEvent(client, {
          orderId: id, eventType: 'submitted', fromStatus: 'draft', toStatus: 'submitted',
          user: req.user, key, fingerprint, note: null,
        });
        return { ...updated.rows[0], created_by_name: order.created_by_name };
      });
      res.json(mapOrder(result));
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/decision', async (req, res, next) => {
    try {
      if (!['manager', 'admin'].includes(req.user.role)) throw httpError(403, 'Manager or admin role required');
      const id = positiveId(req.params.id);
      const key = requestId(req);
      const input = decisionInput(req.body);
      const fingerprint = transitionFingerprint({ action: 'decision', ...input });
      const result = await withTransaction(pool, async (client) => {
        const order = await lockedOrder(client, id);
        if (Number(order.created_by_user_id) === req.user.id) throw httpError(403, 'Requesters cannot approve or reject their own orders');
        const replay = replayOrderOrConflict(
          await replayedTransition(client, id, key, input.decision, req.user.id),
          fingerprint,
        );
        if (replay) return replay;
        if (order.created_by_user_id === null) {
          throw httpError(409, 'Legacy unassigned orders must be reconciled before a decision');
        }
        if (order.status !== 'submitted') throw httpError(409, 'Only submitted orders can receive a decision');
        const updated = await client.query(
          `UPDATE procurement_orders SET status = $2, decision_note = $3, decided_at = NOW(),
             version = version + 1, updated_at = NOW() WHERE id = $1 RETURNING *`,
          [id, input.decision, input.note],
        );
        await addEvent(client, {
          orderId: id, eventType: input.decision, fromStatus: 'submitted', toStatus: input.decision,
          user: req.user, key, fingerprint, note: input.note,
        });
        return { ...updated.rows[0], created_by_name: order.created_by_name };
      });
      res.json(mapOrder(result));
    } catch (error) {
      next(error);
    }
  });

  router.post('/:id/cancel', async (req, res, next) => {
    try {
      const id = positiveId(req.params.id);
      const key = requestId(req);
      const note = typeof req.body?.note === 'string' ? req.body.note.trim() : '';
      if (!note || note.length > 2000) throw new ValidationError('A cancellation note of at most 2000 characters is required');
      const fingerprint = transitionFingerprint({ action: 'cancel', note });
      const result = await withTransaction(pool, async (client) => {
        const order = await lockedOrder(client, id);
        if (Number(order.created_by_user_id) !== req.user.id) throw httpError(403, 'Only the requester can cancel this order');
        const replay = replayOrderOrConflict(
          await replayedTransition(client, id, key, 'cancelled', req.user.id),
          fingerprint,
        );
        if (replay) return replay;
        if (!['draft', 'submitted'].includes(order.status)) throw httpError(409, 'This order can no longer be cancelled');
        const updated = await client.query(
          `UPDATE procurement_orders SET status = 'cancelled', decision_note = $2,
             decided_at = NOW(), version = version + 1, updated_at = NOW()
           WHERE id = $1 RETURNING *`,
          [id, note],
        );
        await addEvent(client, {
          orderId: id, eventType: 'cancelled', fromStatus: order.status, toStatus: 'cancelled',
          user: req.user, key, fingerprint, note,
        });
        return { ...updated.rows[0], created_by_name: order.created_by_name };
      });
      res.json(mapOrder(result));
    } catch (error) {
      next(error);
    }
  });

  router.all('/:id', (_req, res) => {
    res.status(405).json({ error: 'Direct mutation and deletion are disabled; use workflow transitions' });
  });

  return router;
}

module.exports = createProcurementRouter;
module.exports.createProcurementRouter = createProcurementRouter;
