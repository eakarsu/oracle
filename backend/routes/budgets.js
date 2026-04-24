const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM budgets ORDER BY fiscal_year DESC, department')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM budgets WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { budget_name, department, category, fiscal_year, quarter, allocated_amount, spent_amount, remaining_amount, status, approved_by } = req.body;
    const r = await pool.query(
      `INSERT INTO budgets (budget_name, department, category, fiscal_year, quarter, allocated_amount, spent_amount, remaining_amount, status, approved_by, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [budget_name, department, category, fiscal_year, quarter, allocated_amount, spent_amount||0, remaining_amount||allocated_amount, status||'active', approved_by, req.user.name]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM budgets WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { budget_name, department, category, fiscal_year, quarter, allocated_amount, spent_amount, remaining_amount, status, approved_by } = req.body;
    const r = await pool.query(
      `UPDATE budgets SET budget_name=$1, department=$2, category=$3, fiscal_year=$4, quarter=$5, allocated_amount=$6, spent_amount=$7, remaining_amount=$8, status=$9, approved_by=$10, updated_at=NOW() WHERE id=$11 RETURNING *`,
      [budget_name, department, category, fiscal_year, quarter, allocated_amount, spent_amount, remaining_amount, status, approved_by, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM budgets WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const r = await pool.query('DELETE FROM budgets WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Approve
router.put('/:id/approve', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const r = await pool.query(
      `UPDATE budgets SET status='approved', approved_by=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [req.user.name, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reject
router.put('/:id/reject', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const r = await pool.query(
      `UPDATE budgets SET status='rejected', approved_by=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [req.user.name, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
