-- =====================================================
-- Domain E: Operations Management Tables
-- CMP-IS Standards: Skill 9 (Site), Skill 10 (Logistics)
-- =====================================================

-- 1. Venue Options (장소 후보 및 사양)
CREATE TABLE IF NOT EXISTS venue_options (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  venue_type TEXT NOT NULL, -- convention_center, hotel, outdoor, hybrid
  address TEXT,
  city TEXT,
  country TEXT,

  -- Capacity
  max_capacity INTEGER,
  seating_capacity INTEGER,
  standing_capacity INTEGER,

  -- Specifications
  total_area_sqm REAL,
  ceiling_height_m REAL,
  loading_dock BOOLEAN DEFAULT FALSE,
  freight_elevator BOOLEAN DEFAULT FALSE,
  parking_spaces INTEGER,

  -- Technical
  power_capacity_kw REAL,
  wifi_bandwidth_mbps INTEGER,
  av_equipment_included BOOLEAN DEFAULT FALSE,

  -- Financials
  daily_rental_rate REAL,
  setup_fee REAL,
  security_deposit REAL,
  cancellation_policy TEXT,

  -- Evaluation
  score REAL, -- 0-100 평가 점수
  pros TEXT, -- JSON array
  cons TEXT, -- JSON array
  site_visit_date TEXT,
  site_visit_notes TEXT,

  -- Status
  status TEXT DEFAULT 'candidate', -- candidate, shortlisted, selected, rejected
  priority_rank INTEGER,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- 2. Venue Rooms/Spaces (베뉴 내 공간)
CREATE TABLE IF NOT EXISTS venue_spaces (
  id TEXT PRIMARY KEY,
  venue_id TEXT NOT NULL,
  space_name TEXT NOT NULL,
  space_type TEXT NOT NULL, -- main_hall, breakout, registration, catering, backstage, vip

  capacity INTEGER,
  area_sqm REAL,

  -- Layout options
  theater_capacity INTEGER,
  classroom_capacity INTEGER,
  banquet_capacity INTEGER,
  cocktail_capacity INTEGER,

  -- Features
  natural_light BOOLEAN DEFAULT FALSE,
  blackout_capable BOOLEAN DEFAULT FALSE,
  divisible BOOLEAN DEFAULT FALSE,

  hourly_rate REAL,
  daily_rate REAL,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (venue_id) REFERENCES venue_options(id)
);

-- 3. Logistics Plan (물류 및 장비 계획)
CREATE TABLE IF NOT EXISTS logistics_plan (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  category TEXT NOT NULL, -- equipment, signage, decor, furniture, av, it

  item_name TEXT NOT NULL,
  item_description TEXT,
  quantity INTEGER DEFAULT 1,
  unit TEXT DEFAULT 'ea', -- ea, set, lot

  -- Sourcing
  source_type TEXT, -- rental, purchase, sponsor, venue_provided
  vendor_id TEXT,
  vendor_name TEXT,

  -- Costs
  unit_cost REAL,
  total_cost REAL,
  deposit_required REAL,

  -- Timeline
  order_date TEXT,
  delivery_date TEXT,
  setup_start TEXT,
  setup_end TEXT,
  teardown_start TEXT,
  teardown_end TEXT,
  return_date TEXT,

  -- Location
  destination_space TEXT,
  storage_location TEXT,

  -- Status
  status TEXT DEFAULT 'planned', -- planned, ordered, delivered, setup, active, teardown, returned
  tracking_number TEXT,

  -- Requirements
  power_required_kw REAL,
  setup_crew_size INTEGER,
  special_handling TEXT,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- 4. F&B Menus (식음료 계획)
CREATE TABLE IF NOT EXISTS fb_menus (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  meal_type TEXT NOT NULL, -- breakfast, coffee_break, lunch, dinner, cocktail, gala

  service_date TEXT,
  service_time TEXT,
  expected_guests INTEGER,

  -- Menu Details
  menu_name TEXT,
  menu_style TEXT, -- buffet, plated, stations, passed, family_style
  courses INTEGER,
  menu_items TEXT, -- JSON array of items

  -- Dietary
  vegetarian_count INTEGER DEFAULT 0,
  vegan_count INTEGER DEFAULT 0,
  halal_count INTEGER DEFAULT 0,
  kosher_count INTEGER DEFAULT 0,
  gluten_free_count INTEGER DEFAULT 0,
  allergy_notes TEXT,

  -- Vendor
  caterer_id TEXT,
  caterer_name TEXT,

  -- Pricing
  price_per_person REAL,
  service_charge_pct REAL,
  gratuity_pct REAL,
  total_cost REAL,

  -- Beverage
  beverage_package TEXT, -- none, soft_only, beer_wine, open_bar, premium_bar
  beverage_hours REAL,
  beverage_cost_pp REAL,

  -- Logistics
  service_location TEXT,
  setup_time TEXT,
  service_duration_mins INTEGER,

  status TEXT DEFAULT 'draft', -- draft, proposed, approved, confirmed, completed

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- 5. AV/Production Equipment (음향/조명/영상)
CREATE TABLE IF NOT EXISTS av_equipment (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  category TEXT NOT NULL, -- audio, lighting, video, staging, rigging

  equipment_name TEXT NOT NULL,
  model TEXT,
  quantity INTEGER DEFAULT 1,

  -- Technical Specs
  power_requirement_w REAL,
  weight_kg REAL,
  dimensions TEXT, -- JSON: {width, height, depth}

  -- Sourcing
  vendor_id TEXT,
  vendor_name TEXT,
  rental_daily_rate REAL,
  rental_days INTEGER,
  total_rental_cost REAL,

  -- Setup
  requires_rigging BOOLEAN DEFAULT FALSE,
  setup_time_hours REAL,
  operator_required BOOLEAN DEFAULT FALSE,
  operator_cost_daily REAL,

  -- Location
  assigned_space TEXT,
  position_notes TEXT,

  status TEXT DEFAULT 'planned',

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- 6. Transportation & Shuttle (교통/셔틀)
CREATE TABLE IF NOT EXISTS transportation (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  transport_type TEXT NOT NULL, -- shuttle, charter_bus, limo, taxi_voucher, rideshare

  route_name TEXT,
  origin TEXT,
  destination TEXT,

  service_date TEXT,
  departure_time TEXT,
  frequency_mins INTEGER, -- for shuttles

  vehicle_type TEXT,
  vehicle_capacity INTEGER,
  num_vehicles INTEGER,

  vendor_name TEXT,
  cost_per_trip REAL,
  total_trips INTEGER,
  total_cost REAL,

  passenger_count_expected INTEGER,

  status TEXT DEFAULT 'planned',

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- 7. Signage & Wayfinding (사이니지)
CREATE TABLE IF NOT EXISTS signage (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  sign_type TEXT NOT NULL, -- banner, directional, room_id, schedule_board, sponsor, digital

  content TEXT,
  dimensions TEXT, -- e.g., "2m x 1m"
  material TEXT, -- vinyl, foam_board, fabric, digital

  quantity INTEGER DEFAULT 1,
  location TEXT,

  -- Production
  vendor_name TEXT,
  design_status TEXT DEFAULT 'pending', -- pending, in_progress, approved, printed
  production_cost REAL,

  -- Installation
  install_date TEXT,
  install_method TEXT, -- stand, hang, mount, digital
  requires_power BOOLEAN DEFAULT FALSE,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- 8. Staff Assignments (현장 인력 배치)
CREATE TABLE IF NOT EXISTS operations_staff (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,

  staff_role TEXT NOT NULL, -- coordinator, registration, usher, security, av_tech, runner
  shift_date TEXT,
  shift_start TEXT,
  shift_end TEXT,

  staff_name TEXT,
  staff_contact TEXT,

  assigned_area TEXT,
  supervisor TEXT,

  -- Sourcing
  source TEXT, -- internal, temp_agency, volunteer, vendor
  agency_name TEXT,
  hourly_rate REAL,
  total_hours REAL,
  total_cost REAL,

  uniform_required BOOLEAN DEFAULT FALSE,
  equipment_issued TEXT, -- JSON array

  status TEXT DEFAULT 'scheduled', -- scheduled, confirmed, checked_in, completed, no_show

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- 9. Safety & Emergency (안전/비상계획)
CREATE TABLE IF NOT EXISTS safety_plans (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,

  plan_type TEXT NOT NULL, -- evacuation, medical, fire, security, weather, crowd_management

  plan_document TEXT, -- URL or content
  emergency_contacts TEXT, -- JSON array

  medical_station_locations TEXT, -- JSON array
  first_aid_kits INTEGER,
  aed_locations TEXT, -- JSON array

  security_personnel INTEGER,
  security_checkpoints TEXT, -- JSON array

  evacuation_routes TEXT, -- JSON array
  assembly_points TEXT, -- JSON array

  permits_required TEXT, -- JSON array
  permits_obtained BOOLEAN DEFAULT FALSE,

  insurance_policy TEXT,
  insurance_coverage REAL,

  last_drill_date TEXT,

  status TEXT DEFAULT 'draft',
  approved_by TEXT,
  approved_date TEXT,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- 10. Operations Timeline (운영 타임라인)
CREATE TABLE IF NOT EXISTS operations_timeline (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,

  phase TEXT NOT NULL, -- pre_event, load_in, setup, event_day, teardown, load_out
  activity TEXT NOT NULL,

  scheduled_start TEXT,
  scheduled_end TEXT,
  actual_start TEXT,
  actual_end TEXT,

  responsible_party TEXT,
  crew_required INTEGER,

  dependencies TEXT, -- JSON array of activity IDs
  notes TEXT,

  status TEXT DEFAULT 'scheduled', -- scheduled, in_progress, completed, delayed, cancelled
  delay_reason TEXT,

  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_venue_options_event ON venue_options(event_id);
CREATE INDEX IF NOT EXISTS idx_venue_options_status ON venue_options(status);
CREATE INDEX IF NOT EXISTS idx_logistics_event ON logistics_plan(event_id);
CREATE INDEX IF NOT EXISTS idx_logistics_status ON logistics_plan(status);
CREATE INDEX IF NOT EXISTS idx_fb_menus_event ON fb_menus(event_id);
CREATE INDEX IF NOT EXISTS idx_av_equipment_event ON av_equipment(event_id);
CREATE INDEX IF NOT EXISTS idx_transportation_event ON transportation(event_id);
CREATE INDEX IF NOT EXISTS idx_signage_event ON signage(event_id);
CREATE INDEX IF NOT EXISTS idx_ops_staff_event ON operations_staff(event_id);
CREATE INDEX IF NOT EXISTS idx_safety_plans_event ON safety_plans(event_id);
CREATE INDEX IF NOT EXISTS idx_ops_timeline_event ON operations_timeline(event_id);
CREATE INDEX IF NOT EXISTS idx_ops_timeline_phase ON operations_timeline(phase);
