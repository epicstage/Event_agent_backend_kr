-- ============================================================================
-- Migration 005: Marketing Domain Tables (Domain C)
-- CMP-IS Domain C: Marketing Management
-- ============================================================================

-- ============================================================================
-- ATTENDEE SEGMENTS
-- 참석자 세그먼트 (타겟 그룹 정의)
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendee_segments (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    segment_name TEXT NOT NULL,
    segment_type TEXT NOT NULL CHECK (segment_type IN ('demographic', 'behavioral', 'psychographic', 'geographic', 'custom')),
    description TEXT,

    -- 세그먼트 기준
    criteria JSON NOT NULL DEFAULT '{}',
    -- 예: {"age_range": [25, 45], "industry": ["tech", "finance"], "job_level": ["manager", "director"]}

    -- 세그먼트 규모
    estimated_size INTEGER DEFAULT 0,
    actual_size INTEGER DEFAULT 0,

    -- 가치 평가
    priority TEXT CHECK (priority IN ('primary', 'secondary', 'tertiary')),
    lifetime_value_estimate REAL,
    conversion_potential TEXT CHECK (conversion_potential IN ('high', 'medium', 'low')),

    -- 커뮤니케이션 선호
    preferred_channels JSON DEFAULT '[]',
    -- 예: ["email", "social_media", "sms", "direct_mail"]

    messaging_themes JSON DEFAULT '[]',
    -- 예: ["networking", "learning", "innovation"]

    -- 상태
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'inactive', 'archived')),

    -- 메타
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    created_by TEXT
);

-- 세그먼트 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_attendee_segments_event ON attendee_segments(event_id);
CREATE INDEX IF NOT EXISTS idx_attendee_segments_type ON attendee_segments(segment_type);
CREATE INDEX IF NOT EXISTS idx_attendee_segments_priority ON attendee_segments(priority);

-- ============================================================================
-- MARKETING CAMPAIGNS
-- 마케팅 캠페인 (프로모션, 광고, 커뮤니케이션)
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    campaign_name TEXT NOT NULL,
    campaign_type TEXT NOT NULL CHECK (campaign_type IN (
        'awareness', 'acquisition', 'engagement', 'conversion',
        'retention', 'advocacy', 'reactivation'
    )),

    -- 캠페인 목표
    objective TEXT,
    target_kpis JSON DEFAULT '{}',
    -- 예: {"registrations": 500, "email_opens": 2000, "clicks": 800}

    -- 타겟 세그먼트
    target_segments JSON DEFAULT '[]',
    -- 세그먼트 ID 배열

    -- 채널 전략
    channels JSON NOT NULL DEFAULT '[]',
    -- 예: [{"channel": "email", "budget_percent": 40}, {"channel": "social", "budget_percent": 30}]

    primary_channel TEXT CHECK (primary_channel IN (
        'email', 'social_media', 'paid_search', 'display_ads',
        'content_marketing', 'influencer', 'pr', 'direct_mail',
        'sms', 'push_notification', 'event_listing'
    )),

    -- 예산
    budget_allocated REAL DEFAULT 0,
    budget_spent REAL DEFAULT 0,
    currency TEXT DEFAULT 'KRW',

    -- 일정
    start_date TEXT,
    end_date TEXT,

    -- 콘텐츠
    creative_assets JSON DEFAULT '[]',
    -- 예: [{"type": "banner", "url": "...", "size": "300x250"}]

    messaging JSON DEFAULT '{}',
    -- 예: {"headline": "...", "body": "...", "cta": "Register Now"}

    -- 성과 (실시간 업데이트)
    performance_metrics JSON DEFAULT '{}',
    -- 예: {"impressions": 50000, "clicks": 1200, "conversions": 85, "spend": 500000}

    roi_calculated REAL,

    -- 상태
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')),

    -- A/B 테스트
    ab_test_enabled INTEGER DEFAULT 0,
    ab_variants JSON DEFAULT '[]',

    -- 메타
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    created_by TEXT,
    approved_by TEXT,
    approved_at TEXT
);

-- 캠페인 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_event ON marketing_campaigns(event_id);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_type ON marketing_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON marketing_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_dates ON marketing_campaigns(start_date, end_date);

