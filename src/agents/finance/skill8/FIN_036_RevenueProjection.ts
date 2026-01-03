/**
 * FIN-036: 수익 예측
 *
 * CMP-IS Reference: 8.1.f
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Revenue Projection.
CMP-IS Standard: 8.1.f - Projecting event revenue from all sources.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  revenue_sources: z.object({
    registration: z.object({
      ticket_tiers: z.array(z.object({
        tier_name: z.string(),
        price: z.number(),
        expected_quantity: z.number().int(),
      })),
      comp_tickets: z.number().int().optional(),
    }),
    sponsorship: z.object({
      packages: z.array(z.object({
        level: z.string(),
        price: z.number(),
        expected_quantity: z.number().int(),
      })),
      custom_deals: z.number().optional(),
    }).optional(),
    exhibition: z.object({
      booth_types: z.array(z.object({
        type: z.string(),
        price: z.number(),
        expected_quantity: z.number().int(),
      })),
    }).optional(),
    other: z.array(z.object({
      source: z.string(),
      expected_revenue: z.number(),
    })).optional(),
  }),
  historical_performance: z.object({
    avg_conversion_rate: z.number().optional(),
    avg_no_show_rate: z.number().optional(),
  }).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  projection_id: z.string().uuid(),
  event_id: z.string().uuid(),
  revenue_breakdown: z.object({
    registration: z.object({
      gross: z.number(),
      net: z.number(),
      by_tier: z.array(z.object({
        tier: z.string(),
        quantity: z.number().int(),
        revenue: z.number(),
      })),
    }),
    sponsorship: z.object({
      total: z.number(),
      by_level: z.array(z.object({
        level: z.string(),
        quantity: z.number().int(),
        revenue: z.number(),
      })),
    }),
    exhibition: z.object({
      total: z.number(),
      by_type: z.array(z.object({
        type: z.string(),
        quantity: z.number().int(),
        revenue: z.number(),
      })),
    }),
    other_revenue: z.number(),
  }),
  total_projections: z.object({
    conservative: z.number(),
    expected: z.number(),
    optimistic: z.number(),
  }),
  sensitivity_analysis: z.array(z.object({
    variable: z.string(),
    change: z.string(),
    revenue_impact: z.number(),
  })),
  key_assumptions: z.array(z.string()),
  risks_to_projection: z.array(z.object({
    risk: z.string(),
    potential_impact: z.number(),
    probability: z.enum(["low", "medium", "high"]),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  // Registration revenue
  const regByTier = validated.revenue_sources.registration.ticket_tiers.map(t => ({
    tier: t.tier_name,
    quantity: t.expected_quantity,
    revenue: t.price * t.expected_quantity,
  }));
  const regGross = regByTier.reduce((sum, t) => sum + t.revenue, 0);
  const regNet = regGross * 0.95; // 5% payment processing fees

  // Sponsorship revenue
  const sponsByLevel = validated.revenue_sources.sponsorship?.packages.map(p => ({
    level: p.level,
    quantity: p.expected_quantity,
    revenue: p.price * p.expected_quantity,
  })) || [];
  const sponsTotal = sponsByLevel.reduce((sum, s) => sum + s.revenue, 0) +
    (validated.revenue_sources.sponsorship?.custom_deals || 0);

  // Exhibition revenue
  const exhibByType = validated.revenue_sources.exhibition?.booth_types.map(b => ({
    type: b.type,
    quantity: b.expected_quantity,
    revenue: b.price * b.expected_quantity,
  })) || [];
  const exhibTotal = exhibByType.reduce((sum, e) => sum + e.revenue, 0);

  // Other revenue
  const otherTotal = validated.revenue_sources.other?.reduce((sum, o) => sum + o.expected_revenue, 0) || 0;

  const expectedTotal = regNet + sponsTotal + exhibTotal + otherTotal;

  const output: Output = {
    projection_id: generateUUID(),
    event_id: validated.event_id,
    revenue_breakdown: {
      registration: {
        gross: regGross,
        net: regNet,
        by_tier: regByTier,
      },
      sponsorship: {
        total: sponsTotal,
        by_level: sponsByLevel,
      },
      exhibition: {
        total: exhibTotal,
        by_type: exhibByType,
      },
      other_revenue: otherTotal,
    },
    total_projections: {
      conservative: Math.round(expectedTotal * 0.8),
      expected: Math.round(expectedTotal),
      optimistic: Math.round(expectedTotal * 1.15),
    },
    sensitivity_analysis: [
      {
        variable: "등록자 수",
        change: "-10%",
        revenue_impact: Math.round(regNet * -0.1),
      },
      {
        variable: "등록자 수",
        change: "+10%",
        revenue_impact: Math.round(regNet * 0.1),
      },
      {
        variable: "스폰서십 1건 추가",
        change: "+1 Gold",
        revenue_impact: validated.revenue_sources.sponsorship?.packages[1]?.price || 10000,
      },
      {
        variable: "전시 부스 50% 판매",
        change: "-50%",
        revenue_impact: Math.round(exhibTotal * -0.5),
      },
    ],
    key_assumptions: [
      `등록 전환율: ${validated.historical_performance?.avg_conversion_rate || 70}%`,
      `노쇼율: ${validated.historical_performance?.avg_no_show_rate || 15}%`,
      "결제 수수료: 5%",
      "스폰서십 갱신율: 80%",
      "시장 조건 안정적",
    ],
    risks_to_projection: [
      {
        risk: "경쟁 이벤트 개최",
        potential_impact: Math.round(expectedTotal * -0.15),
        probability: "medium",
      },
      {
        risk: "경기 침체",
        potential_impact: Math.round(expectedTotal * -0.2),
        probability: "low",
      },
      {
        risk: "주요 연사 취소",
        potential_impact: Math.round(regNet * -0.1),
        probability: "low",
      },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-036",
  taskName: "수익 예측",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 8.1.f",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.1: Develop Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
