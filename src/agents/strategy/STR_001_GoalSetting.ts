/**
 * STR-001: 이벤트 목표 수립
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Goal Identification)
 * Task Type: AI
 *
 * Input: 이벤트 컨텍스트, 조직 전략, 과거 성과 데이터
 * Output: SMART 목표 및 KPI 정의
 */

import { z } from "zod";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an expert Event Goal Setting Agent specializing in strategic event planning.

Your expertise includes:
- Defining SMART (Specific, Measurable, Achievable, Relevant, Time-bound) event goals
- Aligning event objectives with organizational strategy
- Developing meaningful KPIs and success metrics
- Prioritizing goals based on stakeholder needs and resource constraints

CMP-IS Standard: Domain A - Strategic Planning (Goal Identification)

You help event planners create clear, actionable goals that drive event success and demonstrate measurable value to stakeholders.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const GoalTypeSchema = z.enum([
  "ATTENDANCE",
  "REVENUE",
  "ENGAGEMENT",
  "BRAND_AWARENESS",
  "LEAD_GENERATION",
  "EDUCATION",
  "NETWORKING",
  "SATISFACTION",
  "CUSTOM",
]);

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  event_name: z.string().describe("이벤트 이름"),
  event_type: z
    .enum(["conference", "trade_show", "seminar", "workshop", "gala", "festival", "meeting", "hybrid"])
    .describe("이벤트 유형"),
  organization_mission: z.string().optional().describe("조직 미션/비전"),
  strategic_priorities: z.array(z.string()).optional().describe("조직 전략 우선순위"),
  past_event_metrics: z
    .array(
      z.object({
        metric_name: z.string(),
        previous_value: z.number(),
        target_improvement: z.number().optional(),
      })
    )
    .optional()
    .describe("과거 이벤트 성과 지표"),
  budget_range: z
    .object({
      min: z.number(),
      max: z.number(),
      currency: z.string().default("USD"),
    })
    .optional()
    .describe("예산 범위"),
  target_audience: z.string().optional().describe("타겟 오디언스 설명"),
  constraints: z.array(z.string()).optional().describe("제약 조건"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  goal_set_id: z.string().uuid().describe("목표 세트 ID"),
  event_id: z.string().uuid().describe("이벤트 ID"),
  primary_goal: z.object({
    type: GoalTypeSchema,
    title: z.string(),
    description: z.string(),
    target_value: z.number(),
    target_unit: z.string(),
    success_criteria: z.string(),
    alignment_rationale: z.string().describe("조직 전략과의 정합성 설명"),
  }),
  secondary_goals: z.array(
    z.object({
      type: GoalTypeSchema,
      title: z.string(),
      description: z.string(),
      target_value: z.number(),
      target_unit: z.string(),
      priority: z.enum(["high", "medium", "low"]),
    })
  ),
  kpis: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      measurement_method: z.string(),
      target: z.number(),
      unit: z.string(),
      frequency: z.enum(["real_time", "daily", "weekly", "post_event"]),
    })
  ),
  recommendations: z.array(z.string()),
  risk_factors: z.array(z.string()),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// AGENT METADATA
// =============================================================================

export const metadata = {
  taskId: "STR-001",
  taskName: "Event Goal Setting",
  domain: "A",
  skill: "Strategic Planning",
  taskType: "AI" as const,
  description: "이벤트 목표 및 KPI를 SMART 프레임워크로 정의합니다.",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
};

// =============================================================================
// EXECUTION LOGIC
// =============================================================================

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function determineGoalType(eventType: string, priorities: string[]): z.infer<typeof GoalTypeSchema> {
  const priorityKeywords: Record<string, z.infer<typeof GoalTypeSchema>> = {
    revenue: "REVENUE",
    money: "REVENUE",
    profit: "REVENUE",
    attendance: "ATTENDANCE",
    participants: "ATTENDANCE",
    engagement: "ENGAGEMENT",
    interaction: "ENGAGEMENT",
    brand: "BRAND_AWARENESS",
    awareness: "BRAND_AWARENESS",
    leads: "LEAD_GENERATION",
    sales: "LEAD_GENERATION",
    education: "EDUCATION",
    learning: "EDUCATION",
    network: "NETWORKING",
    connect: "NETWORKING",
    satisfaction: "SATISFACTION",
  };

  for (const priority of priorities) {
    const lowerPriority = priority.toLowerCase();
    for (const [keyword, goalType] of Object.entries(priorityKeywords)) {
      if (lowerPriority.includes(keyword)) {
        return goalType;
      }
    }
  }

  // 이벤트 유형별 기본 목표
  const eventTypeDefaults: Record<string, z.infer<typeof GoalTypeSchema>> = {
    conference: "EDUCATION",
    trade_show: "LEAD_GENERATION",
    seminar: "EDUCATION",
    workshop: "ENGAGEMENT",
    gala: "BRAND_AWARENESS",
    festival: "ATTENDANCE",
    meeting: "NETWORKING",
    hybrid: "ENGAGEMENT",
  };

  return eventTypeDefaults[eventType] || "ATTENDANCE";
}

