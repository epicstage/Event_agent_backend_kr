-- interactions 테이블: LLM 인터랙션 로깅
CREATE TABLE IF NOT EXISTS interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  user_query TEXT,
  agent_output TEXT,
  ai_insight TEXT,
  user_feedback TEXT,
  evolution_note TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_interactions_session ON interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_interactions_task ON interactions(task_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created ON interactions(created_at);
