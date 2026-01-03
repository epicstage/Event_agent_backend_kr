-- =============================================================================
-- Migration 011: Site Management Domain (Domain H)
-- CMP-IS Skill 15 (Site Operations) & Skill 16 (Housing Management)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. HOTEL BLOCKS - 호텔 블록 관리
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS hotel_blocks (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,

  -- 호텔 기본 정보
  hotel_id TEXT NOT NULL,
  hotel_name TEXT NOT NULL,
  hotel_chain TEXT,
  star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'KR',
  phone TEXT,
  email TEXT,
  website TEXT,

  -- 담당자 정보
  sales_contact_name TEXT,
  sales_contact_email TEXT,
  sales_contact_phone TEXT,
  group_coordinator_name TEXT,
  group_coordinator_email TEXT,

  -- 블록 상세
  block_name TEXT NOT NULL,
  block_code TEXT,
  contract_number TEXT,

  -- 객실 할당
  total_rooms_blocked INTEGER NOT NULL DEFAULT 0,
  single_rooms INTEGER DEFAULT 0,
  double_rooms INTEGER DEFAULT 0,
  twin_rooms INTEGER DEFAULT 0,
  suite_rooms INTEGER DEFAULT 0,
  accessible_rooms INTEGER DEFAULT 0,

  -- 요금
  single_rate REAL,
  double_rate REAL,
  twin_rate REAL,
  suite_rate REAL,
  rate_currency TEXT DEFAULT 'KRW',
  rate_includes_breakfast BOOLEAN DEFAULT FALSE,
  rate_includes_tax BOOLEAN DEFAULT FALSE,
  tax_rate REAL DEFAULT 0.1,

  -- 기간
  check_in_date TEXT NOT NULL,
  check_out_date TEXT NOT NULL,
  cutoff_date TEXT, -- 예약 마감일
  release_date TEXT, -- 미사용 객실 반환일

  -- 조건
  minimum_stay_nights INTEGER DEFAULT 1,
  cancellation_policy TEXT, -- JSON: {days_before: number, penalty_percent: number}[]
  deposit_required BOOLEAN DEFAULT FALSE,
  deposit_amount REAL,
  deposit_due_date TEXT,

  -- 편의시설
  amenities TEXT, -- JSON array: ["wifi", "parking", "gym", "pool", "spa", "restaurant"]
  shuttle_available BOOLEAN DEFAULT FALSE,
  shuttle_details TEXT,
  distance_to_venue_km REAL,
  estimated_travel_time_minutes INTEGER,

  -- 계약 상태
  contract_status TEXT DEFAULT 'negotiating' CHECK (contract_status IN (
    'negotiating', 'pending_signature', 'signed', 'active', 'completed', 'cancelled'
  )),
  contract_signed_date TEXT,
  contract_file_url TEXT,

  -- 사용 현황
  rooms_reserved INTEGER DEFAULT 0,
  rooms_available INTEGER GENERATED ALWAYS AS (total_rooms_blocked - rooms_reserved) STORED,
  occupancy_rate REAL DEFAULT 0,

  -- 메타
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_hotel_blocks_event ON hotel_blocks(event_id);
CREATE INDEX IF NOT EXISTS idx_hotel_blocks_hotel ON hotel_blocks(hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_blocks_dates ON hotel_blocks(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_hotel_blocks_status ON hotel_blocks(contract_status);
CREATE INDEX IF NOT EXISTS idx_hotel_blocks_cutoff ON hotel_blocks(cutoff_date);

-- -----------------------------------------------------------------------------
-- 2. ROOM ASSIGNMENTS - 객실 배정
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS room_assignments (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  hotel_block_id TEXT NOT NULL,

  -- 투숙객 정보
  guest_id TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT,
  guest_type TEXT CHECK (guest_type IN (
    'speaker', 'vip', 'staff', 'volunteer', 'sponsor', 'exhibitor', 'attendee', 'media', 'other'
  )),
  guest_organization TEXT,
  guest_title TEXT,

  -- 동반자 정보
  companion_count INTEGER DEFAULT 0,
  companion_names TEXT, -- JSON array

  -- 객실 정보
  room_type TEXT NOT NULL CHECK (room_type IN ('single', 'double', 'twin', 'suite', 'accessible')),
  room_number TEXT,
  floor_preference TEXT,
  bed_preference TEXT CHECK (bed_preference IN ('king', 'queen', 'twin', 'no_preference')),
  smoking_preference TEXT DEFAULT 'non_smoking' CHECK (smoking_preference IN ('smoking', 'non_smoking', 'no_preference')),

  -- 예약 기간
  check_in_date TEXT NOT NULL,
  check_out_date TEXT NOT NULL,
  nights INTEGER,
  early_check_in BOOLEAN DEFAULT FALSE,
  late_check_out BOOLEAN DEFAULT FALSE,
  early_check_in_time TEXT,
  late_check_out_time TEXT,

  -- 비용
  nightly_rate REAL,
  total_cost REAL,
  cost_currency TEXT DEFAULT 'KRW',
  payment_responsibility TEXT CHECK (payment_responsibility IN (
    'event_organizer', 'guest', 'sponsor', 'organization', 'split'
  )),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'partially_paid', 'paid', 'refunded', 'waived'
  )),
  invoice_id TEXT,

  -- 특별 요청
  special_requests TEXT, -- JSON array
  dietary_restrictions TEXT,
  accessibility_needs TEXT,
  allergy_info TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,

  -- 교통편 연동
  arrival_flight TEXT,
  arrival_date TEXT,
  arrival_time TEXT,
  departure_flight TEXT,
  departure_date TEXT,
  departure_time TEXT,
  airport_transfer_needed BOOLEAN DEFAULT FALSE,

  -- 상태
  reservation_status TEXT DEFAULT 'pending' CHECK (reservation_status IN (
    'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'
  )),
  confirmation_number TEXT,
  confirmed_at TEXT,

  -- 메타
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (hotel_block_id) REFERENCES hotel_blocks(id)
);

CREATE INDEX IF NOT EXISTS idx_room_assignments_event ON room_assignments(event_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_block ON room_assignments(hotel_block_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_guest ON room_assignments(guest_id);
CREATE INDEX IF NOT EXISTS idx_room_assignments_dates ON room_assignments(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_room_assignments_status ON room_assignments(reservation_status);
CREATE INDEX IF NOT EXISTS idx_room_assignments_type ON room_assignments(guest_type);

-- -----------------------------------------------------------------------------
-- 3. SITE INSPECTION LOGS - 현장 실사 기록
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_inspection_logs (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,

  -- 실사 기본 정보
  inspection_code TEXT NOT NULL,
  inspection_type TEXT NOT NULL CHECK (inspection_type IN (
    'initial_survey', 'venue_walkthrough', 'technical_assessment',
    'safety_audit', 'accessibility_review', 'final_inspection',
    'post_event_review', 'emergency_drill'
  )),
  inspection_date TEXT NOT NULL,
  inspection_time TEXT,
  duration_hours REAL,

  -- 장소 정보
  venue_id TEXT,
  venue_name TEXT NOT NULL,
  area_inspected TEXT NOT NULL, -- JSON array: ["main_hall", "lobby", "kitchen", "parking"]
  floor_plan_url TEXT,

  -- 참가자
  inspector_id TEXT NOT NULL,
  inspector_name TEXT NOT NULL,
  inspector_role TEXT,
  accompanying_team TEXT, -- JSON array of {name, role}
  venue_contact_name TEXT,
  venue_contact_phone TEXT,

  -- 체크리스트 결과
  checklist_template_id TEXT,
  checklist_items TEXT, -- JSON: [{item, category, status, notes, photo_url}]
  total_items INTEGER DEFAULT 0,
  passed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  na_items INTEGER DEFAULT 0,
  compliance_score REAL DEFAULT 0, -- Percentage

  -- 주요 발견사항
  findings TEXT, -- JSON array of {finding, severity, recommendation, photo_url}
  critical_issues INTEGER DEFAULT 0,
  major_issues INTEGER DEFAULT 0,
  minor_issues INTEGER DEFAULT 0,

  -- 카테고리별 평가
  safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
  accessibility_rating INTEGER CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
  capacity_rating INTEGER CHECK (capacity_rating >= 1 AND capacity_rating <= 5),
  technical_rating INTEGER CHECK (technical_rating >= 1 AND technical_rating <= 5),
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),

  -- 권장사항
  recommendations TEXT, -- JSON array
  required_actions TEXT, -- JSON: [{action, priority, deadline, assigned_to}]
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date TEXT,

  -- 문서 & 사진
  photos TEXT, -- JSON array of {url, caption, category}
  videos TEXT, -- JSON array of {url, caption}
  documents TEXT, -- JSON array of {url, name, type}
  report_url TEXT,

  -- 서명
  inspector_signature_url TEXT,
  venue_representative_signature_url TEXT,
  signed_at TEXT,

  -- 상태
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'in_progress', 'completed', 'report_pending', 'approved', 'requires_follow_up'
  )),

  -- 메타
  weather_conditions TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_inspections_event ON site_inspection_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_inspections_venue ON site_inspection_logs(venue_id);
CREATE INDEX IF NOT EXISTS idx_inspections_type ON site_inspection_logs(inspection_type);
CREATE INDEX IF NOT EXISTS idx_inspections_date ON site_inspection_logs(inspection_date);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON site_inspection_logs(status);
CREATE INDEX IF NOT EXISTS idx_inspections_inspector ON site_inspection_logs(inspector_id);

-- -----------------------------------------------------------------------------
-- 4. FACILITY INVENTORY - 시설/장비 인벤토리
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS facility_inventory (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,

  -- 장비/시설 기본 정보
  item_code TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_category TEXT NOT NULL CHECK (item_category IN (
    'furniture', 'av_equipment', 'staging', 'lighting', 'signage',
    'catering_equipment', 'decor', 'safety_equipment', 'cleaning',
    'power_electrical', 'networking', 'registration', 'other'
  )),
  item_subcategory TEXT,
  description TEXT,

  -- 공급자 정보
  supplier_id TEXT,
  supplier_name TEXT,
  supplier_contact TEXT,
  supplier_phone TEXT,

  -- 수량 및 단위
  quantity_ordered INTEGER NOT NULL DEFAULT 0,
  quantity_delivered INTEGER DEFAULT 0,
  quantity_installed INTEGER DEFAULT 0,
  quantity_returned INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'ea', -- ea, set, roll, box, etc.

  -- 비용
  unit_cost REAL,
  total_cost REAL,
  cost_type TEXT CHECK (cost_type IN ('purchase', 'rental', 'included', 'complimentary')),
  rental_period_days INTEGER,
  deposit_amount REAL,

  -- 배치 정보
  location_area TEXT, -- JSON: ["main_hall", "lobby"]
  specific_location TEXT,
  floor_plan_reference TEXT,
  setup_requirements TEXT, -- JSON array

  -- 일정
  delivery_date TEXT,
  delivery_time TEXT,
  setup_date TEXT,
  setup_time TEXT,
  teardown_date TEXT,
  teardown_time TEXT,
  return_date TEXT,

  -- 상태
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN (
    'pending', 'ordered', 'shipped', 'delivered', 'partial', 'delayed', 'cancelled'
  )),
  setup_status TEXT DEFAULT 'pending' CHECK (setup_status IN (
    'pending', 'in_progress', 'completed', 'needs_adjustment', 'verified'
  )),
  condition_on_delivery TEXT CHECK (condition_on_delivery IN (
    'new', 'excellent', 'good', 'fair', 'poor', 'damaged'
  )),
  condition_on_return TEXT,
  damage_notes TEXT,
  damage_photos TEXT, -- JSON array

  -- 담당자
  assigned_to TEXT,
  verified_by TEXT,
  verified_at TEXT,

  -- 추적
  tracking_number TEXT,
  serial_numbers TEXT, -- JSON array for multiple items

  -- 메타
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_inventory_event ON facility_inventory(event_id);
CREATE INDEX IF NOT EXISTS idx_inventory_category ON facility_inventory(item_category);
CREATE INDEX IF NOT EXISTS idx_inventory_supplier ON facility_inventory(supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_delivery ON facility_inventory(delivery_date);
CREATE INDEX IF NOT EXISTS idx_inventory_delivery_status ON facility_inventory(delivery_status);
CREATE INDEX IF NOT EXISTS idx_inventory_setup_status ON facility_inventory(setup_status);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON facility_inventory(location_area);

-- -----------------------------------------------------------------------------
-- 5. SITE SETUP TASKS - 현장 셋업 태스크
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_setup_tasks (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,

  -- 태스크 기본 정보
  task_code TEXT NOT NULL,
  task_name TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN (
    'setup', 'teardown', 'maintenance', 'adjustment', 'inspection', 'delivery', 'installation'
  )),
  category TEXT CHECK (category IN (
    'venue_prep', 'staging', 'av_setup', 'signage', 'furniture',
    'catering', 'registration', 'decoration', 'lighting', 'networking',
    'safety', 'cleaning', 'security', 'other'
  )),
  description TEXT,
  instructions TEXT, -- JSON array of steps

  -- 장소
  area TEXT NOT NULL, -- main_hall, lobby, etc.
  specific_location TEXT,

  -- 일정
  scheduled_date TEXT NOT NULL,
  scheduled_start_time TEXT,
  scheduled_end_time TEXT,
  estimated_duration_hours REAL,
  actual_start_time TEXT,
  actual_end_time TEXT,

  -- 의존성
  depends_on_tasks TEXT, -- JSON array of task IDs
  blocks_tasks TEXT, -- JSON array of task IDs

  -- 담당
  assigned_team TEXT, -- vendor, staff, volunteer
  assigned_team_id TEXT,
  assigned_lead TEXT,
  assigned_lead_phone TEXT,
  workers_required INTEGER DEFAULT 1,
  workers_assigned INTEGER DEFAULT 0,

  -- 자원
  equipment_needed TEXT, -- JSON array
  materials_needed TEXT, -- JSON array
  inventory_items TEXT, -- JSON array of facility_inventory IDs

  -- 상태
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'ready', 'in_progress', 'paused', 'completed', 'cancelled', 'blocked'
  )),
  completion_percentage INTEGER DEFAULT 0,
  quality_verified BOOLEAN DEFAULT FALSE,
  verified_by TEXT,
  verified_at TEXT,

  -- 이슈
  issues TEXT, -- JSON array of {issue, severity, resolved, resolution}
  blockers TEXT,

  -- 우선순위
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),

  -- 메타
  notes TEXT,
  photos TEXT, -- JSON array of completion photos
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_setup_tasks_event ON site_setup_tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_setup_tasks_type ON site_setup_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_setup_tasks_date ON site_setup_tasks(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_setup_tasks_status ON site_setup_tasks(status);
CREATE INDEX IF NOT EXISTS idx_setup_tasks_priority ON site_setup_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_setup_tasks_area ON site_setup_tasks(area);
CREATE INDEX IF NOT EXISTS idx_setup_tasks_team ON site_setup_tasks(assigned_team_id);

-- -----------------------------------------------------------------------------
-- 6. HOUSING INVOICES - 숙박 인보이스
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS housing_invoices (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  hotel_block_id TEXT,

  -- 인보이스 정보
  invoice_number TEXT NOT NULL,
  invoice_date TEXT NOT NULL,
  due_date TEXT,

  -- 수신자
  bill_to_type TEXT CHECK (bill_to_type IN ('organizer', 'sponsor', 'attendee', 'organization')),
  bill_to_name TEXT NOT NULL,
  bill_to_email TEXT,
  bill_to_address TEXT,
  bill_to_organization TEXT,

  -- 호텔 정보
  hotel_name TEXT NOT NULL,
  hotel_address TEXT,

  -- 금액
  subtotal REAL NOT NULL,
  tax_amount REAL DEFAULT 0,
  tax_rate REAL DEFAULT 0.1,
  service_charge REAL DEFAULT 0,
  discounts REAL DEFAULT 0,
  total_amount REAL NOT NULL,
  currency TEXT DEFAULT 'KRW',

  -- 상세 내역
  line_items TEXT, -- JSON: [{description, quantity, unit_price, amount, room_assignment_id}]

  -- 결제
  payment_method TEXT CHECK (payment_method IN (
    'credit_card', 'bank_transfer', 'check', 'cash', 'invoice', 'other'
  )),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN (
    'unpaid', 'partial', 'paid', 'overdue', 'cancelled', 'refunded'
  )),
  amount_paid REAL DEFAULT 0,
  balance_due REAL,
  payment_date TEXT,
  payment_reference TEXT,

  -- 메모
  notes TEXT,
  internal_notes TEXT,

  -- 상태
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')),
  sent_at TEXT,
  viewed_at TEXT,

  -- 메타
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),

  FOREIGN KEY (hotel_block_id) REFERENCES hotel_blocks(id)
);

