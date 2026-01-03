/**
 * FIN-029: F&B 수익 최적화
 *
 * CMP-IS Reference: 7.4.c
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for F&B Revenue Optimization.
CMP-IS Standard: 7.4.c - Optimizing food and beverage revenue at events.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_details: z.object({
    duration_hours: z.number(),
    meal_periods: z.array(z.enum(["breakfast", "lunch", "dinner", "breaks", "reception"])),
    venue_fb_policy: z.enum(["exclusive", "preferred_vendor", "open"]),
  }),
  attendee_info: z.object({
    expected_count: z.number().int(),
    dietary_restrictions_percentage: z.number().optional(),
    vip_count: z.number().int().optional(),
  }),
  budget_constraints: z.object({
    included_in_registration: z.array(z.string()),
    additional_budget: z.number().optional(),
  }).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  optimization_id: z.string().uuid(),
  event_id: z.string().uuid(),
  included_fb: z.array(z.object({
    period: z.string(),
    service_type: z.string(),
    per_person_cost: z.number(),
    total_cost: z.number(),
    included_in_registration: z.boolean(),
  })),
  revenue_opportunities: z.array(z.object({
    opportunity: z.string(),
    pricing_model: z.string(),
    estimated_uptake_percentage: z.number(),
    projected_revenue: z.number(),
    margin_percentage: z.number(),
  })),
  vendor_recommendations: z.array(z.object({
    category: z.string(),
    recommendation: z.string(),
    rationale: z.string(),
  })),
  cost_optimization_tips: z.array(z.string()),
  total_fb_cost: z.number(),
  total_fb_revenue_opportunity: z.number(),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);
  const attendees = validated.attendee_info.expected_count;

  const included = validated.budget_constraints?.included_in_registration || [];

  const includedFb = validated.event_details.meal_periods.map(period => {
    const costs: Record<string, { service: string; cost: number }> = {
      breakfast: { service: "뷔페", cost: 25 },
      lunch: { service: "뷔페", cost: 45 },
      dinner: { service: "정식", cost: 75 },
      breaks: { service: "커피/다과", cost: 15 },
      reception: { service: "칵테일", cost: 50 },
    };
    const info = costs[period];
    return {
      period: period,
      service_type: info.service,
      per_person_cost: info.cost,
      total_cost: info.cost * attendees,
      included_in_registration: included.includes(period),
    };
  });

  const totalCost = includedFb.reduce((sum, f) => sum + f.total_cost, 0);

  const revenueOpps = [
    {
      opportunity: "프리미엄 와인 페어링 디너",
      pricing_model: "추가 티켓 ($80/인)",
      estimated_uptake_percentage: 15,
      projected_revenue: Math.round(attendees * 0.15 * 80),
      margin_percentage: 40,
    },
    {
      opportunity: "VIP 라운지 업그레이드",
      pricing_model: "프리미엄 옵션 ($50/인)",
      estimated_uptake_percentage: 10,
      projected_revenue: Math.round(attendees * 0.1 * 50),
      margin_percentage: 60,
    },
    {
      opportunity: "캐시바 운영",
      pricing_model: "음료 개별 판매",
      estimated_uptake_percentage: 40,
      projected_revenue: Math.round(attendees * 0.4 * 25),
      margin_percentage: 50,
    },
    {
      opportunity: "스폰서 브랜드 커피 스테이션",
      pricing_model: "스폰서십 패키지",
      estimated_uptake_percentage: 100,
      projected_revenue: 5000,
      margin_percentage: 100,
    },
  ];

  const totalRevenue = revenueOpps.reduce((sum, r) => sum + r.projected_revenue, 0);

  const output: Output = {
    optimization_id: generateUUID(),
    event_id: validated.event_id,
    included_fb: includedFb,
    revenue_opportunities: revenueOpps,
    vendor_recommendations: [
      {
        category: "케이터링",
        recommendation: "다중 업체 경쟁 입찰",
        rationale: "비용 10-15% 절감 가능",
      },
      {
        category: "음료",
        recommendation: "음료 스폰서십 확보",
        rationale: "비용 상쇄 및 브랜드 노출",
      },
      {
        category: "특수 식단",
        recommendation: "사전 파악 및 별도 주문",
        rationale: "낭비 최소화, 만족도 향상",
      },
    ],
    cost_optimization_tips: [
      "정확한 사전 등록으로 식수 산정 정확도 향상",
      "뷔페보다 박스 런치 고려 (20% 절감)",
      "시즌 메뉴 활용으로 재료비 절감",
      "음식물 쓰레기 감소를 위한 적정량 주문",
    ],
    total_fb_cost: totalCost,
    total_fb_revenue_opportunity: totalRevenue,
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-029",
  taskName: "F&B 수익 최적화",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 7.4.c",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.4: Identify and Develop Additional Revenue Streams",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
