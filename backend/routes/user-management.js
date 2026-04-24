const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM user_management ORDER BY created_at DESC')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM user_management WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { username, full_name, email, role, department, access_level, last_login, login_count, two_factor_enabled, account_locked, password_expires, status } = req.body;
    const r = await pool.query(
      `INSERT INTO user_management (username, full_name, email, role, department, access_level, last_login, login_count, two_factor_enabled, account_locked, password_expires, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [username, full_name, email, role, department, access_level, last_login, login_count||0, two_factor_enabled||false, account_locked||false, password_expires, status||'active', req.user.name]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM user_management WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { username, full_name, email, role: userRole, department, access_level, last_login, login_count, two_factor_enabled, account_locked, password_expires, status } = req.body;
    const r = await pool.query(
      `UPDATE user_management SET username=$1, full_name=$2, email=$3, role=$4, department=$5, access_level=$6, last_login=$7, login_count=$8, two_factor_enabled=$9, account_locked=$10, password_expires=$11, status=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [username, full_name, email, userRole, department, access_level, last_login, login_count, two_factor_enabled, account_locked, password_expires, status, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM user_management WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const r = await pool.query('DELETE FROM user_management WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
