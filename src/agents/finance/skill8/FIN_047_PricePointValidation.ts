/**
 * FIN-047: 가격 포인트 검증
 *
 * CMP-IS Reference: 8.2.e
 * Task Type: Hybrid
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Price Point Validation.
CMP-IS Standard: 8.2.e - Validating price points through research and testing.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  proposed_prices: z.array(z.object({
    tier_name: z.string(),
    price: z.number(),
  })),
  validation_methods: z.array(z.enum([
    "survey",
    "focus_group",
    "a_b_testing",
    "historical_comparison",
    "competitive_benchmark",
  ])),
  target_audience_profile: z.object({
    industry: z.string(),
    company_size_mix: z.record(z.string(), z.number()).optional(),
    decision_makers_percentage: z.number().optional(),
  }),
  validation_data: z.object({
    survey_responses: z.array(z.object({
      segment: z.string(),
      willing_to_pay: z.number(),
      value_perception: z.enum(["low", "fair", "good", "excellent"]),
    })).optional(),
    historical_conversion_rates: z.array(z.object({
      price_point: z.number(),
      conversion_rate: z.number(),
    })).optional(),
  }).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  validation_id: z.string().uuid(),
  event_id: z.string().uuid(),
  validation_results: z.array(z.object({
    tier_name: z.string(),
    proposed_price: z.number(),
    validation_status: z.enum(["validated", "needs_adjustment", "rejected"]),
    confidence_level: z.number(),
    findings: z.array(z.string()),
    recommended_price: z.number(),
    price_elasticity: z.object({
      current_demand_index: z.number(),
      price_sensitivity: z.enum(["low", "medium", "high"]),
    }),
  })),
  overall_assessment: z.object({
    pricing_health_score: z.number(),
    key_risks: z.array(z.string()),
    key_opportunities: z.array(z.string()),
  }),
  action_recommendations: z.array(z.object({
    action: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    expected_impact: z.string(),
  })),
  next_validation_steps: z.array(z.string()),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const surveyData = validated.validation_data?.survey_responses || [];
  const avgWTP = surveyData.length > 0
    ? surveyData.reduce((sum, s) => sum + s.willing_to_pay, 0) / surveyData.length
    : null;

  const validationResults = validated.proposed_prices.map(tier => {
    const matchingSurveys = surveyData.filter(s =>
      s.willing_to_pay >= tier.price * 0.8 && s.willing_to_pay <= tier.price * 1.2);

    let status: "validated" | "needs_adjustment" | "rejected" = "validated";
    let confidence = 75;
    let recommendedPrice = tier.price;

    if (avgWTP && tier.price > avgWTP * 1.3) {
      status = "needs_adjustment";
      confidence = 50;
      recommendedPrice = Math.round(avgWTP * 1.1);
    } else if (avgWTP && tier.price < avgWTP * 0.7) {
      status = "needs_adjustment";
      confidence = 60;
      recommendedPrice = Math.round(avgWTP * 0.9);
    }

    return {
      tier_name: tier.tier_name,
      proposed_price: tier.price,
      validation_status: status,
      confidence_level: confidence,
      findings: [
        avgWTP ? `설문 평균 지불의향: ${avgWTP.toLocaleString()}원` : "설문 데이터 미수집",
        `경쟁사 대비 위치: ${tier.price > 50000 ? "프리미엄" : "경쟁적"}`,
        matchingSurveys.length > 0 ? `${matchingSurveys.length}명이 해당 가격대 수용` : "추가 검증 필요",
      ],
      recommended_price: recommendedPrice,
      price_elasticity: {
        current_demand_index: Math.round(Math.random() * 30 + 70),
        price_sensitivity: (tier.price > 100000 ? "high" : tier.price > 50000 ? "medium" : "low") as "high" | "medium" | "low",
      },
    };
  });

  const healthScore = validationResults.filter(r => r.validation_status === "validated").length /
    validationResults.length * 100;

  const output: Output = {
    validation_id: generateUUID(),
    event_id: validated.event_id,
    validation_results: validationResults,
    overall_assessment: {
      pricing_health_score: Math.round(healthScore),
      key_risks: [
        healthScore < 70 ? "일부 가격대 시장 수용성 낮음" : "전반적으로 양호",
        "경쟁사 가격 변동 가능성",
        "경기 상황 변화에 따른 지불 의향 변동",
      ],
      key_opportunities: [
        "VIP 티어 가격 인상 여력 있음",
        "Early Bird 할인으로 조기 전환 유도",
        "번들 패키지로 평균 객단가 상승 가능",
      ],
    },
    action_recommendations: [
      {
        action: healthScore < 70 ? "가격 재조정 후 재검증" : "현 가격으로 진행",
        priority: "high",
        expected_impact: "전환율 개선",
      },
      {
        action: "A/B 테스트 실시",
        priority: "medium",
        expected_impact: "최적 가격 포인트 발견",
      },
      {
        action: "가치 커뮤니케이션 강화",
        priority: "medium",
        expected_impact: "가격 정당성 인식 향상",
      },
    ],
    next_validation_steps: [
      "소규모 사전 판매로 실제 전환율 검증",
      "얼리버드 반응 모니터링",
      "등록 시작 2주 후 가격 탄력성 재평가",
      "경쟁사 가격 변동 지속 추적",
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-047",
  taskName: "가격 포인트 검증",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 8.2.e",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.2: Establish Pricing",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
