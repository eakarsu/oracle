const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM work_orders ORDER BY scheduled_date DESC')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM work_orders WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { work_order_id, title, description, asset_name, work_type, priority, assigned_to, department, estimated_hours, actual_hours, cost, scheduled_date, completed_date, status } = req.body;
    const r = await pool.query(
      `INSERT INTO work_orders (work_order_id, title, description, asset_name, work_type, priority, assigned_to, department, estimated_hours, actual_hours, cost, scheduled_date, completed_date, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [work_order_id, title, description, asset_name, work_type, priority||'medium', assigned_to, department, estimated_hours, actual_hours||0, cost||0, scheduled_date, completed_date, status||'open', req.user.name]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM work_orders WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { work_order_id, title, description, asset_name, work_type, priority, assigned_to, department, estimated_hours, actual_hours, cost, scheduled_date, completed_date, status } = req.body;
    const r = await pool.query(
      `UPDATE work_orders SET work_order_id=$1, title=$2, description=$3, asset_name=$4, work_type=$5, priority=$6, assigned_to=$7, department=$8, estimated_hours=$9, actual_hours=$10, cost=$11, scheduled_date=$12, completed_date=$13, status=$14, updated_at=NOW() WHERE id=$15 RETURNING *`,
      [work_order_id, title, description, asset_name, work_type, priority, assigned_to, department, estimated_hours, actual_hours, cost, scheduled_date, completed_date, status, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM work_orders WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const r = await pool.query('DELETE FROM work_orders WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