-- ============================================================================
-- REGISTRATION STATS
-- 등록 통계 (실시간 집계)
-- ============================================================================
CREATE TABLE IF NOT EXISTS registration_stats (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    snapshot_date TEXT NOT NULL,
    snapshot_type TEXT NOT NULL CHECK (snapshot_type IN ('daily', 'weekly', 'monthly', 'realtime')),

    -- 등록 현황
    total_registrations INTEGER DEFAULT 0,
    new_registrations INTEGER DEFAULT 0,
    cancelled_registrations INTEGER DEFAULT 0,
    net_registrations INTEGER DEFAULT 0,

    -- 등록 유형별
    by_ticket_type JSON DEFAULT '{}',
    -- 예: {"vip": 50, "general": 300, "student": 75}

    by_segment JSON DEFAULT '{}',
    -- 예: {"segment_id_1": 150, "segment_id_2": 200}

    -- 소스 분석
    by_source JSON DEFAULT '{}',
    -- 예: {"email": 200, "social": 100, "organic": 50, "paid": 75}

    by_campaign JSON DEFAULT '{}',
    -- 캠페인별 등록 수

    -- 지역 분석
    by_geography JSON DEFAULT '{}',
    -- 예: {"seoul": 300, "busan": 50, "overseas": 25}

    -- 전환 퍼널
    funnel_metrics JSON DEFAULT '{}',
    -- 예: {"page_views": 10000, "started_registration": 2000, "completed": 500, "paid": 450}

    conversion_rate REAL,
    -- completed / started_registration * 100

    -- 매출
    revenue_total REAL DEFAULT 0,
    revenue_by_type JSON DEFAULT '{}',
    average_order_value REAL,
    currency TEXT DEFAULT 'KRW',

    -- 용량 대비
    capacity_total INTEGER,
    capacity_used_percent REAL,

    -- 목표 대비
    target_registrations INTEGER,
    target_achievement_percent REAL,

    -- 트렌드
    growth_rate_wow REAL,
    -- Week over Week 성장률

    growth_rate_dod REAL,
    -- Day over Day 성장률

    projected_final_count INTEGER,
    -- 추세 기반 최종 예상

    -- 메타
    created_at TEXT DEFAULT (datetime('now'))
);

-- 등록 통계 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_registration_stats_event ON registration_stats(event_id);
CREATE INDEX IF NOT EXISTS idx_registration_stats_date ON registration_stats(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_registration_stats_type ON registration_stats(snapshot_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_registration_stats_unique ON registration_stats(event_id, snapshot_date, snapshot_type);

-- ============================================================================
-- MARKETING CONTENT
-- 마케팅 콘텐츠 (이메일, 소셜, 광고 소재)
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketing_content (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    campaign_id TEXT,

    content_type TEXT NOT NULL CHECK (content_type IN (
        'email_template', 'social_post', 'ad_creative', 'landing_page',
        'blog_post', 'press_release', 'video_script', 'infographic'
    )),

    content_name TEXT NOT NULL,
    version INTEGER DEFAULT 1,

    -- 콘텐츠 본문
    subject_line TEXT,
    headline TEXT,
    body_text TEXT,
    cta_text TEXT,
    cta_url TEXT,

    -- 미디어
    media_assets JSON DEFAULT '[]',
    -- 예: [{"type": "image", "url": "...", "alt": "..."}]

    -- 타겟팅
    target_segments JSON DEFAULT '[]',
    personalization_fields JSON DEFAULT '[]',
    -- 예: ["first_name", "company", "ticket_type"]

    -- 상태
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'active', 'archived')),

    -- 성과
    performance JSON DEFAULT '{}',
    -- 예: {"sends": 5000, "opens": 1200, "clicks": 300, "conversions": 45}

    -- 메타
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    created_by TEXT,
    approved_by TEXT
);

-- 콘텐츠 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_marketing_content_event ON marketing_content(event_id);
CREATE INDEX IF NOT EXISTS idx_marketing_content_campaign ON marketing_content(campaign_id);
CREATE INDEX IF NOT EXISTS idx_marketing_content_type ON marketing_content(content_type);

