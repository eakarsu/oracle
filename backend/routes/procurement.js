const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM procurement_orders ORDER BY order_date DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM procurement_orders WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { po_number, supplier_name, supplier_email, item_description, quantity, unit_cost, total_cost, status, delivery_date, payment_terms } = req.body;
    const result = await pool.query(
      `INSERT INTO procurement_orders (po_number, supplier_name, supplier_email, item_description, quantity, unit_cost, total_cost, status, delivery_date, payment_terms, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [po_number, supplier_name, supplier_email, item_description, quantity, unit_cost, total_cost, status || 'draft', delivery_date, payment_terms, req.user.name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM procurement_orders WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { po_number, supplier_name, supplier_email, item_description, quantity, unit_cost, total_cost, status, delivery_date, payment_terms } = req.body;
    const result = await pool.query(
      `UPDATE procurement_orders SET po_number=$1, supplier_name=$2, supplier_email=$3, item_description=$4, quantity=$5, unit_cost=$6, total_cost=$7, status=$8, delivery_date=$9, payment_terms=$10, updated_at=NOW()
       WHERE id=$11 RETURNING *`,
      [po_number, supplier_name, supplier_email, item_description, quantity, unit_cost, total_cost, status, delivery_date, payment_terms, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM procurement_orders WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const result = await pool.query('DELETE FROM procurement_orders WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Approve
router.put('/:id/approve', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const r = await pool.query(
      `UPDATE procurement_orders SET status='approved', updated_at=NOW() WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reject
router.put('/:id/reject', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const r = await pool.query(
      `UPDATE procurement_orders SET status='rejected', updated_at=NOW() WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
