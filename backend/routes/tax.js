const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM tax_records ORDER BY due_date DESC')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM tax_records WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { tax_type, jurisdiction, period, fiscal_year, taxable_amount, tax_rate, tax_amount, due_date, filing_date, reference_number, status, preparer } = req.body;
    const r = await pool.query(
      `INSERT INTO tax_records (tax_type, jurisdiction, period, fiscal_year, taxable_amount, tax_rate, tax_amount, due_date, filing_date, reference_number, status, preparer, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [tax_type, jurisdiction, period, fiscal_year, taxable_amount, tax_rate, tax_amount, due_date, filing_date, reference_number, status||'pending', preparer, req.user.name]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM tax_records WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { tax_type, jurisdiction, period, fiscal_year, taxable_amount, tax_rate, tax_amount, due_date, filing_date, reference_number, status, preparer } = req.body;
    const r = await pool.query(
      `UPDATE tax_records SET tax_type=$1, jurisdiction=$2, period=$3, fiscal_year=$4, taxable_amount=$5, tax_rate=$6, tax_amount=$7, due_date=$8, filing_date=$9, reference_number=$10, status=$11, preparer=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [tax_type, jurisdiction, period, fiscal_year, taxable_amount, tax_rate, tax_amount, due_date, filing_date, reference_number, status, preparer, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM tax_records WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const r = await pool.query('DELETE FROM tax_records WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
