import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { api } from '../services/api';

// Module field configurations
const MODULE_CONFIG = {
  finance: {
    columns: ['reference_number', 'type', 'category', 'description', 'amount', 'status'],
    columnLabels: { reference_number: 'Reference', type: 'Type', category: 'Category', description: 'Description', amount: 'Amount', status: 'Status' },
    fields: [
      { name: 'type', label: 'Type', type: 'select', options: ['income', 'expense'], required: true },
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'amount', label: 'Amount ($)', type: 'number', required: true },
      { name: 'account', label: 'Account', type: 'text' },
      { name: 'reference_number', label: 'Reference Number', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'completed', 'cancelled'] },
    ],
    detailFields: ['type', 'category', 'description', 'amount', 'account', 'reference_number', 'status', 'transaction_date', 'created_by'],
    formatCell: (col, val) => col === 'amount' ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => item.reference_number || item.description || `#${item.id}`,
  },
  hr: {
    columns: ['first_name', 'last_name', 'department', 'position', 'salary', 'status'],
    columnLabels: { first_name: 'First Name', last_name: 'Last Name', department: 'Department', position: 'Position', salary: 'Salary', status: 'Status' },
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text', required: true },
      { name: 'last_name', label: 'Last Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'department', label: 'Department', type: 'text', required: true },
      { name: 'position', label: 'Position', type: 'text', required: true },
      { name: 'salary', label: 'Salary ($)', type: 'number' },
      { name: 'hire_date', label: 'Hire Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'on_leave', 'terminated'] },
      { name: 'manager', label: 'Manager', type: 'text' },
    ],
    detailFields: ['first_name', 'last_name', 'email', 'phone', 'department', 'position', 'salary', 'hire_date', 'status', 'manager'],
    formatCell: (col, val) => col === 'salary' ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => `${item.first_name} ${item.last_name}`,
  },
  inventory: {
    columns: ['sku', 'name', 'category', 'quantity', 'unit_price', 'status'],
    columnLabels: { sku: 'SKU', name: 'Name', category: 'Category', quantity: 'Qty', unit_price: 'Price', status: 'Status' },
    fields: [
      { name: 'sku', label: 'SKU', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      { name: 'unit_price', label: 'Unit Price ($)', type: 'number' },
      { name: 'warehouse', label: 'Warehouse', type: 'text' },
      { name: 'reorder_level', label: 'Reorder Level', type: 'number' },
      { name: 'supplier', label: 'Supplier', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['in_stock', 'low_stock', 'out_of_stock'] },
    ],
    detailFields: ['sku', 'name', 'category', 'quantity', 'unit_price', 'warehouse', 'reorder_level', 'supplier', 'status'],
    formatCell: (col, val) => col === 'unit_price' ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => item.name,
  },
  crm: {
    columns: ['first_name', 'last_name', 'company_name', 'stage', 'deal_value', 'assigned_to'],
    columnLabels: { first_name: 'First Name', last_name: 'Last Name', company_name: 'Company', stage: 'Stage', deal_value: 'Deal Value', assigned_to: 'Assigned To' },
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text', required: true },
      { name: 'last_name', label: 'Last Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'company_name', label: 'Company Name', type: 'text' },
      { name: 'position', label: 'Position', type: 'text' },
      { name: 'lead_source', label: 'Lead Source', type: 'select', options: ['Website', 'Referral', 'LinkedIn', 'Conference', 'Trade Show', 'Cold Call', 'Webinar'] },
      { name: 'deal_value', label: 'Deal Value ($)', type: 'number' },
      { name: 'stage', label: 'Stage', type: 'select', options: ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] },
      { name: 'assigned_to', label: 'Assigned To', type: 'text' },
    ],
    detailFields: ['first_name', 'last_name', 'email', 'phone', 'company_name', 'position', 'lead_source', 'deal_value', 'stage', 'assigned_to'],
    formatCell: (col, val) => col === 'deal_value' ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => `${item.first_name} ${item.last_name} - ${item.company_name}`,
  },
  sales: {
    columns: ['order_number', 'customer_name', 'items_description', 'total_amount', 'status', 'payment_method'],
    columnLabels: { order_number: 'Order #', customer_name: 'Customer', items_description: 'Items', total_amount: 'Total', status: 'Status', payment_method: 'Payment' },
    fields: [
      { name: 'order_number', label: 'Order Number', type: 'text', required: true },
      { name: 'customer_name', label: 'Customer Name', type: 'text', required: true },
      { name: 'customer_email', label: 'Customer Email', type: 'email' },
      { name: 'items_description', label: 'Items Description', type: 'textarea' },
      { name: 'quantity', label: 'Quantity', type: 'number' },
      { name: 'unit_price', label: 'Unit Price ($)', type: 'number' },
      { name: 'total_amount', label: 'Total Amount ($)', type: 'number', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'processing', 'shipped', 'completed', 'cancelled'] },
      { name: 'payment_method', label: 'Payment Method', type: 'select', options: ['Credit Card', 'Wire Transfer', 'Check', 'Purchase Order'] },
      { name: 'shipping_address', label: 'Shipping Address', type: 'textarea' },
    ],
    detailFields: ['order_number', 'customer_name', 'customer_email', 'items_description', 'quantity', 'unit_price', 'total_amount', 'status', 'payment_method', 'shipping_address', 'order_date'],
    formatCell: (col, val) => col === 'total_amount' ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => `${item.order_number} - ${item.customer_name}`,
  },
  procurement: {
    columns: ['po_number', 'supplier_name', 'item_description', 'total_cost', 'status', 'delivery_date'],
    columnLabels: { po_number: 'PO #', supplier_name: 'Supplier', item_description: 'Items', total_cost: 'Cost', status: 'Status', delivery_date: 'Delivery' },
    fields: [
      { name: 'po_number', label: 'PO Number', type: 'text', required: true },
      { name: 'supplier_name', label: 'Supplier Name', type: 'text', required: true },
      { name: 'supplier_email', label: 'Supplier Email', type: 'email' },
      { name: 'item_description', label: 'Item Description', type: 'textarea' },
      { name: 'quantity', label: 'Quantity', type: 'number' },
      { name: 'unit_cost', label: 'Unit Cost ($)', type: 'number' },
      { name: 'total_cost', label: 'Total Cost ($)', type: 'number', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'approved', 'in_transit', 'delivered', 'active', 'cancelled'] },
      { name: 'delivery_date', label: 'Delivery Date', type: 'date' },
      { name: 'payment_terms', label: 'Payment Terms', type: 'text' },
    ],
    detailFields: ['po_number', 'supplier_name', 'supplier_email', 'item_description', 'quantity', 'unit_cost', 'total_cost', 'status', 'delivery_date', 'payment_terms', 'order_date'],
    formatCell: (col, val) => {
      if (col === 'total_cost') return `$${Number(val).toLocaleString()}`;
      if (col === 'delivery_date' && val) return new Date(val).toLocaleDateString();
      return val;
    },
    itemLabel: (item) => `${item.po_number} - ${item.supplier_name}`,
  },
  projects: {
    columns: ['name', 'project_manager', 'department', 'status', 'priority', 'completion_pct'],
    columnLabels: { name: 'Project', project_manager: 'Manager', department: 'Department', status: 'Status', priority: 'Priority', completion_pct: 'Progress' },
    fields: [
      { name: 'name', label: 'Project Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'project_manager', label: 'Project Manager', type: 'text' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'budget', label: 'Budget ($)', type: 'number' },
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'] },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { name: 'completion_pct', label: 'Completion %', type: 'number' },
    ],
    detailFields: ['name', 'description', 'project_manager', 'department', 'budget', 'start_date', 'end_date', 'status', 'priority', 'completion_pct'],
    formatCell: (col, val) => col === 'completion_pct' ? `${val}%` : val,
    itemLabel: (item) => item.name,
  },
  assets: {
    columns: ['asset_tag', 'name', 'category', 'department', 'current_value', 'status'],
    columnLabels: { asset_tag: 'Tag', name: 'Asset', category: 'Category', department: 'Department', current_value: 'Value', status: 'Status' },
    fields: [
      { name: 'asset_tag', label: 'Asset Tag', type: 'text', required: true },
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
      { name: 'purchase_cost', label: 'Purchase Cost ($)', type: 'number' },
      { name: 'current_value', label: 'Current Value ($)', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'maintenance', 'retired', 'disposed'] },
      { name: 'assigned_to', label: 'Assigned To', type: 'text' },
    ],
    detailFields: ['asset_tag', 'name', 'category', 'location', 'department', 'purchase_date', 'purchase_cost', 'current_value', 'status', 'assigned_to'],
    formatCell: (col, val) => col === 'current_value' ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => `${item.asset_tag} - ${item.name}`,
  },
  'supply-chain': {
    columns: ['shipment_id', 'origin', 'destination', 'carrier', 'status', 'estimated_delivery'],
    columnLabels: { shipment_id: 'Shipment ID', origin: 'Origin', destination: 'Destination', carrier: 'Carrier', status: 'Status', estimated_delivery: 'ETA' },
    fields: [
      { name: 'shipment_id', label: 'Shipment ID', type: 'text', required: true },
      { name: 'origin', label: 'Origin', type: 'text', required: true },
      { name: 'destination', label: 'Destination', type: 'text', required: true },
      { name: 'carrier', label: 'Carrier', type: 'text' },
      { name: 'tracking_number', label: 'Tracking Number', type: 'text' },
      { name: 'weight_kg', label: 'Weight (kg)', type: 'number' },
      { name: 'shipping_cost', label: 'Shipping Cost ($)', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['processing', 'in_transit', 'delivered', 'returned', 'cancelled'] },
      { name: 'estimated_delivery', label: 'Estimated Delivery', type: 'date' },
      { name: 'actual_delivery', label: 'Actual Delivery', type: 'date' },
    ],
    detailFields: ['shipment_id', 'origin', 'destination', 'carrier', 'tracking_number', 'weight_kg', 'shipping_cost', 'status', 'estimated_delivery', 'actual_delivery'],
    formatCell: (col, val) => {
      if (col === 'estimated_delivery' && val) return new Date(val).toLocaleDateString();
      if (col === 'shipping_cost') return `$${Number(val).toLocaleString()}`;
      return val;
    },
    itemLabel: (item) => item.shipment_id,
  },
  compliance: {
    columns: ['regulation', 'requirement', 'department', 'responsible_person', 'risk_level', 'status'],
    columnLabels: { regulation: 'Regulation', requirement: 'Requirement', department: 'Department', responsible_person: 'Responsible', risk_level: 'Risk', status: 'Status' },
    fields: [
      { name: 'regulation', label: 'Regulation', type: 'text', required: true },
      { name: 'requirement', label: 'Requirement', type: 'textarea', required: true },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'responsible_person', label: 'Responsible Person', type: 'text' },
      { name: 'due_date', label: 'Due Date', type: 'date' },
      { name: 'completion_date', label: 'Completion Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'in_progress', 'completed', 'overdue'] },
      { name: 'risk_level', label: 'Risk Level', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ],
    detailFields: ['regulation', 'requirement', 'department', 'responsible_person', 'due_date', 'completion_date', 'status', 'risk_level', 'notes'],
    formatCell: (col, val) => val,
    itemLabel: (item) => `${item.regulation} - ${item.requirement?.slice(0, 40)}`,
  },
  'general-ledger': {
    columns: ['account_number', 'account_name', 'entry_type', 'debit', 'credit', 'status'],
    columnLabels: { account_number: 'Account #', account_name: 'Account', entry_type: 'Type', debit: 'Debit', credit: 'Credit', status: 'Status' },
    fields: [
      { name: 'account_number', label: 'Account Number', type: 'text', required: true },
      { name: 'account_name', label: 'Account Name', type: 'text', required: true },
      { name: 'entry_type', label: 'Entry Type', type: 'select', options: ['asset', 'liability', 'equity', 'revenue', 'expense'] },
      { name: 'debit', label: 'Debit ($)', type: 'number' },
      { name: 'credit', label: 'Credit ($)', type: 'number' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'entry_date', label: 'Entry Date', type: 'date' },
      { name: 'period', label: 'Period', type: 'text' },
      { name: 'fiscal_year', label: 'Fiscal Year', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'posted', 'reversed'] },
    ],
    detailFields: ['account_number', 'account_name', 'entry_type', 'debit', 'credit', 'description', 'entry_date', 'period', 'fiscal_year', 'status'],
    formatCell: (col, val) => (col === 'debit' || col === 'credit') ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => `${item.account_number} - ${item.account_name}`,
  },
  'accounts-payable': {
    columns: ['invoice_number', 'vendor_name', 'description', 'amount', 'due_date', 'status'],
    columnLabels: { invoice_number: 'Invoice #', vendor_name: 'Vendor', description: 'Description', amount: 'Amount', due_date: 'Due Date', status: 'Status' },
    fields: [
      { name: 'invoice_number', label: 'Invoice Number', type: 'text', required: true },
      { name: 'vendor_name', label: 'Vendor Name', type: 'text', required: true },
      { name: 'vendor_email', label: 'Vendor Email', type: 'email' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'amount', label: 'Amount ($)', type: 'number', required: true },
      { name: 'due_date', label: 'Due Date', type: 'date' },
      { name: 'payment_date', label: 'Payment Date', type: 'date' },
      { name: 'payment_method', label: 'Payment Method', type: 'select', options: ['Wire Transfer', 'Check', 'Auto-debit', 'Credit Card'] },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'paid', 'overdue', 'cancelled'] },
      { name: 'category', label: 'Category', type: 'text' },
    ],
    detailFields: ['invoice_number', 'vendor_name', 'vendor_email', 'description', 'amount', 'due_date', 'payment_date', 'payment_method', 'status', 'category'],
    formatCell: (col, val) => { if (col === 'amount') return `$${Number(val).toLocaleString()}`; if (col === 'due_date' && val) return new Date(val).toLocaleDateString(); return val; },
    itemLabel: (item) => `${item.invoice_number} - ${item.vendor_name}`,
  },
  'accounts-receivable': {
    columns: ['invoice_number', 'customer_name', 'description', 'amount', 'due_date', 'status'],
    columnLabels: { invoice_number: 'Invoice #', customer_name: 'Customer', description: 'Description', amount: 'Amount', due_date: 'Due Date', status: 'Status' },
    fields: [
      { name: 'invoice_number', label: 'Invoice Number', type: 'text', required: true },
      { name: 'customer_name', label: 'Customer Name', type: 'text', required: true },
      { name: 'customer_email', label: 'Customer Email', type: 'email' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'amount', label: 'Amount ($)', type: 'number', required: true },
      { name: 'due_date', label: 'Due Date', type: 'date' },
      { name: 'payment_date', label: 'Payment Date', type: 'date' },
      { name: 'payment_method', label: 'Payment Method', type: 'select', options: ['Wire Transfer', 'Credit Card', 'Check', 'Purchase Order'] },
      { name: 'status', label: 'Status', type: 'select', options: ['outstanding', 'paid', 'overdue', 'written_off'] },
      { name: 'category', label: 'Category', type: 'text' },
    ],
    detailFields: ['invoice_number', 'customer_name', 'customer_email', 'description', 'amount', 'due_date', 'payment_date', 'payment_method', 'status', 'category'],
    formatCell: (col, val) => { if (col === 'amount') return `$${Number(val).toLocaleString()}`; if (col === 'due_date' && val) return new Date(val).toLocaleDateString(); return val; },
    itemLabel: (item) => `${item.invoice_number} - ${item.customer_name}`,
  },
  payroll: {
    columns: ['employee_name', 'department', 'pay_period', 'base_salary', 'net_pay', 'status'],
    columnLabels: { employee_name: 'Employee', department: 'Department', pay_period: 'Pay Period', base_salary: 'Base Salary', net_pay: 'Net Pay', status: 'Status' },
    fields: [
      { name: 'employee_name', label: 'Employee Name', type: 'text', required: true },
      { name: 'employee_id_ref', label: 'Employee ID', type: 'text' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'pay_period', label: 'Pay Period', type: 'text' },
      { name: 'pay_date', label: 'Pay Date', type: 'date' },
      { name: 'base_salary', label: 'Base Salary ($)', type: 'number', required: true },
      { name: 'overtime_pay', label: 'Overtime Pay ($)', type: 'number' },
      { name: 'bonuses', label: 'Bonuses ($)', type: 'number' },
      { name: 'deductions', label: 'Deductions ($)', type: 'number' },
      { name: 'tax_withholding', label: 'Tax Withholding ($)', type: 'number' },
      { name: 'net_pay', label: 'Net Pay ($)', type: 'number', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'processed', 'paid', 'cancelled'] },
    ],
    detailFields: ['employee_name', 'employee_id_ref', 'department', 'pay_period', 'pay_date', 'base_salary', 'overtime_pay', 'bonuses', 'deductions', 'tax_withholding', 'net_pay', 'status'],
    formatCell: (col, val) => (col === 'base_salary' || col === 'net_pay') ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => `${item.employee_name} - ${item.pay_period}`,
  },
  recruitment: {
    columns: ['candidate_name', 'job_title', 'department', 'experience_years', 'salary_expectation', 'status'],
    columnLabels: { candidate_name: 'Candidate', job_title: 'Position', department: 'Department', experience_years: 'Exp (yrs)', salary_expectation: 'Expected Salary', status: 'Status' },
    fields: [
      { name: 'job_title', label: 'Job Title', type: 'text', required: true },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'candidate_name', label: 'Candidate Name', type: 'text', required: true },
      { name: 'candidate_email', label: 'Candidate Email', type: 'email' },
      { name: 'candidate_phone', label: 'Phone', type: 'text' },
      { name: 'resume_source', label: 'Source', type: 'select', options: ['LinkedIn', 'Indeed', 'Referral', 'Company Website', 'Glassdoor', 'Dribbble', 'Other'] },
      { name: 'experience_years', label: 'Experience (years)', type: 'number' },
      { name: 'salary_expectation', label: 'Salary Expectation ($)', type: 'number' },
      { name: 'application_date', label: 'Application Date', type: 'date' },
      { name: 'interview_date', label: 'Interview Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['applied', 'screening', 'interview_scheduled', 'second_interview', 'offer_extended', 'hired', 'rejected'] },
      { name: 'recruiter', label: 'Recruiter', type: 'text' },
    ],
    detailFields: ['job_title', 'department', 'candidate_name', 'candidate_email', 'candidate_phone', 'resume_source', 'experience_years', 'salary_expectation', 'application_date', 'interview_date', 'status', 'recruiter'],
    formatCell: (col, val) => col === 'salary_expectation' ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => `${item.candidate_name} - ${item.job_title}`,
  },
  training: {
    columns: ['course_name', 'category', 'instructor', 'enrolled', 'start_date', 'status'],
    columnLabels: { course_name: 'Course', category: 'Category', instructor: 'Instructor', enrolled: 'Enrolled', start_date: 'Start Date', status: 'Status' },
    fields: [
      { name: 'course_name', label: 'Course Name', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['Technical', 'Management', 'Compliance', 'Sales', 'Finance', 'HR', 'Soft Skills'] },
      { name: 'instructor', label: 'Instructor', type: 'text' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'max_participants', label: 'Max Participants', type: 'number' },
      { name: 'enrolled', label: 'Enrolled', type: 'number' },
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'duration_hours', label: 'Duration (hours)', type: 'number' },
      { name: 'cost', label: 'Cost ($)', type: 'number' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['upcoming', 'in_progress', 'completed', 'cancelled'] },
    ],
    detailFields: ['course_name', 'category', 'instructor', 'department', 'max_participants', 'enrolled', 'start_date', 'end_date', 'duration_hours', 'cost', 'location', 'status'],
    formatCell: (col, val) => { if (col === 'start_date' && val) return new Date(val).toLocaleDateString(); return val; },
    itemLabel: (item) => item.course_name,
  },
  budgets: {
    columns: ['budget_name', 'department', 'fiscal_year', 'allocated_amount', 'spent_amount', 'status'],
    columnLabels: { budget_name: 'Budget', department: 'Department', fiscal_year: 'Year', allocated_amount: 'Allocated', spent_amount: 'Spent', status: 'Status' },
    fields: [
      { name: 'budget_name', label: 'Budget Name', type: 'text', required: true },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'fiscal_year', label: 'Fiscal Year', type: 'text' },
      { name: 'quarter', label: 'Quarter', type: 'select', options: ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'] },
      { name: 'allocated_amount', label: 'Allocated ($)', type: 'number', required: true },
      { name: 'spent_amount', label: 'Spent ($)', type: 'number' },
      { name: 'remaining_amount', label: 'Remaining ($)', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'frozen', 'closed'] },
      { name: 'approved_by', label: 'Approved By', type: 'text' },
    ],
    detailFields: ['budget_name', 'department', 'category', 'fiscal_year', 'quarter', 'allocated_amount', 'spent_amount', 'remaining_amount', 'status', 'approved_by'],
    formatCell: (col, val) => (col === 'allocated_amount' || col === 'spent_amount') ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => `${item.budget_name} (${item.fiscal_year})`,
  },
  quality: {
    columns: ['inspection_id', 'product_name', 'inspector', 'defects_found', 'severity', 'status'],
    columnLabels: { inspection_id: 'ID', product_name: 'Product', inspector: 'Inspector', defects_found: 'Defects', severity: 'Severity', status: 'Status' },
    fields: [
      { name: 'inspection_id', label: 'Inspection ID', type: 'text', required: true },
      { name: 'product_name', label: 'Product Name', type: 'text' },
      { name: 'batch_number', label: 'Batch Number', type: 'text' },
      { name: 'inspector', label: 'Inspector', type: 'text' },
      { name: 'inspection_date', label: 'Inspection Date', type: 'date' },
      { name: 'category', label: 'Category', type: 'select', options: ['Software', 'Hardware', 'Security', 'Facilities', 'IT Ops', 'Process'] },
      { name: 'defects_found', label: 'Defects Found', type: 'number' },
      { name: 'severity', label: 'Severity', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { name: 'corrective_action', label: 'Corrective Action', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['open', 'in_progress', 'closed'] },
      { name: 'department', label: 'Department', type: 'text' },
    ],
    detailFields: ['inspection_id', 'product_name', 'batch_number', 'inspector', 'inspection_date', 'category', 'defects_found', 'severity', 'corrective_action', 'status', 'department'],
    formatCell: (col, val) => val,
    itemLabel: (item) => `${item.inspection_id} - ${item.product_name}`,
  },
  manufacturing: {
    columns: ['work_order', 'product_name', 'quantity_ordered', 'quantity_produced', 'status', 'priority'],
    columnLabels: { work_order: 'Work Order', product_name: 'Product', quantity_ordered: 'Ordered', quantity_produced: 'Produced', status: 'Status', priority: 'Priority' },
    fields: [
      { name: 'work_order', label: 'Work Order', type: 'text', required: true },
      { name: 'product_name', label: 'Product Name', type: 'text', required: true },
      { name: 'quantity_ordered', label: 'Qty Ordered', type: 'number' },
      { name: 'quantity_produced', label: 'Qty Produced', type: 'number' },
      { name: 'unit_cost', label: 'Unit Cost ($)', type: 'number' },
      { name: 'total_cost', label: 'Total Cost ($)', type: 'number' },
      { name: 'production_line', label: 'Production Line', type: 'text' },
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['scheduled', 'in_production', 'completed', 'on_hold', 'cancelled'] },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { name: 'supervisor', label: 'Supervisor', type: 'text' },
    ],
    detailFields: ['work_order', 'product_name', 'quantity_ordered', 'quantity_produced', 'unit_cost', 'total_cost', 'production_line', 'start_date', 'end_date', 'status', 'priority', 'supervisor'],
    formatCell: (col, val) => val,
    itemLabel: (item) => `${item.work_order} - ${item.product_name}`,
  },
  helpdesk: {
    columns: ['ticket_number', 'subject', 'requester_name', 'category', 'priority', 'status'],
    columnLabels: { ticket_number: 'Ticket #', subject: 'Subject', requester_name: 'Requester', category: 'Category', priority: 'Priority', status: 'Status' },
    fields: [
      { name: 'ticket_number', label: 'Ticket Number', type: 'text', required: true },
      { name: 'subject', label: 'Subject', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'requester_name', label: 'Requester Name', type: 'text' },
      { name: 'requester_email', label: 'Requester Email', type: 'email' },
      { name: 'category', label: 'Category', type: 'select', options: ['Network', 'Hardware', 'Software', 'Email', 'Application', 'Access', 'AV Equipment', 'Security', 'Database', 'Integration', 'Data'] },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { name: 'assigned_to', label: 'Assigned To', type: 'text' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'sla_hours', label: 'SLA (hours)', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['open', 'in_progress', 'resolved', 'closed'] },
    ],
    detailFields: ['ticket_number', 'subject', 'description', 'requester_name', 'requester_email', 'category', 'priority', 'assigned_to', 'department', 'sla_hours', 'status'],
    formatCell: (col, val) => val,
    itemLabel: (item) => `${item.ticket_number} - ${item.subject}`,
  },
  contracts: {
    columns: ['contract_number', 'title', 'party_name', 'contract_type', 'value', 'status'],
    columnLabels: { contract_number: 'Contract #', title: 'Title', party_name: 'Party', contract_type: 'Type', value: 'Value', status: 'Status' },
    fields: [
      { name: 'contract_number', label: 'Contract Number', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'party_name', label: 'Party Name', type: 'text' },
      { name: 'party_email', label: 'Party Email', type: 'email' },
      { name: 'contract_type', label: 'Type', type: 'select', options: ['Service', 'License', 'Lease', 'Maintenance', 'Insurance'] },
      { name: 'value', label: 'Value ($)', type: 'number' },
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'auto_renew', label: 'Auto Renew', type: 'select', options: ['true', 'false'] },
      { name: 'payment_terms', label: 'Payment Terms', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'expiring_soon', 'expired', 'terminated'] },
      { name: 'owner', label: 'Owner', type: 'text' },
    ],
    detailFields: ['contract_number', 'title', 'party_name', 'party_email', 'contract_type', 'value', 'start_date', 'end_date', 'auto_renew', 'payment_terms', 'status', 'owner'],
    formatCell: (col, val) => col === 'value' ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => `${item.contract_number} - ${item.title}`,
  },
  expenses: {
    columns: ['report_number', 'employee_name', 'category', 'description', 'amount', 'status'],
    columnLabels: { report_number: 'Report #', employee_name: 'Employee', category: 'Category', description: 'Description', amount: 'Amount', status: 'Status' },
    fields: [
      { name: 'report_number', label: 'Report Number', type: 'text', required: true },
      { name: 'employee_name', label: 'Employee Name', type: 'text', required: true },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'category', label: 'Category', type: 'select', options: ['Travel', 'Meals', 'Accommodation', 'Conference', 'Software', 'Equipment', 'Office Supplies', 'Training', 'Other'] },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'amount', label: 'Amount ($)', type: 'number', required: true },
      { name: 'submission_date', label: 'Submission Date', type: 'date' },
      { name: 'receipt_date', label: 'Receipt Date', type: 'date' },
      { name: 'vendor', label: 'Vendor', type: 'text' },
      { name: 'payment_method', label: 'Payment Method', type: 'select', options: ['Corporate Card', 'Personal Card', 'Cash'] },
      { name: 'status', label: 'Status', type: 'select', options: ['submitted', 'approved', 'rejected', 'reimbursed', 'pending'] },
      { name: 'approver', label: 'Approver', type: 'text' },
    ],
    detailFields: ['report_number', 'employee_name', 'department', 'category', 'description', 'amount', 'submission_date', 'receipt_date', 'vendor', 'payment_method', 'status', 'approver'],
    formatCell: (col, val) => col === 'amount' ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => `${item.report_number} - ${item.employee_name}`,
  },
  timesheet: {
    columns: ['employee_name', 'project_name', 'work_date', 'hours_worked', 'overtime_hours', 'status'],
    columnLabels: { employee_name: 'Employee', project_name: 'Project', work_date: 'Date', hours_worked: 'Hours', overtime_hours: 'OT Hours', status: 'Status' },
    fields: [
      { name: 'employee_name', label: 'Employee Name', type: 'text', required: true },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'project_name', label: 'Project Name', type: 'text' },
      { name: 'task_description', label: 'Task Description', type: 'textarea' },
      { name: 'work_date', label: 'Work Date', type: 'date', required: true },
      { name: 'hours_worked', label: 'Hours Worked', type: 'number', required: true },
      { name: 'overtime_hours', label: 'Overtime Hours', type: 'number' },
      { name: 'break_hours', label: 'Break Hours', type: 'number' },
      { name: 'clock_in', label: 'Clock In', type: 'text' },
      { name: 'clock_out', label: 'Clock Out', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'rejected'] },
      { name: 'approved_by', label: 'Approved By', type: 'text' },
    ],
    detailFields: ['employee_name', 'department', 'project_name', 'task_description', 'work_date', 'hours_worked', 'overtime_hours', 'break_hours', 'clock_in', 'clock_out', 'status', 'approved_by'],
    formatCell: (col, val) => { if (col === 'work_date' && val) return new Date(val).toLocaleDateString(); return val; },
    itemLabel: (item) => `${item.employee_name} - ${item.work_date}`,
  },
  documents: {
    columns: ['document_name', 'document_type', 'category', 'department', 'version', 'status'],
    columnLabels: { document_name: 'Document', document_type: 'Type', category: 'Category', department: 'Department', version: 'Version', status: 'Status' },
    fields: [
      { name: 'document_name', label: 'Document Name', type: 'text', required: true },
      { name: 'document_type', label: 'Type', type: 'select', options: ['PDF', 'DOCX', 'XLSX', 'PPTX', 'HTML', 'CSV'] },
      { name: 'category', label: 'Category', type: 'select', options: ['Policy', 'Report', 'Technical', 'Guide', 'Template', 'Strategy', 'Marketing'] },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'version', label: 'Version', type: 'text' },
      { name: 'file_size', label: 'File Size', type: 'text' },
      { name: 'author', label: 'Author', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'tags', label: 'Tags', type: 'text' },
      { name: 'access_level', label: 'Access Level', type: 'select', options: ['all_employees', 'management', 'internal', 'engineering', 'hr_team', 'sales_team'] },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'archived', 'draft'] },
    ],
    detailFields: ['document_name', 'document_type', 'category', 'department', 'version', 'file_size', 'author', 'description', 'tags', 'access_level', 'status'],
    formatCell: (col, val) => val,
    itemLabel: (item) => `${item.document_name} (v${item.version})`,
  },
  notifications: {
    columns: ['title', 'type', 'priority', 'recipient', 'module', 'status'],
    columnLabels: { title: 'Title', type: 'Type', priority: 'Priority', recipient: 'Recipient', module: 'Module', status: 'Status' },
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'message', label: 'Message', type: 'textarea', required: true },
      { name: 'type', label: 'Type', type: 'select', options: ['info', 'warning', 'alert', 'success', 'action'] },
      { name: 'priority', label: 'Priority', type: 'select', options: ['normal', 'high', 'critical'] },
      { name: 'recipient', label: 'Recipient', type: 'text' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'module', label: 'Module', type: 'text' },
      { name: 'action_url', label: 'Action URL', type: 'text' },
      { name: 'read_status', label: 'Read', type: 'select', options: ['true', 'false'] },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'dismissed', 'expired'] },
    ],
    detailFields: ['title', 'message', 'type', 'priority', 'recipient', 'department', 'module', 'action_url', 'read_status', 'status'],
    formatCell: (col, val) => val,
    itemLabel: (item) => item.title,
  },
  vendors: {
    columns: ['vendor_code', 'company_name', 'contact_name', 'category', 'rating', 'status'],
    columnLabels: { vendor_code: 'Code', company_name: 'Company', contact_name: 'Contact', category: 'Category', rating: 'Rating', status: 'Status' },
    fields: [
      { name: 'vendor_code', label: 'Vendor Code', type: 'text', required: true },
      { name: 'company_name', label: 'Company Name', type: 'text', required: true },
      { name: 'contact_name', label: 'Contact Name', type: 'text' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'payment_terms', label: 'Payment Terms', type: 'text' },
      { name: 'rating', label: 'Rating (0-5)', type: 'number' },
      { name: 'annual_spend', label: 'Annual Spend ($)', type: 'number' },
      { name: 'contract_end', label: 'Contract End', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'suspended', 'pending_review'] },
    ],
    detailFields: ['vendor_code', 'company_name', 'contact_name', 'email', 'phone', 'address', 'category', 'payment_terms', 'rating', 'annual_spend', 'contract_end', 'status'],
    formatCell: (col, val) => col === 'annual_spend' ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => `${item.vendor_code} - ${item.company_name}`,
  },
  tax: {
    columns: ['tax_type', 'jurisdiction', 'period', 'tax_amount', 'due_date', 'status'],
    columnLabels: { tax_type: 'Tax Type', jurisdiction: 'Jurisdiction', period: 'Period', tax_amount: 'Amount', due_date: 'Due Date', status: 'Status' },
    fields: [
      { name: 'tax_type', label: 'Tax Type', type: 'text', required: true },
      { name: 'jurisdiction', label: 'Jurisdiction', type: 'text' },
      { name: 'period', label: 'Period', type: 'text' },
      { name: 'fiscal_year', label: 'Fiscal Year', type: 'text' },
      { name: 'taxable_amount', label: 'Taxable Amount ($)', type: 'number' },
      { name: 'tax_rate', label: 'Tax Rate (%)', type: 'number' },
      { name: 'tax_amount', label: 'Tax Amount ($)', type: 'number', required: true },
      { name: 'due_date', label: 'Due Date', type: 'date' },
      { name: 'filing_date', label: 'Filing Date', type: 'date' },
      { name: 'reference_number', label: 'Reference Number', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'filed', 'paid', 'overdue', 'under_review'] },
      { name: 'preparer', label: 'Preparer', type: 'text' },
    ],
    detailFields: ['tax_type', 'jurisdiction', 'period', 'fiscal_year', 'taxable_amount', 'tax_rate', 'tax_amount', 'due_date', 'filing_date', 'reference_number', 'status', 'preparer'],
    formatCell: (col, val) => { if (col === 'tax_amount') return `$${Number(val).toLocaleString()}`; if (col === 'due_date' && val) return new Date(val).toLocaleDateString(); return val; },
    itemLabel: (item) => `${item.tax_type} - ${item.period}`,
  },
  'cash-management': {
    columns: ['transaction_id', 'account_name', 'transaction_type', 'amount', 'currency', 'status'],
    columnLabels: { transaction_id: 'Transaction ID', account_name: 'Account', transaction_type: 'Type', amount: 'Amount', currency: 'Currency', status: 'Status' },
    fields: [
      { name: 'transaction_id', label: 'Transaction ID', type: 'text', required: true },
      { name: 'account_name', label: 'Account Name', type: 'text', required: true },
      { name: 'transaction_type', label: 'Type', type: 'select', options: ['deposit', 'withdrawal', 'transfer', 'fee', 'conversion', 'drawdown'] },
      { name: 'amount', label: 'Amount', type: 'number', required: true },
      { name: 'currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'GBP', 'JPY', 'CAD'] },
      { name: 'from_account', label: 'From Account', type: 'text' },
      { name: 'to_account', label: 'To Account', type: 'text' },
      { name: 'bank_name', label: 'Bank Name', type: 'text' },
      { name: 'reference', label: 'Reference', type: 'text' },
      { name: 'balance_after', label: 'Balance After', type: 'number' },
      { name: 'transaction_date', label: 'Transaction Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'completed', 'cancelled', 'reversed'] },
    ],
    detailFields: ['transaction_id', 'account_name', 'transaction_type', 'amount', 'currency', 'from_account', 'to_account', 'bank_name', 'reference', 'balance_after', 'transaction_date', 'status'],
    formatCell: (col, val) => col === 'amount' ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => `${item.transaction_id} - ${item.account_name}`,
  },
  'fixed-assets': {
    columns: ['asset_id', 'asset_name', 'asset_class', 'acquisition_cost', 'book_value', 'status'],
    columnLabels: { asset_id: 'Asset ID', asset_name: 'Asset', asset_class: 'Class', acquisition_cost: 'Cost', book_value: 'Book Value', status: 'Status' },
    fields: [
      { name: 'asset_id', label: 'Asset ID', type: 'text', required: true },
      { name: 'asset_name', label: 'Asset Name', type: 'text', required: true },
      { name: 'asset_class', label: 'Asset Class', type: 'select', options: ['Buildings', 'IT Equipment', 'Machinery', 'Vehicles', 'Furniture', 'Building Improvements', 'Green Energy', 'Equipment'] },
      { name: 'acquisition_date', label: 'Acquisition Date', type: 'date' },
      { name: 'acquisition_cost', label: 'Acquisition Cost ($)', type: 'number' },
      { name: 'useful_life_years', label: 'Useful Life (years)', type: 'number' },
      { name: 'depreciation_method', label: 'Depreciation Method', type: 'select', options: ['Straight-Line', 'Declining Balance', 'Sum-of-Years'] },
      { name: 'accumulated_depreciation', label: 'Accumulated Depreciation ($)', type: 'number' },
      { name: 'book_value', label: 'Book Value ($)', type: 'number' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'disposed', 'fully_depreciated', 'under_review'] },
    ],
    detailFields: ['asset_id', 'asset_name', 'asset_class', 'acquisition_date', 'acquisition_cost', 'useful_life_years', 'depreciation_method', 'accumulated_depreciation', 'book_value', 'location', 'department', 'status'],
    formatCell: (col, val) => (col === 'acquisition_cost' || col === 'book_value') ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => `${item.asset_id} - ${item.asset_name}`,
  },
  benefits: {
    columns: ['plan_name', 'plan_type', 'provider', 'coverage_level', 'enrolled_count', 'status'],
    columnLabels: { plan_name: 'Plan', plan_type: 'Type', provider: 'Provider', coverage_level: 'Coverage', enrolled_count: 'Enrolled', status: 'Status' },
    fields: [
      { name: 'plan_name', label: 'Plan Name', type: 'text', required: true },
      { name: 'plan_type', label: 'Plan Type', type: 'select', options: ['Health Insurance', 'Dental Insurance', 'Vision Insurance', 'Retirement', 'Life Insurance', 'Disability', 'Flexible Spending', 'Health Savings', 'EAP', 'Education', 'Transportation', 'Wellness'] },
      { name: 'provider', label: 'Provider', type: 'text' },
      { name: 'coverage_level', label: 'Coverage Level', type: 'select', options: ['Individual', 'Family', 'Individual + Spouse', 'Individual + Children'] },
      { name: 'monthly_cost_employee', label: 'Employee Cost/mo ($)', type: 'number' },
      { name: 'monthly_cost_employer', label: 'Employer Cost/mo ($)', type: 'number' },
      { name: 'enrolled_count', label: 'Enrolled Count', type: 'number' },
      { name: 'max_enrollment', label: 'Max Enrollment', type: 'number' },
      { name: 'effective_date', label: 'Effective Date', type: 'date' },
      { name: 'renewal_date', label: 'Renewal Date', type: 'date' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'pending', 'expired'] },
    ],
    detailFields: ['plan_name', 'plan_type', 'provider', 'coverage_level', 'monthly_cost_employee', 'monthly_cost_employer', 'enrolled_count', 'max_enrollment', 'effective_date', 'renewal_date', 'description', 'status'],
    formatCell: (col, val) => val,
    itemLabel: (item) => item.plan_name,
  },
  'leave-management': {
    columns: ['employee_name', 'department', 'leave_type', 'start_date', 'days_requested', 'status'],
    columnLabels: { employee_name: 'Employee', department: 'Department', leave_type: 'Type', start_date: 'Start Date', days_requested: 'Days', status: 'Status' },
    fields: [
      { name: 'employee_name', label: 'Employee Name', type: 'text', required: true },
      { name: 'employee_id_ref', label: 'Employee ID', type: 'text' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'leave_type', label: 'Leave Type', type: 'select', options: ['Vacation', 'Sick Leave', 'Personal', 'Bereavement', 'Jury Duty', 'Maternity', 'Paternity', 'Study Leave', 'Medical'] },
      { name: 'start_date', label: 'Start Date', type: 'date', required: true },
      { name: 'end_date', label: 'End Date', type: 'date', required: true },
      { name: 'days_requested', label: 'Days Requested', type: 'number', required: true },
      { name: 'reason', label: 'Reason', type: 'textarea' },
      { name: 'approver', label: 'Approver', type: 'text' },
      { name: 'balance_remaining', label: 'Balance Remaining', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'rejected', 'cancelled'] },
    ],
    detailFields: ['employee_name', 'employee_id_ref', 'department', 'leave_type', 'start_date', 'end_date', 'days_requested', 'reason', 'approver', 'balance_remaining', 'status'],
    formatCell: (col, val) => { if (col === 'start_date' && val) return new Date(val).toLocaleDateString(); return val; },
    itemLabel: (item) => `${item.employee_name} - ${item.leave_type}`,
  },
  'performance-reviews': {
    columns: ['employee_name', 'department', 'reviewer', 'review_period', 'overall_rating', 'status'],
    columnLabels: { employee_name: 'Employee', department: 'Department', reviewer: 'Reviewer', review_period: 'Period', overall_rating: 'Rating', status: 'Status' },
    fields: [
      { name: 'employee_name', label: 'Employee Name', type: 'text', required: true },
      { name: 'employee_id_ref', label: 'Employee ID', type: 'text' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'reviewer', label: 'Reviewer', type: 'text', required: true },
      { name: 'review_period', label: 'Review Period', type: 'text' },
      { name: 'overall_rating', label: 'Overall Rating (0-5)', type: 'number', required: true },
      { name: 'goals_met_pct', label: 'Goals Met (%)', type: 'number' },
      { name: 'strengths', label: 'Strengths', type: 'textarea' },
      { name: 'improvements', label: 'Areas for Improvement', type: 'textarea' },
      { name: 'comments', label: 'Comments', type: 'textarea' },
      { name: 'review_date', label: 'Review Date', type: 'date' },
      { name: 'next_review_date', label: 'Next Review Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'in_progress', 'completed', 'acknowledged'] },
    ],
    detailFields: ['employee_name', 'employee_id_ref', 'department', 'reviewer', 'review_period', 'overall_rating', 'goals_met_pct', 'strengths', 'improvements', 'comments', 'review_date', 'next_review_date', 'status'],
    formatCell: (col, val) => col === 'overall_rating' ? `${val}/5.0` : val,
    itemLabel: (item) => `${item.employee_name} - ${item.review_period}`,
  },
  marketing: {
    columns: ['campaign_name', 'campaign_type', 'channel', 'budget', 'leads_generated', 'status'],
    columnLabels: { campaign_name: 'Campaign', campaign_type: 'Type', channel: 'Channel', budget: 'Budget', leads_generated: 'Leads', status: 'Status' },
    fields: [
      { name: 'campaign_name', label: 'Campaign Name', type: 'text', required: true },
      { name: 'campaign_type', label: 'Type', type: 'select', options: ['Product Launch', 'Lead Generation', 'PPC', 'Event', 'Email', 'Webinar', 'Co-Marketing', 'Content Marketing', 'Retargeting', 'Brand Awareness', 'Referral', 'Account Based', 'Sponsorship'] },
      { name: 'channel', label: 'Channel', type: 'select', options: ['Multi-channel', 'LinkedIn', 'Google Ads', 'In-Person', 'Email', 'Zoom', 'Website', 'Google/Facebook', 'YouTube', 'Twitter/LinkedIn', 'Email/Portal', 'Podcast'] },
      { name: 'target_audience', label: 'Target Audience', type: 'text' },
      { name: 'budget', label: 'Budget ($)', type: 'number', required: true },
      { name: 'spent', label: 'Spent ($)', type: 'number' },
      { name: 'leads_generated', label: 'Leads Generated', type: 'number' },
      { name: 'conversions', label: 'Conversions', type: 'number' },
      { name: 'roi_pct', label: 'ROI (%)', type: 'number' },
      { name: 'start_date', label: 'Start Date', type: 'date' },
      { name: 'end_date', label: 'End Date', type: 'date' },
      { name: 'owner', label: 'Owner', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'planning', 'active', 'completed', 'paused', 'cancelled'] },
    ],
    detailFields: ['campaign_name', 'campaign_type', 'channel', 'target_audience', 'budget', 'spent', 'leads_generated', 'conversions', 'roi_pct', 'start_date', 'end_date', 'owner', 'status'],
    formatCell: (col, val) => col === 'budget' ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => item.campaign_name,
  },
  'work-orders': {
    columns: ['work_order_id', 'title', 'work_type', 'priority', 'assigned_to', 'status'],
    columnLabels: { work_order_id: 'WO #', title: 'Title', work_type: 'Type', priority: 'Priority', assigned_to: 'Assigned To', status: 'Status' },
    fields: [
      { name: 'work_order_id', label: 'Work Order ID', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'asset_name', label: 'Asset', type: 'text' },
      { name: 'work_type', label: 'Type', type: 'select', options: ['Preventive', 'Corrective', 'Inspection', 'Emergency', 'Upgrade'] },
      { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { name: 'assigned_to', label: 'Assigned To', type: 'text' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'estimated_hours', label: 'Estimated Hours', type: 'number' },
      { name: 'actual_hours', label: 'Actual Hours', type: 'number' },
      { name: 'cost', label: 'Cost ($)', type: 'number' },
      { name: 'scheduled_date', label: 'Scheduled Date', type: 'date' },
      { name: 'completed_date', label: 'Completed Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['open', 'scheduled', 'in_progress', 'completed', 'cancelled', 'planned'] },
    ],
    detailFields: ['work_order_id', 'title', 'description', 'asset_name', 'work_type', 'priority', 'assigned_to', 'department', 'estimated_hours', 'actual_hours', 'cost', 'scheduled_date', 'completed_date', 'status'],
    formatCell: (col, val) => col === 'cost' ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => `${item.work_order_id} - ${item.title}`,
  },
  warehouse: {
    columns: ['warehouse_code', 'warehouse_name', 'location', 'capacity_sqft', 'utilization_pct', 'status'],
    columnLabels: { warehouse_code: 'Code', warehouse_name: 'Name', location: 'Location', capacity_sqft: 'Capacity (sqft)', utilization_pct: 'Utilization', status: 'Status' },
    fields: [
      { name: 'warehouse_code', label: 'Warehouse Code', type: 'text', required: true },
      { name: 'warehouse_name', label: 'Warehouse Name', type: 'text', required: true },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'zone', label: 'Zone', type: 'text' },
      { name: 'capacity_sqft', label: 'Capacity (sqft)', type: 'number' },
      { name: 'used_sqft', label: 'Used (sqft)', type: 'number' },
      { name: 'utilization_pct', label: 'Utilization (%)', type: 'number' },
      { name: 'manager', label: 'Manager', type: 'text' },
      { name: 'temperature_controlled', label: 'Temp Controlled', type: 'select', options: ['true', 'false'] },
      { name: 'hazmat_certified', label: 'Hazmat Certified', type: 'select', options: ['true', 'false'] },
      { name: 'monthly_cost', label: 'Monthly Cost ($)', type: 'number' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'maintenance', 'full'] },
    ],
    detailFields: ['warehouse_code', 'warehouse_name', 'location', 'zone', 'capacity_sqft', 'used_sqft', 'utilization_pct', 'manager', 'temperature_controlled', 'hazmat_certified', 'monthly_cost', 'status'],
    formatCell: (col, val) => { if (col === 'utilization_pct') return `${val}%`; if (col === 'capacity_sqft') return Number(val).toLocaleString(); return val; },
    itemLabel: (item) => `${item.warehouse_code} - ${item.warehouse_name}`,
  },
  returns: {
    columns: ['rma_number', 'customer_name', 'product_name', 'return_type', 'refund_amount', 'status'],
    columnLabels: { rma_number: 'RMA #', customer_name: 'Customer', product_name: 'Product', return_type: 'Type', refund_amount: 'Refund', status: 'Status' },
    fields: [
      { name: 'rma_number', label: 'RMA Number', type: 'text', required: true },
      { name: 'order_number', label: 'Order Number', type: 'text' },
      { name: 'customer_name', label: 'Customer Name', type: 'text', required: true },
      { name: 'customer_email', label: 'Customer Email', type: 'email' },
      { name: 'product_name', label: 'Product Name', type: 'text' },
      { name: 'quantity', label: 'Quantity', type: 'number' },
      { name: 'reason', label: 'Reason', type: 'textarea' },
      { name: 'refund_amount', label: 'Refund Amount ($)', type: 'number' },
      { name: 'return_type', label: 'Return Type', type: 'select', options: ['Refund', 'Exchange', 'Replacement', 'Partial Refund', 'Hold'] },
      { name: 'tracking_number', label: 'Tracking Number', type: 'text' },
      { name: 'request_date', label: 'Request Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'processing', 'completed', 'denied'] },
    ],
    detailFields: ['rma_number', 'order_number', 'customer_name', 'customer_email', 'product_name', 'quantity', 'reason', 'refund_amount', 'return_type', 'tracking_number', 'request_date', 'status'],
    formatCell: (col, val) => col === 'refund_amount' ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => `${item.rma_number} - ${item.customer_name}`,
  },
  pricing: {
    columns: ['quote_number', 'customer_name', 'product_name', 'total_amount', 'valid_until', 'status'],
    columnLabels: { quote_number: 'Quote #', customer_name: 'Customer', product_name: 'Product', total_amount: 'Total', valid_until: 'Valid Until', status: 'Status' },
    fields: [
      { name: 'quote_number', label: 'Quote Number', type: 'text', required: true },
      { name: 'customer_name', label: 'Customer Name', type: 'text', required: true },
      { name: 'customer_email', label: 'Customer Email', type: 'email' },
      { name: 'product_name', label: 'Product/Service', type: 'text' },
      { name: 'quantity', label: 'Quantity', type: 'number' },
      { name: 'unit_price', label: 'Unit Price ($)', type: 'number' },
      { name: 'discount_pct', label: 'Discount (%)', type: 'number' },
      { name: 'total_amount', label: 'Total Amount ($)', type: 'number', required: true },
      { name: 'currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'GBP', 'JPY', 'CAD'] },
      { name: 'valid_until', label: 'Valid Until', type: 'date' },
      { name: 'sales_rep', label: 'Sales Rep', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'sent', 'negotiation', 'accepted', 'rejected', 'expired'] },
    ],
    detailFields: ['quote_number', 'customer_name', 'customer_email', 'product_name', 'quantity', 'unit_price', 'discount_pct', 'total_amount', 'currency', 'valid_until', 'sales_rep', 'status'],
    formatCell: (col, val) => { if (col === 'total_amount') return `$${Number(val).toLocaleString()}`; if (col === 'valid_until' && val) return new Date(val).toLocaleDateString(); return val; },
    itemLabel: (item) => `${item.quote_number} - ${item.customer_name}`,
  },
  'risk-management': {
    columns: ['risk_id', 'title', 'category', 'likelihood', 'impact', 'status'],
    columnLabels: { risk_id: 'Risk ID', title: 'Title', category: 'Category', likelihood: 'Likelihood', impact: 'Impact', status: 'Status' },
    fields: [
      { name: 'risk_id', label: 'Risk ID', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'category', label: 'Category', type: 'select', options: ['Cybersecurity', 'Operational', 'Supply Chain', 'Compliance', 'Financial', 'Physical', 'Technology', 'Human Capital', 'Legal', 'Business', 'Health'] },
      { name: 'likelihood', label: 'Likelihood', type: 'select', options: ['low', 'medium', 'high'] },
      { name: 'impact', label: 'Impact', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { name: 'risk_score', label: 'Risk Score (0-100)', type: 'number' },
      { name: 'owner', label: 'Owner', type: 'text' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'mitigation_plan', label: 'Mitigation Plan', type: 'textarea' },
      { name: 'review_date', label: 'Review Date', type: 'date' },
      { name: 'identified_date', label: 'Identified Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['identified', 'mitigating', 'monitoring', 'accepted', 'closed'] },
    ],
    detailFields: ['risk_id', 'title', 'description', 'category', 'likelihood', 'impact', 'risk_score', 'owner', 'department', 'mitigation_plan', 'review_date', 'identified_date', 'status'],
    formatCell: (col, val) => val,
    itemLabel: (item) => `${item.risk_id} - ${item.title}`,
  },
  'audit-trail': {
    columns: ['event_id', 'user_name', 'action', 'module', 'severity', 'status'],
    columnLabels: { event_id: 'Event ID', user_name: 'User', action: 'Action', module: 'Module', severity: 'Severity', status: 'Status' },
    fields: [
      { name: 'event_id', label: 'Event ID', type: 'text', required: true },
      { name: 'user_name', label: 'User Name', type: 'text', required: true },
      { name: 'user_role', label: 'User Role', type: 'text' },
      { name: 'action', label: 'Action', type: 'select', options: ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'DEPLOY', 'BACKUP', 'ALERT', 'ACCESS_DENIED'] },
      { name: 'module', label: 'Module', type: 'text' },
      { name: 'resource', label: 'Resource', type: 'text' },
      { name: 'resource_id', label: 'Resource ID', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'ip_address', label: 'IP Address', type: 'text' },
      { name: 'event_timestamp', label: 'Timestamp', type: 'text' },
      { name: 'severity', label: 'Severity', type: 'select', options: ['info', 'warning', 'critical'] },
      { name: 'status', label: 'Status', type: 'select', options: ['logged', 'flagged', 'reviewed', 'acknowledged'] },
    ],
    detailFields: ['event_id', 'user_name', 'user_role', 'action', 'module', 'resource', 'resource_id', 'description', 'ip_address', 'event_timestamp', 'severity', 'status'],
    formatCell: (col, val) => val,
    itemLabel: (item) => `${item.event_id} - ${item.action}`,
  },
  'user-management': {
    columns: ['username', 'full_name', 'role', 'department', 'access_level', 'status'],
    columnLabels: { username: 'Username', full_name: 'Full Name', role: 'Role', department: 'Department', access_level: 'Access', status: 'Status' },
    fields: [
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'full_name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'role', label: 'Role', type: 'text' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'access_level', label: 'Access Level', type: 'select', options: ['Full Access', 'Department Admin', 'Standard', 'Limited', 'Read Only', 'API Only', 'None'] },
      { name: 'last_login', label: 'Last Login', type: 'text' },
      { name: 'login_count', label: 'Login Count', type: 'number' },
      { name: 'two_factor_enabled', label: '2FA Enabled', type: 'select', options: ['true', 'false'] },
      { name: 'account_locked', label: 'Account Locked', type: 'select', options: ['true', 'false'] },
      { name: 'password_expires', label: 'Password Expires', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'disabled', 'suspended', 'pending'] },
    ],
    detailFields: ['username', 'full_name', 'email', 'role', 'department', 'access_level', 'last_login', 'login_count', 'two_factor_enabled', 'account_locked', 'password_expires', 'status'],
    formatCell: (col, val) => val,
    itemLabel: (item) => `${item.username} - ${item.full_name}`,
  },
  'knowledge-base': {
    columns: ['article_id', 'title', 'category', 'author', 'views', 'status'],
    columnLabels: { article_id: 'ID', title: 'Title', category: 'Category', author: 'Author', views: 'Views', status: 'Status' },
    fields: [
      { name: 'article_id', label: 'Article ID', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'category', label: 'Category', type: 'select', options: ['Onboarding', 'Finance', 'IT', 'Sales', 'Security', 'HR', 'Technical', 'Procurement', 'Operations'] },
      { name: 'content', label: 'Content', type: 'textarea' },
      { name: 'author', label: 'Author', type: 'text' },
      { name: 'department', label: 'Department', type: 'text' },
      { name: 'tags', label: 'Tags', type: 'text' },
      { name: 'views', label: 'Views', type: 'number' },
      { name: 'helpful_votes', label: 'Helpful Votes', type: 'number' },
      { name: 'last_reviewed', label: 'Last Reviewed', type: 'date' },
      { name: 'access_level', label: 'Access Level', type: 'select', options: ['all_employees', 'engineering', 'it_team', 'sales_team', 'finance_team', 'operations_team', 'hr_team'] },
      { name: 'status', label: 'Status', type: 'select', options: ['published', 'draft', 'archived', 'under_review'] },
    ],
    detailFields: ['article_id', 'title', 'category', 'content', 'author', 'department', 'tags', 'views', 'helpful_votes', 'last_reviewed', 'access_level', 'status'],
    formatCell: (col, val) => val,
    itemLabel: (item) => `${item.article_id} - ${item.title}`,
  },
  shipping: {
    columns: ['shipping_id', 'customer_name', 'carrier', 'service_level', 'shipping_cost', 'status'],
    columnLabels: { shipping_id: 'Shipping ID', customer_name: 'Customer', carrier: 'Carrier', service_level: 'Service', shipping_cost: 'Cost', status: 'Status' },
    fields: [
      { name: 'shipping_id', label: 'Shipping ID', type: 'text', required: true },
      { name: 'order_number', label: 'Order Number', type: 'text' },
      { name: 'customer_name', label: 'Customer Name', type: 'text' },
      { name: 'carrier', label: 'Carrier', type: 'select', options: ['FedEx', 'UPS', 'DHL', 'USPS', 'Maersk'] },
      { name: 'service_level', label: 'Service Level', type: 'select', options: ['Ground', 'Express', 'Next Day Air', 'Express Saver', 'Priority', 'International Express'] },
      { name: 'tracking_number', label: 'Tracking Number', type: 'text' },
      { name: 'origin_address', label: 'Origin', type: 'textarea' },
      { name: 'destination_address', label: 'Destination', type: 'textarea' },
      { name: 'weight_kg', label: 'Weight (kg)', type: 'number' },
      { name: 'dimensions', label: 'Dimensions', type: 'text' },
      { name: 'shipping_cost', label: 'Shipping Cost ($)', type: 'number' },
      { name: 'insurance_value', label: 'Insurance Value ($)', type: 'number' },
      { name: 'ship_date', label: 'Ship Date', type: 'date' },
      { name: 'estimated_arrival', label: 'Est. Arrival', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'processing', 'in_transit', 'delivered', 'returned', 'cancelled'] },
    ],
    detailFields: ['shipping_id', 'order_number', 'customer_name', 'carrier', 'service_level', 'tracking_number', 'origin_address', 'destination_address', 'weight_kg', 'dimensions', 'shipping_cost', 'insurance_value', 'ship_date', 'estimated_arrival', 'status'],
    formatCell: (col, val) => col === 'shipping_cost' ? `$${Number(val).toLocaleString()}` : val,
    itemLabel: (item) => `${item.shipping_id} - ${item.customer_name}`,
  },
};

