const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM fixed_assets ORDER BY acquisition_date DESC')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM fixed_assets WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { asset_id, asset_name, asset_class, acquisition_date, acquisition_cost, useful_life_years, depreciation_method, accumulated_depreciation, book_value, location, department, status } = req.body;
    const r = await pool.query(
      `INSERT INTO fixed_assets (asset_id, asset_name, asset_class, acquisition_date, acquisition_cost, useful_life_years, depreciation_method, accumulated_depreciation, book_value, location, department, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [asset_id, asset_name, asset_class, acquisition_date, acquisition_cost, useful_life_years, depreciation_method||'straight_line', accumulated_depreciation||0, book_value||acquisition_cost, location, department, status||'active', req.user.name]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM fixed_assets WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { asset_id, asset_name, asset_class, acquisition_date, acquisition_cost, useful_life_years, depreciation_method, accumulated_depreciation, book_value, location, department, status } = req.body;
    const r = await pool.query(
      `UPDATE fixed_assets SET asset_id=$1, asset_name=$2, asset_class=$3, acquisition_date=$4, acquisition_cost=$5, useful_life_years=$6, depreciation_method=$7, accumulated_depreciation=$8, book_value=$9, location=$10, department=$11, status=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [asset_id, asset_name, asset_class, acquisition_date, acquisition_cost, useful_life_years, depreciation_method, accumulated_depreciation, book_value, location, department, status, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM fixed_assets WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const r = await pool.query('DELETE FROM fixed_assets WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