function generateKPIs(
  goalType: z.infer<typeof GoalTypeSchema>,
  eventType: string
): Output["kpis"] {
  const kpiTemplates: Record<string, Output["kpis"]> = {
    ATTENDANCE: [
      {
        name: "총 등록자 수",
        description: "사전 등록 완료한 참가자 수",
        measurement_method: "등록 시스템 데이터",
        target: 500,
        unit: "명",
        frequency: "real_time",
      },
      {
        name: "실제 참석률",
        description: "등록자 대비 실제 참석자 비율",
        measurement_method: "체크인 시스템",
        target: 80,
        unit: "%",
        frequency: "daily",
      },
    ],
    REVENUE: [
      {
        name: "총 매출",
        description: "이벤트로 인한 총 수익",
        measurement_method: "재무 시스템",
        target: 100000,
        unit: "USD",
        frequency: "daily",
      },
      {
        name: "참가자당 수익",
        description: "참가자 1인당 평균 수익",
        measurement_method: "총 매출 / 참가자 수",
        target: 200,
        unit: "USD",
        frequency: "post_event",
      },
    ],
    ENGAGEMENT: [
      {
        name: "세션 참여율",
        description: "세션당 평균 참석률",
        measurement_method: "세션 체크인",
        target: 70,
        unit: "%",
        frequency: "real_time",
      },
      {
        name: "앱 활성 사용자",
        description: "이벤트 앱 일일 활성 사용자",
        measurement_method: "앱 애널리틱스",
        target: 60,
        unit: "%",
        frequency: "daily",
      },
    ],
    LEAD_GENERATION: [
      {
        name: "수집된 리드 수",
        description: "영업 기회로 전환 가능한 리드",
        measurement_method: "리드 스캔 데이터",
        target: 200,
        unit: "건",
        frequency: "real_time",
      },
      {
        name: "리드 품질 점수",
        description: "평균 리드 품질 점수",
        measurement_method: "리드 스코어링",
        target: 75,
        unit: "점",
        frequency: "post_event",
      },
    ],
    EDUCATION: [
      {
        name: "학습 만족도",
        description: "교육 콘텐츠 만족도 평균",
        measurement_method: "세션 후 설문",
        target: 4.2,
        unit: "/5.0",
        frequency: "daily",
      },
      {
        name: "지식 습득률",
        description: "사전/사후 테스트 점수 향상",
        measurement_method: "퀴즈 결과 비교",
        target: 30,
        unit: "%",
        frequency: "post_event",
      },
    ],
    NETWORKING: [
      {
        name: "네트워킹 미팅 수",
        description: "1:1 미팅 또는 그룹 연결 횟수",
        measurement_method: "미팅 앱 데이터",
        target: 300,
        unit: "건",
        frequency: "real_time",
      },
      {
        name: "연결 만족도",
        description: "네트워킹 경험 만족도",
        measurement_method: "설문 조사",
        target: 4.0,
        unit: "/5.0",
        frequency: "post_event",
      },
    ],
    BRAND_AWARENESS: [
      {
        name: "미디어 노출",
        description: "언론 보도 및 소셜 미디어 멘션",
        measurement_method: "미디어 모니터링",
        target: 50,
        unit: "건",
        frequency: "daily",
      },
      {
        name: "소셜 도달률",
        description: "이벤트 해시태그 도달 수",
        measurement_method: "소셜 분석",
        target: 100000,
        unit: "회",
        frequency: "daily",
      },
    ],
    SATISFACTION: [
      {
        name: "전반적 만족도",
        description: "이벤트 전반적 만족도",
        measurement_method: "사후 설문",
        target: 4.5,
        unit: "/5.0",
        frequency: "post_event",
      },
      {
        name: "NPS 점수",
        description: "Net Promoter Score",
        measurement_method: "NPS 설문",
        target: 50,
        unit: "점",
        frequency: "post_event",
      },
    ],
    CUSTOM: [
      {
        name: "커스텀 목표 달성률",
        description: "정의된 커스텀 목표 달성 비율",
        measurement_method: "목표별 측정",
        target: 80,
        unit: "%",
        frequency: "post_event",
      },
    ],
  };

  return kpiTemplates[goalType] || kpiTemplates.ATTENDANCE;
}

