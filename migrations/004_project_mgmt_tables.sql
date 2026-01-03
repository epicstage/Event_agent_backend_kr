-- =============================================================================
-- Migration 004: Project Management Tables
-- Domain B: Project Management (CMP-IS)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. project_tasks: 프로젝트 태스크 관리
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_tasks (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    event_id TEXT NOT NULL,

    -- 태스크 기본 정보
    task_name TEXT NOT NULL,
    task_code TEXT,                          -- PRJ-T001 형식
    description TEXT,

    -- 분류
    category TEXT CHECK(category IN (
        'planning', 'logistics', 'marketing', 'registration',
        'production', 'catering', 'technical', 'security', 'other'
    )) DEFAULT 'other',
    priority TEXT CHECK(priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',

    -- 일정
    planned_start_date TEXT,                 -- ISO 8601
    planned_end_date TEXT,
    actual_start_date TEXT,
    actual_end_date TEXT,
    duration_days INTEGER,

    -- 상태
    status TEXT CHECK(status IN (
        'not_started', 'in_progress', 'blocked', 'completed', 'cancelled'
    )) DEFAULT 'not_started',
    completion_percentage INTEGER DEFAULT 0 CHECK(completion_percentage >= 0 AND completion_percentage <= 100),

    -- 의존성
    parent_task_id TEXT REFERENCES project_tasks(id),
    dependencies TEXT,                       -- JSON array of task IDs

    -- 담당자
    assigned_to TEXT,                        -- User ID or name
    team TEXT,

    -- 메타
    notes TEXT,
    tags TEXT,                               -- JSON array
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_event ON project_tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_category ON project_tasks(category);
CREATE INDEX IF NOT EXISTS idx_project_tasks_priority ON project_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_project_tasks_dates ON project_tasks(planned_start_date, planned_end_date);

-- -----------------------------------------------------------------------------
-- 2. resource_allocations: 자원(인력/장비) 배정
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS resource_allocations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    event_id TEXT NOT NULL,
    task_id TEXT REFERENCES project_tasks(id),

    -- 자원 정보
    resource_type TEXT CHECK(resource_type IN (
        'human', 'equipment', 'venue', 'material', 'vehicle', 'other'
    )) NOT NULL,
    resource_name TEXT NOT NULL,
    resource_id TEXT,                        -- 외부 시스템 연동용

    -- 배정 상세
    quantity INTEGER DEFAULT 1,
    unit TEXT,                               -- 'hours', 'days', 'units'

    -- 일정
    allocation_start TEXT,
    allocation_end TEXT,

    -- 비용
    hourly_rate REAL,
    daily_rate REAL,
    total_cost REAL,
    currency TEXT DEFAULT 'KRW',

    -- 상태
    status TEXT CHECK(status IN (
        'planned', 'confirmed', 'in_use', 'released', 'cancelled'
    )) DEFAULT 'planned',

    -- 인력 관련 (resource_type = 'human')
    role TEXT,
    skills TEXT,                             -- JSON array
    contact_info TEXT,

    -- 장비 관련 (resource_type = 'equipment')
    equipment_specs TEXT,
    condition TEXT CHECK(condition IN ('new', 'good', 'fair', 'poor')),

    -- 메타
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_resource_alloc_event ON resource_allocations(event_id);
CREATE INDEX IF NOT EXISTS idx_resource_alloc_task ON resource_allocations(task_id);
CREATE INDEX IF NOT EXISTS idx_resource_alloc_type ON resource_allocations(resource_type);
CREATE INDEX IF NOT EXISTS idx_resource_alloc_status ON resource_allocations(status);

-- -----------------------------------------------------------------------------
-- 3. vendor_contracts: 벤더/외주 계약 관리
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendor_contracts (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    event_id TEXT NOT NULL,

    -- 벤더 정보
    vendor_name TEXT NOT NULL,
    vendor_type TEXT CHECK(vendor_type IN (
        'catering', 'av_equipment', 'decoration', 'entertainment',
        'security', 'transportation', 'venue', 'photography',
        'printing', 'staffing', 'technology', 'other'
    )),
    vendor_contact TEXT,
    vendor_email TEXT,
    vendor_phone TEXT,

    -- 계약 정보
    contract_number TEXT,
    contract_type TEXT CHECK(contract_type IN (
        'fixed_price', 'time_and_materials', 'cost_plus', 'retainer'
    )),
    contract_start_date TEXT,
    contract_end_date TEXT,

    -- 금액
    contract_value REAL,
    currency TEXT DEFAULT 'KRW',
    payment_terms TEXT,                      -- 'NET30', '50-50', etc.
    deposit_amount REAL,
    deposit_paid INTEGER DEFAULT 0,          -- boolean

    -- 마일스톤
    milestones TEXT,                         -- JSON array: [{name, due_date, amount, status}]

    -- 상태
    status TEXT CHECK(status IN (
        'draft', 'pending_approval', 'active', 'completed',
        'terminated', 'disputed'
    )) DEFAULT 'draft',

    -- 문서
    contract_document_url TEXT,
    attachments TEXT,                        -- JSON array of URLs

    -- 평가
    performance_rating INTEGER CHECK(performance_rating >= 1 AND performance_rating <= 5),
    performance_notes TEXT,

    -- 메타
    signed_date TEXT,
    signed_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_vendor_contracts_event ON vendor_contracts(event_id);
CREATE INDEX IF NOT EXISTS idx_vendor_contracts_vendor ON vendor_contracts(vendor_name);
CREATE INDEX IF NOT EXISTS idx_vendor_contracts_type ON vendor_contracts(vendor_type);
CREATE INDEX IF NOT EXISTS idx_vendor_contracts_status ON vendor_contracts(status);

-- -----------------------------------------------------------------------------
-- 4. project_milestones: 프로젝트 마일스톤
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_milestones (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    event_id TEXT NOT NULL,

    -- 마일스톤 정보
    milestone_name TEXT NOT NULL,
    milestone_code TEXT,                     -- MS-001 형식
    description TEXT,

    -- 일정
    target_date TEXT NOT NULL,
    actual_date TEXT,

    -- 상태
    status TEXT CHECK(status IN (
        'pending', 'in_progress', 'achieved', 'missed', 'deferred'
    )) DEFAULT 'pending',

    -- 연결
    related_tasks TEXT,                      -- JSON array of task IDs
    deliverables TEXT,                       -- JSON array

    -- 중요도
    is_critical INTEGER DEFAULT 0,           -- boolean
    impact_if_missed TEXT,

    -- 메타
    owner TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_milestones_event ON project_milestones(event_id);
CREATE INDEX IF NOT EXISTS idx_milestones_date ON project_milestones(target_date);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON project_milestones(status);

-- -----------------------------------------------------------------------------
-- 5. project_dependencies: 태스크 의존성 관계
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_dependencies (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    event_id TEXT NOT NULL,

    predecessor_task_id TEXT NOT NULL REFERENCES project_tasks(id),
    successor_task_id TEXT NOT NULL REFERENCES project_tasks(id),

    dependency_type TEXT CHECK(dependency_type IN (
        'finish_to_start',    -- FS: 선행 완료 후 후행 시작
        'start_to_start',     -- SS: 동시 시작
        'finish_to_finish',   -- FF: 동시 완료
        'start_to_finish'     -- SF: 선행 시작 후 후행 완료
    )) DEFAULT 'finish_to_start',

    lag_days INTEGER DEFAULT 0,              -- 지연 일수 (음수 = lead)

    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dependencies_event ON project_dependencies(event_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_predecessor ON project_dependencies(predecessor_task_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_successor ON project_dependencies(successor_task_id);

-- -----------------------------------------------------------------------------
-- 6. project_issues: 이슈/문제 추적
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_issues (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    event_id TEXT NOT NULL,
    task_id TEXT REFERENCES project_tasks(id),

    -- 이슈 정보
    issue_code TEXT,                         -- ISS-001 형식
    title TEXT NOT NULL,
    description TEXT,

    -- 분류
    issue_type TEXT CHECK(issue_type IN (
        'bug', 'blocker', 'risk', 'change_request', 'question', 'other'
    )) DEFAULT 'other',
    priority TEXT CHECK(priority IN ('critical', 'high', 'medium', 'low')) DEFAULT 'medium',
    severity TEXT CHECK(severity IN ('critical', 'major', 'moderate', 'minor')),

    -- 상태
    status TEXT CHECK(status IN (
        'open', 'in_progress', 'resolved', 'closed', 'reopened'
    )) DEFAULT 'open',
    resolution TEXT,

    -- 담당
    reported_by TEXT,
    assigned_to TEXT,

    -- 일정
    reported_date TEXT DEFAULT (datetime('now')),
    due_date TEXT,
    resolved_date TEXT,

    -- 연결
    related_issues TEXT,                     -- JSON array of issue IDs

    -- 메타
    tags TEXT,
    attachments TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_issues_event ON project_issues(event_id);
CREATE INDEX IF NOT EXISTS idx_issues_task ON project_issues(task_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON project_issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_priority ON project_issues(priority);

-- =============================================================================
-- END OF MIGRATION 004
-- =============================================================================