CREATE INDEX IF NOT EXISTS idx_housing_invoices_event ON housing_invoices(event_id);
CREATE INDEX IF NOT EXISTS idx_housing_invoices_hotel ON housing_invoices(hotel_block_id);
CREATE INDEX IF NOT EXISTS idx_housing_invoices_status ON housing_invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_housing_invoices_due ON housing_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_housing_invoices_number ON housing_invoices(invoice_number);

-- -----------------------------------------------------------------------------
-- 초기 데이터: 샘플 호텔 블록
-- -----------------------------------------------------------------------------
INSERT OR IGNORE INTO hotel_blocks (
  id, event_id, hotel_id, hotel_name, star_rating, city, country,
  block_name, total_rooms_blocked, single_rooms, double_rooms, twin_rooms, suite_rooms,
  single_rate, double_rate, twin_rate, suite_rate, rate_currency,
  check_in_date, check_out_date, cutoff_date, contract_status
) VALUES
  ('block-001', 'sample-event', 'hotel-001', 'Grand Conference Hotel', 5, 'Seoul', 'KR',
   'Main Event Block', 100, 30, 40, 20, 10,
   180000, 220000, 220000, 450000, 'KRW',
   '2024-06-01', '2024-06-05', '2024-05-15', 'signed'),
  ('block-002', 'sample-event', 'hotel-002', 'Business Inn', 4, 'Seoul', 'KR',
   'Overflow Block', 50, 25, 20, 5, 0,
   120000, 150000, 150000, 0, 'KRW',
   '2024-06-01', '2024-06-05', '2024-05-20', 'negotiating');

-- -----------------------------------------------------------------------------
-- 샘플 시설 인벤토리
-- -----------------------------------------------------------------------------
INSERT OR IGNORE INTO facility_inventory (
  id, event_id, item_code, item_name, item_category, quantity_ordered,
  supplier_name, unit_cost, cost_type, location_area, delivery_date, delivery_status
) VALUES
  ('inv-001', 'sample-event', 'STG-001', 'Main Stage Platform', 'staging', 1,
   'Stage Pro Korea', 5000000, 'rental', '["main_hall"]', '2024-05-30', 'pending'),
  ('inv-002', 'sample-event', 'AV-001', 'LED Screen 4x3m', 'av_equipment', 2,
   'AV Solutions', 3000000, 'rental', '["main_hall", "breakout_1"]', '2024-05-30', 'pending'),
  ('inv-003', 'sample-event', 'FUR-001', 'Conference Chair', 'furniture', 500,
   'Furniture Plus', 15000, 'rental', '["main_hall", "lobby"]', '2024-05-31', 'pending');
