-- =============================================================================
-- Migration 010: Meetings & Contents Domain (Domain G)
-- CMP-IS Skill 13 (Program Design) & Skill 14 (Content Management)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. EVENT SESSIONS - 세션/프로그램 관리
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_sessions (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,

  -- 세션 기본 정보
  session_code TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  session_type TEXT NOT NULL CHECK (session_type IN (
    'keynote', 'plenary', 'breakout', 'workshop', 'panel',
    'roundtable', 'poster', 'networking', 'ceremony', 'entertainment',
    'exhibition', 'tutorial', 'symposium', 'debate', 'fireside_chat'
  )),

  -- 시간/장소
  scheduled_date TEXT,
  start_time TEXT,
  end_time TEXT,
  duration_minutes INTEGER,
  venue_id TEXT,
  room_name TEXT,

  -- 트랙/테마
  track_id TEXT,
  track_name TEXT,
  theme TEXT,
  topics TEXT, -- JSON array
  keywords TEXT, -- JSON array

  -- 참가자 정보
  target_audience TEXT, -- JSON array: ["executives", "practitioners", "students"]
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  expected_attendees INTEGER,
  max_capacity INTEGER,
  registered_count INTEGER DEFAULT 0,

  -- 형식 상세
  format TEXT CHECK (format IN ('lecture', 'interactive', 'hands_on', 'demo', 'discussion', 'hybrid')),
  language TEXT DEFAULT 'ko',
  translation_languages TEXT, -- JSON array
  is_recorded BOOLEAN DEFAULT FALSE,
  is_livestreamed BOOLEAN DEFAULT FALSE,

  -- CE/CPD 정보
  ce_credits REAL DEFAULT 0,
  ce_category TEXT,

  -- 상태
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'published', 'cancelled')),
  review_notes TEXT,

  -- 메타
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_event ON event_sessions(event_id);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON event_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON event_sessions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_sessions_track ON event_sessions(track_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON event_sessions(status);

-- -----------------------------------------------------------------------------
-- 2. SPEAKER PROFILES - 연사 프로필
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS speaker_profiles (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,

  -- 기본 정보
  speaker_code TEXT NOT NULL,
  full_name TEXT NOT NULL,
  display_name TEXT,
  title TEXT, -- Dr., Prof., etc.
  job_title TEXT,
  organization TEXT,
  department TEXT,

  -- 연락처
  email TEXT,
  phone TEXT,
  preferred_contact TEXT CHECK (preferred_contact IN ('email', 'phone', 'assistant')),
  assistant_name TEXT,
  assistant_email TEXT,

  -- 프로필
  bio_short TEXT, -- 100-150 words
  bio_full TEXT,
  photo_url TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  twitter_handle TEXT,

  -- 전문 분야
  expertise_areas TEXT, -- JSON array
  industry TEXT,
  specializations TEXT, -- JSON array

  -- 연사 등급/유형
  speaker_type TEXT CHECK (speaker_type IN (
    'keynote', 'invited', 'contributed', 'panelist', 'moderator',
    'workshop_leader', 'poster_presenter', 'exhibitor'
  )),
  speaker_tier TEXT CHECK (speaker_tier IN ('platinum', 'gold', 'silver', 'bronze', 'standard')),

  -- 과거 이력
  previous_events TEXT, -- JSON array
  speaking_experience_years INTEGER,
  average_rating REAL,

  -- 요구사항
  travel_requirements TEXT, -- JSON object
  accommodation_requirements TEXT, -- JSON object
  av_requirements TEXT, -- JSON array
  special_requests TEXT,
  dietary_restrictions TEXT,

  -- 계약/비용
  honorarium_amount REAL DEFAULT 0,
  honorarium_currency TEXT DEFAULT 'USD',
  travel_covered BOOLEAN DEFAULT FALSE,
  accommodation_covered BOOLEAN DEFAULT FALSE,
  contract_status TEXT CHECK (contract_status IN ('pending', 'sent', 'signed', 'declined')),
  contract_signed_date TEXT,

  -- 상태
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'confirmed', 'tentative', 'declined', 'cancelled')),
  confirmation_date TEXT,

  -- 메타
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_speakers_event ON speaker_profiles(event_id);
CREATE INDEX IF NOT EXISTS idx_speakers_type ON speaker_profiles(speaker_type);
CREATE INDEX IF NOT EXISTS idx_speakers_status ON speaker_profiles(status);
CREATE INDEX IF NOT EXISTS idx_speakers_org ON speaker_profiles(organization);

