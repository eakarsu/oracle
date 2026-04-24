const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM pricing_quotes ORDER BY created_at DESC')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM pricing_quotes WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { quote_number, customer_name, customer_email, product_name, quantity, unit_price, discount_pct, total_amount, currency, valid_until, sales_rep, status } = req.body;
    const r = await pool.query(
      `INSERT INTO pricing_quotes (quote_number, customer_name, customer_email, product_name, quantity, unit_price, discount_pct, total_amount, currency, valid_until, sales_rep, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [quote_number, customer_name, customer_email, product_name, quantity, unit_price, discount_pct, total_amount, currency, valid_until, sales_rep, status||'draft', req.user.name]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM pricing_quotes WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { quote_number, customer_name, customer_email, product_name, quantity, unit_price, discount_pct, total_amount, currency, valid_until, sales_rep, status } = req.body;
    const r = await pool.query(
      `UPDATE pricing_quotes SET quote_number=$1, customer_name=$2, customer_email=$3, product_name=$4, quantity=$5, unit_price=$6, discount_pct=$7, total_amount=$8, currency=$9, valid_until=$10, sales_rep=$11, status=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [quote_number, customer_name, customer_email, product_name, quantity, unit_price, discount_pct, total_amount, currency, valid_until, sales_rep, status, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM pricing_quotes WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const r = await pool.query('DELETE FROM pricing_quotes WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