const AI_FILL_SAMPLES = {
  finance: [
    { label: 'Office Renovation Expense', prompt: 'Expense payment of $4,500 for office renovation, category facilities, reference FIN-2026-0089, account operations, status approved' },
    { label: 'Consulting Income', prompt: 'Income of $12,750 from consulting services, category professional services, reference FIN-2026-0090, account revenue, status completed' },
    { label: 'Software License Expense', prompt: 'Expense of $8,900 for annual Salesforce license renewal, category software, reference FIN-2026-0091, account IT, status pending' },
    { label: 'Client Retainer Income', prompt: 'Income of $25,000 monthly retainer from Acme Corp, category client services, reference FIN-2026-0092, account revenue, status completed' },
  ],
  hr: [
    { label: 'Senior Engineer Hire', prompt: 'New employee Sarah Chen, email sarah.chen@company.com, phone 555-0142, engineering department, senior software engineer, salary $145,000, hire date 2026-03-01, status active, manager David Park' },
    { label: 'Marketing Strategist', prompt: 'Employee James Rodriguez, email j.rodriguez@company.com, phone 555-0198, marketing department, content strategist, salary $85,000, hire date 2026-02-15, status active, manager Lisa Wong' },
    { label: 'Sales Rep Onboarding', prompt: 'New employee Kevin Brooks, email k.brooks@company.com, phone 555-0277, sales department, account executive, salary $95,000, hire date 2026-03-15, status active, manager Tom Harris' },
    { label: 'HR Coordinator', prompt: 'Employee Maria Lopez, email m.lopez@company.com, phone 555-0333, HR department, HR coordinator, salary $62,000, hire date 2026-04-01, status active, manager Susan Park' },
  ],
  inventory: [
    { label: 'Dell Laptop Stock', prompt: 'Dell XPS 15 laptop, SKU LAP-2026-045, category electronics, quantity 25, unit price $1,299, warehouse Building A, reorder level 10, supplier Dell Technologies, status in stock' },
    { label: 'Standing Desk (Low Stock)', prompt: 'Ergonomic standing desk, SKU FRN-2026-012, category furniture, quantity 8, unit price $649, warehouse Building C, reorder level 5, supplier FlexiSpot, status low stock' },
    { label: 'Wireless Mouse Bulk', prompt: 'Logitech MX Master 3S wireless mouse, SKU ACC-2026-088, category peripherals, quantity 150, unit price $99, warehouse Building A, reorder level 30, supplier Logitech, status in stock' },
    { label: 'Server RAM (Out of Stock)', prompt: '64GB DDR5 ECC server memory, SKU MEM-2026-015, category components, quantity 0, unit price $289, warehouse Building B, reorder level 20, supplier Kingston, status out of stock' },
  ],
  crm: [
    { label: 'Qualified Enterprise Lead', prompt: 'Lead Maria Santos, email maria@techcorp.io, phone 555-0311, company TechCorp Solutions, VP of Engineering, source LinkedIn, deal value $85,000, stage qualified, assigned to Jake Miller' },
    { label: 'Conference Prospect', prompt: 'Contact Robert Kim, email robert.kim@innovate.co, phone 555-0455, company Innovate Co, CTO, source Conference, deal value $120,000, stage proposal, assigned to Sarah Lee' },
    { label: 'Referral Lead', prompt: 'Lead Aisha Johnson, email aisha@nexgen.com, phone 555-0612, company NexGen Analytics, Director of IT, source Referral, deal value $55,000, stage lead, assigned to Mike Chen' },
    { label: 'Closed Won Deal', prompt: 'Contact David Park, email d.park@summit.io, phone 555-0788, company Summit Enterprises, COO, source Website, deal value $200,000, stage closed_won, assigned to Jake Miller' },
  ],
  sales: [
    { label: 'Enterprise License Order', prompt: 'Order SO-2026-0234 for Acme Corp, email orders@acme.com, 50 enterprise licenses at $200 each, total $10,000, status processing, payment by purchase order, ship to 123 Business Ave, Suite 400, Chicago IL 60601' },
    { label: 'Widget Bulk Order', prompt: 'Order SO-2026-0235 for customer Global Industries, email procurement@global.com, 100 premium widgets, quantity 100, unit price $45, total $4,500, status pending, credit card payment, ship to 456 Industrial Blvd, Houston TX 77001' },
    { label: 'Completed Hardware Order', prompt: 'Order SO-2026-0236 for Zenith Corp, email purchasing@zenith.com, 10 server racks, quantity 10, unit price $3,200, total $32,000, status completed, wire transfer, ship to 789 Data Center Dr, Dallas TX 75201' },
    { label: 'Cancelled Small Order', prompt: 'Order SO-2026-0237 for Bright Labs, email orders@brightlabs.com, 5 monitor stands, quantity 5, unit price $80, total $400, status cancelled, credit card, ship to 321 Tech Ln, Austin TX 78701' },
  ],
  procurement: [
    { label: 'Circuit Board PO', prompt: 'PO PO-2026-0178 from supplier TechParts Inc, email orders@techparts.com, 200 circuit boards, unit cost $35, total $7,000, status approved, delivery date 2026-04-15, payment terms Net 30' },
    { label: 'Office Supplies Order', prompt: 'PO PO-2026-0179 from supplier OfficePro Supplies, email sales@officepro.com, bulk office supplies and paper, quantity 500, unit cost $12, total $6,000, status draft, delivery 2026-03-20, payment terms Net 45' },
    { label: 'Furniture Delivery', prompt: 'PO PO-2026-0180 from supplier ModernOffice Inc, email orders@modernoffice.com, 20 ergonomic office chairs, unit cost $450, total $9,000, status in_transit, delivery 2026-03-28, payment terms Net 60' },
    { label: 'IT Equipment PO', prompt: 'PO PO-2026-0181 from supplier ServerDirect, email sales@serverdirect.com, 5 rack-mount servers, unit cost $8,500, total $42,500, status approved, delivery 2026-04-05, payment terms Net 30' },
  ],
  projects: [
    { label: 'ERP Migration (In Progress)', prompt: 'Project ERP Migration Phase 2, description: migrate remaining modules to new cloud infrastructure, manager Jennifer Walsh, department IT, budget $250,000, start 2026-03-01, end 2026-09-30, status in_progress, priority high, completion 35%' },
    { label: 'Mobile App Redesign', prompt: 'Project Mobile App Redesign, description: complete redesign of customer-facing mobile application, manager Alex Torres, department Engineering, budget $180,000, start 2026-04-01, end 2026-08-31, status planning, priority medium, completion 0%' },
    { label: 'Data Warehouse Build', prompt: 'Project Data Warehouse Modernization, description: replace legacy data warehouse with cloud-based analytics platform, manager Priya Sharma, department Analytics, budget $320,000, start 2026-02-01, end 2026-11-30, status in_progress, priority critical, completion 20%' },
    { label: 'Office Expansion', prompt: 'Project New Office Buildout, description: design and build out new 3rd floor office space for 50 employees, manager Tom Rodriguez, department Facilities, budget $150,000, start 2026-05-01, end 2026-07-31, status planning, priority low, completion 0%' },
  ],
  assets: [
    { label: 'MacBook Pro (Engineering)', prompt: 'Asset tag AST-2026-0567, MacBook Pro 16-inch M3, category electronics, location Floor 3 Room 302, department Engineering, purchased 2026-01-15, cost $3,499, current value $3,100, status active, assigned to Mike Johnson' },
    { label: 'Office Chair (Marketing)', prompt: 'Asset tag AST-2026-0568, Herman Miller Aeron Chair, category furniture, location Floor 2 Room 210, department Marketing, purchased 2025-11-01, cost $1,395, current value $1,200, status active, assigned to Emily Davis' },
    { label: 'Conference Room Display', prompt: 'Asset tag AST-2026-0569, Samsung 75-inch Smart Display, category AV equipment, location Floor 1 Conference Room A, department Facilities, purchased 2026-02-01, cost $2,200, current value $2,000, status active, assigned to Facilities Team' },
    { label: 'Retired Printer', prompt: 'Asset tag AST-2024-0201, HP LaserJet Pro, category office equipment, location Storage Room B, department IT, purchased 2022-06-15, cost $800, current value $0, status retired, assigned to none' },
  ],
  'supply-chain': [
    { label: 'Shanghai to LA Shipment', prompt: 'Shipment SHP-2026-0891 from Shanghai China to Los Angeles CA, carrier Maersk, tracking MAEU1234567, weight 2500 kg, shipping cost $4,200, status in_transit, estimated delivery 2026-04-10, actual delivery not yet' },
    { label: 'Munich to NYC Air Freight', prompt: 'Shipment SHP-2026-0892 from Munich Germany to New York NY, carrier DHL, tracking DHL9876543, weight 150 kg, cost $890, status processing, estimated delivery 2026-03-25' },
    { label: 'Delivered Domestic', prompt: 'Shipment SHP-2026-0893 from Dallas TX to Miami FL, carrier FedEx, tracking FDX5551234, weight 45 kg, cost $120, status delivered, estimated 2026-03-10, actual delivery 2026-03-09' },
    { label: 'Returned Shipment', prompt: 'Shipment SHP-2026-0894 from Tokyo Japan to San Francisco CA, carrier UPS, tracking 1Z888RETURN, weight 30 kg, cost $650, status returned, estimated 2026-03-20, actual delivery 2026-03-22' },
  ],
  compliance: [
    { label: 'SOX Audit (High Risk)', prompt: 'SOX Section 404 compliance, requirement: annual internal controls assessment and documentation, department Finance, responsible person Michael Torres, due date 2026-06-30, status in_progress, risk level high, notes: Q2 audit prep underway' },
    { label: 'GDPR Data Records', prompt: 'GDPR Article 30 compliance, requirement: maintain records of processing activities for all EU data, department Legal, responsible person Anna Schmidt, due 2026-04-15, status pending, risk medium, notes: annual review cycle' },
    { label: 'HIPAA Security Review', prompt: 'HIPAA Security Rule compliance, requirement: conduct annual risk assessment of electronic health data safeguards, department IT Security, responsible person James Wu, due 2026-05-31, status pending, risk critical, notes: new vendor integration requires review' },
    { label: 'PCI-DSS Completed', prompt: 'PCI-DSS v4.0 compliance, requirement: quarterly network vulnerability scan and penetration test, department IT, responsible person Rachel Kim, due 2026-03-31, completion date 2026-03-15, status completed, risk medium, notes: all scans passed' },
  ],
  'general-ledger': [
    { label: 'Revenue Recognition', prompt: 'Account 4010, Revenue - Product Sales, entry type revenue, debit $0, credit $45,000, description: Q1 product revenue recognition, entry date 2026-03-31, period Q1-2026, fiscal year 2026, status posted' },
    { label: 'Marketing Expense', prompt: 'Account 5020, Operating Expenses - Marketing, entry type expense, debit $12,500, credit $0, description: March digital advertising spend, entry date 2026-03-31, period Q1-2026, fiscal year 2026, status draft' },
    { label: 'Rent Liability', prompt: 'Account 2100, Accounts Payable - Rent, entry type liability, debit $0, credit $35,000, description: April office lease payment accrual, entry date 2026-03-31, period Q1-2026, fiscal year 2026, status posted' },
    { label: 'Equipment Asset', prompt: 'Account 1500, Fixed Assets - Equipment, entry type asset, debit $85,000, credit $0, description: new CNC machine purchase, entry date 2026-03-15, period Q1-2026, fiscal year 2026, status posted' },
  ],
  'accounts-payable': [
    { label: 'Cloud Hosting Invoice', prompt: 'Invoice AP-2026-1045 from vendor CloudHost Inc, email billing@cloudhost.com, annual cloud hosting renewal, amount $18,000, due date 2026-04-15, payment method wire transfer, status pending, category IT Services' },
    { label: 'Office Supplies Bill', prompt: 'Invoice AP-2026-1046 from vendor Premium Office Supply, email ar@premiumoffice.com, monthly office supplies, amount $2,340, due 2026-03-30, payment auto-debit, status approved, category Office Supplies' },
    { label: 'Overdue Legal Fee', prompt: 'Invoice AP-2026-1047 from vendor Baker & Associates Law, email billing@bakerlaw.com, Q1 legal retainer services, amount $15,000, due 2026-02-28, payment check, status overdue, category Legal' },
    { label: 'Paid Utilities', prompt: 'Invoice AP-2026-1048 from vendor City Power & Light, email commercial@citypower.com, March electricity and gas, amount $4,800, due 2026-03-25, payment date 2026-03-20, payment auto-debit, status paid, category Utilities' },
  ],
  'accounts-receivable': [
    { label: 'Enterprise License AR', prompt: 'Invoice AR-2026-2089 for customer Pinnacle Corp, email accounts@pinnacle.com, enterprise software license Q2, amount $35,000, due date 2026-04-30, payment method wire transfer, status outstanding, category Software' },
    { label: 'Consulting Services AR', prompt: 'Invoice AR-2026-2090 for customer Bright Solutions, email billing@brightsol.com, consulting services March, amount $8,500, due 2026-04-15, payment credit card, status outstanding, category Services' },
    { label: 'Overdue Client Invoice', prompt: 'Invoice AR-2026-2091 for customer LatePayCo, email ap@latepayco.com, implementation services Phase 1, amount $22,000, due 2026-02-15, payment wire transfer, status overdue, category Professional Services' },
    { label: 'Paid Training Invoice', prompt: 'Invoice AR-2026-2092 for customer FastGrow Inc, email billing@fastgrow.com, on-site training 3 days, amount $6,000, due 2026-03-10, payment date 2026-03-08, payment check, status paid, category Training' },
  ],
  payroll: [
    { label: 'Engineer Payroll (Pending)', prompt: 'Employee Amanda Foster, ID EMP-1042, department Engineering, pay period March 2026, pay date 2026-03-31, base salary $11,250, overtime $850, bonus $2,000, deductions $1,500, tax withholding $2,800, net pay $9,800, status pending' },
    { label: 'Sales Rep (Processed)', prompt: 'Employee Carlos Mendez, ID EMP-1078, department Sales, pay period March 2026, pay date 2026-03-31, base $8,333, overtime $0, bonus $3,500, deductions $1,200, tax $2,450, net pay $8,183, status processed' },
    { label: 'Executive Payroll (Paid)', prompt: 'Employee Linda Chen, ID EMP-1003, department Finance, pay period March 2026, pay date 2026-03-31, base $18,750, overtime $0, bonus $5,000, deductions $3,200, tax $5,100, net pay $15,450, status paid' },
    { label: 'Intern Payroll', prompt: 'Employee Tyler Wang, ID EMP-1150, department Engineering, pay period March 2026, pay date 2026-03-31, base $3,333, overtime $0, bonus $0, deductions $250, tax $600, net pay $2,483, status pending' },
  ],
  recruitment: [
    { label: 'Data Engineer Interview', prompt: 'Position Senior Data Engineer, department Engineering, candidate Priya Sharma, email priya.sharma@gmail.com, phone 555-0234, source LinkedIn, 7 years experience, salary expectation $155,000, applied 2026-02-28, interview 2026-03-10, status interview_scheduled, recruiter Tom Wilson' },
    { label: 'Marketing Manager Screening', prompt: 'Position Product Marketing Manager, department Marketing, candidate Daniel Ortiz, email d.ortiz@outlook.com, phone 555-0567, source Referral, 5 years experience, salary expectation $110,000, applied 2026-03-01, status screening, recruiter Rachel Green' },
    { label: 'Hired Designer', prompt: 'Position UX Designer, department Engineering, candidate Mei Lin, email mei.lin@gmail.com, phone 555-0891, source Dribbble, 4 years experience, salary expectation $105,000, applied 2026-01-20, interview 2026-02-05, status hired, recruiter Tom Wilson' },
    { label: 'Rejected Applicant', prompt: 'Position Sales Associate, department Sales, candidate Bob Thompson, email bob.t@yahoo.com, phone 555-0345, source Indeed, 1 year experience, salary expectation $65,000, applied 2026-02-10, interview 2026-02-20, status rejected, recruiter Rachel Green' },
  ],
  training: [
    { label: 'Python Data Science Course', prompt: 'Course Advanced Python for Data Science, category Technical, instructor Dr. Wei Zhang, department Engineering, max 30 participants, 18 enrolled, start 2026-04-07, end 2026-04-18, 40 hours, cost $1,200 per person, location Training Room A, status upcoming' },
    { label: 'Leadership Program', prompt: 'Course Leadership Essentials Program, category Management, instructor Sarah Mitchell, department HR, max 20 participants, 15 enrolled, start 2026-03-15, end 2026-03-17, 24 hours, cost $800, location Conference Center B, status upcoming' },
    { label: 'Compliance Training (Active)', prompt: 'Course Annual Compliance & Ethics, category Compliance, instructor Legal Team, department all, max 500, enrolled 385, start 2026-03-01, end 2026-03-31, 4 hours, cost $0, location Online, status in_progress' },
    { label: 'Completed Sales Bootcamp', prompt: 'Course Advanced Sales Negotiation, category Sales, instructor Mike Harris, department Sales, max 15, enrolled 15, start 2026-02-10, end 2026-02-14, 32 hours, cost $2,500, location Offsite Retreat, status completed' },
  ],
  budgets: [
    { label: 'Engineering Q2 Budget', prompt: 'Engineering Department Budget 2026, category operations, fiscal year 2026, quarter Q2, allocated $450,000, spent $125,000, remaining $325,000, status active, approved by CFO Linda Chen' },
    { label: 'Marketing Annual Budget', prompt: 'Marketing Campaign Budget FY2026, department Marketing, category advertising, fiscal year 2026, quarter Annual, allocated $300,000, spent $78,000, remaining $222,000, status active, approved by VP Marketing' },
    { label: 'IT Infrastructure Budget', prompt: 'IT Infrastructure Budget 2026, department IT, category capital, fiscal year 2026, quarter Annual, allocated $600,000, spent $410,000, remaining $190,000, status active, approved by CTO' },
    { label: 'Frozen R&D Budget', prompt: 'R&D Innovation Fund Q3, department Engineering, category research, fiscal year 2026, quarter Q3, allocated $200,000, spent $0, remaining $200,000, status frozen, approved by CEO' },
  ],
  quality: [
    { label: 'Hardware Defect (Medium)', prompt: 'Inspection QC-2026-0456, product Enterprise Server v3, batch B-2026-089, inspector Robert Chang, date 2026-03-15, category Hardware, 3 defects found, severity medium, corrective action: replace faulty capacitors on affected units, status open, department Manufacturing' },
    { label: 'Software Bug (Low)', prompt: 'Inspection QC-2026-0457, product Mobile App v4.2, batch RELEASE-4.2.1, inspector Lisa Park, date 2026-03-18, category Software, 1 defect found, severity low, corrective action: fix UI alignment on settings page, status in_progress, department Engineering' },
    { label: 'Critical Security Finding', prompt: 'Inspection QC-2026-0458, product Cloud API Gateway, batch DEPLOY-2026-03, inspector James Wu, date 2026-03-20, category Security, 2 defects, severity critical, corrective action: patch SQL injection vulnerability immediately, status open, department IT Security' },
    { label: 'Passed Facilities Inspection', prompt: 'Inspection QC-2026-0459, product Building A Fire Safety, batch ANNUAL-2026, inspector Fire Marshal Davis, date 2026-03-10, category Facilities, 0 defects, severity low, corrective action: none required, status closed, department Facilities' },
  ],
  manufacturing: [
    { label: 'Widget Assembly (In Production)', prompt: 'Work order WO-2026-0789, product Premium Widget Assembly, ordered 1000 units, produced 650, unit cost $22, total cost $22,000, production line Line-A3, start 2026-03-01, end 2026-03-28, status in_production, priority high, supervisor Frank Martinez' },
    { label: 'Circuit Board (Scheduled)', prompt: 'Work order WO-2026-0790, product Circuit Board Model X, ordered 500, produced 0, unit cost $45, total $22,500, line Line-B1, start 2026-04-01, end 2026-04-20, status scheduled, priority medium, supervisor Karen Lee' },
    { label: 'Completed Sensor Batch', prompt: 'Work order WO-2026-0791, product Temperature Sensor Unit, ordered 2000, produced 2000, unit cost $8, total $16,000, line Line-C2, start 2026-02-15, end 2026-03-05, status completed, priority low, supervisor Frank Martinez' },
    { label: 'On Hold Power Supply', prompt: 'Work order WO-2026-0792, product Power Supply Module v2, ordered 300, produced 120, unit cost $55, total $16,500, line Line-A3, start 2026-03-10, end 2026-03-25, status on_hold, priority critical, supervisor Karen Lee' },
  ],
  helpdesk: [
    { label: 'VPN Issue (High Priority)', prompt: 'Ticket HD-2026-1234, subject: VPN connection dropping intermittently, description: user reports VPN disconnects every 30 minutes since Monday, requester John Baker, email john.baker@company.com, category Network, priority high, assigned to IT Support Team, department Sales, SLA 4 hours, status open' },
    { label: 'Shared Drive Access', prompt: 'Ticket HD-2026-1235, subject: Cannot access shared drive, description: permission denied error when accessing marketing shared folder, requester Amy Liu, email amy.liu@company.com, category Access, priority medium, assigned to Help Desk, department Marketing, SLA 8 hours, status in_progress' },
    { label: 'Critical Email Outage', prompt: 'Ticket HD-2026-1236, subject: Company email down for entire floor, description: no one on Floor 2 can send or receive email since 9am, requester Tom Harris, email t.harris@company.com, category Email, priority critical, assigned to IT Infrastructure, department Operations, SLA 1 hour, status open' },
    { label: 'Resolved Printer Issue', prompt: 'Ticket HD-2026-1237, subject: Printer jam on Floor 3, description: HP printer near kitchen showing paper jam error, requester Lisa Park, email l.park@company.com, category Hardware, priority low, assigned to Facilities, department Engineering, SLA 24 hours, status resolved' },
  ],
  contracts: [
    { label: 'AWS Service Contract', prompt: 'Contract CTR-2026-0345, title: Annual Cloud Infrastructure Agreement, party Amazon Web Services, email enterprise@aws.com, type Service, value $120,000, start 2026-01-01, end 2026-12-31, auto renew true, payment terms Net 30, status active, owner IT Director' },
    { label: 'Office Lease Draft', prompt: 'Contract CTR-2026-0346, title: Office Lease Renewal Downtown HQ, party Metroplex Properties LLC, email leasing@metroplex.com, type Lease, value $450,000, start 2026-07-01, end 2029-06-30, auto renew false, payment terms Monthly, status draft, owner Facilities Manager' },
    { label: 'Expiring Insurance Policy', prompt: 'Contract CTR-2026-0347, title: Corporate Liability Insurance, party SafeGuard Insurance, email renewals@safeguard.com, type Insurance, value $85,000, start 2025-07-01, end 2026-06-30, auto renew true, payment terms Annual, status expiring_soon, owner CFO' },
    { label: 'Software License Agreement', prompt: 'Contract CTR-2026-0348, title: Enterprise CRM License, party Salesforce, email contracts@salesforce.com, type License, value $96,000, start 2026-01-01, end 2026-12-31, auto renew true, payment terms Annual, status active, owner VP Sales' },
  ],
  expenses: [
    { label: 'NYC Travel Expense', prompt: 'Report EXP-2026-0567, employee Jennifer Park, department Sales, category Travel, description: client visit to NYC including flights and hotel 3 nights, amount $2,850, submitted 2026-03-10, receipt date 2026-03-08, vendor United Airlines / Marriott, payment corporate card, status submitted, approver Sales Director' },
    { label: 'Conference Attendance', prompt: 'Report EXP-2026-0568, employee David Kim, department Engineering, category Conference, description: attendance at Tech Summit 2026 including registration and meals, amount $1,200, submitted 2026-03-12, receipt 2026-03-05, vendor Tech Summit Inc, payment personal card, status approved, approver CTO' },
    { label: 'Team Dinner Reimbursed', prompt: 'Report EXP-2026-0569, employee Lisa Wong, department Sales, category Meals, description: team celebration dinner after closing Q1 deals, amount $680, submitted 2026-03-15, receipt 2026-03-14, vendor Nobu Restaurant, payment personal card, status reimbursed, approver VP Sales' },
    { label: 'Rejected Equipment Claim', prompt: 'Report EXP-2026-0570, employee Bob Smith, department Engineering, category Equipment, description: personal monitor for home office, amount $450, submitted 2026-03-08, receipt 2026-03-01, vendor Best Buy, payment personal card, status rejected, approver Engineering Director' },
  ],
  timesheet: [
    { label: 'Backend Dev Day', prompt: 'Employee Rachel Green, department Engineering, project ERP Migration, task: backend API development and testing, work date 2026-03-15, hours worked 8.5, overtime 1.5, break 1 hour, clock in 08:30, clock out 18:30, status pending, approved by Team Lead' },
    { label: 'Marketing Design Day', prompt: 'Employee Marcus Brown, department Marketing, project Brand Refresh, task: designed new landing page mockups, work date 2026-03-15, 8 hours, overtime 0, break 0.5, clock in 09:00, clock out 17:30, status approved, approved by Marketing Manager' },
    { label: 'Weekend Overtime', prompt: 'Employee Sarah Chen, department Engineering, project Critical Hotfix, task: emergency production bug fix and deployment, work date 2026-03-16, hours 6, overtime 6, break 0.5, clock in 10:00, clock out 16:30, status pending, approved by CTO' },
    { label: 'Half Day (Approved)', prompt: 'Employee Kevin Brooks, department Sales, project Client Outreach, task: client calls and proposal follow-ups, work date 2026-03-15, hours 4, overtime 0, break 0, clock in 09:00, clock out 13:00, status approved, approved by Sales Director' },
  ],
  documents: [
    { label: 'Q1 Financial Report', prompt: 'Document: Q1 2026 Financial Report, type PDF, category Report, department Finance, version 2.1, file size 4.5 MB, author CFO Linda Chen, description: comprehensive quarterly financial performance review, tags finance quarterly report, access level management, status active' },
    { label: 'Onboarding Guide', prompt: 'Document: Employee Onboarding Guide 2026, type DOCX, category Guide, department HR, version 3.0, size 2.1 MB, author HR Director, description: updated onboarding procedures and checklists for new hires, tags onboarding hr policy, access level all_employees, status active' },
    { label: 'API Technical Spec', prompt: 'Document: REST API v3 Specification, type HTML, category Technical, department Engineering, version 3.0.1, size 1.8 MB, author Lead Architect, description: complete API endpoint documentation with examples, tags api technical engineering, access level engineering, status active' },
    { label: 'Archived Strategy Doc', prompt: 'Document: 2025 Go-To-Market Strategy, type PPTX, category Strategy, department Marketing, version 1.0, size 15 MB, author Marketing Director, description: 2025 GTM plan and competitive analysis, tags strategy marketing 2025, access level management, status archived' },
  ],
  notifications: [
    { label: 'Budget Threshold Warning', prompt: 'Title: Budget Threshold Alert - Engineering, message: Engineering department has reached 85% of Q2 budget allocation. Review and approve additional spending or implement cost controls, type warning, priority high, recipient Engineering Director, department Engineering, module Budgets, status active' },
    { label: 'Contract Expiry Alert', prompt: 'Title: Contract Expiring Soon - AWS Agreement, message: The AWS cloud infrastructure contract CTR-2026-0345 expires in 30 days. Initiate renewal process, type alert, priority critical, recipient IT Director, department IT, module Contracts, status active' },
    { label: 'New Hire Welcome', prompt: 'Title: New Employee Onboarding - Sarah Chen, message: Sarah Chen joins Engineering on March 1st. Ensure laptop provisioning and access setup are completed, type info, priority normal, recipient HR Coordinator, department HR, module HR, status active' },
    { label: 'Compliance Success', prompt: 'Title: PCI-DSS Audit Passed, message: Quarterly PCI-DSS vulnerability scan completed successfully with zero findings, type success, priority normal, recipient CISO, department IT Security, module Compliance, status active' },
  ],
  vendors: [
    { label: 'Electronics Supplier (Top Rated)', prompt: 'Vendor code VND-2026-045, company TechParts International, contact Michael Chen, email michael@techparts.com, phone 555-0789, address: 1200 Tech Park Drive Suite 300 San Jose CA 95134, category Electronics Components, payment terms Net 45, rating 4.5, annual spend $280,000, contract end 2026-12-31, status active' },
    { label: 'Office Supply Vendor', prompt: 'Vendor code VND-2026-046, company GreenPrint Solutions, contact Emma Watson, email emma@greenprint.com, phone 555-0321, address: 500 Eco Way Portland OR 97201, category Office Supplies, payment terms Net 30, rating 4.2, annual spend $45,000, contract end 2027-03-31, status active' },
    { label: 'Suspended Cleaning Service', prompt: 'Vendor code VND-2026-047, company SparkleClean Services, contact Jose Garcia, email jose@sparkleclean.com, phone 555-0456, address: 200 Service Rd Miami FL 33101, category Facilities, payment terms Net 15, rating 2.1, annual spend $18,000, contract end 2026-06-30, status suspended' },
    { label: 'New Catering Vendor', prompt: 'Vendor code VND-2026-048, company FreshBite Catering, contact Anna Park, email anna@freshbite.com, phone 555-0678, address: 75 Culinary Blvd San Francisco CA 94102, category Food Services, payment terms Net 30, rating 0, annual spend $0, contract end 2027-01-01, status pending_review' },
  ],
  tax: [
    { label: 'Federal Income Tax Q1', prompt: 'Federal Corporate Income Tax, jurisdiction United States Federal, period Q1-2026, fiscal year 2026, taxable amount $1,250,000, tax rate 21, tax amount $262,500, due date 2026-04-15, filing date not yet filed, reference number pending, status pending, preparer Tax Director Sarah Kim' },
    { label: 'CA Sales Tax March', prompt: 'State Sales Tax California, jurisdiction California, period March 2026, fiscal year 2026, taxable amount $450,000, rate 7.25, tax amount $32,625, due 2026-04-30, status pending, preparer Tax Analyst Tom Brown' },
    { label: 'NY Payroll Tax (Filed)', prompt: 'State Payroll Tax, jurisdiction New York, period Q1-2026, fiscal year 2026, taxable amount $890,000, rate 4.5, tax amount $40,050, due 2026-04-30, filing date 2026-04-10, reference NYS-2026-Q1-4455, status filed, preparer Tax Analyst Maria Lopez' },
    { label: 'Property Tax (Overdue)', prompt: 'County Property Tax, jurisdiction Santa Clara County CA, period Annual 2025, fiscal year 2025, taxable amount $5,000,000, rate 1.2, tax amount $60,000, due 2026-02-01, status overdue, preparer Controller Office' },
  ],
  'cash-management': [
    { label: 'Client Payment Deposit', prompt: 'Transaction TXN-2026-4567, account Main Operating Account, type deposit, amount $85,000, currency USD, from account Client Payments, to account Main Operating, bank Chase Business, reference: March client payments batch, balance after $542,000, date 2026-03-15, status completed' },
    { label: 'EUR Currency Conversion', prompt: 'Transaction TXN-2026-4568, account Foreign Currency Account, type conversion, amount $50,000, currency EUR, from USD Reserve, to EUR Operating, bank Deutsche Bank, reference: Q2 European operations funding, balance after 125000, date 2026-03-18, status pending' },
    { label: 'Payroll Withdrawal', prompt: 'Transaction TXN-2026-4569, account Payroll Account, type withdrawal, amount $320,000, currency USD, from Payroll Account, to Employee Direct Deposits, bank Wells Fargo, reference: March 2026 payroll run, balance after $45,000, date 2026-03-31, status completed' },
    { label: 'Bank Fee', prompt: 'Transaction TXN-2026-4570, account Main Operating Account, type fee, amount $250, currency USD, from Main Operating, to Chase Bank, bank Chase Business, reference: monthly service fee, balance after $541,750, date 2026-03-31, status completed' },
  ],
  'fixed-assets': [
    { label: 'CNC Machine (Active)', prompt: 'Asset FA-2026-0234, Industrial CNC Machine Model X500, class Machinery, acquired 2026-02-01, cost $185,000, useful life 10 years, straight-line depreciation, accumulated depreciation $1,542, book value $183,458, location Manufacturing Floor B, department Manufacturing, status active' },
    { label: 'Company Vehicle', prompt: 'Asset FA-2026-0235, Tesla Model Y Company Fleet Vehicle, class Vehicles, acquired 2026-01-15, cost $52,000, useful life 5 years, declining balance depreciation, accumulated $1,733, book value $50,267, location Parking Garage A, department Sales, status active' },
    { label: 'Fully Depreciated Server', prompt: 'Asset FA-2019-0089, Dell PowerEdge R640 Server, class IT Equipment, acquired 2019-06-01, cost $12,000, useful life 5 years, straight-line, accumulated $12,000, book value $0, location Server Room A, department IT, status fully_depreciated' },
    { label: 'Building Improvement', prompt: 'Asset FA-2025-0200, Lobby Renovation and ADA Compliance, class Building Improvements, acquired 2025-09-01, cost $95,000, useful life 15 years, straight-line, accumulated $3,167, book value $91,833, location Building A Lobby, department Facilities, status active' },
  ],
  benefits: [
    { label: 'Health Insurance PPO', prompt: 'Premium Health Plus PPO, plan type Health Insurance, provider BlueCross BlueShield, coverage Family, employee cost $450/month, employer cost $1,200/month, 312 enrolled, max 500, effective 2026-01-01, renewal 2027-01-01, description: comprehensive family health coverage with low deductibles, status active' },
    { label: '401(k) Retirement', prompt: '401(k) Retirement Savings Plan, plan type Retirement, provider Fidelity Investments, coverage Individual, employee cost $0/month, employer cost $500/month match, 428 enrolled, max 600, effective 2025-01-01, renewal 2026-12-31, description: employer matches up to 6% of salary, status active' },
    { label: 'Dental Plan', prompt: 'Dental Care Plus, plan type Dental Insurance, provider Delta Dental, coverage Individual + Spouse, employee cost $35/month, employer cost $80/month, 275 enrolled, max 500, effective 2026-01-01, renewal 2027-01-01, description: preventive and basic dental coverage, status active' },
    { label: 'Expired Wellness Program', prompt: 'Corporate Wellness 2025, plan type Wellness, provider WellBeing Inc, coverage Individual, employee cost $0, employer cost $50/month, 180 enrolled, max 500, effective 2025-01-01, renewal 2025-12-31, description: gym membership and wellness app access, status expired' },
  ],
  'leave-management': [
    { label: 'Vacation Request (Pending)', prompt: 'Employee Jessica Turner, ID EMP-1056, department Engineering, leave type Vacation, start 2026-04-14, end 2026-04-18, 5 days requested, reason: family vacation planned trip to Hawaii, approver Engineering Manager, balance remaining 12 days, status pending' },
    { label: 'Sick Leave (Approved)', prompt: 'Employee Mark Phillips, ID EMP-1089, department Finance, leave type Sick Leave, start 2026-03-20, end 2026-03-21, 2 days, reason: flu symptoms and doctor appointment, approver Finance Director, balance remaining 8 days, status approved' },
    { label: 'Maternity Leave', prompt: 'Employee Sarah Chen, ID EMP-1042, department Engineering, leave type Maternity, start 2026-05-01, end 2026-07-25, 60 days, reason: maternity leave, approver HR Director, balance remaining 60 days, status approved' },
    { label: 'Cancelled Personal Day', prompt: 'Employee Kevin Brooks, ID EMP-1078, department Sales, leave type Personal, start 2026-03-25, end 2026-03-25, 1 day, reason: personal errands rescheduled, approver Sales Director, balance remaining 3 days, status cancelled' },
  ],
  'performance-reviews': [
    { label: 'Top Engineer Review', prompt: 'Employee Alice Wang, ID EMP-1023, department Engineering, reviewer David Park (Engineering Director), period H2-2025, overall rating 4.5, goals met 92%, strengths: exceptional technical skills and mentoring junior devs, improvements: could improve documentation habits, comments: strong candidate for promotion, review date 2026-02-15, next review 2026-08-15, status completed' },
    { label: 'Sales Rep Review', prompt: 'Employee Brian Costa, ID EMP-1067, department Sales, reviewer Lisa Wong (Sales VP), period H2-2025, rating 3.8, goals met 78%, strengths: excellent client relationships and closing skills, improvements: needs better CRM data entry discipline, comments: solid performer with growth potential, review 2026-02-20, next 2026-08-20, status acknowledged' },
    { label: 'New Manager Draft Review', prompt: 'Employee Tom Harris, ID EMP-1034, department Sales, reviewer VP Sales, period H1-2026, rating 4.0, goals met 85%, strengths: strong leadership transition and team morale improvement, improvements: delegate more instead of doing everything personally, comments: promising first review as manager, review 2026-02-28, next 2026-08-28, status draft' },
    { label: 'Underperformer PIP', prompt: 'Employee Jane Doe, ID EMP-1120, department Marketing, reviewer Marketing Director, period H2-2025, rating 2.2, goals met 45%, strengths: creative thinking, improvements: missed deadlines consistently and poor communication, comments: performance improvement plan recommended, review 2026-02-25, next 2026-05-25, status in_progress' },
  ],
  marketing: [
    { label: 'Product Launch Campaign', prompt: 'Campaign Spring Product Launch 2026, type Product Launch, channel Multi-channel, target audience enterprise software buyers, budget $75,000, spent $22,000, leads generated 340, conversions 28, ROI 145%, start 2026-03-01, end 2026-05-31, owner Marketing Director, status active' },
    { label: 'LinkedIn Lead Gen', prompt: 'Campaign LinkedIn Lead Gen Q2, type Lead Generation, channel LinkedIn, target mid-market IT decision makers, budget $25,000, spent $8,500, leads 120, conversions 15, ROI 80%, start 2026-04-01, end 2026-06-30, owner Digital Marketing Manager, status planning' },
    { label: 'Google Ads PPC', prompt: 'Campaign Google Search PPC March, type PPC, channel Google Ads, target small business owners searching for ERP, budget $15,000, spent $14,200, leads 89, conversions 12, ROI 210%, start 2026-03-01, end 2026-03-31, owner PPC Specialist, status completed' },
    { label: 'Paused Webinar Series', prompt: 'Campaign Monthly Webinar Series, type Webinar, channel Zoom, target existing customers for upsell, budget $5,000, spent $2,000, leads 45, conversions 3, ROI 25%, start 2026-01-15, end 2026-06-30, owner Content Manager, status paused' },
  ],
  'work-orders': [
    { label: 'HVAC Maintenance', prompt: 'Work order WO-2026-0456, title: HVAC System Annual Maintenance, description: annual inspection and filter replacement for all building HVAC units, asset Building A HVAC System, type Preventive, priority medium, assigned to Facilities Team, department Facilities, estimated 16 hours, actual 0, cost $3,200, scheduled 2026-04-01, status scheduled' },
    { label: 'UPS Battery Replacement', prompt: 'Work order WO-2026-0457, title: Server Room UPS Battery Replacement, description: replace aging UPS batteries in primary server room before failure, asset Server Room UPS, type Corrective, priority high, assigned to IT Infrastructure, department IT, estimated 4 hours, cost $5,800, scheduled 2026-03-25, status open' },
    { label: 'Elevator Inspection', prompt: 'Work order WO-2026-0458, title: Quarterly Elevator Safety Inspection, description: state-required quarterly inspection of all 3 building elevators, asset Building A Elevators, type Inspection, priority medium, assigned to ThyssenKrupp, department Facilities, estimated 6 hours, actual 5, cost $1,500, scheduled 2026-03-15, completed 2026-03-15, status completed' },
    { label: 'Emergency Generator Fix', prompt: 'Work order WO-2026-0459, title: Emergency Generator Failure, description: backup generator failed to start during power test, needs immediate repair, asset Building B Generator, type Emergency, priority critical, assigned to PowerTech Services, department Facilities, estimated 8 hours, cost $12,000, scheduled 2026-03-20, status open' },
  ],
  warehouse: [
    { label: 'East Coast Distribution', prompt: 'Warehouse WH-EAST-01, name East Coast Distribution Center, location Newark NJ, zone A - Receiving, capacity 125000 sqft, used 98000, utilization 78%, manager Tom Rodriguez, temperature controlled yes, hazmat certified yes, monthly cost $85,000, status active' },
    { label: 'Silicon Valley Hub (Full)', prompt: 'Warehouse WH-WEST-03, name Silicon Valley Tech Hub, location San Jose CA, zone C - High Value, capacity 45000, used 41000, utilization 91%, manager Karen Tanaka, temp controlled yes, hazmat no, monthly cost $62,000, status full' },
    { label: 'Midwest Overflow', prompt: 'Warehouse WH-MID-02, name Midwest Overflow Storage, location Columbus OH, zone B - Bulk Storage, capacity 200000, used 85000, utilization 42%, manager Steve Palmer, temp controlled no, hazmat no, monthly cost $35,000, status active' },
    { label: 'Under Maintenance Facility', prompt: 'Warehouse WH-SOUTH-01, name Southern Regional Warehouse, location Atlanta GA, zone A - General, capacity 80000, used 0, utilization 0%, manager vacant, temp controlled yes, hazmat yes, monthly cost $55,000, status maintenance' },
  ],
  returns: [
    { label: 'Server Rack Replacement', prompt: 'RMA RMA-2026-0567, order SO-2026-0198, customer Northwind Traders, email returns@northwind.com, product Enterprise Server Rack, quantity 1, reason: arrived with dented front panel and scratched rails, refund $4,200, return type Replacement, tracking UPS1Z999AA10, request date 2026-03-10, status approved' },
    { label: 'Wrong Model Exchange', prompt: 'RMA RMA-2026-0568, order SO-2026-0210, customer Alpine Tech, email support@alpinetech.com, product Wireless Access Point x5, quantity 5, reason: wrong model shipped need AC version not N, refund $1,250, type Exchange, tracking FDX7890123, request 2026-03-12, status processing' },
    { label: 'Completed Full Refund', prompt: 'RMA RMA-2026-0569, order SO-2026-0185, customer DataFlow Corp, email returns@dataflow.com, product Software License Key, quantity 10, reason: purchased wrong tier need enterprise not pro, refund $5,000, type Refund, tracking N/A, request 2026-03-05, status completed' },
    { label: 'Denied Return Request', prompt: 'RMA RMA-2026-0570, order SO-2026-0150, customer QuickBuy LLC, email help@quickbuy.com, product Custom Cable Assembly, quantity 100, reason: no longer needed, refund $800, type Refund, tracking pending, request 2026-03-15, status denied' },
  ],
  pricing: [
    { label: 'Enterprise License Quote', prompt: 'Quote QT-2026-0890, customer Meridian Solutions, email procurement@meridian.com, product Enterprise Suite Annual License, quantity 150 seats, unit price $120, discount 15%, total $15,300, currency USD, valid until 2026-04-30, sales rep Jake Miller, status sent' },
    { label: 'Services Package (Negotiation)', prompt: 'Quote QT-2026-0891, customer Pacific Dynamics, email buying@pacdyn.com, product Professional Services Package, quantity 200 hours, unit price $175, discount 10%, total $31,500, currency USD, valid until 2026-05-15, sales rep Emily Chen, status negotiation' },
    { label: 'Accepted Hardware Quote', prompt: 'Quote QT-2026-0892, customer Summit Corp, email purchasing@summit.com, product Server Infrastructure Bundle, quantity 5 units, unit price $8,500, discount 20%, total $34,000, currency USD, valid until 2026-03-31, sales rep Jake Miller, status accepted' },
    { label: 'Expired Draft Quote', prompt: 'Quote QT-2026-0893, customer OldProspect Inc, email info@oldprospect.com, product Basic Plan Annual, quantity 50 seats, unit price $30, discount 0%, total $1,500, currency USD, valid until 2026-01-31, sales rep Emily Chen, status expired' },
  ],
  'risk-management': [
    { label: 'Ransomware Threat', prompt: 'Risk RSK-2026-034, title: Ransomware Attack on Production Systems, description: increasing phishing attempts targeting employees could lead to ransomware infection, category Cybersecurity, likelihood medium, impact critical, risk score 75, owner CISO, department IT Security, mitigation: implement advanced email filtering and mandatory security training, review 2026-04-01, identified 2026-03-01, status mitigating' },
    { label: 'Single Supplier Risk', prompt: 'Risk RSK-2026-035, title: Key Supplier Single Point of Failure, description: critical chip supplier has no backup leading to potential production halt, category Supply Chain, likelihood high, impact high, risk score 82, owner VP Operations, department Procurement, mitigation: qualify two alternative suppliers by Q3, review 2026-05-01, identified 2026-02-15, status identified' },
    { label: 'Regulatory Change Risk', prompt: 'Risk RSK-2026-036, title: New Data Privacy Regulation Impact, description: proposed state privacy law could require significant system changes, category Compliance, likelihood medium, impact medium, risk score 50, owner General Counsel, department Legal, mitigation: monitor legislation and prepare impact assessment, review 2026-06-01, identified 2026-03-10, status monitoring' },
    { label: 'Closed Flood Risk', prompt: 'Risk RSK-2026-037, title: Warehouse Flood Zone Exposure, description: east coast warehouse in FEMA flood zone, risk mitigated by insurance and elevated storage, category Physical, likelihood low, impact high, risk score 30, owner Facilities Director, department Operations, mitigation: flood insurance active and inventory stored above ground level, review 2026-09-01, identified 2025-06-01, status closed' },
  ],
  'audit-trail': [
    { label: 'Budget Update Event', prompt: 'Event AUD-2026-78901, user admin.johnson, role System Administrator, action UPDATE, module Finance, resource Budget Allocation, resource ID BUD-2026-045, description: increased Q2 engineering budget from $400K to $450K, IP 10.0.1.45, timestamp 2026-03-15 14:32:00, severity info, status logged' },
    { label: 'Failed Login Alert', prompt: 'Event AUD-2026-78902, user unknown, role N/A, action LOGIN_FAILED, module Authentication, resource User Account, resource ID USR-1089, description: 5 consecutive failed login attempts from external IP, IP 203.0.113.42, timestamp 2026-03-15 02:15:00, severity critical, status flagged' },
    { label: 'Data Export Event', prompt: 'Event AUD-2026-78903, user lisa.wong, role Sales VP, action EXPORT, module CRM, resource Customer Data, resource ID CRM-EXPORT-2026-03, description: exported all customer records to CSV for quarterly review, IP 10.0.2.88, timestamp 2026-03-15 16:00:00, severity warning, status logged' },
    { label: 'New User Created', prompt: 'Event AUD-2026-78904, user hr.admin, role HR Administrator, action CREATE, module User Management, resource User Account, resource ID USR-1150, description: created new intern account for Tyler Wang, IP 10.0.1.22, timestamp 2026-03-14 10:15:00, severity info, status logged' },
  ],
  'user-management': [
    { label: 'Engineering Manager', prompt: 'Username j.martinez, full name Julia Martinez, email julia.martinez@company.com, role Engineering Manager, department Engineering, access level Department Admin, last login 2026-03-15 09:30, login count 245, 2FA enabled true, account locked false, password expires 2026-06-15, status active' },
    { label: 'Data Analyst', prompt: 'Username n.patel, full name Nikhil Patel, email n.patel@company.com, role Data Analyst, department Analytics, access Standard, last login 2026-03-14 17:45, login count 89, 2FA true, locked false, password expires 2026-05-30, status active' },
    { label: 'Suspended Account', prompt: 'Username m.old, full name Mike Oldfield, email m.oldfield@company.com, role Former Contractor, department IT, access None, last login 2026-01-05 11:00, login count 12, 2FA false, account locked true, password expires 2026-01-15, status suspended' },
    { label: 'New Pending User', prompt: 'Username t.wang, full name Tyler Wang, email t.wang@company.com, role Engineering Intern, department Engineering, access Limited, last login never, login count 0, 2FA false, locked false, password expires 2026-09-01, status pending' },
  ],
  'knowledge-base': [
    { label: 'VPN Setup Guide', prompt: 'Article KB-2026-0234, title: How to Configure VPN for Remote Access, category IT, content: step-by-step guide for setting up company VPN on Windows Mac and Linux, author IT Support Team, department IT, tags vpn remote access setup, views 1250, helpful votes 89, last reviewed 2026-02-01, access all_employees, status published' },
    { label: 'Expense Report Guide', prompt: 'Article KB-2026-0235, title: Expense Report Submission Guidelines, category Finance, content: detailed procedures for submitting expense reports including required receipts and approval workflow, author Finance Team, department Finance, tags expenses reimbursement policy, views 890, helpful votes 67, last reviewed 2026-01-15, access all_employees, status published' },
    { label: 'Security Best Practices', prompt: 'Article KB-2026-0236, title: Cybersecurity Best Practices for Employees, category Security, content: password management phishing awareness and safe browsing guidelines, author IT Security, department IT, tags security phishing passwords, views 2100, helpful votes 156, last reviewed 2026-03-01, access all_employees, status published' },
    { label: 'Draft API Docs', prompt: 'Article KB-2026-0237, title: Internal API Integration Guide v3, category Technical, content: how to integrate with internal REST APIs including auth tokens and rate limits, author Engineering Team, department Engineering, tags api integration technical, views 45, helpful votes 3, last reviewed 2026-03-10, access engineering, status draft' },
  ],
  shipping: [
    { label: 'FedEx Express Shipment', prompt: 'Shipping SHP-2026-1234, order SO-2026-0234, customer Acme Corp, carrier FedEx, service Express, tracking FDX789456123, origin: 100 Warehouse Blvd Austin TX 78701, destination: 123 Business Ave Suite 400 Chicago IL 60601, weight 12.5 kg, dimensions 60x40x30cm, cost $89, insurance $500, ship date 2026-03-15, arrival 2026-03-18, status in_transit' },
    { label: 'UPS Ground Delivery', prompt: 'Shipping SHP-2026-1235, order SO-2026-0235, customer Global Industries, carrier UPS, service Ground, tracking 1Z999AA10, origin: 100 Warehouse Blvd Austin TX 78701, destination: 456 Industrial Blvd Houston TX 77001, weight 45 kg, dimensions 120x80x60cm, cost $45, insurance $200, ship 2026-03-16, arrival 2026-03-20, status pending' },
    { label: 'DHL International Express', prompt: 'Shipping SHP-2026-1236, order SO-2026-0220, customer EuroTech GmbH, carrier DHL, service International Express, tracking DHL5556789, origin: 100 Warehouse Blvd Austin TX 78701, destination: Friedrichstr 100 Berlin Germany, weight 8 kg, dimensions 40x30x20cm, cost $195, insurance $1000, ship 2026-03-14, arrival 2026-03-19, status delivered' },
    { label: 'Returned Package', prompt: 'Shipping SHP-2026-1237, order SO-2026-0198, customer Northwind Traders, carrier USPS, service Priority, tracking USPS9876543, origin: 456 Customer St Chicago IL 60601, destination: 100 Warehouse Blvd Austin TX 78701, weight 15 kg, dimensions 50x40x35cm, cost $32, insurance $300, ship 2026-03-12, arrival 2026-03-16, status returned' },
  ],
};

