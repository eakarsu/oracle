const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM benefits ORDER BY effective_date DESC')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM benefits WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { plan_name, plan_type, provider, coverage_level, monthly_cost_employee, monthly_cost_employer, enrolled_count, max_enrollment, effective_date, renewal_date, description, status } = req.body;
    const r = await pool.query(
      `INSERT INTO benefits (plan_name, plan_type, provider, coverage_level, monthly_cost_employee, monthly_cost_employer, enrolled_count, max_enrollment, effective_date, renewal_date, description, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [plan_name, plan_type, provider, coverage_level||'employee', monthly_cost_employee||0, monthly_cost_employer||0, enrolled_count||0, max_enrollment, effective_date, renewal_date, description, status||'active', req.user.name]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM benefits WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { plan_name, plan_type, provider, coverage_level, monthly_cost_employee, monthly_cost_employer, enrolled_count, max_enrollment, effective_date, renewal_date, description, status } = req.body;
    const r = await pool.query(
      `UPDATE benefits SET plan_name=$1, plan_type=$2, provider=$3, coverage_level=$4, monthly_cost_employee=$5, monthly_cost_employer=$6, enrolled_count=$7, max_enrollment=$8, effective_date=$9, renewal_date=$10, description=$11, status=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [plan_name, plan_type, provider, coverage_level, monthly_cost_employee, monthly_cost_employer, enrolled_count, max_enrollment, effective_date, renewal_date, description, status, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM benefits WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const r = await pool.query('DELETE FROM benefits WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