-- ============================================================================
-- MARKETING CHANNELS
-- 마케팅 채널 설정 및 성과
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketing_channels (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,

    channel_name TEXT NOT NULL CHECK (channel_name IN (
        'email', 'facebook', 'instagram', 'linkedin', 'twitter', 'youtube',
        'google_ads', 'naver_ads', 'kakao_ads', 'display_network',
        'influencer', 'pr', 'content_syndication', 'affiliate',
        'sms', 'push', 'direct_mail', 'organic_search'
    )),

    -- 설정
    is_active INTEGER DEFAULT 1,
    account_credentials JSON DEFAULT '{}',
    -- 암호화된 API 키/토큰

    -- 예산
    budget_allocated REAL DEFAULT 0,
    budget_spent REAL DEFAULT 0,

    -- 성과 요약
    total_impressions INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    total_conversions INTEGER DEFAULT 0,
    total_revenue REAL DEFAULT 0,

    -- 효율성 지표
    ctr REAL,
    -- Click Through Rate

    cpc REAL,
    -- Cost Per Click

    cpa REAL,
    -- Cost Per Acquisition

    roas REAL,
    -- Return On Ad Spend

    -- 최근 성과 (7일)
    recent_performance JSON DEFAULT '{}',

    -- 메타
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 채널 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_marketing_channels_event ON marketing_channels(event_id);
CREATE INDEX IF NOT EXISTS idx_marketing_channels_name ON marketing_channels(channel_name);
CREATE INDEX IF NOT EXISTS idx_marketing_channels_active ON marketing_channels(is_active);

-- ============================================================================
-- PROMOTIONAL CODES
-- 프로모션 코드 (할인, 특별 혜택)
-- ============================================================================
CREATE TABLE IF NOT EXISTS promotional_codes (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    campaign_id TEXT,

    code TEXT NOT NULL,
    code_type TEXT NOT NULL CHECK (code_type IN ('percentage', 'fixed_amount', 'free_ticket', 'upgrade', 'bundle')),

    -- 할인 정보
    discount_value REAL,
    discount_percent REAL,
    max_discount_amount REAL,

    -- 적용 조건
    applicable_ticket_types JSON DEFAULT '[]',
    min_order_amount REAL,
    min_quantity INTEGER,

    -- 사용 제한
    usage_limit_total INTEGER,
    usage_limit_per_user INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,

    -- 유효 기간
    valid_from TEXT,
    valid_until TEXT,

    -- 타겟
    target_segments JSON DEFAULT '[]',
    is_public INTEGER DEFAULT 0,

    -- 상태
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'expired', 'exhausted')),

    -- 성과
    total_discount_given REAL DEFAULT 0,
    total_revenue_generated REAL DEFAULT 0,

    -- 메타
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    created_by TEXT
);

-- 프로모션 코드 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_promotional_codes_event ON promotional_codes(event_id);
CREATE INDEX IF NOT EXISTS idx_promotional_codes_code ON promotional_codes(code);
CREATE INDEX IF NOT EXISTS idx_promotional_codes_status ON promotional_codes(status);
CREATE INDEX IF NOT EXISTS idx_promotional_codes_valid ON promotional_codes(valid_from, valid_until);

-- ============================================================================
-- ATTENDEE JOURNEY TOUCHPOINTS
-- 참석자 여정 터치포인트 (트래킹)
-- ============================================================================
CREATE TABLE IF NOT EXISTS attendee_touchpoints (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    attendee_id TEXT,
    -- NULL이면 익명 방문자

    session_id TEXT,
    touchpoint_type TEXT NOT NULL CHECK (touchpoint_type IN (
        'page_view', 'email_open', 'email_click', 'ad_impression', 'ad_click',
        'social_engagement', 'form_start', 'form_complete', 'registration',
        'payment', 'ticket_download', 'calendar_add', 'share', 'referral'
    )),

    -- 터치포인트 상세
    channel TEXT,
    campaign_id TEXT,
    content_id TEXT,
    source TEXT,
    medium TEXT,

    -- 페이지/콘텐츠 정보
    page_url TEXT,
    referrer_url TEXT,

    -- 디바이스 정보
    device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    browser TEXT,
    os TEXT,

    -- 지역 정보
    country TEXT,
    city TEXT,

    -- 시간
    timestamp TEXT DEFAULT (datetime('now')),
    duration_seconds INTEGER,

    -- 전환 정보
    conversion_value REAL,
    is_conversion INTEGER DEFAULT 0,

    -- Attribution
    attribution_model TEXT CHECK (attribution_model IN ('first_touch', 'last_touch', 'linear', 'time_decay')),
    attribution_weight REAL DEFAULT 1.0
);

