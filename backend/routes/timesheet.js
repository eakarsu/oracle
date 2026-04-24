const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/authorize');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM timesheets ORDER BY work_date DESC')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM timesheets WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { employee_name, department, project_name, task_description, work_date, hours_worked, overtime_hours, break_hours, clock_in, clock_out, status, approved_by } = req.body;
    const r = await pool.query(
      `INSERT INTO timesheets (employee_name, department, project_name, task_description, work_date, hours_worked, overtime_hours, break_hours, clock_in, clock_out, status, approved_by, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [employee_name, department, project_name, task_description, work_date, hours_worked, overtime_hours||0, break_hours||0, clock_in, clock_out, status||'pending', approved_by, req.user.name]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM timesheets WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { employee_name, department, project_name, task_description, work_date, hours_worked, overtime_hours, break_hours, clock_in, clock_out, status, approved_by } = req.body;
    const r = await pool.query(
      `UPDATE timesheets SET employee_name=$1, department=$2, project_name=$3, task_description=$4, work_date=$5, hours_worked=$6, overtime_hours=$7, break_hours=$8, clock_in=$9, clock_out=$10, status=$11, approved_by=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [employee_name, department, project_name, task_description, work_date, hours_worked, overtime_hours, break_hours, clock_in, clock_out, status, approved_by, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM timesheets WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const r = await pool.query('DELETE FROM timesheets WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Approve
router.put('/:id/approve', requireRole('admin', 'manager'), async (req, res) => {
  try {
    const r = await pool.query(
      `UPDATE timesheets SET status='approved', approved_by=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
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
      `UPDATE timesheets SET status='rejected', approved_by=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [req.user.name, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
