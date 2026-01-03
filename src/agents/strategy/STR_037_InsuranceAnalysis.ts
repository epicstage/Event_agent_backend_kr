/**
 * STR-037: 보험 분석
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Insurance Analysis)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Insurance Analysis Agent for event planning.

Your expertise includes:
- Event insurance needs assessment
- Coverage options analysis
- Premium cost-benefit evaluation
- Claims preparation guidance

CMP-IS Standard: Domain A - Strategic Planning (Insurance Analysis)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  event_profile: z.object({
    type: z.string(),
    venue_type: z.enum(["indoor", "outdoor", "hybrid", "virtual"]),
    expected_attendees: z.number(),
    budget: z.number(),
    duration_days: z.number(),
    high_risk_activities: z.array(z.string()).optional(),
    alcohol_served: z.boolean().optional(),
    international_participants: z.boolean().optional(),
  }),
  current_coverage: z.array(z.object({
    type: z.string(),
    coverage_amount: z.number(),
    premium: z.number(),
  })).optional(),
  risk_profile: z.object({
    high_severity_risks: z.array(z.string()),
    financial_exposure: z.number().optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string().uuid(),
  event_id: z.string().uuid(),
  insurance_needs_assessment: z.object({
    risk_exposure_summary: z.string(),
    recommended_coverage_level: z.enum(["basic", "standard", "comprehensive", "premium"]),
    coverage_priority: z.array(z.object({
      coverage_type: z.string(),
      priority: z.enum(["essential", "highly_recommended", "recommended", "optional"]),
      reason: z.string(),
    })),
  }),
  coverage_recommendations: z.array(z.object({
    coverage_type: z.string(),
    description: z.string(),
    coverage_amount_range: z.object({
      minimum: z.number(),
      recommended: z.number(),
      maximum: z.number(),
    }),
    estimated_premium_range: z.object({
      low: z.number(),
      high: z.number(),
    }),
    key_inclusions: z.array(z.string()),
    key_exclusions: z.array(z.string()),
    considerations: z.array(z.string()),
  })),
  coverage_gaps: z.array(z.object({
    gap: z.string(),
    risk_if_unaddressed: z.string(),
    recommendation: z.string(),
  })),
  cost_benefit_analysis: z.object({
    total_premium_estimate: z.object({
      basic_package: z.number(),
      recommended_package: z.number(),
      comprehensive_package: z.number(),
    }),
    premium_to_budget_ratio: z.number(),
    risk_transfer_value: z.string(),
    recommendation: z.string(),
  }),
  vendor_considerations: z.array(z.object({
    consideration: z.string(),
    action: z.string(),
  })),
  claims_preparation: z.object({
    documentation_requirements: z.array(z.string()),
    notification_timeline: z.string(),
    key_contacts: z.array(z.string()),
  }),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-037",
  taskName: "Insurance Analysis",
  domain: "A",
  skill: "Risk Management",
  taskType: "AI" as const,
  description: "이벤트 보험 필요성을 분석하고 적절한 보험 범위를 권장합니다.",
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

  const { event_profile, current_coverage, risk_profile } = validated;

  const isHighRisk = event_profile.high_risk_activities && event_profile.high_risk_activities.length > 0;
  const isLarge = event_profile.expected_attendees > 500;
  const hasAlcohol = event_profile.alcohol_served;
  const isOutdoor = event_profile.venue_type === "outdoor" || event_profile.venue_type === "hybrid";

  const coverageLevel = (isHighRisk && isLarge) ? "premium" as const :
    (isHighRisk || isLarge) ? "comprehensive" as const :
    isOutdoor || hasAlcohol ? "standard" as const : "basic" as const;

  const basePremiumRate = 0.005; // 0.5% of budget
  const adjustedRate = basePremiumRate *
    (isHighRisk ? 1.5 : 1) *
    (isOutdoor ? 1.3 : 1) *
    (hasAlcohol ? 1.2 : 1);

  const basicPremium = Math.round(event_profile.budget * adjustedRate);
  const recommendedPremium = Math.round(basicPremium * 1.5);
  const comprehensivePremium = Math.round(basicPremium * 2.5);

  const coverageRecommendations = [
    {
      coverage_type: "일반 배상책임보험",
      description: "제3자에 대한 신체 상해 또는 재산 피해 보상",
      coverage_amount_range: {
        minimum: 100000000,
        recommended: 500000000,
        maximum: 1000000000,
      },
      estimated_premium_range: {
        low: Math.round(basicPremium * 0.4),
        high: Math.round(basicPremium * 0.6),
      },
      key_inclusions: ["참가자 상해", "재산 피해", "법적 비용"],
      key_exclusions: ["고의적 행위", "전쟁/테러", "핵 관련"],
      considerations: ["참가자 수에 따른 한도 조정"],
    },
    {
      coverage_type: "이벤트 취소 보험",
      description: "불가항력으로 인한 이벤트 취소 시 손실 보상",
      coverage_amount_range: {
        minimum: event_profile.budget * 0.5,
        recommended: event_profile.budget * 0.8,
        maximum: event_profile.budget,
      },
      estimated_premium_range: {
        low: Math.round(basicPremium * 0.3),
        high: Math.round(basicPremium * 0.5),
      },
      key_inclusions: ["기상 악화", "핵심 인력 질병", "장소 문제"],
      key_exclusions: ["자발적 취소", "재정 문제", "전염병 (일부)"],
      considerations: ["코로나 등 팬데믹 조항 확인 필요"],
    },
    {
      coverage_type: "장비/재산 보험",
      description: "이벤트 장비 및 재산의 손실/피해 보상",
      coverage_amount_range: {
        minimum: 50000000,
        recommended: 100000000,
        maximum: 300000000,
      },
      estimated_premium_range: {
        low: Math.round(basicPremium * 0.1),
        high: Math.round(basicPremium * 0.2),
      },
      key_inclusions: ["렌탈 장비", "전시물", "운송 중 피해"],
      key_exclusions: ["마모", "기계적 고장"],
      considerations: ["고가 장비는 별도 항목 추가"],
    },
  ];

  if (hasAlcohol) {
    coverageRecommendations.push({
      coverage_type: "주류 배상책임보험",
      description: "주류 제공 관련 사고 보상",
      coverage_amount_range: { minimum: 50000000, recommended: 100000000, maximum: 200000000 },
      estimated_premium_range: { low: Math.round(basicPremium * 0.1), high: Math.round(basicPremium * 0.15) },
      key_inclusions: ["음주 관련 사고", "미성년자 음주"],
      key_exclusions: ["고의적 과다 제공"],
      considerations: ["음주 관리 정책 수립 필요"],
    });
  }

  // Coverage gaps
  const currentTypes = current_coverage?.map(c => c.type) || [];
  const recommendedTypes = coverageRecommendations.map(c => c.coverage_type);
  const gaps = recommendedTypes
    .filter(type => !currentTypes.some(ct => ct.includes(type.substring(0, 4))))
    .map(gap => ({
      gap,
      risk_if_unaddressed: `${gap} 미가입 시 해당 리스크 전액 자가 부담`,
      recommendation: "가입 권장",
    }));

  return {
    analysis_id: generateUUID(),
    event_id: validated.event_id,
    insurance_needs_assessment: {
      risk_exposure_summary: `${event_profile.type} 이벤트, ${event_profile.expected_attendees}명 참가 예상, ${isHighRisk ? "고위험 활동 포함, " : ""}${isOutdoor ? "야외 개최" : "실내 개최"}`,
      recommended_coverage_level: coverageLevel,
      coverage_priority: [
        { coverage_type: "일반 배상책임보험", priority: "essential", reason: "참가자 보호 필수" },
        { coverage_type: "이벤트 취소 보험", priority: isLarge ? "essential" : "highly_recommended", reason: "투자 보호" },
        { coverage_type: "장비/재산 보험", priority: "recommended", reason: "자산 보호" },
      ],
    },
    coverage_recommendations: coverageRecommendations,
    coverage_gaps: gaps,
    cost_benefit_analysis: {
      total_premium_estimate: {
        basic_package: basicPremium,
        recommended_package: recommendedPremium,
        comprehensive_package: comprehensivePremium,
      },
      premium_to_budget_ratio: Math.round((recommendedPremium / event_profile.budget) * 100) / 100,
      risk_transfer_value: `예산 대비 ${Math.round((recommendedPremium / event_profile.budget) * 100)}%의 보험료로 잠재적 ${Math.round(event_profile.budget * 2)}원 이상의 리스크 전가`,
      recommendation: `${coverageLevel} 패키지 권장. 보험료 대비 리스크 전가 효과 우수`,
    },
    vendor_considerations: [
      { consideration: "벤더 보험 증명", action: "모든 주요 벤더에게 보험 증명서 요청" },
      { consideration: "추가 피보험자 지정", action: "벤더 보험에 이벤트 주최측을 추가 피보험자로 지정" },
      { consideration: "보험 한도 확인", action: "벤더 보험 한도가 계약 요건 충족 여부 확인" },
    ],
    claims_preparation: {
      documentation_requirements: [
        "사고 보고서 (시간, 장소, 상황)",
        "목격자 진술",
        "사진/영상 증거",
        "의료 기록 (상해 시)",
        "비용 증빙 (영수증, 견적서)",
      ],
      notification_timeline: "사고 발생 후 24-48시간 내 보험사 통보",
      key_contacts: ["보험 담당자", "보험사 긴급 연락처", "법무 담당"],
    },
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