const AI_SUMMARY_SAMPLES = {
  finance: [
    { label: 'Income vs Expense Breakdown', prompt: 'Break down income vs expenses by category, show net cash flow, and flag any unusually large transactions' },
    { label: 'Spending Trends', prompt: 'Show monthly spending trends, top expense categories, and compare approved vs pending amounts' },
    { label: 'Status Distribution', prompt: 'Show distribution of transactions by status (pending, approved, completed, cancelled) with total amounts for each' },
    { label: 'Account Activity', prompt: 'Analyze which accounts have the most activity, compare transaction volumes, and identify dormant accounts' },
  ],
  hr: [
    { label: 'Department Headcount', prompt: 'Show department headcount distribution, average salary by department, and identify any staffing gaps or imbalances' },
    { label: 'Salary Analysis', prompt: 'Analyze salary ranges across positions, identify top earners, show compensation distribution and any pay equity concerns' },
    { label: 'Tenure & Turnover', prompt: 'Analyze tenure distribution, flag employees on leave or recently terminated, and identify retention risks' },
    { label: 'Hiring Timeline', prompt: 'Show recent hires by month and department, identify departments growing fastest, and flag open positions' },
  ],
  inventory: [
    { label: 'Reorder Alerts', prompt: 'Identify items below reorder level, show stock value by category, and flag out-of-stock or low-stock items needing immediate attention' },
    { label: 'Warehouse Comparison', prompt: 'Compare quantities across warehouses, show top 10 most valuable items, and calculate total inventory value' },
    { label: 'Stock Health Check', prompt: 'Show percentage of items in stock vs low stock vs out of stock, identify slow-moving inventory, and calculate carrying cost' },
    { label: 'Supplier Dependency', prompt: 'Analyze inventory by supplier, identify single-source items, and flag suppliers with the most out-of-stock items' },
  ],
  crm: [
    { label: 'Pipeline Analysis', prompt: 'Show pipeline value by stage, conversion rates, and identify the highest-value deals that need attention' },
    { label: 'Lead Source ROI', prompt: 'Analyze lead sources effectiveness, average deal size by stage, and flag stale leads with no recent activity' },
    { label: 'Sales Rep Performance', prompt: 'Compare deal values and counts by assigned rep, identify top performers, and show win/loss ratios' },
    { label: 'Deal Velocity', prompt: 'Analyze how long deals stay in each stage, identify stuck deals, and calculate average time to close' },
  ],
  sales: [
    { label: 'Revenue by Status', prompt: 'Show total revenue by status, average order value, and identify top customers by purchase volume' },
    { label: 'Payment Analysis', prompt: 'Analyze payment method distribution, order fulfillment rates, and flag any overdue or problematic orders' },
    { label: 'Customer Ranking', prompt: 'Rank customers by total spend, show order frequency, and identify VIP customers vs one-time buyers' },
    { label: 'Order Trends', prompt: 'Show order volume trends over time, compare average order sizes, and identify seasonal patterns' },
  ],
  procurement: [
    { label: 'Supplier Spend Analysis', prompt: 'Show total procurement spend by supplier, delivery on-time rate, and flag any overdue or delayed purchase orders' },
    { label: 'Cost Comparison', prompt: 'Compare unit costs across suppliers for similar items and identify cost-saving opportunities' },
    { label: 'PO Status Overview', prompt: 'Show distribution of POs by status, total outstanding value, and flag POs stuck in draft or approval' },
    { label: 'Delivery Performance', prompt: 'Analyze delivery dates vs expected dates, rank suppliers by reliability, and identify chronic late deliverers' },
  ],
  projects: [
    { label: 'Project Health Dashboard', prompt: 'Show project health dashboard: completion rates, budget utilization, and flag projects that are behind schedule or over budget' },
    { label: 'Resource Allocation', prompt: 'Analyze resource allocation across departments, identify bottlenecks, and rank projects by priority vs progress' },
    { label: 'Budget vs Actual', prompt: 'Compare budgeted vs actual spending for each project, show burn rate, and predict which will exceed budget' },
    { label: 'Timeline Risk', prompt: 'Identify projects at risk of missing deadlines, show completion percentage vs timeline elapsed, and flag stalled projects' },
  ],
  assets: [
    { label: 'Value by Category', prompt: 'Calculate total asset value by category, show depreciation summary, and flag assets due for maintenance or retirement' },
    { label: 'Department Distribution', prompt: 'Show asset distribution across departments and locations, identify underutilized assets' },
    { label: 'Aging Analysis', prompt: 'Analyze asset age distribution, identify oldest assets still active, and recommend replacement schedule' },
    { label: 'Cost of Ownership', prompt: 'Calculate total cost of ownership by category, compare purchase cost vs current value, and identify highest-depreciating assets' },
  ],
  'supply-chain': [
    { label: 'Carrier Performance', prompt: 'Show shipment status distribution, average transit times by carrier, and flag delayed or at-risk shipments' },
    { label: 'Cost Optimization', prompt: 'Compare shipping costs across carriers and routes, identify the most cost-effective logistics options' },
    { label: 'On-Time Delivery Rate', prompt: 'Calculate on-time delivery percentages by carrier and route, identify worst-performing lanes' },
    { label: 'Volume Trends', prompt: 'Show shipment volume trends over time, peak shipping periods, and identify capacity constraints' },
  ],
  compliance: [
    { label: 'Risk-Ranked Status', prompt: 'Show compliance status by regulation type, highlight overdue items, and rank risks by severity level' },
    { label: 'Upcoming Deadlines', prompt: 'Identify departments with the most pending compliance requirements and upcoming due dates' },
    { label: 'Completion Rate', prompt: 'Calculate compliance completion rates by department, identify lagging teams, and project completion timeline' },
    { label: 'High-Risk Items', prompt: 'Focus on critical and high-risk compliance items, show responsible parties, and flag items without mitigation plans' },
  ],
  'general-ledger': [
    { label: 'Trial Balance', prompt: 'Show trial balance summary with total debits vs credits, identify any imbalances, and break down by entry type' },
    { label: 'Period Analysis', prompt: 'Analyze entries by fiscal period, flag any reversed or draft entries, and show account activity distribution' },
    { label: 'Account Type Breakdown', prompt: 'Break down entries by type (asset, liability, equity, revenue, expense), show totals and percentages' },
    { label: 'Draft & Unposted', prompt: 'List all draft and unposted entries, show their total value, and identify entries awaiting approval' },
  ],
  'accounts-payable': [
    { label: 'Aging Report', prompt: 'Show aging report: current vs 30/60/90 days, total outstanding balance, and flag overdue invoices' },
    { label: 'Vendor Payment Patterns', prompt: 'Analyze payment patterns by vendor, identify upcoming due dates, and calculate average days to payment' },
    { label: 'Cash Flow Impact', prompt: 'Show total payables coming due this week/month, project cash outflow, and identify high-priority payments' },
    { label: 'Category Breakdown', prompt: 'Break down payables by expense category, show largest vendors by amount owed, and compare to budget' },
  ],
  'accounts-receivable': [
    { label: 'Aging Report', prompt: 'Show aging report for outstanding invoices, identify top debtors, and flag overdue accounts needing collection' },
    { label: 'DSO Analysis', prompt: 'Calculate DSO (days sales outstanding), show collection rates, and identify payment trends by customer' },
    { label: 'Expected Cash Inflow', prompt: 'Project expected cash inflows this month, show confidence by customer payment history, and flag at-risk receivables' },
    { label: 'Collection Priority', prompt: 'Rank overdue invoices by amount and days past due, identify customers needing follow-up, and show escalation recommendations' },
  ],
  payroll: [
    { label: 'Department Cost', prompt: 'Show total payroll cost by department, average compensation breakdown (base, overtime, bonuses), and identify outliers' },
    { label: 'Deductions & Tax', prompt: 'Compare net pay vs deductions across departments, show tax withholding totals, and flag any pending payroll items' },
    { label: 'Overtime Analysis', prompt: 'Identify departments and employees with highest overtime, calculate overtime costs, and flag potential burnout risks' },
    { label: 'Compensation Equity', prompt: 'Compare salaries within same roles across departments, identify pay gaps, and show bonus distribution fairness' },
  ],
  recruitment: [
    { label: 'Pipeline Status', prompt: 'Show hiring pipeline status, time-to-hire by position, and identify bottlenecks in the recruitment process' },
    { label: 'Source Effectiveness', prompt: 'Analyze candidate sources effectiveness, salary expectations vs budget, and positions with the most applicants' },
    { label: 'Open Positions', prompt: 'List all open positions by department, days since posting, number of candidates, and urgency level' },
    { label: 'Offer & Acceptance', prompt: 'Show offer-to-acceptance ratios, compare salary offers vs expectations, and identify reasons for rejections' },
  ],
  training: [
    { label: 'Enrollment Rates', prompt: 'Show training enrollment rates, upcoming courses, and identify departments with low training participation' },
    { label: 'Cost per Employee', prompt: 'Calculate training cost per employee, compare completion rates across categories, and flag undersubscribed courses' },
    { label: 'Skills Gap', prompt: 'Identify which departments have the least training hours, suggest priority courses, and show training vs performance correlation' },
    { label: 'Instructor Load', prompt: 'Analyze instructor workload, compare course ratings, and identify over/under-capacity sessions' },
  ],
  budgets: [
    { label: 'Utilization Rates', prompt: 'Show budget utilization rates by department, flag departments approaching or exceeding limits, and calculate remaining funds' },
    { label: 'Allocated vs Spent', prompt: 'Compare allocated vs spent across all budgets, identify underspending patterns, and project year-end positions' },
    { label: 'At-Risk Budgets', prompt: 'Identify budgets over 80% spent, show burn rate by department, and predict which will run out early' },
    { label: 'Quarterly Comparison', prompt: 'Compare budget performance across quarters, show trends in spending, and identify seasonal patterns' },
  ],
  quality: [
    { label: 'Defect Rates', prompt: 'Show defect rates by product and severity, identify recurring quality issues, and track inspection pass/fail trends' },
    { label: 'Inspector Workload', prompt: 'Analyze inspector workload distribution, average resolution time, and flag critical open defects' },
    { label: 'Category Trends', prompt: 'Show quality issues by category over time, identify improving vs deteriorating areas, and calculate defect density' },
    { label: 'Open Critical Issues', prompt: 'List all open critical and high-severity defects, show age and responsible teams, and recommend prioritization' },
  ],
  manufacturing: [
    { label: 'Production Efficiency', prompt: 'Show production efficiency: ordered vs produced quantities, on-time completion rates, and identify bottleneck production lines' },
    { label: 'Cost Analysis', prompt: 'Calculate unit costs across products, compare planned vs actual timelines, and flag delayed or on-hold work orders' },
    { label: 'Line Utilization', prompt: 'Show production line utilization rates, identify idle capacity, and recommend work order scheduling optimization' },
    { label: 'Priority Backlog', prompt: 'List all high-priority and critical work orders, show their status and ETA, and identify resource conflicts' },
  ],
  helpdesk: [
    { label: 'Ticket Overview', prompt: 'Show ticket volume by category and priority, average resolution time, and identify recurring issues needing permanent fixes' },
    { label: 'SLA Compliance', prompt: 'Analyze SLA compliance rates, workload distribution across agents, and flag critical unresolved tickets' },
    { label: 'Top Issues', prompt: 'Identify the top 5 most common ticket types, show frequency trends, and recommend preventive actions' },
    { label: 'Response Time', prompt: 'Calculate average first-response and resolution times by priority level, identify slowest categories, and show agent performance' },
  ],
  contracts: [
    { label: 'Expiring Contracts', prompt: 'Show total contract value by type, identify contracts expiring soon, and flag auto-renewing contracts for review' },
    { label: 'Vendor Spending', prompt: 'Analyze vendor contract spending distribution, compare payment terms, and identify renegotiation opportunities' },
    { label: 'Renewal Pipeline', prompt: 'Show contracts up for renewal in 30/60/90 days, total renewal value, and identify critical vs nice-to-have contracts' },
    { label: 'Type Distribution', prompt: 'Break down contracts by type (service, license, lease), show value distribution, and identify concentration risks' },
  ],
  expenses: [
    { label: 'Category Breakdown', prompt: 'Show expense totals by category and department, identify top spenders, and flag rejected or pending reimbursements' },
    { label: 'Travel vs Non-Travel', prompt: 'Analyze travel vs non-travel expenses, compare spending patterns across months, and identify policy violations' },
    { label: 'Approval Bottleneck', prompt: 'Show average time from submission to approval, identify slowest approvers, and flag old pending claims' },
    { label: 'Employee Spending', prompt: 'Rank employees by total expense claims, compare to department averages, and identify unusual spending patterns' },
  ],
  timesheet: [
    { label: 'Hours by Department', prompt: 'Show total hours by department and project, overtime trends, and identify employees with unusual work patterns' },
    { label: 'Approval Status', prompt: 'Calculate average hours per employee, approval rates, and flag any rejected or pending timesheets' },
    { label: 'Overtime Hotspots', prompt: 'Identify teams and individuals with the most overtime, calculate overtime costs, and show trends over time' },
    { label: 'Project Time Allocation', prompt: 'Break down hours by project, show which projects consume the most time, and identify over/under-allocated resources' },
  ],
  documents: [
    { label: 'Document Inventory', prompt: 'Show document inventory by type and category, identify outdated documents, and flag drafts needing review' },
    { label: 'Access & Popularity', prompt: 'Analyze access level distribution, most viewed documents, and departments with the most documentation' },
    { label: 'Stale Content', prompt: 'Identify documents not reviewed in 6+ months, show version history, and recommend review priority' },
    { label: 'Department Coverage', prompt: 'Show which departments have the most vs least documentation, identify gaps, and suggest needed documents' },
  ],
  notifications: [
    { label: 'Volume by Type', prompt: 'Show notification volume by type and priority, identify modules generating the most alerts, and flag unread critical notices' },
    { label: 'Alert Patterns', prompt: 'Analyze notification patterns over time, dismissed vs active rates, and identify recurring alert sources' },
    { label: 'Critical Unread', prompt: 'List all unread critical and high-priority notifications, show how long they have been unread, and identify at-risk items' },
    { label: 'Module Noise', prompt: 'Identify which modules generate the most notifications, analyze signal-to-noise ratio, and suggest notification tuning' },
  ],
  vendors: [
    { label: 'Top Vendors', prompt: 'Rank vendors by rating and annual spend, identify underperforming vendors, and flag contracts expiring soon' },
    { label: 'Category Distribution', prompt: 'Analyze vendor distribution by category, compare payment terms, and identify single-source dependencies' },
    { label: 'Risk Assessment', prompt: 'Identify vendors with low ratings or suspended status, show dependency level, and recommend mitigation actions' },
    { label: 'Spend Concentration', prompt: 'Show what percentage of total spend goes to top 5 vendors, identify diversification opportunities, and compare pricing' },
  ],
  tax: [
    { label: 'Liability Summary', prompt: 'Show tax liability summary by type and jurisdiction, flag overdue filings, and calculate total pending obligations' },
    { label: 'Filing Calendar', prompt: 'Show upcoming filing deadlines, identify items at risk of being late, and calculate total amounts due this quarter' },
    { label: 'Rate Comparison', prompt: 'Compare tax rates and amounts across periods, identify filing deadlines, and track year-over-year changes' },
    { label: 'Overdue Filings', prompt: 'List all overdue tax filings, show penalty exposure, and prioritize by amount and urgency' },
  ],
  'cash-management': [
    { label: 'Cash Flow Summary', prompt: 'Show cash flow summary: deposits vs withdrawals, balance trends, and flag any unusual or large transactions' },
    { label: 'Liquidity Position', prompt: 'Analyze transaction volume by account and currency, identify pending transfers, and show liquidity position' },
    { label: 'Currency Exposure', prompt: 'Show balances by currency, analyze conversion transactions, and identify foreign exchange risks' },
    { label: 'Bank Account Health', prompt: 'Compare balances across bank accounts, identify low-balance accounts, and show transaction volume per account' },
  ],
  'fixed-assets': [
    { label: 'Depreciation Summary', prompt: 'Show total asset value vs accumulated depreciation, identify fully depreciated assets, and calculate remaining useful life summary' },
    { label: 'Class Analysis', prompt: 'Analyze assets by class and depreciation method, flag items under review, and project next-year depreciation expense' },
    { label: 'Replacement Schedule', prompt: 'Identify assets nearing end of useful life, estimate replacement costs, and create a prioritized replacement timeline' },
    { label: 'Department Allocation', prompt: 'Show asset value distribution by department, identify departments with oldest assets, and recommend capital allocation' },
  ],
  benefits: [
    { label: 'Enrollment Overview', prompt: 'Show enrollment rates by plan type, total employer cost, and identify plans approaching max enrollment' },
    { label: 'Cost Analysis', prompt: 'Compare employee vs employer cost contributions, flag expiring plans, and analyze coverage level distribution' },
    { label: 'Popular Plans', prompt: 'Rank plans by enrollment count, show utilization vs capacity, and identify undersubscribed plans to consider dropping' },
    { label: 'Renewal Calendar', prompt: 'Show plan renewal dates, total annual benefits cost, and flag plans needing renegotiation' },
  ],
  'leave-management': [
    { label: 'Usage by Type', prompt: 'Show leave utilization by type and department, identify peak absence periods, and flag employees with low remaining balances' },
    { label: 'Approval Rates', prompt: 'Analyze approval vs rejection rates, average days per request, and identify departments with highest absenteeism' },
    { label: 'Balance Alerts', prompt: 'Identify employees at risk of losing unused leave, show average balance remaining, and recommend end-of-year planning' },
    { label: 'Coverage Impact', prompt: 'Show upcoming approved leaves, identify days with multiple absences in same team, and flag coverage gaps' },
  ],
  'performance-reviews': [
    { label: 'Rating Distribution', prompt: 'Show rating distribution across departments, identify top performers, and flag employees needing improvement plans' },
    { label: 'Goals Analysis', prompt: 'Analyze goals-met percentages by department, compare reviewer scoring patterns, and identify overdue reviews' },
    { label: 'Promotion Candidates', prompt: 'Identify top-rated employees across departments, show their trajectory, and recommend promotion candidates' },
    { label: 'Review Completion', prompt: 'Show review completion rates by department, identify overdue reviews, and flag managers behind on their reviews' },
  ],
  marketing: [
    { label: 'Campaign ROI Rankings', prompt: 'Show campaign ROI rankings, total spend vs leads generated, and identify the most effective channels' },
    { label: 'Budget Utilization', prompt: 'Compare budget utilization across campaigns, analyze conversion rates by campaign type, and flag underperforming campaigns' },
    { label: 'Channel Effectiveness', prompt: 'Rank marketing channels by lead generation and cost per lead, identify best and worst performing channels' },
    { label: 'Active vs Completed', prompt: 'Compare active campaigns to completed ones, show trending metrics, and identify campaigns to scale or pause' },
  ],
  'work-orders': [
    { label: 'Backlog by Priority', prompt: 'Show work order backlog by priority, average completion time, and identify overdue or stalled work orders' },
    { label: 'Maintenance Costs', prompt: 'Analyze maintenance costs by type, compare estimated vs actual hours, and identify assets needing frequent repairs' },
    { label: 'Team Workload', prompt: 'Show work order distribution by team, identify overloaded vs underutilized teams, and recommend rebalancing' },
    { label: 'Completion Trends', prompt: 'Show work order completion trends over time, identify improving vs worsening areas, and calculate first-time fix rates' },
  ],
  warehouse: [
    { label: 'Utilization Rates', prompt: 'Show utilization rates across warehouses, identify facilities at capacity, and flag underutilized spaces' },
    { label: 'Operating Costs', prompt: 'Compare operating costs per sqft, analyze temperature-controlled vs standard capacity, and identify expansion needs' },
    { label: 'Capacity Planning', prompt: 'Show current vs max capacity by warehouse, project when facilities will reach capacity, and recommend actions' },
    { label: 'Special Requirements', prompt: 'Analyze hazmat and temperature-controlled needs, identify gaps in specialized storage, and show compliance status' },
  ],
  returns: [
    { label: 'Return Rates', prompt: 'Show return rates by product and reason, total refund exposure, and identify products with the highest return frequency' },
    { label: 'Processing Time', prompt: 'Analyze return processing times, compare refund vs exchange vs replacement rates, and flag denied returns needing review' },
    { label: 'Root Cause', prompt: 'Identify top reasons for returns, group by product category, and recommend quality improvements to reduce returns' },
    { label: 'Financial Impact', prompt: 'Calculate total refund amount by status, show pending refund liability, and compare return costs to revenue' },
  ],
  pricing: [
    { label: 'Quote Pipeline', prompt: 'Show quote pipeline value by status, average discount rates, and identify quotes expiring soon that need follow-up' },
    { label: 'Win/Loss Analysis', prompt: 'Analyze win/loss rates, compare pricing across products, and identify sales reps with the highest quote-to-close ratios' },
    { label: 'Discount Patterns', prompt: 'Analyze discount percentages by product and customer, identify over-discounting patterns, and calculate revenue impact' },
    { label: 'Expiring Quotes', prompt: 'List all quotes expiring within 30 days, show total at-risk revenue, and prioritize follow-up actions' },
  ],
  'risk-management': [
    { label: 'Risk Heat Map', prompt: 'Show risk heat map: count by likelihood vs impact, identify top unmitigated risks, and flag overdue review dates' },
    { label: 'Mitigation Progress', prompt: 'Analyze risk distribution by category and department, track mitigation progress, and identify emerging risk patterns' },
    { label: 'Top Risks', prompt: 'List top 10 risks by score, show their mitigation status, and identify owners responsible for resolution' },
    { label: 'Department Exposure', prompt: 'Show risk exposure by department, identify teams with the most critical risks, and recommend risk reduction priorities' },
  ],
  'audit-trail': [
    { label: 'Activity Summary', prompt: 'Show activity summary by action type, identify users with the most activity, and flag any suspicious or critical events' },
    { label: 'Security Events', prompt: 'Analyze failed login patterns, data modification frequency by module, and identify after-hours or unusual access patterns' },
    { label: 'User Behavior', prompt: 'Compare activity levels across users, identify inactive vs hyperactive accounts, and flag unusual behavior changes' },
    { label: 'Module Activity', prompt: 'Show which modules have the most audit events, identify high-change areas, and flag modules with critical events' },
  ],
  'user-management': [
    { label: 'Access Level Audit', prompt: 'Show user distribution by role and access level, identify inactive accounts, and flag users with 2FA disabled' },
    { label: 'Login Patterns', prompt: 'Analyze login frequency patterns, identify locked accounts, and show password expiration timeline' },
    { label: 'Security Posture', prompt: 'Show percentage of users with 2FA enabled, identify high-privilege accounts without 2FA, and flag expiring passwords' },
    { label: 'Account Cleanup', prompt: 'Identify suspended, disabled, or never-logged-in accounts, recommend accounts for deprovisioning, and show last activity dates' },
  ],
  'knowledge-base': [
    { label: 'Popular Content', prompt: 'Show most viewed articles, identify outdated content needing review, and analyze coverage gaps by category' },
    { label: 'Content Quality', prompt: 'Compare helpful vote rates across categories, identify low-traffic articles, and flag drafts needing publication' },
    { label: 'Coverage Gaps', prompt: 'Analyze which departments and topics have the least documentation, identify frequently asked topics without articles' },
    { label: 'Stale Articles', prompt: 'List articles not reviewed in 6+ months, show their view counts, and prioritize which to update or archive' },
  ],
  shipping: [
    { label: 'Status Overview', prompt: 'Show shipment status distribution, average cost by carrier and service level, and flag delayed deliveries' },
    { label: 'Carrier Comparison', prompt: 'Analyze shipping volume trends, compare carrier performance, and identify routes with the highest costs' },
    { label: 'On-Time Rate', prompt: 'Calculate on-time delivery percentages by carrier and service level, identify worst performing routes' },
    { label: 'Cost Optimization', prompt: 'Compare costs across carriers for similar routes, identify cheaper alternatives, and calculate potential savings' },
  ],
};

