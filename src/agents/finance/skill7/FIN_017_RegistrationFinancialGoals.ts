/**
 * FIN-017: 등록 재정 목표 설정
 *
 * CMP-IS Reference: 7.2.a - Develop and manage registration process
 * Task Type: Hybrid
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Registration Financial Goal Setting.
CMP-IS Standard: 7.2.a - Setting registration revenue targets based on historical data and event budget.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  past_registration_data: z.array(z.object({
    event_name: z.string(),
    total_registrations: z.number().int(),
    paid_registrations: z.number().int(),
    total_revenue: z.number(),
    avg_ticket_price: z.number(),
  })).optional(),
  event_budget: z.object({
    total_budget: z.number(),
    target_revenue: z.number(),
    break_even_point: z.number(),
  }),
  expected_attendees: z.number().int(),
  ticket_tiers: z.array(z.object({
    tier_name: z.string(),
    price: z.number(),
    expected_percentage: z.number().min(0).max(100),
  })),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  goal_id: z.string().uuid(),
  event_id: z.string().uuid(),
  revenue_targets: z.object({
    minimum: z.number(),
    target: z.number(),
    stretch: z.number(),
  }),
  registration_targets: z.object({
    minimum_registrations: z.number().int(),
    target_registrations: z.number().int(),
    stretch_registrations: z.number().int(),
  }),
  tier_breakdown: z.array(z.object({
    tier_name: z.string(),
    target_count: z.number().int(),
    expected_revenue: z.number(),
  })),
  assumptions: z.array(z.string()),
  risks: z.array(z.string()),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const totalExpectedRevenue = validated.ticket_tiers.reduce((sum, tier) => {
    const count = Math.round(validated.expected_attendees * (tier.expected_percentage / 100));
    return sum + (count * tier.price);
  }, 0);

  const tierBreakdown = validated.ticket_tiers.map(tier => ({
    tier_name: tier.tier_name,
    target_count: Math.round(validated.expected_attendees * (tier.expected_percentage / 100)),
    expected_revenue: Math.round(validated.expected_attendees * (tier.expected_percentage / 100) * tier.price),
  }));

  const output: Output = {
    goal_id: generateUUID(),
    event_id: validated.event_id,
    revenue_targets: {
      minimum: Math.round(validated.event_budget.break_even_point),
      target: Math.round(totalExpectedRevenue),
      stretch: Math.round(totalExpectedRevenue * 1.2),
    },
    registration_targets: {
      minimum_registrations: Math.round(validated.expected_attendees * 0.7),
      target_registrations: validated.expected_attendees,
      stretch_registrations: Math.round(validated.expected_attendees * 1.15),
    },
    tier_breakdown: tierBreakdown,
    assumptions: [
      "과거 등록 패턴이 유사하게 적용됨",
      "시장 상황 변동 없음",
      "마케팅 효과 일정 유지",
    ],
    risks: [
      "경쟁 이벤트 일정 충돌",
      "경기 침체 영향",
      "조기 마감 시 추가 등록 불가",
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-017",
  taskName: "등록 재정 목표 설정",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 7.2.a",
  skill: "Skill 7: Manage Event Funding",
  subSkill: "7.2: Develop and Manage Registration Process",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
