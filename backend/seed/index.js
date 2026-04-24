const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { createExpandedTables, seedExpandedData } = require('./seed-expanded');
const { createExpandedTables2, seedExpandedData2 } = require('./seed-expanded-2');

async function seed() {
  const client = await pool.connect();

  try {
    console.log('  Creating tables...');

    await client.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        department VARCHAR(100) DEFAULT 'General',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Finance Transactions
      CREATE TABLE IF NOT EXISTS finance_transactions (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        amount DECIMAL(15,2) NOT NULL,
        account VARCHAR(100),
        reference_number VARCHAR(100),
        status VARCHAR(50) DEFAULT 'pending',
        transaction_date TIMESTAMP DEFAULT NOW(),
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- HR Employees
      CREATE TABLE IF NOT EXISTS hr_employees (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        department VARCHAR(100),
        position VARCHAR(100),
        salary DECIMAL(12,2),
        hire_date DATE,
        status VARCHAR(50) DEFAULT 'active',
        manager VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Inventory Items
      CREATE TABLE IF NOT EXISTS inventory_items (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(50) UNIQUE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        quantity INTEGER DEFAULT 0,
        unit_price DECIMAL(12,2),
        warehouse VARCHAR(100),
        reorder_level INTEGER DEFAULT 10,
        supplier VARCHAR(255),
        status VARCHAR(50) DEFAULT 'in_stock',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- CRM Contacts
      CREATE TABLE IF NOT EXISTS crm_contacts (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        company_name VARCHAR(255),
        position VARCHAR(100),
        lead_source VARCHAR(100),
        deal_value DECIMAL(15,2),
        stage VARCHAR(50) DEFAULT 'lead',
        assigned_to VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Sales Orders
      CREATE TABLE IF NOT EXISTS sales_orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        items_description TEXT,
        quantity INTEGER DEFAULT 1,
        unit_price DECIMAL(12,2),
        total_amount DECIMAL(15,2),
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        shipping_address TEXT,
        order_date TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Procurement Orders
      CREATE TABLE IF NOT EXISTS procurement_orders (
        id SERIAL PRIMARY KEY,
        po_number VARCHAR(50) UNIQUE,
        supplier_name VARCHAR(255) NOT NULL,
        supplier_email VARCHAR(255),
        item_description TEXT,
        quantity INTEGER DEFAULT 1,
        unit_cost DECIMAL(12,2),
        total_cost DECIMAL(15,2),
        status VARCHAR(50) DEFAULT 'draft',
        delivery_date DATE,
        payment_terms VARCHAR(100),
        order_date TIMESTAMP DEFAULT NOW(),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Projects
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        project_manager VARCHAR(255),
        department VARCHAR(100),
        budget DECIMAL(15,2),
        start_date DATE,
        end_date DATE,
        status VARCHAR(50) DEFAULT 'planning',
        priority VARCHAR(50) DEFAULT 'medium',
        completion_pct INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Assets
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        asset_tag VARCHAR(50) UNIQUE,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        location VARCHAR(255),
        department VARCHAR(100),
        purchase_date DATE,
        purchase_cost DECIMAL(12,2),
        current_value DECIMAL(12,2),
        status VARCHAR(50) DEFAULT 'active',
        assigned_to VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Supply Chain
      CREATE TABLE IF NOT EXISTS supply_chain (
        id SERIAL PRIMARY KEY,
        shipment_id VARCHAR(50) UNIQUE,
        origin VARCHAR(255),
        destination VARCHAR(255),
        carrier VARCHAR(255),
        tracking_number VARCHAR(100),
        weight_kg DECIMAL(10,2),
        shipping_cost DECIMAL(12,2),
        status VARCHAR(50) DEFAULT 'processing',
        estimated_delivery DATE,
        actual_delivery DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- Compliance Records
      CREATE TABLE IF NOT EXISTS compliance_records (
        id SERIAL PRIMARY KEY,
        regulation VARCHAR(255) NOT NULL,
        requirement TEXT,
        department VARCHAR(100),
        responsible_person VARCHAR(255),
        due_date DATE,
        completion_date DATE,
        status VARCHAR(50) DEFAULT 'pending',
        risk_level VARCHAR(50) DEFAULT 'medium',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      -- AI Chat History
      CREATE TABLE IF NOT EXISTS ai_chat_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        user_message TEXT,
        ai_response TEXT,
        context VARCHAR(100),
        model_used VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('  Tables created successfully.');

    // Create expanded module tables BEFORE truncate
    console.log('  Creating expanded module tables...');
    await createExpandedTables(client);
    console.log('  Expanded tables created.');

    console.log('  Creating Phase 3 expanded tables...');
    await createExpandedTables2(client);
    console.log('  Phase 3 tables created.');

    // Clear existing data
    console.log('  Clearing existing data...');
    await client.query(`
      TRUNCATE users, finance_transactions, hr_employees, inventory_items, crm_contacts,
        sales_orders, procurement_orders, projects, assets, supply_chain,
        compliance_records, ai_chat_history,
        general_ledger, accounts_payable, accounts_receivable, payroll, recruitment,
        training, budgets, quality_management, manufacturing, helpdesk_tickets,
        contracts, expense_reports, timesheets, documents, notifications,
        vendors, tax_records,
        cash_management, fixed_assets, benefits, leave_management,
        performance_reviews, marketing_campaigns, work_orders, warehouse_management,
        returns_rma, pricing_quotes, risk_management, audit_trail,
        user_management, knowledge_base, shipping
        RESTART IDENTITY CASCADE;
    `);

    // Seed Users
    console.log('  Seeding users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    await client.query(`
      INSERT INTO users (email, password_hash, full_name, role, department) VALUES
      ('admin@oracle-erp.com', $1, 'John Administrator', 'admin', 'Executive'),
      ('sarah.finance@oracle-erp.com', $1, 'Sarah Mitchell', 'manager', 'Finance'),
      ('mike.hr@oracle-erp.com', $1, 'Mike Johnson', 'manager', 'Human Resources'),
      ('emily.sales@oracle-erp.com', $1, 'Emily Davis', 'manager', 'Sales'),
      ('david.it@oracle-erp.com', $1, 'David Wilson', 'user', 'IT'),
      ('lisa.ops@oracle-erp.com', $1, 'Lisa Chen', 'user', 'Operations')
    `, [passwordHash]);

    // Seed Finance Transactions (18 items)
    console.log('  Seeding finance transactions...');
    await client.query(`
      INSERT INTO finance_transactions (type, category, description, amount, account, reference_number, status, transaction_date, created_by) VALUES
      ('income', 'Sales Revenue', 'Q4 Product Sales - Enterprise License', 125000.00, 'Revenue Account', 'FIN-2024-001', 'completed', '2024-12-01', 'Sarah Mitchell'),
      ('income', 'Sales Revenue', 'Monthly SaaS Subscriptions - December', 85000.00, 'Revenue Account', 'FIN-2024-002', 'completed', '2024-12-05', 'Sarah Mitchell'),
      ('expense', 'Payroll', 'December Employee Payroll', 245000.00, 'Payroll Account', 'FIN-2024-003', 'completed', '2024-12-15', 'Mike Johnson'),
      ('expense', 'Office Rent', 'HQ Office Rent - January 2025', 18500.00, 'Operating Expenses', 'FIN-2024-004', 'completed', '2024-12-28', 'Sarah Mitchell'),
      ('income', 'Consulting', 'Strategic Consulting Services - TechCorp', 45000.00, 'Revenue Account', 'FIN-2024-005', 'completed', '2024-12-10', 'Emily Davis'),
      ('expense', 'Marketing', 'Digital Marketing Campaign - Q1 2025', 32000.00, 'Marketing Budget', 'FIN-2024-006', 'approved', '2024-12-20', 'Emily Davis'),
      ('expense', 'IT Infrastructure', 'AWS Cloud Services - Monthly', 12500.00, 'IT Budget', 'FIN-2024-007', 'completed', '2024-12-01', 'David Wilson'),
      ('income', 'License Fee', 'Annual Software License Renewal - GlobalTech', 95000.00, 'Revenue Account', 'FIN-2024-008', 'completed', '2024-12-12', 'Emily Davis'),
      ('expense', 'Travel', 'Business Travel - Sales Conference 2024', 8750.00, 'Travel Budget', 'FIN-2024-009', 'completed', '2024-12-08', 'Emily Davis'),
      ('expense', 'Insurance', 'Annual Business Insurance Premium', 24000.00, 'Insurance Account', 'FIN-2024-010', 'completed', '2024-12-01', 'Sarah Mitchell'),
      ('income', 'Service Fee', 'Implementation Services - MediCorp', 67500.00, 'Revenue Account', 'FIN-2024-011', 'pending', '2024-12-18', 'Emily Davis'),
      ('expense', 'Equipment', 'New Server Hardware Purchase', 45000.00, 'Capital Expenditure', 'FIN-2024-012', 'approved', '2024-12-22', 'David Wilson'),
      ('income', 'Training', 'Employee Training Program Revenue', 15000.00, 'Revenue Account', 'FIN-2024-013', 'completed', '2024-12-14', 'Mike Johnson'),
      ('expense', 'Utilities', 'Office Utilities - December', 3200.00, 'Utilities Account', 'FIN-2024-014', 'completed', '2024-12-30', 'Sarah Mitchell'),
      ('expense', 'Legal', 'Legal Consultation Fees', 12000.00, 'Legal Budget', 'FIN-2024-015', 'completed', '2024-12-16', 'Sarah Mitchell'),
      ('income', 'Partnership', 'Partner Revenue Share - Q4', 38000.00, 'Revenue Account', 'FIN-2024-016', 'completed', '2024-12-25', 'Emily Davis'),
      ('expense', 'Software', 'Annual Software Licenses Renewal', 28500.00, 'IT Budget', 'FIN-2024-017', 'pending', '2024-12-29', 'David Wilson'),
      ('income', 'Interest', 'Bank Interest Income - Q4', 4200.00, 'Interest Account', 'FIN-2024-018', 'completed', '2024-12-31', 'Sarah Mitchell')
    `);

    // Seed HR Employees (18 items)
    console.log('  Seeding HR employees...');
    await client.query(`
      INSERT INTO hr_employees (first_name, last_name, email, phone, department, position, salary, hire_date, status, manager) VALUES
      ('James', 'Anderson', 'james.anderson@oracle-erp.com', '(555) 100-0001', 'Engineering', 'Senior Software Engineer', 135000, '2021-03-15', 'active', 'David Wilson'),
      ('Maria', 'Garcia', 'maria.garcia@oracle-erp.com', '(555) 100-0002', 'Engineering', 'Lead Developer', 145000, '2020-06-01', 'active', 'David Wilson'),
      ('Robert', 'Brown', 'robert.brown@oracle-erp.com', '(555) 100-0003', 'Sales', 'Sales Director', 120000, '2019-01-10', 'active', 'Emily Davis'),
      ('Jennifer', 'Taylor', 'jennifer.taylor@oracle-erp.com', '(555) 100-0004', 'Marketing', 'Marketing Manager', 98000, '2022-02-20', 'active', 'Emily Davis'),
      ('William', 'Martinez', 'william.martinez@oracle-erp.com', '(555) 100-0005', 'Finance', 'Financial Analyst', 92000, '2022-07-01', 'active', 'Sarah Mitchell'),
      ('Linda', 'Thomas', 'linda.thomas@oracle-erp.com', '(555) 100-0006', 'Human Resources', 'HR Specialist', 78000, '2021-09-15', 'active', 'Mike Johnson'),
      ('Michael', 'Jackson', 'michael.jackson@oracle-erp.com', '(555) 100-0007', 'Engineering', 'DevOps Engineer', 125000, '2022-01-10', 'active', 'David Wilson'),
      ('Susan', 'White', 'susan.white@oracle-erp.com', '(555) 100-0008', 'Operations', 'Operations Manager', 105000, '2020-11-01', 'active', 'Lisa Chen'),
      ('David', 'Harris', 'david.harris@oracle-erp.com', '(555) 100-0009', 'Engineering', 'QA Engineer', 95000, '2023-03-01', 'active', 'Maria Garcia'),
      ('Karen', 'Clark', 'karen.clark@oracle-erp.com', '(555) 100-0010', 'Sales', 'Account Executive', 88000, '2023-06-15', 'active', 'Robert Brown'),
      ('Richard', 'Lewis', 'richard.lewis@oracle-erp.com', '(555) 100-0011', 'Finance', 'Senior Accountant', 98000, '2020-04-01', 'active', 'Sarah Mitchell'),
      ('Nancy', 'Walker', 'nancy.walker@oracle-erp.com', '(555) 100-0012', 'Marketing', 'Content Strategist', 82000, '2023-01-20', 'active', 'Jennifer Taylor'),
      ('Thomas', 'Hall', 'thomas.hall@oracle-erp.com', '(555) 100-0013', 'IT', 'System Administrator', 95000, '2021-08-01', 'active', 'David Wilson'),
      ('Betty', 'Allen', 'betty.allen@oracle-erp.com', '(555) 100-0014', 'Human Resources', 'Recruiter', 72000, '2023-04-10', 'active', 'Mike Johnson'),
      ('Christopher', 'Young', 'chris.young@oracle-erp.com', '(555) 100-0015', 'Engineering', 'Frontend Developer', 110000, '2022-09-01', 'active', 'Maria Garcia'),
      ('Dorothy', 'King', 'dorothy.king@oracle-erp.com', '(555) 100-0016', 'Sales', 'Business Development Rep', 75000, '2024-01-15', 'active', 'Robert Brown'),
      ('Daniel', 'Wright', 'daniel.wright@oracle-erp.com', '(555) 100-0017', 'Operations', 'Logistics Coordinator', 68000, '2023-07-01', 'active', 'Susan White'),
      ('Patricia', 'Lopez', 'patricia.lopez@oracle-erp.com', '(555) 100-0018', 'Finance', 'Budget Analyst', 85000, '2022-05-15', 'on_leave', 'Sarah Mitchell')
    `);

    // Seed Inventory (18 items)
    console.log('  Seeding inventory...');
    await client.query(`
      INSERT INTO inventory_items (sku, name, category, quantity, unit_price, warehouse, reorder_level, supplier, status) VALUES
      ('SKU-LAP-001', 'Dell XPS 15 Laptop', 'Electronics', 45, 1299.99, 'Warehouse A', 10, 'Dell Technologies', 'in_stock'),
      ('SKU-MON-002', 'Samsung 27" 4K Monitor', 'Electronics', 78, 449.99, 'Warehouse A', 15, 'Samsung Electronics', 'in_stock'),
      ('SKU-KEY-003', 'Logitech MX Keys Keyboard', 'Peripherals', 120, 99.99, 'Warehouse B', 25, 'Logitech', 'in_stock'),
      ('SKU-MOU-004', 'Logitech MX Master 3S Mouse', 'Peripherals', 95, 99.99, 'Warehouse B', 20, 'Logitech', 'in_stock'),
      ('SKU-DSK-005', 'Standing Desk Pro', 'Furniture', 22, 599.99, 'Warehouse C', 5, 'FlexiSpot', 'in_stock'),
      ('SKU-CHR-006', 'Herman Miller Aeron Chair', 'Furniture', 15, 1395.00, 'Warehouse C', 5, 'Herman Miller', 'in_stock'),
      ('SKU-SRV-007', 'HP ProLiant Server DL380', 'Servers', 8, 4599.99, 'Warehouse A', 3, 'HP Enterprise', 'in_stock'),
      ('SKU-SWT-008', 'Cisco Catalyst 9300 Switch', 'Networking', 12, 3250.00, 'Warehouse A', 3, 'Cisco Systems', 'in_stock'),
      ('SKU-HDS-009', 'Jabra Evolve2 85 Headset', 'Peripherals', 65, 249.99, 'Warehouse B', 15, 'Jabra', 'in_stock'),
      ('SKU-WBC-010', 'Logitech Brio 4K Webcam', 'Peripherals', 42, 199.99, 'Warehouse B', 10, 'Logitech', 'in_stock'),
      ('SKU-UPS-011', 'APC Smart-UPS 1500VA', 'Power', 18, 649.99, 'Warehouse A', 5, 'APC by Schneider', 'in_stock'),
      ('SKU-CAB-012', 'Cat6 Ethernet Cable 100ft', 'Networking', 200, 24.99, 'Warehouse B', 50, 'Cable Matters', 'in_stock'),
      ('SKU-SSD-013', 'Samsung 990 Pro 2TB SSD', 'Storage', 35, 179.99, 'Warehouse A', 10, 'Samsung Electronics', 'in_stock'),
      ('SKU-RAM-014', 'Corsair Vengeance 32GB DDR5', 'Components', 50, 124.99, 'Warehouse A', 15, 'Corsair', 'in_stock'),
      ('SKU-TAB-015', 'iPad Pro 12.9"', 'Electronics', 5, 1099.99, 'Warehouse B', 5, 'Apple Inc.', 'low_stock'),
      ('SKU-PRN-016', 'HP LaserJet Pro MFP M428', 'Office Equipment', 8, 399.99, 'Warehouse C', 3, 'HP Inc.', 'in_stock'),
      ('SKU-PHN-017', 'Cisco IP Phone 8845', 'Telecom', 30, 289.99, 'Warehouse B', 10, 'Cisco Systems', 'in_stock'),
      ('SKU-WBD-018', 'Samsung Flip 75" Whiteboard', 'Office Equipment', 3, 2499.99, 'Warehouse C', 2, 'Samsung Electronics', 'low_stock')
    `);

    // Seed CRM Contacts (18 items)
    console.log('  Seeding CRM contacts...');
    await client.query(`
      INSERT INTO crm_contacts (first_name, last_name, email, phone, company_name, position, lead_source, deal_value, stage, assigned_to) VALUES
      ('Alexander', 'Thompson', 'alex.t@techcorp.com', '(555) 200-0001', 'TechCorp Industries', 'CTO', 'Website', 250000, 'negotiation', 'Emily Davis'),
      ('Samantha', 'Roberts', 'sam.r@globalfinance.com', '(555) 200-0002', 'Global Finance Ltd', 'VP of Operations', 'Referral', 180000, 'proposal', 'Robert Brown'),
      ('Benjamin', 'Cooper', 'ben.c@medicorp.com', '(555) 200-0003', 'MediCorp Health', 'CEO', 'Conference', 350000, 'qualified', 'Emily Davis'),
      ('Olivia', 'Peterson', 'olivia.p@greenergy.com', '(555) 200-0004', 'GreenErgy Solutions', 'Procurement Director', 'LinkedIn', 120000, 'lead', 'Karen Clark'),
      ('Ethan', 'Sanders', 'ethan.s@dataflows.io', '(555) 200-0005', 'DataFlows Inc', 'Head of Engineering', 'Website', 95000, 'qualified', 'Robert Brown'),
      ('Isabella', 'Murphy', 'bella.m@retailmax.com', '(555) 200-0006', 'RetailMax Corp', 'IT Director', 'Trade Show', 200000, 'proposal', 'Emily Davis'),
      ('Mason', 'Rivera', 'mason.r@buildright.com', '(555) 200-0007', 'BuildRight Construction', 'Operations Manager', 'Cold Call', 75000, 'lead', 'Dorothy King'),
      ('Sophia', 'Mitchell', 'sophia.m@edulearn.org', '(555) 200-0008', 'EduLearn Academy', 'Academic Director', 'Webinar', 45000, 'qualified', 'Karen Clark'),
      ('Logan', 'Phillips', 'logan.p@autotech.com', '(555) 200-0009', 'AutoTech Motors', 'Digital Transformation Lead', 'Referral', 310000, 'negotiation', 'Emily Davis'),
      ('Ava', 'Campbell', 'ava.c@skylogistics.com', '(555) 200-0010', 'Sky Logistics', 'Supply Chain VP', 'LinkedIn', 165000, 'proposal', 'Robert Brown'),
      ('Noah', 'Parker', 'noah.p@fintechpro.com', '(555) 200-0011', 'FinTechPro', 'CIO', 'Website', 420000, 'negotiation', 'Emily Davis'),
      ('Emma', 'Edwards', 'emma.e@pharmalabs.com', '(555) 200-0012', 'PharmaLabs Inc', 'Research Director', 'Conference', 275000, 'qualified', 'Robert Brown'),
      ('Lucas', 'Stewart', 'lucas.s@foodchain.com', '(555) 200-0013', 'FoodChain Distributors', 'CEO', 'Referral', 150000, 'lead', 'Karen Clark'),
      ('Mia', 'Flores', 'mia.f@designhub.io', '(555) 200-0014', 'DesignHub Creative', 'Managing Director', 'Website', 55000, 'lead', 'Dorothy King'),
      ('Jackson', 'Hughes', 'jack.h@securenet.com', '(555) 200-0015', 'SecureNet Cyber', 'CISO', 'Trade Show', 290000, 'proposal', 'Emily Davis'),
      ('Charlotte', 'Watson', 'char.w@cloudpeak.com', '(555) 200-0016', 'CloudPeak Solutions', 'VP Engineering', 'LinkedIn', 185000, 'qualified', 'Robert Brown'),
      ('Aiden', 'Brooks', 'aiden.b@energyplus.com', '(555) 200-0017', 'EnergyPlus Utilities', 'IT Manager', 'Cold Call', 88000, 'lead', 'Dorothy King'),
      ('Harper', 'Gray', 'harper.g@mediawave.com', '(555) 200-0018', 'MediaWave Digital', 'COO', 'Webinar', 135000, 'proposal', 'Karen Clark')
    `);

    // Seed Sales Orders (18 items)
    console.log('  Seeding sales orders...');
    await client.query(`
      INSERT INTO sales_orders (order_number, customer_name, customer_email, items_description, quantity, unit_price, total_amount, status, payment_method, shipping_address, order_date) VALUES
      ('SO-2024-001', 'TechCorp Industries', 'procurement@techcorp.com', 'Enterprise License - 500 Seats', 1, 125000, 125000, 'completed', 'Wire Transfer', '100 Tech Drive, San Francisco, CA 94105', '2024-12-01'),
      ('SO-2024-002', 'Global Finance Ltd', 'orders@globalfinance.com', 'Financial Module + Support', 1, 85000, 85000, 'completed', 'Credit Card', '200 Wall Street, New York, NY 10005', '2024-12-03'),
      ('SO-2024-003', 'MediCorp Health', 'buying@medicorp.com', 'Healthcare Suite - Annual License', 1, 95000, 95000, 'processing', 'Wire Transfer', '300 Medical Plaza, Boston, MA 02101', '2024-12-05'),
      ('SO-2024-004', 'RetailMax Corp', 'purchasing@retailmax.com', 'POS Integration Module x25', 25, 2400, 60000, 'shipped', 'Credit Card', '400 Retail Row, Chicago, IL 60601', '2024-12-07'),
      ('SO-2024-005', 'AutoTech Motors', 'orders@autotech.com', 'Manufacturing ERP Module', 1, 110000, 110000, 'pending', 'Wire Transfer', '500 Motor Way, Detroit, MI 48201', '2024-12-10'),
      ('SO-2024-006', 'CloudPeak Solutions', 'buying@cloudpeak.com', 'Cloud Integration Pack x10', 10, 4500, 45000, 'completed', 'Credit Card', '600 Cloud Ave, Seattle, WA 98101', '2024-12-12'),
      ('SO-2024-007', 'Sky Logistics', 'orders@skylogistics.com', 'Supply Chain Module + Training', 1, 72000, 72000, 'processing', 'Wire Transfer', '700 Logistics Blvd, Memphis, TN 38101', '2024-12-14'),
      ('SO-2024-008', 'SecureNet Cyber', 'procurement@securenet.com', 'Security Compliance Module', 1, 55000, 55000, 'completed', 'Wire Transfer', '800 Security Lane, Austin, TX 73301', '2024-12-15'),
      ('SO-2024-009', 'EduLearn Academy', 'admin@edulearn.org', 'Education License - 200 Users', 1, 25000, 25000, 'shipped', 'Purchase Order', '900 Campus Drive, Cambridge, MA 02139', '2024-12-17'),
      ('SO-2024-010', 'FinTechPro', 'orders@fintechpro.com', 'Financial Analytics Suite', 1, 145000, 145000, 'pending', 'Wire Transfer', '1000 Finance St, Charlotte, NC 28201', '2024-12-18'),
      ('SO-2024-011', 'PharmaLabs Inc', 'buying@pharmalabs.com', 'Research Management Module', 1, 88000, 88000, 'processing', 'Wire Transfer', '1100 Pharma Way, Princeton, NJ 08540', '2024-12-19'),
      ('SO-2024-012', 'FoodChain Distributors', 'orders@foodchain.com', 'Distribution Module + Setup', 1, 62000, 62000, 'completed', 'Credit Card', '1200 Food Court, Atlanta, GA 30301', '2024-12-20'),
      ('SO-2024-013', 'BuildRight Construction', 'office@buildright.com', 'Project Management Module x5', 5, 8000, 40000, 'shipped', 'Check', '1300 Builder Rd, Denver, CO 80201', '2024-12-21'),
      ('SO-2024-014', 'GreenErgy Solutions', 'procurement@greenergy.com', 'Sustainability Tracking Module', 1, 35000, 35000, 'pending', 'Wire Transfer', '1400 Green Way, Portland, OR 97201', '2024-12-22'),
      ('SO-2024-015', 'DataFlows Inc', 'tech@dataflows.io', 'Data Analytics Platform License', 1, 78000, 78000, 'processing', 'Wire Transfer', '1500 Data Drive, San Jose, CA 95101', '2024-12-23'),
      ('SO-2024-016', 'DesignHub Creative', 'office@designhub.io', 'Creative Suite Integration', 1, 28000, 28000, 'completed', 'Credit Card', '1600 Design Blvd, Los Angeles, CA 90001', '2024-12-24'),
      ('SO-2024-017', 'MediaWave Digital', 'buying@mediawave.com', 'Digital Marketing Module', 1, 42000, 42000, 'pending', 'Wire Transfer', '1700 Media Circle, Miami, FL 33101', '2024-12-26'),
      ('SO-2024-018', 'EnergyPlus Utilities', 'orders@energyplus.com', 'Utility Management System', 1, 56000, 56000, 'processing', 'Purchase Order', '1800 Energy Ave, Houston, TX 77001', '2024-12-28')
    `);

    // Seed Procurement (18 items)
    console.log('  Seeding procurement orders...');
    await client.query(`
      INSERT INTO procurement_orders (po_number, supplier_name, supplier_email, item_description, quantity, unit_cost, total_cost, status, delivery_date, payment_terms, order_date) VALUES
      ('PO-2024-001', 'Dell Technologies', 'sales@dell.com', 'Dell XPS 15 Laptops for Engineering Team', 25, 1299.99, 32499.75, 'delivered', '2024-12-15', 'Net 30', '2024-11-15'),
      ('PO-2024-002', 'Amazon Web Services', 'aws-sales@amazon.com', 'AWS Annual Enterprise Support Plan', 1, 150000, 150000, 'active', '2025-01-01', 'Annual', '2024-12-01'),
      ('PO-2024-003', 'Herman Miller', 'orders@hermanmiller.com', 'Aeron Chairs for New Office', 50, 1395, 69750, 'in_transit', '2025-01-10', 'Net 45', '2024-12-05'),
      ('PO-2024-004', 'Cisco Systems', 'enterprise@cisco.com', 'Network Switches and Routers', 15, 3250, 48750, 'approved', '2025-01-15', 'Net 30', '2024-12-10'),
      ('PO-2024-005', 'Samsung Electronics', 'b2b@samsung.com', '4K Monitors for All Departments', 100, 449.99, 44999, 'delivered', '2024-12-20', 'Net 30', '2024-11-20'),
      ('PO-2024-006', 'Microsoft', 'licensing@microsoft.com', 'Microsoft 365 Enterprise Licenses', 500, 264, 132000, 'active', '2025-01-01', 'Annual', '2024-12-01'),
      ('PO-2024-007', 'Staples Business', 'corporate@staples.com', 'Office Supplies Q1 2025', 1, 15000, 15000, 'approved', '2025-01-05', 'Net 15', '2024-12-15'),
      ('PO-2024-008', 'HP Enterprise', 'sales@hpe.com', 'ProLiant Servers for Data Center', 5, 4599.99, 22999.95, 'in_transit', '2025-01-20', 'Net 30', '2024-12-18'),
      ('PO-2024-009', 'Jabra', 'business@jabra.com', 'Evolve2 85 Headsets for Remote Workers', 75, 249.99, 18749.25, 'delivered', '2024-12-22', 'Net 30', '2024-12-01'),
      ('PO-2024-010', 'Adobe Inc', 'enterprise@adobe.com', 'Creative Cloud Enterprise Licenses', 50, 599.88, 29994, 'active', '2025-01-01', 'Annual', '2024-12-01'),
      ('PO-2024-011', 'FlexiSpot', 'b2b@flexispot.com', 'Standing Desks for Engineering', 30, 599.99, 17999.70, 'draft', '2025-02-01', 'Net 30', '2024-12-20'),
      ('PO-2024-012', 'Logitech Business', 'enterprise@logitech.com', 'Keyboards and Mice Bundle', 100, 199.98, 19998, 'approved', '2025-01-12', 'Net 30', '2024-12-22'),
      ('PO-2024-013', 'APC by Schneider', 'sales@apc.com', 'UPS Systems for Server Room', 10, 649.99, 6499.90, 'in_transit', '2025-01-08', 'Net 30', '2024-12-10'),
      ('PO-2024-014', 'Salesforce', 'sales@salesforce.com', 'CRM Enterprise License Renewal', 1, 96000, 96000, 'active', '2025-01-01', 'Annual', '2024-12-01'),
      ('PO-2024-015', 'Slack Technologies', 'sales@slack.com', 'Slack Enterprise Grid - Annual', 1, 48000, 48000, 'active', '2025-01-01', 'Annual', '2024-12-01'),
      ('PO-2024-016', 'WeWork', 'enterprise@wework.com', 'Satellite Office Space - Q1 2025', 1, 25000, 25000, 'approved', '2025-01-01', 'Monthly', '2024-12-15'),
      ('PO-2024-017', 'Cloudflare', 'enterprise@cloudflare.com', 'Enterprise Security Plan', 1, 36000, 36000, 'active', '2025-01-01', 'Annual', '2024-12-01'),
      ('PO-2024-018', 'Cable Matters', 'sales@cablematters.com', 'Cat6 Cables and Adapters Bulk', 500, 24.99, 12495, 'delivered', '2024-12-18', 'Net 15', '2024-12-05')
    `);

    // Seed Projects (16 items)
    console.log('  Seeding projects...');
    await client.query(`
      INSERT INTO projects (name, description, project_manager, department, budget, start_date, end_date, status, priority, completion_pct) VALUES
      ('ERP v2.0 Migration', 'Complete ERP system migration to cloud-native architecture', 'David Wilson', 'Engineering', 500000, '2024-09-01', '2025-06-30', 'in_progress', 'critical', 45),
      ('Customer Portal Redesign', 'Redesign customer-facing portal with modern UX', 'Maria Garcia', 'Engineering', 120000, '2024-10-15', '2025-03-31', 'in_progress', 'high', 65),
      ('Q1 Marketing Campaign', 'Multi-channel marketing campaign for Q1 2025', 'Jennifer Taylor', 'Marketing', 80000, '2025-01-01', '2025-03-31', 'planning', 'high', 10),
      ('Data Warehouse Implementation', 'Build centralized data warehouse for analytics', 'David Wilson', 'IT', 250000, '2024-11-01', '2025-05-31', 'in_progress', 'high', 30),
      ('Employee Wellness Program', 'Launch comprehensive employee wellness initiative', 'Mike Johnson', 'Human Resources', 45000, '2025-01-15', '2025-12-31', 'planning', 'medium', 5),
      ('Mobile App Development', 'Develop iOS and Android mobile applications', 'Maria Garcia', 'Engineering', 350000, '2024-08-01', '2025-04-30', 'in_progress', 'critical', 55),
      ('Supply Chain Optimization', 'Optimize supply chain processes and vendor management', 'Lisa Chen', 'Operations', 180000, '2024-10-01', '2025-03-31', 'in_progress', 'high', 40),
      ('ISO 27001 Certification', 'Achieve ISO 27001 security certification', 'Thomas Hall', 'IT', 95000, '2024-07-01', '2025-02-28', 'in_progress', 'critical', 80),
      ('Sales Territory Expansion', 'Expand sales operations to APAC region', 'Robert Brown', 'Sales', 200000, '2025-01-01', '2025-09-30', 'planning', 'high', 0),
      ('AI Integration Initiative', 'Integrate AI capabilities across all ERP modules', 'David Wilson', 'Engineering', 300000, '2024-11-15', '2025-06-30', 'in_progress', 'critical', 25),
      ('Office Renovation Phase 2', 'Renovate 3rd floor office space', 'Susan White', 'Operations', 150000, '2025-02-01', '2025-04-30', 'planning', 'medium', 0),
      ('Compliance Automation', 'Automate compliance reporting and monitoring', 'Sarah Mitchell', 'Finance', 85000, '2024-12-01', '2025-05-31', 'in_progress', 'high', 15),
      ('Customer Success Platform', 'Build customer success monitoring and engagement platform', 'Emily Davis', 'Sales', 160000, '2024-10-01', '2025-04-30', 'in_progress', 'high', 35),
      ('Infrastructure Modernization', 'Modernize on-premise infrastructure to hybrid cloud', 'Thomas Hall', 'IT', 400000, '2024-06-01', '2025-03-31', 'in_progress', 'critical', 70),
      ('Training Portal Development', 'Build online training portal for employees and clients', 'Mike Johnson', 'Human Resources', 75000, '2025-01-15', '2025-06-30', 'planning', 'medium', 0),
      ('Performance Review System', 'Implement 360-degree performance review system', 'Mike Johnson', 'Human Resources', 55000, '2024-11-01', '2025-02-28', 'in_progress', 'high', 60)
    `);

    // Seed Assets (18 items)
    console.log('  Seeding assets...');
    await client.query(`
      INSERT INTO assets (asset_tag, name, category, location, department, purchase_date, purchase_cost, current_value, status, assigned_to) VALUES
      ('AST-IT-001', 'Dell PowerEdge R740 Server', 'Server', 'Data Center - Rack A1', 'IT', '2023-03-15', 8500, 6800, 'active', 'Thomas Hall'),
      ('AST-IT-002', 'Dell PowerEdge R740 Server #2', 'Server', 'Data Center - Rack A2', 'IT', '2023-03-15', 8500, 6800, 'active', 'Thomas Hall'),
      ('AST-IT-003', 'Cisco ASR 9000 Router', 'Networking', 'Data Center - Rack B1', 'IT', '2022-08-01', 12000, 8400, 'active', 'Thomas Hall'),
      ('AST-IT-004', 'NetApp FAS2750 Storage', 'Storage', 'Data Center - Rack C1', 'IT', '2023-06-01', 25000, 21250, 'active', 'Thomas Hall'),
      ('AST-OFF-005', 'Epson SureColor P900 Printer', 'Office Equipment', 'Floor 2 - Print Room', 'Operations', '2023-01-10', 1200, 840, 'active', 'Susan White'),
      ('AST-OFF-006', 'Ricoh IM C4500 Copier', 'Office Equipment', 'Floor 1 - Lobby', 'Operations', '2022-11-15', 5500, 3850, 'active', 'Susan White'),
      ('AST-VEH-007', 'Toyota Camry - Company Car', 'Vehicle', 'Parking Garage - Spot B12', 'Sales', '2023-09-01', 28000, 23800, 'active', 'Robert Brown'),
      ('AST-VEH-008', 'Ford Transit Van', 'Vehicle', 'Parking Garage - Spot A1', 'Operations', '2022-06-15', 35000, 26250, 'active', 'Daniel Wright'),
      ('AST-FUR-009', 'Conference Room Table (12-seat)', 'Furniture', 'Floor 3 - Room 301', 'Operations', '2023-02-01', 3500, 2975, 'active', 'Unassigned'),
      ('AST-FUR-010', 'Executive Desk Suite', 'Furniture', 'Floor 4 - CEO Office', 'Executive', '2022-01-15', 4200, 2940, 'active', 'John Administrator'),
      ('AST-AV-011', 'Samsung 85" Display', 'AV Equipment', 'Floor 3 - Board Room', 'Operations', '2023-07-01', 3200, 2720, 'active', 'Unassigned'),
      ('AST-AV-012', 'Polycom Video Conferencing System', 'AV Equipment', 'Floor 2 - Conf Room A', 'IT', '2023-04-15', 6800, 5440, 'active', 'David Wilson'),
      ('AST-SEC-013', 'Access Control System', 'Security', 'Building-wide', 'Operations', '2022-03-01', 15000, 10500, 'active', 'Susan White'),
      ('AST-SEC-014', 'CCTV Camera System (32 cameras)', 'Security', 'Building-wide', 'Operations', '2022-03-01', 22000, 15400, 'active', 'Susan White'),
      ('AST-IT-015', 'Fortinet FortiGate Firewall', 'Networking', 'Data Center - Rack B2', 'IT', '2023-01-15', 9500, 7600, 'active', 'Thomas Hall'),
      ('AST-OFF-016', 'Commercial Coffee Machine', 'Kitchen', 'Floor 1 - Break Room', 'Operations', '2023-08-01', 2800, 2240, 'active', 'Unassigned'),
      ('AST-IT-017', 'UPS Battery Backup System', 'Power', 'Data Center', 'IT', '2022-12-01', 8000, 5600, 'active', 'Thomas Hall'),
      ('AST-AV-018', 'Wireless Presentation System', 'AV Equipment', 'Floor 2 - Training Room', 'IT', '2023-05-01', 1500, 1200, 'active', 'David Wilson')
    `);

    // Seed Supply Chain (18 items)
    console.log('  Seeding supply chain...');
    await client.query(`
      INSERT INTO supply_chain (shipment_id, origin, destination, carrier, tracking_number, weight_kg, shipping_cost, status, estimated_delivery, actual_delivery) VALUES
      ('SHP-2024-001', 'Dell Factory, Austin TX', 'HQ Warehouse A, San Francisco CA', 'FedEx', 'FX-789456123', 125.5, 450.00, 'delivered', '2024-12-10', '2024-12-09'),
      ('SHP-2024-002', 'Samsung Factory, Seoul KR', 'HQ Warehouse A, San Francisco CA', 'DHL Express', 'DHL-456789012', 350.0, 2800.00, 'delivered', '2024-12-15', '2024-12-14'),
      ('SHP-2024-003', 'Herman Miller, Zeeland MI', 'HQ Office, San Francisco CA', 'UPS Freight', 'UPS-123789456', 800.0, 1200.00, 'in_transit', '2025-01-10', NULL),
      ('SHP-2024-004', 'Cisco, San Jose CA', 'HQ Data Center, San Francisco CA', 'FedEx Freight', 'FX-321654987', 95.0, 350.00, 'processing', '2025-01-15', NULL),
      ('SHP-2024-005', 'HP Enterprise, Houston TX', 'HQ Data Center, San Francisco CA', 'UPS', 'UPS-654321789', 250.0, 680.00, 'in_transit', '2025-01-20', NULL),
      ('SHP-2024-006', 'Logitech, Lausanne CH', 'HQ Warehouse B, San Francisco CA', 'DHL Express', 'DHL-987654321', 45.0, 550.00, 'delivered', '2024-12-18', '2024-12-17'),
      ('SHP-2024-007', 'APC Factory, Manila PH', 'HQ Data Center, San Francisco CA', 'Maersk', 'MAERSK-112233', 180.0, 900.00, 'in_transit', '2025-01-08', NULL),
      ('SHP-2024-008', 'Cable Matters, Suzhou CN', 'HQ Warehouse B, San Francisco CA', 'FedEx International', 'FX-445566778', 65.0, 380.00, 'delivered', '2024-12-18', '2024-12-19'),
      ('SHP-2024-009', 'Staples Distribution, Dallas TX', 'HQ Office, San Francisco CA', 'UPS Ground', 'UPS-998877665', 120.0, 180.00, 'processing', '2025-01-05', NULL),
      ('SHP-2024-010', 'FlexiSpot, Shenzhen CN', 'HQ Warehouse C, San Francisco CA', 'Maersk', 'MAERSK-445566', 950.0, 3500.00, 'processing', '2025-02-01', NULL),
      ('SHP-2024-011', 'HQ Warehouse A, San Francisco CA', 'TechCorp Industries, San Francisco CA', 'Local Courier', 'LC-001122', 15.0, 45.00, 'delivered', '2024-12-02', '2024-12-02'),
      ('SHP-2024-012', 'HQ Warehouse A, San Francisco CA', 'RetailMax Corp, Chicago IL', 'FedEx', 'FX-112233445', 35.0, 120.00, 'delivered', '2024-12-09', '2024-12-08'),
      ('SHP-2024-013', 'HQ Warehouse B, San Francisco CA', 'EduLearn Academy, Cambridge MA', 'UPS', 'UPS-556677889', 8.0, 65.00, 'in_transit', '2025-01-02', NULL),
      ('SHP-2024-014', 'HQ Warehouse A, San Francisco CA', 'BuildRight Construction, Denver CO', 'FedEx Ground', 'FX-667788990', 22.0, 85.00, 'delivered', '2024-12-23', '2024-12-22'),
      ('SHP-2024-015', 'Jabra, Ballerup DK', 'HQ Warehouse B, San Francisco CA', 'DHL Express', 'DHL-778899001', 25.0, 420.00, 'delivered', '2024-12-22', '2024-12-21'),
      ('SHP-2024-016', 'HQ Warehouse A, San Francisco CA', 'CloudPeak Solutions, Seattle WA', 'UPS Next Day', 'UPS-889900112', 12.0, 95.00, 'delivered', '2024-12-13', '2024-12-13'),
      ('SHP-2024-017', 'Apple, Cupertino CA', 'HQ Warehouse B, San Francisco CA', 'Apple Logistics', 'APL-112233', 5.0, 25.00, 'delivered', '2024-12-20', '2024-12-20'),
      ('SHP-2024-018', 'HQ Warehouse A, San Francisco CA', 'PharmaLabs Inc, Princeton NJ', 'FedEx Express', 'FX-334455667', 18.0, 145.00, 'processing', '2025-01-05', NULL)
    `);

    // Seed Compliance Records (16 items)
    console.log('  Seeding compliance records...');
    await client.query(`
      INSERT INTO compliance_records (regulation, requirement, department, responsible_person, due_date, completion_date, status, risk_level, notes) VALUES
      ('SOX', 'Annual Financial Audit - Internal Controls', 'Finance', 'Sarah Mitchell', '2025-03-31', NULL, 'in_progress', 'critical', 'Q4 financial controls audit in progress. External auditors engaged.'),
      ('GDPR', 'Data Privacy Impact Assessment', 'IT', 'David Wilson', '2025-02-28', NULL, 'in_progress', 'high', 'DPIA for new customer portal being conducted.'),
      ('ISO 27001', 'Information Security Management Review', 'IT', 'Thomas Hall', '2025-02-28', NULL, 'in_progress', 'critical', 'Annual ISMS review nearly complete. Certification audit scheduled.'),
      ('HIPAA', 'Protected Health Information Training', 'Human Resources', 'Mike Johnson', '2025-01-31', '2025-01-15', 'completed', 'high', 'All employees completed HIPAA awareness training.'),
      ('PCI DSS', 'Payment Card Security Assessment', 'Finance', 'Sarah Mitchell', '2025-04-30', NULL, 'pending', 'critical', 'Annual PCI DSS compliance assessment for payment processing.'),
      ('SOC 2', 'Service Organization Control Report', 'IT', 'Thomas Hall', '2025-06-30', NULL, 'in_progress', 'high', 'SOC 2 Type II audit preparation underway.'),
      ('OSHA', 'Workplace Safety Inspection', 'Operations', 'Susan White', '2025-03-15', NULL, 'pending', 'medium', 'Annual workplace safety audit scheduled for Q1 2025.'),
      ('CCPA', 'California Consumer Privacy Act Compliance', 'Legal', 'Sarah Mitchell', '2025-01-31', '2025-01-20', 'completed', 'high', 'Updated privacy policies and data handling procedures.'),
      ('EEOC', 'Equal Employment Opportunity Reporting', 'Human Resources', 'Mike Johnson', '2025-03-31', NULL, 'pending', 'medium', 'Annual EEO-1 report preparation.'),
      ('ADA', 'Website Accessibility Compliance', 'Engineering', 'Maria Garcia', '2025-04-30', NULL, 'in_progress', 'medium', 'WCAG 2.1 AA compliance remediation for all web properties.'),
      ('EPA', 'Environmental Impact Report', 'Operations', 'Lisa Chen', '2025-06-30', NULL, 'pending', 'low', 'Annual environmental sustainability report.'),
      ('FISMA', 'Federal Information Security Assessment', 'IT', 'Thomas Hall', '2025-05-31', NULL, 'pending', 'high', 'Required for government contract renewal.'),
      ('FERPA', 'Educational Records Privacy Compliance', 'Legal', 'Sarah Mitchell', '2025-02-28', NULL, 'in_progress', 'medium', 'Compliance review for EduLearn partnership.'),
      ('NIST', 'Cybersecurity Framework Assessment', 'IT', 'David Wilson', '2025-03-31', NULL, 'in_progress', 'critical', 'NIST CSF maturity assessment and gap analysis.'),
      ('SOX', 'IT General Controls Testing', 'IT', 'Thomas Hall', '2025-03-31', NULL, 'in_progress', 'high', 'Testing access controls, change management, and operations.'),
      ('GDPR', 'Data Subject Access Request Process Audit', 'Legal', 'Sarah Mitchell', '2025-04-30', NULL, 'pending', 'medium', 'Review DSAR handling process and response times.')
    `);

    // Seed expanded module data
    await seedExpandedData(client);

    // Seed Phase 3 module data
    await seedExpandedData2(client);

    // Add created_by column to all tables
    console.log('  Adding created_by column to all tables...');
    await client.query(`
      ALTER TABLE finance_transactions ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE hr_employees ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE sales_orders ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE procurement_orders ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE assets ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE supply_chain ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE compliance_records ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE general_ledger ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE accounts_payable ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE accounts_receivable ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE payroll ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE recruitment ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE training ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE budgets ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE quality_management ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE manufacturing ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE helpdesk_tickets ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE contracts ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE expense_reports ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE timesheets ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE documents ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE vendors ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE tax_records ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE cash_management ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE fixed_assets ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE benefits ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE leave_management ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE performance_reviews ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE marketing_campaigns ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE work_orders ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE warehouse_management ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE returns_rma ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE pricing_quotes ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE risk_management ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE audit_trail ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE user_management ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE knowledge_base ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
      ALTER TABLE shipping ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
    `);
    console.log('  created_by column added to all tables.');

    console.log('  ✅ All data seeded successfully!');
    console.log('  📊 Summary (42 modules):');
    console.log('     - 6 users (login: admin@oracle-erp.com / password123)');
    console.log('     - 18 finance transactions');
    console.log('     - 18 HR employees');
    console.log('     - 18 inventory items');
    console.log('     - 18 CRM contacts');
    console.log('     - 18 sales orders');
    console.log('     - 18 procurement orders');
    console.log('     - 16 projects');
    console.log('     - 18 assets');
    console.log('     - 18 supply chain shipments');
    console.log('     - 16 compliance records');
    console.log('     - 16 general ledger entries');
    console.log('     - 16 accounts payable');
    console.log('     - 16 accounts receivable');
    console.log('     - 16 payroll records');
    console.log('     - 16 recruitment records');
    console.log('     - 16 training courses');
    console.log('     - 16 budgets');
    console.log('     - 16 quality inspections');
    console.log('     - 16 manufacturing orders');
    console.log('     - 16 helpdesk tickets');
    console.log('     - 16 contracts');
    console.log('     - 16 expense reports');
    console.log('     - 16 timesheets');
    console.log('     - 16 documents');
    console.log('     - 16 notifications');
    console.log('     - 16 vendors');
    console.log('     - 16 tax records');
    console.log('     - 16 cash management records');
    console.log('     - 16 fixed assets');
    console.log('     - 16 benefits plans');
    console.log('     - 16 leave requests');
    console.log('     - 16 performance reviews');
    console.log('     - 16 marketing campaigns');
    console.log('     - 16 work orders');
    console.log('     - 16 warehouse records');
    console.log('     - 16 returns/RMA');
    console.log('     - 16 pricing quotes');
    console.log('     - 16 risk records');
    console.log('     - 16 audit trail events');
    console.log('     - 16 user management records');
    console.log('     - 16 knowledge base articles');
    console.log('     - 16 shipping records');

  } catch (err) {
    console.error('Seed error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error('Failed to seed database:', err);
  process.exit(1);
});
