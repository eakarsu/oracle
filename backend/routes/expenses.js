const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM expense_reports ORDER BY submission_date DESC')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM expense_reports WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { report_number, employee_name, department, category, description, amount, submission_date, receipt_date, vendor, payment_method, status, approver } = req.body;
    const r = await pool.query(
      `INSERT INTO expense_reports (report_number, employee_name, department, category, description, amount, submission_date, receipt_date, vendor, payment_method, status, approver, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [report_number, employee_name, department, category, description, amount, submission_date, receipt_date, vendor, payment_method, status||'submitted', approver, req.user.name]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM expense_reports WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { report_number, employee_name, department, category, description, amount, submission_date, receipt_date, vendor, payment_method, status, approver } = req.body;
    const r = await pool.query(
      `UPDATE expense_reports SET report_number=$1, employee_name=$2, department=$3, category=$4, description=$5, amount=$6, submission_date=$7, receipt_date=$8, vendor=$9, payment_method=$10, status=$11, approver=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [report_number, employee_name, department, category, description, amount, submission_date, receipt_date, vendor, payment_method, status, approver, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM expense_reports WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const r = await pool.query('DELETE FROM expense_reports WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Approve
router.put('/:id/approve', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const r = await pool.query(
      `UPDATE expense_reports SET status='approved', approver=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
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
      `UPDATE expense_reports SET status='rejected', approver=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [req.user.name, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
