const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM payroll ORDER BY pay_date DESC')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM payroll WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { employee_name, employee_id_ref, department, pay_period, pay_date, base_salary, overtime_pay, bonuses, deductions, tax_withholding, net_pay, status } = req.body;
    const r = await pool.query(
      `INSERT INTO payroll (employee_name, employee_id_ref, department, pay_period, pay_date, base_salary, overtime_pay, bonuses, deductions, tax_withholding, net_pay, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [employee_name, employee_id_ref, department, pay_period, pay_date, base_salary, overtime_pay||0, bonuses||0, deductions||0, tax_withholding||0, net_pay, status||'pending', req.user.name]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM payroll WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { employee_name, employee_id_ref, department, pay_period, pay_date, base_salary, overtime_pay, bonuses, deductions, tax_withholding, net_pay, status } = req.body;
    const r = await pool.query(
      `UPDATE payroll SET employee_name=$1, employee_id_ref=$2, department=$3, pay_period=$4, pay_date=$5, base_salary=$6, overtime_pay=$7, bonuses=$8, deductions=$9, tax_withholding=$10, net_pay=$11, status=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [employee_name, employee_id_ref, department, pay_period, pay_date, base_salary, overtime_pay, bonuses, deductions, tax_withholding, net_pay, status, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM payroll WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const r = await pool.query('DELETE FROM payroll WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
