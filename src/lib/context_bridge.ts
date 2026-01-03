/**
 * Cross-Domain Context Bridge
 *
 * 전 도메인 신경망 통합 - STR, FIN, PRJ, MKT, OPS, HR 도메인 간 컨텍스트 공유
 * 에이전트들이 서로의 상태를 실시간으로 참조할 수 있게 함
 */

// =============================================================================
// TYPES
// =============================================================================

export interface StrategyContext {
  event_id: string;
  goals: Array<{
    id: string;
    name: string;
    priority: "high" | "medium" | "low";
    status: "active" | "at_risk" | "achieved";
    kpis: Array<{ name: string; target: number; current: number }>;
  }>;
  stakeholders: Array<{
    id: string;
    name: string;
    influence: "high" | "medium" | "low";
    sentiment: "positive" | "neutral" | "negative";
  }>;
  risks: Array<{
    id: string;
    name: string;
    severity: "critical" | "high" | "medium" | "low";
    probability: number;
    mitigation_status: "planned" | "in_progress" | "completed";
  }>;
  updated_at: string;
}

export interface FinanceContext {
  event_id: string;
  budget: {
    total: number;
    allocated: number;
    spent: number;
    remaining: number;
    currency: string;
  };
  sponsors: Array<{
    id: string;
    name: string;
    committed_amount: number;
    received_amount: number;
    status: "confirmed" | "pending" | "at_risk";
  }>;
  expenses: {
    by_category: Record<string, number>;
    variance_percent: number;
    forecast_accuracy: number;
  };
  cashflow: {
    current_balance: number;
    projected_shortfall: number | null;
    next_major_payment: { amount: number; due_date: string } | null;
  };
  updated_at: string;
}

export interface ProjectContext {
  event_id: string;
  schedule: {
    start_date: string;
    end_date: string;
    current_phase: string;
    days_remaining: number;
    on_track: boolean;
  };
  milestones: Array<{
    id: string;
    name: string;
    due_date: string;
    status: "completed" | "on_track" | "at_risk" | "delayed";
    completion_percent: number;
  }>;
  tasks: {
    total: number;
    completed: number;
    in_progress: number;
    blocked: number;
    overdue: number;
  };
  resources: {
    team_size: number;
    utilization_percent: number;
    critical_gaps: string[];
  };
  issues: {
    open: number;
    critical: number;
    resolved_this_week: number;
  };
  updated_at: string;
}

export interface MarketingContext {
  event_id: string;
  campaigns: Array<{
    id: string;
    name: string;
    type: "awareness" | "engagement" | "conversion" | "retention";
    status: "planning" | "active" | "paused" | "completed";
    budget: number;
    spent: number;
    start_date: string;
    end_date: string;
  }>;
  channels: {
    social_media: {
      platforms: string[];
      total_followers: number;
      engagement_rate: number;
    };
    email: {
      list_size: number;
      open_rate: number;
      click_rate: number;
    };
    pr: {
      media_mentions: number;
      press_releases: number;
      media_value: number;
    };
  };
  performance: {
    registrations: {
      target: number;
      current: number;
      conversion_rate: number;
    };
    reach: {
      impressions: number;
      unique_reach: number;
    };
    engagement: {
      total_interactions: number;
      sentiment_score: number; // -1 to 1
    };
  };
  content: {
    total_assets: number;
    pending_approval: number;
    scheduled: number;
  };
  influencers: Array<{
    id: string;
    name: string;
    platform: string;
    followers: number;
    status: "contacted" | "confirmed" | "declined" | "active";
    deliverables: number;
  }>;
  updated_at: string;
}

export interface OperationsContext {
  event_id: string;
  venue: {
    id: string;
    name: string;
    capacity: number;
    status: "sourcing" | "shortlisted" | "contracted" | "confirmed";
    rental_cost: number;
    setup_date: string;
    event_date: string;
    teardown_date: string;
  } | null;
  site_management: {
    floor_plan_status: "pending" | "draft" | "approved";
    room_setups: Array<{
      room_name: string;
      setup_type: string;
      capacity: number;
      status: "planned" | "ready" | "in_use";
    }>;
    av_equipment: {
      total_items: number;
      confirmed: number;
      pending: number;
      issues: number;
    };
    signage: {
      total_pieces: number;
      designed: number;
      produced: number;
      installed: number;
    };
    permits: {
      required: number;
      obtained: number;
      pending: number;
    };
  };
  logistics: {
    fb_status: {
      caterer_confirmed: boolean;
      menu_approved: boolean;
      dietary_accommodations: number;
      estimated_headcount: number;
    };
    transportation: {
      shuttle_services: number;
      parking_capacity: number;
      valet_available: boolean;
    };
    accommodation: {
      room_block_size: number;
      rooms_booked: number;
      cutoff_date: string;
    };
    registration: {
      stations_planned: number;
      staff_assigned: number;
      tech_ready: boolean;
    };
  };
  safety_security: {
    security_personnel: number;
    medical_staff: number;
    emergency_plan_status: "pending" | "draft" | "approved";
    insurance_confirmed: boolean;
    safety_briefing_scheduled: boolean;
  };
  staffing: {
    total_required: number;
    confirmed: number;
    pending: number;
    roles: Array<{
      role: string;
      required: number;
      assigned: number;
    }>;
  };
  vendors: Array<{
    id: string;
    name: string;
    category: string;
    contract_status: "pending" | "negotiating" | "signed";
    payment_status: "pending" | "partial" | "paid";
    delivery_status: "not_started" | "in_progress" | "delivered";
  }>;
  issues: {
    open: number;
    critical: number;
    resolved_this_week: number;
  };
  updated_at: string;
}

export interface HRContext {
  event_id: string;
  staffing: {
    total_required: number;
    total_confirmed: number;
    total_pending: number;
    total_active: number;
    by_role: Array<{
      role: string;
      required: number;
      confirmed: number;
      active: number;
    }>;
  };
  recruitment: {
    open_positions: number;
    applications_received: number;
    interviews_scheduled: number;
    offers_pending: number;
    conversion_rate: number;
  };
  training: {
    programs_scheduled: number;
    staff_trained: number;
    staff_pending: number;
    completion_rate: number;
  };
  volunteers: {
    registered: number;
    confirmed: number;
    active: number;
    roles_filled: number;
    roles_open: number;
  };
  labor_costs: {
    budget: number;
    spent: number;
    projected: number;
    variance_percent: number;
  };
  compliance: {
    contracts_signed: number;
    contracts_pending: number;
    labor_law_issues: number;
    safety_certifications: {
      required: number;
      verified: number;
    };
  };
  attendance: {
    check_in_rate: number;
    no_show_count: number;
    overtime_hours: number;
  };
  performance: {
    avg_rating: number;
    issues_reported: number;
    recognition_given: number;
  };
  updated_at: string;
}

export interface MeetingsContext {
  event_id: string;
  program: {
    total_sessions: number;
    keynotes: number;
    breakouts: number;
    workshops: number;
    panels: number;
    networking: number;
    tracks: Array<{
      id: string;
      name: string;
      session_count: number;
      capacity: number;
    }>;
    hybrid_sessions: number;
    virtual_only: number;
  };
  speakers: {
    total_invited: number;
    confirmed: number;
    pending: number;
    declined: number;
    by_tier: {
      A: number;
      B: number;
      C: number;
    };
    contracts_signed: number;
    honorarium_budget: number;
    honorarium_committed: number;
  };
  content: {
    abstracts_submitted: number;
    abstracts_accepted: number;
    abstracts_pending_review: number;
    presentations_received: number;
    presentations_pending: number;
    recordings_planned: number;
    recordings_completed: number;
  };
  schedule: {
    schedule_published: boolean;
    conflicts_detected: number;
    utilization_rate: number;
    parallel_sessions_max: number;
  };
  ce_credits: {
    accreditation_applied: boolean;
    credits_approved: number;
    sessions_eligible: number;
  };
  engagement: {
    app_adoption_rate: number;
    session_ratings_avg: number;
    feedback_response_rate: number;
    networking_meetings_scheduled: number;
  };
  updated_at: string;
}

// Domain H: Site Management
export interface SiteContext {
  event_id: string;
  hotel_blocks: {
    total_rooms_blocked: number;
    rooms_picked_up: number;
    rooms_remaining: number;
    pickup_rate: number;
    cutoff_date: string | null;
    attrition_risk: number;
  };
  site_inspections: {
    completed: number;
    pending: number;
    issues_found: number;
    critical_issues: number;
  };
  facility_inventory: {
    total_items: number;
    checked_out: number;
    available: number;
    maintenance_needed: number;
  };
  setup_tasks: {
    total_tasks: number;
    completed: number;
    in_progress: number;
    blocked: number;
  };
  housing_invoices: {
    total_amount: number;
    paid: number;
    pending: number;
  };
  updated_at: string;
}

// Domain I: Advanced Marketing
export interface MarketingAdvContext {
  event_id: string;
  analytics: {
    total_impressions: number;
    total_clicks: number;
    conversion_rate: number;
    cost_per_acquisition: number;
  };
  lead_segments: {
    total_leads: number;
    hot_leads: number;
    warm_leads: number;
    cold_leads: number;
    conversion_by_segment: Record<string, number>;
  };
  campaign_performance: {
    active_campaigns: number;
    total_spend: number;
    total_revenue_attributed: number;
    roas: number;
  };
  personalization: {
    rules_active: number;
    personalized_content_served: number;
    engagement_lift: number;
  };
  retargeting: {
    audience_size: number;
    campaigns_running: number;
    conversion_rate: number;
  };
  updated_at: string;
}

// Domain J: Professionalism
export interface ProfessionalismContext {
  event_id: string;
  compliance: {
    audits_completed: number;
    audits_pending: number;
    issues_found: number;
    issues_resolved: number;
  };
  certifications: {
    required: number;
    obtained: number;
    expiring_soon: number;
  };
  training: {
    courses_required: number;
    courses_completed: number;
    staff_certified: number;
    staff_pending: number;
  };
  legal_risk: {
    assessments_done: number;
    high_risk_items: number;
    mitigated: number;
  };
  industry_standards: {
    standards_tracked: number;
    compliant: number;
    non_compliant: number;
  };
  updated_at: string;
}

export interface SharedContext {
  event_id: string;
  strategy: StrategyContext | null;
  finance: FinanceContext | null;
  project: ProjectContext | null;
  marketing: MarketingContext | null;
  operations: OperationsContext | null;
  hr: HRContext | null;
  meetings: MeetingsContext | null;
  site: SiteContext | null;
  marketing_adv: MarketingAdvContext | null;
  professionalism: ProfessionalismContext | null;
  cross_domain_alerts: CrossDomainAlert[];
  last_sync: string;
}

export interface CrossDomainAlert {
  id: string;
  type: "budget_impact" | "schedule_risk" | "stakeholder_concern" | "resource_constraint" | "goal_at_risk" | "marketing_risk" | "registration_lag" | "channel_underperformance" | "venue_risk" | "logistics_issue" | "safety_concern" | "vendor_delay" | "staffing_shortage" | "labor_cost_overrun" | "training_gap" | "compliance_issue" | "speaker_shortage" | "content_delay" | "program_conflict" | "abstract_review_backlog" | "ce_accreditation_risk";
  severity: "critical" | "high" | "medium" | "low";
  source_domain: "STR" | "FIN" | "PRJ" | "MKT" | "OPS" | "HR" | "MTG" | "SITE" | "MKTADV" | "PRO";
  affected_domains: Array<"STR" | "FIN" | "PRJ" | "MKT" | "OPS" | "HR" | "MTG" | "SITE" | "MKTADV" | "PRO">;
  title: string;
  description: string;
  recommended_actions: string[];
  created_at: string;
  acknowledged: boolean;
}

export interface ImpactResult {
  domain: "STR" | "FIN" | "PRJ" | "MKT" | "OPS" | "HR" | "MTG";
  impact_type: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  metrics_affected: Array<{ metric: string; before: number; after: number; change_percent: number }>;
  recommended_actions: string[];
}

// =============================================================================
// CONTEXT BRIDGE CLASS
// =============================================================================

export class ContextBridge {
  private kv: KVNamespace;
  private db: D1Database;

  constructor(kv: KVNamespace, db: D1Database) {
    this.kv = kv;
    this.db = db;
  }

  /**
   * 이벤트의 전체 Shared Context 조회
   */
  async getSharedContext(eventId: string): Promise<SharedContext> {
    const cacheKey = `shared_context:${eventId}`;

    // KV 캐시 확인 (5분 TTL)
    const cached = await this.kv.get(cacheKey, "json");
    if (cached) {
      return cached as SharedContext;
    }

    // 각 도메인 컨텍스트 로드
    const [strategy, finance, project, marketing, operations, hr, meetings] = await Promise.all([
      this.getStrategyContext(eventId),
      this.getFinanceContext(eventId),
      this.getProjectContext(eventId),
      this.getMarketingContext(eventId),
      this.getOperationsContext(eventId),
      this.getHRContext(eventId),
      this.getMeetingsContext(eventId),
    ]);

    // 크로스 도메인 알림 생성
    const alerts = this.generateCrossDomainAlerts(strategy, finance, project, marketing, operations, hr, meetings);

    const sharedContext: SharedContext = {
      event_id: eventId,
      strategy,
      finance,
      project,
      marketing,
      operations,
      hr,
      meetings,
      cross_domain_alerts: alerts,
      last_sync: new Date().toISOString(),
    };

    // KV에 캐시 (5분)
    await this.kv.put(cacheKey, JSON.stringify(sharedContext), { expirationTtl: 300 });

    return sharedContext;
  }

