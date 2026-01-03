-- Migration 007: Agent Orchestration & Learning System
-- 최상위 관리자 전용 감사 및 학습 시스템
-- Created: 2026-01-03

-- =============================================================================
-- 1. AGENT PERFORMANCE LOGS (에이전트 성능 로그)
-- =============================================================================
CREATE TABLE IF NOT EXISTS agent_performance_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

    -- Agent identification
    agent_id TEXT NOT NULL,              -- e.g., "STR-001", "FIN-037", "OPS-022"
    domain TEXT NOT NULL,                -- "strategy", "finance", "project", "marketing", "operations"
    skill TEXT,                          -- e.g., "Skill 1", "Skill 9"

    -- Performance metrics
    invocation_count INTEGER DEFAULT 1,
    total_latency_ms INTEGER NOT NULL,   -- Total execution time
    ai_latency_ms INTEGER,               -- AI enhancement time (if applicable)

    -- Status tracking
    status TEXT NOT NULL CHECK(status IN ('success', 'error', 'timeout', 'validation_failed')),
    error_message TEXT,
    error_code TEXT,

    -- Input/Output summary (not full data for privacy)
    input_size_bytes INTEGER,
    output_size_bytes INTEGER,
    input_hash TEXT,                     -- For deduplication analysis

    -- Context
    session_id TEXT,
    user_id TEXT,
    event_id TEXT,

    -- AI Enhancement metrics
    ai_enhanced BOOLEAN DEFAULT FALSE,
    ai_model TEXT,
    ai_confidence_score REAL,

    -- Timestamps
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_perf_agent ON agent_performance_logs(agent_id);
CREATE INDEX idx_perf_domain ON agent_performance_logs(domain);
CREATE INDEX idx_perf_status ON agent_performance_logs(status);
CREATE INDEX idx_perf_session ON agent_performance_logs(session_id);
CREATE INDEX idx_perf_created ON agent_performance_logs(created_at);

-- Aggregated daily performance (materialized view pattern)
CREATE TABLE IF NOT EXISTS agent_performance_daily (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    agent_id TEXT NOT NULL,
    date TEXT NOT NULL,                  -- YYYY-MM-DD

    -- Aggregated metrics
    total_invocations INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    timeout_count INTEGER DEFAULT 0,

    -- Latency stats
    avg_latency_ms REAL,
    min_latency_ms INTEGER,
    max_latency_ms INTEGER,
    p95_latency_ms INTEGER,

    -- Success rate
    success_rate REAL,                   -- 0.0 to 1.0

    -- AI metrics
    ai_enhanced_count INTEGER DEFAULT 0,
    avg_ai_confidence REAL,

    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(agent_id, date)
);

CREATE INDEX idx_perf_daily_agent ON agent_performance_daily(agent_id);
CREATE INDEX idx_perf_daily_date ON agent_performance_daily(date);

-- =============================================================================
-- 2. KNOWLEDGE BASE UPLOADS (지식 베이스 업로드)
-- =============================================================================
CREATE TABLE IF NOT EXISTS knowledge_base_uploads (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

    -- File metadata
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,             -- "pdf", "docx", "xlsx", "csv", "json", "txt", "md"
    file_size_bytes INTEGER NOT NULL,
    file_hash TEXT NOT NULL,             -- SHA-256 for deduplication

    -- Storage
    storage_key TEXT,                    -- R2/KV storage key
    storage_location TEXT DEFAULT 'kv', -- "kv", "r2", "external"

    -- Content analysis
    content_summary TEXT,                -- AI-generated summary
    extracted_entities TEXT,             -- JSON array of key entities
    language TEXT DEFAULT 'ko',

    -- Domain mapping
    primary_domain TEXT,                 -- Most relevant domain
    related_domains TEXT,                -- JSON array: ["strategy", "finance"]
    related_agents TEXT,                 -- JSON array: ["STR-001", "FIN-037"]
    relevance_scores TEXT,               -- JSON: {"STR-001": 0.85, "FIN-037": 0.72}

    -- Processing status
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN (
        'pending', 'processing', 'analyzed', 'indexed', 'rejected', 'archived'
    )),
    processing_error TEXT,

    -- Learning integration
    is_integrated BOOLEAN DEFAULT FALSE,
    integrated_at TEXT,
    integration_notes TEXT,

    -- CMP Standards compliance
    cmp_standards_checked BOOLEAN DEFAULT FALSE,
    cmp_conflicts TEXT,                  -- JSON array of conflicts if any
    cmp_alignment_score REAL,            -- 0.0 to 1.0

    -- Version control
    version INTEGER DEFAULT 1,
    parent_id TEXT,                      -- For versioned uploads

    -- Audit
    uploaded_by TEXT,                    -- Admin user ID
    approved_by TEXT,
    approved_at TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (parent_id) REFERENCES knowledge_base_uploads(id)
);

