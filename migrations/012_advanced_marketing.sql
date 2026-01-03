-- Migration 012: Advanced Marketing Domain (Domain I)
-- CMP-IS Skills 17 & 18: Marketing Analytics & CRM Integration

-- Marketing Analytics 테이블
CREATE TABLE IF NOT EXISTS marketing_analytics (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  campaign_id TEXT,
  metric_type TEXT NOT NULL, -- 'conversion', 'engagement', 'reach', 'roi', 'attribution'
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  dimension TEXT, -- 'channel', 'segment', 'time_period', 'content_type'
  dimension_value TEXT,
  comparison_baseline REAL,
  variance_percent REAL,
  confidence_score REAL,
  data_source TEXT, -- 'google_analytics', 'social_media', 'email', 'crm', 'survey'
  measured_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- CRM Lead Segments 테이블
CREATE TABLE IF NOT EXISTS crm_lead_segments (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  segment_name TEXT NOT NULL,
  segment_criteria TEXT NOT NULL, -- JSON: 필터 조건
  segment_size INTEGER NOT NULL,
  engagement_score REAL,
  conversion_potential TEXT, -- 'high', 'medium', 'low'
  lifecycle_stage TEXT, -- 'awareness', 'interest', 'consideration', 'decision', 'loyalty'
  preferred_channels TEXT, -- JSON array
  last_interaction_date TEXT,
  avg_deal_value REAL,
  churn_risk REAL,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Campaign Performance Logs 테이블
CREATE TABLE IF NOT EXISTS campaign_performance_logs (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT NOT NULL,
  channel TEXT NOT NULL, -- 'email', 'social', 'paid_search', 'display', 'content', 'influencer'
  log_date TEXT NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend REAL DEFAULT 0,
  revenue_attributed REAL DEFAULT 0,
  ctr REAL, -- click-through rate
  cpc REAL, -- cost per click
  cpa REAL, -- cost per acquisition
  roas REAL, -- return on ad spend
  engagement_rate REAL,
  bounce_rate REAL,
  avg_session_duration REAL,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Attendee Behavior Data 테이블
CREATE TABLE IF NOT EXISTS attendee_behavior_data (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  attendee_id TEXT NOT NULL,
  behavior_type TEXT NOT NULL, -- 'page_view', 'session_attend', 'booth_visit', 'content_download', 'networking', 'purchase'
  behavior_details TEXT, -- JSON: 상세 행동 데이터
  touchpoint TEXT, -- 'website', 'app', 'email', 'onsite', 'virtual'
  session_id TEXT,
  duration_seconds INTEGER,
  interaction_count INTEGER DEFAULT 1,
  sentiment_score REAL, -- -1 to 1
  interests_detected TEXT, -- JSON array
  referral_source TEXT,
  device_type TEXT,
  occurred_at TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Personalization Rules 테이블
CREATE TABLE IF NOT EXISTS personalization_rules (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  target_segment TEXT, -- segment_id 또는 criteria
  trigger_condition TEXT NOT NULL, -- JSON: 트리거 조건
  action_type TEXT NOT NULL, -- 'content', 'offer', 'channel', 'timing', 'message'
  action_config TEXT NOT NULL, -- JSON: 액션 설정
  priority INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  performance_lift REAL, -- A/B 테스트 결과
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Retargeting Audiences 테이블
CREATE TABLE IF NOT EXISTS retargeting_audiences (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  audience_name TEXT NOT NULL,
  audience_type TEXT NOT NULL, -- 'website_visitor', 'cart_abandoner', 'past_attendee', 'engaged_lead', 'lookalike'
  source_platform TEXT, -- 'google', 'facebook', 'linkedin', 'twitter', 'custom'
  audience_size INTEGER,
  match_rate REAL,
  inclusion_criteria TEXT, -- JSON
  exclusion_criteria TEXT, -- JSON
  lookback_days INTEGER DEFAULT 30,
  refresh_frequency TEXT, -- 'daily', 'weekly', 'manual'
  last_synced_at TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_marketing_analytics_event ON marketing_analytics(event_id);
CREATE INDEX IF NOT EXISTS idx_marketing_analytics_campaign ON marketing_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_marketing_analytics_type ON marketing_analytics(metric_type);
CREATE INDEX IF NOT EXISTS idx_crm_segments_event ON crm_lead_segments(event_id);
CREATE INDEX IF NOT EXISTS idx_crm_segments_stage ON crm_lead_segments(lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_event ON campaign_performance_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_campaign ON campaign_performance_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_date ON campaign_performance_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_attendee_behavior_event ON attendee_behavior_data(event_id);
CREATE INDEX IF NOT EXISTS idx_attendee_behavior_attendee ON attendee_behavior_data(attendee_id);
CREATE INDEX IF NOT EXISTS idx_attendee_behavior_type ON attendee_behavior_data(behavior_type);
CREATE INDEX IF NOT EXISTS idx_personalization_event ON personalization_rules(event_id);
CREATE INDEX IF NOT EXISTS idx_retargeting_event ON retargeting_audiences(event_id);