  /**
   * Strategy 도메인 컨텍스트 조회
   */
  async getStrategyContext(eventId: string): Promise<StrategyContext | null> {
    try {
      // D1에서 목표, 이해관계자, 리스크 조회
      const [goalsResult, stakeholdersResult, risksResult] = await Promise.all([
        this.db.prepare("SELECT * FROM event_goals WHERE event_id = ? AND status != 'archived'").bind(eventId).all(),
        this.db.prepare("SELECT * FROM stakeholders WHERE event_id = ?").bind(eventId).all(),
        this.db.prepare("SELECT * FROM event_risks WHERE event_id = ? AND status != 'closed'").bind(eventId).all(),
      ]);

      if (!goalsResult.results?.length && !stakeholdersResult.results?.length) {
        return null;
      }

      return {
        event_id: eventId,
        goals: (goalsResult.results || []).map((g: Record<string, unknown>) => ({
          id: String(g.id),
          name: String(g.name || g.goal_name || ""),
          priority: (g.priority as "high" | "medium" | "low") || "medium",
          status: (g.status as "active" | "at_risk" | "achieved") || "active",
          kpis: JSON.parse(String(g.kpis || "[]")),
        })),
        stakeholders: (stakeholdersResult.results || []).map((s: Record<string, unknown>) => ({
          id: String(s.id),
          name: String(s.name || s.stakeholder_name || ""),
          influence: (s.influence as "high" | "medium" | "low") || "medium",
          sentiment: (s.sentiment as "positive" | "neutral" | "negative") || "neutral",
        })),
        risks: (risksResult.results || []).map((r: Record<string, unknown>) => ({
          id: String(r.id),
          name: String(r.name || r.risk_name || ""),
          severity: (r.severity as "critical" | "high" | "medium" | "low") || "medium",
          probability: Number(r.probability) || 0.5,
          mitigation_status: (r.mitigation_status as "planned" | "in_progress" | "completed") || "planned",
        })),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Strategy context load failed:", error);
      return null;
    }
  }

  /**
   * Finance 도메인 컨텍스트 조회
   */
  async getFinanceContext(eventId: string): Promise<FinanceContext | null> {
    try {
      const [budgetResult, sponsorsResult, expensesResult] = await Promise.all([
        this.db.prepare("SELECT * FROM event_budgets WHERE event_id = ? ORDER BY created_at DESC LIMIT 1").bind(eventId).first(),
        this.db.prepare("SELECT * FROM sponsors WHERE event_id = ?").bind(eventId).all(),
        this.db.prepare("SELECT category, SUM(amount) as total FROM expenses WHERE event_id = ? GROUP BY category").bind(eventId).all(),
      ]);

      if (!budgetResult) {
        return null;
      }

      const budget = budgetResult as Record<string, unknown>;
      const totalBudget = Number(budget.total_budget || budget.total || 0);
      const spent = Number(budget.spent || 0);
      const allocated = Number(budget.allocated || totalBudget);

      const expensesByCategory: Record<string, number> = {};
      for (const exp of (expensesResult.results || [])) {
        const e = exp as Record<string, unknown>;
        expensesByCategory[String(e.category)] = Number(e.total);
      }

      return {
        event_id: eventId,
        budget: {
          total: totalBudget,
          allocated,
          spent,
          remaining: totalBudget - spent,
          currency: String(budget.currency || "KRW"),
        },
        sponsors: (sponsorsResult.results || []).map((s: Record<string, unknown>) => ({
          id: String(s.id),
          name: String(s.name || s.sponsor_name || ""),
          committed_amount: Number(s.committed_amount || s.amount || 0),
          received_amount: Number(s.received_amount || 0),
          status: (s.status as "confirmed" | "pending" | "at_risk") || "pending",
        })),
        expenses: {
          by_category: expensesByCategory,
          variance_percent: totalBudget > 0 ? ((spent - allocated) / allocated) * 100 : 0,
          forecast_accuracy: Number(budget.forecast_accuracy || 85),
        },
        cashflow: {
          current_balance: Number(budget.current_balance || totalBudget - spent),
          projected_shortfall: Number(budget.projected_shortfall) || null,
          next_major_payment: budget.next_payment_amount
            ? {
                amount: Number(budget.next_payment_amount),
                due_date: String(budget.next_payment_date),
              }
            : null,
        },
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Finance context load failed:", error);
      return null;
    }
  }

  /**
   * Project 도메인 컨텍스트 조회
   */
  async getProjectContext(eventId: string): Promise<ProjectContext | null> {
    try {
      const [milestonesResult, tasksResult, resourcesResult, issuesResult] = await Promise.all([
        this.db.prepare("SELECT * FROM project_milestones WHERE event_id = ? ORDER BY target_date ASC").bind(eventId).all(),
        this.db.prepare(`
          SELECT
            COUNT(*) as total,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
            SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked,
            SUM(CASE WHEN status != 'completed' AND due_date < date('now') THEN 1 ELSE 0 END) as overdue
          FROM project_tasks WHERE event_id = ?
        `).bind(eventId).first(),
        this.db.prepare("SELECT * FROM project_resources WHERE event_id = ?").bind(eventId).all(),
        this.db.prepare(`
          SELECT
            COUNT(*) as open,
            SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical,
            SUM(CASE WHEN status = 'resolved' AND resolved_at > date('now', '-7 days') THEN 1 ELSE 0 END) as resolved_week
          FROM project_issues WHERE event_id = ? AND status != 'closed'
        `).bind(eventId).first(),
      ]);

      if (!milestonesResult.results?.length && !tasksResult) {
        return null;
      }

      const milestones = (milestonesResult.results || []) as Array<Record<string, unknown>>;
      const tasks = (tasksResult || {}) as Record<string, unknown>;
      const resources = (resourcesResult.results || []) as Array<Record<string, unknown>>;
      const issues = (issuesResult || {}) as Record<string, unknown>;

      // 일정 계산
      const sortedMilestones = [...milestones].sort((a, b) =>
        String(a.target_date).localeCompare(String(b.target_date))
      );
      const startDate = sortedMilestones[0]?.target_date || new Date().toISOString().split("T")[0];
      const endDate = sortedMilestones[sortedMilestones.length - 1]?.target_date || startDate;
      const daysRemaining = Math.max(
        0,
        Math.ceil((new Date(String(endDate)).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );

      // 현재 진행 단계 판단
      const activeMilestone = milestones.find((m) => m.status === "in_progress" || m.status === "on_track");
      const currentPhase = activeMilestone ? String(activeMilestone.name) : "Planning";

      // 일정 준수 여부
      const delayedMilestones = milestones.filter((m) => m.status === "delayed" || m.status === "at_risk");
      const onTrack = delayedMilestones.length === 0;

      // 리소스 통계
      const teamSize = resources.length;
      const avgUtilization =
        teamSize > 0
          ? resources.reduce((sum, r) => sum + Number(r.utilization || r.allocation_percent || 0), 0) / teamSize
          : 0;
      const criticalGaps = resources
        .filter((r) => r.status === "critical" || r.is_critical_gap)
        .map((r) => String(r.resource_name || r.name));

      return {
        event_id: eventId,
        schedule: {
          start_date: String(startDate),
          end_date: String(endDate),
          current_phase: currentPhase,
          days_remaining: daysRemaining,
          on_track: onTrack,
        },
        milestones: milestones.map((m) => ({
          id: String(m.id),
          name: String(m.name || m.milestone_name || ""),
          due_date: String(m.target_date || m.due_date || ""),
          status: (m.status as "completed" | "on_track" | "at_risk" | "delayed") || "on_track",
          completion_percent: Number(m.completion_percent || m.progress || 0),
        })),
        tasks: {
          total: Number(tasks.total) || 0,
          completed: Number(tasks.completed) || 0,
          in_progress: Number(tasks.in_progress) || 0,
          blocked: Number(tasks.blocked) || 0,
          overdue: Number(tasks.overdue) || 0,
        },
        resources: {
          team_size: teamSize,
          utilization_percent: Math.round(avgUtilization),
          critical_gaps: criticalGaps,
        },
        issues: {
          open: Number(issues.open) || 0,
          critical: Number(issues.critical) || 0,
          resolved_this_week: Number(issues.resolved_week) || 0,
        },
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Project context load failed:", error);
      return null;
    }
  }

  /**
   * Marketing 도메인 컨텍스트 조회
   */
  async getMarketingContext(eventId: string): Promise<MarketingContext | null> {
    try {
      const [campaignsResult, channelsResult, performanceResult, influencersResult] = await Promise.all([
        this.db.prepare("SELECT * FROM marketing_campaigns WHERE event_id = ?").bind(eventId).all(),
        this.db.prepare("SELECT * FROM marketing_channels WHERE event_id = ?").bind(eventId).first(),
        this.db.prepare("SELECT * FROM marketing_performance WHERE event_id = ? ORDER BY created_at DESC LIMIT 1").bind(eventId).first(),
        this.db.prepare("SELECT * FROM marketing_influencers WHERE event_id = ?").bind(eventId).all(),
      ]);

      if (!campaignsResult.results?.length && !channelsResult) {
        return null;
      }

      const campaigns = (campaignsResult.results || []) as Array<Record<string, unknown>>;
      const channels = (channelsResult || {}) as Record<string, unknown>;
      const performance = (performanceResult || {}) as Record<string, unknown>;
      const influencers = (influencersResult.results || []) as Array<Record<string, unknown>>;

      return {
        event_id: eventId,
        campaigns: campaigns.map((c) => ({
          id: String(c.id),
          name: String(c.name || c.campaign_name || ""),
          type: (c.type as "awareness" | "engagement" | "conversion" | "retention") || "awareness",
          status: (c.status as "planning" | "active" | "paused" | "completed") || "planning",
          budget: Number(c.budget) || 0,
          spent: Number(c.spent) || 0,
          start_date: String(c.start_date || ""),
          end_date: String(c.end_date || ""),
        })),
        channels: {
          social_media: {
            platforms: JSON.parse(String(channels.social_platforms || "[]")),
            total_followers: Number(channels.total_followers) || 0,
            engagement_rate: Number(channels.engagement_rate) || 0,
          },
          email: {
            list_size: Number(channels.email_list_size) || 0,
            open_rate: Number(channels.email_open_rate) || 0,
            click_rate: Number(channels.email_click_rate) || 0,
          },
          pr: {
            media_mentions: Number(channels.media_mentions) || 0,
            press_releases: Number(channels.press_releases) || 0,
            media_value: Number(channels.media_value) || 0,
          },
        },
        performance: {
          registrations: {
            target: Number(performance.registration_target) || 0,
            current: Number(performance.registration_current) || 0,
            conversion_rate: Number(performance.conversion_rate) || 0,
          },
          reach: {
            impressions: Number(performance.impressions) || 0,
            unique_reach: Number(performance.unique_reach) || 0,
          },
          engagement: {
            total_interactions: Number(performance.total_interactions) || 0,
            sentiment_score: Number(performance.sentiment_score) || 0,
          },
        },
        content: {
          total_assets: Number(channels.total_assets) || 0,
          pending_approval: Number(channels.pending_approval) || 0,
          scheduled: Number(channels.scheduled) || 0,
        },
        influencers: influencers.map((i) => ({
          id: String(i.id),
          name: String(i.name || i.influencer_name || ""),
          platform: String(i.platform || ""),
          followers: Number(i.followers) || 0,
          status: (i.status as "contacted" | "confirmed" | "declined" | "active") || "contacted",
          deliverables: Number(i.deliverables) || 0,
        })),
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Marketing context load failed:", error);
      return null;
    }
  }

  /**
   * Operations 도메인 컨텍스트 조회
   */
  async getOperationsContext(eventId: string): Promise<OperationsContext | null> {
    try {
      const [venueResult, roomsResult, avResult, signageResult, permitsResult, fbResult, transportResult, accommodationResult, registrationResult, securityResult, staffResult, vendorsResult, issuesResult] = await Promise.all([
        this.db.prepare("SELECT * FROM venues WHERE event_id = ? ORDER BY created_at DESC LIMIT 1").bind(eventId).first(),
        this.db.prepare("SELECT * FROM room_setups WHERE event_id = ?").bind(eventId).all(),
        this.db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending, SUM(CASE WHEN status = 'issue' THEN 1 ELSE 0 END) as issues FROM av_equipment WHERE event_id = ?").bind(eventId).first(),
        this.db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'designed' THEN 1 ELSE 0 END) as designed, SUM(CASE WHEN status = 'produced' THEN 1 ELSE 0 END) as produced, SUM(CASE WHEN status = 'installed' THEN 1 ELSE 0 END) as installed FROM signage WHERE event_id = ?").bind(eventId).first(),
        this.db.prepare("SELECT COUNT(*) as required, SUM(CASE WHEN status = 'obtained' THEN 1 ELSE 0 END) as obtained, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending FROM permits WHERE event_id = ?").bind(eventId).first(),
        this.db.prepare("SELECT * FROM fb_planning WHERE event_id = ? ORDER BY created_at DESC LIMIT 1").bind(eventId).first(),
        this.db.prepare("SELECT * FROM transportation WHERE event_id = ? ORDER BY created_at DESC LIMIT 1").bind(eventId).first(),
        this.db.prepare("SELECT * FROM accommodations WHERE event_id = ? ORDER BY created_at DESC LIMIT 1").bind(eventId).first(),
        this.db.prepare("SELECT * FROM registration_setup WHERE event_id = ? ORDER BY created_at DESC LIMIT 1").bind(eventId).first(),
        this.db.prepare("SELECT * FROM security_planning WHERE event_id = ? ORDER BY created_at DESC LIMIT 1").bind(eventId).first(),
        this.db.prepare("SELECT role, COUNT(*) as required, SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END) as assigned FROM event_staff WHERE event_id = ? GROUP BY role").bind(eventId).all(),
        this.db.prepare("SELECT * FROM vendors WHERE event_id = ?").bind(eventId).all(),
        this.db.prepare("SELECT COUNT(*) as open, SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) as critical, SUM(CASE WHEN status = 'resolved' AND resolved_at > date('now', '-7 days') THEN 1 ELSE 0 END) as resolved_week FROM operations_issues WHERE event_id = ? AND status != 'closed'").bind(eventId).first(),
      ]);

      if (!venueResult && !roomsResult.results?.length) {
        return null;
      }

      const venue = venueResult as Record<string, unknown> | null;
      const rooms = (roomsResult.results || []) as Array<Record<string, unknown>>;
      const av = (avResult || {}) as Record<string, unknown>;
      const signage = (signageResult || {}) as Record<string, unknown>;
      const permits = (permitsResult || {}) as Record<string, unknown>;
      const fb = (fbResult || {}) as Record<string, unknown>;
      const transport = (transportResult || {}) as Record<string, unknown>;
      const accommodation = (accommodationResult || {}) as Record<string, unknown>;
      const registration = (registrationResult || {}) as Record<string, unknown>;
      const security = (securityResult || {}) as Record<string, unknown>;
      const staffRoles = (staffResult.results || []) as Array<Record<string, unknown>>;
      const vendors = (vendorsResult.results || []) as Array<Record<string, unknown>>;
      const issues = (issuesResult || {}) as Record<string, unknown>;

      // 스태프 통계 계산
      const totalRequired = staffRoles.reduce((sum, r) => sum + Number(r.required || 0), 0);
      const totalAssigned = staffRoles.reduce((sum, r) => sum + Number(r.assigned || 0), 0);

      return {
        event_id: eventId,
        venue: venue ? {
          id: String(venue.id),
          name: String(venue.name || venue.venue_name || ""),
          capacity: Number(venue.capacity) || 0,
          status: (venue.status as "sourcing" | "shortlisted" | "contracted" | "confirmed") || "sourcing",
          rental_cost: Number(venue.rental_cost || venue.cost) || 0,
          setup_date: String(venue.setup_date || ""),
          event_date: String(venue.event_date || ""),
          teardown_date: String(venue.teardown_date || ""),
        } : null,
        site_management: {
          floor_plan_status: (venue?.floor_plan_status as "pending" | "draft" | "approved") || "pending",
          room_setups: rooms.map((r) => ({
            room_name: String(r.room_name || r.name || ""),
            setup_type: String(r.setup_type || ""),
            capacity: Number(r.capacity) || 0,
            status: (r.status as "planned" | "ready" | "in_use") || "planned",
          })),
          av_equipment: {
            total_items: Number(av.total) || 0,
            confirmed: Number(av.confirmed) || 0,
            pending: Number(av.pending) || 0,
            issues: Number(av.issues) || 0,
          },
          signage: {
            total_pieces: Number(signage.total) || 0,
            designed: Number(signage.designed) || 0,
            produced: Number(signage.produced) || 0,
            installed: Number(signage.installed) || 0,
          },
          permits: {
            required: Number(permits.required) || 0,
            obtained: Number(permits.obtained) || 0,
            pending: Number(permits.pending) || 0,
          },
        },
        logistics: {
          fb_status: {
            caterer_confirmed: Boolean(fb.caterer_confirmed),
            menu_approved: Boolean(fb.menu_approved),
            dietary_accommodations: Number(fb.dietary_accommodations) || 0,
            estimated_headcount: Number(fb.estimated_headcount) || 0,
          },
          transportation: {
            shuttle_services: Number(transport.shuttle_services) || 0,
            parking_capacity: Number(transport.parking_capacity) || 0,
            valet_available: Boolean(transport.valet_available),
          },
          accommodation: {
            room_block_size: Number(accommodation.room_block_size) || 0,
            rooms_booked: Number(accommodation.rooms_booked) || 0,
            cutoff_date: String(accommodation.cutoff_date || ""),
          },
          registration: {
            stations_planned: Number(registration.stations_planned) || 0,
            staff_assigned: Number(registration.staff_assigned) || 0,
            tech_ready: Boolean(registration.tech_ready),
          },
        },
        safety_security: {
          security_personnel: Number(security.security_personnel) || 0,
          medical_staff: Number(security.medical_staff) || 0,
          emergency_plan_status: (security.emergency_plan_status as "pending" | "draft" | "approved") || "pending",
          insurance_confirmed: Boolean(security.insurance_confirmed),
          safety_briefing_scheduled: Boolean(security.safety_briefing_scheduled),
        },
        staffing: {
          total_required: totalRequired,
          confirmed: totalAssigned,
          pending: totalRequired - totalAssigned,
          roles: staffRoles.map((r) => ({
            role: String(r.role || ""),
            required: Number(r.required) || 0,
            assigned: Number(r.assigned) || 0,
          })),
        },
        vendors: vendors.map((v) => ({
          id: String(v.id),
          name: String(v.name || v.vendor_name || ""),
          category: String(v.category || ""),
          contract_status: (v.contract_status as "pending" | "negotiating" | "signed") || "pending",
          payment_status: (v.payment_status as "pending" | "partial" | "paid") || "pending",
          delivery_status: (v.delivery_status as "not_started" | "in_progress" | "delivered") || "not_started",
        })),
        issues: {
          open: Number(issues.open) || 0,
          critical: Number(issues.critical) || 0,
          resolved_this_week: Number(issues.resolved_week) || 0,
        },
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Operations context load failed:", error);
      return null;
    }
  }

  /**
   * HR 도메인 컨텍스트 조회
   */
  async getHRContext(eventId: string): Promise<HRContext | null> {
    try {
      const [staffingResult, recruitmentResult, trainingResult, volunteersResult, laborCostResult, complianceResult, attendanceResult, performanceResult] = await Promise.all([
        this.db.prepare(`
          SELECT
            role,
            COUNT(*) as required,
            SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active
          FROM hr_staffing WHERE event_id = ? GROUP BY role
        `).bind(eventId).all(),
        this.db.prepare(`
          SELECT
            COUNT(*) as open_positions,
            SUM(applications) as applications_received,
            SUM(interviews_scheduled) as interviews_scheduled,
            SUM(offers_pending) as offers_pending
          FROM hr_recruitment WHERE event_id = ? AND status = 'open'
        `).bind(eventId).first(),
        this.db.prepare(`
          SELECT
            COUNT(*) as programs_scheduled,
            SUM(staff_trained) as staff_trained,
            SUM(staff_pending) as staff_pending
          FROM hr_training WHERE event_id = ?
        `).bind(eventId).first(),
        this.db.prepare(`
          SELECT
            COUNT(*) as registered,
            SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
            SUM(CASE WHEN role_assigned = 1 THEN 1 ELSE 0 END) as roles_filled,
            SUM(CASE WHEN role_assigned = 0 THEN 1 ELSE 0 END) as roles_open
          FROM hr_volunteers WHERE event_id = ?
        `).bind(eventId).first(),
        this.db.prepare(`
          SELECT budget, spent, projected FROM hr_labor_costs WHERE event_id = ? ORDER BY created_at DESC LIMIT 1
        `).bind(eventId).first(),
        this.db.prepare(`
          SELECT
            SUM(CASE WHEN status = 'signed' THEN 1 ELSE 0 END) as contracts_signed,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as contracts_pending,
            SUM(CASE WHEN labor_law_issue = 1 THEN 1 ELSE 0 END) as labor_law_issues
          FROM hr_contracts WHERE event_id = ?
        `).bind(eventId).first(),
        this.db.prepare(`
          SELECT
            AVG(check_in_rate) as check_in_rate,
            SUM(no_shows) as no_show_count,
            SUM(overtime_hours) as overtime_hours
          FROM hr_attendance WHERE event_id = ?
        `).bind(eventId).first(),
        this.db.prepare(`
          SELECT
            AVG(rating) as avg_rating,
            SUM(issues_reported) as issues_reported,
            SUM(recognition_given) as recognition_given
          FROM hr_performance WHERE event_id = ?
        `).bind(eventId).first(),
      ]);

      const staffRoles = (staffingResult.results || []) as Array<Record<string, unknown>>;
      const recruitment = (recruitmentResult || {}) as Record<string, unknown>;
      const training = (trainingResult || {}) as Record<string, unknown>;
      const volunteers = (volunteersResult || {}) as Record<string, unknown>;
      const laborCost = (laborCostResult || {}) as Record<string, unknown>;
      const compliance = (complianceResult || {}) as Record<string, unknown>;
      const attendance = (attendanceResult || {}) as Record<string, unknown>;
      const performance = (performanceResult || {}) as Record<string, unknown>;

      // 스태프 통계 계산
      const totalRequired = staffRoles.reduce((sum, r) => sum + Number(r.required || 0), 0);
      const totalConfirmed = staffRoles.reduce((sum, r) => sum + Number(r.confirmed || 0), 0);
      const totalActive = staffRoles.reduce((sum, r) => sum + Number(r.active || 0), 0);

      // 데이터가 없으면 null 반환
      if (totalRequired === 0 && !recruitmentResult && !trainingResult) {
        return null;
      }

      // 노동비용 variance 계산
      const budget = Number(laborCost.budget) || 0;
      const spent = Number(laborCost.spent) || 0;
      const projected = Number(laborCost.projected) || spent;
      const variancePercent = budget > 0 ? ((projected - budget) / budget) * 100 : 0;

      // 교육 완료율 계산
      const staffTrained = Number(training.staff_trained) || 0;
      const staffPending = Number(training.staff_pending) || 0;
      const trainingTotal = staffTrained + staffPending;
      const completionRate = trainingTotal > 0 ? (staffTrained / trainingTotal) * 100 : 0;

      // 채용 전환율 계산
      const applicationsReceived = Number(recruitment.applications_received) || 0;
      const conversionRate = applicationsReceived > 0 ? (totalConfirmed / applicationsReceived) * 100 : 0;

      return {
        event_id: eventId,
        staffing: {
          total_required: totalRequired,
          total_confirmed: totalConfirmed,
          total_pending: totalRequired - totalConfirmed,
          total_active: totalActive,
          by_role: staffRoles.map((r) => ({
            role: String(r.role || ""),
            required: Number(r.required) || 0,
            confirmed: Number(r.confirmed) || 0,
            active: Number(r.active) || 0,
          })),
        },
        recruitment: {
          open_positions: Number(recruitment.open_positions) || 0,
          applications_received: applicationsReceived,
          interviews_scheduled: Number(recruitment.interviews_scheduled) || 0,
          offers_pending: Number(recruitment.offers_pending) || 0,
          conversion_rate: conversionRate,
        },
        training: {
          programs_scheduled: Number(training.programs_scheduled) || 0,
          staff_trained: staffTrained,
          staff_pending: staffPending,
          completion_rate: completionRate,
        },
        volunteers: {
          registered: Number(volunteers.registered) || 0,
          confirmed: Number(volunteers.confirmed) || 0,
          active: Number(volunteers.active) || 0,
          roles_filled: Number(volunteers.roles_filled) || 0,
          roles_open: Number(volunteers.roles_open) || 0,
        },
        labor_costs: {
          budget,
          spent,
          projected,
          variance_percent: variancePercent,
        },
        compliance: {
          contracts_signed: Number(compliance.contracts_signed) || 0,
          contracts_pending: Number(compliance.contracts_pending) || 0,
          labor_law_issues: Number(compliance.labor_law_issues) || 0,
          safety_certifications: {
            required: 0, // 별도 쿼리 필요시 추가
            verified: 0,
          },
        },
        attendance: {
          check_in_rate: Number(attendance.check_in_rate) || 0,
          no_show_count: Number(attendance.no_show_count) || 0,
          overtime_hours: Number(attendance.overtime_hours) || 0,
        },
        performance: {
          avg_rating: Number(performance.avg_rating) || 0,
          issues_reported: Number(performance.issues_reported) || 0,
          recognition_given: Number(performance.recognition_given) || 0,
        },
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error("HR context load failed:", error);
      return null;
    }
  }

  /**
   * Domain G: Meetings & Contents 컨텍스트 로드
   */
  async getMeetingsContext(eventId: string): Promise<MeetingsContext | null> {
    try {
      const [sessionsResult, speakersResult, abstractsResult, tracksResult, ceResult] = await Promise.all([
        this.db.prepare(`
          SELECT
            COUNT(*) as total_sessions,
            SUM(CASE WHEN session_type = 'keynote' THEN 1 ELSE 0 END) as keynotes,
            SUM(CASE WHEN session_type = 'breakout' THEN 1 ELSE 0 END) as breakouts,
            SUM(CASE WHEN session_type = 'workshop' THEN 1 ELSE 0 END) as workshops,
            SUM(CASE WHEN session_type = 'panel' THEN 1 ELSE 0 END) as panels,
            SUM(CASE WHEN session_type = 'networking' THEN 1 ELSE 0 END) as networking,
            SUM(CASE WHEN is_hybrid = 1 THEN 1 ELSE 0 END) as hybrid_sessions,
            SUM(CASE WHEN is_virtual_only = 1 THEN 1 ELSE 0 END) as virtual_only
          FROM event_sessions WHERE event_id = ?
        `).bind(eventId).first(),
        this.db.prepare(`
          SELECT
            COUNT(*) as total_invited,
            SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'declined' THEN 1 ELSE 0 END) as declined,
            SUM(CASE WHEN tier = 'A' THEN 1 ELSE 0 END) as tier_a,
            SUM(CASE WHEN tier = 'B' THEN 1 ELSE 0 END) as tier_b,
            SUM(CASE WHEN tier = 'C' THEN 1 ELSE 0 END) as tier_c,
            SUM(CASE WHEN contract_signed = 1 THEN 1 ELSE 0 END) as contracts_signed,
            SUM(COALESCE(honorarium, 0)) as honorarium_committed
          FROM speaker_profiles WHERE event_id = ?
        `).bind(eventId).first(),
        this.db.prepare(`
          SELECT
            COUNT(*) as submitted,
            SUM(CASE WHEN review_status = 'accepted' THEN 1 ELSE 0 END) as accepted,
            SUM(CASE WHEN review_status = 'pending' THEN 1 ELSE 0 END) as pending_review
          FROM abstracts_submissions WHERE event_id = ?
        `).bind(eventId).first(),
        this.db.prepare(`
          SELECT track_id, track_name, 0 as session_count, max_capacity as capacity
          FROM program_tracks WHERE event_id = ?
        `).bind(eventId).all(),
        this.db.prepare(`
          SELECT
            COUNT(*) as sessions_eligible,
            SUM(credits_approved) as credits_approved,
            MAX(CASE WHEN accreditation_body IS NOT NULL THEN 1 ELSE 0 END) as accreditation_applied
          FROM ce_credits WHERE event_id = ?
        `).bind(eventId).first(),
      ]);

      const sessions = sessionsResult || {};
      const speakers = speakersResult || {};
      const abstracts = abstractsResult || {};
      const tracks = (tracksResult?.results || []) as Array<{ track_id: string; track_name: string; session_count: number; capacity: number }>;
      const ce = ceResult || {};

      const totalSessions = Number(sessions.total_sessions) || 0;

      return {
        event_id: eventId,
        program: {
          total_sessions: totalSessions,
          keynotes: Number(sessions.keynotes) || 0,
          breakouts: Number(sessions.breakouts) || 0,
          workshops: Number(sessions.workshops) || 0,
          panels: Number(sessions.panels) || 0,
          networking: Number(sessions.networking) || 0,
          tracks: tracks.map((t) => ({
            id: String(t.track_id || ""),
            name: String(t.track_name || ""),
            session_count: Number(t.session_count) || 0,
            capacity: Number(t.capacity) || 0,
          })),
          hybrid_sessions: Number(sessions.hybrid_sessions) || 0,
          virtual_only: Number(sessions.virtual_only) || 0,
        },
        speakers: {
          total_invited: Number(speakers.total_invited) || 0,
          confirmed: Number(speakers.confirmed) || 0,
          pending: Number(speakers.pending) || 0,
          declined: Number(speakers.declined) || 0,
          by_tier: {
            A: Number(speakers.tier_a) || 0,
            B: Number(speakers.tier_b) || 0,
            C: Number(speakers.tier_c) || 0,
          },
          contracts_signed: Number(speakers.contracts_signed) || 0,
          honorarium_budget: 0, // 별도 예산 테이블에서 가져와야 함
          honorarium_committed: Number(speakers.honorarium_committed) || 0,
        },
        content: {
          abstracts_submitted: Number(abstracts.submitted) || 0,
          abstracts_accepted: Number(abstracts.accepted) || 0,
          abstracts_pending_review: Number(abstracts.pending_review) || 0,
          presentations_received: 0, // content_materials 테이블에서 조회 필요
          presentations_pending: 0,
          recordings_planned: totalSessions,
          recordings_completed: 0,
        },
        schedule: {
          schedule_published: false,
          conflicts_detected: 0,
          utilization_rate: 0,
          parallel_sessions_max: 4,
        },
        ce_credits: {
          accreditation_applied: Number(ce.accreditation_applied) === 1,
          credits_approved: Number(ce.credits_approved) || 0,
          sessions_eligible: Number(ce.sessions_eligible) || 0,
        },
        engagement: {
          app_adoption_rate: 0,
          session_ratings_avg: 0,
          feedback_response_rate: 0,
          networking_meetings_scheduled: 0,
        },
        updated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Meetings context load failed:", error);
      return null;
    }
  }

  /**
   * 도메인 컨텍스트 업데이트 (캐시 무효화)
   */
  async invalidateCache(eventId: string, domain?: "STR" | "FIN" | "PRJ" | "MKT" | "OPS" | "HR" | "MTG" | "SITE" | "MKTADV" | "PRO"): Promise<void> {
    const cacheKey = `shared_context:${eventId}`;
    await this.kv.delete(cacheKey);

    // 도메인별 캐시도 삭제
    if (domain) {
      await this.kv.delete(`${domain.toLowerCase()}_context:${eventId}`);
    }
  }

  /**
   * 크로스 도메인 알림 자동 생성
   */
  private generateCrossDomainAlerts(
    strategy: StrategyContext | null,
    finance: FinanceContext | null,
    project: ProjectContext | null,
    marketing: MarketingContext | null,
    operations: OperationsContext | null,
    hr: HRContext | null,
    meetings: MeetingsContext | null
  ): CrossDomainAlert[] {
    const alerts: CrossDomainAlert[] = [];
    const now = new Date().toISOString();

    // 1. 예산 초과 → 전략/프로젝트/운영 영향
    if (finance && finance.expenses.variance_percent > 10) {
      alerts.push({
        id: `alert_budget_${Date.now()}`,
        type: "budget_impact",
        severity: finance.expenses.variance_percent > 20 ? "critical" : "high",
        source_domain: "FIN",
        affected_domains: ["STR", "PRJ", "OPS"],
        title: "예산 초과 경고",
        description: `현재 예산 대비 ${finance.expenses.variance_percent.toFixed(1)}% 초과 지출 중`,
        recommended_actions: [
          "비필수 지출 항목 검토",
          "추가 스폰서십 확보 검토",
          "범위 축소 옵션 검토",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 2. 일정 지연 → 재무/전략/운영 영향
    if (project && !project.schedule.on_track) {
      const delayedMilestones = project.milestones.filter((m) => m.status === "delayed" || m.status === "at_risk");
      alerts.push({
        id: `alert_schedule_${Date.now()}`,
        type: "schedule_risk",
        severity: delayedMilestones.length > 2 ? "critical" : "high",
        source_domain: "PRJ",
        affected_domains: ["FIN", "STR", "OPS"],
        title: "일정 지연 위험",
        description: `${delayedMilestones.length}개 마일스톤이 지연/위험 상태`,
        recommended_actions: [
          "크리티컬 패스 재검토",
          "추가 리소스 투입 검토",
          "범위 조정 협의",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 3. 주요 이해관계자 부정적 → 전체 영향
    if (strategy) {
      const negativeHighInfluence = strategy.stakeholders.filter(
        (s) => s.influence === "high" && s.sentiment === "negative"
      );
      if (negativeHighInfluence.length > 0) {
        alerts.push({
          id: `alert_stakeholder_${Date.now()}`,
          type: "stakeholder_concern",
          severity: "high",
          source_domain: "STR",
          affected_domains: ["FIN", "PRJ"],
          title: "주요 이해관계자 우려",
          description: `${negativeHighInfluence.length}명의 고영향력 이해관계자가 부정적 반응`,
          recommended_actions: [
            "긴급 이해관계자 미팅 설정",
            "우려사항 파악 및 대응 계획 수립",
            "커뮤니케이션 전략 강화",
          ],
          created_at: now,
          acknowledged: false,
        });
      }
    }

    // 4. 크리티컬 리스크 → 전체 영향
    if (strategy) {
      const criticalRisks = strategy.risks.filter(
        (r) => r.severity === "critical" && r.mitigation_status !== "completed"
      );
      if (criticalRisks.length > 0) {
        alerts.push({
          id: `alert_risk_${Date.now()}`,
          type: "goal_at_risk",
          severity: "critical",
          source_domain: "STR",
          affected_domains: ["FIN", "PRJ"],
          title: "크리티컬 리스크 미해결",
          description: `${criticalRisks.length}개의 크리티컬 리스크가 미해결 상태`,
          recommended_actions: criticalRisks.map((r) => `[${r.name}] 완화 조치 가속화`),
          created_at: now,
          acknowledged: false,
        });
      }
    }

    // 5. 리소스 부족 → 프로젝트/재무 영향
    if (project && project.resources.critical_gaps.length > 0) {
      alerts.push({
        id: `alert_resource_${Date.now()}`,
        type: "resource_constraint",
        severity: project.resources.critical_gaps.length > 2 ? "critical" : "medium",
        source_domain: "PRJ",
        affected_domains: ["FIN"],
        title: "핵심 리소스 부족",
        description: `${project.resources.critical_gaps.join(", ")} 리소스 부족`,
        recommended_actions: [
          "긴급 채용/외주 검토",
          "기존 팀원 재배치",
          "태스크 우선순위 재조정",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 6. 스폰서 위험 → 전략/프로젝트 영향
    if (finance) {
      const atRiskSponsors = finance.sponsors.filter((s) => s.status === "at_risk");
      const atRiskAmount = atRiskSponsors.reduce((sum, s) => sum + s.committed_amount, 0);
      if (atRiskAmount > 0 && atRiskAmount / finance.budget.total > 0.1) {
        alerts.push({
          id: `alert_sponsor_${Date.now()}`,
          type: "budget_impact",
          severity: atRiskAmount / finance.budget.total > 0.2 ? "critical" : "high",
          source_domain: "FIN",
          affected_domains: ["STR", "PRJ", "MKT"],
          title: "스폰서십 위험",
          description: `총 ${(atRiskAmount / 1000000).toFixed(1)}M 규모 스폰서십이 위험 상태`,
          recommended_actions: [
            "스폰서 관계 강화 미팅",
            "대체 스폰서 물색",
            "컨틴전시 예산 검토",
          ],
          created_at: now,
          acknowledged: false,
        });
      }
    }

    // 7. 등록 목표 미달 → 전략/재무 영향
    if (marketing && marketing.performance.registrations.target > 0) {
      const regProgress = marketing.performance.registrations.current / marketing.performance.registrations.target;
      if (regProgress < 0.5 && project?.schedule.days_remaining && project.schedule.days_remaining < 30) {
        alerts.push({
          id: `alert_registration_${Date.now()}`,
          type: "registration_lag",
          severity: regProgress < 0.3 ? "critical" : "high",
          source_domain: "MKT",
          affected_domains: ["STR", "FIN"],
          title: "등록 목표 미달 위험",
          description: `등록률 ${(regProgress * 100).toFixed(1)}% (목표 대비), 행사까지 ${project.schedule.days_remaining}일 남음`,
          recommended_actions: [
            "긴급 프로모션 캠페인 실행",
            "얼리버드/할인 프로그램 검토",
            "타겟 채널 광고 집중",
            "인플루언서 협업 강화",
          ],
          created_at: now,
          acknowledged: false,
        });
      }
    }

    // 8. 마케팅 캠페인 예산 초과 → 재무 영향
    if (marketing) {
      const overBudgetCampaigns = marketing.campaigns.filter((c) => c.spent > c.budget);
      if (overBudgetCampaigns.length > 0) {
        const totalOverspend = overBudgetCampaigns.reduce((sum, c) => sum + (c.spent - c.budget), 0);
        alerts.push({
          id: `alert_mkt_budget_${Date.now()}`,
          type: "budget_impact",
          severity: totalOverspend > (finance?.budget.total || 0) * 0.05 ? "high" : "medium",
          source_domain: "MKT",
          affected_domains: ["FIN"],
          title: "마케팅 캠페인 예산 초과",
          description: `${overBudgetCampaigns.length}개 캠페인에서 ${(totalOverspend / 1000000).toFixed(1)}M 초과 지출`,
          recommended_actions: [
            "캠페인별 ROI 분석",
            "저성과 캠페인 중단 검토",
            "예산 재배분",
          ],
          created_at: now,
          acknowledged: false,
        });
      }
    }

    // 9. 소셜미디어 참여도 저조 → 마케팅 전략 재검토
    if (marketing && marketing.channels.social_media.engagement_rate < 2) {
      alerts.push({
        id: `alert_engagement_${Date.now()}`,
        type: "channel_underperformance",
        severity: marketing.channels.social_media.engagement_rate < 1 ? "high" : "medium",
        source_domain: "MKT",
        affected_domains: ["STR"],
        title: "소셜미디어 참여도 저조",
        description: `현재 참여율 ${marketing.channels.social_media.engagement_rate.toFixed(1)}% (업계 평균 3-5%)`,
        recommended_actions: [
          "콘텐츠 전략 재검토",
          "게시 시간/빈도 최적화",
          "인터랙티브 콘텐츠 확대",
          "유료 광고 부스팅",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 10. 인플루언서 이탈 → 마케팅 전략 영향
    if (marketing) {
      const declinedInfluencers = marketing.influencers.filter((i) => i.status === "declined");
      if (declinedInfluencers.length > marketing.influencers.length * 0.3) {
        alerts.push({
          id: `alert_influencer_${Date.now()}`,
          type: "marketing_risk",
          severity: "high",
          source_domain: "MKT",
          affected_domains: ["STR"],
          title: "인플루언서 협업 위험",
          description: `${declinedInfluencers.length}명의 인플루언서가 거절 (전체 ${marketing.influencers.length}명 중 ${((declinedInfluencers.length / marketing.influencers.length) * 100).toFixed(0)}%)`,
          recommended_actions: [
            "대체 인플루언서 물색",
            "협업 조건 재협상",
            "다른 마케팅 채널 강화",
          ],
          created_at: now,
          acknowledged: false,
        });
      }
    }

    // ============= OPERATIONS DOMAIN ALERTS =============

    // 11. 베뉴 미확정 → 전체 도메인 영향
    if (operations && operations.venue && operations.venue.status === "sourcing") {
      alerts.push({
        id: `alert_venue_${Date.now()}`,
        type: "venue_risk",
        severity: "critical",
        source_domain: "OPS",
        affected_domains: ["STR", "FIN", "PRJ", "MKT"],
        title: "베뉴 미확정 위험",
        description: "아직 행사장이 확정되지 않았습니다. 모든 계획에 영향을 줄 수 있습니다.",
        recommended_actions: [
          "베뉴 소싱 가속화",
          "대안 베뉴 리스트 확보",
          "온라인/하이브리드 옵션 검토",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 12. 베뉴 비용 → 예산 영향
    if (operations && operations.venue && finance) {
      const venueCostPercent = (operations.venue.rental_cost / finance.budget.total) * 100;
      if (venueCostPercent > 30) {
        alerts.push({
          id: `alert_venue_cost_${Date.now()}`,
          type: "budget_impact",
          severity: venueCostPercent > 40 ? "critical" : "high",
          source_domain: "OPS",
          affected_domains: ["FIN", "STR"],
          title: "베뉴 비용 과다",
          description: `베뉴 비용이 전체 예산의 ${venueCostPercent.toFixed(1)}%를 차지합니다.`,
          recommended_actions: [
            "베뉴 협상 재개",
            "다른 항목 예산 조정",
            "추가 스폰서십 확보",
          ],
          created_at: now,
          acknowledged: false,
        });
      }
    }

    // 13. 필수 허가 미취득 → 리스크 영향
    if (operations && operations.site_management.permits.required > 0) {
      const permitProgress = operations.site_management.permits.obtained / operations.site_management.permits.required;
      if (permitProgress < 0.5 && project?.schedule.days_remaining && project.schedule.days_remaining < 30) {
        alerts.push({
          id: `alert_permit_${Date.now()}`,
          type: "logistics_issue",
          severity: permitProgress < 0.3 ? "critical" : "high",
          source_domain: "OPS",
          affected_domains: ["STR", "PRJ"],
          title: "허가 취득 지연",
          description: `필수 허가 ${operations.site_management.permits.obtained}/${operations.site_management.permits.required}개 취득, 행사까지 ${project.schedule.days_remaining}일 남음`,
          recommended_actions: [
            "허가 담당자 긴급 배정",
            "관할 기관 직접 방문",
            "행정사 대행 검토",
          ],
          created_at: now,
          acknowledged: false,
        });
      }
    }

    // 14. 안전 계획 미승인 → 리스크 영향
    if (operations && operations.safety_security.emergency_plan_status !== "approved") {
      alerts.push({
        id: `alert_safety_${Date.now()}`,
        type: "safety_concern",
        severity: operations.safety_security.emergency_plan_status === "pending" ? "critical" : "high",
        source_domain: "OPS",
        affected_domains: ["STR", "PRJ"],
        title: "비상 대응 계획 미완료",
        description: `비상 대응 계획 상태: ${operations.safety_security.emergency_plan_status}`,
        recommended_actions: [
          "안전 담당자 배정",
          "비상 대응 계획 수립",
          "관계 기관 협의",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 15. 스태프 부족 → 프로젝트/운영 영향
    if (operations && operations.staffing.total_required > 0) {
      const staffProgress = operations.staffing.confirmed / operations.staffing.total_required;
      if (staffProgress < 0.7) {
        alerts.push({
          id: `alert_staff_${Date.now()}`,
          type: "resource_constraint",
          severity: staffProgress < 0.5 ? "critical" : "high",
          source_domain: "OPS",
          affected_domains: ["PRJ", "FIN"],
          title: "현장 스태프 부족",
          description: `스태프 확보율 ${(staffProgress * 100).toFixed(0)}% (${operations.staffing.confirmed}/${operations.staffing.total_required}명)`,
          recommended_actions: [
            "긴급 채용 공고",
            "인력 파견 업체 접촉",
            "기존 스태프 추가 근무 협의",
          ],
          created_at: now,
          acknowledged: false,
        });
      }
    }

    // 16. 벤더 계약 지연 → 일정/예산 영향
    if (operations && operations.vendors.length > 0) {
      const unsignedVendors = operations.vendors.filter((v) => v.contract_status !== "signed");
      if (unsignedVendors.length > operations.vendors.length * 0.3) {
        alerts.push({
          id: `alert_vendor_${Date.now()}`,
          type: "vendor_delay",
          severity: unsignedVendors.length > operations.vendors.length * 0.5 ? "critical" : "high",
          source_domain: "OPS",
          affected_domains: ["PRJ", "FIN"],
          title: "벤더 계약 지연",
          description: `${unsignedVendors.length}개 벤더 계약 미완료 (전체 ${operations.vendors.length}개 중 ${((unsignedVendors.length / operations.vendors.length) * 100).toFixed(0)}%)`,
          recommended_actions: [
            "벤더 협상 가속화",
            "대체 벤더 물색",
            "계약 조건 재검토",
          ],
          created_at: now,
          acknowledged: false,
        });
      }
    }

    // 17. 케이터링 미확정 → 일정 영향
    if (operations && !operations.logistics.fb_status.caterer_confirmed && project?.schedule.days_remaining && project.schedule.days_remaining < 45) {
      alerts.push({
        id: `alert_catering_${Date.now()}`,
        type: "logistics_issue",
        severity: project.schedule.days_remaining < 30 ? "critical" : "high",
        source_domain: "OPS",
        affected_domains: ["PRJ", "FIN"],
        title: "케이터링 미확정",
        description: `행사까지 ${project.schedule.days_remaining}일 남았으나 케이터링이 확정되지 않았습니다.`,
        recommended_actions: [
          "케이터링 업체 긴급 선정",
          "메뉴 확정",
          "대안 옵션 준비",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 18. AV 장비 이슈 → 프로젝트/전략 영향
    if (operations && operations.site_management.av_equipment.issues > 0) {
      alerts.push({
        id: `alert_av_${Date.now()}`,
        type: "logistics_issue",
        severity: operations.site_management.av_equipment.issues > 3 ? "high" : "medium",
        source_domain: "OPS",
        affected_domains: ["PRJ", "STR"],
        title: "AV 장비 이슈 발생",
        description: `${operations.site_management.av_equipment.issues}개의 AV 장비 관련 이슈가 있습니다.`,
        recommended_actions: [
          "기술팀 긴급 점검",
          "백업 장비 준비",
          "벤더 지원 요청",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 19. 운영 이슈 누적 → 전체 영향
    if (operations && operations.issues.critical > 0) {
      alerts.push({
        id: `alert_ops_issues_${Date.now()}`,
        type: "logistics_issue",
        severity: operations.issues.critical > 2 ? "critical" : "high",
        source_domain: "OPS",
        affected_domains: ["STR", "PRJ", "FIN"],
        title: "크리티컬 운영 이슈 발생",
        description: `${operations.issues.critical}개의 크리티컬 운영 이슈가 미해결 상태입니다.`,
        recommended_actions: [
          "이슈별 담당자 배정",
          "일일 스탠드업 미팅 실시",
          "에스컬레이션 프로세스 가동",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 20. 숙박 예약 부족 → 마케팅/프로젝트 영향
    if (operations && operations.logistics.accommodation.room_block_size > 0) {
      const accommodationProgress = operations.logistics.accommodation.rooms_booked / operations.logistics.accommodation.room_block_size;
      if (accommodationProgress < 0.5) {
        alerts.push({
          id: `alert_accommodation_${Date.now()}`,
          type: "logistics_issue",
          severity: accommodationProgress < 0.3 ? "high" : "medium",
          source_domain: "OPS",
          affected_domains: ["MKT", "PRJ"],
          title: "숙박 예약 부진",
          description: `숙박 예약률 ${(accommodationProgress * 100).toFixed(0)}% (${operations.logistics.accommodation.rooms_booked}/${operations.logistics.accommodation.room_block_size}실)`,
          recommended_actions: [
            "참석자 숙박 안내 강화",
            "룸블록 축소 협상",
            "대체 숙박시설 안내",
          ],
          created_at: now,
          acknowledged: false,
        });
      }
    }

    // ============= HR DOMAIN ALERTS =============

    // 21. 스태프 부족 → 프로젝트/운영 영향
    if (hr && hr.staffing.total_required > 0) {
      const staffProgress = hr.staffing.total_confirmed / hr.staffing.total_required;
      if (staffProgress < 0.7) {
        alerts.push({
          id: `alert_hr_staffing_${Date.now()}`,
          type: "staffing_shortage",
          severity: staffProgress < 0.5 ? "critical" : "high",
          source_domain: "HR",
          affected_domains: ["PRJ", "OPS"],
          title: "인력 확보 부족",
          description: `스태프 확보율 ${(staffProgress * 100).toFixed(0)}% (${hr.staffing.total_confirmed}/${hr.staffing.total_required}명)`,
          recommended_actions: [
            "긴급 채용 공고 게시",
            "인력 파견 업체 접촉",
            "기존 스태프 추가 근무 협의",
            "업무 범위 조정 검토",
          ],
          created_at: now,
          acknowledged: false,
        });
      }
    }

    // 22. 노동비용 초과 → 재무 영향
    if (hr && hr.labor_costs.budget > 0 && hr.labor_costs.variance_percent > 10) {
      alerts.push({
        id: `alert_hr_labor_cost_${Date.now()}`,
        type: "labor_cost_overrun",
        severity: hr.labor_costs.variance_percent > 20 ? "critical" : "high",
        source_domain: "HR",
        affected_domains: ["FIN"],
        title: "노동비용 초과 예상",
        description: `노동비용 ${hr.labor_costs.variance_percent.toFixed(1)}% 초과 예상 (예산: ${(hr.labor_costs.budget / 1000000).toFixed(1)}M, 예상: ${(hr.labor_costs.projected / 1000000).toFixed(1)}M)`,
        recommended_actions: [
          "초과근무 최소화",
          "임시직 비율 조정",
          "업무 효율화 방안 검토",
          "예산 재배분 협의",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 23. 교육 미완료 → 운영/리스크 영향
    if (hr && hr.training.programs_scheduled > 0 && hr.training.completion_rate < 70 && project?.schedule.days_remaining && project.schedule.days_remaining < 14) {
      alerts.push({
        id: `alert_hr_training_${Date.now()}`,
        type: "training_gap",
        severity: hr.training.completion_rate < 50 ? "critical" : "high",
        source_domain: "HR",
        affected_domains: ["OPS", "STR"],
        title: "스태프 교육 미완료 위험",
        description: `교육 이수율 ${hr.training.completion_rate.toFixed(0)}%, 행사까지 ${project.schedule.days_remaining}일 남음`,
        recommended_actions: [
          "집중 교육 일정 편성",
          "온라인 교육 자료 배포",
          "현장 OJT 강화",
          "교육 미이수자 개별 연락",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 24. 근로계약 미체결 → 법적 리스크
    if (hr && hr.compliance.contracts_pending > hr.compliance.contracts_signed * 0.3) {
      alerts.push({
        id: `alert_hr_contracts_${Date.now()}`,
        type: "compliance_issue",
        severity: hr.compliance.contracts_pending > hr.compliance.contracts_signed ? "critical" : "high",
        source_domain: "HR",
        affected_domains: ["STR", "FIN"],
        title: "근로계약 체결 지연",
        description: `${hr.compliance.contracts_pending}건의 근로계약이 미체결 상태`,
        recommended_actions: [
          "계약 체결 가속화",
          "전자계약 시스템 활용",
          "법무 검토 우선순위 조정",
          "계약 조건 간소화 검토",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 25. 노동법 이슈 → 법적/전략 리스크
    if (hr && hr.compliance.labor_law_issues > 0) {
      alerts.push({
        id: `alert_hr_labor_law_${Date.now()}`,
        type: "compliance_issue",
        severity: "critical",
        source_domain: "HR",
        affected_domains: ["STR", "FIN"],
        title: "노동법 이슈 발생",
        description: `${hr.compliance.labor_law_issues}건의 노동법 관련 이슈가 있습니다.`,
        recommended_actions: [
          "법무팀 긴급 검토",
          "해당 사안 즉시 시정",
          "노무사 자문 요청",
          "재발 방지 대책 수립",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 26. 봉사자 확보 부진 → 운영/마케팅 영향
    if (hr && hr.volunteers.roles_open > 0) {
      const volunteerGap = hr.volunteers.roles_open / (hr.volunteers.roles_filled + hr.volunteers.roles_open);
      if (volunteerGap > 0.3) {
        alerts.push({
          id: `alert_hr_volunteers_${Date.now()}`,
          type: "staffing_shortage",
          severity: volunteerGap > 0.5 ? "high" : "medium",
          source_domain: "HR",
          affected_domains: ["OPS", "MKT"],
          title: "봉사자 확보 부진",
          description: `${hr.volunteers.roles_open}개 봉사자 역할 미배정 (전체의 ${(volunteerGap * 100).toFixed(0)}%)`,
          recommended_actions: [
            "봉사자 모집 홍보 강화",
            "인센티브 프로그램 검토",
            "대학/기관 협력 요청",
            "역할 통합 검토",
          ],
          created_at: now,
          acknowledged: false,
        });
      }
    }

    // 27. No-show 비율 높음 → 운영 영향 (이벤트 진행 중)
    if (hr && hr.attendance.no_show_count > 0 && hr.staffing.total_active > 0) {
      const noShowRate = hr.attendance.no_show_count / (hr.staffing.total_active + hr.attendance.no_show_count);
      if (noShowRate > 0.1) {
        alerts.push({
          id: `alert_hr_noshow_${Date.now()}`,
          type: "staffing_shortage",
          severity: noShowRate > 0.2 ? "critical" : "high",
          source_domain: "HR",
          affected_domains: ["OPS"],
          title: "스태프 No-show 경고",
          description: `${hr.attendance.no_show_count}명 미출근 (No-show율 ${(noShowRate * 100).toFixed(0)}%)`,
          recommended_actions: [
            "백업 인력 긴급 배치",
            "역할 재배분",
            "미출근자 연락 시도",
            "에이전시 추가 인력 요청",
          ],
          created_at: now,
          acknowledged: false,
        });
      }
    }

    // 28. 초과근무 누적 → 예산/컴플라이언스 영향
    if (hr && hr.attendance.overtime_hours > 100) {
      alerts.push({
        id: `alert_hr_overtime_${Date.now()}`,
        type: "labor_cost_overrun",
        severity: hr.attendance.overtime_hours > 200 ? "high" : "medium",
        source_domain: "HR",
        affected_domains: ["FIN", "STR"],
        title: "초과근무 누적 경고",
        description: `총 ${hr.attendance.overtime_hours}시간의 초과근무 발생`,
        recommended_actions: [
          "교대 일정 조정",
          "추가 인력 투입",
          "업무 우선순위 재조정",
          "초과근무 수당 예산 확인",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // ============= MEETINGS & CONTENTS DOMAIN ALERTS =============

    // 29. 연사 확보 부진 → 프로그램/마케팅/전략 영향
    if (meetings && meetings.speakers.total_invited > 0) {
      const confirmedRate = meetings.speakers.confirmed / meetings.speakers.total_invited;
      if (confirmedRate < 0.6 && project?.schedule.days_remaining && project.schedule.days_remaining < 45) {
        alerts.push({
          id: `alert_mtg_speakers_${Date.now()}`,
          type: "speaker_shortage",
          severity: confirmedRate < 0.4 ? "critical" : "high",
          source_domain: "MTG",
          affected_domains: ["STR", "MKT", "PRJ"],
          title: "연사 확보 부진",
          description: `연사 확정률 ${(confirmedRate * 100).toFixed(0)}% (${meetings.speakers.confirmed}/${meetings.speakers.total_invited}명), 행사까지 ${project.schedule.days_remaining}일 남음`,
          recommended_actions: [
            "대기 연사 명단 활성화",
            "연사 조건 재협상",
            "긴급 연사 섭외 네트워크 활용",
            "세션 통합/축소 검토",
          ],
          created_at: now,
          acknowledged: false,
        });
      }
    }

    // 30. 발표자료 제출 지연 → 프로그램/운영 영향
    if (meetings && meetings.content.presentations_pending > 0 && project?.schedule.days_remaining && project.schedule.days_remaining < 14) {
      const pendingRate = meetings.content.presentations_pending / (meetings.content.presentations_received + meetings.content.presentations_pending);
      if (pendingRate > 0.3) {
        alerts.push({
          id: `alert_mtg_content_${Date.now()}`,
          type: "content_delay",
          severity: pendingRate > 0.5 ? "critical" : "high",
          source_domain: "MTG",
          affected_domains: ["PRJ", "OPS"],
          title: "발표자료 제출 지연",
          description: `${meetings.content.presentations_pending}개 발표자료 미제출 (${(pendingRate * 100).toFixed(0)}%), 행사까지 ${project.schedule.days_remaining}일`,
          recommended_actions: [
            "연사 개별 리마인더 발송",
            "제출 마감 재공지",
            "연사 지원팀 배치",
            "최소 요구사항 완화 검토",
          ],
          created_at: now,
          acknowledged: false,
        });
      }
    }

    // 31. 프로그램 일정 충돌 → 운영/전략 영향
    if (meetings && meetings.schedule.conflicts_detected > 0) {
      alerts.push({
        id: `alert_mtg_conflict_${Date.now()}`,
        type: "program_conflict",
        severity: meetings.schedule.conflicts_detected > 3 ? "critical" : "high",
        source_domain: "MTG",
        affected_domains: ["OPS", "STR"],
        title: "프로그램 일정 충돌",
        description: `${meetings.schedule.conflicts_detected}개의 일정 충돌이 감지되었습니다.`,
        recommended_actions: [
          "세션 시간 재조정",
          "병렬 세션 구성 검토",
          "장소 재배치",
          "이해관계자 협의",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 32. 초록 심사 적체 → 프로그램/전략 영향
    if (meetings && meetings.content.abstracts_pending_review > meetings.content.abstracts_accepted * 0.5 && project?.schedule.days_remaining && project.schedule.days_remaining < 30) {
      alerts.push({
        id: `alert_mtg_abstract_${Date.now()}`,
        type: "abstract_review_backlog",
        severity: meetings.content.abstracts_pending_review > meetings.content.abstracts_accepted ? "critical" : "high",
        source_domain: "MTG",
        affected_domains: ["STR", "PRJ"],
        title: "초록 심사 적체",
        description: `${meetings.content.abstracts_pending_review}개 초록이 심사 대기 중, 행사까지 ${project.schedule.days_remaining}일`,
        recommended_actions: [
          "심사위원 추가 배정",
          "심사 기간 연장 협의",
          "심사 기준 간소화",
          "자동 심사 도구 활용",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 33. CE 인증 위험 → 전략/마케팅 영향
    if (meetings && meetings.ce_credits.accreditation_applied && !meetings.ce_credits.credits_approved && project?.schedule.days_remaining && project.schedule.days_remaining < 21) {
      alerts.push({
        id: `alert_mtg_ce_${Date.now()}`,
        type: "ce_accreditation_risk",
        severity: project.schedule.days_remaining < 14 ? "critical" : "high",
        source_domain: "MTG",
        affected_domains: ["STR", "MKT"],
        title: "CE 인증 승인 지연",
        description: `CE 인증이 아직 승인되지 않았습니다. 행사까지 ${project.schedule.days_remaining}일`,
        recommended_actions: [
          "인증 기관 긴급 연락",
          "서류 보완 확인",
          "대체 인증 옵션 검토",
          "참석자 사전 공지 준비",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 34. 연사 비용 초과 → 재무 영향
    if (meetings && meetings.speakers.honorarium_committed > meetings.speakers.honorarium_budget * 1.1) {
      const overrunPercent = ((meetings.speakers.honorarium_committed / meetings.speakers.honorarium_budget) - 1) * 100;
      alerts.push({
        id: `alert_mtg_speaker_cost_${Date.now()}`,
        type: "budget_impact",
        severity: overrunPercent > 20 ? "critical" : "high",
        source_domain: "MTG",
        affected_domains: ["FIN"],
        title: "연사 비용 초과",
        description: `연사 사례비가 예산 대비 ${overrunPercent.toFixed(1)}% 초과 (예산: ${(meetings.speakers.honorarium_budget / 1000000).toFixed(1)}M, 확정: ${(meetings.speakers.honorarium_committed / 1000000).toFixed(1)}M)`,
        recommended_actions: [
          "추가 예산 확보 협의",
          "연사 조건 재협상",
          "무료 연사 비율 확대",
          "다른 항목 예산 재배분",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 35. 세션 참여도 저조 → 전략/마케팅 영향
    if (meetings && meetings.engagement.session_ratings_avg > 0 && meetings.engagement.session_ratings_avg < 3.5) {
      alerts.push({
        id: `alert_mtg_engagement_${Date.now()}`,
        type: "stakeholder_concern",
        severity: meetings.engagement.session_ratings_avg < 3.0 ? "critical" : "high",
        source_domain: "MTG",
        affected_domains: ["STR", "MKT"],
        title: "세션 참여도/만족도 저조",
        description: `평균 세션 평점 ${meetings.engagement.session_ratings_avg.toFixed(1)}/5.0`,
        recommended_actions: [
          "저평가 세션 원인 분석",
          "실시간 프로그램 조정",
          "참석자 피드백 수집 강화",
          "인터랙티브 요소 추가",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    // 36. 앱 도입률 저조 → 운영/마케팅 영향
    if (meetings && meetings.engagement.app_adoption_rate < 50) {
      alerts.push({
        id: `alert_mtg_app_${Date.now()}`,
        type: "channel_underperformance",
        severity: meetings.engagement.app_adoption_rate < 30 ? "high" : "medium",
        source_domain: "MTG",
        affected_domains: ["OPS", "MKT"],
        title: "이벤트 앱 도입률 저조",
        description: `앱 도입률 ${meetings.engagement.app_adoption_rate.toFixed(0)}% (권장 70% 이상)`,
        recommended_actions: [
          "앱 다운로드 안내 강화",
          "앱 전용 혜택 제공",
          "현장 QR 코드 배치",
          "앱 사용 교육 세션 운영",
        ],
        created_at: now,
        acknowledged: false,
      });
    }

    return alerts;
  }

  /**
   * 특정 도메인 변경이 다른 도메인에 미치는 영향 분석
   */
  async analyzeImpact(
    eventId: string,
    sourceDomain: "STR" | "FIN" | "PRJ" | "MKT" | "OPS" | "HR" | "MTG",
    changeType: string,
    changeData: Record<string, unknown>
  ): Promise<ImpactResult[]> {
    const context = await this.getSharedContext(eventId);
    const impacts: ImpactResult[] = [];

    // ImpactAnalyzer 활용
    const analyzer = new ImpactAnalyzer(context);

    switch (sourceDomain) {
      case "PRJ":
        if (changeType === "schedule_change") {
          impacts.push(...analyzer.onScheduleChange(changeData));
        } else if (changeType === "resource_change") {
          impacts.push(...analyzer.onResourceChange(changeData));
        }
        break;

      case "FIN":
        if (changeType === "budget_change") {
          impacts.push(...analyzer.onBudgetChange(changeData));
        } else if (changeType === "sponsor_change") {
          impacts.push(...analyzer.onSponsorChange(changeData));
        }
        break;

      case "STR":
        if (changeType === "goal_change") {
          impacts.push(...analyzer.onGoalChange(changeData));
        } else if (changeType === "risk_change") {
          impacts.push(...analyzer.onRiskChange(changeData));
        }
        break;

      case "MKT":
        if (changeType === "campaign_change") {
          impacts.push(...analyzer.onCampaignChange(changeData));
        } else if (changeType === "channel_change") {
          impacts.push(...analyzer.onChannelChange(changeData));
        } else if (changeType === "registration_change") {
          impacts.push(...analyzer.onRegistrationChange(changeData));
        }
        break;

      case "OPS":
        if (changeType === "venue_change") {
          impacts.push(...analyzer.onVenueChange(changeData));
        } else if (changeType === "vendor_change") {
          impacts.push(...analyzer.onVendorChange(changeData));
        } else if (changeType === "staff_change") {
          impacts.push(...analyzer.onStaffChange(changeData));
        } else if (changeType === "logistics_change") {
          impacts.push(...analyzer.onLogisticsChange(changeData));
        }
        break;

      case "HR":
        if (changeType === "staffing_change") {
          impacts.push(...analyzer.onHRStaffingChange(changeData));
        } else if (changeType === "labor_cost_change") {
          impacts.push(...analyzer.onLaborCostChange(changeData));
        } else if (changeType === "training_change") {
          impacts.push(...analyzer.onTrainingChange(changeData));
        } else if (changeType === "volunteer_change") {
          impacts.push(...analyzer.onVolunteerChange(changeData));
        }
        break;

      case "MTG":
        if (changeType === "speaker_change") {
          impacts.push(...analyzer.onSpeakerChange(changeData));
        } else if (changeType === "session_change") {
          impacts.push(...analyzer.onSessionChange(changeData));
        } else if (changeType === "content_change") {
          impacts.push(...analyzer.onContentChange(changeData));
        } else if (changeType === "program_change") {
          impacts.push(...analyzer.onProgramChange(changeData));
        }
        break;
    }

    return impacts;
  }
}

// =============================================================================
// IMPACT ANALYZER CLASS
// =============================================================================

export class ImpactAnalyzer {
  private context: SharedContext;

  constructor(context: SharedContext) {
    this.context = context;
  }

  /**
   * 일정 변경 → 예산/리스크 영향 분석
   */
  onScheduleChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const delayDays = Number(changeData.delay_days) || 0;
    const affectedMilestone = String(changeData.milestone_name || "");

    if (delayDays > 0 && this.context.finance) {
      // 예산 영향 계산 (일당 추가 비용)
      const dailyBurnRate = this.context.finance.budget.spent /
        (this.context.project?.schedule.days_remaining
          ? Math.max(1, 365 - this.context.project.schedule.days_remaining)
          : 30);
      const additionalCost = dailyBurnRate * delayDays;
      const impactPercent = (additionalCost / this.context.finance.budget.total) * 100;

      impacts.push({
        domain: "FIN",
        impact_type: "budget_increase",
        severity: impactPercent > 10 ? "critical" : impactPercent > 5 ? "high" : "medium",
        description: `${delayDays}일 일정 지연으로 인한 추가 비용 발생 예상`,
        metrics_affected: [
          {
            metric: "additional_cost",
            before: 0,
            after: additionalCost,
            change_percent: impactPercent,
          },
          {
            metric: "remaining_budget",
            before: this.context.finance.budget.remaining,
            after: this.context.finance.budget.remaining - additionalCost,
            change_percent: -(additionalCost / this.context.finance.budget.remaining) * 100,
          },
        ],
        recommended_actions: [
          "컨틴전시 예산 검토",
          "비필수 항목 비용 절감",
          "일정 압축 방안 검토",
        ],
      });
    }

    // 리스크 영향
    if (delayDays > 7 && this.context.strategy) {
      impacts.push({
        domain: "STR",
        impact_type: "risk_increase",
        severity: delayDays > 14 ? "high" : "medium",
        description: `${affectedMilestone || "마일스톤"} 지연으로 인한 리스크 상승`,
        metrics_affected: [
          {
            metric: "schedule_risk_score",
            before: 0.3,
            after: Math.min(0.9, 0.3 + delayDays * 0.03),
            change_percent: delayDays * 10,
          },
        ],
        recommended_actions: [
          "리스크 레지스터 업데이트",
          "이해관계자 사전 통보",
          "완화 계획 활성화",
        ],
      });
    }

    return impacts;
  }

  /**
   * 예산 변경 → 프로젝트/전략 영향 분석
   */
  onBudgetChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const changeAmount = Number(changeData.change_amount) || 0;
    const changeReason = String(changeData.reason || "예산 조정");

    if (changeAmount < 0 && this.context.project) {
      // 예산 삭감 → 프로젝트 범위 영향
      const cutPercent = Math.abs(changeAmount) / (this.context.finance?.budget.total || 1) * 100;

      impacts.push({
        domain: "PRJ",
        impact_type: "scope_reduction",
        severity: cutPercent > 20 ? "critical" : cutPercent > 10 ? "high" : "medium",
        description: `${cutPercent.toFixed(1)}% 예산 삭감으로 범위 조정 필요`,
        metrics_affected: [
          {
            metric: "scope_impact",
            before: 100,
            after: 100 - cutPercent * 0.5,
            change_percent: -cutPercent * 0.5,
          },
        ],
        recommended_actions: [
          "필수/선택 항목 구분",
          "범위 우선순위 재조정",
          "대안 솔루션 검토",
        ],
      });
    }

    // 전략 목표 달성 영향
    if (changeAmount < 0 && this.context.strategy) {
      impacts.push({
        domain: "STR",
        impact_type: "goal_impact",
        severity: Math.abs(changeAmount) > (this.context.finance?.budget.total || 0) * 0.15 ? "high" : "medium",
        description: `예산 변경으로 목표 달성에 영향 가능`,
        metrics_affected: [
          {
            metric: "goal_achievement_probability",
            before: 0.85,
            after: 0.85 - Math.min(0.3, Math.abs(changeAmount) / (this.context.finance?.budget.total || 1) * 0.5),
            change_percent: -Math.abs(changeAmount) / (this.context.finance?.budget.total || 1) * 50,
          },
        ],
        recommended_actions: [
          "목표 우선순위 재검토",
          "KPI 목표치 조정 검토",
          "대안 전략 수립",
        ],
      });
    }

    return impacts;
  }

  /**
   * 리소스 변경 → 일정/예산 영향 분석
   */
  onResourceChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const resourceType = String(changeData.resource_type || "인력");
    const changeType = String(changeData.change_type || "reduction"); // addition, reduction
    const quantity = Number(changeData.quantity) || 1;

    if (changeType === "reduction" && this.context.project) {
      // 리소스 감소 → 일정 영향
      const currentUtilization = this.context.project.resources.utilization_percent;
      const estimatedDelay = quantity * 3; // 리소스 1개당 약 3일 지연 가정

      impacts.push({
        domain: "PRJ",
        impact_type: "schedule_delay",
        severity: estimatedDelay > 14 ? "high" : estimatedDelay > 7 ? "medium" : "low",
        description: `${resourceType} ${quantity}개 감소로 약 ${estimatedDelay}일 지연 예상`,
        metrics_affected: [
          {
            metric: "estimated_delay_days",
            before: 0,
            after: estimatedDelay,
            change_percent: 100,
          },
          {
            metric: "team_utilization",
            before: currentUtilization,
            after: Math.min(100, currentUtilization + 15),
            change_percent: 15,
          },
        ],
        recommended_actions: [
          "태스크 우선순위 재조정",
          "병렬 작업 축소",
          "외부 리소스 검토",
        ],
      });
    }

    return impacts;
  }

  /**
   * 스폰서 변경 → 예산/전략 영향 분석
   */
  onSponsorChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const sponsorName = String(changeData.sponsor_name || "스폰서");
    const previousAmount = Number(changeData.previous_amount) || 0;
    const newAmount = Number(changeData.new_amount) || 0;
    const difference = newAmount - previousAmount;

    if (difference < 0) {
      const lossPercent = Math.abs(difference) / (this.context.finance?.budget.total || 1) * 100;

      impacts.push({
        domain: "FIN",
        impact_type: "funding_reduction",
        severity: lossPercent > 15 ? "critical" : lossPercent > 8 ? "high" : "medium",
        description: `${sponsorName} 후원 감소로 ${(Math.abs(difference) / 1000000).toFixed(1)}M 자금 부족`,
        metrics_affected: [
          {
            metric: "total_funding",
            before: previousAmount,
            after: newAmount,
            change_percent: (difference / previousAmount) * 100,
          },
        ],
        recommended_actions: [
          "대체 스폰서 물색",
          "예산 재조정",
          "비용 절감 계획 수립",
        ],
      });

      // 전략적 영향
      impacts.push({
        domain: "STR",
        impact_type: "partnership_change",
        severity: lossPercent > 10 ? "high" : "medium",
        description: `주요 파트너십 변경으로 전략 재검토 필요`,
        metrics_affected: [
          {
            metric: "partner_relationship_score",
            before: 0.8,
            after: 0.6,
            change_percent: -25,
          },
        ],
        recommended_actions: [
          "스폰서 관계 분석",
          "파트너십 전략 수정",
          "이해관계자 커뮤니케이션",
        ],
      });
    }

    return impacts;
  }

  /**
   * 목표 변경 → 프로젝트/재무 영향 분석
   */
  onGoalChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const goalName = String(changeData.goal_name || "목표");
    const changeType = String(changeData.change_type || "modify"); // add, remove, modify
    const priorityChange = String(changeData.priority_change || ""); // upgrade, downgrade

    if (changeType === "add" || priorityChange === "upgrade") {
      impacts.push({
        domain: "PRJ",
        impact_type: "scope_increase",
        severity: "medium",
        description: `새로운 목표 또는 우선순위 상승으로 프로젝트 범위 확대`,
        metrics_affected: [
          {
            metric: "project_scope",
            before: 100,
            after: 115,
            change_percent: 15,
          },
        ],
        recommended_actions: [
          "추가 리소스 확보",
          "일정 재검토",
          "우선순위 재조정",
        ],
      });

      impacts.push({
        domain: "FIN",
        impact_type: "budget_pressure",
        severity: "medium",
        description: `목표 확대로 예산 압박 예상`,
        metrics_affected: [
          {
            metric: "budget_adequacy",
            before: 100,
            after: 85,
            change_percent: -15,
          },
        ],
        recommended_actions: [
          "추가 예산 확보",
          "비용 최적화",
          "범위 절충안 검토",
        ],
      });
    }

    return impacts;
  }

  /**
   * 리스크 변경 → 전 도메인 영향 분석
   */
  onRiskChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const riskName = String(changeData.risk_name || "리스크");
    const previousSeverity = String(changeData.previous_severity || "medium");
    const newSeverity = String(changeData.new_severity || "medium");
    const severityMap: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };

    if (severityMap[newSeverity] > severityMap[previousSeverity]) {
      // 리스크 심각도 상승
      impacts.push({
        domain: "PRJ",
        impact_type: "risk_escalation",
        severity: newSeverity as "critical" | "high" | "medium" | "low",
        description: `${riskName} 리스크가 ${previousSeverity}에서 ${newSeverity}로 상승`,
        metrics_affected: [
          {
            metric: "risk_score",
            before: severityMap[previousSeverity],
            after: severityMap[newSeverity],
            change_percent: ((severityMap[newSeverity] - severityMap[previousSeverity]) / severityMap[previousSeverity]) * 100,
          },
        ],
        recommended_actions: [
          "긴급 완화 조치 실행",
          "컨틴전시 계획 활성화",
          "이해관계자 통보",
        ],
      });

      if (newSeverity === "critical" || newSeverity === "high") {
        impacts.push({
          domain: "FIN",
          impact_type: "contingency_activation",
          severity: newSeverity as "critical" | "high",
          description: `고위험 리스크로 인한 컨틴전시 예산 검토 필요`,
          metrics_affected: [
            {
              metric: "contingency_usage",
              before: 0,
              after: 20,
              change_percent: 100,
            },
          ],
          recommended_actions: [
            "컨틴전시 예산 배정",
            "보험 청구 검토",
            "비상 자금 확보",
          ],
        });
      }
    }

    return impacts;
  }

  /**
   * 예산 영향 계산 헬퍼
   */
  calculateBudgetImpact(scheduleChange: { delayDays: number }): ImpactResult | null {
    if (!this.context.finance) return null;

    const dailyBurnRate = this.context.finance.budget.spent / 30; // 월 기준
    const additionalCost = dailyBurnRate * scheduleChange.delayDays;

    return {
      domain: "FIN",
      impact_type: "budget_increase",
      severity: additionalCost > this.context.finance.budget.remaining * 0.2 ? "critical" : "high",
      description: `일정 지연으로 인한 추가 비용 ${(additionalCost / 1000000).toFixed(1)}M 예상`,
      metrics_affected: [
        {
          metric: "additional_cost",
          before: 0,
          after: additionalCost,
          change_percent: (additionalCost / this.context.finance.budget.total) * 100,
        },
      ],
      recommended_actions: [
        "예산 재조정",
        "비용 절감 방안 검토",
      ],
    };
  }

  /**
   * 리스크 영향 계산 헬퍼
   */
  calculateRiskImpact(scheduleChange: { delayDays: number; milestone?: string }): ImpactResult | null {
    if (!this.context.strategy) return null;

    const riskIncrease = Math.min(0.5, scheduleChange.delayDays * 0.02);

    return {
      domain: "STR",
      impact_type: "risk_increase",
      severity: riskIncrease > 0.3 ? "high" : "medium",
      description: `${scheduleChange.milestone || "마일스톤"} 지연으로 리스크 ${(riskIncrease * 100).toFixed(0)}% 상승`,
      metrics_affected: [
        {
          metric: "overall_risk_score",
          before: 0.3,
          after: 0.3 + riskIncrease,
          change_percent: riskIncrease * 100,
        },
      ],
      recommended_actions: [
        "리스크 완화 조치 강화",
        "이해관계자 사전 통보",
      ],
    };
  }

  /**
   * 캠페인 변경 → 예산/전략 영향 분석
   */
  onCampaignChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const campaignName = String(changeData.campaign_name || "캠페인");
    const changeType = String(changeData.change_type || "modify"); // add, pause, budget_change
    const budgetChange = Number(changeData.budget_change) || 0;

    if (changeType === "add" || budgetChange > 0) {
      // 캠페인 추가/예산 증가 → 재무 영향
      impacts.push({
        domain: "FIN",
        impact_type: "budget_allocation",
        severity: budgetChange > (this.context.finance?.budget.remaining || 0) * 0.1 ? "high" : "medium",
        description: `${campaignName} 캠페인으로 인한 마케팅 예산 증가`,
        metrics_affected: [
          {
            metric: "marketing_budget",
            before: this.context.marketing?.campaigns.reduce((sum, c) => sum + c.budget, 0) || 0,
            after: (this.context.marketing?.campaigns.reduce((sum, c) => sum + c.budget, 0) || 0) + budgetChange,
            change_percent: budgetChange > 0 ? (budgetChange / (this.context.finance?.budget.total || 1)) * 100 : 0,
          },
        ],
        recommended_actions: [
          "예산 재배분 검토",
          "캠페인 ROI 목표 설정",
          "다른 항목 예산 조정",
        ],
      });
    }

    if (changeType === "pause") {
      // 캠페인 중단 → 전략 영향
      impacts.push({
        domain: "STR",
        impact_type: "marketing_strategy_change",
        severity: "medium",
        description: `${campaignName} 캠페인 중단으로 마케팅 전략 조정 필요`,
        metrics_affected: [
          {
            metric: "campaign_coverage",
            before: this.context.marketing?.campaigns.filter((c) => c.status === "active").length || 0,
            after: (this.context.marketing?.campaigns.filter((c) => c.status === "active").length || 0) - 1,
            change_percent: -10,
          },
        ],
        recommended_actions: [
          "대체 캠페인 검토",
          "다른 채널 강화",
          "타겟 오디언스 재평가",
        ],
      });
    }

    return impacts;
  }

  /**
   * 채널 변경 → 마케팅/전략 영향 분석
   */
  onChannelChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const channelName = String(changeData.channel_name || "채널");
    const performanceChange = Number(changeData.performance_change) || 0; // percentage

    if (performanceChange < -20) {
      // 채널 성과 급락
      impacts.push({
        domain: "MKT",
        impact_type: "channel_performance_drop",
        severity: performanceChange < -40 ? "critical" : "high",
        description: `${channelName} 채널 성과 ${Math.abs(performanceChange).toFixed(0)}% 하락`,
        metrics_affected: [
          {
            metric: "channel_performance",
            before: 100,
            after: 100 + performanceChange,
            change_percent: performanceChange,
          },
        ],
        recommended_actions: [
          "채널 전략 긴급 재검토",
          "예산 재배분",
          "대체 채널 활성화",
        ],
      });

      // 전략 영향
      impacts.push({
        domain: "STR",
        impact_type: "reach_reduction",
        severity: "high",
        description: `주요 마케팅 채널 성과 하락으로 도달률 감소 우려`,
        metrics_affected: [
          {
            metric: "expected_reach",
            before: this.context.marketing?.performance.reach.impressions || 0,
            after: (this.context.marketing?.performance.reach.impressions || 0) * (1 + performanceChange / 100),
            change_percent: performanceChange,
          },
        ],
        recommended_actions: [
          "등록 목표 재검토",
          "추가 마케팅 활동 계획",
        ],
      });
    }

    return impacts;
  }

  /**
   * 등록 현황 변경 → 전략/재무 영향 분석
   */
  onRegistrationChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const previousCount = Number(changeData.previous_count) || 0;
    const newCount = Number(changeData.new_count) || 0;
    const target = this.context.marketing?.performance.registrations.target || 1;
    const progressPercent = (newCount / target) * 100;

    if (newCount > previousCount) {
      // 등록 증가 → 긍정적 영향
      const increaseRate = ((newCount - previousCount) / previousCount) * 100;

      if (increaseRate > 30) {
        // 급격한 등록 증가 → 리소스 검토 필요
        impacts.push({
          domain: "PRJ",
          impact_type: "capacity_check",
          severity: "medium",
          description: `등록 급증 (${increaseRate.toFixed(0)}% 증가) - 행사 수용력 확인 필요`,
          metrics_affected: [
            {
              metric: "registrations",
              before: previousCount,
              after: newCount,
              change_percent: increaseRate,
            },
          ],
          recommended_actions: [
            "venue 수용력 재확인",
            "케이터링/물자 수량 조정",
            "스태프 추가 배치 검토",
          ],
        });
      }

      // 재무 영향 (수익 증가)
      const ticketRevenue = Number(changeData.average_ticket_price) || 50000; // 기본 5만원
      const additionalRevenue = (newCount - previousCount) * ticketRevenue;

      impacts.push({
        domain: "FIN",
        impact_type: "revenue_increase",
        severity: "low",
        description: `등록 증가로 약 ${(additionalRevenue / 1000000).toFixed(1)}M 추가 수익 예상`,
        metrics_affected: [
          {
            metric: "ticket_revenue",
            before: previousCount * ticketRevenue,
            after: newCount * ticketRevenue,
            change_percent: increaseRate,
          },
        ],
        recommended_actions: [
          "매출 예측 업데이트",
          "추가 비용 계획 수립",
        ],
      });
    } else if (progressPercent < 50 && this.context.project?.schedule.days_remaining && this.context.project.schedule.days_remaining < 30) {
      // 등록 부진
      impacts.push({
        domain: "STR",
        impact_type: "registration_shortfall",
        severity: progressPercent < 30 ? "critical" : "high",
        description: `등록 목표 달성률 ${progressPercent.toFixed(0)}%, 긴급 대책 필요`,
        metrics_affected: [
          {
            metric: "registration_progress",
            before: (previousCount / target) * 100,
            after: progressPercent,
            change_percent: progressPercent - (previousCount / target) * 100,
          },
        ],
        recommended_actions: [
          "긴급 프로모션 실행",
          "타겟 마케팅 강화",
          "목표 하향 조정 검토",
        ],
      });

      impacts.push({
        domain: "FIN",
        impact_type: "revenue_risk",
        severity: "high",
        description: `등록 부진으로 예상 수익 감소 위험`,
        metrics_affected: [
          {
            metric: "projected_revenue",
            before: target * (Number(changeData.average_ticket_price) || 50000),
            after: newCount * (Number(changeData.average_ticket_price) || 50000),
            change_percent: -(100 - progressPercent),
          },
        ],
        recommended_actions: [
          "비용 절감 계획 수립",
          "스폰서십 추가 확보",
          "contingency 예산 활용",
        ],
      });
    }

    return impacts;
  }

  // ============= OPERATIONS DOMAIN IMPACT ANALYZERS =============

  /**
   * 베뉴 변경 → 예산/일정/마케팅 영향 분석
   */
  onVenueChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const changeType = String(changeData.change_type || "modify"); // add, cancel, cost_change
    const costChange = Number(changeData.cost_change) || 0;
    const venueName = String(changeData.venue_name || "베뉴");

    // 베뉴 비용 변경 → 예산 영향
    if (costChange !== 0 && this.context.finance) {
      const costImpactPercent = (Math.abs(costChange) / this.context.finance.budget.total) * 100;
      impacts.push({
        domain: "FIN",
        impact_type: costChange > 0 ? "budget_increase" : "budget_savings",
        severity: costImpactPercent > 10 ? "high" : "medium",
        description: `${venueName} 베뉴 비용 ${costChange > 0 ? "증가" : "감소"}로 예산 ${costImpactPercent.toFixed(1)}% 영향`,
        metrics_affected: [
          {
            metric: "venue_cost",
            before: this.context.operations?.venue?.rental_cost || 0,
            after: (this.context.operations?.venue?.rental_cost || 0) + costChange,
            change_percent: costChange > 0 ? costImpactPercent : -costImpactPercent,
          },
        ],
        recommended_actions: costChange > 0
          ? ["다른 항목 예산 조정", "추가 스폰서십 확보", "베뉴 협상 재개"]
          : ["절감액 재배분 계획", "contingency 예산 확보"],
      });
    }

    // 베뉴 변경 → 마케팅 영향 (홍보물 재작업)
    if (changeType === "cancel" || changeType === "change") {
      impacts.push({
        domain: "MKT",
        impact_type: "collateral_update",
        severity: "high",
        description: `베뉴 변경으로 모든 마케팅 자료 업데이트 필요`,
        metrics_affected: [
          {
            metric: "marketing_rework",
            before: 0,
            after: 100,
            change_percent: 100,
          },
        ],
        recommended_actions: [
          "홈페이지/앱 베뉴 정보 업데이트",
          "인쇄물 수정 또는 재발행",
          "참석자 공지 발송",
          "SNS 공지",
        ],
      });

      // 베뉴 변경 → 일정 영향
      impacts.push({
        domain: "PRJ",
        impact_type: "schedule_impact",
        severity: "medium",
        description: `베뉴 변경으로 관련 태스크 일정 조정 필요`,
        metrics_affected: [
          {
            metric: "affected_tasks",
            before: 0,
            after: 15,
            change_percent: 100,
          },
        ],
        recommended_actions: [
          "베뉴 관련 마일스톤 재검토",
          "벤더 계약 재협상",
          "셋업 일정 재조정",
        ],
      });
    }

    return impacts;
  }

  /**
   * 벤더 변경 → 예산/일정 영향 분석
   */
  onVendorChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const vendorName = String(changeData.vendor_name || "벤더");
    const changeType = String(changeData.change_type || "modify"); // add, remove, contract_issue
    const budgetImpact = Number(changeData.budget_impact) || 0;

    if (changeType === "remove" || changeType === "contract_issue") {
      impacts.push({
        domain: "PRJ",
        impact_type: "vendor_risk",
        severity: "high",
        description: `${vendorName} 벤더 이슈로 일정 차질 위험`,
        metrics_affected: [
          {
            metric: "vendor_reliability",
            before: 100,
            after: 60,
            change_percent: -40,
          },
        ],
        recommended_actions: [
          "대체 벤더 긴급 물색",
          "일정 버퍼 확보",
          "내부 대응 방안 검토",
        ],
      });

      if (budgetImpact > 0 && this.context.finance) {
        impacts.push({
          domain: "FIN",
          impact_type: "unexpected_cost",
          severity: budgetImpact > this.context.finance.budget.remaining * 0.05 ? "high" : "medium",
          description: `벤더 변경으로 추가 비용 ${(budgetImpact / 1000000).toFixed(1)}M 발생 예상`,
          metrics_affected: [
            {
              metric: "vendor_cost",
              before: 0,
              after: budgetImpact,
              change_percent: (budgetImpact / this.context.finance.budget.total) * 100,
            },
          ],
          recommended_actions: [
            "contingency 예산 사용 승인",
            "비용 협상",
            "범위 조정 검토",
          ],
        });
      }
    }

    return impacts;
  }

  /**
   * 스태프 변경 → 운영/예산 영향 분석
   */
  onStaffChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const changeType = String(changeData.change_type || "modify"); // increase, decrease, role_change
    const staffCount = Number(changeData.staff_count) || 0;
    const role = String(changeData.role || "스태프");

    if (changeType === "decrease" && staffCount > 0) {
      impacts.push({
        domain: "OPS",
        impact_type: "capacity_reduction",
        severity: staffCount > 5 ? "high" : "medium",
        description: `${role} ${staffCount}명 감소로 현장 운영 역량 저하`,
        metrics_affected: [
          {
            metric: "staff_capacity",
            before: this.context.operations?.staffing.confirmed || 0,
            after: (this.context.operations?.staffing.confirmed || 0) - staffCount,
            change_percent: -((staffCount / (this.context.operations?.staffing.total_required || 1)) * 100),
          },
        ],
        recommended_actions: [
          "역할 재배치",
          "자동화/기술 솔루션 도입",
          "긴급 인력 충원",
        ],
      });
    }

    if (changeType === "increase" && staffCount > 0 && this.context.finance) {
      const avgStaffCost = 150000; // 일당 15만원 가정
      const additionalCost = staffCount * avgStaffCost;
      impacts.push({
        domain: "FIN",
        impact_type: "labor_cost_increase",
        severity: additionalCost > this.context.finance.budget.remaining * 0.03 ? "high" : "medium",
        description: `스태프 ${staffCount}명 추가로 인건비 ${(additionalCost / 1000000).toFixed(1)}M 증가`,
        metrics_affected: [
          {
            metric: "staff_cost",
            before: 0,
            after: additionalCost,
            change_percent: (additionalCost / this.context.finance.budget.total) * 100,
          },
        ],
        recommended_actions: [
          "예산 재배분",
          "스태프 효율화 방안 검토",
        ],
      });
    }

    return impacts;
  }

  /**
   * 물류/로지스틱스 변경 → 운영/예산/일정 영향 분석
   */
  onLogisticsChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const category = String(changeData.category || "logistics"); // fb, transport, accommodation, equipment
    const changeType = String(changeData.change_type || "modify");
    const costChange = Number(changeData.cost_change) || 0;

    // F&B 변경
    if (category === "fb") {
      if (changeType === "headcount_increase") {
        const headcountIncrease = Number(changeData.headcount_increase) || 0;
        const perPersonCost = 50000; // 인당 5만원 가정
        const additionalCost = headcountIncrease * perPersonCost;

        impacts.push({
          domain: "FIN",
          impact_type: "fb_cost_increase",
          severity: additionalCost > (this.context.finance?.budget.remaining || 0) * 0.05 ? "high" : "medium",
          description: `F&B 인원 ${headcountIncrease}명 증가로 비용 ${(additionalCost / 1000000).toFixed(1)}M 증가`,
          metrics_affected: [
            {
              metric: "fb_budget",
              before: 0,
              after: additionalCost,
              change_percent: (additionalCost / (this.context.finance?.budget.total || 1)) * 100,
            },
          ],
          recommended_actions: [
            "케이터링 업체 재협상",
            "메뉴 조정",
            "예산 재배분",
          ],
        });
      }
    }

    // 장비 변경
    if (category === "equipment") {
      if (changeType === "add" || changeType === "upgrade") {
        impacts.push({
          domain: "FIN",
          impact_type: "equipment_cost",
          severity: costChange > (this.context.finance?.budget.remaining || 0) * 0.05 ? "high" : "medium",
          description: `장비 ${changeType === "add" ? "추가" : "업그레이드"}로 ${(costChange / 1000000).toFixed(1)}M 비용 발생`,
          metrics_affected: [
            {
              metric: "equipment_budget",
              before: 0,
              after: costChange,
              change_percent: (costChange / (this.context.finance?.budget.total || 1)) * 100,
            },
          ],
          recommended_actions: [
            "장비 렌탈 옵션 검토",
            "벤더 할인 협상",
            "우선순위 장비 선별",
          ],
        });

        impacts.push({
          domain: "PRJ",
          impact_type: "setup_timeline",
          severity: "medium",
          description: `장비 변경으로 셋업 일정 재조정 필요`,
          metrics_affected: [
            {
              metric: "setup_tasks",
              before: 0,
              after: 5,
              change_percent: 100,
            },
          ],
          recommended_actions: [
            "테크니컬 리허설 일정 확인",
            "추가 셋업 시간 확보",
          ],
        });
      }
    }

    return impacts;
  }

  // ============= HR DOMAIN IMPACT METHODS =============

  /**
   * HR 스태핑 변경 → 프로젝트/운영/예산 영향 분석
   */
  onHRStaffingChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const changeType = String(changeData.change_type || "reduction"); // addition, reduction
    const quantity = Number(changeData.quantity) || 1;
    const role = String(changeData.role || "general");

    if (changeType === "reduction") {
      // 인력 감소 → 운영 영향
      impacts.push({
        domain: "OPS",
        impact_type: "operational_capacity",
        severity: quantity > 5 ? "high" : "medium",
        description: `${role} 역할 ${quantity}명 감소로 운영 역량 저하`,
        metrics_affected: [
          {
            metric: "staffing_level",
            before: 100,
            after: 100 - (quantity * 10),
            change_percent: -(quantity * 10),
          },
        ],
        recommended_actions: [
          "역할 재배분",
          "긴급 대체 인력 확보",
          "업무 우선순위 조정",
        ],
      });

      // 프로젝트 일정 영향
      if (quantity > 3) {
        impacts.push({
          domain: "PRJ",
          impact_type: "schedule_risk",
          severity: quantity > 5 ? "high" : "medium",
          description: `인력 부족으로 일정 지연 위험`,
          metrics_affected: [
            {
              metric: "schedule_risk_score",
              before: 0.2,
              after: Math.min(0.8, 0.2 + quantity * 0.1),
              change_percent: quantity * 50,
            },
          ],
          recommended_actions: [
            "크리티컬 태스크 재배정",
            "일정 버퍼 활용",
            "범위 조정 검토",
          ],
        });
      }
    } else if (changeType === "addition") {
      // 인력 추가 → 예산 영향
      const hourlyRate = Number(changeData.hourly_rate) || 15000;
      const hours = Number(changeData.hours) || 40;
      const additionalCost = quantity * hourlyRate * hours;

      impacts.push({
        domain: "FIN",
        impact_type: "labor_cost_increase",
        severity: additionalCost > (this.context.finance?.budget.remaining || 0) * 0.05 ? "high" : "medium",
        description: `${quantity}명 추가 채용으로 ${(additionalCost / 1000000).toFixed(1)}M 노동비용 증가`,
        metrics_affected: [
          {
            metric: "labor_budget",
            before: this.context.hr?.labor_costs.spent || 0,
            after: (this.context.hr?.labor_costs.spent || 0) + additionalCost,
            change_percent: (additionalCost / (this.context.hr?.labor_costs.budget || 1)) * 100,
          },
        ],
        recommended_actions: [
          "예산 재배분 협의",
          "계약 조건 최적화",
          "파트타임 활용 검토",
        ],
      });
    }

    return impacts;
  }

  /**
   * 노동비용 변경 → 예산/전략 영향 분석
   */
  onLaborCostChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const changeAmount = Number(changeData.change_amount) || 0;
    const reason = String(changeData.reason || "비용 조정");

    if (changeAmount > 0) {
      // 비용 증가 → 예산 영향
      const impactPercent = (changeAmount / (this.context.finance?.budget.total || 1)) * 100;

      impacts.push({
        domain: "FIN",
        impact_type: "budget_pressure",
        severity: impactPercent > 5 ? "high" : "medium",
        description: `노동비용 ${(changeAmount / 1000000).toFixed(1)}M 증가 (${reason})`,
        metrics_affected: [
          {
            metric: "remaining_budget",
            before: this.context.finance?.budget.remaining || 0,
            after: (this.context.finance?.budget.remaining || 0) - changeAmount,
            change_percent: -(changeAmount / (this.context.finance?.budget.remaining || 1)) * 100,
          },
        ],
        recommended_actions: [
          "다른 항목 예산 절감",
          "효율화 방안 검토",
          "스폰서십 추가 확보",
        ],
      });

      // 전략 목표 영향
      if (impactPercent > 10) {
        impacts.push({
          domain: "STR",
          impact_type: "goal_risk",
          severity: "high",
          description: `노동비용 초과로 전략 목표 달성 위험`,
          metrics_affected: [
            {
              metric: "goal_achievement_probability",
              before: 0.85,
              after: 0.85 - Math.min(0.2, impactPercent * 0.01),
              change_percent: -impactPercent,
            },
          ],
          recommended_actions: [
            "목표 우선순위 재검토",
            "대안 전략 수립",
            "이해관계자 사전 협의",
          ],
        });
      }
    }

    return impacts;
  }

  /**
   * 교육 변경 → 운영/리스크 영향 분석
   */
  onTrainingChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const changeType = String(changeData.change_type || "cancel"); // add, cancel, delay
    const affectedStaff = Number(changeData.affected_staff) || 0;
    const programName = String(changeData.program_name || "교육 프로그램");

    if (changeType === "cancel" || changeType === "delay") {
      impacts.push({
        domain: "OPS",
        impact_type: "operational_readiness",
        severity: affectedStaff > 10 ? "high" : "medium",
        description: `${programName} ${changeType === "cancel" ? "취소" : "지연"}으로 ${affectedStaff}명 교육 미이수`,
        metrics_affected: [
          {
            metric: "training_completion_rate",
            before: this.context.hr?.training.completion_rate || 100,
            after: Math.max(0, (this.context.hr?.training.completion_rate || 100) - (affectedStaff * 5)),
            change_percent: -(affectedStaff * 5),
          },
        ],
        recommended_actions: [
          "대체 교육 일정 편성",
          "온라인 교육 자료 배포",
          "현장 OJT로 대체",
        ],
      });

      // 리스크 영향
      impacts.push({
        domain: "STR",
        impact_type: "quality_risk",
        severity: affectedStaff > 20 ? "high" : "medium",
        description: `교육 미이수 스태프로 인한 서비스 품질 위험`,
        metrics_affected: [
          {
            metric: "quality_risk_score",
            before: 0.2,
            after: Math.min(0.7, 0.2 + affectedStaff * 0.02),
            change_percent: affectedStaff * 10,
          },
        ],
        recommended_actions: [
          "리스크 레지스터 업데이트",
          "품질 모니터링 강화",
          "수퍼바이저 배치 강화",
        ],
      });
    }

    return impacts;
  }

  /**
   * 봉사자 변경 → 운영/마케팅 영향 분석
   */
  onVolunteerChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const changeType = String(changeData.change_type || "reduction"); // addition, reduction, no_show
    const quantity = Number(changeData.quantity) || 1;

    if (changeType === "reduction" || changeType === "no_show") {
      impacts.push({
        domain: "OPS",
        impact_type: "volunteer_gap",
        severity: quantity > 10 ? "high" : "medium",
        description: `봉사자 ${quantity}명 ${changeType === "no_show" ? "미출석" : "감소"}으로 운영 공백`,
        metrics_affected: [
          {
            metric: "volunteer_coverage",
            before: 100,
            after: Math.max(0, 100 - (quantity * 10)),
            change_percent: -(quantity * 10),
          },
        ],
        recommended_actions: [
          "유급 스태프 긴급 배치",
          "역할 통합/재배분",
          "업무 범위 조정",
        ],
      });

      // 마케팅 영향 (커뮤니티 이미지)
      if (changeType === "reduction" && quantity > 5) {
        impacts.push({
          domain: "MKT",
          impact_type: "community_engagement",
          severity: "medium",
          description: `봉사자 이탈로 커뮤니티 참여도 저하 우려`,
          metrics_affected: [
            {
              metric: "volunteer_satisfaction",
              before: 4.0,
              after: 3.5,
              change_percent: -12.5,
            },
          ],
          recommended_actions: [
            "봉사자 피드백 수집",
            "인센티브 프로그램 강화",
            "소통 채널 개선",
          ],
        });
      }
    }

    return impacts;
  }

  // =============================================================================
  // MEETINGS & CONTENTS DOMAIN IMPACT ANALYSIS
  // =============================================================================

  /**
   * 연사 변경 → 예산/마케팅/전략 영향 분석
   */
  onSpeakerChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const changeType = String(changeData.change_type || "cancellation"); // confirmation, cancellation, honorarium_change
    const speakerTier = String(changeData.speaker_tier || "regular"); // keynote, featured, regular
    const honorariumChange = Number(changeData.honorarium_change) || 0;

    if (changeType === "cancellation") {
      // 전략 영향 (프로그램 품질)
      const severity = speakerTier === "keynote" ? "critical" : speakerTier === "featured" ? "high" : "medium";
      impacts.push({
        domain: "STR",
        impact_type: "program_quality",
        severity,
        description: `${speakerTier} 연사 취소로 프로그램 품질 영향`,
        metrics_affected: [
          {
            metric: "speaker_coverage",
            before: 100,
            after: speakerTier === "keynote" ? 70 : speakerTier === "featured" ? 85 : 95,
            change_percent: speakerTier === "keynote" ? -30 : speakerTier === "featured" ? -15 : -5,
          },
        ],
        recommended_actions: [
          "대체 연사 긴급 섭외",
          "세션 형식 변경 검토",
          speakerTier === "keynote" ? "마케팅 메시지 조정" : "프로그램 재배치",
        ],
      });

      // 마케팅 영향 (프로모션)
      if (speakerTier === "keynote" || speakerTier === "featured") {
        impacts.push({
          domain: "MKT",
          impact_type: "promotion_adjustment",
          severity: speakerTier === "keynote" ? "high" : "medium",
          description: `주요 연사 취소로 프로모션 콘텐츠 수정 필요`,
          metrics_affected: [
            {
              metric: "headline_speaker_count",
              before: 5,
              after: 4,
              change_percent: -20,
            },
          ],
          recommended_actions: [
            "프로모션 자료 업데이트",
            "웹사이트/앱 연사 목록 수정",
            "대체 연사 홍보 시작",
          ],
        });
      }
    } else if (changeType === "honorarium_change" && honorariumChange > 0) {
      // 예산 영향
      const budgetImpact = this.context.finance
        ? (honorariumChange / this.context.finance.budget.total) * 100
        : 0;
      impacts.push({
        domain: "FIN",
        impact_type: "budget_increase",
        severity: budgetImpact > 5 ? "high" : budgetImpact > 2 ? "medium" : "low",
        description: `연사 사례비 ${honorariumChange.toLocaleString()}원 추가 발생`,
        metrics_affected: [
          {
            metric: "speaker_budget",
            before: this.context.meetings?.speakers.honorarium_budget || 0,
            after: (this.context.meetings?.speakers.honorarium_budget || 0) + honorariumChange,
            change_percent: budgetImpact,
          },
        ],
        recommended_actions: [
          "예산 재배분 검토",
          "다른 연사 조건 재협상",
          "스폰서십 추가 확보",
        ],
      });
    }

    return impacts;
  }

  /**
   * 세션 변경 → 운영/전략/마케팅 영향 분석
   */
  onSessionChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const changeType = String(changeData.change_type || "time_change"); // add, cancel, time_change, room_change
    const sessionType = String(changeData.session_type || "breakout"); // keynote, plenary, breakout, workshop, panel
    const affectedAttendees = Number(changeData.expected_attendees) || 50;

    if (changeType === "cancel") {
      // 운영 영향
      impacts.push({
        domain: "OPS",
        impact_type: "schedule_adjustment",
        severity: sessionType === "keynote" || sessionType === "plenary" ? "critical" : "medium",
        description: `${sessionType} 세션 취소로 일정 조정 필요`,
        metrics_affected: [
          {
            metric: "session_count",
            before: this.context.meetings?.program.total_sessions || 50,
            after: (this.context.meetings?.program.total_sessions || 50) - 1,
            change_percent: -2,
          },
        ],
        recommended_actions: [
          "대체 세션 편성",
          "시간대 재배치",
          "참석자 안내 발송",
        ],
      });

      // 마케팅 영향 (대규모 세션인 경우)
      if (affectedAttendees > 100) {
        impacts.push({
          domain: "MKT",
          impact_type: "attendee_communication",
          severity: "high",
          description: `${affectedAttendees}명 이상 참석 예정 세션 취소 안내 필요`,
          metrics_affected: [
            {
              metric: "affected_attendees",
              before: 0,
              after: affectedAttendees,
              change_percent: 0,
            },
          ],
          recommended_actions: [
            "참석자 개별 안내",
            "대체 프로그램 안내",
            "불만 대응 준비",
          ],
        });
      }
    } else if (changeType === "time_change" || changeType === "room_change") {
      impacts.push({
        domain: "OPS",
        impact_type: "logistics_adjustment",
        severity: sessionType === "keynote" ? "high" : "medium",
        description: `${sessionType} 세션 ${changeType === "time_change" ? "시간" : "장소"} 변경`,
        metrics_affected: [
          {
            metric: "schedule_changes",
            before: 0,
            after: 1,
            change_percent: 0,
          },
        ],
        recommended_actions: [
          "일정표 업데이트",
          "참석자 안내",
          "현장 안내 사인물 조정",
        ],
      });
    }

    return impacts;
  }

  /**
   * 콘텐츠 변경 → 운영/전략 영향 분석
   */
  onContentChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const changeType = String(changeData.change_type || "delay"); // submission, delay, withdrawal
    const contentType = String(changeData.content_type || "presentation"); // presentation, abstract, paper
    const quantity = Number(changeData.quantity) || 1;

    if (changeType === "delay" || changeType === "withdrawal") {
      // 운영 영향 (콘텐츠 준비)
      impacts.push({
        domain: "OPS",
        impact_type: "content_preparation",
        severity: quantity > 5 ? "high" : "medium",
        description: `${quantity}개 ${contentType} ${changeType === "delay" ? "제출 지연" : "철회"}`,
        metrics_affected: [
          {
            metric: "content_readiness",
            before: 100,
            after: Math.max(0, 100 - (quantity * 5)),
            change_percent: -(quantity * 5),
          },
        ],
        recommended_actions: [
          changeType === "delay" ? "제출 독촉" : "대체 콘텐츠 확보",
          "프로그램 조정 검토",
          "연사 지원 강화",
        ],
      });

      // 전략 영향 (프로그램 품질)
      if (quantity > 3) {
        impacts.push({
          domain: "STR",
          impact_type: "program_integrity",
          severity: "medium",
          description: `다수 콘텐츠 이슈로 프로그램 완성도 영향`,
          metrics_affected: [
            {
              metric: "program_completeness",
              before: 100,
              after: 90,
              change_percent: -10,
            },
          ],
          recommended_actions: [
            "콘텐츠 품질 관리 강화",
            "백업 콘텐츠 준비",
            "연사 커뮤니케이션 개선",
          ],
        });
      }
    }

    return impacts;
  }

  /**
   * 프로그램 변경 → 전략/마케팅/운영 영향 분석
   */
  onProgramChange(changeData: Record<string, unknown>): ImpactResult[] {
    const impacts: ImpactResult[] = [];
    const changeType = String(changeData.change_type || "structure"); // structure, scale, theme, format
    const changeScope = String(changeData.scope || "minor"); // major, moderate, minor

    if (changeScope === "major") {
      // 전략 영향
      impacts.push({
        domain: "STR",
        impact_type: "program_strategy",
        severity: "critical",
        description: `주요 프로그램 변경으로 전략 조정 필요`,
        metrics_affected: [
          {
            metric: "program_alignment",
            before: 100,
            after: 70,
            change_percent: -30,
          },
        ],
        recommended_actions: [
          "이해관계자 협의",
          "목표 재정렬",
          "KPI 조정 검토",
        ],
      });

      // 마케팅 영향
      impacts.push({
        domain: "MKT",
        impact_type: "messaging_update",
        severity: "high",
        description: `프로그램 변경에 따른 마케팅 메시지 전면 수정 필요`,
        metrics_affected: [
          {
            metric: "marketing_materials_validity",
            before: 100,
            after: 40,
            change_percent: -60,
          },
        ],
        recommended_actions: [
          "웹사이트/앱 업데이트",
          "프로모션 자료 재제작",
          "참석자 공지 발송",
        ],
      });

      // 운영 영향
      impacts.push({
        domain: "OPS",
        impact_type: "logistics_overhaul",
        severity: "high",
        description: `프로그램 변경에 따른 운영 계획 전면 수정`,
        metrics_affected: [
          {
            metric: "operational_plans_validity",
            before: 100,
            after: 50,
            change_percent: -50,
          },
        ],
        recommended_actions: [
          "베뉴 레이아웃 재검토",
          "스태프 배치 재조정",
          "벤더 계약 조정 협의",
        ],
      });
    } else if (changeScope === "moderate") {
      impacts.push({
        domain: "OPS",
        impact_type: "logistics_adjustment",
        severity: "medium",
        description: `프로그램 조정으로 운영 계획 일부 수정`,
        metrics_affected: [
          {
            metric: "operational_readiness",
            before: 100,
            after: 85,
            change_percent: -15,
          },
        ],
        recommended_actions: [
          "영향 받는 세션 목록 확인",
          "스태프 배치 조정",
          "안내 자료 업데이트",
        ],
      });
    }

    return impacts;
  }
}

// =============================================================================
// RAG KNOWLEDGE RETRIEVER CLASS
// =============================================================================

export class RAGKnowledgeRetriever {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * 태스크에 관련된 지식 베이스 항목 조회
   */
  async getRelevantKnowledge(taskId: string, query?: string): Promise<KnowledgeResult> {
    try {
      const domain = this.getDomainFromTaskId(taskId);
      const results: KnowledgeItem[] = [];

      // 1. 태스크 관련 지식 베이스 조회
      const kbResult = await this.db
        .prepare(
          `SELECT id, title, content, summary, source, keywords, priority
           FROM standard_knowledge_base
           WHERE (domain = ? OR domain = 'general')
             AND status = 'active'
             AND (related_tasks LIKE ? OR related_tasks IS NULL)
           ORDER BY priority DESC
           LIMIT 5`
        )
        .bind(domain, `%${taskId}%`)
        .all();

      for (const row of kbResult.results || []) {
        const r = row as Record<string, unknown>;
        results.push({
          type: "knowledge",
          id: String(r.id || ""),
          title: String(r.title || ""),
          content: String(r.summary || r.content || ""),
          source: String(r.source || ""),
          relevance: Number(r.priority || 5) / 10,
        });
      }

      // 2. CMP-IS 가이드라인 조회
      const skillNumber = this.getSkillNumber(taskId);
      if (skillNumber) {
        const cmpResult = await this.db
          .prepare(
            `SELECT id, title, description, best_practices, importance
             FROM cmpis_guidelines
             WHERE skill_number = ? OR related_agents LIKE ?
             LIMIT 3`
          )
          .bind(skillNumber, `%${taskId}%`)
          .all();

        for (const row of cmpResult.results || []) {
          const r = row as Record<string, unknown>;
          const bestPractices = this.safeJsonParse(String(r.best_practices || "[]"));
          results.push({
            type: "guideline",
            id: String(r.id || ""),
            title: `[CMP-IS] ${String(r.title || "")}`,
            content: String(r.description || ""),
            bestPractices: Array.isArray(bestPractices) ? bestPractices : [],
            relevance: r.importance === "critical" ? 1.0 : r.importance === "high" ? 0.8 : 0.6,
          });
        }
      }

      // 3. 용어 사전 조회 (쿼리가 있는 경우)
      if (query) {
        const terms = await this.findRelevantTerms(query, domain);
        for (const term of terms) {
          results.push({
            type: "terminology",
            id: term.id,
            title: `[용어] ${term.term}`,
            content: term.definition,
            relevance: 0.7,
          });
        }
      }

      // 4. FAQ 조회
      const faqResult = await this.db
        .prepare(
          `SELECT id, question, answer
           FROM faq_knowledge
           WHERE domain = ? AND status = 'active'
           ORDER BY frequency DESC
           LIMIT 2`
        )
        .bind(domain)
        .all();

      for (const row of faqResult.results || []) {
        const r = row as Record<string, unknown>;
        results.push({
          type: "faq",
          id: String(r.id || ""),
          title: String(r.question || ""),
          content: String(r.answer || ""),
          relevance: 0.5,
        });
      }

      // 관련성 순으로 정렬
      results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));

      return {
        taskId,
        domain,
        items: results.slice(0, 10),
        totalFound: results.length,
        retrievedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Knowledge retrieval failed:", error);
      return {
        taskId,
        domain: this.getDomainFromTaskId(taskId),
        items: [],
        totalFound: 0,
        retrievedAt: new Date().toISOString(),
        error: String(error),
      };
    }
  }

  /**
   * 관련 용어 검색
   */
  private async findRelevantTerms(
    query: string,
    domain: string
  ): Promise<Array<{ id: string; term: string; definition: string }>> {
    try {
      // 쿼리에서 키워드 추출 (간단한 토큰화)
      const keywords = query
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 2);

      if (keywords.length === 0) return [];

      // 용어 검색
      const result = await this.db
        .prepare(
          `SELECT id, term, definition
           FROM terminology_dictionary
           WHERE (domain = ? OR domain = 'general')
             AND (${keywords.map(() => "term LIKE ? OR definition LIKE ?").join(" OR ")})
           LIMIT 3`
        )
        .bind(domain, ...keywords.flatMap((k) => [`%${k}%`, `%${k}%`]))
        .all();

      return (result.results || []).map((r) => {
        const row = r as Record<string, unknown>;
        return {
          id: String(row.id || ""),
          term: String(row.term || ""),
          definition: String(row.definition || ""),
        };
      });
    } catch {
      return [];
    }
  }

  /**
   * 템플릿 조회
   */
  async getTemplate(taskId: string): Promise<TemplateResult | null> {
    try {
      const result = await this.db
        .prepare(
          `SELECT id, name, description, template_structure, sample_content, instructions
           FROM template_library
           WHERE applicable_tasks LIKE ?
           ORDER BY usage_count DESC
           LIMIT 1`
        )
        .bind(`%${taskId}%`)
        .first();

      if (!result) return null;

      const r = result as Record<string, unknown>;
      const parsed = this.safeJsonParse(String(r.template_structure || "{}"));
      return {
        id: String(r.id || ""),
        name: String(r.name || ""),
        description: String(r.description || ""),
        structure: (parsed && typeof parsed === "object" ? parsed : {}) as Record<string, unknown>,
        sampleContent: String(r.sample_content || ""),
        instructions: String(r.instructions || ""),
      };
    } catch {
      return null;
    }
  }

  /**
   * 지식 사용 통계 업데이트
   */
  async recordKnowledgeUsage(knowledgeId: string): Promise<void> {
    try {
      await this.db
        .prepare(
          `UPDATE standard_knowledge_base
           SET usage_count = usage_count + 1, last_used_at = datetime('now')
           WHERE id = ?`
        )
        .bind(knowledgeId)
        .run();
    } catch {
      // 실패해도 무시
    }
  }

  /**
   * 에이전트 응답에 지식 컨텍스트 추가
   */
  async enrichAgentContext(
    taskId: string,
    baseContext: Record<string, unknown>,
    query?: string
  ): Promise<EnrichedContext> {
    const knowledge = await this.getRelevantKnowledge(taskId, query);
    const template = await this.getTemplate(taskId);

    // 가장 관련성 높은 지식 요약
    const topKnowledge = knowledge.items.slice(0, 3);
    const knowledgeSummary = topKnowledge
      .map((k) => `• ${k.title}: ${k.content.substring(0, 150)}...`)
      .join("\n");

    // 베스트 프랙티스 추출
    const bestPractices: string[] = [];
    for (const item of topKnowledge) {
      if (item.bestPractices) {
        bestPractices.push(...item.bestPractices);
      }
    }

    return {
      ...baseContext,
      _knowledge: {
        summary: knowledgeSummary,
        items: topKnowledge,
        bestPractices: [...new Set(bestPractices)].slice(0, 5),
        template: template || undefined,
      },
      _retrievedAt: new Date().toISOString(),
    };
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  /**
   * TaskId에서 도메인 추출
   */
  private getDomainFromTaskId(taskId: string): string {
    const prefix = taskId.substring(0, 3).toUpperCase();
    const prefixToDomain: Record<string, string> = {
      FIN: "finance",
      STR: "strategy",
      PRJ: "project",
      MKT: "marketing",
      OPS: "operations",
      "HR-": "hr",
    };
    return prefixToDomain[prefix] || "general";
  }

  /**
   * TaskId에서 CMP-IS Skill 번호 추출
   */
  private getSkillNumber(taskId: string): number | null {
    const prefix = taskId.substring(0, 3).toUpperCase();
    const num = parseInt(taskId.substring(4)) || 0;

    // CMP-IS Skill 매핑
    const skillMapping: Record<string, (n: number) => number | null> = {
      STR: (n) => (n <= 13 ? 1 : n <= 26 ? 2 : n <= 40 ? 3 : n <= 54 ? 4 : null),
      PRJ: (n) => (n <= 13 ? 5 : 6),
      MKT: (n) => (n <= 15 ? 7 : 8),
      FIN: (n) => (n <= 30 ? 7 : n <= 57 ? 8 : 9),
      OPS: (n) => (n <= 15 ? 9 : 10),
      "HR-": (n) => (n <= 15 ? 11 : 12),
    };

    const mapper = skillMapping[prefix];
    return mapper ? mapper(num) : null;
  }

  /**
   * 안전한 JSON 파싱
   */
  private safeJsonParse(str: string): unknown {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }
}

// =============================================================================
// RAG TYPES
// =============================================================================

export interface KnowledgeItem {
  type: "knowledge" | "guideline" | "terminology" | "faq";
  id: string;
  title: string;
  content: string;
  source?: string;
  bestPractices?: string[];
  relevance?: number;
}

export interface KnowledgeResult {
  taskId: string;
  domain: string;
  items: KnowledgeItem[];
  totalFound: number;
  retrievedAt: string;
  error?: string;
}

export interface TemplateResult {
  id: string;
  name: string;
  description: string;
  structure: Record<string, unknown>;
  sampleContent: string;
  instructions: string;
}

export interface EnrichedContext extends Record<string, unknown> {
  _knowledge?: {
    summary: string;
    items: KnowledgeItem[];
    bestPractices: string[];
    template?: TemplateResult;
  };
  _retrievedAt?: string;
}

// =============================================================================
// FACTORY FUNCTION
// =============================================================================

export function createContextBridge(kv: KVNamespace, db: D1Database): ContextBridge {
  return new ContextBridge(kv, db);
}

export default ContextBridge;