CREATE INDEX idx_kb_status ON knowledge_base_uploads(status);
CREATE INDEX idx_kb_domain ON knowledge_base_uploads(primary_domain);
CREATE INDEX idx_kb_file_hash ON knowledge_base_uploads(file_hash);
CREATE INDEX idx_kb_created ON knowledge_base_uploads(created_at);

-- Knowledge-Agent mapping (many-to-many with metadata)
CREATE TABLE IF NOT EXISTS knowledge_agent_mappings (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    knowledge_id TEXT NOT NULL,
    agent_id TEXT NOT NULL,

    -- Mapping metadata
    relevance_score REAL NOT NULL,       -- 0.0 to 1.0
    mapping_type TEXT DEFAULT 'auto' CHECK(mapping_type IN ('auto', 'manual', 'confirmed')),

    -- Usage tracking
    times_referenced INTEGER DEFAULT 0,
    last_referenced_at TEXT,

    -- Effectiveness
    improvement_delta REAL,              -- Performance change after integration

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(knowledge_id, agent_id),
    FOREIGN KEY (knowledge_id) REFERENCES knowledge_base_uploads(id) ON DELETE CASCADE
);

CREATE INDEX idx_kam_knowledge ON knowledge_agent_mappings(knowledge_id);
CREATE INDEX idx_kam_agent ON knowledge_agent_mappings(agent_id);

