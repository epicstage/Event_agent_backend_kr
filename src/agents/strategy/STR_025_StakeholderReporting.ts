/**
 * STR-025: 이해관계자 보고서 생성
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Stakeholder Reporting)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Stakeholder Reporting Agent.

Your expertise includes:
- Tailored report generation for different stakeholders
- Executive summary writing
- Data visualization recommendations
- Progress and status reporting

CMP-IS Standard: Domain A - Strategic Planning (Stakeholder Reporting)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  report_type: z.enum(["status", "progress", "executive_summary", "detailed", "post_event"]),
  target_stakeholder: z.object({
    name: z.string(),
    role: z.string(),
    tier: z.enum(["tier_1", "tier_2", "tier_3", "tier_4"]),
    preferences: z.object({
      detail_level: z.enum(["high", "medium", "low"]).optional(),
      focus_areas: z.array(z.string()).optional(),
      format_preference: z.enum(["narrative", "bullet_points", "visual", "data_heavy"]).optional(),
    }).optional(),
  }),
  event_data: z.object({
    overall_status: z.enum(["on_track", "at_risk", "delayed", "ahead"]),
    completion_percentage: z.number(),
    key_milestones: z.array(z.object({
      milestone: z.string(),
      status: z.enum(["completed", "in_progress", "upcoming", "delayed"]),
      due_date: z.string(),
    })),
    kpis: z.array(z.object({
      name: z.string(),
      current: z.number(),
      target: z.number(),
      unit: z.string(),
    })).optional(),
    budget: z.object({
      allocated: z.number(),
      spent: z.number(),
      forecast: z.number(),
    }).optional(),
    risks: z.array(z.object({
      risk: z.string(),
      severity: z.enum(["high", "medium", "low"]),
      mitigation: z.string(),
    })).optional(),
    highlights: z.array(z.string()).optional(),
    issues: z.array(z.string()).optional(),
  }),
  reporting_period: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string().uuid(),
  event_id: z.string().uuid(),
  report_metadata: z.object({
    title: z.string(),
    type: z.string(),
    target_stakeholder: z.string(),
    generated_at: z.string(),
    period: z.string().optional(),
  }),
  executive_summary: z.object({
    status_indicator: z.enum(["green", "yellow", "red"]),
    one_liner: z.string(),
    key_points: z.array(z.string()),
    action_required: z.array(z.string()),
  }),
  main_content: z.object({
    progress_section: z.object({
      overall_progress: z.string(),
      milestone_status: z.array(z.object({
        milestone: z.string(),
        status: z.string(),
        visual_indicator: z.string(),
      })),
    }),
    kpi_section: z.array(z.object({
      kpi_name: z.string(),
      current_value: z.string(),
      target_value: z.string(),
      variance: z.string(),
      trend: z.enum(["improving", "stable", "declining"]),
    })).optional(),
    budget_section: z.object({
      summary: z.string(),
      spent_percentage: z.number(),
      forecast_status: z.string(),
    }).optional(),
    risk_section: z.array(z.object({
      risk: z.string(),
      severity_indicator: z.string(),
      mitigation_status: z.string(),
    })).optional(),
    highlights_and_issues: z.object({
      highlights: z.array(z.string()),
      issues: z.array(z.object({
        issue: z.string(),
        impact: z.string(),
        action: z.string(),
      })),
    }),
  }),
  visual_recommendations: z.array(z.object({
    chart_type: z.string(),
    data_to_visualize: z.string(),
    purpose: z.string(),
  })),
  next_steps: z.array(z.object({
    action: z.string(),
    owner: z.string(),
    due_date: z.string(),
  })),
  appendices: z.array(z.object({
    title: z.string(),
    content_summary: z.string(),
  })).optional(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-025",
  taskName: "Stakeholder Reporting",
  domain: "A",
  skill: "Stakeholder Analysis",
  taskType: "AI" as const,
  description: "이해관계자별 맞춤형 보고서를 생성합니다.",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
};

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const { event_data, target_stakeholder, report_type, event_name } = validated;

  // Determine status indicator
  const statusIndicator = event_data.overall_status === "on_track" || event_data.overall_status === "ahead"
    ? "green" as const
    : event_data.overall_status === "at_risk"
    ? "yellow" as const
    : "red" as const;

  // Generate one-liner based on status
  const oneLiner = statusIndicator === "green"
    ? `${event_name} 프로젝트가 계획대로 순조롭게 진행 중입니다.`
    : statusIndicator === "yellow"
    ? `${event_name} 프로젝트에 주의가 필요한 사항이 있습니다.`
    : `${event_name} 프로젝트가 지연되어 긴급 조치가 필요합니다.`;

  // Key points based on tier
  const keyPoints = target_stakeholder.tier === "tier_1"
    ? [
        `전체 진행률: ${event_data.completion_percentage}%`,
        `예산 집행률: ${event_data.budget ? Math.round((event_data.budget.spent / event_data.budget.allocated) * 100) : 0}%`,
        `주요 리스크: ${event_data.risks?.filter(r => r.severity === "high").length || 0}건`,
      ]
    : [
        `전체 진행률: ${event_data.completion_percentage}%`,
        `다음 마일스톤: ${event_data.key_milestones.find(m => m.status === "upcoming")?.milestone || "해당 없음"}`,
      ];

  // Action required
  const actionRequired = event_data.issues?.slice(0, 2).map(issue => `[조치 필요] ${issue}`) || [];

  // Milestone status with visual
  const milestoneStatus = event_data.key_milestones.map(m => ({
    milestone: m.milestone,
    status: m.status,
    visual_indicator: m.status === "completed" ? "✅" : m.status === "in_progress" ? "🔄" : m.status === "delayed" ? "⚠️" : "⏳",
  }));

  // KPI section
  const kpiSection = event_data.kpis?.map(kpi => {
    const variance = ((kpi.current - kpi.target) / kpi.target) * 100;
    return {
      kpi_name: kpi.name,
      current_value: `${kpi.current}${kpi.unit}`,
      target_value: `${kpi.target}${kpi.unit}`,
      variance: `${variance >= 0 ? "+" : ""}${variance.toFixed(1)}%`,
      trend: variance > 0 ? "improving" as const : variance < -10 ? "declining" as const : "stable" as const,
    };
  });

  // Budget section
  const budgetSection = event_data.budget ? {
    summary: `총 예산 ${event_data.budget.allocated.toLocaleString()}원 중 ${event_data.budget.spent.toLocaleString()}원 집행`,
    spent_percentage: Math.round((event_data.budget.spent / event_data.budget.allocated) * 100),
    forecast_status: event_data.budget.forecast <= event_data.budget.allocated ? "예산 내 완료 예상" : "예산 초과 우려",
  } : undefined;

  // Risk section
  const riskSection = event_data.risks?.map(r => ({
    risk: r.risk,
    severity_indicator: r.severity === "high" ? "🔴" : r.severity === "medium" ? "🟡" : "🟢",
    mitigation_status: r.mitigation,
  }));

  // Visual recommendations based on report type
  const visualRecommendations = [
    { chart_type: "게이지 차트", data_to_visualize: "전체 진행률", purpose: "직관적 상태 표시" },
    { chart_type: "간트 차트", data_to_visualize: "마일스톤 일정", purpose: "일정 진행 현황" },
  ];

  if (target_stakeholder.tier === "tier_1" && event_data.budget) {
    visualRecommendations.push({ chart_type: "예산 Burndown", data_to_visualize: "예산 집행 추이", purpose: "재무 상태 파악" });
  }

  return {
    report_id: generateUUID(),
    event_id: validated.event_id,
    report_metadata: {
      title: `${event_name} ${report_type === "status" ? "상태 보고서" : report_type === "progress" ? "진행 보고서" : report_type === "executive_summary" ? "임원 요약" : "상세 보고서"}`,
      type: report_type,
      target_stakeholder: target_stakeholder.name,
      generated_at: new Date().toISOString(),
      period: validated.reporting_period ? `${validated.reporting_period.start} ~ ${validated.reporting_period.end}` : undefined,
    },
    executive_summary: {
      status_indicator: statusIndicator,
      one_liner: oneLiner,
      key_points: keyPoints,
      action_required: actionRequired,
    },
    main_content: {
      progress_section: {
        overall_progress: `${event_data.completion_percentage}% 완료`,
        milestone_status: milestoneStatus,
      },
      kpi_section: kpiSection,
      budget_section: budgetSection,
      risk_section: riskSection,
      highlights_and_issues: {
        highlights: event_data.highlights || ["특이사항 없음"],
        issues: (event_data.issues || []).map(issue => ({
          issue,
          impact: "일정/예산 영향 가능",
          action: "담당자 확인 필요",
        })),
      },
    },
    visual_recommendations: visualRecommendations,
    next_steps: [
      { action: "다음 마일스톤 완료", owner: "프로젝트팀", due_date: event_data.key_milestones.find(m => m.status === "upcoming")?.due_date || "TBD" },
      { action: "리스크 모니터링", owner: "리스크 담당", due_date: "지속" },
    ],
    appendices: report_type === "detailed" ? [
      { title: "상세 일정표", content_summary: "모든 태스크 및 마일스톤 상세" },
      { title: "예산 내역", content_summary: "항목별 예산 집행 현황" },
    ] : undefined,
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
