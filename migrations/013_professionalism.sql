-- Migration 013: Professionalism Domain (Domain J)
-- CMP-IS Skills 19 & 20: Ethics & Standards, Legal Compliance & Professional Development

-- Compliance Audit Trails 테이블
CREATE TABLE IF NOT EXISTS compliance_audit_trails (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  audit_type TEXT NOT NULL, -- 'ethics', 'legal', 'safety', 'privacy', 'accessibility', 'environmental'
  audit_scope TEXT NOT NULL, -- 'full', 'partial', 'spot_check'
  auditor_type TEXT, -- 'internal', 'external', 'regulatory'
  compliance_framework TEXT, -- 'CMP', 'GDPR', 'ADA', 'ISO20121', 'local_regulations'
  finding_type TEXT, -- 'compliant', 'minor_issue', 'major_issue', 'critical'
  finding_description TEXT,
  evidence_reference TEXT, -- JSON: 증빙 자료 링크
  corrective_action TEXT,
  action_deadline TEXT,
  action_status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'overdue'
  risk_score REAL,
  audited_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Ethical Guidelines 테이블
CREATE TABLE IF NOT EXISTS ethical_guidelines (
  id TEXT PRIMARY KEY,
  event_id TEXT,
  guideline_category TEXT NOT NULL, -- 'vendor_relations', 'attendee_treatment', 'sustainability', 'dei', 'marketing', 'data_usage'
  guideline_title TEXT NOT NULL,
  guideline_content TEXT NOT NULL,
  applicability_scope TEXT, -- 'all_staff', 'vendors', 'speakers', 'sponsors', 'attendees'
  enforcement_level TEXT, -- 'mandatory', 'recommended', 'optional'
  violation_consequence TEXT,
  related_policy_ids TEXT, -- JSON array
  acknowledgment_required INTEGER DEFAULT 0,
  acknowledgment_count INTEGER DEFAULT 0,
  effective_from TEXT,
  effective_until TEXT,
  version TEXT DEFAULT '1.0',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Professional Learning Logs 테이블
CREATE TABLE IF NOT EXISTS professional_learning_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_id TEXT,
  learning_type TEXT NOT NULL, -- 'certification', 'workshop', 'webinar', 'course', 'conference', 'mentorship', 'self_study'
  learning_title TEXT NOT NULL,
  learning_provider TEXT,
  skill_category TEXT, -- 'event_planning', 'risk_management', 'marketing', 'technology', 'leadership', 'sustainability'
  credits_earned REAL,
  credit_type TEXT, -- 'CMP_CE', 'CSEP', 'CED', 'general'
  completion_status TEXT DEFAULT 'in_progress', -- 'enrolled', 'in_progress', 'completed', 'expired'
  completion_date TEXT,
  expiration_date TEXT,
  score_achieved REAL,
  certificate_url TEXT,
  reflection_notes TEXT,
  application_examples TEXT, -- JSON: 실무 적용 사례
  verified INTEGER DEFAULT 0,
  verified_by TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Professional Certifications 테이블
CREATE TABLE IF NOT EXISTS professional_certifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  certification_name TEXT NOT NULL, -- 'CMP', 'CSEP', 'CED', 'CMM', 'DES'
  issuing_body TEXT NOT NULL,
  certification_number TEXT,
  issue_date TEXT NOT NULL,
  expiration_date TEXT,
  renewal_requirements TEXT, -- JSON: 갱신 요건
  ce_credits_required REAL,
  ce_credits_earned REAL DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'suspended', 'revoked'
  verification_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Legal Risk Assessments 테이블
CREATE TABLE IF NOT EXISTS legal_risk_assessments (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  assessment_type TEXT NOT NULL, -- 'contract', 'liability', 'ip', 'privacy', 'employment', 'regulatory'
  risk_title TEXT NOT NULL,
  risk_description TEXT NOT NULL,
  risk_category TEXT, -- 'contractual', 'tort', 'statutory', 'regulatory'
  affected_parties TEXT, -- JSON array
  likelihood TEXT, -- 'rare', 'unlikely', 'possible', 'likely', 'certain'
  impact TEXT, -- 'negligible', 'minor', 'moderate', 'major', 'catastrophic'
  risk_score REAL,
  mitigation_strategy TEXT,
  residual_risk TEXT,
  legal_counsel_review INTEGER DEFAULT 0,
  review_notes TEXT,
  insurance_coverage TEXT,
  jurisdiction TEXT,
  assessed_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Industry Standards Compliance 테이블
CREATE TABLE IF NOT EXISTS industry_standards_compliance (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  standard_name TEXT NOT NULL, -- 'ISO20121', 'APEX', 'ASTM', 'CIC', 'MPI'
  standard_version TEXT,
  compliance_level TEXT, -- 'full', 'partial', 'in_progress', 'not_applicable'
  assessment_date TEXT,
  next_review_date TEXT,
  compliance_score REAL,
  gaps_identified TEXT, -- JSON array
  action_plan TEXT, -- JSON
  certification_status TEXT, -- 'certified', 'pending', 'lapsed', 'not_certified'
  certification_expiry TEXT,
  auditor_name TEXT,
  audit_report_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_compliance_audit_event ON compliance_audit_trails(event_id);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_type ON compliance_audit_trails(audit_type);
CREATE INDEX IF NOT EXISTS idx_compliance_audit_finding ON compliance_audit_trails(finding_type);
CREATE INDEX IF NOT EXISTS idx_ethical_guidelines_category ON ethical_guidelines(guideline_category);
CREATE INDEX IF NOT EXISTS idx_ethical_guidelines_event ON ethical_guidelines(event_id);
CREATE INDEX IF NOT EXISTS idx_learning_logs_user ON professional_learning_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_logs_type ON professional_learning_logs(learning_type);
CREATE INDEX IF NOT EXISTS idx_learning_logs_status ON professional_learning_logs(completion_status);
CREATE INDEX IF NOT EXISTS idx_certifications_user ON professional_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_status ON professional_certifications(status);
CREATE INDEX IF NOT EXISTS idx_legal_risk_event ON legal_risk_assessments(event_id);
CREATE INDEX IF NOT EXISTS idx_legal_risk_type ON legal_risk_assessments(assessment_type);
CREATE INDEX IF NOT EXISTS idx_standards_event ON industry_standards_compliance(event_id);
CREATE INDEX IF NOT EXISTS idx_standards_name ON industry_standards_compliance(standard_name);
