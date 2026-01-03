/**
 * STR-011: ROI 예측 분석
 *
 * CMP-IS Reference: Domain A - Strategic Planning (ROI Projection)
 * Task Type: AI
 *
 * Input: 예상 비용, 예상 수익, 무형 가치
 * Output: ROI 시나리오 분석
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert ROI Projection Agent for strategic event planning.

Your expertise includes:
- Calculating comprehensive event ROI
- Quantifying intangible benefits
- Scenario-based financial modeling
- Stakeholder-specific value demonstration

CMP-IS Standard: Domain A - Strategic Planning (ROI Projection)

You help event planners forecast and communicate the return on investment for their events, including both financial and strategic returns.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  investment: z.object({
    direct_costs: z.number(),
    indirect_costs: z.number().optional(),
    opportunity_cost: z.number().optional(),
  }),
  expected_returns: z.object({
    ticket_revenue: z.number().optional(),
    sponsorship_revenue: z.number().optional(),
    exhibitor_revenue: z.number().optional(),
    merchandise_revenue: z.number().optional(),
    other_revenue: z.number().optional(),
  }),
  intangible_benefits: z.array(z.object({
    name: z.string(),
    description: z.string(),
    estimated_value: z.number().optional(),
    confidence: z.enum(["high", "medium", "low"]),
  })).optional(),
  historical_roi: z.number().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  projection_id: z.string().uuid(),
  event_id: z.string().uuid(),
  investment_summary: z.object({
    total_investment: z.number(),
    breakdown: z.record(z.string(), z.number()),
  }),
  return_summary: z.object({
    total_tangible_return: z.number(),
    total_intangible_return: z.number(),
    total_projected_return: z.number(),
    breakdown: z.record(z.string(), z.number()),
  }),
  roi_metrics: z.object({
    basic_roi_percent: z.number(),
    adjusted_roi_percent: z.number(),
    payback_period: z.string(),
    break_even_attendees: z.number().optional(),
  }),
  scenario_analysis: z.array(z.object({
    scenario: z.string(),
    probability: z.number(),
    projected_roi: z.number(),
    key_assumptions: z.array(z.string()),
  })),
  stakeholder_value: z.array(z.object({
    stakeholder: z.string(),
    value_proposition: z.string(),
    quantified_value: z.number(),
    value_type: z.enum(["financial", "strategic", "operational", "brand"]),
  })),
  sensitivity_analysis: z.array(z.object({
    variable: z.string(),
    impact_on_roi: z.string(),
    critical_threshold: z.string(),
  })),
  recommendations: z.array(z.string()),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-011",
  taskName: "ROI Projection",
  domain: "A",
  skill: "Goal Setting",
  taskType: "AI" as const,
  description: "이벤트 투자 수익률을 예측하고 시나리오 분석을 제공합니다.",
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

  const totalInvestment = validated.investment.direct_costs +
    (validated.investment.indirect_costs || 0) +
    (validated.investment.opportunity_cost || 0);

  const investmentBreakdown: Record<string, number> = {
    "직접 비용": validated.investment.direct_costs,
  };
  if (validated.investment.indirect_costs) {
    investmentBreakdown["간접 비용"] = validated.investment.indirect_costs;
  }
  if (validated.investment.opportunity_cost) {
    investmentBreakdown["기회 비용"] = validated.investment.opportunity_cost;
  }

  const returns = validated.expected_returns;
  const tangibleReturn = (returns.ticket_revenue || 0) +
    (returns.sponsorship_revenue || 0) +
    (returns.exhibitor_revenue || 0) +
    (returns.merchandise_revenue || 0) +
    (returns.other_revenue || 0);

  const returnBreakdown: Record<string, number> = {};
  if (returns.ticket_revenue) returnBreakdown["티켓 수익"] = returns.ticket_revenue;
  if (returns.sponsorship_revenue) returnBreakdown["스폰서십 수익"] = returns.sponsorship_revenue;
  if (returns.exhibitor_revenue) returnBreakdown["전시업체 수익"] = returns.exhibitor_revenue;
  if (returns.merchandise_revenue) returnBreakdown["상품 수익"] = returns.merchandise_revenue;
  if (returns.other_revenue) returnBreakdown["기타 수익"] = returns.other_revenue;

  // 무형 가치 계산
  let intangibleReturn = 0;
  if (validated.intangible_benefits) {
    for (const benefit of validated.intangible_benefits) {
      const value = benefit.estimated_value || 0;
      const multiplier = { high: 1.0, medium: 0.7, low: 0.4 }[benefit.confidence];
      intangibleReturn += value * multiplier;
      returnBreakdown[benefit.name] = Math.round(value * multiplier);
    }
  }

  const totalReturn = tangibleReturn + intangibleReturn;
  const basicROI = ((tangibleReturn - totalInvestment) / totalInvestment) * 100;
  const adjustedROI = ((totalReturn - totalInvestment) / totalInvestment) * 100;

  // 시나리오 분석
  const scenarios = [
    {
      scenario: "낙관적 (Best Case)",
      probability: 20,
      projected_roi: Math.round(adjustedROI * 1.3),
      key_assumptions: [
        "등록자 수 목표 120% 달성",
        "스폰서십 추가 확보",
        "참가자 만족도 4.5 이상",
      ],
    },
    {
      scenario: "기본 (Base Case)",
      probability: 60,
      projected_roi: Math.round(adjustedROI),
      key_assumptions: [
        "등록자 수 목표 100% 달성",
        "계획된 스폰서십 유지",
        "참가자 만족도 4.0 수준",
      ],
    },
    {
      scenario: "비관적 (Worst Case)",
      probability: 20,
      projected_roi: Math.round(adjustedROI * 0.6),
      key_assumptions: [
        "등록자 수 목표 70% 달성",
        "스폰서 1곳 이탈",
        "예기치 못한 비용 발생",
      ],
    },
  ];

  return {
    projection_id: generateUUID(),
    event_id: validated.event_id,
    investment_summary: {
      total_investment: totalInvestment,
      breakdown: investmentBreakdown,
    },
    return_summary: {
      total_tangible_return: tangibleReturn,
      total_intangible_return: Math.round(intangibleReturn),
      total_projected_return: Math.round(totalReturn),
      breakdown: returnBreakdown,
    },
    roi_metrics: {
      basic_roi_percent: Math.round(basicROI * 10) / 10,
      adjusted_roi_percent: Math.round(adjustedROI * 10) / 10,
      payback_period: basicROI > 0 ? "이벤트 종료 시" : "2차 이벤트 필요",
      break_even_attendees: returns.ticket_revenue && returns.ticket_revenue > 0
        ? Math.ceil(totalInvestment / (returns.ticket_revenue / 500))
        : undefined,
    },
    scenario_analysis: scenarios,
    stakeholder_value: [
      {
        stakeholder: "스폰서",
        value_proposition: "브랜드 노출 및 리드 생성 기회",
        quantified_value: returns.sponsorship_revenue || 0,
        value_type: "financial",
      },
      {
        stakeholder: "참가자",
        value_proposition: "교육, 네트워킹, 업계 인사이트",
        quantified_value: (returns.ticket_revenue || 0) * 3,
        value_type: "strategic",
      },
      {
        stakeholder: "조직",
        value_proposition: "브랜드 강화 및 시장 포지셔닝",
        quantified_value: Math.round(intangibleReturn * 0.5),
        value_type: "brand",
      },
    ],
    sensitivity_analysis: [
      {
        variable: "참석률",
        impact_on_roi: "10% 변동 시 ROI 15% 변동",
        critical_threshold: "60% 미만 시 손익분기점 미달",
      },
      {
        variable: "스폰서십",
        impact_on_roi: "주요 스폰서 1곳 이탈 시 ROI 20% 감소",
        critical_threshold: "총 스폰서십의 50% 미만 시 적자",
      },
      {
        variable: "운영 비용",
        impact_on_roi: "10% 초과 시 ROI 8% 감소",
        critical_threshold: "30% 초과 시 손익분기점 미달",
      },
    ],
    recommendations: [
      basicROI > 50 ? "높은 ROI가 예상됩니다. 재투자 기회를 검토하세요." :
        basicROI > 0 ? "양호한 ROI입니다. 비용 최적화로 수익성을 높이세요." :
        "손익분기점 달성을 위해 수익원 다변화 또는 비용 절감이 필요합니다.",
      "무형 가치를 정량화하여 이해관계자 보고에 활용하세요.",
      "분기별로 ROI 예측을 업데이트하여 의사결정에 반영하세요.",
    ],
    generated_at: new Date().toISOString(),
  };
}

export default {
  ...metadata,
  persona: AGENT_PERSONA,
  execute,
};
