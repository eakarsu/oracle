// Phase 3 expanded modules - 15 new modules

async function createExpandedTables2(client) {
  await client.query(`
    -- Cash Management
    CREATE TABLE IF NOT EXISTS cash_management (
      id SERIAL PRIMARY KEY,
      transaction_id VARCHAR(50),
      account_name VARCHAR(255) NOT NULL,
      transaction_type VARCHAR(50),
      amount DECIMAL(15,2),
      currency VARCHAR(10) DEFAULT 'USD',
      from_account VARCHAR(255),
      to_account VARCHAR(255),
      bank_name VARCHAR(255),
      reference VARCHAR(100),
      balance_after DECIMAL(15,2),
      transaction_date DATE DEFAULT CURRENT_DATE,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Fixed Assets
    CREATE TABLE IF NOT EXISTS fixed_assets (
      id SERIAL PRIMARY KEY,
      asset_id VARCHAR(50),
      asset_name VARCHAR(255) NOT NULL,
      asset_class VARCHAR(100),
      acquisition_date DATE,
      acquisition_cost DECIMAL(15,2),
      useful_life_years INTEGER,
      depreciation_method VARCHAR(50),
      accumulated_depreciation DECIMAL(15,2) DEFAULT 0,
      book_value DECIMAL(15,2),
      location VARCHAR(255),
      department VARCHAR(100),
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Benefits
    CREATE TABLE IF NOT EXISTS benefits (
      id SERIAL PRIMARY KEY,
      plan_name VARCHAR(255) NOT NULL,
      plan_type VARCHAR(100),
      provider VARCHAR(255),
      coverage_level VARCHAR(50),
      monthly_cost_employee DECIMAL(10,2),
      monthly_cost_employer DECIMAL(10,2),
      enrolled_count INTEGER DEFAULT 0,
      max_enrollment INTEGER,
      effective_date DATE,
      renewal_date DATE,
      description TEXT,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Leave Management
    CREATE TABLE IF NOT EXISTS leave_management (
      id SERIAL PRIMARY KEY,
      employee_name VARCHAR(255) NOT NULL,
      employee_id_ref VARCHAR(50),
      department VARCHAR(100),
      leave_type VARCHAR(50),
      start_date DATE,
      end_date DATE,
      days_requested INTEGER,
      reason TEXT,
      approver VARCHAR(255),
      balance_remaining DECIMAL(5,1),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Performance Reviews
    CREATE TABLE IF NOT EXISTS performance_reviews (
      id SERIAL PRIMARY KEY,
      employee_name VARCHAR(255) NOT NULL,
      employee_id_ref VARCHAR(50),
      department VARCHAR(100),
      reviewer VARCHAR(255),
      review_period VARCHAR(50),
      overall_rating DECIMAL(3,1),
      goals_met_pct INTEGER,
      strengths TEXT,
      improvements TEXT,
      comments TEXT,
      review_date DATE,
      next_review_date DATE,
      status VARCHAR(50) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Marketing Campaigns
    CREATE TABLE IF NOT EXISTS marketing_campaigns (
      id SERIAL PRIMARY KEY,
      campaign_name VARCHAR(255) NOT NULL,
      campaign_type VARCHAR(100),
      channel VARCHAR(100),
      target_audience VARCHAR(255),
      budget DECIMAL(15,2),
      spent DECIMAL(15,2) DEFAULT 0,
      leads_generated INTEGER DEFAULT 0,
      conversions INTEGER DEFAULT 0,
      roi_pct DECIMAL(8,2),
      start_date DATE,
      end_date DATE,
      owner VARCHAR(255),
      status VARCHAR(50) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Work Orders / Maintenance
    CREATE TABLE IF NOT EXISTS work_orders (
      id SERIAL PRIMARY KEY,
      work_order_id VARCHAR(50),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      asset_name VARCHAR(255),
      work_type VARCHAR(50),
      priority VARCHAR(50) DEFAULT 'medium',
      assigned_to VARCHAR(255),
      department VARCHAR(100),
      estimated_hours DECIMAL(6,1),
      actual_hours DECIMAL(6,1),
      cost DECIMAL(12,2),
      scheduled_date DATE,
      completed_date DATE,
      status VARCHAR(50) DEFAULT 'open',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Warehouse Management
    CREATE TABLE IF NOT EXISTS warehouse_management (
      id SERIAL PRIMARY KEY,
      warehouse_code VARCHAR(50),
      warehouse_name VARCHAR(255) NOT NULL,
      location VARCHAR(255),
      zone VARCHAR(100),
      capacity_sqft INTEGER,
      used_sqft INTEGER,
      utilization_pct DECIMAL(5,2),
      manager VARCHAR(255),
      temperature_controlled BOOLEAN DEFAULT false,
      hazmat_certified BOOLEAN DEFAULT false,
      monthly_cost DECIMAL(12,2),
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Returns / RMA
    CREATE TABLE IF NOT EXISTS returns_rma (
      id SERIAL PRIMARY KEY,
      rma_number VARCHAR(50),
      order_number VARCHAR(50),
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255),
      product_name VARCHAR(255),
      quantity INTEGER DEFAULT 1,
      reason TEXT,
      refund_amount DECIMAL(12,2),
      return_type VARCHAR(50),
      tracking_number VARCHAR(100),
      request_date DATE DEFAULT CURRENT_DATE,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Pricing / Quotes
    CREATE TABLE IF NOT EXISTS pricing_quotes (
      id SERIAL PRIMARY KEY,
      quote_number VARCHAR(50),
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255),
      product_name VARCHAR(255),
      quantity INTEGER DEFAULT 1,
      unit_price DECIMAL(12,2),
      discount_pct DECIMAL(5,2) DEFAULT 0,
      total_amount DECIMAL(15,2),
      currency VARCHAR(10) DEFAULT 'USD',
      valid_until DATE,
      sales_rep VARCHAR(255),
      status VARCHAR(50) DEFAULT 'draft',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Risk Management
    CREATE TABLE IF NOT EXISTS risk_management (
      id SERIAL PRIMARY KEY,
      risk_id VARCHAR(50),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      likelihood VARCHAR(50),
      impact VARCHAR(50),
      risk_score INTEGER,
      owner VARCHAR(255),
      department VARCHAR(100),
      mitigation_plan TEXT,
      review_date DATE,
      identified_date DATE DEFAULT CURRENT_DATE,
      status VARCHAR(50) DEFAULT 'identified',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Audit Trail
    CREATE TABLE IF NOT EXISTS audit_trail (
      id SERIAL PRIMARY KEY,
      event_id VARCHAR(50),
      user_name VARCHAR(255),
      user_role VARCHAR(50),
      action VARCHAR(100),
      module VARCHAR(100),
      resource VARCHAR(255),
      resource_id VARCHAR(50),
      description TEXT,
      ip_address VARCHAR(50),
      event_timestamp TIMESTAMP DEFAULT NOW(),
      severity VARCHAR(50) DEFAULT 'info',
      status VARCHAR(50) DEFAULT 'logged',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- User Management
    CREATE TABLE IF NOT EXISTS user_management (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100),
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      role VARCHAR(50),
      department VARCHAR(100),
      access_level VARCHAR(50),
      last_login TIMESTAMP,
      login_count INTEGER DEFAULT 0,
      two_factor_enabled BOOLEAN DEFAULT false,
      account_locked BOOLEAN DEFAULT false,
      password_expires DATE,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Knowledge Base
    CREATE TABLE IF NOT EXISTS knowledge_base (
      id SERIAL PRIMARY KEY,
      article_id VARCHAR(50),
      title VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      content TEXT,
      author VARCHAR(255),
      department VARCHAR(100),
      tags VARCHAR(255),
      views INTEGER DEFAULT 0,
      helpful_votes INTEGER DEFAULT 0,
      last_reviewed DATE,
      access_level VARCHAR(50) DEFAULT 'all_employees',
      status VARCHAR(50) DEFAULT 'published',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Shipping
    CREATE TABLE IF NOT EXISTS shipping (
      id SERIAL PRIMARY KEY,
      shipping_id VARCHAR(50),
      order_number VARCHAR(50),
      customer_name VARCHAR(255),
      carrier VARCHAR(100),
      service_level VARCHAR(50),
      tracking_number VARCHAR(100),
      origin_address TEXT,
      destination_address TEXT,
      weight_kg DECIMAL(10,2),
      dimensions VARCHAR(100),
      shipping_cost DECIMAL(12,2),
      insurance_value DECIMAL(12,2),
      ship_date DATE,
      estimated_arrival DATE,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

async function seedExpandedData2(client) {
  console.log('  Seeding Phase 3 modules (15 new modules)...');

  // Cash Management (16 records)
  await client.query(`
    INSERT INTO cash_management (transaction_id, account_name, transaction_type, amount, currency, from_account, to_account, bank_name, reference, balance_after, transaction_date, status) VALUES
    ('CM-001', 'Operating Account', 'deposit', 250000.00, 'USD', 'Revenue Collections', 'Operating Account', 'Chase Bank', 'DEP-20241201', 1250000.00, '2024-12-01', 'completed'),
    ('CM-002', 'Payroll Account', 'transfer', 245000.00, 'USD', 'Operating Account', 'Payroll Account', 'Chase Bank', 'TRF-20241215', 1005000.00, '2024-12-15', 'completed'),
    ('CM-003', 'Savings Account', 'transfer', 100000.00, 'USD', 'Operating Account', 'Savings Account', 'Chase Bank', 'TRF-20241220', 905000.00, '2024-12-20', 'completed'),
    ('CM-004', 'Operating Account', 'deposit', 185000.00, 'USD', 'Customer Payments', 'Operating Account', 'Chase Bank', 'DEP-20241205', 1090000.00, '2024-12-05', 'completed'),
    ('CM-005', 'Vendor Payment Account', 'withdrawal', 75000.00, 'USD', 'Operating Account', 'Vendor Payment Account', 'Bank of America', 'WD-20241210', 1015000.00, '2024-12-10', 'completed'),
    ('CM-006', 'Tax Escrow', 'transfer', 55000.00, 'USD', 'Operating Account', 'Tax Escrow Account', 'Chase Bank', 'TRF-20241228', 850000.00, '2024-12-28', 'completed'),
    ('CM-007', 'Operating Account', 'deposit', 95000.00, 'USD', 'License Fees', 'Operating Account', 'Chase Bank', 'DEP-20241212', 945000.00, '2024-12-12', 'completed'),
    ('CM-008', 'International Account', 'transfer', 42000.00, 'EUR', 'Operating Account', 'EU Operations', 'HSBC', 'INT-20241218', 803000.00, '2024-12-18', 'completed'),
    ('CM-009', 'Petty Cash', 'withdrawal', 5000.00, 'USD', 'Operating Account', 'Petty Cash', 'Chase Bank', 'PC-20241201', 798000.00, '2024-12-01', 'completed'),
    ('CM-010', 'Operating Account', 'deposit', 320000.00, 'USD', 'Q4 Settlements', 'Operating Account', 'Chase Bank', 'DEP-20241230', 1118000.00, '2024-12-30', 'completed'),
    ('CM-011', 'Investment Account', 'transfer', 200000.00, 'USD', 'Savings Account', 'Money Market', 'Goldman Sachs', 'INV-20241215', 200000.00, '2024-12-15', 'completed'),
    ('CM-012', 'Operating Account', 'withdrawal', 18500.00, 'USD', 'Operating Account', 'Rent Payment', 'Chase Bank', 'RENT-202501', 1099500.00, '2024-12-28', 'pending'),
    ('CM-013', 'Operating Account', 'deposit', 67500.00, 'USD', 'Consulting Revenue', 'Operating Account', 'Chase Bank', 'DEP-20241222', 1167000.00, '2024-12-22', 'completed'),
    ('CM-014', 'Credit Line', 'drawdown', 150000.00, 'USD', 'Credit Facility', 'Operating Account', 'Wells Fargo', 'CL-20241201', 150000.00, '2024-12-01', 'completed'),
    ('CM-015', 'Operating Account', 'fee', 2500.00, 'USD', 'Operating Account', 'Bank Fees', 'Chase Bank', 'FEE-202412', 1164500.00, '2024-12-31', 'completed'),
    ('CM-016', 'Foreign Exchange', 'conversion', 85000.00, 'GBP', 'GBP Account', 'USD Account', 'HSBC', 'FX-20241220', 108000.00, '2024-12-20', 'completed')
  `);

  // Fixed Assets (16 records)
  await client.query(`
    INSERT INTO fixed_assets (asset_id, asset_name, asset_class, acquisition_date, acquisition_cost, useful_life_years, depreciation_method, accumulated_depreciation, book_value, location, department, status) VALUES
    ('FA-001', 'Main Office Building', 'Buildings', '2018-01-15', 2500000.00, 30, 'Straight-Line', 500000.00, 2000000.00, 'HQ Campus', 'Facilities', 'active'),
    ('FA-002', 'Data Center Infrastructure', 'IT Equipment', '2021-06-01', 850000.00, 7, 'Straight-Line', 364286.00, 485714.00, 'Data Center', 'IT', 'active'),
    ('FA-003', 'Manufacturing Equipment Line A', 'Machinery', '2020-03-15', 1200000.00, 10, 'Declining Balance', 480000.00, 720000.00, 'Factory Floor', 'Manufacturing', 'active'),
    ('FA-004', 'Company Vehicle Fleet (12 vehicles)', 'Vehicles', '2022-09-01', 420000.00, 5, 'Straight-Line', 168000.00, 252000.00, 'Parking Garage', 'Operations', 'active'),
    ('FA-005', 'Office Furniture - Floor 1-4', 'Furniture', '2021-01-01', 180000.00, 7, 'Straight-Line', 77143.00, 102857.00, 'HQ Building', 'Facilities', 'active'),
    ('FA-006', 'Warehouse A', 'Buildings', '2019-06-15', 1800000.00, 25, 'Straight-Line', 396000.00, 1404000.00, 'Industrial Park', 'Operations', 'active'),
    ('FA-007', 'Server Farm - Gen 3', 'IT Equipment', '2023-01-01', 450000.00, 5, 'Declining Balance', 180000.00, 270000.00, 'Data Center', 'IT', 'active'),
    ('FA-008', 'HVAC System', 'Building Improvements', '2020-08-01', 320000.00, 15, 'Straight-Line', 93333.00, 226667.00, 'HQ Building', 'Facilities', 'active'),
    ('FA-009', 'Solar Panel Array', 'Green Energy', '2022-04-01', 250000.00, 20, 'Straight-Line', 34722.00, 215278.00, 'Rooftop', 'Facilities', 'active'),
    ('FA-010', 'Automated Warehouse System', 'Machinery', '2023-06-01', 680000.00, 10, 'Straight-Line', 102000.00, 578000.00, 'Warehouse A', 'Operations', 'active'),
    ('FA-011', 'Backup Generator', 'Equipment', '2021-11-01', 95000.00, 15, 'Straight-Line', 20556.00, 74444.00, 'Utility Room', 'Facilities', 'active'),
    ('FA-012', 'Elevator System (3 units)', 'Building Improvements', '2019-01-01', 450000.00, 20, 'Straight-Line', 135000.00, 315000.00, 'HQ Building', 'Facilities', 'active'),
    ('FA-013', 'CNC Machine #1', 'Machinery', '2022-02-15', 380000.00, 8, 'Declining Balance', 142500.00, 237500.00, 'Factory Floor', 'Manufacturing', 'active'),
    ('FA-014', 'Parking Structure', 'Buildings', '2020-01-01', 950000.00, 30, 'Straight-Line', 158333.00, 791667.00, 'HQ Campus', 'Facilities', 'active'),
    ('FA-015', 'Telecom System', 'IT Equipment', '2023-03-01', 125000.00, 5, 'Straight-Line', 50000.00, 75000.00, 'HQ Building', 'IT', 'active'),
    ('FA-016', 'Security System - Campus Wide', 'Equipment', '2022-06-01', 185000.00, 7, 'Straight-Line', 66071.00, 118929.00, 'Campus', 'Security', 'active')
  `);

  // Benefits (16 records)
  await client.query(`
    INSERT INTO benefits (plan_name, plan_type, provider, coverage_level, monthly_cost_employee, monthly_cost_employer, enrolled_count, max_enrollment, effective_date, renewal_date, description, status) VALUES
    ('Premium Health PPO', 'Health Insurance', 'Blue Cross Blue Shield', 'Family', 450.00, 1200.00, 285, 500, '2024-01-01', '2025-01-01', 'Comprehensive PPO health plan with low deductibles', 'active'),
    ('Standard Health HMO', 'Health Insurance', 'Kaiser Permanente', 'Individual', 180.00, 650.00, 142, 300, '2024-01-01', '2025-01-01', 'HMO plan for individual coverage', 'active'),
    ('Dental Premium', 'Dental Insurance', 'Delta Dental', 'Family', 85.00, 180.00, 310, 500, '2024-01-01', '2025-01-01', 'Full dental coverage including orthodontics', 'active'),
    ('Vision Plus', 'Vision Insurance', 'VSP', 'Family', 25.00, 45.00, 298, 500, '2024-01-01', '2025-01-01', 'Vision coverage with annual exam and frames', 'active'),
    ('401(k) Retirement', 'Retirement', 'Fidelity Investments', 'Individual', 0.00, 0.00, 380, 500, '2024-01-01', '2025-01-01', '401(k) with 6% company match', 'active'),
    ('Life Insurance - Basic', 'Life Insurance', 'MetLife', 'Individual', 0.00, 35.00, 450, 500, '2024-01-01', '2025-01-01', 'Company-paid basic life insurance (2x salary)', 'active'),
    ('Life Insurance - Supplemental', 'Life Insurance', 'MetLife', 'Individual', 45.00, 0.00, 185, 500, '2024-01-01', '2025-01-01', 'Voluntary supplemental life insurance', 'active'),
    ('Short-Term Disability', 'Disability', 'Unum', 'Individual', 22.00, 38.00, 420, 500, '2024-01-01', '2025-01-01', '60% salary replacement for up to 6 months', 'active'),
    ('Long-Term Disability', 'Disability', 'Unum', 'Individual', 35.00, 55.00, 395, 500, '2024-01-01', '2025-01-01', '60% salary replacement after 6 months', 'active'),
    ('FSA - Healthcare', 'Flexible Spending', 'WageWorks', 'Individual', 0.00, 0.00, 210, 500, '2024-01-01', '2025-01-01', 'Pre-tax healthcare spending account ($2,850 max)', 'active'),
    ('FSA - Dependent Care', 'Flexible Spending', 'WageWorks', 'Family', 0.00, 0.00, 95, 500, '2024-01-01', '2025-01-01', 'Pre-tax dependent care spending ($5,000 max)', 'active'),
    ('HSA', 'Health Savings', 'Fidelity Investments', 'Individual', 0.00, 50.00, 165, 300, '2024-01-01', '2025-01-01', 'Health savings account with employer contribution', 'active'),
    ('Employee Assistance', 'EAP', 'ComPsych', 'Family', 0.00, 8.00, 450, 500, '2024-01-01', '2025-01-01', 'Counseling and work-life balance support', 'active'),
    ('Tuition Reimbursement', 'Education', 'Internal', 'Individual', 0.00, 0.00, 42, 100, '2024-01-01', '2025-01-01', 'Up to $5,250/year for approved education', 'active'),
    ('Commuter Benefits', 'Transportation', 'WageWorks', 'Individual', 0.00, 0.00, 180, 500, '2024-01-01', '2025-01-01', 'Pre-tax transit and parking benefits', 'active'),
    ('Gym Membership', 'Wellness', 'ClassPass Corporate', 'Individual', 25.00, 50.00, 220, 500, '2024-01-01', '2025-01-01', 'Subsidized gym and fitness class membership', 'active')
  `);

  // Leave Management (16 records)
  await client.query(`
    INSERT INTO leave_management (employee_name, employee_id_ref, department, leave_type, start_date, end_date, days_requested, reason, approver, balance_remaining, status) VALUES
    ('James Anderson', 'EMP-001', 'Engineering', 'Vacation', '2025-01-06', '2025-01-10', 5, 'Family vacation to Hawaii', 'David Wilson', 10.0, 'approved'),
    ('Maria Garcia', 'EMP-002', 'Engineering', 'Sick Leave', '2024-12-16', '2024-12-17', 2, 'Flu symptoms', 'David Wilson', 8.0, 'approved'),
    ('Robert Brown', 'EMP-003', 'Sales', 'Personal', '2025-01-20', '2025-01-21', 2, 'Personal appointment', 'Emily Davis', 13.0, 'pending'),
    ('Jennifer Taylor', 'EMP-004', 'Marketing', 'Vacation', '2025-02-14', '2025-02-21', 6, 'Winter getaway', 'Emily Davis', 12.0, 'approved'),
    ('William Martinez', 'EMP-005', 'Finance', 'Bereavement', '2024-12-09', '2024-12-13', 5, 'Family bereavement', 'Sarah Mitchell', 15.0, 'approved'),
    ('Linda Thomas', 'EMP-006', 'Human Resources', 'Vacation', '2025-03-10', '2025-03-14', 5, 'Spring break with family', 'Mike Johnson', 10.0, 'pending'),
    ('Michael Jackson', 'EMP-007', 'Engineering', 'Sick Leave', '2024-12-20', '2024-12-20', 1, 'Doctor appointment', 'David Wilson', 9.0, 'approved'),
    ('Susan White', 'EMP-008', 'Operations', 'Jury Duty', '2025-01-13', '2025-01-17', 5, 'Jury duty summons', 'Lisa Chen', 15.0, 'approved'),
    ('David Harris', 'EMP-009', 'Engineering', 'Vacation', '2025-02-03', '2025-02-07', 5, 'Ski trip', 'Maria Garcia', 8.0, 'approved'),
    ('Karen Clark', 'EMP-010', 'Sales', 'Maternity', '2025-03-01', '2025-05-23', 60, 'Maternity leave', 'Robert Brown', 0.0, 'approved'),
    ('Richard Lewis', 'EMP-011', 'Finance', 'Vacation', '2025-01-27', '2025-01-31', 5, 'Anniversary trip', 'Sarah Mitchell', 7.0, 'pending'),
    ('Nancy Walker', 'EMP-012', 'Marketing', 'Study Leave', '2025-02-10', '2025-02-14', 5, 'MBA exam preparation', 'Jennifer Taylor', 10.0, 'approved'),
    ('Thomas Hall', 'EMP-013', 'IT', 'Sick Leave', '2024-12-23', '2024-12-24', 2, 'Cold/fever', 'David Wilson', 6.0, 'approved'),
    ('Betty Allen', 'EMP-014', 'Human Resources', 'Vacation', '2025-04-14', '2025-04-18', 5, 'Road trip', 'Mike Johnson', 12.0, 'pending'),
    ('Christopher Young', 'EMP-015', 'Engineering', 'Personal', '2025-01-15', '2025-01-15', 1, 'Moving day', 'Maria Garcia', 14.0, 'approved'),
    ('Patricia Lopez', 'EMP-018', 'Finance', 'Medical', '2024-12-02', '2025-01-31', 44, 'Medical leave - surgery recovery', 'Sarah Mitchell', 0.0, 'approved')
  `);

  // Performance Reviews (16 records)
  await client.query(`
    INSERT INTO performance_reviews (employee_name, employee_id_ref, department, reviewer, review_period, overall_rating, goals_met_pct, strengths, improvements, comments, review_date, next_review_date, status) VALUES
    ('James Anderson', 'EMP-001', 'Engineering', 'David Wilson', 'H2 2024', 4.2, 90, 'Excellent technical skills, strong problem solver', 'Could improve documentation practices', 'Consistently delivers high-quality code ahead of schedule', '2024-12-15', '2025-06-15', 'completed'),
    ('Maria Garcia', 'EMP-002', 'Engineering', 'David Wilson', 'H2 2024', 4.8, 95, 'Outstanding leadership, mentors junior developers', 'Consider more delegation to develop team', 'Exceptional performance. Ready for promotion to Principal Engineer', '2024-12-15', '2025-06-15', 'completed'),
    ('Robert Brown', 'EMP-003', 'Sales', 'Emily Davis', 'H2 2024', 4.0, 85, 'Strong client relationships, exceeds revenue targets', 'Improve CRM data entry consistency', 'Exceeded Q4 quota by 15%. Key contributor to APAC expansion plan', '2024-12-18', '2025-06-18', 'completed'),
    ('Jennifer Taylor', 'EMP-004', 'Marketing', 'Emily Davis', 'H2 2024', 3.8, 80, 'Creative campaigns, excellent brand awareness results', 'Better budget tracking and reporting', 'Digital campaign ROI improved 22% under her leadership', '2024-12-18', '2025-06-18', 'completed'),
    ('William Martinez', 'EMP-005', 'Finance', 'Sarah Mitchell', 'H2 2024', 4.5, 92, 'Meticulous analysis, improved forecasting accuracy', 'Present findings more concisely in meetings', 'Key contributor to quarterly close process improvement', '2024-12-20', '2025-06-20', 'completed'),
    ('Linda Thomas', 'EMP-006', 'Human Resources', 'Mike Johnson', 'H2 2024', 3.5, 75, 'Empathetic with employees, thorough in compliance', 'Adopt more HR technology tools', 'Solid performance. Encouraged to pursue SHRM certification', '2024-12-20', '2025-06-20', 'completed'),
    ('Michael Jackson', 'EMP-007', 'Engineering', 'David Wilson', 'H2 2024', 4.6, 93, 'DevOps excellence, reduced deployment time by 40%', 'Share knowledge more broadly with team', 'Built automated CI/CD pipeline that saved 20hrs/week', '2024-12-15', '2025-06-15', 'completed'),
    ('Susan White', 'EMP-008', 'Operations', 'Lisa Chen', 'H2 2024', 4.1, 87, 'Efficient process management, cost reduction focus', 'Strategic planning could be more proactive', 'Led supply chain optimization saving $120K annually', '2024-12-22', '2025-06-22', 'completed'),
    ('David Harris', 'EMP-009', 'Engineering', 'Maria Garcia', 'H2 2024', 3.7, 78, 'Thorough testing approach, catches edge cases', 'Speed up test execution with automation', 'Growing well in QA role. Recommend automation training', '2024-12-15', '2025-06-15', 'completed'),
    ('Karen Clark', 'EMP-010', 'Sales', 'Robert Brown', 'H2 2024', 3.9, 82, 'Persistent with leads, good follow-up discipline', 'Improve enterprise selling skills', 'Closed 3 major accounts in Q4. Strong mid-market performer', '2024-12-18', '2025-06-18', 'completed'),
    ('Richard Lewis', 'EMP-011', 'Finance', 'Sarah Mitchell', 'H2 2024', 4.3, 88, 'Deep accounting knowledge, reliable month-end close', 'Explore data analytics tools for insights', 'Backbone of the accounting team. Mentor for new hires', '2024-12-20', '2025-06-20', 'completed'),
    ('Thomas Hall', 'EMP-013', 'IT', 'David Wilson', 'H2 2024', 4.4, 91, 'Security-first mindset, proactive infrastructure mgmt', 'Document runbooks more thoroughly', 'Led ISO 27001 certification effort. Critical team member', '2024-12-15', '2025-06-15', 'completed'),
    ('Christopher Young', 'EMP-015', 'Engineering', 'Maria Garcia', 'H2 2024', 4.0, 84, 'Strong React/TypeScript skills, clean code', 'Contribute more to code reviews', 'Rebuilt customer portal frontend. Great user feedback', '2024-12-15', '2025-06-15', 'completed'),
    ('Dorothy King', 'EMP-016', 'Sales', 'Robert Brown', 'H2 2024', 3.3, 70, 'Enthusiastic, quick learner, good cold calling', 'Need deeper product knowledge', 'First year - showing good potential. Assign mentor', '2024-12-18', '2025-06-18', 'completed'),
    ('Daniel Wright', 'EMP-017', 'Operations', 'Susan White', 'H2 2024', 3.6, 76, 'Reliable logistics coordination, good vendor relations', 'Improve reporting timeliness', 'Managed holiday season shipping without delays', '2024-12-22', '2025-06-22', 'completed'),
    ('Nancy Walker', 'EMP-012', 'Marketing', 'Jennifer Taylor', 'H2 2024', 4.1, 86, 'Excellent writing skills, SEO expertise', 'Expand into video content creation', 'Blog traffic up 45% under her content strategy', '2024-12-18', '2025-06-18', 'completed')
  `);

  // Marketing Campaigns (16 records)
  await client.query(`
    INSERT INTO marketing_campaigns (campaign_name, campaign_type, channel, target_audience, budget, spent, leads_generated, conversions, roi_pct, start_date, end_date, owner, status) VALUES
    ('Q1 2025 Product Launch', 'Product Launch', 'Multi-channel', 'Enterprise IT Leaders', 120000.00, 15000.00, 45, 3, 0.00, '2025-01-15', '2025-03-31', 'Jennifer Taylor', 'active'),
    ('LinkedIn Enterprise Campaign', 'Lead Generation', 'LinkedIn', 'C-Suite Executives', 45000.00, 38000.00, 320, 28, 185.00, '2024-10-01', '2024-12-31', 'Jennifer Taylor', 'completed'),
    ('Google Ads - ERP Keywords', 'PPC', 'Google Ads', 'IT Managers', 35000.00, 32500.00, 580, 42, 210.00, '2024-10-01', '2024-12-31', 'Nancy Walker', 'completed'),
    ('Annual Customer Conference', 'Event', 'In-Person', 'Existing Customers', 200000.00, 195000.00, 0, 15, 320.00, '2024-11-15', '2024-11-17', 'Jennifer Taylor', 'completed'),
    ('Email Nurture - Free Trial', 'Email', 'Email', 'Trial Users', 8000.00, 7200.00, 0, 85, 450.00, '2024-09-01', '2024-12-31', 'Nancy Walker', 'completed'),
    ('Webinar Series - ERP Best Practices', 'Webinar', 'Zoom', 'Mid-Market Companies', 15000.00, 12000.00, 210, 18, 280.00, '2024-10-01', '2024-12-31', 'Jennifer Taylor', 'completed'),
    ('Partner Co-Marketing - AWS', 'Co-Marketing', 'Multi-channel', 'AWS Customers', 50000.00, 48000.00, 150, 12, 165.00, '2024-11-01', '2025-01-31', 'Jennifer Taylor', 'active'),
    ('SEO Content Campaign', 'Content Marketing', 'Website', 'Organic Search', 25000.00, 22000.00, 890, 35, 340.00, '2024-07-01', '2024-12-31', 'Nancy Walker', 'completed'),
    ('Retargeting - Website Visitors', 'Retargeting', 'Google/Facebook', 'Website Visitors', 18000.00, 16500.00, 0, 65, 290.00, '2024-10-01', '2024-12-31', 'Nancy Walker', 'completed'),
    ('Case Study Video Series', 'Content Marketing', 'YouTube', 'Decision Makers', 30000.00, 28000.00, 120, 8, 95.00, '2024-09-01', '2024-12-31', 'Jennifer Taylor', 'completed'),
    ('Trade Show - TechCrunch Disrupt', 'Event', 'In-Person', 'Startups & VCs', 75000.00, 72000.00, 180, 5, 45.00, '2024-10-28', '2024-10-30', 'Jennifer Taylor', 'completed'),
    ('Social Media Brand Campaign', 'Brand Awareness', 'Twitter/LinkedIn', 'Tech Community', 12000.00, 11000.00, 45, 0, 0.00, '2024-10-01', '2024-12-31', 'Nancy Walker', 'completed'),
    ('Q1 Whitepaper - AI in ERP', 'Content Marketing', 'Website', 'IT Leaders', 10000.00, 2000.00, 0, 0, 0.00, '2025-01-01', '2025-02-28', 'Nancy Walker', 'active'),
    ('Referral Program Launch', 'Referral', 'Email/Portal', 'Existing Customers', 20000.00, 5000.00, 22, 4, 0.00, '2025-01-01', '2025-06-30', 'Jennifer Taylor', 'active'),
    ('ABM Campaign - Fortune 500', 'Account Based', 'Multi-channel', 'Fortune 500 IT', 80000.00, 0.00, 0, 0, 0.00, '2025-02-01', '2025-04-30', 'Jennifer Taylor', 'planning'),
    ('Podcast Sponsorship - TechTalks', 'Sponsorship', 'Podcast', 'Tech Professionals', 15000.00, 15000.00, 95, 6, 120.00, '2024-10-01', '2024-12-31', 'Nancy Walker', 'completed')
  `);

  // Work Orders (16 records)
  await client.query(`
    INSERT INTO work_orders (work_order_id, title, description, asset_name, work_type, priority, assigned_to, department, estimated_hours, actual_hours, cost, scheduled_date, completed_date, status) VALUES
    ('WO-001', 'HVAC Quarterly Maintenance', 'Routine quarterly inspection and filter replacement for all HVAC units', 'HVAC System', 'Preventive', 'medium', 'Building Maintenance Team', 'Facilities', 16.0, 14.5, 2800.00, '2025-01-15', NULL, 'scheduled'),
    ('WO-002', 'Server Room UPS Replacement', 'Replace aging UPS units in server room rack B', 'UPS Battery Backup System', 'Corrective', 'critical', 'Thomas Hall', 'IT', 8.0, 7.0, 12000.00, '2024-12-20', '2024-12-20', 'completed'),
    ('WO-003', 'Elevator Annual Inspection', 'Annual safety inspection for all 3 elevators', 'Elevator System', 'Inspection', 'high', 'ThyssenKrupp Service', 'Facilities', 12.0, NULL, 5500.00, '2025-01-20', NULL, 'scheduled'),
    ('WO-004', 'Parking Lot Resurfacing', 'Patch and resurface visitor parking lot', 'Parking Structure', 'Corrective', 'low', 'ABC Paving Co.', 'Facilities', 40.0, NULL, 18000.00, '2025-03-15', NULL, 'planned'),
    ('WO-005', 'Fire Suppression System Test', 'Annual fire suppression system testing and certification', 'Fire Suppression System', 'Inspection', 'critical', 'FireSafe Services', 'Facilities', 8.0, 8.0, 3200.00, '2024-12-10', '2024-12-10', 'completed'),
    ('WO-006', 'CNC Machine Calibration', 'Quarterly calibration of CNC Machine #1', 'CNC Machine #1', 'Preventive', 'high', 'Machine Shop Team', 'Manufacturing', 6.0, 5.5, 1500.00, '2024-12-15', '2024-12-15', 'completed'),
    ('WO-007', 'Network Switch Firmware Update', 'Update firmware on all Cisco Catalyst 9300 switches', 'Cisco Catalyst 9300 Switch', 'Preventive', 'high', 'Thomas Hall', 'IT', 4.0, 3.5, 0.00, '2025-01-10', NULL, 'in_progress'),
    ('WO-008', 'Generator Load Test', 'Quarterly load testing of backup generator', 'Backup Generator', 'Inspection', 'medium', 'Building Maintenance Team', 'Facilities', 4.0, 4.0, 800.00, '2024-12-18', '2024-12-18', 'completed'),
    ('WO-009', 'Roof Leak Repair - Bldg 2', 'Repair water leak in Building 2 northwest corner', 'Warehouse A', 'Emergency', 'critical', 'RoofPro Services', 'Facilities', 12.0, 10.0, 4500.00, '2024-12-05', '2024-12-06', 'completed'),
    ('WO-010', 'Solar Panel Cleaning', 'Clean all rooftop solar panels for optimal output', 'Solar Panel Array', 'Preventive', 'low', 'GreenClean Services', 'Facilities', 8.0, NULL, 1200.00, '2025-02-01', NULL, 'scheduled'),
    ('WO-011', 'Production Line A Belt Replacement', 'Replace worn conveyor belts on Production Line A', 'Manufacturing Equipment Line A', 'Corrective', 'high', 'Machine Shop Team', 'Manufacturing', 10.0, NULL, 3800.00, '2025-01-08', NULL, 'in_progress'),
    ('WO-012', 'Security Camera Upgrade', 'Upgrade 8 cameras to 4K resolution', 'CCTV Camera System', 'Upgrade', 'medium', 'SecureTech Services', 'Security', 16.0, NULL, 8500.00, '2025-01-25', NULL, 'planned'),
    ('WO-013', 'Office Carpet Replacement Floor 3', 'Replace carpet tiles on Floor 3 east wing', 'HQ Building', 'Upgrade', 'low', 'Interior Solutions', 'Facilities', 24.0, NULL, 12000.00, '2025-02-15', NULL, 'planned'),
    ('WO-014', 'Data Center Cooling Optimization', 'Optimize cooling airflow in data center', 'Data Center Infrastructure', 'Preventive', 'high', 'Thomas Hall', 'IT', 8.0, 6.0, 2200.00, '2024-12-12', '2024-12-13', 'completed'),
    ('WO-015', 'Access Control Badge Reader Fix', 'Repair malfunctioning badge reader at Gate B', 'Access Control System', 'Corrective', 'high', 'Building Maintenance Team', 'Security', 3.0, 2.5, 450.00, '2024-12-22', '2024-12-22', 'completed'),
    ('WO-016', 'Warehouse Forklift Service', 'Annual service and safety inspection for 4 forklifts', 'Automated Warehouse System', 'Preventive', 'medium', 'Toyota Material Handling', 'Operations', 8.0, NULL, 3200.00, '2025-01-18', NULL, 'scheduled')
  `);

  // Warehouse Management (16 records)
  await client.query(`
    INSERT INTO warehouse_management (warehouse_code, warehouse_name, location, zone, capacity_sqft, used_sqft, utilization_pct, manager, temperature_controlled, hazmat_certified, monthly_cost, status) VALUES
    ('WH-A', 'Warehouse A - Main', 'San Francisco, CA', 'West Coast', 50000, 42000, 84.00, 'Daniel Wright', false, false, 45000.00, 'active'),
    ('WH-B', 'Warehouse B - Electronics', 'San Francisco, CA', 'West Coast', 25000, 21000, 84.00, 'Daniel Wright', true, false, 32000.00, 'active'),
    ('WH-C', 'Warehouse C - Furniture', 'San Francisco, CA', 'West Coast', 35000, 18000, 51.43, 'Daniel Wright', false, false, 28000.00, 'active'),
    ('WH-D', 'Distribution Center East', 'Newark, NJ', 'East Coast', 75000, 62000, 82.67, 'Marcus Reed', false, false, 65000.00, 'active'),
    ('WH-E', 'Distribution Center South', 'Atlanta, GA', 'Southeast', 60000, 48000, 80.00, 'Sarah Kim', false, false, 52000.00, 'active'),
    ('WH-F', 'Cold Storage Facility', 'San Francisco, CA', 'West Coast', 15000, 12500, 83.33, 'Daniel Wright', true, false, 38000.00, 'active'),
    ('WH-G', 'Hazmat Storage', 'San Francisco, CA', 'West Coast', 8000, 3500, 43.75, 'Lisa Chen', true, true, 22000.00, 'active'),
    ('WH-H', 'Returns Processing Center', 'San Francisco, CA', 'West Coast', 12000, 8000, 66.67, 'Daniel Wright', false, false, 18000.00, 'active'),
    ('WH-I', 'Midwest Distribution Hub', 'Chicago, IL', 'Midwest', 55000, 45000, 81.82, 'Tom Barnes', false, false, 48000.00, 'active'),
    ('WH-J', 'Manufacturing Raw Materials', 'San Francisco, CA', 'West Coast', 20000, 17500, 87.50, 'Lisa Chen', false, true, 25000.00, 'active'),
    ('WH-K', 'Overflow Storage - Seasonal', 'San Jose, CA', 'West Coast', 30000, 8000, 26.67, 'Daniel Wright', false, false, 20000.00, 'active'),
    ('WH-L', 'Finished Goods - West', 'San Francisco, CA', 'West Coast', 40000, 35000, 87.50, 'Daniel Wright', false, false, 38000.00, 'active'),
    ('WH-M', 'Cross-Dock Facility', 'Memphis, TN', 'South', 45000, 15000, 33.33, 'James Cooper', false, false, 35000.00, 'active'),
    ('WH-N', 'Small Parts Warehouse', 'San Francisco, CA', 'West Coast', 10000, 8500, 85.00, 'Daniel Wright', true, false, 15000.00, 'active'),
    ('WH-O', 'Pacific Northwest Depot', 'Portland, OR', 'Northwest', 25000, 12000, 48.00, 'Amy Chen', false, false, 22000.00, 'active'),
    ('WH-P', 'Texas Regional Center', 'Dallas, TX', 'Southwest', 50000, 38000, 76.00, 'Mike Torres', false, false, 42000.00, 'active')
  `);

  // Returns / RMA (16 records)
  await client.query(`
    INSERT INTO returns_rma (rma_number, order_number, customer_name, customer_email, product_name, quantity, reason, refund_amount, return_type, tracking_number, request_date, status) VALUES
    ('RMA-001', 'SO-2024-004', 'RetailMax Corp', 'purchasing@retailmax.com', 'POS Integration Module', 2, 'Defective units - display not working', 4800.00, 'Replacement', 'RET-FX-001', '2024-12-15', 'approved'),
    ('RMA-002', 'SO-2024-009', 'EduLearn Academy', 'admin@edulearn.org', 'Education License', 1, 'Wrong license tier ordered', 25000.00, 'Refund', NULL, '2024-12-20', 'processing'),
    ('RMA-003', 'SO-2024-012', 'FoodChain Distributors', 'orders@foodchain.com', 'Distribution Module', 1, 'Compatibility issue with existing system', 62000.00, 'Refund', NULL, '2024-12-22', 'pending'),
    ('RMA-004', 'SO-2024-006', 'CloudPeak Solutions', 'buying@cloudpeak.com', 'Cloud Integration Pack', 3, 'Duplicate order', 13500.00, 'Refund', 'RET-UPS-001', '2024-12-18', 'completed'),
    ('RMA-005', 'SO-2024-013', 'BuildRight Construction', 'office@buildright.com', 'Project Management Module', 1, 'Feature mismatch with requirements', 8000.00, 'Exchange', NULL, '2024-12-23', 'approved'),
    ('RMA-006', 'SO-2024-001', 'TechCorp Industries', 'procurement@techcorp.com', 'Enterprise License', 1, 'Downgrade to smaller tier', 50000.00, 'Partial Refund', NULL, '2024-12-28', 'pending'),
    ('RMA-007', 'SO-2024-016', 'DesignHub Creative', 'office@designhub.io', 'Creative Suite Integration', 1, 'Product not as described', 28000.00, 'Refund', NULL, '2024-12-26', 'processing'),
    ('RMA-008', 'SO-2024-008', 'SecureNet Cyber', 'procurement@securenet.com', 'Security Compliance Module', 1, 'Requesting newer version', 0.00, 'Exchange', 'RET-FX-002', '2024-12-20', 'completed'),
    ('RMA-009', 'SO-2024-014', 'GreenErgy Solutions', 'procurement@greenergy.com', 'Sustainability Tracking Module', 1, 'Budget reallocation', 35000.00, 'Refund', NULL, '2024-12-25', 'pending'),
    ('RMA-010', 'SO-2024-002', 'Global Finance Ltd', 'orders@globalfinance.com', 'Financial Module', 1, 'Switching to competitor product', 85000.00, 'Refund', NULL, '2024-12-30', 'denied'),
    ('RMA-011', 'SO-2024-007', 'Sky Logistics', 'orders@skylogistics.com', 'Supply Chain Module', 1, 'Implementation delayed - requesting hold', 0.00, 'Hold', NULL, '2024-12-28', 'approved'),
    ('RMA-012', 'SO-2024-004', 'RetailMax Corp', 'purchasing@retailmax.com', 'POS Integration Module', 5, 'Excess inventory - returning unused licenses', 12000.00, 'Partial Refund', 'RET-FX-003', '2024-12-29', 'processing'),
    ('RMA-013', 'SO-2024-017', 'MediaWave Digital', 'buying@mediawave.com', 'Digital Marketing Module', 1, 'Wrong module ordered', 42000.00, 'Exchange', NULL, '2024-12-27', 'approved'),
    ('RMA-014', 'SO-2024-011', 'PharmaLabs Inc', 'buying@pharmalabs.com', 'Research Management Module', 1, 'Regulatory compliance issue', 88000.00, 'Refund', NULL, '2024-12-30', 'pending'),
    ('RMA-015', 'SO-2024-018', 'EnergyPlus Utilities', 'orders@energyplus.com', 'Utility Management System', 1, 'Project cancelled', 56000.00, 'Refund', NULL, '2024-12-31', 'pending'),
    ('RMA-016', 'SO-2024-003', 'MediCorp Health', 'buying@medicorp.com', 'Healthcare Suite', 1, 'Requesting different configuration', 0.00, 'Exchange', NULL, '2024-12-29', 'processing')
  `);

  // Pricing / Quotes (16 records)
  await client.query(`
    INSERT INTO pricing_quotes (quote_number, customer_name, customer_email, product_name, quantity, unit_price, discount_pct, total_amount, currency, valid_until, sales_rep, status) VALUES
    ('QT-2025-001', 'Apex Technologies', 'procurement@apextech.com', 'Enterprise ERP Suite', 1, 250000.00, 10.00, 225000.00, 'USD', '2025-02-28', 'Emily Davis', 'sent'),
    ('QT-2025-002', 'Pinnacle Industries', 'orders@pinnacle.com', 'Manufacturing Module + Support', 1, 120000.00, 5.00, 114000.00, 'USD', '2025-02-15', 'Robert Brown', 'sent'),
    ('QT-2025-003', 'Horizon Healthcare', 'buying@horizonhc.com', 'Healthcare Compliance Suite', 1, 180000.00, 15.00, 153000.00, 'USD', '2025-03-15', 'Emily Davis', 'negotiation'),
    ('QT-2025-004', 'Sterling Financial', 'procurement@sterling.com', 'Financial Analytics Platform', 1, 95000.00, 0.00, 95000.00, 'USD', '2025-02-28', 'Robert Brown', 'draft'),
    ('QT-2025-005', 'Metro Logistics', 'orders@metrologistics.com', 'Supply Chain + Warehouse Module', 1, 145000.00, 8.00, 133400.00, 'USD', '2025-03-31', 'Karen Clark', 'sent'),
    ('QT-2025-006', 'TechCorp Industries', 'alex.t@techcorp.com', 'Additional 200 User Licenses', 200, 500.00, 12.00, 88000.00, 'USD', '2025-02-15', 'Emily Davis', 'accepted'),
    ('QT-2025-007', 'Global Retail Group', 'purchasing@globalretail.com', 'POS + Inventory Bundle (50 sites)', 50, 3500.00, 20.00, 140000.00, 'USD', '2025-03-15', 'Robert Brown', 'negotiation'),
    ('QT-2025-008', 'BioMed Research', 'procurement@biomed.com', 'Research Lab Module', 1, 75000.00, 0.00, 75000.00, 'USD', '2025-02-28', 'Dorothy King', 'sent'),
    ('QT-2025-009', 'United Construction', 'orders@unitedconst.com', 'Project Management Enterprise', 1, 85000.00, 5.00, 80750.00, 'USD', '2025-03-31', 'Karen Clark', 'draft'),
    ('QT-2025-010', 'Pacific Airlines', 'procurement@pacificair.com', 'Full ERP Implementation', 1, 450000.00, 18.00, 369000.00, 'USD', '2025-04-30', 'Emily Davis', 'negotiation'),
    ('QT-2025-011', 'Nordic Energy AS', 'buying@nordicenergy.no', 'Utility Management Suite', 1, 120000.00, 10.00, 108000.00, 'EUR', '2025-03-15', 'Emily Davis', 'sent'),
    ('QT-2025-012', 'DataFlows Inc', 'ethan.s@dataflows.io', 'Analytics Module Upgrade', 1, 45000.00, 0.00, 45000.00, 'USD', '2025-02-15', 'Robert Brown', 'accepted'),
    ('QT-2025-013', 'Quantum Computing Ltd', 'sales@quantumcomp.co.uk', 'Custom Integration Package', 1, 200000.00, 5.00, 190000.00, 'GBP', '2025-03-31', 'Emily Davis', 'draft'),
    ('QT-2025-014', 'Fresh Foods Co', 'orders@freshfoods.com', 'Distribution + Logistics Module', 1, 68000.00, 8.00, 62560.00, 'USD', '2025-02-28', 'Karen Clark', 'sent'),
    ('QT-2025-015', 'AutoTech Motors', 'logan.p@autotech.com', 'Manufacturing ERP - Phase 2', 1, 150000.00, 10.00, 135000.00, 'USD', '2025-03-15', 'Emily Davis', 'negotiation'),
    ('QT-2025-016', 'EduLearn Academy', 'sophia.m@edulearn.org', 'Renewal + 100 Additional Licenses', 100, 250.00, 15.00, 21250.00, 'USD', '2025-02-28', 'Karen Clark', 'sent')
  `);

  // Risk Management (16 records)
  await client.query(`
    INSERT INTO risk_management (risk_id, title, description, category, likelihood, impact, risk_score, owner, department, mitigation_plan, review_date, identified_date, status) VALUES
    ('RSK-001', 'Data Breach - Customer PII', 'Risk of unauthorized access to customer personally identifiable information', 'Cybersecurity', 'medium', 'critical', 85, 'Thomas Hall', 'IT', 'Implement encryption at rest, MFA for all admin access, quarterly penetration testing', '2025-03-15', '2024-06-01', 'mitigating'),
    ('RSK-002', 'Key Person Dependency', 'Over-reliance on David Wilson for infrastructure knowledge', 'Operational', 'high', 'high', 75, 'Mike Johnson', 'Human Resources', 'Cross-training program, documentation initiative, hire backup engineer', '2025-02-28', '2024-09-15', 'mitigating'),
    ('RSK-003', 'Supply Chain Disruption', 'Risk of major supplier failure impacting operations', 'Supply Chain', 'medium', 'high', 70, 'Lisa Chen', 'Operations', 'Diversify supplier base, maintain 3-month safety stock, develop alternate sourcing', '2025-03-31', '2024-07-01', 'mitigating'),
    ('RSK-004', 'Regulatory Non-Compliance - GDPR', 'Risk of GDPR fines due to data handling practices', 'Compliance', 'low', 'critical', 65, 'Sarah Mitchell', 'Legal', 'Complete DPIA, update privacy policies, train all staff on data handling', '2025-02-28', '2024-08-15', 'mitigating'),
    ('RSK-005', 'Revenue Concentration', 'Top 5 customers account for 40% of revenue', 'Financial', 'medium', 'high', 72, 'Emily Davis', 'Sales', 'Accelerate new customer acquisition, diversify into new markets', '2025-03-31', '2024-10-01', 'identified'),
    ('RSK-006', 'Natural Disaster - HQ', 'Earthquake or fire risk to San Francisco headquarters', 'Physical', 'low', 'critical', 60, 'Susan White', 'Operations', 'Business continuity plan, offsite backups, remote work capability', '2025-06-30', '2024-03-01', 'accepted'),
    ('RSK-007', 'Technology Obsolescence', 'Legacy systems becoming unsupported', 'Technology', 'high', 'medium', 68, 'David Wilson', 'IT', 'ERP v2.0 migration project, cloud-native architecture adoption', '2025-03-31', '2024-05-15', 'mitigating'),
    ('RSK-008', 'Talent Retention', 'Risk of losing key engineering talent to competitors', 'Human Capital', 'high', 'high', 80, 'Mike Johnson', 'Human Resources', 'Competitive compensation review, retention bonuses, career development paths', '2025-02-28', '2024-08-01', 'mitigating'),
    ('RSK-009', 'Third-Party Vendor Breach', 'Security breach through third-party integration', 'Cybersecurity', 'medium', 'high', 73, 'Thomas Hall', 'IT', 'Vendor security assessments, limit API access, monitor third-party connections', '2025-03-15', '2024-09-01', 'mitigating'),
    ('RSK-010', 'Interest Rate Increase', 'Rising interest rates impacting credit facility costs', 'Financial', 'high', 'medium', 55, 'Sarah Mitchell', 'Finance', 'Lock in fixed rates, reduce credit dependency, build cash reserves', '2025-06-30', '2024-11-01', 'monitoring'),
    ('RSK-011', 'Product Quality Decline', 'Risk of quality issues in rapid product releases', 'Operational', 'medium', 'medium', 50, 'Maria Garcia', 'Engineering', 'Enhanced QA processes, automated testing, release staging environment', '2025-03-31', '2024-10-15', 'mitigating'),
    ('RSK-012', 'Intellectual Property Theft', 'Risk of proprietary code or algorithms being stolen', 'Legal', 'low', 'critical', 62, 'David Wilson', 'IT', 'Code access controls, DLP tools, employee NDAs, source code auditing', '2025-06-30', '2024-07-15', 'monitoring'),
    ('RSK-013', 'Customer Churn Increase', 'Rising customer churn rate above 5% threshold', 'Business', 'medium', 'high', 70, 'Emily Davis', 'Sales', 'Customer success program, proactive outreach, improve onboarding', '2025-02-28', '2024-11-15', 'identified'),
    ('RSK-014', 'Pandemic / Health Crisis', 'Risk of another pandemic disrupting operations', 'Health', 'low', 'high', 45, 'Mike Johnson', 'Human Resources', 'Remote work infrastructure, health protocols, emergency communication plan', '2025-12-31', '2024-01-15', 'accepted'),
    ('RSK-015', 'Currency Exchange Volatility', 'Fluctuations in EUR/GBP affecting international revenue', 'Financial', 'high', 'medium', 58, 'Sarah Mitchell', 'Finance', 'Currency hedging, invoice in local currency, diversify currency exposure', '2025-03-31', '2024-10-01', 'monitoring'),
    ('RSK-016', 'Cloud Provider Outage', 'Risk of major AWS outage impacting services', 'Technology', 'medium', 'critical', 78, 'Thomas Hall', 'IT', 'Multi-region deployment, failover to Azure, 99.9% SLA enforcement', '2025-03-15', '2024-06-15', 'mitigating')
  `);

  // Audit Trail (16 records)
  await client.query(`
    INSERT INTO audit_trail (event_id, user_name, user_role, action, module, resource, resource_id, description, ip_address, event_timestamp, severity, status) VALUES
    ('AUD-001', 'John Administrator', 'admin', 'LOGIN', 'Auth', 'Session', 'SES-001', 'Admin login from HQ office', '192.168.1.100', '2024-12-31 08:00:00', 'info', 'logged'),
    ('AUD-002', 'Sarah Mitchell', 'manager', 'UPDATE', 'Finance', 'Transaction', 'FIN-2024-001', 'Updated transaction status from pending to completed', '192.168.1.105', '2024-12-31 09:15:00', 'info', 'logged'),
    ('AUD-003', 'David Wilson', 'manager', 'DELETE', 'IT', 'Server Config', 'CFG-042', 'Deleted deprecated server configuration', '192.168.1.110', '2024-12-31 10:30:00', 'warning', 'logged'),
    ('AUD-004', 'Emily Davis', 'manager', 'CREATE', 'Sales', 'Sales Order', 'SO-2024-019', 'Created new sales order for Apex Technologies', '192.168.1.115', '2024-12-31 11:00:00', 'info', 'logged'),
    ('AUD-005', 'Mike Johnson', 'manager', 'UPDATE', 'HR', 'Employee', 'EMP-018', 'Updated employee status to on_leave', '192.168.1.120', '2024-12-30 14:00:00', 'info', 'logged'),
    ('AUD-006', 'Unknown', 'unknown', 'LOGIN_FAILED', 'Auth', 'Session', NULL, 'Failed login attempt - invalid password (3rd attempt)', '203.45.67.89', '2024-12-30 22:15:00', 'critical', 'flagged'),
    ('AUD-007', 'Thomas Hall', 'user', 'UPDATE', 'IT', 'Firewall Rules', 'FW-025', 'Updated firewall rule to block suspicious IP range', '192.168.1.130', '2024-12-30 16:30:00', 'warning', 'logged'),
    ('AUD-008', 'Sarah Mitchell', 'manager', 'EXPORT', 'Finance', 'Report', 'RPT-Q4-2024', 'Exported Q4 financial report to PDF', '192.168.1.105', '2024-12-31 15:00:00', 'info', 'logged'),
    ('AUD-009', 'John Administrator', 'admin', 'CREATE', 'User Management', 'User Account', 'USR-025', 'Created new user account for contractor', '192.168.1.100', '2024-12-29 10:00:00', 'info', 'logged'),
    ('AUD-010', 'John Administrator', 'admin', 'UPDATE', 'User Management', 'Permissions', 'PERM-015', 'Elevated user permissions to manager role', '192.168.1.100', '2024-12-29 10:15:00', 'warning', 'reviewed'),
    ('AUD-011', 'Lisa Chen', 'user', 'UPDATE', 'Inventory', 'Stock Level', 'INV-SKU-015', 'Adjusted stock count for iPad Pro (45 to 5)', '192.168.1.140', '2024-12-28 13:00:00', 'warning', 'logged'),
    ('AUD-012', 'Robert Brown', 'manager', 'CREATE', 'CRM', 'Contact', 'CRM-019', 'Added new prospect from trade show', '10.0.0.55', '2024-12-27 16:00:00', 'info', 'logged'),
    ('AUD-013', 'System', 'system', 'BACKUP', 'System', 'Database', 'BKP-20241231', 'Automated nightly database backup completed', '127.0.0.1', '2024-12-31 02:00:00', 'info', 'logged'),
    ('AUD-014', 'System', 'system', 'ALERT', 'Monitoring', 'Disk Space', 'DSK-DC-01', 'Disk usage exceeded 85% threshold on DC server', '127.0.0.1', '2024-12-30 03:00:00', 'warning', 'acknowledged'),
    ('AUD-015', 'Unknown', 'unknown', 'ACCESS_DENIED', 'Finance', 'Payroll Report', 'RPT-PAY-12', 'Unauthorized access attempt to payroll data', '203.45.67.90', '2024-12-29 19:30:00', 'critical', 'flagged'),
    ('AUD-016', 'Maria Garcia', 'manager', 'DEPLOY', 'Engineering', 'Application', 'APP-v2.1.3', 'Deployed application version 2.1.3 to production', '192.168.1.108', '2024-12-31 18:00:00', 'info', 'logged')
  `);

  // User Management (16 records)
  await client.query(`
    INSERT INTO user_management (username, full_name, email, role, department, access_level, last_login, login_count, two_factor_enabled, account_locked, password_expires, status) VALUES
    ('jadmin', 'John Administrator', 'admin@oracle-erp.com', 'Super Admin', 'Executive', 'Full Access', '2024-12-31 08:00:00', 892, true, false, '2025-03-31', 'active'),
    ('smitchell', 'Sarah Mitchell', 'sarah.finance@oracle-erp.com', 'Finance Manager', 'Finance', 'Department Admin', '2024-12-31 08:30:00', 645, true, false, '2025-03-31', 'active'),
    ('mjohnson', 'Mike Johnson', 'mike.hr@oracle-erp.com', 'HR Manager', 'Human Resources', 'Department Admin', '2024-12-31 09:00:00', 578, true, false, '2025-03-31', 'active'),
    ('edavis', 'Emily Davis', 'emily.sales@oracle-erp.com', 'Sales Manager', 'Sales', 'Department Admin', '2024-12-31 08:15:00', 712, true, false, '2025-03-31', 'active'),
    ('dwilson', 'David Wilson', 'david.it@oracle-erp.com', 'IT Director', 'IT', 'Full Access', '2024-12-31 07:45:00', 834, true, false, '2025-03-31', 'active'),
    ('lchen', 'Lisa Chen', 'lisa.ops@oracle-erp.com', 'Operations Lead', 'Operations', 'Standard', '2024-12-31 08:45:00', 423, false, false, '2025-03-31', 'active'),
    ('janderson', 'James Anderson', 'james.anderson@oracle-erp.com', 'Developer', 'Engineering', 'Standard', '2024-12-31 09:30:00', 356, true, false, '2025-03-31', 'active'),
    ('mgarcia', 'Maria Garcia', 'maria.garcia@oracle-erp.com', 'Lead Developer', 'Engineering', 'Department Admin', '2024-12-31 08:00:00', 489, true, false, '2025-03-31', 'active'),
    ('rbrown', 'Robert Brown', 'robert.brown@oracle-erp.com', 'Sales Director', 'Sales', 'Department Admin', '2024-12-31 10:00:00', 567, true, false, '2025-03-31', 'active'),
    ('jtaylor', 'Jennifer Taylor', 'jennifer.taylor@oracle-erp.com', 'Marketing Manager', 'Marketing', 'Standard', '2024-12-31 09:15:00', 312, false, false, '2025-03-31', 'active'),
    ('thall', 'Thomas Hall', 'thomas.hall@oracle-erp.com', 'System Admin', 'IT', 'Full Access', '2024-12-31 07:30:00', 945, true, false, '2025-03-31', 'active'),
    ('swhite', 'Susan White', 'susan.white@oracle-erp.com', 'Operations Manager', 'Operations', 'Standard', '2024-12-30 16:00:00', 398, false, false, '2025-03-31', 'active'),
    ('contractor1', 'Alex Contractor', 'alex.c@external.com', 'Contractor', 'Engineering', 'Limited', '2024-12-28 14:00:00', 45, false, false, '2025-01-31', 'active'),
    ('intern1', 'Jordan Intern', 'jordan.i@oracle-erp.com', 'Intern', 'Marketing', 'Read Only', '2024-12-20 10:00:00', 28, false, false, '2025-03-15', 'active'),
    ('former_emp', 'Karen Former', 'karen.f@oracle-erp.com', 'Analyst', 'Finance', 'None', '2024-11-15 09:00:00', 234, false, true, '2024-11-30', 'disabled'),
    ('api_service', 'API Service Account', 'api@oracle-erp.com', 'Service Account', 'IT', 'API Only', '2024-12-31 00:00:00', 15678, false, false, '2025-06-30', 'active')
  `);

  // Knowledge Base (16 records)
  await client.query(`
    INSERT INTO knowledge_base (article_id, title, category, content, author, department, tags, views, helpful_votes, last_reviewed, access_level, status) VALUES
    ('KB-001', 'Getting Started with Oracle ERP', 'Onboarding', 'Complete guide for new users including login, navigation, and basic module overview. Covers dashboard, sidebar, and profile settings.', 'Mike Johnson', 'Human Resources', 'onboarding,new-user,getting-started', 1250, 89, '2024-12-15', 'all_employees', 'published'),
    ('KB-002', 'How to Submit an Expense Report', 'Finance', 'Step-by-step guide for submitting expense reports including receipt upload, category selection, and approval workflow.', 'Sarah Mitchell', 'Finance', 'expenses,reimbursement,finance', 890, 72, '2024-12-01', 'all_employees', 'published'),
    ('KB-003', 'VPN Setup Guide', 'IT', 'Instructions for setting up VPN access for remote work. Covers Windows, Mac, and mobile configurations.', 'Thomas Hall', 'IT', 'vpn,remote-work,security', 2100, 156, '2024-11-15', 'all_employees', 'published'),
    ('KB-004', 'Sales Order Processing Workflow', 'Sales', 'End-to-end guide for creating, approving, and fulfilling sales orders. Includes integration with inventory and shipping.', 'Emily Davis', 'Sales', 'sales,orders,workflow', 445, 38, '2024-12-10', 'all_employees', 'published'),
    ('KB-005', 'IT Security Best Practices', 'Security', 'Company security policies including password requirements, 2FA setup, phishing awareness, and data handling procedures.', 'Thomas Hall', 'IT', 'security,passwords,2fa,phishing', 3200, 210, '2024-12-20', 'all_employees', 'published'),
    ('KB-006', 'Leave Request Process', 'HR', 'How to request time off, check leave balances, and understand approval workflows for different leave types.', 'Linda Thomas', 'Human Resources', 'leave,vacation,time-off,hr', 1800, 125, '2024-12-05', 'all_employees', 'published'),
    ('KB-007', 'API Integration Guide', 'Technical', 'Technical documentation for integrating with Oracle ERP REST APIs. Includes authentication, endpoints, and code examples.', 'David Wilson', 'Engineering', 'api,integration,development,technical', 560, 45, '2024-12-15', 'engineering', 'published'),
    ('KB-008', 'Procurement Request Workflow', 'Procurement', 'Guide for submitting purchase requests, vendor selection, PO approval process, and receiving goods.', 'Lisa Chen', 'Operations', 'procurement,purchasing,vendors', 670, 52, '2024-11-20', 'all_employees', 'published'),
    ('KB-009', 'Performance Review Self-Assessment Guide', 'HR', 'Tips and templates for completing your self-assessment during performance review cycles.', 'Mike Johnson', 'Human Resources', 'performance,review,self-assessment', 920, 78, '2024-12-01', 'all_employees', 'published'),
    ('KB-010', 'Data Backup and Recovery Procedures', 'IT', 'Internal procedures for database backups, disaster recovery, and data restoration. RTO and RPO targets.', 'Thomas Hall', 'IT', 'backup,recovery,disaster,database', 180, 22, '2024-12-10', 'it_team', 'published'),
    ('KB-011', 'CRM Lead Scoring Methodology', 'Sales', 'Explanation of lead scoring criteria, qualification stages, and handoff process from marketing to sales.', 'Emily Davis', 'Sales', 'crm,leads,scoring,qualification', 340, 28, '2024-11-15', 'sales_team', 'published'),
    ('KB-012', 'Manufacturing Quality Standards', 'Operations', 'Quality control procedures, inspection checkpoints, and defect classification for manufacturing processes.', 'Lisa Chen', 'Operations', 'quality,manufacturing,inspection', 290, 25, '2024-12-05', 'operations_team', 'published'),
    ('KB-013', 'Employee Benefits Enrollment Guide', 'HR', 'Comprehensive guide to available benefits, enrollment periods, plan comparisons, and FSA/HSA options.', 'Mike Johnson', 'Human Resources', 'benefits,enrollment,insurance,401k', 1450, 108, '2024-11-01', 'all_employees', 'published'),
    ('KB-014', 'Troubleshooting Common ERP Errors', 'Technical', 'Solutions for common error messages, connectivity issues, and performance problems in Oracle ERP.', 'David Wilson', 'IT', 'troubleshooting,errors,support', 2800, 195, '2024-12-15', 'all_employees', 'published'),
    ('KB-015', 'Financial Month-End Close Checklist', 'Finance', 'Step-by-step checklist for finance team monthly close process including reconciliation and reporting.', 'Sarah Mitchell', 'Finance', 'month-end,close,finance,checklist', 420, 35, '2024-12-20', 'finance_team', 'published'),
    ('KB-016', 'Warehouse Safety Procedures', 'Operations', 'Safety protocols for warehouse operations including forklift operation, hazmat handling, and emergency procedures.', 'Daniel Wright', 'Operations', 'warehouse,safety,hazmat,operations', 380, 30, '2024-11-20', 'operations_team', 'published')
  `);

  // Shipping (16 records)
  await client.query(`
    INSERT INTO shipping (shipping_id, order_number, customer_name, carrier, service_level, tracking_number, origin_address, destination_address, weight_kg, dimensions, shipping_cost, insurance_value, ship_date, estimated_arrival, status) VALUES
    ('SHIP-001', 'SO-2024-001', 'TechCorp Industries', 'FedEx', 'Express', 'FX-SHP-001001', 'HQ Warehouse, San Francisco CA', '100 Tech Drive, San Francisco CA 94105', 15.0, '45x35x25 cm', 85.00, 5000.00, '2024-12-02', '2024-12-03', 'delivered'),
    ('SHIP-002', 'SO-2024-002', 'Global Finance Ltd', 'UPS', 'Next Day Air', 'UPS-SHP-002001', 'HQ Warehouse, San Francisco CA', '200 Wall Street, New York NY 10005', 8.0, '30x25x20 cm', 125.00, 3000.00, '2024-12-04', '2024-12-05', 'delivered'),
    ('SHIP-003', 'SO-2024-003', 'MediCorp Health', 'FedEx', 'Ground', 'FX-SHP-003001', 'HQ Warehouse, San Francisco CA', '300 Medical Plaza, Boston MA 02101', 22.0, '50x40x30 cm', 65.00, 2000.00, '2024-12-06', '2024-12-11', 'delivered'),
    ('SHIP-004', 'SO-2024-004', 'RetailMax Corp', 'UPS', 'Ground', 'UPS-SHP-004001', 'Distribution Center East, Newark NJ', '400 Retail Row, Chicago IL 60601', 45.0, '60x50x40 cm', 95.00, 10000.00, '2024-12-08', '2024-12-12', 'delivered'),
    ('SHIP-005', 'SO-2024-005', 'AutoTech Motors', 'FedEx', 'Express', 'FX-SHP-005001', 'HQ Warehouse, San Francisco CA', '500 Motor Way, Detroit MI 48201', 12.0, '40x30x25 cm', 110.00, 5000.00, '2024-12-11', '2024-12-13', 'in_transit'),
    ('SHIP-006', 'SO-2024-007', 'Sky Logistics', 'DHL', 'Express', 'DHL-SHP-006001', 'HQ Warehouse, San Francisco CA', '700 Logistics Blvd, Memphis TN 38101', 18.0, '45x35x30 cm', 95.00, 3000.00, '2024-12-15', '2024-12-17', 'delivered'),
    ('SHIP-007', 'SO-2024-009', 'EduLearn Academy', 'USPS', 'Priority', 'USPS-SHP-007001', 'HQ Warehouse, San Francisco CA', '900 Campus Drive, Cambridge MA 02139', 5.0, '25x20x15 cm', 35.00, 1000.00, '2024-12-18', '2024-12-22', 'delivered'),
    ('SHIP-008', 'SO-2024-010', 'FinTechPro', 'FedEx', 'Express Saver', 'FX-SHP-008001', 'HQ Warehouse, San Francisco CA', '1000 Finance St, Charlotte NC 28201', 10.0, '35x30x20 cm', 78.00, 5000.00, '2024-12-19', '2024-12-22', 'in_transit'),
    ('SHIP-009', 'SO-2024-011', 'PharmaLabs Inc', 'UPS', 'Next Day Air', 'UPS-SHP-009001', 'HQ Warehouse, San Francisco CA', '1100 Pharma Way, Princeton NJ 08540', 8.0, '30x25x20 cm', 135.00, 4000.00, '2024-12-20', '2024-12-21', 'delivered'),
    ('SHIP-010', 'SO-2024-013', 'BuildRight Construction', 'FedEx', 'Ground', 'FX-SHP-010001', 'Distribution Center East, Newark NJ', '1300 Builder Rd, Denver CO 80201', 25.0, '50x40x35 cm', 72.00, 2000.00, '2024-12-22', '2024-12-27', 'in_transit'),
    ('SHIP-011', 'SO-2024-015', 'DataFlows Inc', 'UPS', 'Ground', 'UPS-SHP-011001', 'HQ Warehouse, San Francisco CA', '1500 Data Drive, San Jose CA 95101', 6.0, '28x22x18 cm', 25.00, 2000.00, '2024-12-24', '2024-12-26', 'delivered'),
    ('SHIP-012', 'SO-2024-016', 'DesignHub Creative', 'FedEx', 'Express', 'FX-SHP-012001', 'HQ Warehouse, San Francisco CA', '1600 Design Blvd, Los Angeles CA 90001', 4.0, '25x20x15 cm', 45.00, 1000.00, '2024-12-25', '2024-12-26', 'delivered'),
    ('SHIP-013', 'SO-2024-017', 'MediaWave Digital', 'DHL', 'International Express', 'DHL-SHP-013001', 'HQ Warehouse, San Francisco CA', '1700 Media Circle, Miami FL 33101', 12.0, '38x30x25 cm', 88.00, 3000.00, '2024-12-27', '2024-12-30', 'processing'),
    ('SHIP-014', 'SO-2024-018', 'EnergyPlus Utilities', 'UPS', 'Ground', 'UPS-SHP-014001', 'Distribution Center South, Atlanta GA', '1800 Energy Ave, Houston TX 77001', 15.0, '42x35x28 cm', 55.00, 2000.00, '2024-12-29', '2025-01-03', 'processing'),
    ('SHIP-015', 'QT-2025-006', 'TechCorp Industries', 'FedEx', 'Express', 'FX-SHP-015001', 'HQ Warehouse, San Francisco CA', '100 Tech Drive, San Francisco CA 94105', 3.0, '22x18x12 cm', 35.00, 1000.00, '2025-01-02', '2025-01-03', 'pending'),
    ('SHIP-016', 'SO-2024-006', 'CloudPeak Solutions', 'UPS', 'Next Day Air', 'UPS-SHP-016001', 'HQ Warehouse, San Francisco CA', '600 Cloud Ave, Seattle WA 98101', 7.0, '30x25x20 cm', 95.00, 2000.00, '2024-12-13', '2024-12-14', 'delivered')
  `);

  console.log('  Phase 3 seed complete (15 new modules, 16 records each = 240 records)');
}

module.exports = { createExpandedTables2, seedExpandedData2 };
