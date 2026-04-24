const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM shipping ORDER BY ship_date DESC')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM shipping WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { shipping_id, order_number, customer_name, carrier, service_level, tracking_number, origin_address, destination_address, weight_kg, dimensions, shipping_cost, insurance_value, ship_date, estimated_arrival, status } = req.body;
    const r = await pool.query(
      `INSERT INTO shipping (shipping_id, order_number, customer_name, carrier, service_level, tracking_number, origin_address, destination_address, weight_kg, dimensions, shipping_cost, insurance_value, ship_date, estimated_arrival, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [shipping_id, order_number, customer_name, carrier, service_level, tracking_number, origin_address, destination_address, weight_kg, dimensions, shipping_cost, insurance_value, ship_date, estimated_arrival, status||'pending', req.user.name]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM shipping WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { shipping_id, order_number, customer_name, carrier, service_level, tracking_number, origin_address, destination_address, weight_kg, dimensions, shipping_cost, insurance_value, ship_date, estimated_arrival, status } = req.body;
    const r = await pool.query(
      `UPDATE shipping SET shipping_id=$1, order_number=$2, customer_name=$3, carrier=$4, service_level=$5, tracking_number=$6, origin_address=$7, destination_address=$8, weight_kg=$9, dimensions=$10, shipping_cost=$11, insurance_value=$12, ship_date=$13, estimated_arrival=$14, status=$15, updated_at=NOW() WHERE id=$16 RETURNING *`,
      [shipping_id, order_number, customer_name, carrier, service_level, tracking_number, origin_address, destination_address, weight_kg, dimensions, shipping_cost, insurance_value, ship_date, estimated_arrival, status, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM shipping WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const r = await pool.query('DELETE FROM shipping WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