-- =============================================================================
-- 3. PROMPT HISTORY (프롬프트 변경 이력)
-- =============================================================================
CREATE TABLE IF NOT EXISTS prompt_history (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

    -- Prompt identification
    agent_id TEXT NOT NULL,              -- e.g., "STR-001"
    prompt_type TEXT NOT NULL CHECK(prompt_type IN (
        'system', 'persona', 'instruction', 'output_format', 'example', 'constraint'
    )),

    -- Version control
    version INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,

    -- Content
    prompt_content TEXT NOT NULL,
    prompt_hash TEXT NOT NULL,           -- For quick comparison

    -- Change metadata
    change_type TEXT NOT NULL CHECK(change_type IN (
        'create', 'update', 'rollback', 'a_b_test', 'emergency_fix'
    )),
    change_reason TEXT,
    change_summary TEXT,                 -- Brief description of what changed

    -- Diff from previous version
    diff_from_previous TEXT,             -- JSON diff

    -- A/B Testing
    is_ab_variant BOOLEAN DEFAULT FALSE,
    ab_test_id TEXT,
    ab_variant_name TEXT,                -- "A", "B", "control"
    ab_traffic_percentage INTEGER,       -- 0-100

    -- Performance tracking
    invocations_count INTEGER DEFAULT 0,
    avg_success_rate REAL,
    avg_confidence_score REAL,
    avg_latency_ms REAL,

    -- Approval workflow
    status TEXT DEFAULT 'draft' CHECK(status IN (
        'draft', 'pending_review', 'approved', 'rejected', 'active', 'deprecated'
    )),
    submitted_by TEXT,
    reviewed_by TEXT,
    review_notes TEXT,

    -- Timestamps
    activated_at TEXT,
    deprecated_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_prompt_agent ON prompt_history(agent_id);
CREATE INDEX idx_prompt_type ON prompt_history(prompt_type);
CREATE INDEX idx_prompt_active ON prompt_history(is_active);
CREATE INDEX idx_prompt_version ON prompt_history(agent_id, version);
CREATE INDEX idx_prompt_status ON prompt_history(status);

-- =============================================================================
-- 4. CONFIRMATION GATE (복명복창 승인 대기)
-- =============================================================================
CREATE TABLE IF NOT EXISTS confirmation_requests (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

    -- Request context
    session_id TEXT NOT NULL,
    user_id TEXT,
    event_id TEXT,

    -- Original request
    agent_id TEXT NOT NULL,
    domain TEXT NOT NULL,
    original_input TEXT NOT NULL,        -- JSON

    -- Change details
    change_type TEXT NOT NULL CHECK(change_type IN (
        'high_value',                    -- 금액 1000만원 이상
        'irreversible',                  -- 되돌릴 수 없는 변경
        'cross_domain',                  -- 여러 도메인에 영향
        'policy_change',                 -- 정책/규칙 변경
        'external_integration',          -- 외부 시스템 연동
        'data_deletion',                 -- 데이터 삭제
        'permission_change',             -- 권한 변경
        'budget_exceed'                  -- 예산 초과
    )),
    change_description TEXT NOT NULL,

    -- Impact analysis
    impact_summary TEXT,                 -- AI-generated impact summary
    affected_domains TEXT,               -- JSON array
    affected_agents TEXT,                -- JSON array
    risk_level TEXT CHECK(risk_level IN ('low', 'medium', 'high', 'critical')),
    estimated_impact_value REAL,         -- 예상 금액 영향

    -- Confirmation status
    status TEXT DEFAULT 'pending' CHECK(status IN (
        'pending', 'confirmed', 'rejected', 'expired', 'auto_approved'
    )),

    -- Response
    confirmed_by TEXT,
    confirmation_method TEXT,            -- "explicit", "timeout_default", "api"
    confirmation_note TEXT,
    confirmed_at TEXT,

    -- Execution after confirmation
    executed BOOLEAN DEFAULT FALSE,
    execution_result TEXT,               -- JSON
    executed_at TEXT,

    -- Timeout handling
    expires_at TEXT NOT NULL,
    timeout_action TEXT DEFAULT 'reject' CHECK(timeout_action IN (
        'reject', 'approve', 'escalate'
    )),

    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_confirm_session ON confirmation_requests(session_id);
CREATE INDEX idx_confirm_status ON confirmation_requests(status);
CREATE INDEX idx_confirm_agent ON confirmation_requests(agent_id);
CREATE INDEX idx_confirm_expires ON confirmation_requests(expires_at);

-- =============================================================================
-- 5. WEB SEARCH CACHE (웹 검색 캐시)
-- =============================================================================
CREATE TABLE IF NOT EXISTS web_search_cache (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

    -- Search context
    query TEXT NOT NULL,
    query_hash TEXT NOT NULL,            -- For quick lookup
    search_type TEXT DEFAULT 'general' CHECK(search_type IN (
        'general', 'news', 'academic', 'documentation', 'market_data'
    )),

    -- Source
    source_provider TEXT,                -- "tavily", "firecrawl", "context7"
    source_urls TEXT,                    -- JSON array of source URLs

    -- Results
    result_summary TEXT,                 -- AI-summarized result
    result_raw TEXT,                     -- Full raw result (JSON)
    result_entities TEXT,                -- Extracted entities (JSON)

    -- Relevance
    requesting_agent TEXT,               -- Agent that requested the search
    relevance_to_query REAL,             -- 0.0 to 1.0

    -- Knowledge base integration
    integrated_to_kb BOOLEAN DEFAULT FALSE,
    kb_upload_id TEXT,

    -- Cache control
    is_verified BOOLEAN DEFAULT FALSE,   -- Human-verified accuracy
    verified_by TEXT,
    verified_at TEXT,

    -- TTL
    expires_at TEXT NOT NULL,
    cache_hits INTEGER DEFAULT 0,
    last_accessed_at TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),

    FOREIGN KEY (kb_upload_id) REFERENCES knowledge_base_uploads(id)
);

CREATE INDEX idx_search_query_hash ON web_search_cache(query_hash);
CREATE INDEX idx_search_agent ON web_search_cache(requesting_agent);
CREATE INDEX idx_search_expires ON web_search_cache(expires_at);
CREATE INDEX idx_search_integrated ON web_search_cache(integrated_to_kb);

-- =============================================================================
-- 6. SYSTEM AGENTS REGISTRY (시스템 에이전트 등록)
-- =============================================================================
CREATE TABLE IF NOT EXISTS system_agents (
    id TEXT PRIMARY KEY,                 -- e.g., "SYS-001"
    name TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Type
    agent_type TEXT NOT NULL CHECK(agent_type IN (
        'document_analyzer',
        'consistency_checker',
        'performance_monitor',
        'knowledge_integrator',
        'web_searcher',
        'cache_manager'
    )),

    -- Configuration
    config TEXT,                         -- JSON configuration
    is_enabled BOOLEAN DEFAULT TRUE,

    -- Permissions
    can_read_all_domains BOOLEAN DEFAULT TRUE,
    can_write_kb BOOLEAN DEFAULT FALSE,
    can_modify_prompts BOOLEAN DEFAULT FALSE,
    requires_confirmation BOOLEAN DEFAULT TRUE,

    -- Status
    last_run_at TEXT,
    last_run_status TEXT,
    run_count INTEGER DEFAULT 0,

    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default system agents
INSERT OR IGNORE INTO system_agents (id, name, description, agent_type, can_write_kb, can_modify_prompts)
VALUES
    ('SYS-001', 'Document Analyzer', '업로드된 문서를 분석하여 관련 도메인 에이전트를 식별', 'document_analyzer', TRUE, FALSE),
    ('SYS-002', 'Consistency Checker', '새로운 지식이 기존 CMP 표준과 충돌하는지 검토', 'consistency_checker', FALSE, FALSE),
    ('SYS-003', 'Performance Monitor', '에이전트 성능 모니터링 및 이상 감지', 'performance_monitor', FALSE, FALSE),
    ('SYS-004', 'Knowledge Integrator', '검증된 지식을 에이전트에 통합', 'knowledge_integrator', TRUE, TRUE),
    ('SYS-005', 'Web Searcher', '웹 검색 및 결과 캐싱', 'web_searcher', TRUE, FALSE);

-- =============================================================================
-- 7. ADMIN AUDIT LOG (관리자 감사 로그)
-- =============================================================================
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),

    -- Actor
    admin_id TEXT NOT NULL,
    admin_role TEXT,                     -- "super_admin", "domain_admin", "viewer"

    -- Action
    action TEXT NOT NULL,                -- "create", "update", "delete", "approve", "reject", "execute"
    resource_type TEXT NOT NULL,         -- "prompt", "knowledge", "agent", "config"
    resource_id TEXT,

    -- Details
    action_details TEXT,                 -- JSON with before/after state
    ip_address TEXT,
    user_agent TEXT,

    -- Outcome
    status TEXT CHECK(status IN ('success', 'failed', 'partial')),
    error_message TEXT,

    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_audit_admin ON admin_audit_log(admin_id);
CREATE INDEX idx_audit_action ON admin_audit_log(action);
CREATE INDEX idx_audit_resource ON admin_audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_created ON admin_audit_log(created_at);
