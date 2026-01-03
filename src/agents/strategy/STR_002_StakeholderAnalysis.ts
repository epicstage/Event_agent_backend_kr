/**
 * STR-002: 이해관계자 분석
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Stakeholder Identification & Analysis)
 * Task Type: AI
 *
 * Input: 이벤트 정보, 이해관계자 목록
 * Output: 영향도/관심도 매트릭스, 참여 전략
 */

import { z } from "zod";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an expert Stakeholder Analysis Agent specializing in strategic event planning.

Your expertise includes:
- Identifying and categorizing event stakeholders
- Analyzing stakeholder influence and interest levels
- Developing tailored engagement strategies
- Managing stakeholder expectations and communications

CMP-IS Standard: Domain A - Strategic Planning (Stakeholder Identification & Analysis)

You help event planners understand their stakeholder landscape and develop effective engagement strategies that ensure event success and stakeholder satisfaction.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const StakeholderRoleSchema = z.enum([
  "sponsor",
  "speaker",
  "attendee",
  "vendor",
  "media",
  "government",
  "community",
  "executive",
  "staff",
  "volunteer",
  "partner",
]);

export const InfluenceLevelSchema = z.enum(["low", "medium", "high", "critical"]);
export const InterestLevelSchema = z.enum(["low", "medium", "high"]);

