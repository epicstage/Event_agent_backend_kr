-- ============================================================================
-- Migration 003: Strategy Planning Domain Tables
-- CMP-IS Domain A: Strategic Planning
-- ============================================================================

-- event_goals 테이블: 이벤트 목표 및 KPI 저장
CREATE TABLE IF NOT EXISTS event_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  goal_type TEXT NOT NULL CHECK(goal_type IN (
    'ATTENDANCE', 'REVENUE', 'ENGAGEMENT', 'BRAND_AWARENESS',
    'LEAD_GENERATION', 'EDUCATION', 'NETWORKING', 'SATISFACTION', 'CUSTOM'
  )),
  title TEXT NOT NULL,
  description TEXT,
  target_value REAL,
  target_unit TEXT, -- 예: 'attendees', 'USD', 'percentage', 'score'
  current_value REAL DEFAULT 0,
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'approved', 'in_progress', 'achieved', 'missed', 'cancelled')),
  deadline TEXT,
  owner TEXT, -- 담당자
  kpis TEXT, -- JSON array of KPI definitions
  success_criteria TEXT,
  alignment_notes TEXT, -- 조직 전략과의 정합성 메모
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- stakeholders 테이블: 이해관계자 분석
CREATE TABLE IF NOT EXISTS stakeholders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  name TEXT NOT NULL,
  organization TEXT,
  role TEXT NOT NULL, -- 예: 'sponsor', 'speaker', 'attendee', 'vendor', 'media', 'government'
  stakeholder_type TEXT DEFAULT 'external' CHECK(stakeholder_type IN ('internal', 'external')),
  influence_level TEXT DEFAULT 'medium' CHECK(influence_level IN ('low', 'medium', 'high', 'critical')),
  interest_level TEXT DEFAULT 'medium' CHECK(interest_level IN ('low', 'medium', 'high')),
  engagement_strategy TEXT, -- 참여 전략
  communication_preference TEXT, -- 선호 커뮤니케이션 채널
  expectations TEXT, -- JSON array of expectations
  concerns TEXT, -- JSON array of concerns
  contact_info TEXT, -- JSON object with email, phone, etc.
  relationship_status TEXT DEFAULT 'new' CHECK(relationship_status IN ('new', 'engaged', 'committed', 'at_risk', 'lost')),
  notes TEXT,
  last_contact_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- risk_register 테이블: 리스크 관리
CREATE TABLE IF NOT EXISTS risk_register (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  risk_category TEXT NOT NULL CHECK(risk_category IN (
    'FINANCIAL', 'OPERATIONAL', 'REPUTATIONAL', 'LEGAL',
    'SAFETY', 'WEATHER', 'TECHNICAL', 'VENDOR', 'ATTENDANCE', 'POLITICAL', 'HEALTH'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  probability TEXT DEFAULT 'medium' CHECK(probability IN ('very_low', 'low', 'medium', 'high', 'very_high')),
  impact TEXT DEFAULT 'medium' CHECK(impact IN ('minimal', 'minor', 'moderate', 'major', 'catastrophic')),
  risk_score INTEGER, -- 계산된 리스크 점수 (probability * impact)
  status TEXT DEFAULT 'identified' CHECK(status IN ('identified', 'assessed', 'mitigating', 'monitoring', 'resolved', 'accepted')),
  owner TEXT, -- 리스크 담당자
  mitigation_strategy TEXT,
  contingency_plan TEXT,
  trigger_indicators TEXT, -- JSON array of early warning signs
  cost_of_mitigation REAL,
  cost_if_occurs REAL,
  detection_date TEXT,
  target_resolution_date TEXT,
  actual_resolution_date TEXT,
  related_goals TEXT, -- JSON array of goal IDs affected
  lessons_learned TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- strategy_sessions 테이블: 전략 기획 세션 기록
CREATE TABLE IF NOT EXISTS strategy_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK(session_type IN (
    'KICKOFF', 'GOAL_SETTING', 'STAKEHOLDER_ANALYSIS', 'RISK_ASSESSMENT',
    'BUDGET_REVIEW', 'TIMELINE_PLANNING', 'REVIEW', 'POST_MORTEM'
  )),
  title TEXT NOT NULL,
  description TEXT,
  participants TEXT, -- JSON array of participant names/roles
  agenda TEXT, -- JSON array of agenda items
  decisions TEXT, -- JSON array of decisions made
  action_items TEXT, -- JSON array of action items with owners
  notes TEXT,
  attachments TEXT, -- JSON array of attachment URLs
  scheduled_at TEXT,
  completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_goals_event ON event_goals(event_id);
CREATE INDEX IF NOT EXISTS idx_goals_status ON event_goals(status);
CREATE INDEX IF NOT EXISTS idx_goals_priority ON event_goals(priority);

CREATE INDEX IF NOT EXISTS idx_stakeholders_event ON stakeholders(event_id);
CREATE INDEX IF NOT EXISTS idx_stakeholders_role ON stakeholders(role);
CREATE INDEX IF NOT EXISTS idx_stakeholders_influence ON stakeholders(influence_level);

CREATE INDEX IF NOT EXISTS idx_risks_event ON risk_register(event_id);
CREATE INDEX IF NOT EXISTS idx_risks_category ON risk_register(risk_category);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risk_register(status);
CREATE INDEX IF NOT EXISTS idx_risks_score ON risk_register(risk_score);

CREATE INDEX IF NOT EXISTS idx_sessions_event ON strategy_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON strategy_sessions(session_type);
