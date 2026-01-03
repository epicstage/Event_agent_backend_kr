-- ============================================================================
-- Migration 009: CMP-IS Standard Knowledge Base
--
-- Purpose: 에이전트가 답변 시 참조할 수 있는 표준 지식 베이스 구축
-- CMP-IS (Convention & Meeting Professionals - Information Standard) 기반
-- ============================================================================

-- =============================================================================
-- 1. 표준 지식 베이스 테이블
-- =============================================================================

CREATE TABLE IF NOT EXISTS standard_knowledge_base (
    id TEXT PRIMARY KEY,

    -- 분류 정보
    domain TEXT NOT NULL CHECK(domain IN ('strategy', 'finance', 'project', 'marketing', 'operations', 'hr', 'general')),
    category TEXT NOT NULL,
    subcategory TEXT,

    -- 핵심 콘텐츠
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,

    -- 메타데이터
    source TEXT,  -- CMP-IS, MICE 표준, 실무 가이드 등
    source_version TEXT,
    language TEXT DEFAULT 'ko',

    -- 검색 및 매칭
    keywords TEXT,  -- JSON array as TEXT
    related_tasks TEXT,  -- JSON array of task IDs ["FIN-001", "STR-003"]
    applicable_event_types TEXT,  -- JSON array ["conference", "seminar"]

    -- 우선순위 및 상태
    priority INTEGER DEFAULT 5 CHECK(priority BETWEEN 1 AND 10),
    status TEXT DEFAULT 'active' CHECK(status IN ('draft', 'active', 'deprecated')),

    -- 사용 통계
    usage_count INTEGER DEFAULT 0,
    last_used_at TEXT,

    -- 타임스탬프
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- =============================================================================
-- 2. CMP-IS 가이드라인 테이블 (공식 표준)
-- =============================================================================

CREATE TABLE IF NOT EXISTS cmpis_guidelines (
    id TEXT PRIMARY KEY,

    -- CMP-IS 분류 체계
    skill_number INTEGER NOT NULL CHECK(skill_number BETWEEN 1 AND 12),
    skill_name TEXT NOT NULL,
    task_number INTEGER,  -- Skill 내 세부 태스크

    -- 가이드라인 내용
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    best_practices TEXT,  -- JSON array
    common_mistakes TEXT,  -- JSON array
    checklist TEXT,  -- JSON array

    -- 연결 정보
    related_agents TEXT,  -- JSON array ["FIN-001", "STR-003"]
    prerequisite_skills TEXT,  -- JSON array of skill numbers

    -- 메타
    importance TEXT DEFAULT 'medium' CHECK(importance IN ('critical', 'high', 'medium', 'low')),
    difficulty TEXT DEFAULT 'intermediate' CHECK(difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- =============================================================================
-- 3. 용어 사전 테이블
-- =============================================================================

CREATE TABLE IF NOT EXISTS terminology_dictionary (
    id TEXT PRIMARY KEY,

    -- 용어 정보
    term TEXT NOT NULL UNIQUE,
    term_en TEXT,  -- 영문 용어

    -- 정의
    definition TEXT NOT NULL,
    definition_short TEXT,  -- 한 줄 정의

    -- 분류
    domain TEXT NOT NULL,
    category TEXT,

    -- 관련 정보
    synonyms TEXT,  -- JSON array
    related_terms TEXT,  -- JSON array
    examples TEXT,  -- JSON array

    -- 출처
    source TEXT,

    created_at TEXT DEFAULT (datetime('now'))
);

-- =============================================================================
-- 4. 템플릿 라이브러리
-- =============================================================================

CREATE TABLE IF NOT EXISTS template_library (
    id TEXT PRIMARY KEY,

    -- 템플릿 정보
    name TEXT NOT NULL,
    description TEXT,
    template_type TEXT NOT NULL,  -- document, checklist, form, spreadsheet

    -- 분류
    domain TEXT NOT NULL,
    category TEXT,
    applicable_tasks TEXT,  -- JSON array ["FIN-001"]

    -- 템플릿 콘텐츠
    template_structure TEXT NOT NULL,  -- JSON structure
    sample_content TEXT,
    instructions TEXT,

    -- 메타
    format TEXT DEFAULT 'json',  -- json, markdown, html
    language TEXT DEFAULT 'ko',

    -- 사용 통계
    usage_count INTEGER DEFAULT 0,
    rating_avg REAL DEFAULT 0,
    rating_count INTEGER DEFAULT 0,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- =============================================================================
-- 5. FAQ 지식 베이스
-- =============================================================================

CREATE TABLE IF NOT EXISTS faq_knowledge (
    id TEXT PRIMARY KEY,

    -- 질문/답변
    question TEXT NOT NULL,
    answer TEXT NOT NULL,

    -- 분류
    domain TEXT NOT NULL,
    category TEXT,
    related_tasks TEXT,  -- JSON array

    -- 검색 최적화
    question_variations TEXT,  -- JSON array of alternative phrasings
    keywords TEXT,  -- JSON array

    -- 순위
    frequency INTEGER DEFAULT 0,  -- 질문 빈도
    helpfulness_score REAL DEFAULT 0,  -- 도움이 됐는지 점수

    -- 상태
    status TEXT DEFAULT 'active',
    last_reviewed_at TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- =============================================================================
-- 6. 인덱스 생성
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_kb_domain ON standard_knowledge_base(domain);
CREATE INDEX IF NOT EXISTS idx_kb_category ON standard_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_kb_status ON standard_knowledge_base(status);
CREATE INDEX IF NOT EXISTS idx_kb_priority ON standard_knowledge_base(priority DESC);

CREATE INDEX IF NOT EXISTS idx_cmpis_skill ON cmpis_guidelines(skill_number);
CREATE INDEX IF NOT EXISTS idx_cmpis_importance ON cmpis_guidelines(importance);

CREATE INDEX IF NOT EXISTS idx_term_domain ON terminology_dictionary(domain);
CREATE INDEX IF NOT EXISTS idx_term_term ON terminology_dictionary(term);

CREATE INDEX IF NOT EXISTS idx_template_domain ON template_library(domain);
CREATE INDEX IF NOT EXISTS idx_template_type ON template_library(template_type);

CREATE INDEX IF NOT EXISTS idx_faq_domain ON faq_knowledge(domain);
CREATE INDEX IF NOT EXISTS idx_faq_frequency ON faq_knowledge(frequency DESC);

-- =============================================================================
-- 7. 초기 데이터: CMP-IS Skill 구조
-- =============================================================================

INSERT OR IGNORE INTO cmpis_guidelines (id, skill_number, skill_name, title, description, best_practices, related_agents, importance) VALUES
-- Domain A: Strategic Planning
('CMPIS-SKILL-01', 1, 'Goal Setting', '이벤트 목표 설정',
 '성공적인 이벤트를 위한 명확하고 측정 가능한 목표를 설정합니다. SMART 원칙 적용.',
 '["SMART 목표 설정", "이해관계자 alignment 확인", "정량적 KPI 정의", "목표 우선순위 설정"]',
 '["STR-001", "STR-006", "STR-008"]', 'critical'),

('CMPIS-SKILL-02', 2, 'Stakeholder Analysis', '이해관계자 분석',
 '이벤트 관련 모든 이해관계자를 식별하고 영향력/관심도 매트릭스로 분류합니다.',
 '["Power-Interest Grid 활용", "정기적 업데이트", "커뮤니케이션 계획 연동"]',
 '["STR-002", "STR-014", "STR-015", "STR-016"]', 'high'),

('CMPIS-SKILL-03', 3, 'Risk Management', '리스크 관리',
 '잠재적 위험을 사전에 식별하고 대응 계획을 수립합니다.',
 '["리스크 레지스터 유지", "확률-영향 평가", "비상 계획 수립", "보험 검토"]',
 '["STR-003", "STR-027", "STR-030", "STR-031"]', 'critical'),

('CMPIS-SKILL-04', 4, 'Strategic Alignment', '전략적 정렬',
 '이벤트 목표가 조직 전략 및 이해관계자 기대와 일치하는지 확인합니다.',
 '["BSC 프레임워크 활용", "전략 맵 작성", "KPI 캐스케이딩"]',
 '["STR-041", "STR-042", "STR-043"]', 'high'),

-- Domain B: Project Management
('CMPIS-SKILL-05', 5, 'Plan Project', '프로젝트 계획',
 '이벤트 프로젝트의 범위, 일정, 자원을 체계적으로 계획합니다.',
 '["WBS 작성", "마일스톤 정의", "RACI 매트릭스", "의존성 관리"]',
 '["PRJ-001", "PRJ-005", "PRJ-007", "PRJ-010"]', 'critical'),

('CMPIS-SKILL-06', 6, 'Manage Project', '프로젝트 관리',
 '계획 대비 실행을 모니터링하고 필요시 조정합니다.',
 '["주간 상태 회의", "EVM 적용", "변경 관리 프로세스", "이슈 에스컬레이션"]',
 '["PRJ-014", "PRJ-017", "PRJ-19", "PRJ-020"]', 'critical'),

-- Domain C & D: Marketing & Finance (Skill 7, 8)
('CMPIS-SKILL-07', 7, 'Plan Marketing / Manage Event Funding', '마케팅 계획 및 이벤트 펀딩 관리',
 '효과적인 마케팅 전략과 스폰서십/펀딩 확보 전략을 수립합니다.',
 '["타겟 오디언스 정의", "채널 믹스 최적화", "스폰서 가치 제안", "ROI 예측"]',
 '["MKT-001", "MKT-007", "FIN-001", "FIN-005"]', 'high'),

('CMPIS-SKILL-08', 8, 'Execute Marketing / Manage Budget', '마케팅 실행 및 예산 관리',
 '마케팅 캠페인을 실행하고 예산을 효율적으로 관리합니다.',
 '["캠페인 최적화", "A/B 테스팅", "예산 추적", "비용 통제"]',
 '["MKT-016", "MKT-026", "FIN-031", "FIN-044"]', 'high'),

-- Domain D & E: Finance & Operations (Skill 9)
('CMPIS-SKILL-09', 9, 'Manage Monetary Transactions / Site Management', '금융 거래 관리 및 현장 관리',
 '결제/정산 처리와 베뉴/현장 관리를 수행합니다.',
 '["결제 시스템 설정", "베뉴 체크리스트", "AV 테스트", "안전 점검"]',
 '["FIN-058", "FIN-062", "OPS-001", "OPS-007"]', 'high'),

-- Domain E: Operations (Skill 10)
('CMPIS-SKILL-10', 10, 'Logistics Management', '로지스틱스 관리',
 '이벤트의 모든 물류적 요소를 관리합니다.',
 '["F&B 계획", "교통/숙박 조정", "등록 시스템", "현장 운영"]',
 '["OPS-016", "OPS-019", "OPS-022", "OPS-027"]', 'high'),

-- Domain F: Human Resources (Skill 11, 12)
('CMPIS-SKILL-11', 11, 'HR Planning', '인력 계획',
 '이벤트에 필요한 인력 요구사항을 분석하고 채용/교육 계획을 수립합니다.',
 '["스태프 니즈 분석", "역할 정의", "교육 프로그램 설계", "스케줄 계획"]',
 '["HR-001", "HR-002", "HR-005", "HR-008"]', 'high'),

('CMPIS-SKILL-12', 12, 'HR Management', '인력 관리',
 '스태프 채용부터 교육, 현장 배치, 성과 관리까지 전 과정을 관리합니다.',
 '["온보딩 프로세스", "실시간 배치 조정", "성과 피드백", "급여 정산"]',
 '["HR-016", "HR-019", "HR-022", "HR-029"]', 'high');

-- =============================================================================
-- 8. 초기 데이터: 핵심 지식
-- =============================================================================

INSERT OR IGNORE INTO standard_knowledge_base (id, domain, category, title, content, summary, source, keywords, related_tasks, priority) VALUES
-- Finance Knowledge
('KB-FIN-001', 'finance', 'Sponsorship', '스폰서십 가치 산정 기본 원칙',
 '스폰서십 가치는 노출 기회, 브랜드 연관성, 네트워킹 기회, 독점성을 종합적으로 평가해야 합니다. 일반적으로 유사 이벤트 벤치마킹, 미디어 가치 환산, 참가자 프로필 분석을 통해 가격을 산정합니다.',
 '스폰서십 가치는 노출, 브랜드 연관성, 네트워킹, 독점성을 종합 평가',
 'CMP-IS Skill 7', '["스폰서십", "가치산정", "ROI", "벤치마킹"]', '["FIN-001", "FIN-002"]', 9),

('KB-FIN-002', 'finance', 'Budget', '이벤트 예산 구조 설계',
 '이벤트 예산은 크게 직접 비용(베뉴, F&B, AV, 인쇄물)과 간접 비용(인건비, 마케팅, 운영비)으로 구분합니다. 예비비는 총 예산의 10-15%를 권장합니다.',
 '예산은 직접비/간접비로 구분, 예비비 10-15% 권장',
 'CMP-IS Skill 8', '["예산", "비용구조", "직접비", "간접비", "예비비"]', '["FIN-031", "FIN-032"]', 9),

-- Strategy Knowledge
('KB-STR-001', 'strategy', 'Goal Setting', 'SMART 목표 설정 가이드',
 'Specific(구체적), Measurable(측정 가능), Achievable(달성 가능), Relevant(관련성), Time-bound(시한) 원칙을 적용합니다. 각 목표에 대해 정량적 KPI를 반드시 정의하세요.',
 'SMART 원칙 적용, 정량적 KPI 필수',
 'CMP-IS Skill 1', '["SMART", "목표", "KPI", "성과지표"]', '["STR-001", "STR-006"]', 10),

('KB-STR-002', 'strategy', 'Risk', '이벤트 리스크 분류 체계',
 '이벤트 리스크는 운영 리스크(일정, 기술, 베뉴), 재무 리스크(예산, 수익), 외부 리스크(날씨, 규제), 평판 리스크로 분류합니다. 각 카테고리별 Top 3 리스크를 식별하세요.',
 '리스크는 운영/재무/외부/평판으로 분류',
 'CMP-IS Skill 3', '["리스크", "위험", "분류", "카테고리"]', '["STR-003", "STR-027"]', 9),

-- Operations Knowledge
('KB-OPS-001', 'operations', 'Venue', '베뉴 선정 체크리스트',
 '수용 인원, 접근성(대중교통, 주차), 시설(AV, 무대, 조명), 계약 조건(보증금, 취소 정책), 추가 비용(케이터링, 보안)을 반드시 확인하세요.',
 '수용인원, 접근성, 시설, 계약조건, 추가비용 확인 필수',
 'CMP-IS Skill 9', '["베뉴", "장소", "체크리스트", "선정"]', '["OPS-001", "OPS-002", "OPS-003"]', 9),

-- HR Knowledge
('KB-HR-001', 'hr', 'Staffing', '이벤트 스태프 산정 기준',
 '일반적으로 참가자 50명당 1명의 안내 스태프, 등록 데스크는 시간당 100명 처리 기준으로 산정합니다. VIP 행사는 1:10 비율을 권장합니다.',
 '참가자 50명당 안내 1명, 등록은 시간당 100명 처리 기준',
 'CMP-IS Skill 11', '["스태프", "인력", "산정", "비율"]', '["HR-001", "HR-008"]', 8);

-- =============================================================================
-- 9. 초기 데이터: 핵심 용어
-- =============================================================================

INSERT OR IGNORE INTO terminology_dictionary (id, term, term_en, definition, definition_short, domain, category, synonyms) VALUES
('TERM-001', 'ROI', 'Return on Investment', '투자 대비 수익률. 이벤트에서는 스폰서십 ROI, 마케팅 ROI 등으로 활용됨.', '투자 수익률', 'finance', 'Metrics', '["투자수익률", "투자대비효과"]'),
('TERM-002', 'KPI', 'Key Performance Indicator', '핵심 성과 지표. 이벤트 목표 달성도를 측정하는 정량적 지표.', '핵심 성과 지표', 'strategy', 'Metrics', '["핵심성과지표", "성과지표"]'),
('TERM-003', 'WBS', 'Work Breakdown Structure', '작업 분류 체계. 프로젝트 범위를 계층적으로 분해한 구조.', '작업 분류 체계', 'project', 'Planning', '["작업분류체계", "업무분해구조"]'),
('TERM-004', 'F&B', 'Food & Beverage', '식음료. 이벤트에서 제공되는 케이터링 서비스 전반.', '식음료', 'operations', 'Catering', '["식음료", "케이터링"]'),
('TERM-005', 'BEP', 'Break-Even Point', '손익분기점. 수익과 비용이 같아지는 지점.', '손익분기점', 'finance', 'Analysis', '["손익분기점", "BEP"]'),
('TERM-006', 'RACI', 'Responsible Accountable Consulted Informed', '역할 책임 매트릭스. 누가 무엇을 담당하는지 정의.', '역할 책임 매트릭스', 'project', 'Planning', '["역할매트릭스", "책임분담표"]'),
('TERM-007', 'CMP', 'Convention & Meeting Professional', '컨벤션 및 회의 전문가. MICE 산업 전문 인력.', 'MICE 전문가', 'general', 'Industry', '["MICE전문가", "이벤트기획자"]');
