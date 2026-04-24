const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM marketing_campaigns ORDER BY start_date DESC')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM marketing_campaigns WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { campaign_name, campaign_type, channel, target_audience, budget, spent, leads_generated, conversions, roi_pct, start_date, end_date, status, owner } = req.body;
    const r = await pool.query(
      `INSERT INTO marketing_campaigns (campaign_name, campaign_type, channel, target_audience, budget, spent, leads_generated, conversions, roi_pct, start_date, end_date, status, owner, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
      [campaign_name, campaign_type, channel, target_audience, budget, spent||0, leads_generated||0, conversions||0, roi_pct||0, start_date, end_date, status||'planning', owner, req.user.name]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM marketing_campaigns WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { campaign_name, campaign_type, channel, target_audience, budget, spent, leads_generated, conversions, roi_pct, start_date, end_date, status, owner } = req.body;
    const r = await pool.query(
      `UPDATE marketing_campaigns SET campaign_name=$1, campaign_type=$2, channel=$3, target_audience=$4, budget=$5, spent=$6, leads_generated=$7, conversions=$8, roi_pct=$9, start_date=$10, end_date=$11, status=$12, owner=$13, updated_at=NOW() WHERE id=$14 RETURNING *`,
      [campaign_name, campaign_type, channel, target_audience, budget, spent, leads_generated, conversions, roi_pct, start_date, end_date, status, owner, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM marketing_campaigns WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const r = await pool.query('DELETE FROM marketing_campaigns WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
