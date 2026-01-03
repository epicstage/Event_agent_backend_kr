-- system_gaps 테이블: 시스템 한계/개선점 자동 감지
CREATE TABLE IF NOT EXISTS system_gaps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  interaction_id INTEGER,
  gap_type TEXT NOT NULL CHECK(gap_type IN ('MISSING_FEAT', 'LOGIC_ERROR', 'USER_FRUSTRATION', 'DATA_GAP', 'PERF_ISSUE')),
  severity TEXT DEFAULT 'medium' CHECK(severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  context_data TEXT,
  suggested_fix TEXT,
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'acknowledged', 'in_progress', 'resolved', 'wont_fix')),
  created_at TEXT DEFAULT (datetime('now')),
  resolved_at TEXT,
  FOREIGN KEY (interaction_id) REFERENCES interactions(id)
);

-- raw_conversations 테이블: 원본 대화 저장
CREATE TABLE IF NOT EXISTS raw_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK(message_type IN ('user_input', 'agent_response', 'system_event')),
  content TEXT NOT NULL,
  metadata TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_gaps_type ON system_gaps(gap_type);
CREATE INDEX IF NOT EXISTS idx_gaps_status ON system_gaps(status);
CREATE INDEX IF NOT EXISTS idx_gaps_severity ON system_gaps(severity);
CREATE INDEX IF NOT EXISTS idx_raw_session ON raw_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_raw_type ON raw_conversations(message_type);
