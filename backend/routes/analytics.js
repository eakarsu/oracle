const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
router.use(authenticateToken);

// Dashboard summary
router.get('/dashboard', async (req, res) => {
  try {
    const [finance, hr, inventory, crm, sales, projects] = await Promise.all([
      pool.query('SELECT COUNT(*) as count, COALESCE(SUM(amount),0) as total FROM finance_transactions'),
      pool.query('SELECT COUNT(*) as count FROM hr_employees WHERE status=\'active\''),
      pool.query('SELECT COUNT(*) as count, COALESCE(SUM(quantity * unit_price),0) as total_value FROM inventory_items'),
      pool.query('SELECT COUNT(*) as count, COALESCE(SUM(deal_value),0) as pipeline_value FROM crm_contacts'),
      pool.query('SELECT COUNT(*) as count, COALESCE(SUM(total_amount),0) as revenue FROM sales_orders'),
      pool.query('SELECT COUNT(*) as count FROM projects WHERE status != \'completed\''),
    ]);

    res.json({
      finance: { transactions: finance.rows[0].count, total_amount: finance.rows[0].total },
      hr: { active_employees: hr.rows[0].count },
      inventory: { items: inventory.rows[0].count, total_value: inventory.rows[0].total_value },
      crm: { contacts: crm.rows[0].count, pipeline_value: crm.rows[0].pipeline_value },
      sales: { orders: sales.rows[0].count, revenue: sales.rows[0].revenue },
      projects: { active_projects: projects.rows[0].count },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Finance analytics
router.get('/finance', async (req, res) => {
  try {
    const byCategory = await pool.query(
      `SELECT category, type, COUNT(*) as count, SUM(amount) as total
       FROM finance_transactions GROUP BY category, type ORDER BY total DESC`
    );
    const byMonth = await pool.query(
      `SELECT TO_CHAR(transaction_date, 'YYYY-MM') as month, type, SUM(amount) as total
       FROM finance_transactions GROUP BY month, type ORDER BY month`
    );
    res.json({ by_category: byCategory.rows, by_month: byMonth.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// HR analytics
router.get('/hr', async (req, res) => {
  try {
    const byDept = await pool.query(
      `SELECT department, COUNT(*) as count, AVG(salary) as avg_salary
       FROM hr_employees GROUP BY department ORDER BY count DESC`
    );
    const byStatus = await pool.query(
      `SELECT status, COUNT(*) as count FROM hr_employees GROUP BY status`
    );
    res.json({ by_department: byDept.rows, by_status: byStatus.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sales analytics
router.get('/sales', async (req, res) => {
  try {
    const byStatus = await pool.query(
      `SELECT status, COUNT(*) as count, SUM(total_amount) as total
       FROM sales_orders GROUP BY status ORDER BY total DESC`
    );
    const byMonth = await pool.query(
      `SELECT TO_CHAR(order_date, 'YYYY-MM') as month, COUNT(*) as count, SUM(total_amount) as total
       FROM sales_orders GROUP BY month ORDER BY month`
    );
    res.json({ by_status: byStatus.rows, by_month: byMonth.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CRM analytics
router.get('/crm', async (req, res) => {
  try {
    const byStage = await pool.query(
      `SELECT stage, COUNT(*) as count, SUM(deal_value) as total_value
       FROM crm_contacts GROUP BY stage ORDER BY total_value DESC`
    );
    res.json({ by_stage: byStage.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
