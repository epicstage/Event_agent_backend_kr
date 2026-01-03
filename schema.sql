-- Event Agent D1 Database Schema
-- CMP-IS Domain D: Financial Management

-- Budget Line Items
CREATE TABLE IF NOT EXISTS budget_items (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    vendor_name TEXT,
    cost_type TEXT DEFAULT 'variable',
    unit_cost REAL NOT NULL,
    quantity REAL DEFAULT 1,
    projected_amount REAL NOT NULL,
    actual_amount REAL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'draft',
    payment_due_date TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Sponsorship Packages
CREATE TABLE IF NOT EXISTS sponsorship_packages (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    tier TEXT NOT NULL,
    tier_name TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    benefits TEXT, -- JSON array stored as text
    max_sponsors INTEGER DEFAULT 1,
    sold_count INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1
);

-- Sponsors
CREATE TABLE IF NOT EXISTS sponsors (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    contact_phone TEXT,
    package_id TEXT,
    status TEXT DEFAULT 'prospect',
    committed_amount REAL DEFAULT 0,
    support_type TEXT,
    contract_signed_at TEXT,
    fulfillment_rate REAL DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (package_id) REFERENCES sponsorship_packages(id)
);

-- Financial Reports
CREATE TABLE IF NOT EXISTS financial_reports (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    report_name TEXT NOT NULL,
    report_date TEXT NOT NULL,
    period_start TEXT NOT NULL,
    period_end TEXT NOT NULL,
    currency TEXT DEFAULT 'USD',
    total_registration_revenue REAL DEFAULT 0,
    total_sponsorship_revenue REAL DEFAULT 0,
    total_exhibit_revenue REAL DEFAULT 0,
    total_other_revenue REAL DEFAULT 0,
    total_budget REAL NOT NULL,
    total_actual REAL NOT NULL,
    total_attendees INTEGER DEFAULT 0,
    paid_attendees INTEGER DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_budget_items_event_id ON budget_items(event_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_category ON budget_items(category);
CREATE INDEX IF NOT EXISTS idx_budget_items_status ON budget_items(status);
CREATE INDEX IF NOT EXISTS idx_sponsors_status ON sponsors(status);
CREATE INDEX IF NOT EXISTS idx_financial_reports_event_id ON financial_reports(event_id);
