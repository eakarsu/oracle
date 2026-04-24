const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM accounts_payable ORDER BY due_date')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM accounts_payable WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { invoice_number, vendor_name, vendor_email, description, amount, due_date, payment_date, payment_method, status, category } = req.body;
    const r = await pool.query(
      `INSERT INTO accounts_payable (invoice_number, vendor_name, vendor_email, description, amount, due_date, payment_date, payment_method, status, category, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [invoice_number, vendor_name, vendor_email, description, amount, due_date, payment_date, payment_method, status||'pending', category, req.user.name]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM accounts_payable WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { invoice_number, vendor_name, vendor_email, description, amount, due_date, payment_date, payment_method, status, category } = req.body;
    const r = await pool.query(
      `UPDATE accounts_payable SET invoice_number=$1, vendor_name=$2, vendor_email=$3, description=$4, amount=$5, due_date=$6, payment_date=$7, payment_method=$8, status=$9, category=$10, updated_at=NOW() WHERE id=$11 RETURNING *`,
      [invoice_number, vendor_name, vendor_email, description, amount, due_date, payment_date, payment_method, status, category, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM accounts_payable WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const r = await pool.query('DELETE FROM accounts_payable WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Approve
router.put('/:id/approve', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const r = await pool.query(
      `UPDATE accounts_payable SET status='approved', updated_at=NOW() WHERE id=$1 RETURNING *`,
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
      `UPDATE accounts_payable SET status='rejected', updated_at=NOW() WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
