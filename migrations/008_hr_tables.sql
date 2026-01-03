-- Migration 008: Human Resources Domain Tables
-- CMP-IS Domain F: Human Resources Management
-- Created: 2026-01-03

-- =============================================================================
-- 1. HR STAFF PROFILES (스태프/봉사자 데이터베이스)
-- =============================================================================
CREATE TABLE IF NOT EXISTS hr_staff_profiles (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

    -- Basic Information
    staff_type TEXT NOT NULL CHECK(staff_type IN (
        'full_time', 'part_time', 'contractor', 'volunteer', 'intern', 'temp_agency'
    )),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,

    -- Employment Details
    department TEXT,                      -- "registration", "security", "catering", etc.
    role TEXT NOT NULL,                   -- "Team Lead", "Staff", "Volunteer"
    job_title TEXT,
    hire_date TEXT,
    contract_end_date TEXT,

    -- Skills & Qualifications
    skills TEXT,                          -- JSON array: ["customer_service", "first_aid", "av_tech"]
    certifications TEXT,                  -- JSON array: ["CPR", "Security License", "Food Handler"]
    languages TEXT,                       -- JSON array: ["Korean", "English", "Japanese"]
    experience_years INTEGER DEFAULT 0,

    -- Availability & Preferences
    availability TEXT,                    -- JSON: {"weekdays": true, "weekends": false}
    preferred_roles TEXT,                 -- JSON array
    max_hours_per_week INTEGER,
    min_hourly_rate REAL,

    -- Performance
    rating REAL CHECK(rating >= 0 AND rating <= 5),
    events_worked INTEGER DEFAULT 0,
    total_hours_worked REAL DEFAULT 0,
    last_event_date TEXT,
    reliability_score REAL,               -- 0.0 to 1.0 based on no-shows, late arrivals

    -- Contact & Emergency
    address TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,

    -- Documents
    photo_url TEXT,
    resume_url TEXT,
    id_verified BOOLEAN DEFAULT FALSE,
    background_check_status TEXT CHECK(background_check_status IN (
        'pending', 'passed', 'failed', 'expired', 'not_required'
    )),
    background_check_date TEXT,

    -- Status
    status TEXT DEFAULT 'active' CHECK(status IN (
        'active', 'inactive', 'on_leave', 'terminated', 'blacklisted'
    )),
    notes TEXT,

    -- Audit
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_staff_type ON hr_staff_profiles(staff_type);
CREATE INDEX idx_staff_status ON hr_staff_profiles(status);
CREATE INDEX idx_staff_department ON hr_staff_profiles(department);
CREATE INDEX idx_staff_rating ON hr_staff_profiles(rating);
CREATE INDEX idx_staff_email ON hr_staff_profiles(email);

-- =============================================================================
-- 2. SHIFT SCHEDULES (근무 시간표)
-- =============================================================================
CREATE TABLE IF NOT EXISTS shift_schedules (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

    -- Event Context
    event_id TEXT NOT NULL,
    event_name TEXT,
    venue_id TEXT,

    -- Shift Details
    shift_name TEXT NOT NULL,             -- "Morning Registration", "Evening Security"
    shift_code TEXT,                      -- "REG-AM-01"
    department TEXT NOT NULL,
    role TEXT NOT NULL,

    -- Timing
    shift_date TEXT NOT NULL,             -- YYYY-MM-DD
    start_time TEXT NOT NULL,             -- HH:MM
    end_time TEXT NOT NULL,               -- HH:MM
    break_minutes INTEGER DEFAULT 0,

    -- Staffing Requirements
    required_count INTEGER NOT NULL DEFAULT 1,
    confirmed_count INTEGER DEFAULT 0,
    backup_count INTEGER DEFAULT 0,

    -- Location
    location TEXT,                        -- Specific area within venue
    check_in_point TEXT,

    -- Compensation
    hourly_rate REAL,
    shift_premium REAL DEFAULT 0,         -- Night shift, weekend premium
    meal_provided BOOLEAN DEFAULT FALSE,
    transport_provided BOOLEAN DEFAULT FALSE,

    -- Requirements
    required_skills TEXT,                 -- JSON array
    required_certifications TEXT,         -- JSON array
    dress_code TEXT,
    equipment_provided TEXT,              -- JSON array: ["radio", "tablet", "badge"]

    -- Status
    status TEXT DEFAULT 'open' CHECK(status IN (
        'draft', 'open', 'partially_filled', 'filled', 'overstaffed',
        'in_progress', 'completed', 'cancelled'
    )),

    -- Supervisor
    supervisor_id TEXT,
    supervisor_name TEXT,
    supervisor_contact TEXT,

    -- Notes
    special_instructions TEXT,
    internal_notes TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (supervisor_id) REFERENCES hr_staff_profiles(id)
);

CREATE INDEX idx_shift_event ON shift_schedules(event_id);
CREATE INDEX idx_shift_date ON shift_schedules(shift_date);
CREATE INDEX idx_shift_department ON shift_schedules(department);
CREATE INDEX idx_shift_status ON shift_schedules(status);

-- Shift Assignments (스태프-시프트 매핑)
CREATE TABLE IF NOT EXISTS shift_assignments (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    shift_id TEXT NOT NULL,
    staff_id TEXT NOT NULL,

    -- Assignment Status
    status TEXT DEFAULT 'pending' CHECK(status IN (
        'pending', 'confirmed', 'declined', 'no_show', 'checked_in',
        'checked_out', 'completed', 'cancelled'
    )),

    -- Assignment Type
    assignment_type TEXT DEFAULT 'primary' CHECK(assignment_type IN (
        'primary', 'backup', 'replacement'
    )),

    -- Time Tracking
    scheduled_start TEXT,
    scheduled_end TEXT,
    actual_check_in TEXT,
    actual_check_out TEXT,
    break_taken_minutes INTEGER,

    -- Location Tracking
    check_in_location TEXT,               -- GPS coordinates or zone
    check_out_location TEXT,

    -- Performance
    performance_rating REAL,
    supervisor_notes TEXT,
    issues TEXT,                          -- JSON array of issues

    -- Compensation
    hours_worked REAL,
    overtime_hours REAL DEFAULT 0,
    calculated_pay REAL,
    bonus REAL DEFAULT 0,
    deductions REAL DEFAULT 0,

    -- Notifications
    reminder_sent BOOLEAN DEFAULT FALSE,
    confirmation_sent BOOLEAN DEFAULT FALSE,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(shift_id, staff_id),
    FOREIGN KEY (shift_id) REFERENCES shift_schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES hr_staff_profiles(id)
);

CREATE INDEX idx_assignment_shift ON shift_assignments(shift_id);
CREATE INDEX idx_assignment_staff ON shift_assignments(staff_id);
CREATE INDEX idx_assignment_status ON shift_assignments(status);

-- =============================================================================
-- 3. TRAINING MATERIALS (교육 자료)
-- =============================================================================
CREATE TABLE IF NOT EXISTS training_materials (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

    -- Basic Info
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK(category IN (
        'onboarding', 'safety', 'customer_service', 'technical',
        'role_specific', 'compliance', 'soft_skills', 'emergency'
    )),

    -- Content
    content_type TEXT NOT NULL CHECK(content_type IN (
        'video', 'document', 'presentation', 'quiz', 'interactive',
        'checklist', 'infographic', 'audio'
    )),
    content_url TEXT,
    content_text TEXT,                    -- For text-based materials
    duration_minutes INTEGER,

    -- Targeting
    target_departments TEXT,              -- JSON array: ["all"] or specific departments
    target_roles TEXT,                    -- JSON array
    target_staff_types TEXT,              -- JSON array

    -- Requirements
    is_mandatory BOOLEAN DEFAULT FALSE,
    prerequisites TEXT,                   -- JSON array of training IDs
    passing_score INTEGER,                -- For quizzes, percentage
    max_attempts INTEGER DEFAULT 3,

    -- Versioning
    version TEXT DEFAULT '1.0',
    effective_date TEXT,
    expiry_date TEXT,

    -- Localization
    language TEXT DEFAULT 'ko',
    available_languages TEXT,             -- JSON array

    -- Metadata
    author TEXT,
    approved_by TEXT,
    approved_at TEXT,
    tags TEXT,                            -- JSON array for search

    -- Status
    status TEXT DEFAULT 'draft' CHECK(status IN (
        'draft', 'pending_review', 'active', 'archived', 'deprecated'
    )),

    -- Analytics
    view_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    avg_score REAL,
    avg_completion_time_minutes REAL,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_training_category ON training_materials(category);
CREATE INDEX idx_training_status ON training_materials(status);
CREATE INDEX idx_training_mandatory ON training_materials(is_mandatory);

-- Training Completions (교육 이수 기록)
CREATE TABLE IF NOT EXISTS training_completions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    training_id TEXT NOT NULL,
    staff_id TEXT NOT NULL,

    -- Progress
    status TEXT DEFAULT 'not_started' CHECK(status IN (
        'not_started', 'in_progress', 'completed', 'failed', 'expired'
    )),
    progress_percentage INTEGER DEFAULT 0,

    -- Timing
    started_at TEXT,
    completed_at TEXT,
    time_spent_minutes INTEGER DEFAULT 0,

    -- Assessment
    attempts INTEGER DEFAULT 0,
    score REAL,
    passed BOOLEAN,

    -- Certificate
    certificate_issued BOOLEAN DEFAULT FALSE,
    certificate_url TEXT,
    certificate_expires_at TEXT,

    -- Notes
    notes TEXT,
    feedback TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(training_id, staff_id),
    FOREIGN KEY (training_id) REFERENCES training_materials(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES hr_staff_profiles(id)
);

CREATE INDEX idx_completion_training ON training_completions(training_id);
CREATE INDEX idx_completion_staff ON training_completions(staff_id);
CREATE INDEX idx_completion_status ON training_completions(status);

-- =============================================================================
-- 4. HR BUDGETS (인건비 예산)
-- =============================================================================
CREATE TABLE IF NOT EXISTS hr_budgets (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    event_id TEXT NOT NULL,

    -- Budget Categories
    category TEXT NOT NULL CHECK(category IN (
        'staff_wages', 'volunteer_stipends', 'contractor_fees',
        'overtime', 'bonuses', 'training', 'uniforms',
        'meals', 'transport', 'agency_fees', 'insurance'
    )),

    -- Amounts
    budgeted_amount REAL NOT NULL,
    committed_amount REAL DEFAULT 0,      -- Scheduled/planned spending
    actual_amount REAL DEFAULT 0,         -- Actually spent

    -- Details
    description TEXT,
    cost_center TEXT,

    -- Approval
    approved_by TEXT,
    approved_at TEXT,

    -- Link to Finance Domain
    finance_budget_line_id TEXT,          -- Reference to FIN budget system

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_hr_budget_event ON hr_budgets(event_id);
CREATE INDEX idx_hr_budget_category ON hr_budgets(category);

-- =============================================================================
-- 5. RECRUITMENT CAMPAIGNS (채용 캠페인)
-- =============================================================================
CREATE TABLE IF NOT EXISTS recruitment_campaigns (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    event_id TEXT,

    -- Campaign Details
    title TEXT NOT NULL,
    description TEXT,
    campaign_type TEXT NOT NULL CHECK(campaign_type IN (
        'event_specific', 'general_pool', 'volunteer_drive', 'temp_agency'
    )),

    -- Positions
    positions TEXT NOT NULL,              -- JSON array of position objects
    total_positions_needed INTEGER,
    applications_received INTEGER DEFAULT 0,
    positions_filled INTEGER DEFAULT 0,

    -- Timeline
    start_date TEXT NOT NULL,
    end_date TEXT,
    event_date TEXT,                      -- When staff will be needed

    -- Channels
    posting_channels TEXT,                -- JSON: ["website", "job_board", "social"]
    referral_bonus REAL,

    -- Status
    status TEXT DEFAULT 'draft' CHECK(status IN (
        'draft', 'active', 'paused', 'filled', 'closed', 'cancelled'
    )),

    -- Metrics
    views_count INTEGER DEFAULT 0,
    conversion_rate REAL,                 -- Applications / Views

    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_recruitment_event ON recruitment_campaigns(event_id);
CREATE INDEX idx_recruitment_status ON recruitment_campaigns(status);

-- =============================================================================
-- 6. LABOR COMPLIANCE (노무 컴플라이언스)
-- =============================================================================
CREATE TABLE IF NOT EXISTS labor_compliance_records (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    event_id TEXT NOT NULL,

    -- Compliance Type
    compliance_type TEXT NOT NULL CHECK(compliance_type IN (
        'work_hours', 'break_time', 'overtime', 'minimum_wage',
        'youth_labor', 'safety', 'insurance', 'contract', 'tax'
    )),

    -- Status
    status TEXT DEFAULT 'pending' CHECK(status IN (
        'pending', 'compliant', 'violation', 'remediated', 'exempted'
    )),

    -- Details
    description TEXT,
    regulation_reference TEXT,            -- Law/regulation citation

    -- Violation Details (if applicable)
    violation_details TEXT,
    affected_staff_count INTEGER,
    penalty_risk REAL,

    -- Remediation
    remediation_plan TEXT,
    remediation_deadline TEXT,
    remediated_at TEXT,
    remediated_by TEXT,

    -- Documentation
    documents TEXT,                       -- JSON array of document references

    -- Audit
    checked_by TEXT,
    checked_at TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_compliance_event ON labor_compliance_records(event_id);
CREATE INDEX idx_compliance_type ON labor_compliance_records(compliance_type);
CREATE INDEX idx_compliance_status ON labor_compliance_records(status);