-- 터치포인트 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_attendee_touchpoints_event ON attendee_touchpoints(event_id);
CREATE INDEX IF NOT EXISTS idx_attendee_touchpoints_attendee ON attendee_touchpoints(attendee_id);
CREATE INDEX IF NOT EXISTS idx_attendee_touchpoints_type ON attendee_touchpoints(touchpoint_type);
CREATE INDEX IF NOT EXISTS idx_attendee_touchpoints_campaign ON attendee_touchpoints(campaign_id);
CREATE INDEX IF NOT EXISTS idx_attendee_touchpoints_timestamp ON attendee_touchpoints(timestamp);

-- ============================================================================
-- MARKETING CALENDAR
-- 마케팅 캘린더 (일정 관리)
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketing_calendar (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,

    activity_name TEXT NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'campaign_launch', 'campaign_end', 'email_send', 'social_post',
        'ad_launch', 'content_publish', 'press_release', 'deadline',
        'milestone', 'review', 'approval'
    )),

    -- 일정
    scheduled_date TEXT NOT NULL,
    scheduled_time TEXT,
    duration_minutes INTEGER,

    -- 연결
    campaign_id TEXT,
    content_id TEXT,

    -- 상세
    description TEXT,
    assignee TEXT,

    -- 상태
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'delayed')),

    -- 반복
    is_recurring INTEGER DEFAULT 0,
    recurrence_pattern TEXT,
    -- 예: "weekly", "daily"

    -- 알림
    reminder_minutes INTEGER,

    -- 메타
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    created_by TEXT
);

-- 캘린더 조회 인덱스
CREATE INDEX IF NOT EXISTS idx_marketing_calendar_event ON marketing_calendar(event_id);
CREATE INDEX IF NOT EXISTS idx_marketing_calendar_date ON marketing_calendar(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_marketing_calendar_type ON marketing_calendar(activity_type);
CREATE INDEX IF NOT EXISTS idx_marketing_calendar_campaign ON marketing_calendar(campaign_id);

-- ============================================================================
-- CROSS-DOMAIN CONTEXT CACHE
-- 크로스 도메인 컨텍스트 캐시 (ContextBridge용)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cross_domain_context (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    domain TEXT NOT NULL CHECK (domain IN ('STR', 'FIN', 'PRJ', 'MKT')),

    context_data JSON NOT NULL,

    -- 캐시 관리
    cached_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT,
    is_valid INTEGER DEFAULT 1,

    -- 변경 추적
    last_change_type TEXT,
    last_change_at TEXT
);

-- 컨텍스트 캐시 인덱스
CREATE INDEX IF NOT EXISTS idx_cross_domain_context_event ON cross_domain_context(event_id);
CREATE INDEX IF NOT EXISTS idx_cross_domain_context_domain ON cross_domain_context(domain);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cross_domain_context_unique ON cross_domain_context(event_id, domain);

-- ============================================================================
-- IMPACT ALERTS LOG
-- 크로스 도메인 영향 알림 로그
-- ============================================================================
CREATE TABLE IF NOT EXISTS impact_alerts (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,

    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'budget_impact', 'schedule_risk', 'stakeholder_concern',
        'resource_constraint', 'goal_at_risk', 'marketing_performance'
    )),

    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    source_domain TEXT NOT NULL CHECK (source_domain IN ('STR', 'FIN', 'PRJ', 'MKT')),
    affected_domains JSON NOT NULL DEFAULT '[]',

    title TEXT NOT NULL,
    description TEXT,

    impact_analysis JSON DEFAULT '{}',
    -- ImpactAnalyzer 결과

    recommended_actions JSON DEFAULT '[]',

    -- 상태
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'acknowledged', 'in_progress', 'resolved', 'dismissed')),
    acknowledged_by TEXT,
    acknowledged_at TEXT,
    resolved_by TEXT,
    resolved_at TEXT,
    resolution_notes TEXT,

    -- 메타
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 알림 로그 인덱스
CREATE INDEX IF NOT EXISTS idx_impact_alerts_event ON impact_alerts(event_id);
CREATE INDEX IF NOT EXISTS idx_impact_alerts_type ON impact_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_impact_alerts_severity ON impact_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_impact_alerts_status ON impact_alerts(status);
CREATE INDEX IF NOT EXISTS idx_impact_alerts_source ON impact_alerts(source_domain);
