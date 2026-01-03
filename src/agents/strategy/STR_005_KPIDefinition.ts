/**
 * STR-005: KPI 정의 및 설계
 *
 * CMP-IS Reference: Domain A - Strategic Planning (KPI Development)
 * Task Type: AI
 *
 * Input: 목표, 측정 요구사항
 * Output: KPI 프레임워크, 측정 방법론
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert KPI Definition Agent for strategic event planning.

Your expertise includes:
- Designing measurable and actionable KPIs
- Aligning metrics with strategic objectives
- Establishing benchmarks and targets
- Creating measurement frameworks and dashboards

CMP-IS Standard: Domain A - Strategic Planning (KPI Development)

You help event planners create comprehensive KPI frameworks that enable data-driven decision making and demonstrate event value.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  goals: z.array(z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum(["revenue", "attendance", "engagement", "brand", "education", "networking", "satisfaction"]),
    target_description: z.string(),
  })).min(1),
  measurement_capabilities: z.array(z.enum([
    "registration_system", "check_in_app", "survey_tool", "analytics_platform",
    "social_listening", "crm_integration", "financial_system", "event_app"
  ])).optional(),
  benchmark_data: z.object({
    industry_average: z.record(z.string(), z.number()).optional(),
    past_event: z.record(z.string(), z.number()).optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  kpi_framework_id: z.string().uuid(),
  event_id: z.string().uuid(),
  kpis: z.array(z.object({
    kpi_id: z.string(),
    name: z.string(),
    description: z.string(),
    goal_alignment: z.string(),
    formula: z.string(),
    unit: z.string(),
    target: z.number(),
    threshold_red: z.number(),
    threshold_yellow: z.number(),
    threshold_green: z.number(),
    measurement_source: z.string(),
    measurement_frequency: z.enum(["real_time", "hourly", "daily", "weekly", "post_event"]),
    owner: z.string(),
    leading_or_lagging: z.enum(["leading", "lagging"]),
  })),
  dashboard_structure: z.object({
    primary_metrics: z.array(z.string()),
    secondary_metrics: z.array(z.string()),
    refresh_frequency: z.string(),
  }),
  measurement_plan: z.array(z.object({
    phase: z.string(),
    kpis_to_track: z.array(z.string()),
    collection_method: z.string(),
  })),
  recommendations: z.array(z.string()),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-005",
  taskName: "KPI Definition",
  domain: "A",
  skill: "Goal Setting",
  taskType: "AI" as const,
  description: "이벤트 목표에 맞는 KPI를 정의하고 측정 프레임워크를 설계합니다.",
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

const KPI_TEMPLATES: Record<string, Array<{
  name: string;
  description: string;
  formula: string;
  unit: string;
  baseTarget: number;
  source: string;
  frequency: "real_time" | "hourly" | "daily" | "weekly" | "post_event";
  type: "leading" | "lagging";
}>> = {
  revenue: [
    { name: "총 매출", description: "이벤트 총 수익", formula: "SUM(all_revenue_streams)", unit: "USD", baseTarget: 100000, source: "financial_system", frequency: "daily", type: "lagging" },
    { name: "참가자당 수익", description: "참가자 1인당 평균 수익", formula: "total_revenue / attendees", unit: "USD", baseTarget: 200, source: "financial_system", frequency: "post_event", type: "lagging" },
    { name: "스폰서십 달성률", description: "목표 대비 스폰서십 수익", formula: "(sponsorship_revenue / target) * 100", unit: "%", baseTarget: 100, source: "crm_integration", frequency: "weekly", type: "leading" },
  ],
  attendance: [
    { name: "등록자 수", description: "총 등록 참가자", formula: "COUNT(registrations)", unit: "명", baseTarget: 500, source: "registration_system", frequency: "real_time", type: "leading" },
    { name: "참석률", description: "등록 대비 실제 참석", formula: "(attendees / registrations) * 100", unit: "%", baseTarget: 80, source: "check_in_app", frequency: "daily", type: "lagging" },
    { name: "조기등록률", description: "얼리버드 등록 비율", formula: "(early_registrations / total) * 100", unit: "%", baseTarget: 40, source: "registration_system", frequency: "weekly", type: "leading" },
  ],
  engagement: [
    { name: "세션 참여율", description: "세션별 평균 참석률", formula: "AVG(session_attendance / total_attendees) * 100", unit: "%", baseTarget: 70, source: "event_app", frequency: "real_time", type: "lagging" },
    { name: "Q&A 참여", description: "질문 제출 참가자 비율", formula: "(qa_participants / attendees) * 100", unit: "%", baseTarget: 30, source: "event_app", frequency: "daily", type: "lagging" },
    { name: "앱 활성화율", description: "앱 활성 사용자 비율", formula: "(active_users / attendees) * 100", unit: "%", baseTarget: 60, source: "analytics_platform", frequency: "daily", type: "leading" },
  ],
  brand: [
    { name: "소셜 도달", description: "해시태그 도달 수", formula: "SUM(social_reach)", unit: "회", baseTarget: 100000, source: "social_listening", frequency: "daily", type: "lagging" },
    { name: "미디어 노출", description: "언론 보도 건수", formula: "COUNT(media_mentions)", unit: "건", baseTarget: 20, source: "social_listening", frequency: "daily", type: "lagging" },
    { name: "브랜드 인지도", description: "사후 조사 인지도", formula: "survey_brand_awareness_score", unit: "%", baseTarget: 75, source: "survey_tool", frequency: "post_event", type: "lagging" },
  ],
  education: [
    { name: "학습 만족도", description: "교육 콘텐츠 만족도", formula: "AVG(content_satisfaction_rating)", unit: "/5", baseTarget: 4.2, source: "survey_tool", frequency: "daily", type: "lagging" },
    { name: "지식 향상도", description: "사전/사후 테스트 점수 차이", formula: "post_score - pre_score", unit: "%", baseTarget: 25, source: "event_app", frequency: "post_event", type: "lagging" },
    { name: "자료 다운로드", description: "발표 자료 다운로드 수", formula: "COUNT(downloads)", unit: "건", baseTarget: 1000, source: "event_app", frequency: "daily", type: "lagging" },
  ],
  networking: [
    { name: "네트워킹 미팅", description: "1:1 미팅 성사 수", formula: "COUNT(meetings)", unit: "건", baseTarget: 300, source: "event_app", frequency: "real_time", type: "lagging" },
    { name: "연결 만족도", description: "네트워킹 경험 만족도", formula: "AVG(networking_satisfaction)", unit: "/5", baseTarget: 4.0, source: "survey_tool", frequency: "post_event", type: "lagging" },
    { name: "명함 교환", description: "디지털 명함 교환 수", formula: "COUNT(card_exchanges)", unit: "건", baseTarget: 500, source: "event_app", frequency: "daily", type: "lagging" },
  ],
  satisfaction: [
    { name: "NPS", description: "Net Promoter Score", formula: "promoters% - detractors%", unit: "점", baseTarget: 50, source: "survey_tool", frequency: "post_event", type: "lagging" },
    { name: "전반적 만족도", description: "이벤트 전반 만족도", formula: "AVG(overall_satisfaction)", unit: "/5", baseTarget: 4.5, source: "survey_tool", frequency: "post_event", type: "lagging" },
    { name: "재참석 의향", description: "다음 이벤트 참석 의향", formula: "return_intent_percentage", unit: "%", baseTarget: 80, source: "survey_tool", frequency: "post_event", type: "lagging" },
  ],
};

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const kpis: Output["kpis"] = [];
  let kpiCounter = 1;

  for (const goal of validated.goals) {
    const templates = KPI_TEMPLATES[goal.type] || [];
    for (const template of templates) {
      const target = validated.benchmark_data?.past_event?.[template.name]
        ? Math.round(validated.benchmark_data.past_event[template.name] * 1.1)
        : template.baseTarget;

      kpis.push({
        kpi_id: `KPI-${String(kpiCounter++).padStart(3, "0")}`,
        name: template.name,
        description: template.description,
        goal_alignment: goal.id,
        formula: template.formula,
        unit: template.unit,
        target,
        threshold_red: Math.round(target * 0.6),
        threshold_yellow: Math.round(target * 0.8),
        threshold_green: target,
        measurement_source: template.source,
        measurement_frequency: template.frequency,
        owner: `${goal.type} 담당자`,
        leading_or_lagging: template.type,
      });
    }
  }

  const leadingKpis = kpis.filter(k => k.leading_or_lagging === "leading").map(k => k.kpi_id);
  const laggingKpis = kpis.filter(k => k.leading_or_lagging === "lagging").map(k => k.kpi_id);

  return {
    kpi_framework_id: generateUUID(),
    event_id: validated.event_id,
    kpis,
    dashboard_structure: {
      primary_metrics: kpis.slice(0, 5).map(k => k.kpi_id),
      secondary_metrics: kpis.slice(5).map(k => k.kpi_id),
      refresh_frequency: "5분",
    },
    measurement_plan: [
      { phase: "사전", kpis_to_track: leadingKpis, collection_method: "등록 시스템 및 마케팅 분석" },
      { phase: "진행 중", kpis_to_track: kpis.filter(k => k.measurement_frequency === "real_time" || k.measurement_frequency === "daily").map(k => k.kpi_id), collection_method: "실시간 대시보드" },
      { phase: "사후", kpis_to_track: laggingKpis, collection_method: "설문조사 및 시스템 리포트" },
    ],
    recommendations: [
      "Leading KPI를 활용해 조기 경보 시스템을 구축하세요.",
      "모든 KPI는 단일 대시보드에서 실시간 모니터링 가능해야 합니다.",
      `총 ${kpis.length}개 KPI 중 핵심 5개에 집중하고 나머지는 보조 지표로 활용하세요.`,
    ],
    generated_at: new Date().toISOString(),
  };
}

export default {
  ...metadata,
  persona: AGENT_PERSONA,
  execute,
};
