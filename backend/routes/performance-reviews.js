const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM performance_reviews ORDER BY review_date DESC')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM performance_reviews WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { employee_name, department, reviewer, review_period, review_date, overall_rating, goals_met_pct, strengths, improvements, comments, employee_id_ref, next_review_date, status } = req.body;
    const r = await pool.query(
      `INSERT INTO performance_reviews (employee_name, department, reviewer, review_period, review_date, overall_rating, goals_met_pct, strengths, improvements, comments, employee_id_ref, next_review_date, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [employee_name, department, reviewer, review_period, review_date, overall_rating, goals_met_pct||0, strengths, improvements, comments, employee_id_ref, next_review_date, status||'draft', req.user.name]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM performance_reviews WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { employee_name, department, reviewer, review_period, review_date, overall_rating, goals_met_pct, strengths, improvements, comments, employee_id_ref, next_review_date, status } = req.body;
    const r = await pool.query(
      `UPDATE performance_reviews SET employee_name=$1, department=$2, reviewer=$3, review_period=$4, review_date=$5, overall_rating=$6, goals_met_pct=$7, strengths=$8, improvements=$9, comments=$10, employee_id_ref=$11, next_review_date=$12, status=$13, updated_at=NOW() WHERE id=$14 RETURNING *`,
      [employee_name, department, reviewer, review_period, review_date, overall_rating, goals_met_pct, strengths, improvements, comments, employee_id_ref, next_review_date, status, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM performance_reviews WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const r = await pool.query('DELETE FROM performance_reviews WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