-- -----------------------------------------------------------------------------
-- 3. SESSION SPEAKERS - 세션-연사 매핑
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS session_speakers (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  speaker_id TEXT NOT NULL,

  role TEXT NOT NULL CHECK (role IN ('presenter', 'co_presenter', 'moderator', 'panelist', 'discussant')),
  presentation_order INTEGER DEFAULT 1,
  presentation_duration_minutes INTEGER,

  -- 발표 자료
  presentation_title TEXT,
  presentation_file_url TEXT,
  handout_url TEXT,

  -- 상태
  confirmed BOOLEAN DEFAULT FALSE,
  rehearsal_completed BOOLEAN DEFAULT FALSE,
  materials_submitted BOOLEAN DEFAULT FALSE,

  created_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (session_id) REFERENCES event_sessions(id),
  FOREIGN KEY (speaker_id) REFERENCES speaker_profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_session_speakers_session ON session_speakers(session_id);
CREATE INDEX IF NOT EXISTS idx_session_speakers_speaker ON session_speakers(speaker_id);

-- -----------------------------------------------------------------------------
-- 4. ABSTRACTS SUBMISSIONS - 초록 제출
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS abstracts_submissions (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,

  -- 제출 정보
  submission_code TEXT NOT NULL,
  submission_date TEXT DEFAULT (datetime('now')),

  -- 저자 정보
  submitter_id TEXT,
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  submitter_affiliation TEXT,
  co_authors TEXT, -- JSON array of {name, email, affiliation, order}
  presenting_author TEXT,

  -- 초록 내용
  title TEXT NOT NULL,
  abstract_text TEXT NOT NULL,
  keywords TEXT, -- JSON array
  category TEXT,
  subcategory TEXT,
  topic_area TEXT,

  -- 발표 선호
  preferred_format TEXT CHECK (preferred_format IN ('oral', 'poster', 'either', 'workshop')),
  preferred_session_type TEXT,
  preferred_track TEXT,

  -- 파일
  abstract_file_url TEXT,
  supplementary_files TEXT, -- JSON array

  -- 심사
  review_status TEXT DEFAULT 'submitted' CHECK (review_status IN (
    'submitted', 'under_review', 'revision_requested', 'accepted', 'rejected', 'withdrawn'
  )),
  review_score REAL,
  reviewer_comments TEXT, -- JSON array
  assigned_reviewers TEXT, -- JSON array
  review_deadline TEXT,

  -- 결정
  decision TEXT CHECK (decision IN ('accept_oral', 'accept_poster', 'accept_workshop', 'reject', 'waitlist')),
  decision_date TEXT,
  decision_notes TEXT,
  notification_sent BOOLEAN DEFAULT FALSE,

  -- 수정 이력
  revision_count INTEGER DEFAULT 0,
  last_revision_date TEXT,

  -- 할당된 세션
  assigned_session_id TEXT,
  assigned_date TEXT,
  assigned_time TEXT,

  -- 메타
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_abstracts_event ON abstracts_submissions(event_id);
CREATE INDEX IF NOT EXISTS idx_abstracts_status ON abstracts_submissions(review_status);
CREATE INDEX IF NOT EXISTS idx_abstracts_category ON abstracts_submissions(category);
CREATE INDEX IF NOT EXISTS idx_abstracts_submitter ON abstracts_submissions(submitter_email);

-- -----------------------------------------------------------------------------
-- 5. PROGRAM TRACKS - 프로그램 트랙
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS program_tracks (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,

  track_code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  theme TEXT,
  color_code TEXT, -- Hex color for UI
  icon TEXT,

  -- 담당자
  chair_id TEXT,
  co_chair_ids TEXT, -- JSON array

  -- 세션 정보
  session_count INTEGER DEFAULT 0,
  total_duration_minutes INTEGER DEFAULT 0,

  -- 순서
  display_order INTEGER DEFAULT 0,

  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tracks_event ON program_tracks(event_id);

-- -----------------------------------------------------------------------------
-- 6. CONTENT MATERIALS - 콘텐츠 자료
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS content_materials (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  session_id TEXT,
  speaker_id TEXT,

  -- 자료 정보
  material_type TEXT NOT NULL CHECK (material_type IN (
    'presentation', 'handout', 'video', 'audio', 'paper',
    'poster', 'demo', 'code', 'dataset', 'other'
  )),
  title TEXT NOT NULL,
  description TEXT,

  -- 파일 정보
  file_url TEXT,
  file_size_bytes INTEGER,
  file_format TEXT,
  duration_seconds INTEGER, -- For video/audio
  page_count INTEGER, -- For documents

  -- 접근 권한
  access_level TEXT DEFAULT 'registered' CHECK (access_level IN ('public', 'registered', 'attendees_only', 'speakers_only')),
  download_allowed BOOLEAN DEFAULT TRUE,

  -- 검수
  review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'revision_needed')),
  reviewer_id TEXT,
  review_notes TEXT,

  -- 통계
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,

  -- 메타
  upload_date TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_materials_event ON content_materials(event_id);
CREATE INDEX IF NOT EXISTS idx_materials_session ON content_materials(session_id);
CREATE INDEX IF NOT EXISTS idx_materials_speaker ON content_materials(speaker_id);
CREATE INDEX IF NOT EXISTS idx_materials_type ON content_materials(material_type);

-- -----------------------------------------------------------------------------
-- 7. CE/CPD CREDITS - 교육 이수 학점
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ce_credits (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  session_id TEXT NOT NULL,

  credit_type TEXT NOT NULL, -- CME, CPD, CE, etc.
  credit_provider TEXT,
  accreditation_number TEXT,

  credits_offered REAL NOT NULL,
  credit_category TEXT,

  requirements TEXT, -- JSON: attendance %, quiz score, etc.

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'expired')),
  approval_date TEXT,
  expiry_date TEXT,

  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ce_session ON ce_credits(session_id);

-- -----------------------------------------------------------------------------
-- 초기 데이터: Program Tracks 샘플
-- -----------------------------------------------------------------------------
INSERT OR IGNORE INTO program_tracks (id, event_id, track_code, name, description, theme, color_code, display_order) VALUES
  ('track-001', 'sample-event', 'MAIN', 'Main Conference', 'Core conference sessions and keynotes', 'Innovation & Future', '#1E40AF', 1),
  ('track-002', 'sample-event', 'TECH', 'Technology Track', 'Technical deep-dives and workshops', 'Emerging Technologies', '#059669', 2),
  ('track-003', 'sample-event', 'BIZ', 'Business Track', 'Business strategy and case studies', 'Business Excellence', '#DC2626', 3),
  ('track-004', 'sample-event', 'WORKSHOP', 'Workshops', 'Hands-on interactive sessions', 'Practical Learning', '#7C3AED', 4);