export async function execute(input: unknown): Promise<Output> {
  const validatedInput = InputSchema.parse(input);

  const primaryGoalType = determineGoalType(
    validatedInput.event_type,
    validatedInput.strategic_priorities || []
  );

  const kpis = generateKPIs(primaryGoalType, validatedInput.event_type);

  // 과거 데이터 기반 목표 조정
  let targetMultiplier = 1.0;
  if (validatedInput.past_event_metrics && validatedInput.past_event_metrics.length > 0) {
    const avgImprovement =
      validatedInput.past_event_metrics
        .filter((m) => m.target_improvement)
        .reduce((sum, m) => sum + (m.target_improvement || 0), 0) /
      validatedInput.past_event_metrics.filter((m) => m.target_improvement).length;

    if (avgImprovement > 0) {
      targetMultiplier = 1 + avgImprovement / 100;
    }
  }

  // KPI 목표값 조정
  const adjustedKPIs = kpis.map((kpi) => ({
    ...kpi,
    target: Math.round(kpi.target * targetMultiplier * 100) / 100,
  }));

  const primaryGoal = {
    type: primaryGoalType,
    title: `${validatedInput.event_name} ${primaryGoalType.toLowerCase().replace("_", " ")} 목표`,
    description: `${validatedInput.event_type} 이벤트의 핵심 ${primaryGoalType.toLowerCase().replace("_", " ")} 목표`,
    target_value: adjustedKPIs[0]?.target || 100,
    target_unit: adjustedKPIs[0]?.unit || "단위",
    success_criteria: `${adjustedKPIs[0]?.name || "주요 지표"} ${adjustedKPIs[0]?.target || 100}${adjustedKPIs[0]?.unit || ""} 이상 달성`,
    alignment_rationale: validatedInput.organization_mission
      ? `조직 미션 "${validatedInput.organization_mission}"과 직접적으로 연계됨`
      : "이벤트 유형에 최적화된 목표 설정",
  };

  // 보조 목표 생성
  const secondaryGoalTypes: z.infer<typeof GoalTypeSchema>[] = [
    "SATISFACTION",
    "ENGAGEMENT",
    "NETWORKING",
  ].filter((t) => t !== primaryGoalType) as z.infer<typeof GoalTypeSchema>[];

  const secondaryGoals = secondaryGoalTypes.slice(0, 2).map((type, index) => ({
    type,
    title: `${type.toLowerCase().replace("_", " ")} 향상`,
    description: `이벤트 ${type.toLowerCase().replace("_", " ")} 개선`,
    target_value: 75 + index * 5,
    target_unit: "%",
    priority: (index === 0 ? "high" : "medium") as "high" | "medium" | "low",
  }));

  const recommendations: string[] = [
    `${primaryGoalType} 목표 달성을 위한 전용 태스크포스 구성을 권장합니다.`,
    "KPI 모니터링 대시보드를 사전에 구축하여 실시간 추적하세요.",
    "목표 달성 마일스톤을 설정하고 중간 점검 일정을 수립하세요.",
  ];

  if (validatedInput.constraints && validatedInput.constraints.length > 0) {
    recommendations.push(
      `제약 조건(${validatedInput.constraints.join(", ")})을 고려한 대안 계획을 준비하세요.`
    );
  }

  const riskFactors: string[] = [
    "목표가 너무 공격적으로 설정되어 팀 사기 저하 가능성",
    "외부 요인(경제, 날씨, 경쟁 이벤트)으로 인한 목표 미달 위험",
    "측정 시스템 장애로 인한 데이터 수집 문제",
  ];

  return {
    goal_set_id: generateUUID(),
    event_id: validatedInput.event_id,
    primary_goal: primaryGoal,
    secondary_goals: secondaryGoals,
    kpis: adjustedKPIs,
    recommendations,
    risk_factors: riskFactors,
    generated_at: new Date().toISOString(),
  };
}

export default {
  ...metadata,
  persona: AGENT_PERSONA,
  execute,
};