function getStatusBadge(status) {
  const map = {
    completed: 'badge-success', active: 'badge-success', delivered: 'badge-success', in_stock: 'badge-success', closed_won: 'badge-success',
    paid: 'badge-success', posted: 'badge-success', filed: 'badge-success', resolved: 'badge-success', closed: 'badge-success',
    hired: 'badge-success', processed: 'badge-success', reimbursed: 'badge-success',
    in_progress: 'badge-info', processing: 'badge-info', in_transit: 'badge-info', qualified: 'badge-info', shipped: 'badge-info',
    in_production: 'badge-info', second_interview: 'badge-info', outstanding: 'badge-info',
    pending: 'badge-warning', draft: 'badge-warning', planning: 'badge-warning', lead: 'badge-warning', on_leave: 'badge-warning',
    low_stock: 'badge-warning', approved: 'badge-warning', expiring_soon: 'badge-warning', submitted: 'badge-warning',
    upcoming: 'badge-info', interview_scheduled: 'badge-info', screening: 'badge-info', offer_extended: 'badge-info', scheduled: 'badge-info',
    cancelled: 'badge-danger', terminated: 'badge-danger', overdue: 'badge-danger', out_of_stock: 'badge-danger', closed_lost: 'badge-danger',
    retired: 'badge-danger', rejected: 'badge-danger', expired: 'badge-danger', suspended: 'badge-danger', frozen: 'badge-danger',
    written_off: 'badge-danger', under_review: 'badge-warning',
    negotiation: 'badge-info', proposal: 'badge-info', on_hold: 'badge-warning', open: 'badge-warning',
    critical: 'badge-danger', high: 'badge-warning', medium: 'badge-info', low: 'badge-default', normal: 'badge-default',
    maintenance: 'badge-warning', disposed: 'badge-danger', returned: 'badge-danger',
    info: 'badge-info', warning: 'badge-warning', alert: 'badge-danger', success: 'badge-success', action: 'badge-info',
    true: 'badge-success', false: 'badge-default', reversed: 'badge-danger',
    pending_review: 'badge-warning', inactive: 'badge-default', dismissed: 'badge-default', archived: 'badge-default',
    mitigating: 'badge-info', monitoring: 'badge-info', identified: 'badge-warning', acknowledged: 'badge-info',
    flagged: 'badge-danger', reviewed: 'badge-success', logged: 'badge-default', sent: 'badge-info',
    accepted: 'badge-success', fully_depreciated: 'badge-default',
    published: 'badge-success', disabled: 'badge-danger', planned: 'badge-warning',
  };
  return map[status] || 'badge-default';
}

