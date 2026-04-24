const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  try { res.json((await pool.query('SELECT * FROM recruitment ORDER BY application_date DESC')).rows); }
  catch (err) { res.status(500).json({ error: err.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM recruitment WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { job_title, department, candidate_name, candidate_email, candidate_phone, resume_source, experience_years, salary_expectation, application_date, interview_date, status, recruiter } = req.body;
    const r = await pool.query(
      `INSERT INTO recruitment (job_title, department, candidate_name, candidate_email, candidate_phone, resume_source, experience_years, salary_expectation, application_date, interview_date, status, recruiter, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [job_title, department, candidate_name, candidate_email, candidate_phone, resume_source, experience_years, salary_expectation, application_date, interview_date, status||'applied', recruiter, req.user.name]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.put('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM recruitment WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (role === 'user' && record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only edit your own records' });
      }
      if (role === 'user' && record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot edit approved/rejected records' });
      }
    }
    const { job_title, department, candidate_name, candidate_email, candidate_phone, resume_source, experience_years, salary_expectation, application_date, interview_date, status, recruiter } = req.body;
    const r = await pool.query(
      `UPDATE recruitment SET job_title=$1, department=$2, candidate_name=$3, candidate_email=$4, candidate_phone=$5, resume_source=$6, experience_years=$7, salary_expectation=$8, application_date=$9, interview_date=$10, status=$11, recruiter=$12, updated_at=NOW() WHERE id=$13 RETURNING *`,
      [job_title, department, candidate_name, candidate_email, candidate_phone, resume_source, experience_years, salary_expectation, application_date, interview_date, status, recruiter, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const { role } = req.user;
    if (role !== 'admin') {
      const existing = await pool.query('SELECT created_by, status FROM recruitment WHERE id = $1', [req.params.id]);
      if (!existing.rows.length) return res.status(404).json({ error: 'Not found' });
      const record = existing.rows[0];
      if (record.created_by !== req.user.name) {
        return res.status(403).json({ error: 'You can only delete your own records' });
      }
      if (record.status && !['pending', 'draft', 'submitted'].includes(record.status)) {
        return res.status(403).json({ error: 'Cannot delete approved/rejected records' });
      }
    }
    const r = await pool.query('DELETE FROM recruitment WHERE id = $1 RETURNING *', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});
module.exports = router;
