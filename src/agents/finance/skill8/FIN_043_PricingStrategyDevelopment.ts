/**
 * FIN-043: 가격 책정 전략 개발
 *
 * CMP-IS Reference: 8.2.a
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Pricing Strategy Development.
CMP-IS Standard: 8.2.a - Developing comprehensive pricing strategies.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_profile: z.object({
    type: z.string(),
    target_audience: z.string(),
    unique_value_proposition: z.array(z.string()),
  }),
  cost_structure: z.object({
    fixed_costs: z.number(),
    variable_cost_per_attendee: z.number(),
    target_margin: z.number(),
  }),
  market_data: z.object({
    competitor_pricing: z.array(z.object({
      event_name: z.string(),
      price_range: z.object({ min: z.number(), max: z.number() }),
    })).optional(),
    willingness_to_pay: z.object({ min: z.number(), max: z.number() }).optional(),
  }).optional(),
  expected_attendees: z.number().int(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  strategy_id: z.string().uuid(),
  event_id: z.string().uuid(),
  pricing_strategy: z.object({
    strategy_name: z.string(),
    strategy_type: z.enum(["value_based", "cost_plus", "competitive", "penetration", "premium"]),
    rationale: z.string(),
  }),
  price_architecture: z.object({
    tiers: z.array(z.object({
      tier_name: z.string(),
      price: z.number(),
      target_segment: z.string(),
      inclusions: z.array(z.string()),
      expected_percentage: z.number(),
    })),
    pricing_mechanics: z.array(z.object({
      mechanic: z.string(),
      description: z.string(),
      expected_impact: z.string(),
    })),
  }),
  financial_projections: z.object({
    weighted_avg_price: z.number(),
    projected_revenue: z.number(),
    margin_analysis: z.object({
      gross_margin: z.number(),
      margin_percentage: z.number(),
    }),
  }),
  implementation_guidelines: z.array(z.object({
    guideline: z.string(),
    timing: z.string(),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const breakEven = validated.cost_structure.fixed_costs / validated.expected_attendees +
    validated.cost_structure.variable_cost_per_attendee;
  const targetPrice = breakEven * (1 + validated.cost_structure.target_margin / 100);

  const tiers = [
    {
      tier_name: "VIP / Premium",
      price: Math.round(targetPrice * 1.8),
      target_segment: "의사결정자, C-Level",
      inclusions: ["전체 세션 접근", "VIP 라운지", "네트워킹 디너", "1:1 미팅 기회", "우선 좌석"],
      expected_percentage: 15,
    },
    {
      tier_name: "Standard / Full",
      price: Math.round(targetPrice),
      target_segment: "실무자, 매니저",
      inclusions: ["전체 세션 접근", "점심 포함", "네트워킹 세션", "자료집"],
      expected_percentage: 55,
    },
    {
      tier_name: "Basic / Conference Only",
      price: Math.round(targetPrice * 0.7),
      target_segment: "예산 제한 참가자",
      inclusions: ["메인 세션 접근", "커피 브레이크"],
      expected_percentage: 20,
    },
    {
      tier_name: "Student / Early Career",
      price: Math.round(targetPrice * 0.4),
      target_segment: "학생, 신입",
      inclusions: ["메인 세션 접근", "커리어 세션"],
      expected_percentage: 10,
    },
  ];

  const weightedAvg = tiers.reduce((sum, t) => sum + t.price * (t.expected_percentage / 100), 0);
  const projectedRevenue = weightedAvg * validated.expected_attendees;
  const totalCost = validated.cost_structure.fixed_costs +
    (validated.cost_structure.variable_cost_per_attendee * validated.expected_attendees);
  const grossMargin = projectedRevenue - totalCost;

  const output: Output = {
    strategy_id: generateUUID(),
    event_id: validated.event_id,
    pricing_strategy: {
      strategy_name: "가치 기반 티어 가격제",
      strategy_type: "value_based",
      rationale: "참가자 세그먼트별 가치 인식과 지불 의향에 기반한 차별화 가격 전략. 프리미엄 옵션으로 고가치 고객 확보, 기본 옵션으로 접근성 유지.",
    },
    price_architecture: {
      tiers,
      pricing_mechanics: [
        {
          mechanic: "Early Bird 할인",
          description: "조기 등록 시 15-20% 할인",
          expected_impact: "조기 현금흐름 확보, 전환율 20% 증가",
        },
        {
          mechanic: "그룹 할인",
          description: "5인 이상 단체 등록 시 10% 할인",
          expected_impact: "기업 참가 촉진, 평균 그룹 규모 증가",
        },
        {
          mechanic: "Last Minute 프리미엄",
          description: "마감 직전 등록 시 10% 추가",
          expected_impact: "수익 최적화, 조기 등록 인센티브",
        },
      ],
    },
    financial_projections: {
      weighted_avg_price: Math.round(weightedAvg),
      projected_revenue: Math.round(projectedRevenue),
      margin_analysis: {
        gross_margin: Math.round(grossMargin),
        margin_percentage: Math.round((grossMargin / projectedRevenue) * 100 * 10) / 10,
      },
    },
    implementation_guidelines: [
      { guideline: "Early Bird 가격 발표", timing: "이벤트 6개월 전" },
      { guideline: "Regular 가격 전환", timing: "이벤트 3개월 전" },
      { guideline: "Last Minute 가격 적용", timing: "이벤트 2주 전" },
      { guideline: "현장 등록 가격", timing: "이벤트 당일" },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-043",
  taskName: "가격 책정 전략 개발",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 8.2.a",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.2: Establish Pricing",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