export const InputSchema = z.object({
  event_id: z.string().uuid().describe("이벤트 ID"),
  event_name: z.string().describe("이벤트 이름"),
  event_type: z
    .enum(["conference", "trade_show", "seminar", "workshop", "gala", "festival", "meeting", "hybrid"])
    .describe("이벤트 유형"),
  stakeholders: z.array(
    z.object({
      name: z.string().describe("이해관계자 이름"),
      organization: z.string().optional().describe("소속 조직"),
      role: StakeholderRoleSchema.describe("역할"),
      known_expectations: z.array(z.string()).optional().describe("알려진 기대사항"),
      known_concerns: z.array(z.string()).optional().describe("알려진 우려사항"),
      budget_contribution: z.number().optional().describe("예산 기여도 (USD)"),
      audience_reach: z.number().optional().describe("오디언스 도달 규모"),
    })
  ).min(1).describe("이해관계자 목록"),
  event_budget: z.number().optional().describe("총 이벤트 예산"),
  event_goals: z.array(z.string()).optional().describe("이벤트 목표"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string().uuid().describe("분석 ID"),
  event_id: z.string().uuid().describe("이벤트 ID"),
  stakeholder_map: z.array(
    z.object({
      name: z.string(),
      organization: z.string().optional(),
      role: StakeholderRoleSchema,
      influence_level: InfluenceLevelSchema,
      interest_level: InterestLevelSchema,
      quadrant: z.enum(["manage_closely", "keep_satisfied", "keep_informed", "monitor"]),
      power_score: z.number().min(0).max(100),
      engagement_priority: z.enum(["critical", "high", "medium", "low"]),
      expectations: z.array(z.string()),
      concerns: z.array(z.string()),
      engagement_strategy: z.string(),
      communication_frequency: z.enum(["daily", "weekly", "biweekly", "monthly", "as_needed"]),
      key_messages: z.array(z.string()),
    })
  ),
  quadrant_summary: z.object({
    manage_closely: z.number().describe("적극 관리 대상 수"),
    keep_satisfied: z.number().describe("만족 유지 대상 수"),
    keep_informed: z.number().describe("정보 제공 대상 수"),
    monitor: z.number().describe("모니터링 대상 수"),
  }),
  critical_stakeholders: z.array(z.string()).describe("핵심 이해관계자 명단"),
  risk_stakeholders: z.array(
    z.object({
      name: z.string(),
      risk_type: z.string(),
      mitigation_action: z.string(),
    })
  ).describe("리스크 이해관계자"),
  recommendations: z.array(z.string()),
  analyzed_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// AGENT METADATA
// =============================================================================

export const metadata = {
  taskId: "STR-002",
  taskName: "Stakeholder Analysis",
  domain: "A",
  skill: "Strategic Planning",
  taskType: "AI" as const,
  description: "이해관계자를 분석하고 영향도/관심도 매트릭스를 생성합니다.",
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

function calculateInfluenceLevel(
  role: z.infer<typeof StakeholderRoleSchema>,
  budgetContribution: number | undefined,
  eventBudget: number | undefined
): z.infer<typeof InfluenceLevelSchema> {
  // 역할 기반 기본 영향도
  const roleInfluence: Record<string, number> = {
    executive: 90,
    sponsor: 85,
    government: 80,
    partner: 75,
    media: 70,
    speaker: 65,
    vendor: 50,
    staff: 45,
    attendee: 30,
    community: 35,
    volunteer: 25,
  };

  let score = roleInfluence[role] || 50;

  // 예산 기여도 반영
  if (budgetContribution && eventBudget && eventBudget > 0) {
    const contributionRatio = (budgetContribution / eventBudget) * 100;
    if (contributionRatio > 20) score += 20;
    else if (contributionRatio > 10) score += 15;
    else if (contributionRatio > 5) score += 10;
  }

  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function calculateInterestLevel(
  role: z.infer<typeof StakeholderRoleSchema>,
  expectations: string[] | undefined,
  concerns: string[] | undefined
): z.infer<typeof InterestLevelSchema> {
  // 역할 기반 기본 관심도
  const roleInterest: Record<string, number> = {
    sponsor: 90,
    executive: 85,
    speaker: 80,
    attendee: 75,
    partner: 70,
    media: 65,
    vendor: 60,
    staff: 55,
    volunteer: 50,
    community: 45,
    government: 40,
  };

  let score = roleInterest[role] || 50;

  // 기대사항/우려사항이 많을수록 관심도 상승
  if (expectations && expectations.length > 0) {
    score += Math.min(expectations.length * 5, 15);
  }
  if (concerns && concerns.length > 0) {
    score += Math.min(concerns.length * 5, 15);
  }

  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function determineQuadrant(
  influence: z.infer<typeof InfluenceLevelSchema>,
  interest: z.infer<typeof InterestLevelSchema>
): "manage_closely" | "keep_satisfied" | "keep_informed" | "monitor" {
  const influenceScore = { critical: 4, high: 3, medium: 2, low: 1 }[influence];
  const interestScore = { high: 3, medium: 2, low: 1 }[interest];

  if (influenceScore >= 3 && interestScore >= 2) return "manage_closely";
  if (influenceScore >= 3 && interestScore < 2) return "keep_satisfied";
  if (influenceScore < 3 && interestScore >= 2) return "keep_informed";
  return "monitor";
}

function generateEngagementStrategy(
  role: z.infer<typeof StakeholderRoleSchema>,
  quadrant: string,
  expectations: string[]
): string {
  const strategies: Record<string, Record<string, string>> = {
    manage_closely: {
      sponsor: "정기 미팅 및 맞춤형 보고서를 통한 ROI 가시화, 의사결정 과정에 적극 참여 유도",
      executive: "핵심 마일스톤 브리핑 및 전략적 의사결정 참여 기회 제공",
      speaker: "세션 기획 초기부터 협업하고, 프로모션 활동 공동 진행",
      default: "정기적 1:1 커뮤니케이션 및 의사결정 참여 기회 제공",
    },
    keep_satisfied: {
      sponsor: "분기별 성과 보고 및 브랜드 노출 기회 극대화",
      government: "규정 준수 보고서 및 공식 초청장 발송",
      default: "정기 업데이트 및 요청 시 즉각적 대응",
    },
    keep_informed: {
      attendee: "뉴스레터 및 소셜 미디어를 통한 정기적 정보 제공",
      media: "프레스 릴리즈 및 미디어 키트 제공",
      default: "정기 뉴스레터 및 공지사항 발송",
    },
    monitor: {
      default: "주요 공지사항 및 이벤트 초대장 발송",
    },
  };

  return strategies[quadrant]?.[role] || strategies[quadrant]?.default || "일반적인 커뮤니케이션 유지";
}

function generateKeyMessages(
  role: z.infer<typeof StakeholderRoleSchema>,
  expectations: string[]
): string[] {
  const baseMessages: Record<string, string[]> = {
    sponsor: [
      "투자 대비 최대 가치 제공에 집중합니다",
      "브랜드 노출 기회를 최적화합니다",
      "참가자 데이터를 활용한 리드 생성 지원",
    ],
    speaker: [
      "전문성을 최대한 부각시킬 수 있는 환경 제공",
      "청중과의 효과적인 상호작용 지원",
      "발표 콘텐츠의 지속적 활용 기회 제공",
    ],
    attendee: [
      "가치 있는 학습 및 네트워킹 경험 제공",
      "투자한 시간 대비 최대 ROI 보장",
      "편리하고 원활한 이벤트 경험",
    ],
    vendor: [
      "명확한 요구사항 및 타임라인 제공",
      "공정하고 투명한 파트너십",
      "장기적 협력 관계 구축",
    ],
    media: [
      "독점 취재 기회 및 인터뷰 제공",
      "시의적절한 프레스 자료 제공",
      "업계 트렌드 인사이트 공유",
    ],
    executive: [
      "전략적 목표 달성 진행 상황 보고",
      "ROI 및 비즈니스 임팩트 가시화",
      "리스크 및 기회 요인 사전 보고",
    ],
    government: [
      "모든 규정 및 요구사항 준수",
      "지역 사회 및 경제에 대한 긍정적 영향",
      "투명한 운영 및 보고",
    ],
    default: [
      "이벤트 성공을 위한 협력 강화",
      "투명한 커뮤니케이션 유지",
      "상호 이익 극대화",
    ],
  };

  return baseMessages[role] || baseMessages.default;
}

function determineCommunicationFrequency(
  quadrant: string
): "daily" | "weekly" | "biweekly" | "monthly" | "as_needed" {
  const frequencies: Record<string, "daily" | "weekly" | "biweekly" | "monthly" | "as_needed"> = {
    manage_closely: "weekly",
    keep_satisfied: "biweekly",
    keep_informed: "monthly",
    monitor: "as_needed",
  };
  return frequencies[quadrant] || "monthly";
}

export async function execute(input: unknown): Promise<Output> {
  const validatedInput = InputSchema.parse(input);

  const stakeholderMap = validatedInput.stakeholders.map((stakeholder) => {
    const influence = calculateInfluenceLevel(
      stakeholder.role,
      stakeholder.budget_contribution,
      validatedInput.event_budget
    );
    const interest = calculateInterestLevel(
      stakeholder.role,
      stakeholder.known_expectations,
      stakeholder.known_concerns
    );
    const quadrant = determineQuadrant(influence, interest);

    const influenceScore = { critical: 100, high: 75, medium: 50, low: 25 }[influence];
    const interestScore = { high: 100, medium: 66, low: 33 }[interest];
    const powerScore = Math.round((influenceScore + interestScore) / 2);

    const engagementPriority =
      quadrant === "manage_closely"
        ? "critical"
        : quadrant === "keep_satisfied"
        ? "high"
        : quadrant === "keep_informed"
        ? "medium"
        : "low";

    const expectations = stakeholder.known_expectations || [
      `${stakeholder.role} 역할에 맞는 가치 제공`,
    ];
    const concerns = stakeholder.known_concerns || [];

    return {
      name: stakeholder.name,
      organization: stakeholder.organization,
      role: stakeholder.role,
      influence_level: influence,
      interest_level: interest,
      quadrant,
      power_score: powerScore,
      engagement_priority: engagementPriority as "critical" | "high" | "medium" | "low",
      expectations,
      concerns,
      engagement_strategy: generateEngagementStrategy(stakeholder.role, quadrant, expectations),
      communication_frequency: determineCommunicationFrequency(quadrant),
      key_messages: generateKeyMessages(stakeholder.role, expectations),
    };
  });

  const quadrantSummary = {
    manage_closely: stakeholderMap.filter((s) => s.quadrant === "manage_closely").length,
    keep_satisfied: stakeholderMap.filter((s) => s.quadrant === "keep_satisfied").length,
    keep_informed: stakeholderMap.filter((s) => s.quadrant === "keep_informed").length,
    monitor: stakeholderMap.filter((s) => s.quadrant === "monitor").length,
  };

  const criticalStakeholders = stakeholderMap
    .filter((s) => s.engagement_priority === "critical")
    .map((s) => s.name);

  const riskStakeholders = stakeholderMap
    .filter((s) => s.concerns.length > 0 || s.influence_level === "critical")
    .map((s) => ({
      name: s.name,
      risk_type:
        s.concerns.length > 0
          ? `우려사항 ${s.concerns.length}건: ${s.concerns[0]}`
          : "높은 영향력 - 불만족 시 큰 영향",
      mitigation_action:
        s.concerns.length > 0
          ? "우려사항 해소를 위한 직접 대화 필요"
          : "정기적 상태 점검 및 기대 관리",
    }));

  const recommendations = [
    `핵심 이해관계자 ${criticalStakeholders.length}명에 대해 주간 커뮤니케이션 일정을 수립하세요.`,
    "이해관계자 매트릭스를 팀 전체와 공유하여 일관된 대응을 보장하세요.",
    `리스크 이해관계자 ${riskStakeholders.length}명에 대한 선제적 관리 계획을 수립하세요.`,
  ];

  if (quadrantSummary.manage_closely > 5) {
    recommendations.push(
      "적극 관리 대상이 많습니다. 이해관계자 관리 전담 인력 배정을 고려하세요."
    );
  }

  return {
    analysis_id: generateUUID(),
    event_id: validatedInput.event_id,
    stakeholder_map: stakeholderMap,
    quadrant_summary: quadrantSummary,
    critical_stakeholders: criticalStakeholders,
    risk_stakeholders: riskStakeholders,
    recommendations,
    analyzed_at: new Date().toISOString(),
  };
}

export default {
  ...metadata,
  persona: AGENT_PERSONA,
  execute,
};