function formatFieldLabel(name) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatValue(name, val) {
  if (val === null || val === undefined) return '—';
  if (name.includes('amount') || name.includes('cost') || name.includes('price') || name.includes('salary') || name.includes('value') || name.includes('budget')) {
    return `$${Number(val).toLocaleString()}`;
  }
  if (name.includes('date') && val) {
    return new Date(val).toLocaleDateString();
  }
  if (name === 'completion_pct') return `${val}%`;
  return String(val);
}

const APPROVAL_MODULES = ['expenses', 'timesheet', 'leave-management', 'procurement', 'budgets', 'finance', 'accounts-payable', 'returns'];

export default function ModulePage({ module, title, user }) {
  const config = MODULE_CONFIG[module];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPanel, setAiPanel] = useState(null); // 'summary' | 'insights' | null
  const [aiResponse, setAiResponse] = useState('');
  const [aiDescription, setAiDescription] = useState('');

  const [aiSummaryPrompt, setAiSummaryPrompt] = useState('');
  const [showAiSummaryPrompt, setShowAiSummaryPrompt] = useState(false);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await api.getAll(module);
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    setSelectedItem(null);
    setShowModal(false);
    setEditItem(null);
    setSearch('');
  }, [module]);

  const handleCreate = () => {
    setEditItem(null);
    setFormData({});
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    const data = {};
    config.fields.forEach(f => {
      let val = item[f.name];
      if (f.type === 'date' && val) val = val.split('T')[0];
      data[f.name] = val || '';
    });
    setFormData(data);
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editItem) {
        await api.update(module, editItem.id, formData);
      } else {
        await api.create(module, formData);
      }
      setShowModal(false);
      setSelectedItem(null);
      loadItems();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete "${config.itemLabel(item)}"?`)) return;
    try {
      await api.delete(module, item.id);
      setSelectedItem(null);
      loadItems();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleApprove = async (item) => {
    if (!confirm(`Approve "${config.itemLabel(item)}"?`)) return;
    try {
      await api.approve(module, item.id);
      setSelectedItem(null);
      loadItems();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReject = async (item) => {
    if (!confirm(`Reject "${config.itemLabel(item)}"?`)) return;
    try {
      await api.reject(module, item.id);
      setSelectedItem(null);
      loadItems();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleChangeStatus = async (item, newStatus) => {
    try {
      await api.update(module, item.id, { ...item, status: newStatus });
      setSelectedItem(null);
      loadItems();
    } catch (err) {
      alert(err.message);
    }
  };

  const userRole = user?.role || 'user';
  const isAdminOrManager = userRole === 'admin' || userRole === 'manager';
  const isApprovalModule = APPROVAL_MODULES.includes(module);

  const canApprove = (item) => {
    return isApprovalModule && isAdminOrManager && item.status && ['pending', 'submitted', 'draft'].includes(item.status);
  };

  const canEdit = (item) => {
    if (userRole === 'admin') return true;
    if (userRole === 'manager') return true;
    // user role: can only edit own pending records
    return item.created_by === user?.name && (!item.status || ['pending', 'draft', 'submitted'].includes(item.status));
  };

  const canDelete = (item) => {
    if (userRole === 'admin') return true;
    // manager/user: can only delete own pending records
    return item.created_by === user?.name && (!item.status || ['pending', 'draft', 'submitted'].includes(item.status));
  };

  const statusField = config.fields.find(f => f.name === 'status');
  const statusOptions = statusField?.options || [];

  const filteredItems = items.filter(item => {
    if (!search) return true;
    const s = search.toLowerCase();
    return Object.values(item).some(v => String(v).toLowerCase().includes(s));
  });

  const handleAiFill = async () => {
    if (!aiDescription.trim()) return;
    setAiLoading(true);
    try {
      const result = await api.aiFillFields(module, title, config.fields, aiDescription, formData);
      if (result.fields && Object.keys(result.fields).length > 0) {
        setFormData(prev => ({ ...prev, ...result.fields }));
        setAiDescription('');
      }
    } catch (err) {
      alert('AI Fill failed: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiSummarize = async (prompt) => {
    setAiLoading(true);
    setAiPanel('summary');
    setAiResponse('');
    setShowAiSummaryPrompt(false);
    try {
      const recordsToSend = items.slice(0, 50);
      const result = await api.aiSummarizeRecords(module, title, recordsToSend, items.length, prompt || aiSummaryPrompt || '');
      setAiResponse(result.response);
    } catch (err) {
      setAiResponse('**Error:** ' + err.message);
    } finally {
      setAiLoading(false);
      setAiSummaryPrompt('');
    }
  };

  const handleAiRecordSummary = async (item) => {
    setAiPanel(null);
    setAiResponse('');
    await new Promise(r => setTimeout(r, 0));
    setAiLoading(true);
    setAiPanel('record-summary');
    try {
      const result = await api.aiRecordSummary(module, title, item);
      setAiResponse(result.response);
    } catch (err) {
      setAiResponse('**Error:** ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiInsights = async (item) => {
    setAiPanel(null);
    setAiResponse('');
    await new Promise(r => setTimeout(r, 0));
    setAiLoading(true);
    setAiPanel('insights');
    try {
      const result = await api.aiRecordInsights(module, title, item, items);
      setAiResponse(result.response);
    } catch (err) {
      setAiResponse('**Error:** ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  // List view (always shown) with detail popup overlay
  return (
    <div>
      <div className="page-header">
        <div>
          <h2>{title}</h2>
          <p>{items.length} records found</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ai" onClick={() => setShowAiSummaryPrompt(!showAiSummaryPrompt)} disabled={aiLoading || items.length === 0}>
            {aiLoading && aiPanel === 'summary' ? 'Analyzing...' : 'AI Summarize'}
          </button>
          <button className="btn btn-primary" onClick={handleCreate}>+ New {title.split(' ')[0]}</button>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder={`Search ${title.toLowerCase()}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {showAiSummaryPrompt && !aiPanel && (
        <div className="ai-summary-prompt-panel">
          <div className="ai-result-header">
            <span>AI Records Summary — What would you like to analyze?</span>
            <button className="btn btn-secondary btn-sm" onClick={() => { setShowAiSummaryPrompt(false); setAiSummaryPrompt(''); }}>Close</button>
          </div>
          <div style={{ padding: 16 }}>
            <textarea
              className="form-control"
              placeholder="Describe what you want to analyze, or pick a sample below... (leave empty for a general summary)"
              value={aiSummaryPrompt}
              onChange={e => setAiSummaryPrompt(e.target.value)}
              rows={2}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAiSummarize(); } }}
            />
            {AI_SUMMARY_SAMPLES[module] && (
              <div className="ai-sample-buttons">
                <span className="ai-sample-label">Samples:</span>
                {AI_SUMMARY_SAMPLES[module].map((sample, i) => (
                  <button
                    key={i}
                    className="ai-sample-btn"
                    onClick={() => setAiSummaryPrompt(sample.prompt)}
                    title={sample.prompt}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn-primary btn-sm" onClick={() => handleAiSummarize()} disabled={aiLoading}>
                {aiLoading ? 'Analyzing...' : `Analyze ${items.length} Records`}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setShowAiSummaryPrompt(false); setAiSummaryPrompt(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {aiPanel === 'summary' && (
        <div className="ai-result-panel">
          <div className="ai-result-header">
            <span>AI Summary — {title}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => { setAiPanel(null); setAiResponse(''); }}>Close</button>
          </div>
          <div className="ai-result-content">
            {aiLoading && !aiResponse ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
                <div className="spinner" style={{ width: 20, height: 20 }} />
                <span style={{ color: 'var(--text-secondary)' }}>Analyzing {items.length} records...</span>
              </div>
            ) : (
              <ReactMarkdown>{aiResponse}</ReactMarkdown>
            )}
          </div>
        </div>
      )}

      {error && <div className="login-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {config.columns.map(col => (
                <th key={col}>{config.columnLabels[col]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr><td colSpan={config.columns.length} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No records found</td></tr>
            ) : (
              filteredItems.map(item => (
                <tr key={item.id} onClick={() => setSelectedItem(item)}>
                  {config.columns.map(col => (
                    <td key={col}>
                      {(col === 'status' || col === 'risk_level' || col === 'priority' || col === 'stage') ? (
                        <span className={`badge ${getStatusBadge(item[col])}`}>
                          {String(item[col] || '').replace(/_/g, ' ')}
                        </span>
                      ) : (
                        <span>{config.formatCell(col, item[col])}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Popup Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal modal-detail" onClick={e => e.stopPropagation()}>
            <div className="detail-header">
              <h3>{config.itemLabel(selectedItem)}</h3>
              <div className="detail-actions">
                {canApprove(selectedItem) && (
                  <button className="btn btn-approve btn-sm" onClick={() => handleApprove(selectedItem)}>Approve</button>
                )}
                {canApprove(selectedItem) && (
                  <button className="btn btn-reject btn-sm" onClick={() => handleReject(selectedItem)}>Reject</button>
                )}
                {isAdminOrManager && statusOptions.length > 0 && (
                  <select
                    className="status-dropdown"
                    value={selectedItem.status || ''}
                    onChange={e => handleChangeStatus(selectedItem, e.target.value)}
                  >
                    <option value="" disabled>Change Status</option>
                    {statusOptions.map(opt => (
                      <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                )}
                <button className="btn btn-ai btn-sm" onClick={() => handleAiRecordSummary(selectedItem)} disabled={aiLoading && aiPanel === 'record-summary'}>
                  {aiLoading && aiPanel === 'record-summary' ? 'Summarizing...' : 'AI Summary'}
                </button>
                <button className="btn btn-ai btn-sm" onClick={() => handleAiInsights(selectedItem)} disabled={aiLoading && aiPanel === 'insights'}>
                  {aiLoading && aiPanel === 'insights' ? 'Analyzing...' : 'AI Insights'}
                </button>
                {canEdit(selectedItem) && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleEdit(selectedItem)}>Edit</button>
                )}
                {canDelete(selectedItem) && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedItem)}>Delete</button>
                )}
                <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedItem(null); setAiPanel(null); setAiResponse(''); }}>Close</button>
              </div>
            </div>
            {(aiPanel === 'record-summary' || aiPanel === 'insights') && (
              <div className="ai-insights-panel">
                <div className="ai-result-header">
                  <span>{aiPanel === 'record-summary' ? 'AI Summary' : 'AI Insights'}</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => { setAiPanel(null); setAiResponse(''); }}>Close</button>
                </div>
                <div className="ai-result-content">
                  {aiLoading && !aiResponse ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
                      <div className="spinner" style={{ width: 20, height: 20 }} />
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {aiPanel === 'record-summary' ? 'Summarizing record...' : 'Analyzing record...'}
                      </span>
                    </div>
                  ) : (
                    <ReactMarkdown>{aiResponse}</ReactMarkdown>
                  )}
                </div>
              </div>
            )}
            <div className="detail-grid">
              {config.detailFields.map(field => (
                <div key={field} className="detail-field">
                  <label>{formatFieldLabel(field)}</label>
                  <div className="value">
                    {(field === 'status' || field === 'risk_level' || field === 'priority' || field === 'stage') ? (
                      <span className={`badge ${getStatusBadge(selectedItem[field])}`}>
                        {String(selectedItem[field] || '').replace(/_/g, ' ')}
                      </span>
                    ) : formatValue(field, selectedItem[field])}
                  </div>
                </div>
              ))}
              <div className="detail-field">
                <label>Created At</label>
                <div className="value">{selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString() : '—'}</div>
              </div>
              <div className="detail-field">
                <label>Updated At</label>
                <div className="value">{selectedItem.updated_at ? new Date(selectedItem.updated_at).toLocaleString() : '—'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Edit' : 'New'} {title.split(' ')[0]}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <div className="ai-fill-section">
              <textarea
                className="form-control"
                placeholder={`e.g. "New Dell laptop for engineering, $1200, SKU LAP-001" or describe the record in natural language...`}
                value={aiDescription}
                onChange={e => setAiDescription(e.target.value)}
                rows={3}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAiFill(); } }}
              />
              {AI_FILL_SAMPLES[module] && (
                <div className="ai-sample-buttons">
                  <span className="ai-sample-label">Samples:</span>
                  {AI_FILL_SAMPLES[module].map((sample, i) => (
                    <button
                      key={i}
                      className="ai-sample-btn"
                      onClick={() => setAiDescription(sample.prompt)}
                      title={sample.prompt}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={handleAiFill} disabled={aiLoading || !aiDescription.trim()}>
                  {aiLoading ? 'Filling...' : 'Fill Fields'}
                </button>
              </div>
            </div>
            {config.fields.map(field => (
              <div key={field.name} className="form-group">
                <label>{field.label} {field.required && '*'}</label>
                {field.type === 'select' ? (
                  <select
                    className="form-control"
                    value={formData[field.name] || ''}
                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                  >
                    <option value="">Select...</option>
                    {field.options.map(opt => (
                      <option key={opt} value={opt}>{opt.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    className="form-control"
                    value={formData[field.name] || ''}
                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.label}
                  />
                ) : (
                  <input
                    type={field.type}
                    className="form-control"
                    value={formData[field.name] || ''}
                    onChange={e => setFormData({ ...formData, [field.name]: e.target.value })}
                    placeholder={field.label}
                    required={field.required}
                  />
                )}
              </div>
            ))}
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{editItem ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
