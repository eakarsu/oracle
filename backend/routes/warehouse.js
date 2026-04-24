const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM warehouse_management ORDER BY warehouse_name, zone')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM warehouse_management WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { warehouse_code, warehouse_name, location, zone, capacity_sqft, used_sqft, utilization_pct, manager, temperature_controlled, hazmat_certified, monthly_cost, status } = req.body;
    const r = await pool.query(
      `INSERT INTO warehouse_management (warehouse_code, warehouse_name, location, zone, capacity_sqft, used_sqft, utilization_pct, manager, temperature_controlled, hazmat_certified, monthly_cost, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [warehouse_code, warehouse_name, location, zone, capacity_sqft||0, used_sqft||0, utilization_pct||0, manager, temperature_controlled||false, hazmat_certified||false, monthly_cost||0, status||'active', req.user.name]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM warehouse_management WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { warehouse_code, warehouse_name, location, zone, capacity_sqft, used_sqft, utilization_pct, manager, temperature_controlled, hazmat_certified, monthly_cost, status } = req.body;
    const r = await pool.query(
      `UPDATE warehouse_management SET warehouse_code=$1, warehouse_name=$2, location=$3, zone=$4, capacity_sqft=$5, used_sqft=$6, utilization_pct=$7, manager=$8, temperature_controlled=$9, hazmat_certified=$10, monthly_cost=$11, status=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [warehouse_code, warehouse_name, location, zone, capacity_sqft, used_sqft, utilization_pct, manager, temperature_controlled, hazmat_certified, monthly_cost, status, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM warehouse_management WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const r = await pool.query('DELETE FROM warehouse_management WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
