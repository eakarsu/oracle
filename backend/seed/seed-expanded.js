// Expanded modules - tables and seed data

async function createExpandedTables(client) {
  await client.query(`
    -- General Ledger
    CREATE TABLE IF NOT EXISTS general_ledger (
      id SERIAL PRIMARY KEY,
      account_number VARCHAR(50),
      account_name VARCHAR(255) NOT NULL,
      entry_type VARCHAR(50),
      debit DECIMAL(15,2) DEFAULT 0,
      credit DECIMAL(15,2) DEFAULT 0,
      description TEXT,
      entry_date DATE DEFAULT CURRENT_DATE,
      period VARCHAR(20),
      fiscal_year VARCHAR(10),
      status VARCHAR(50) DEFAULT 'posted',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Accounts Payable
    CREATE TABLE IF NOT EXISTS accounts_payable (
      id SERIAL PRIMARY KEY,
      invoice_number VARCHAR(50),
      vendor_name VARCHAR(255) NOT NULL,
      vendor_email VARCHAR(255),
      description TEXT,
      amount DECIMAL(15,2),
      due_date DATE,
      payment_date DATE,
      payment_method VARCHAR(50),
      status VARCHAR(50) DEFAULT 'pending',
      category VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Accounts Receivable
    CREATE TABLE IF NOT EXISTS accounts_receivable (
      id SERIAL PRIMARY KEY,
      invoice_number VARCHAR(50),
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255),
      description TEXT,
      amount DECIMAL(15,2),
      due_date DATE,
      payment_date DATE,
      payment_method VARCHAR(50),
      status VARCHAR(50) DEFAULT 'outstanding',
      category VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Payroll
    CREATE TABLE IF NOT EXISTS payroll (
      id SERIAL PRIMARY KEY,
      employee_name VARCHAR(255) NOT NULL,
      employee_id_ref VARCHAR(50),
      department VARCHAR(100),
      pay_period VARCHAR(50),
      pay_date DATE,
      base_salary DECIMAL(12,2),
      overtime_pay DECIMAL(12,2) DEFAULT 0,
      bonuses DECIMAL(12,2) DEFAULT 0,
      deductions DECIMAL(12,2) DEFAULT 0,
      tax_withholding DECIMAL(12,2) DEFAULT 0,
      net_pay DECIMAL(12,2),
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Recruitment
    CREATE TABLE IF NOT EXISTS recruitment (
      id SERIAL PRIMARY KEY,
      job_title VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      candidate_name VARCHAR(255),
      candidate_email VARCHAR(255),
      candidate_phone VARCHAR(50),
      resume_source VARCHAR(100),
      experience_years INTEGER,
      salary_expectation DECIMAL(12,2),
      application_date DATE DEFAULT CURRENT_DATE,
      interview_date DATE,
      status VARCHAR(50) DEFAULT 'applied',
      recruiter VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Training
    CREATE TABLE IF NOT EXISTS training (
      id SERIAL PRIMARY KEY,
      course_name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      instructor VARCHAR(255),
      department VARCHAR(100),
      max_participants INTEGER,
      enrolled INTEGER DEFAULT 0,
      start_date DATE,
      end_date DATE,
      duration_hours INTEGER,
      cost DECIMAL(12,2),
      location VARCHAR(255),
      status VARCHAR(50) DEFAULT 'upcoming',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Budgets
    CREATE TABLE IF NOT EXISTS budgets (
      id SERIAL PRIMARY KEY,
      budget_name VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      category VARCHAR(100),
      fiscal_year VARCHAR(10),
      quarter VARCHAR(10),
      allocated_amount DECIMAL(15,2),
      spent_amount DECIMAL(15,2) DEFAULT 0,
      remaining_amount DECIMAL(15,2),
      status VARCHAR(50) DEFAULT 'active',
      approved_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Quality Management
    CREATE TABLE IF NOT EXISTS quality_management (
      id SERIAL PRIMARY KEY,
      inspection_id VARCHAR(50),
      product_name VARCHAR(255),
      batch_number VARCHAR(50),
      inspector VARCHAR(255),
      inspection_date DATE,
      category VARCHAR(100),
      defects_found INTEGER DEFAULT 0,
      severity VARCHAR(50) DEFAULT 'low',
      corrective_action TEXT,
      status VARCHAR(50) DEFAULT 'open',
      department VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Manufacturing
    CREATE TABLE IF NOT EXISTS manufacturing (
      id SERIAL PRIMARY KEY,
      work_order VARCHAR(50),
      product_name VARCHAR(255) NOT NULL,
      quantity_ordered INTEGER,
      quantity_produced INTEGER DEFAULT 0,
      unit_cost DECIMAL(12,2),
      total_cost DECIMAL(15,2),
      production_line VARCHAR(100),
      start_date DATE,
      end_date DATE,
      status VARCHAR(50) DEFAULT 'scheduled',
      priority VARCHAR(50) DEFAULT 'medium',
      supervisor VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Helpdesk Tickets
    CREATE TABLE IF NOT EXISTS helpdesk_tickets (
      id SERIAL PRIMARY KEY,
      ticket_number VARCHAR(50),
      subject VARCHAR(255) NOT NULL,
      description TEXT,
      requester_name VARCHAR(255),
      requester_email VARCHAR(255),
      category VARCHAR(100),
      priority VARCHAR(50) DEFAULT 'medium',
      assigned_to VARCHAR(255),
      department VARCHAR(100),
      sla_hours INTEGER DEFAULT 24,
      status VARCHAR(50) DEFAULT 'open',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Contracts
    CREATE TABLE IF NOT EXISTS contracts (
      id SERIAL PRIMARY KEY,
      contract_number VARCHAR(50),
      title VARCHAR(255) NOT NULL,
      party_name VARCHAR(255),
      party_email VARCHAR(255),
      contract_type VARCHAR(100),
      value DECIMAL(15,2),
      start_date DATE,
      end_date DATE,
      auto_renew BOOLEAN DEFAULT false,
      payment_terms VARCHAR(100),
      status VARCHAR(50) DEFAULT 'draft',
      owner VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Expense Reports
    CREATE TABLE IF NOT EXISTS expense_reports (
      id SERIAL PRIMARY KEY,
      report_number VARCHAR(50),
      employee_name VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      category VARCHAR(100),
      description TEXT,
      amount DECIMAL(12,2),
      submission_date DATE,
      receipt_date DATE,
      vendor VARCHAR(255),
      payment_method VARCHAR(50),
      status VARCHAR(50) DEFAULT 'submitted',
      approver VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Timesheets
    CREATE TABLE IF NOT EXISTS timesheets (
      id SERIAL PRIMARY KEY,
      employee_name VARCHAR(255) NOT NULL,
      department VARCHAR(100),
      project_name VARCHAR(255),
      task_description TEXT,
      work_date DATE,
      hours_worked DECIMAL(5,2),
      overtime_hours DECIMAL(5,2) DEFAULT 0,
      break_hours DECIMAL(5,2) DEFAULT 0,
      clock_in TIME,
      clock_out TIME,
      status VARCHAR(50) DEFAULT 'pending',
      approved_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Documents
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      document_name VARCHAR(255) NOT NULL,
      document_type VARCHAR(50),
      category VARCHAR(100),
      department VARCHAR(100),
      version VARCHAR(20) DEFAULT '1.0',
      file_size VARCHAR(50),
      author VARCHAR(255),
      description TEXT,
      tags VARCHAR(255),
      access_level VARCHAR(50) DEFAULT 'internal',
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT,
      type VARCHAR(50) DEFAULT 'info',
      priority VARCHAR(50) DEFAULT 'normal',
      recipient VARCHAR(255),
      department VARCHAR(100),
      module VARCHAR(100),
      action_url VARCHAR(255),
      read_status BOOLEAN DEFAULT false,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Vendors
    CREATE TABLE IF NOT EXISTS vendors (
      id SERIAL PRIMARY KEY,
      vendor_code VARCHAR(50),
      company_name VARCHAR(255) NOT NULL,
      contact_name VARCHAR(255),
      email VARCHAR(255),
      phone VARCHAR(50),
      address TEXT,
      category VARCHAR(100),
      payment_terms VARCHAR(100),
      rating DECIMAL(3,1) DEFAULT 0,
      annual_spend DECIMAL(15,2),
      contract_end DATE,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- Tax Records
    CREATE TABLE IF NOT EXISTS tax_records (
      id SERIAL PRIMARY KEY,
      tax_type VARCHAR(100) NOT NULL,
      jurisdiction VARCHAR(100),
      period VARCHAR(50),
      fiscal_year VARCHAR(10),
      taxable_amount DECIMAL(15,2),
      tax_rate DECIMAL(5,2),
      tax_amount DECIMAL(15,2),
      due_date DATE,
      filing_date DATE,
      reference_number VARCHAR(50),
      status VARCHAR(50) DEFAULT 'pending',
      preparer VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

async function seedExpandedData(client) {
  // General Ledger (16 entries)
  console.log('  Seeding general ledger...');
  await client.query(`
    INSERT INTO general_ledger (account_number, account_name, entry_type, debit, credit, description, entry_date, period, fiscal_year, status) VALUES
    ('1000', 'Cash and Equivalents', 'asset', 580000, 0, 'Opening cash balance', '2025-01-01', 'Jan-2025', '2025', 'posted'),
    ('1100', 'Accounts Receivable', 'asset', 425000, 0, 'Outstanding customer invoices', '2025-01-01', 'Jan-2025', '2025', 'posted'),
    ('1200', 'Inventory', 'asset', 312000, 0, 'Warehouse inventory value', '2025-01-01', 'Jan-2025', '2025', 'posted'),
    ('1500', 'Fixed Assets', 'asset', 890000, 0, 'Property, plant & equipment', '2025-01-01', 'Jan-2025', '2025', 'posted'),
    ('2000', 'Accounts Payable', 'liability', 0, 285000, 'Outstanding vendor invoices', '2025-01-01', 'Jan-2025', '2025', 'posted'),
    ('2100', 'Accrued Liabilities', 'liability', 0, 145000, 'Accrued expenses', '2025-01-01', 'Jan-2025', '2025', 'posted'),
    ('2500', 'Long-term Debt', 'liability', 0, 500000, 'Bank loan payable', '2025-01-01', 'Jan-2025', '2025', 'posted'),
    ('3000', 'Retained Earnings', 'equity', 0, 1277000, 'Accumulated retained earnings', '2025-01-01', 'Jan-2025', '2025', 'posted'),
    ('4000', 'Sales Revenue', 'revenue', 0, 125000, 'January product sales', '2025-01-15', 'Jan-2025', '2025', 'posted'),
    ('4100', 'Service Revenue', 'revenue', 0, 85000, 'January consulting services', '2025-01-20', 'Jan-2025', '2025', 'posted'),
    ('5000', 'Cost of Goods Sold', 'expense', 62000, 0, 'Product delivery costs', '2025-01-15', 'Jan-2025', '2025', 'posted'),
    ('5100', 'Salary Expense', 'expense', 245000, 0, 'January payroll', '2025-01-31', 'Jan-2025', '2025', 'posted'),
    ('5200', 'Rent Expense', 'expense', 18500, 0, 'Office rent January', '2025-01-01', 'Jan-2025', '2025', 'posted'),
    ('5300', 'Marketing Expense', 'expense', 32000, 0, 'Digital campaign costs', '2025-01-10', 'Jan-2025', '2025', 'posted'),
    ('5400', 'IT Expense', 'expense', 12500, 0, 'Cloud services & licenses', '2025-01-01', 'Jan-2025', '2025', 'posted'),
    ('5500', 'Depreciation Expense', 'expense', 15000, 0, 'Monthly depreciation', '2025-01-31', 'Jan-2025', '2025', 'posted')
  `);

  // Accounts Payable (16 entries)
  console.log('  Seeding accounts payable...');
  await client.query(`
    INSERT INTO accounts_payable (invoice_number, vendor_name, vendor_email, description, amount, due_date, payment_date, payment_method, status, category) VALUES
    ('AP-INV-001', 'Dell Technologies', 'billing@dell.com', 'Laptop purchase - 25 units', 32499.75, '2025-01-15', '2025-01-10', 'Wire Transfer', 'paid', 'IT Equipment'),
    ('AP-INV-002', 'Amazon Web Services', 'billing@aws.com', 'Cloud hosting - January', 12500.00, '2025-02-01', NULL, 'Auto-debit', 'pending', 'Cloud Services'),
    ('AP-INV-003', 'Herman Miller', 'ar@hermanmiller.com', 'Office chairs - 50 units', 69750.00, '2025-02-15', NULL, 'Wire Transfer', 'pending', 'Furniture'),
    ('AP-INV-004', 'Cisco Systems', 'billing@cisco.com', 'Network equipment', 48750.00, '2025-02-10', NULL, 'Wire Transfer', 'approved', 'Networking'),
    ('AP-INV-005', 'Microsoft Corp', 'billing@microsoft.com', 'M365 licenses - 500 seats', 132000.00, '2025-01-31', '2025-01-28', 'Auto-debit', 'paid', 'Software'),
    ('AP-INV-006', 'Staples Business', 'invoices@staples.com', 'Office supplies Q1', 15000.00, '2025-01-20', NULL, 'Check', 'overdue', 'Office Supplies'),
    ('AP-INV-007', 'HP Enterprise', 'billing@hpe.com', 'Server hardware', 22999.95, '2025-02-20', NULL, 'Wire Transfer', 'pending', 'IT Equipment'),
    ('AP-INV-008', 'WeWork', 'billing@wework.com', 'Satellite office - January', 25000.00, '2025-01-31', '2025-01-30', 'Auto-debit', 'paid', 'Rent'),
    ('AP-INV-009', 'Cloudflare', 'billing@cloudflare.com', 'Security services - Annual', 36000.00, '2025-01-15', '2025-01-12', 'Wire Transfer', 'paid', 'Security'),
    ('AP-INV-010', 'Adobe Inc', 'billing@adobe.com', 'Creative Cloud licenses', 29994.00, '2025-01-31', '2025-01-29', 'Auto-debit', 'paid', 'Software'),
    ('AP-INV-011', 'Salesforce', 'billing@salesforce.com', 'CRM Enterprise - Annual', 96000.00, '2025-01-15', '2025-01-14', 'Wire Transfer', 'paid', 'Software'),
    ('AP-INV-012', 'Building Maintenance Co', 'billing@buildmaint.com', 'HVAC maintenance - January', 4500.00, '2025-02-05', NULL, 'Check', 'pending', 'Maintenance'),
    ('AP-INV-013', 'City Utilities', 'billing@cityutil.com', 'Electricity - January', 8200.00, '2025-02-10', NULL, 'Auto-debit', 'pending', 'Utilities'),
    ('AP-INV-014', 'Insurance Corp of America', 'billing@insurecorp.com', 'Business insurance Q1', 24000.00, '2025-01-15', '2025-01-13', 'Wire Transfer', 'paid', 'Insurance'),
    ('AP-INV-015', 'FedEx', 'billing@fedex.com', 'Shipping services - January', 3450.00, '2025-02-01', NULL, 'Auto-debit', 'pending', 'Shipping'),
    ('AP-INV-016', 'Legal Associates LLP', 'billing@legalassoc.com', 'Legal retainer - January', 12000.00, '2025-02-01', NULL, 'Wire Transfer', 'approved', 'Legal')
  `);

  // Accounts Receivable (16 entries)
  console.log('  Seeding accounts receivable...');
  await client.query(`
    INSERT INTO accounts_receivable (invoice_number, customer_name, customer_email, description, amount, due_date, payment_date, payment_method, status, category) VALUES
    ('AR-INV-001', 'TechCorp Industries', 'ap@techcorp.com', 'Enterprise License - 500 Seats', 125000.00, '2025-01-31', '2025-01-28', 'Wire Transfer', 'paid', 'License'),
    ('AR-INV-002', 'Global Finance Ltd', 'payments@globalfinance.com', 'Financial Module + Support', 85000.00, '2025-01-31', '2025-01-30', 'Wire Transfer', 'paid', 'License'),
    ('AR-INV-003', 'MediCorp Health', 'ap@medicorp.com', 'Healthcare Suite - Annual', 95000.00, '2025-02-15', NULL, 'Wire Transfer', 'outstanding', 'License'),
    ('AR-INV-004', 'RetailMax Corp', 'payments@retailmax.com', 'POS Integration x25', 60000.00, '2025-02-01', NULL, 'Credit Card', 'outstanding', 'Product'),
    ('AR-INV-005', 'AutoTech Motors', 'ap@autotech.com', 'Manufacturing ERP Module', 110000.00, '2025-02-28', NULL, 'Wire Transfer', 'outstanding', 'License'),
    ('AR-INV-006', 'CloudPeak Solutions', 'payments@cloudpeak.com', 'Cloud Integration Pack x10', 45000.00, '2025-01-31', '2025-01-25', 'Credit Card', 'paid', 'Product'),
    ('AR-INV-007', 'Sky Logistics', 'ap@skylogistics.com', 'Supply Chain Module + Training', 72000.00, '2025-02-15', NULL, 'Wire Transfer', 'outstanding', 'License'),
    ('AR-INV-008', 'SecureNet Cyber', 'payments@securenet.com', 'Security Compliance Module', 55000.00, '2025-01-31', '2025-01-29', 'Wire Transfer', 'paid', 'License'),
    ('AR-INV-009', 'EduLearn Academy', 'finance@edulearn.org', 'Education License - 200 Users', 25000.00, '2025-02-28', NULL, 'Purchase Order', 'outstanding', 'License'),
    ('AR-INV-010', 'FinTechPro', 'ap@fintechpro.com', 'Financial Analytics Suite', 145000.00, '2025-03-15', NULL, 'Wire Transfer', 'outstanding', 'License'),
    ('AR-INV-011', 'PharmaLabs Inc', 'payments@pharmalabs.com', 'Research Management Module', 88000.00, '2025-02-28', NULL, 'Wire Transfer', 'outstanding', 'License'),
    ('AR-INV-012', 'FoodChain Distributors', 'ap@foodchain.com', 'Distribution Module + Setup', 62000.00, '2025-01-31', '2025-01-30', 'Credit Card', 'paid', 'Product'),
    ('AR-INV-013', 'BuildRight Construction', 'payments@buildright.com', 'Project Management Module x5', 40000.00, '2025-02-15', NULL, 'Check', 'outstanding', 'Product'),
    ('AR-INV-014', 'DataFlows Inc', 'ap@dataflows.io', 'Data Analytics Platform', 78000.00, '2025-03-01', NULL, 'Wire Transfer', 'outstanding', 'License'),
    ('AR-INV-015', 'DesignHub Creative', 'payments@designhub.io', 'Creative Suite Integration', 28000.00, '2025-01-31', '2025-02-01', 'Credit Card', 'paid', 'Product'),
    ('AR-INV-016', 'EnergyPlus Utilities', 'ap@energyplus.com', 'Utility Management System', 56000.00, '2025-02-28', NULL, 'Purchase Order', 'overdue', 'License')
  `);

  // Payroll (16 entries)
  console.log('  Seeding payroll...');
  await client.query(`
    INSERT INTO payroll (employee_name, employee_id_ref, department, pay_period, pay_date, base_salary, overtime_pay, bonuses, deductions, tax_withholding, net_pay, status) VALUES
    ('James Anderson', 'EMP-001', 'Engineering', 'Jan 1-15 2025', '2025-01-15', 5192.31, 450.00, 0, 520.00, 1280.00, 3842.31, 'processed'),
    ('Maria Garcia', 'EMP-002', 'Engineering', 'Jan 1-15 2025', '2025-01-15', 5576.92, 0, 500.00, 560.00, 1380.00, 4136.92, 'processed'),
    ('Robert Brown', 'EMP-003', 'Sales', 'Jan 1-15 2025', '2025-01-15', 4615.38, 0, 2500.00, 460.00, 1660.00, 4995.38, 'processed'),
    ('Jennifer Taylor', 'EMP-004', 'Marketing', 'Jan 1-15 2025', '2025-01-15', 3769.23, 0, 0, 380.00, 845.00, 2544.23, 'processed'),
    ('William Martinez', 'EMP-005', 'Finance', 'Jan 1-15 2025', '2025-01-15', 3538.46, 200.00, 0, 350.00, 845.00, 2543.46, 'processed'),
    ('Linda Thomas', 'EMP-006', 'Human Resources', 'Jan 1-15 2025', '2025-01-15', 3000.00, 0, 0, 300.00, 675.00, 2025.00, 'processed'),
    ('Michael Jackson', 'EMP-007', 'Engineering', 'Jan 1-15 2025', '2025-01-15', 4807.69, 600.00, 0, 480.00, 1340.00, 3587.69, 'processed'),
    ('Susan White', 'EMP-008', 'Operations', 'Jan 1-15 2025', '2025-01-15', 4038.46, 0, 300.00, 400.00, 985.00, 2953.46, 'processed'),
    ('James Anderson', 'EMP-001', 'Engineering', 'Jan 16-31 2025', '2025-01-31', 5192.31, 300.00, 0, 520.00, 1243.00, 3729.31, 'pending'),
    ('Maria Garcia', 'EMP-002', 'Engineering', 'Jan 16-31 2025', '2025-01-31', 5576.92, 0, 0, 560.00, 1254.00, 3762.92, 'pending'),
    ('Robert Brown', 'EMP-003', 'Sales', 'Jan 16-31 2025', '2025-01-31', 4615.38, 0, 3200.00, 460.00, 1838.00, 5517.38, 'pending'),
    ('Jennifer Taylor', 'EMP-004', 'Marketing', 'Jan 16-31 2025', '2025-01-31', 3769.23, 0, 0, 380.00, 845.00, 2544.23, 'pending'),
    ('David Harris', 'EMP-009', 'Engineering', 'Jan 1-15 2025', '2025-01-15', 3653.85, 400.00, 0, 365.00, 920.00, 2768.85, 'processed'),
    ('Karen Clark', 'EMP-010', 'Sales', 'Jan 1-15 2025', '2025-01-15', 3384.62, 0, 1800.00, 340.00, 1210.00, 3634.62, 'processed'),
    ('Richard Lewis', 'EMP-011', 'Finance', 'Jan 1-15 2025', '2025-01-15', 3769.23, 0, 0, 380.00, 845.00, 2544.23, 'processed'),
    ('Thomas Hall', 'EMP-013', 'IT', 'Jan 1-15 2025', '2025-01-15', 3653.85, 350.00, 0, 365.00, 910.00, 2728.85, 'processed')
  `);

  // Recruitment (16 entries)
  console.log('  Seeding recruitment...');
  await client.query(`
    INSERT INTO recruitment (job_title, department, candidate_name, candidate_email, candidate_phone, resume_source, experience_years, salary_expectation, application_date, interview_date, status, recruiter) VALUES
    ('Senior Full-Stack Developer', 'Engineering', 'Alex Johnson', 'alex.j@email.com', '(555) 300-0001', 'LinkedIn', 8, 145000, '2025-01-05', '2025-01-20', 'interview_scheduled', 'Betty Allen'),
    ('DevOps Engineer', 'Engineering', 'Sarah Chen', 'sarah.c@email.com', '(555) 300-0002', 'Indeed', 5, 125000, '2025-01-08', '2025-01-22', 'interview_scheduled', 'Betty Allen'),
    ('Marketing Director', 'Marketing', 'Michael Torres', 'michael.t@email.com', '(555) 300-0003', 'Referral', 12, 135000, '2025-01-03', '2025-01-15', 'offer_extended', 'Betty Allen'),
    ('Financial Controller', 'Finance', 'Jennifer Adams', 'jennifer.a@email.com', '(555) 300-0004', 'Glassdoor', 10, 120000, '2025-01-10', NULL, 'screening', 'Linda Thomas'),
    ('Sales Representative', 'Sales', 'David Park', 'david.p@email.com', '(555) 300-0005', 'LinkedIn', 3, 75000, '2025-01-12', '2025-01-25', 'interview_scheduled', 'Betty Allen'),
    ('UX Designer', 'Engineering', 'Emma Rodriguez', 'emma.r@email.com', '(555) 300-0006', 'Dribbble', 6, 110000, '2025-01-07', '2025-01-18', 'second_interview', 'Betty Allen'),
    ('HR Business Partner', 'Human Resources', 'Ryan Kim', 'ryan.k@email.com', '(555) 300-0007', 'Indeed', 7, 95000, '2025-01-14', NULL, 'applied', 'Linda Thomas'),
    ('Data Scientist', 'Engineering', 'Lisa Wang', 'lisa.w@email.com', '(555) 300-0008', 'LinkedIn', 4, 130000, '2025-01-06', '2025-01-19', 'offer_extended', 'Betty Allen'),
    ('Operations Manager', 'Operations', 'John Baker', 'john.b@email.com', '(555) 300-0009', 'Referral', 9, 105000, '2025-01-02', '2025-01-12', 'hired', 'Linda Thomas'),
    ('Cybersecurity Analyst', 'IT', 'Rachel Green', 'rachel.g@email.com', '(555) 300-0010', 'LinkedIn', 5, 115000, '2025-01-11', '2025-01-24', 'interview_scheduled', 'Betty Allen'),
    ('Product Manager', 'Engineering', 'Chris Lee', 'chris.l@email.com', '(555) 300-0011', 'Company Website', 7, 140000, '2025-01-09', NULL, 'screening', 'Betty Allen'),
    ('Accountant', 'Finance', 'Maria Santos', 'maria.s@email.com', '(555) 300-0012', 'Indeed', 4, 78000, '2025-01-13', '2025-01-26', 'interview_scheduled', 'Linda Thomas'),
    ('Content Writer', 'Marketing', 'Brian Taylor', 'brian.t@email.com', '(555) 300-0013', 'LinkedIn', 3, 65000, '2025-01-15', NULL, 'applied', 'Betty Allen'),
    ('Supply Chain Analyst', 'Operations', 'Amy Chen', 'amy.c@email.com', '(555) 300-0014', 'Referral', 5, 88000, '2025-01-04', '2025-01-16', 'rejected', 'Linda Thomas'),
    ('QA Lead', 'Engineering', 'Kevin Wright', 'kevin.w@email.com', '(555) 300-0015', 'LinkedIn', 8, 120000, '2025-01-08', '2025-01-21', 'second_interview', 'Betty Allen'),
    ('Executive Assistant', 'Executive', 'Diana Miller', 'diana.m@email.com', '(555) 300-0016', 'Indeed', 6, 72000, '2025-01-10', '2025-01-23', 'interview_scheduled', 'Linda Thomas')
  `);

  // Training (16 entries)
  console.log('  Seeding training...');
  await client.query(`
    INSERT INTO training (course_name, category, instructor, department, max_participants, enrolled, start_date, end_date, duration_hours, cost, location, status) VALUES
    ('Advanced React & TypeScript', 'Technical', 'Maria Garcia', 'Engineering', 20, 18, '2025-02-10', '2025-02-14', 40, 2500, 'Training Room A', 'upcoming'),
    ('Leadership Excellence Program', 'Management', 'External - John Maxwell', 'All', 30, 25, '2025-02-03', '2025-02-05', 24, 5000, 'Board Room', 'in_progress'),
    ('HIPAA Compliance Training', 'Compliance', 'Mike Johnson', 'All', 200, 185, '2025-01-15', '2025-01-15', 4, 0, 'Online', 'completed'),
    ('AWS Cloud Architecture', 'Technical', 'External - AWS Trainer', 'IT', 15, 12, '2025-03-01', '2025-03-05', 40, 8000, 'Training Room B', 'upcoming'),
    ('Sales Negotiation Mastery', 'Sales', 'Robert Brown', 'Sales', 15, 10, '2025-02-17', '2025-02-18', 16, 1500, 'Conference Room C', 'upcoming'),
    ('Data Analytics with Python', 'Technical', 'External - DataCamp', 'Engineering', 25, 22, '2025-01-20', '2025-02-28', 60, 3000, 'Online', 'in_progress'),
    ('Project Management (PMP Prep)', 'Management', 'External - PMI Trainer', 'All', 20, 16, '2025-03-10', '2025-03-14', 40, 4500, 'Training Room A', 'upcoming'),
    ('Cybersecurity Awareness', 'Compliance', 'Thomas Hall', 'All', 200, 190, '2025-01-10', '2025-01-10', 2, 0, 'Online', 'completed'),
    ('Financial Modeling Advanced', 'Finance', 'Sarah Mitchell', 'Finance', 10, 8, '2025-02-24', '2025-02-26', 24, 2000, 'Training Room B', 'upcoming'),
    ('Agile & Scrum Methodology', 'Management', 'David Wilson', 'Engineering', 20, 18, '2025-01-27', '2025-01-28', 16, 1200, 'Training Room A', 'completed'),
    ('Customer Success Strategies', 'Sales', 'Emily Davis', 'Sales', 12, 9, '2025-02-20', '2025-02-21', 16, 1800, 'Conference Room A', 'upcoming'),
    ('SQL & Database Management', 'Technical', 'James Anderson', 'All', 30, 27, '2025-02-05', '2025-02-07', 24, 0, 'Online', 'in_progress'),
    ('Diversity & Inclusion Workshop', 'HR', 'External - D&I Consultants', 'All', 50, 42, '2025-03-15', '2025-03-15', 8, 3500, 'Board Room', 'upcoming'),
    ('Excel Advanced Analytics', 'Finance', 'William Martinez', 'Finance', 15, 14, '2025-01-22', '2025-01-23', 16, 0, 'Training Room B', 'completed'),
    ('ISO 27001 Auditor Training', 'Compliance', 'External - BSI', 'IT', 10, 8, '2025-04-01', '2025-04-04', 32, 6000, 'Training Room A', 'upcoming'),
    ('Effective Communication', 'Soft Skills', 'External - Dale Carnegie', 'All', 25, 20, '2025-02-12', '2025-02-13', 16, 2500, 'Board Room', 'upcoming')
  `);

  // Budgets (16 entries)
  console.log('  Seeding budgets...');
  await client.query(`
    INSERT INTO budgets (budget_name, department, category, fiscal_year, quarter, allocated_amount, spent_amount, remaining_amount, status, approved_by) VALUES
    ('Engineering Department Budget', 'Engineering', 'Operations', '2025', 'Q1', 450000, 185000, 265000, 'active', 'John Administrator'),
    ('Marketing Campaign Budget', 'Marketing', 'Marketing', '2025', 'Q1', 120000, 42000, 78000, 'active', 'John Administrator'),
    ('Sales Operations Budget', 'Sales', 'Operations', '2025', 'Q1', 200000, 68000, 132000, 'active', 'John Administrator'),
    ('HR & Recruitment Budget', 'Human Resources', 'HR', '2025', 'Q1', 95000, 32000, 63000, 'active', 'John Administrator'),
    ('IT Infrastructure Budget', 'IT', 'Infrastructure', '2025', 'Q1', 350000, 148000, 202000, 'active', 'John Administrator'),
    ('Finance Operations Budget', 'Finance', 'Operations', '2025', 'Q1', 80000, 22000, 58000, 'active', 'John Administrator'),
    ('Operations & Facilities Budget', 'Operations', 'Facilities', '2025', 'Q1', 180000, 72000, 108000, 'active', 'John Administrator'),
    ('Training & Development Budget', 'Human Resources', 'Training', '2025', 'Q1', 75000, 28000, 47000, 'active', 'Mike Johnson'),
    ('R&D Innovation Budget', 'Engineering', 'R&D', '2025', 'Q1', 300000, 95000, 205000, 'active', 'David Wilson'),
    ('Legal & Compliance Budget', 'Legal', 'Operations', '2025', 'Q1', 60000, 18000, 42000, 'active', 'Sarah Mitchell'),
    ('Executive Office Budget', 'Executive', 'Operations', '2025', 'Q1', 50000, 12000, 38000, 'active', 'John Administrator'),
    ('Travel & Entertainment Budget', 'All', 'Travel', '2025', 'Q1', 100000, 35000, 65000, 'active', 'Sarah Mitchell'),
    ('Capital Expenditure Budget', 'All', 'CapEx', '2025', 'Annual', 800000, 215000, 585000, 'active', 'John Administrator'),
    ('Emergency Reserve Fund', 'All', 'Reserve', '2025', 'Annual', 200000, 0, 200000, 'active', 'John Administrator'),
    ('Customer Support Budget', 'Sales', 'Support', '2025', 'Q1', 65000, 22000, 43000, 'active', 'Emily Davis'),
    ('Data & Analytics Budget', 'IT', 'Analytics', '2025', 'Q1', 85000, 28000, 57000, 'active', 'David Wilson')
  `);

  // Quality Management (16 entries)
  console.log('  Seeding quality management...');
  await client.query(`
    INSERT INTO quality_management (inspection_id, product_name, batch_number, inspector, inspection_date, category, defects_found, severity, corrective_action, status, department) VALUES
    ('QC-2025-001', 'ERP Cloud Module v2.0', 'BATCH-2025-001', 'David Harris', '2025-01-15', 'Software', 3, 'medium', 'Fix memory leak in reporting engine', 'in_progress', 'Engineering'),
    ('QC-2025-002', 'Mobile App iOS v1.5', 'BATCH-2025-002', 'David Harris', '2025-01-18', 'Software', 1, 'low', 'Minor UI alignment issue on iPad', 'closed', 'Engineering'),
    ('QC-2025-003', 'API Gateway v3.0', 'BATCH-2025-003', 'Christopher Young', '2025-01-20', 'Software', 5, 'high', 'Rate limiting not enforced on batch endpoints', 'open', 'Engineering'),
    ('QC-2025-004', 'Data Export Module', 'BATCH-2025-004', 'David Harris', '2025-01-22', 'Software', 0, 'low', 'No defects found - approved for release', 'closed', 'Engineering'),
    ('QC-2025-005', 'Customer Portal v2.1', 'BATCH-2025-005', 'Christopher Young', '2025-01-25', 'Software', 2, 'medium', 'Session timeout not handling gracefully', 'in_progress', 'Engineering'),
    ('QC-2025-006', 'Payment Processing Module', 'BATCH-2025-006', 'Maria Garcia', '2025-01-12', 'Software', 0, 'low', 'All payment flows tested - approved', 'closed', 'Engineering'),
    ('QC-2025-007', 'Server Rack Installation', 'HW-2025-001', 'Thomas Hall', '2025-01-10', 'Hardware', 1, 'low', 'Cable management needs improvement', 'closed', 'IT'),
    ('QC-2025-008', 'Network Security Audit', 'SEC-2025-001', 'Thomas Hall', '2025-01-28', 'Security', 4, 'critical', 'Firewall rules outdated, SSL certificates expiring', 'open', 'IT'),
    ('QC-2025-009', 'HR Self-Service Portal', 'BATCH-2025-009', 'David Harris', '2025-01-30', 'Software', 2, 'medium', 'PTO calculation incorrect for part-time', 'in_progress', 'Engineering'),
    ('QC-2025-010', 'Inventory Barcode System', 'BATCH-2025-010', 'Christopher Young', '2025-02-01', 'Software', 1, 'low', 'Scanner delay on large batch scans', 'open', 'Engineering'),
    ('QC-2025-011', 'Office HVAC System', 'FAC-2025-001', 'Susan White', '2025-01-20', 'Facilities', 2, 'medium', 'Temperature inconsistency on 3rd floor', 'in_progress', 'Operations'),
    ('QC-2025-012', 'Backup System Verification', 'IT-2025-001', 'Thomas Hall', '2025-01-25', 'IT Ops', 0, 'low', 'All backups verified and restorable', 'closed', 'IT'),
    ('QC-2025-013', 'Supply Chain Dashboard', 'BATCH-2025-013', 'David Harris', '2025-02-02', 'Software', 3, 'medium', 'Real-time tracking showing 5-min delay', 'open', 'Engineering'),
    ('QC-2025-014', 'Compliance Report Generator', 'BATCH-2025-014', 'Maria Garcia', '2025-02-03', 'Software', 1, 'high', 'SOX report missing required fields', 'in_progress', 'Engineering'),
    ('QC-2025-015', 'Employee Onboarding Flow', 'BATCH-2025-015', 'Christopher Young', '2025-01-28', 'Process', 2, 'medium', 'IT provisioning step not triggering', 'open', 'HR'),
    ('QC-2025-016', 'Data Center Power Audit', 'FAC-2025-002', 'Thomas Hall', '2025-02-01', 'Facilities', 1, 'high', 'UPS battery replacement needed within 30 days', 'open', 'IT')
  `);

  // Manufacturing (16 entries)
  console.log('  Seeding manufacturing...');
  await client.query(`
    INSERT INTO manufacturing (work_order, product_name, quantity_ordered, quantity_produced, unit_cost, total_cost, production_line, start_date, end_date, status, priority, supervisor) VALUES
    ('WO-2025-001', 'ERP Enterprise Server Appliance', 50, 35, 2800, 140000, 'Assembly Line A', '2025-01-10', '2025-02-15', 'in_production', 'high', 'Susan White'),
    ('WO-2025-002', 'Network Security Appliance', 100, 100, 1200, 120000, 'Assembly Line B', '2025-01-05', '2025-01-25', 'completed', 'critical', 'Susan White'),
    ('WO-2025-003', 'Cloud Gateway Device', 75, 45, 950, 71250, 'Assembly Line A', '2025-01-15', '2025-02-20', 'in_production', 'medium', 'Daniel Wright'),
    ('WO-2025-004', 'IoT Sensor Module v2', 500, 0, 85, 42500, 'Assembly Line C', '2025-02-15', '2025-03-15', 'scheduled', 'medium', 'Daniel Wright'),
    ('WO-2025-005', 'Data Center Cooling Unit', 25, 25, 4500, 112500, 'Assembly Line D', '2024-12-15', '2025-01-20', 'completed', 'high', 'Susan White'),
    ('WO-2025-006', 'Smart Office Controller', 200, 120, 350, 70000, 'Assembly Line B', '2025-01-20', '2025-02-28', 'in_production', 'medium', 'Daniel Wright'),
    ('WO-2025-007', 'Enterprise Backup Appliance', 30, 0, 3200, 96000, 'Assembly Line A', '2025-03-01', '2025-04-01', 'scheduled', 'high', 'Susan White'),
    ('WO-2025-008', 'Wireless Access Point Pro', 300, 300, 180, 54000, 'Assembly Line C', '2025-01-02', '2025-01-18', 'completed', 'medium', 'Daniel Wright'),
    ('WO-2025-009', 'Video Conferencing Hub', 80, 55, 650, 52000, 'Assembly Line B', '2025-01-22', '2025-02-25', 'in_production', 'medium', 'Susan White'),
    ('WO-2025-010', 'Edge Computing Node', 150, 0, 420, 63000, 'Assembly Line C', '2025-02-20', '2025-03-20', 'scheduled', 'high', 'Daniel Wright'),
    ('WO-2025-011', 'Power Distribution Unit', 60, 60, 780, 46800, 'Assembly Line D', '2025-01-08', '2025-01-28', 'completed', 'medium', 'Susan White'),
    ('WO-2025-012', 'Rack Mount Console', 40, 28, 1100, 44000, 'Assembly Line A', '2025-01-25', '2025-02-20', 'in_production', 'low', 'Daniel Wright'),
    ('WO-2025-013', 'Fiber Optic Patch Panel', 200, 200, 120, 24000, 'Assembly Line C', '2025-01-03', '2025-01-15', 'completed', 'medium', 'Daniel Wright'),
    ('WO-2025-014', 'KVM Switch Enterprise', 45, 0, 890, 40050, 'Assembly Line B', '2025-03-05', '2025-04-05', 'scheduled', 'medium', 'Susan White'),
    ('WO-2025-015', 'Server Room Monitor', 100, 75, 290, 29000, 'Assembly Line C', '2025-01-18', '2025-02-15', 'in_production', 'high', 'Daniel Wright'),
    ('WO-2025-016', 'Custom Cable Assembly Kit', 500, 350, 45, 22500, 'Assembly Line D', '2025-01-12', '2025-02-10', 'in_production', 'low', 'Daniel Wright')
  `);

  // Helpdesk Tickets (16 entries)
  console.log('  Seeding helpdesk tickets...');
  await client.query(`
    INSERT INTO helpdesk_tickets (ticket_number, subject, description, requester_name, requester_email, category, priority, assigned_to, department, sla_hours, status) VALUES
    ('TKT-2025-001', 'VPN Connection Issues', 'Cannot connect to VPN from home office. Tried resetting credentials.', 'Jennifer Taylor', 'jennifer.taylor@oracle-erp.com', 'Network', 'high', 'Thomas Hall', 'IT', 4, 'in_progress'),
    ('TKT-2025-002', 'New Laptop Setup Request', 'Need new laptop configured for new hire starting Feb 1', 'Betty Allen', 'betty.allen@oracle-erp.com', 'Hardware', 'medium', 'Thomas Hall', 'IT', 24, 'open'),
    ('TKT-2025-003', 'Email Not Syncing on Mobile', 'Outlook app not syncing emails since yesterday', 'Robert Brown', 'robert.brown@oracle-erp.com', 'Email', 'medium', 'David Wilson', 'IT', 8, 'resolved'),
    ('TKT-2025-004', 'ERP Report Export Failing', 'Monthly finance report export throws 500 error', 'Sarah Mitchell', 'sarah.finance@oracle-erp.com', 'Application', 'critical', 'James Anderson', 'Engineering', 2, 'in_progress'),
    ('TKT-2025-005', 'Printer Jam - Floor 2', 'HP LaserJet on 2nd floor is constantly jamming', 'Nancy Walker', 'nancy.walker@oracle-erp.com', 'Hardware', 'low', 'Thomas Hall', 'IT', 24, 'open'),
    ('TKT-2025-006', 'Password Reset Request', 'Locked out after too many failed attempts', 'Karen Clark', 'karen.clark@oracle-erp.com', 'Access', 'high', 'Thomas Hall', 'IT', 1, 'resolved'),
    ('TKT-2025-007', 'Slow Application Performance', 'CRM module loading very slowly since update', 'Emily Davis', 'emily.sales@oracle-erp.com', 'Application', 'high', 'James Anderson', 'Engineering', 4, 'in_progress'),
    ('TKT-2025-008', 'Conference Room AV Issues', 'Video conferencing system not connecting to displays', 'Susan White', 'susan.white@oracle-erp.com', 'AV Equipment', 'medium', 'David Wilson', 'IT', 8, 'open'),
    ('TKT-2025-009', 'Software License Activation', 'Need Adobe CC license activated for new designer', 'Jennifer Taylor', 'jennifer.taylor@oracle-erp.com', 'Software', 'medium', 'Thomas Hall', 'IT', 8, 'resolved'),
    ('TKT-2025-010', 'Data Backup Verification', 'Please verify Q4 backup integrity for audit', 'Sarah Mitchell', 'sarah.finance@oracle-erp.com', 'Data', 'high', 'Thomas Hall', 'IT', 4, 'in_progress'),
    ('TKT-2025-011', 'New User Account Creation', 'Create accounts for 3 new hires in Sales dept', 'Betty Allen', 'betty.allen@oracle-erp.com', 'Access', 'medium', 'Thomas Hall', 'IT', 8, 'open'),
    ('TKT-2025-012', 'Security Alert Investigation', 'Unusual login detected from foreign IP', 'Thomas Hall', 'thomas.hall@oracle-erp.com', 'Security', 'critical', 'David Wilson', 'IT', 1, 'in_progress'),
    ('TKT-2025-013', 'Wi-Fi Dead Zone - Floor 3', 'No Wi-Fi signal near meeting rooms 305-308', 'Daniel Wright', 'daniel.wright@oracle-erp.com', 'Network', 'medium', 'Thomas Hall', 'IT', 24, 'open'),
    ('TKT-2025-014', 'Database Performance Tuning', 'Inventory queries taking 10+ seconds', 'Maria Garcia', 'maria.garcia@oracle-erp.com', 'Database', 'high', 'James Anderson', 'Engineering', 4, 'open'),
    ('TKT-2025-015', 'Mobile App Crash Report', 'iOS app crashing when viewing large reports', 'Robert Brown', 'robert.brown@oracle-erp.com', 'Application', 'medium', 'Christopher Young', 'Engineering', 8, 'in_progress'),
    ('TKT-2025-016', 'Office 365 Integration Issue', 'Calendar sync broken between ERP and O365', 'Mike Johnson', 'mike.hr@oracle-erp.com', 'Integration', 'medium', 'David Wilson', 'IT', 8, 'open')
  `);

  // Contracts (16 entries)
  console.log('  Seeding contracts...');
  await client.query(`
    INSERT INTO contracts (contract_number, title, party_name, party_email, contract_type, value, start_date, end_date, auto_renew, payment_terms, status, owner) VALUES
    ('CTR-2024-001', 'AWS Enterprise Support Agreement', 'Amazon Web Services', 'contracts@aws.com', 'Service', 150000, '2024-01-01', '2024-12-31', true, 'Annual', 'active', 'David Wilson'),
    ('CTR-2024-002', 'Office Lease Agreement - HQ', 'Skyline Properties', 'leasing@skyline.com', 'Lease', 222000, '2023-06-01', '2026-05-31', false, 'Monthly', 'active', 'Susan White'),
    ('CTR-2024-003', 'TechCorp Enterprise License', 'TechCorp Industries', 'legal@techcorp.com', 'License', 125000, '2024-12-01', '2025-11-30', true, 'Annual', 'active', 'Emily Davis'),
    ('CTR-2024-004', 'Cisco Maintenance Agreement', 'Cisco Systems', 'contracts@cisco.com', 'Maintenance', 48000, '2024-06-01', '2025-05-31', true, 'Annual', 'active', 'Thomas Hall'),
    ('CTR-2024-005', 'Legal Retainer - Legal Associates', 'Legal Associates LLP', 'billing@legalassoc.com', 'Service', 144000, '2024-01-01', '2024-12-31', true, 'Monthly', 'active', 'Sarah Mitchell'),
    ('CTR-2024-006', 'MediCorp Implementation', 'MediCorp Health', 'legal@medicorp.com', 'Service', 350000, '2024-10-01', '2025-09-30', false, 'Milestone', 'active', 'Emily Davis'),
    ('CTR-2024-007', 'Insurance Policy - Business', 'Insurance Corp of America', 'policies@insurecorp.com', 'Insurance', 96000, '2024-01-01', '2024-12-31', true, 'Quarterly', 'active', 'Sarah Mitchell'),
    ('CTR-2024-008', 'Salesforce CRM License', 'Salesforce', 'legal@salesforce.com', 'License', 96000, '2024-04-01', '2025-03-31', true, 'Annual', 'active', 'Emily Davis'),
    ('CTR-2024-009', 'Cleaning Services Agreement', 'CleanPro Services', 'office@cleanpro.com', 'Service', 36000, '2024-01-01', '2024-12-31', true, 'Monthly', 'expiring_soon', 'Susan White'),
    ('CTR-2024-010', 'FinTechPro Analytics License', 'FinTechPro', 'legal@fintechpro.com', 'License', 420000, '2025-01-01', '2025-12-31', false, 'Quarterly', 'draft', 'Emily Davis'),
    ('CTR-2024-011', 'WeWork Satellite Office', 'WeWork', 'enterprise@wework.com', 'Lease', 300000, '2024-07-01', '2025-06-30', false, 'Monthly', 'active', 'Susan White'),
    ('CTR-2024-012', 'Adobe Creative Cloud Enterprise', 'Adobe Inc', 'legal@adobe.com', 'License', 29994, '2024-06-01', '2025-05-31', true, 'Annual', 'active', 'David Wilson'),
    ('CTR-2024-013', 'Security Consulting Agreement', 'SecureNet Cyber', 'legal@securenet.com', 'Service', 55000, '2024-11-01', '2025-04-30', false, 'Monthly', 'active', 'Thomas Hall'),
    ('CTR-2024-014', 'Microsoft Enterprise Agreement', 'Microsoft Corp', 'licensing@microsoft.com', 'License', 132000, '2024-01-01', '2026-12-31', true, 'Annual', 'active', 'David Wilson'),
    ('CTR-2024-015', 'Building Maintenance Contract', 'Building Maintenance Co', 'contracts@buildmaint.com', 'Service', 54000, '2024-01-01', '2024-12-31', true, 'Monthly', 'expiring_soon', 'Susan White'),
    ('CTR-2024-016', 'Cloudflare Enterprise Security', 'Cloudflare', 'legal@cloudflare.com', 'Service', 36000, '2024-07-01', '2025-06-30', true, 'Annual', 'active', 'Thomas Hall')
  `);

  // Expense Reports (16 entries)
  console.log('  Seeding expense reports...');
  await client.query(`
    INSERT INTO expense_reports (report_number, employee_name, department, category, description, amount, submission_date, receipt_date, vendor, payment_method, status, approver) VALUES
    ('EXP-2025-001', 'Robert Brown', 'Sales', 'Travel', 'Client meeting flight - TechCorp SF', 485.00, '2025-01-18', '2025-01-15', 'United Airlines', 'Corporate Card', 'approved', 'Emily Davis'),
    ('EXP-2025-002', 'Robert Brown', 'Sales', 'Meals', 'Client dinner - TechCorp deal closing', 245.00, '2025-01-18', '2025-01-16', 'The Capital Grille', 'Corporate Card', 'approved', 'Emily Davis'),
    ('EXP-2025-003', 'Jennifer Taylor', 'Marketing', 'Conference', 'MarketingWorld 2025 registration', 1200.00, '2025-01-20', '2025-01-10', 'MarketingWorld', 'Corporate Card', 'approved', 'Emily Davis'),
    ('EXP-2025-004', 'Jennifer Taylor', 'Marketing', 'Travel', 'Conference hotel - 3 nights', 675.00, '2025-01-20', '2025-01-12', 'Hilton Hotels', 'Corporate Card', 'approved', 'Emily Davis'),
    ('EXP-2025-005', 'David Wilson', 'IT', 'Software', 'Emergency SSL certificate purchase', 350.00, '2025-01-22', '2025-01-22', 'DigiCert', 'Corporate Card', 'approved', 'John Administrator'),
    ('EXP-2025-006', 'Karen Clark', 'Sales', 'Travel', 'Client visit - RetailMax Chicago', 520.00, '2025-01-25', '2025-01-23', 'Delta Airlines', 'Personal Card', 'pending', 'Robert Brown'),
    ('EXP-2025-007', 'Karen Clark', 'Sales', 'Accommodation', 'Hotel for RetailMax visit', 380.00, '2025-01-25', '2025-01-24', 'Marriott Chicago', 'Personal Card', 'pending', 'Robert Brown'),
    ('EXP-2025-008', 'Thomas Hall', 'IT', 'Training', 'AWS certification exam fee', 300.00, '2025-01-28', '2025-01-28', 'AWS Training', 'Personal Card', 'approved', 'David Wilson'),
    ('EXP-2025-009', 'Maria Garcia', 'Engineering', 'Equipment', 'External monitor for remote work', 449.99, '2025-01-15', '2025-01-12', 'Best Buy', 'Personal Card', 'approved', 'David Wilson'),
    ('EXP-2025-010', 'Susan White', 'Operations', 'Office Supplies', 'Emergency office supplies purchase', 185.00, '2025-01-30', '2025-01-29', 'Office Depot', 'Corporate Card', 'approved', 'Lisa Chen'),
    ('EXP-2025-011', 'Mike Johnson', 'Human Resources', 'Meals', 'Team building lunch event', 425.00, '2025-01-20', '2025-01-18', 'Restaurant XYZ', 'Corporate Card', 'approved', 'John Administrator'),
    ('EXP-2025-012', 'Emily Davis', 'Sales', 'Travel', 'Sales conference - Las Vegas', 890.00, '2025-02-01', '2025-01-28', 'Southwest Airlines', 'Corporate Card', 'submitted', 'John Administrator'),
    ('EXP-2025-013', 'James Anderson', 'Engineering', 'Software', 'JetBrains IDE license renewal', 249.00, '2025-01-10', '2025-01-08', 'JetBrains', 'Personal Card', 'approved', 'David Wilson'),
    ('EXP-2025-014', 'Dorothy King', 'Sales', 'Travel', 'Prospect visit - Denver', 340.00, '2025-02-02', '2025-01-30', 'Frontier Airlines', 'Personal Card', 'submitted', 'Robert Brown'),
    ('EXP-2025-015', 'William Martinez', 'Finance', 'Training', 'CPA continuing education course', 595.00, '2025-01-25', '2025-01-20', 'AICPA', 'Personal Card', 'approved', 'Sarah Mitchell'),
    ('EXP-2025-016', 'Christopher Young', 'Engineering', 'Equipment', 'Mechanical keyboard for office', 179.99, '2025-02-03', '2025-02-01', 'Amazon', 'Personal Card', 'pending', 'Maria Garcia')
  `);

  // Timesheets (16 entries)
  console.log('  Seeding timesheets...');
  await client.query(`
    INSERT INTO timesheets (employee_name, department, project_name, task_description, work_date, hours_worked, overtime_hours, break_hours, clock_in, clock_out, status, approved_by) VALUES
    ('James Anderson', 'Engineering', 'ERP v2.0 Migration', 'Backend API development for new modules', '2025-01-27', 8.5, 0.5, 1.0, '08:30', '18:00', 'approved', 'Maria Garcia'),
    ('James Anderson', 'Engineering', 'ERP v2.0 Migration', 'Database migration scripts', '2025-01-28', 8.0, 0, 1.0, '09:00', '18:00', 'approved', 'Maria Garcia'),
    ('Maria Garcia', 'Engineering', 'Customer Portal Redesign', 'Code review and architecture planning', '2025-01-27', 9.0, 1.0, 1.0, '08:00', '18:00', 'approved', 'David Wilson'),
    ('Christopher Young', 'Engineering', 'Customer Portal Redesign', 'Frontend React component development', '2025-01-27', 8.0, 0, 1.0, '09:00', '18:00', 'approved', 'Maria Garcia'),
    ('Christopher Young', 'Engineering', 'Customer Portal Redesign', 'UI testing and bug fixes', '2025-01-28', 8.5, 0.5, 1.0, '08:30', '18:00', 'approved', 'Maria Garcia'),
    ('David Harris', 'Engineering', 'Mobile App Development', 'QA testing - regression suite', '2025-01-27', 8.0, 0, 1.0, '09:00', '18:00', 'approved', 'Maria Garcia'),
    ('Michael Jackson', 'Engineering', 'Infrastructure Modernization', 'Kubernetes cluster setup', '2025-01-27', 9.5, 1.5, 0.5, '07:30', '18:00', 'approved', 'David Wilson'),
    ('Robert Brown', 'Sales', 'Sales Territory Expansion', 'APAC market research and calls', '2025-01-27', 8.0, 0, 1.0, '08:00', '17:00', 'pending', 'Emily Davis'),
    ('Karen Clark', 'Sales', 'Customer Success Platform', 'Client onboarding calls', '2025-01-27', 7.5, 0, 1.0, '09:00', '17:30', 'pending', 'Robert Brown'),
    ('Jennifer Taylor', 'Marketing', 'Q1 Marketing Campaign', 'Campaign content creation', '2025-01-27', 8.0, 0, 1.0, '09:00', '18:00', 'approved', 'Emily Davis'),
    ('Nancy Walker', 'Marketing', 'Q1 Marketing Campaign', 'Social media content scheduling', '2025-01-27', 7.5, 0, 1.0, '09:30', '18:00', 'pending', 'Jennifer Taylor'),
    ('William Martinez', 'Finance', 'Compliance Automation', 'Financial report automation scripts', '2025-01-27', 8.0, 0, 1.0, '09:00', '18:00', 'approved', 'Sarah Mitchell'),
    ('Thomas Hall', 'IT', 'ISO 27001 Certification', 'Security policy documentation', '2025-01-27', 8.5, 0.5, 1.0, '08:00', '17:30', 'approved', 'David Wilson'),
    ('Linda Thomas', 'Human Resources', 'Performance Review System', 'Review form design and testing', '2025-01-27', 7.5, 0, 1.0, '09:00', '17:30', 'approved', 'Mike Johnson'),
    ('Daniel Wright', 'Operations', 'Supply Chain Optimization', 'Vendor evaluation reports', '2025-01-27', 8.0, 0, 1.0, '08:30', '17:30', 'pending', 'Susan White'),
    ('Susan White', 'Operations', 'Office Renovation Phase 2', 'Contractor meetings and planning', '2025-01-27', 7.0, 0, 1.0, '09:00', '17:00', 'approved', 'Lisa Chen')
  `);

  // Documents (16 entries)
  console.log('  Seeding documents...');
  await client.query(`
    INSERT INTO documents (document_name, document_type, category, department, version, file_size, author, description, tags, access_level, status) VALUES
    ('Employee Handbook 2025', 'PDF', 'Policy', 'Human Resources', '3.2', '4.5 MB', 'Mike Johnson', 'Complete employee handbook with updated policies for 2025', 'handbook,policy,hr', 'all_employees', 'active'),
    ('Q4 2024 Financial Report', 'PDF', 'Report', 'Finance', '1.0', '2.8 MB', 'Sarah Mitchell', 'Quarterly financial statement and analysis', 'finance,quarterly,report', 'management', 'active'),
    ('IT Security Policy', 'PDF', 'Policy', 'IT', '5.1', '1.2 MB', 'Thomas Hall', 'Information security policy and guidelines', 'security,policy,it', 'all_employees', 'active'),
    ('Sales Playbook 2025', 'PPTX', 'Guide', 'Sales', '2.0', '15.3 MB', 'Emily Davis', 'Comprehensive sales methodology and customer engagement guide', 'sales,playbook,strategy', 'sales_team', 'active'),
    ('Architecture Design Document', 'PDF', 'Technical', 'Engineering', '4.3', '8.7 MB', 'David Wilson', 'System architecture for ERP v2.0 cloud migration', 'architecture,technical,erp', 'engineering', 'active'),
    ('Vendor Evaluation Template', 'XLSX', 'Template', 'Operations', '1.5', '0.8 MB', 'Lisa Chen', 'Standardized vendor evaluation scorecard', 'vendor,template,procurement', 'internal', 'active'),
    ('Brand Guidelines 2025', 'PDF', 'Guide', 'Marketing', '2.1', '22.5 MB', 'Jennifer Taylor', 'Company brand identity, logo usage, and design guidelines', 'brand,marketing,design', 'all_employees', 'active'),
    ('API Documentation v3.0', 'HTML', 'Technical', 'Engineering', '3.0', '1.5 MB', 'James Anderson', 'REST API reference documentation for integrations', 'api,technical,integration', 'internal', 'active'),
    ('Disaster Recovery Plan', 'PDF', 'Policy', 'IT', '2.4', '3.2 MB', 'Thomas Hall', 'Business continuity and disaster recovery procedures', 'dr,security,continuity', 'management', 'active'),
    ('Onboarding Checklist', 'DOCX', 'Template', 'Human Resources', '1.8', '0.3 MB', 'Betty Allen', 'New employee onboarding process checklist', 'onboarding,hr,checklist', 'hr_team', 'active'),
    ('Product Roadmap 2025', 'PPTX', 'Strategy', 'Engineering', '1.2', '5.4 MB', 'David Wilson', 'Product development roadmap and milestone planning', 'roadmap,product,strategy', 'management', 'active'),
    ('Compliance Audit Report', 'PDF', 'Report', 'Finance', '1.0', '6.1 MB', 'Sarah Mitchell', 'Annual compliance audit findings and recommendations', 'compliance,audit,report', 'management', 'active'),
    ('Meeting Room Booking Guide', 'PDF', 'Guide', 'Operations', '1.0', '0.5 MB', 'Susan White', 'Guide for booking conference and meeting rooms', 'facilities,guide,booking', 'all_employees', 'active'),
    ('Data Governance Framework', 'PDF', 'Policy', 'IT', '1.3', '2.1 MB', 'David Wilson', 'Data classification, handling, and governance policies', 'data,governance,policy', 'internal', 'active'),
    ('Customer Case Studies', 'PDF', 'Marketing', 'Sales', '1.0', '12.8 MB', 'Emily Davis', 'Collection of customer success stories and case studies', 'customers,marketing,sales', 'all_employees', 'active'),
    ('Expense Policy Manual', 'PDF', 'Policy', 'Finance', '2.0', '1.1 MB', 'Sarah Mitchell', 'Company expense reporting policies and procedures', 'expense,policy,finance', 'all_employees', 'active')
  `);

  // Notifications (16 entries)
  console.log('  Seeding notifications...');
  await client.query(`
    INSERT INTO notifications (title, message, type, priority, recipient, department, module, action_url, read_status, status) VALUES
    ('System Maintenance Scheduled', 'Planned system maintenance on Feb 15, 2025 from 2:00 AM - 6:00 AM EST. All services will be briefly unavailable.', 'warning', 'high', 'All Users', 'IT', 'System', '/notifications', false, 'active'),
    ('Q4 Financial Report Available', 'The Q4 2024 Financial Report has been published and is available for review.', 'info', 'normal', 'Management', 'Finance', 'Finance', '/finance', false, 'active'),
    ('New PO Requires Approval', 'Purchase Order PO-2025-001 for $48,750 from Cisco Systems requires your approval.', 'action', 'high', 'John Administrator', 'Finance', 'Procurement', '/procurement', false, 'active'),
    ('ISO 27001 Audit Reminder', 'ISO 27001 certification audit is scheduled for Feb 28, 2025. Please ensure all documentation is ready.', 'warning', 'critical', 'IT Department', 'IT', 'Compliance', '/compliance', false, 'active'),
    ('Employee Onboarding - New Hire', 'New hire John Baker starts on Feb 1. Please complete IT provisioning and onboarding steps.', 'action', 'high', 'IT Department', 'HR', 'HR', '/hr', true, 'active'),
    ('Sales Target Achievement', 'Congratulations! Q4 2024 sales target exceeded by 15%. Total revenue: $1.13M', 'success', 'normal', 'Sales Team', 'Sales', 'Sales', '/sales', true, 'active'),
    ('Contract Expiring Soon', 'Cleaning Services Agreement (CTR-2024-009) expires in 30 days. Review and renew if needed.', 'warning', 'normal', 'Susan White', 'Operations', 'Contracts', '/contracts', false, 'active'),
    ('Security Alert - Unusual Login', 'Unusual login attempt detected from IP 203.45.67.89. Investigation in progress.', 'alert', 'critical', 'IT Security', 'IT', 'Security', '/helpdesk', false, 'active'),
    ('Training Registration Open', 'Advanced React & TypeScript training starts Feb 10. Register now - 2 spots remaining.', 'info', 'normal', 'Engineering', 'HR', 'Training', '/training', false, 'active'),
    ('Budget Review Required', 'Q1 2025 budget allocations need department head approval by Feb 5.', 'action', 'high', 'Department Heads', 'Finance', 'Budgets', '/budgets', false, 'active'),
    ('Inventory Alert - Low Stock', 'iPad Pro 12.9" (SKU-TAB-015) is at low stock level. Current quantity: 5. Reorder level: 5.', 'warning', 'normal', 'Operations', 'Operations', 'Inventory', '/inventory', false, 'active'),
    ('Payroll Processing Complete', 'January 1-15 payroll has been processed successfully for all departments.', 'success', 'normal', 'HR Department', 'Finance', 'Payroll', '/payroll', true, 'active'),
    ('Project Milestone Achieved', 'ISO 27001 Certification project reached 80% completion. On track for Feb 28 target.', 'success', 'normal', 'Thomas Hall', 'IT', 'Projects', '/projects', true, 'active'),
    ('Compliance Deadline Approaching', 'PCI DSS assessment deadline is April 30, 2025. Start preparation now.', 'warning', 'high', 'Finance', 'Finance', 'Compliance', '/compliance', false, 'active'),
    ('New Helpdesk Ticket Assigned', 'Critical ticket TKT-2025-004 assigned to you: ERP Report Export Failing', 'action', 'critical', 'James Anderson', 'Engineering', 'Helpdesk', '/helpdesk', false, 'active'),
    ('Welcome to Oracle ERP', 'Welcome to Oracle ERP System. Explore the dashboard to access all enterprise modules.', 'info', 'normal', 'All Users', 'System', 'System', '/', true, 'active')
  `);

  // Vendors (16 entries)
  console.log('  Seeding vendors...');
  await client.query(`
    INSERT INTO vendors (vendor_code, company_name, contact_name, email, phone, address, category, payment_terms, rating, annual_spend, contract_end, status) VALUES
    ('VND-001', 'Dell Technologies', 'Mark Stevens', 'enterprise@dell.com', '(800) 624-9897', '1 Dell Way, Round Rock, TX 78682', 'IT Hardware', 'Net 30', 4.5, 125000, '2025-12-31', 'active'),
    ('VND-002', 'Amazon Web Services', 'Cloud Sales Team', 'aws-sales@amazon.com', '(206) 266-1000', '410 Terry Ave N, Seattle, WA 98109', 'Cloud Services', 'Monthly', 4.8, 150000, '2025-12-31', 'active'),
    ('VND-003', 'Cisco Systems', 'Patricia Lee', 'enterprise@cisco.com', '(408) 526-4000', '170 W Tasman Dr, San Jose, CA 95134', 'Networking', 'Net 30', 4.3, 96000, '2025-05-31', 'active'),
    ('VND-004', 'Microsoft Corp', 'Enterprise Licensing', 'licensing@microsoft.com', '(425) 882-8080', 'One Microsoft Way, Redmond, WA 98052', 'Software', 'Annual', 4.7, 132000, '2026-12-31', 'active'),
    ('VND-005', 'Samsung Electronics', 'B2B Sales', 'b2b@samsung.com', '(800) 726-7864', '85 Challenger Rd, Ridgefield Park, NJ 07660', 'Electronics', 'Net 30', 4.2, 85000, '2025-06-30', 'active'),
    ('VND-006', 'Herman Miller', 'Corporate Sales', 'orders@hermanmiller.com', '(888) 443-4357', '855 E Main Ave, Zeeland, MI 49464', 'Furniture', 'Net 45', 4.0, 70000, '2025-12-31', 'active'),
    ('VND-007', 'HP Enterprise', 'Server Division', 'sales@hpe.com', '(650) 857-1501', '1501 Page Mill Rd, Palo Alto, CA 94304', 'Servers', 'Net 30', 4.1, 45000, '2025-12-31', 'active'),
    ('VND-008', 'Salesforce', 'Account Manager', 'sales@salesforce.com', '(415) 901-7000', 'Salesforce Tower, 415 Mission St, SF, CA 94105', 'CRM Software', 'Annual', 4.4, 96000, '2025-03-31', 'active'),
    ('VND-009', 'Adobe Inc', 'Enterprise Sales', 'enterprise@adobe.com', '(408) 536-6000', '345 Park Ave, San Jose, CA 95110', 'Software', 'Annual', 4.3, 30000, '2025-05-31', 'active'),
    ('VND-010', 'Cloudflare', 'Enterprise Team', 'enterprise@cloudflare.com', '(888) 993-5273', '101 Townsend St, San Francisco, CA 94107', 'Security', 'Annual', 4.6, 36000, '2025-06-30', 'active'),
    ('VND-011', 'FedEx', 'Corporate Shipping', 'corporate@fedex.com', '(800) 463-3339', '942 S Shady Grove Rd, Memphis, TN 38120', 'Shipping', 'Monthly', 3.8, 25000, '2025-12-31', 'active'),
    ('VND-012', 'Staples Business', 'Account Rep', 'corporate@staples.com', '(800) 378-2753', '500 Staples Dr, Framingham, MA 01702', 'Office Supplies', 'Net 15', 3.5, 60000, '2025-12-31', 'active'),
    ('VND-013', 'WeWork', 'Enterprise Solutions', 'enterprise@wework.com', '(646) 491-9060', '115 W 18th St, New York, NY 10011', 'Real Estate', 'Monthly', 3.9, 300000, '2025-06-30', 'active'),
    ('VND-014', 'Legal Associates LLP', 'Managing Partner', 'billing@legalassoc.com', '(555) 400-0001', '500 Legal Plaza, San Francisco, CA 94102', 'Legal Services', 'Monthly', 4.2, 144000, '2025-12-31', 'active'),
    ('VND-015', 'Insurance Corp of America', 'Corporate Accounts', 'corporate@insurecorp.com', '(555) 400-0002', '200 Insurance Blvd, Hartford, CT 06101', 'Insurance', 'Quarterly', 4.0, 96000, '2025-12-31', 'active'),
    ('VND-016', 'CleanPro Services', 'Office Manager', 'office@cleanpro.com', '(555) 400-0003', '100 Clean St, San Francisco, CA 94103', 'Facilities', 'Monthly', 3.7, 36000, '2025-12-31', 'active')
  `);

  // Tax Records (16 entries)
  console.log('  Seeding tax records...');
  await client.query(`
    INSERT INTO tax_records (tax_type, jurisdiction, period, fiscal_year, taxable_amount, tax_rate, tax_amount, due_date, filing_date, reference_number, status, preparer) VALUES
    ('Federal Income Tax', 'Federal', 'Q4 2024', '2024', 1850000, 21.00, 388500, '2025-03-15', NULL, 'FED-2024-Q4', 'pending', 'Sarah Mitchell'),
    ('State Income Tax', 'California', 'Q4 2024', '2024', 1850000, 8.84, 163540, '2025-03-15', NULL, 'CA-2024-Q4', 'pending', 'Sarah Mitchell'),
    ('Sales Tax', 'California', 'December 2024', '2024', 285000, 8.625, 24581, '2025-01-31', '2025-01-28', 'ST-CA-2024-12', 'filed', 'Richard Lewis'),
    ('Sales Tax', 'California', 'January 2025', '2025', 310000, 8.625, 26738, '2025-02-28', NULL, 'ST-CA-2025-01', 'pending', 'Richard Lewis'),
    ('Payroll Tax - FICA', 'Federal', 'January 2025', '2025', 490000, 7.65, 37485, '2025-02-15', '2025-02-10', 'FICA-2025-01', 'filed', 'Sarah Mitchell'),
    ('Payroll Tax - FUTA', 'Federal', 'Q4 2024', '2024', 42000, 6.00, 2520, '2025-01-31', '2025-01-29', 'FUTA-2024-Q4', 'filed', 'Sarah Mitchell'),
    ('Payroll Tax - SUI', 'California', 'Q4 2024', '2024', 49000, 3.40, 1666, '2025-01-31', '2025-01-29', 'SUI-CA-2024-Q4', 'filed', 'Sarah Mitchell'),
    ('Property Tax', 'San Francisco County', 'Annual 2024', '2024', 2500000, 1.17, 29250, '2025-04-10', NULL, 'PROP-SF-2024', 'pending', 'Richard Lewis'),
    ('Federal Estimated Tax', 'Federal', 'Q1 2025', '2025', 2000000, 21.00, 420000, '2025-04-15', NULL, 'EST-FED-2025-Q1', 'pending', 'Sarah Mitchell'),
    ('State Estimated Tax', 'California', 'Q1 2025', '2025', 2000000, 8.84, 176800, '2025-04-15', NULL, 'EST-CA-2025-Q1', 'pending', 'Sarah Mitchell'),
    ('Sales Tax', 'New York', 'Q4 2024', '2024', 125000, 8.875, 11094, '2025-01-20', '2025-01-18', 'ST-NY-2024-Q4', 'filed', 'Richard Lewis'),
    ('Sales Tax', 'Texas', 'Q4 2024', '2024', 95000, 8.25, 7838, '2025-01-20', '2025-01-19', 'ST-TX-2024-Q4', 'filed', 'Richard Lewis'),
    ('Business License Tax', 'San Francisco', 'Annual 2025', '2025', 5200000, 0.38, 19760, '2025-02-28', NULL, 'BLT-SF-2025', 'pending', 'Patricia Lopez'),
    ('International VAT', 'European Union', 'Q4 2024', '2024', 180000, 20.00, 36000, '2025-01-31', '2025-01-30', 'VAT-EU-2024-Q4', 'filed', 'Patricia Lopez'),
    ('Franchise Tax', 'California', 'Annual 2024', '2024', 0, 0, 800, '2025-03-15', NULL, 'FRAN-CA-2024', 'pending', 'Sarah Mitchell'),
    ('Use Tax', 'California', 'Q4 2024', '2024', 45000, 8.625, 3881, '2025-01-31', '2025-01-28', 'USE-CA-2024-Q4', 'filed', 'Richard Lewis')
  `);
}

module.exports = { createExpandedTables, seedExpandedData };
