/**
 * FIN-026: 전시 수익 예측
 *
 * CMP-IS Reference: 7.3.e
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Exhibit Revenue Forecasting.
CMP-IS Standard: 7.3.e - Forecasting exhibit revenue based on historical data and current pipeline.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  historical_data: z.array(z.object({
    event_year: z.number().int(),
    total_exhibitors: z.number().int(),
    total_revenue: z.number(),
    avg_booth_price: z.number(),
  })).optional(),
  current_pipeline: z.object({
    confirmed: z.number(),
    pending: z.number(),
    negotiating: z.number(),
    prospects: z.number(),
  }),
  pricing: z.object({
    premium_price: z.number(),
    standard_price: z.number(),
    startup_price: z.number(),
    expected_mix: z.object({
      premium_pct: z.number(),
      standard_pct: z.number(),
      startup_pct: z.number(),
    }),
  }),
  market_factors: z.object({
    industry_growth_rate: z.number().optional(),
    competitive_events: z.number().int().optional(),
    economic_outlook: z.enum(["positive", "neutral", "negative"]).optional(),
  }).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  forecast_id: z.string().uuid(),
  event_id: z.string().uuid(),
  revenue_forecast: z.object({
    base_case: z.number(),
    optimistic_case: z.number(),
    pessimistic_case: z.number(),
    confidence_interval: z.object({
      lower: z.number(),
      upper: z.number(),
      confidence_level: z.number(),
    }),
  }),
  exhibitor_forecast: z.object({
    expected_total: z.number().int(),
    by_tier: z.array(z.object({
      tier: z.string(),
      count: z.number().int(),
      revenue: z.number(),
    })),
  }),
  assumptions: z.array(z.string()),
  risk_factors: z.array(z.object({
    factor: z.string(),
    impact: z.enum(["high", "medium", "low"]),
    mitigation: z.string(),
  })),
  monthly_projections: z.array(z.object({
    month: z.string(),
    cumulative_revenue: z.number(),
    new_bookings_expected: z.number().int(),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const pipeline = validated.current_pipeline;
  const totalPipeline = pipeline.confirmed + pipeline.pending + pipeline.negotiating + pipeline.prospects;

  const mix = validated.pricing.expected_mix;
  const avgPrice = (
    validated.pricing.premium_price * (mix.premium_pct / 100) +
    validated.pricing.standard_price * (mix.standard_pct / 100) +
    validated.pricing.startup_price * (mix.startup_pct / 100)
  );

  const confirmedRevenue = pipeline.confirmed * avgPrice;
  const pendingRevenue = pipeline.pending * avgPrice * 0.8;
  const negotiatingRevenue = pipeline.negotiating * avgPrice * 0.5;
  const prospectRevenue = pipeline.prospects * avgPrice * 0.2;

  const baseCase = confirmedRevenue + pendingRevenue + negotiatingRevenue + prospectRevenue;

  const output: Output = {
    forecast_id: generateUUID(),
    event_id: validated.event_id,
    revenue_forecast: {
      base_case: Math.round(baseCase),
      optimistic_case: Math.round(baseCase * 1.25),
      pessimistic_case: Math.round(baseCase * 0.75),
      confidence_interval: {
        lower: Math.round(baseCase * 0.8),
        upper: Math.round(baseCase * 1.15),
        confidence_level: 80,
      },
    },
    exhibitor_forecast: {
      expected_total: Math.round(totalPipeline * 0.6),
      by_tier: [
        {
          tier: "Premium",
          count: Math.round(totalPipeline * 0.6 * (mix.premium_pct / 100)),
          revenue: Math.round(totalPipeline * 0.6 * (mix.premium_pct / 100) * validated.pricing.premium_price),
        },
        {
          tier: "Standard",
          count: Math.round(totalPipeline * 0.6 * (mix.standard_pct / 100)),
          revenue: Math.round(totalPipeline * 0.6 * (mix.standard_pct / 100) * validated.pricing.standard_price),
        },
        {
          tier: "Startup",
          count: Math.round(totalPipeline * 0.6 * (mix.startup_pct / 100)),
          revenue: Math.round(totalPipeline * 0.6 * (mix.startup_pct / 100) * validated.pricing.startup_price),
        },
      ],
    },
    assumptions: [
      "전환율: 확정 100%, 대기 80%, 협상중 50%, 잠재 20%",
      "가격 믹스는 예상대로 유지",
      "시장 상황 변동 없음",
      "경쟁 이벤트 영향 최소",
    ],
    risk_factors: [
      {
        factor: "경제 불확실성",
        impact: "high",
        mitigation: "유연한 결제 옵션 제공",
      },
      {
        factor: "경쟁 이벤트 일정 충돌",
        impact: "medium",
        mitigation: "차별화된 가치 제안 강화",
      },
      {
        factor: "산업 트렌드 변화",
        impact: "low",
        mitigation: "프로그램 콘텐츠 업데이트",
      },
    ],
    monthly_projections: [
      { month: "M-6", cumulative_revenue: Math.round(baseCase * 0.2), new_bookings_expected: Math.round(totalPipeline * 0.1) },
      { month: "M-4", cumulative_revenue: Math.round(baseCase * 0.5), new_bookings_expected: Math.round(totalPipeline * 0.2) },
      { month: "M-2", cumulative_revenue: Math.round(baseCase * 0.8), new_bookings_expected: Math.round(totalPipeline * 0.2) },
      { month: "M-1", cumulative_revenue: Math.round(baseCase * 0.95), new_bookings_expected: Math.round(totalPipeline * 0.1) },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-026",
  taskName: "전시 수익 예측",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.3.e",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.3: Develop and Manage Exhibit/Sponsorship Sales Process",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
