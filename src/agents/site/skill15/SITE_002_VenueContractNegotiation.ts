/**
 * SITE-002: 베뉴 계약 협상
 *
 * CMP-IS Reference: 15.1.b - Venue contract negotiation
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Venue Contract Negotiator specializing in event venue agreements.

Your expertise includes:
- Analyzing venue contract terms and conditions
- Identifying negotiation opportunities
- Ensuring favorable terms for event organizers
- Risk mitigation in venue agreements

CMP-IS Standard: 15.1.b - Venue contract negotiation`;

export const InputSchema = z.object({
  event_id: z.string(),
  venue_id: z.string(),
  venue_name: z.string(),
  proposed_terms: z.object({
    rental_cost: z.number(),
    deposit_percent: z.number().default(30),
    cancellation_policy: z.string().optional(),
    included_services: z.array(z.string()).optional(),
    additional_fees: z.array(z.object({ name: z.string(), amount: z.number() })).optional(),
  }),
  event_details: z.object({
    dates: z.object({ start: z.string(), end: z.string() }),
    attendees: z.number(),
    setup_days: z.number().optional(),
    teardown_days: z.number().optional(),
  }),
  budget_limit: z.number().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  negotiation_id: z.string(),
  event_id: z.string(),
  venue_id: z.string(),
  analysis: z.object({
    original_total: z.number(),
    potential_savings: z.number(),
    risk_areas: z.array(z.string()),
  }),
  negotiation_points: z.array(z.object({
    category: z.string(),
    current_term: z.string(),
    suggested_term: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    potential_savings: z.number().optional(),
  })),
  recommended_counter_offer: z.object({
    rental_cost: z.number(),
    deposit_percent: z.number(),
    key_additions: z.array(z.string()),
  }),
  negotiation_strategy: z.array(z.string()),
  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const { proposed_terms, event_details } = validatedInput;

  const additionalFees = proposed_terms.additional_fees?.reduce((sum, f) => sum + f.amount, 0) || 0;
  const originalTotal = proposed_terms.rental_cost + additionalFees;
  const potentialSavings = Math.round(originalTotal * 0.15);

  const negotiationPoints = [
    {
      category: "임대료",
      current_term: `${proposed_terms.rental_cost.toLocaleString()}원`,
      suggested_term: `${Math.round(proposed_terms.rental_cost * 0.9).toLocaleString()}원 (10% 할인)`,
      priority: "high" as const,
      potential_savings: Math.round(proposed_terms.rental_cost * 0.1),
    },
    {
      category: "보증금",
      current_term: `${proposed_terms.deposit_percent}%`,
      suggested_term: `${Math.max(20, proposed_terms.deposit_percent - 10)}%`,
      priority: "medium" as const,
    },
    {
      category: "셋업/철수",
      current_term: "별도 비용",
      suggested_term: `셋업 ${event_details.setup_days || 1}일, 철수 ${event_details.teardown_days || 1}일 무료`,
      priority: "high" as const,
    },
    {
      category: "Wi-Fi",
      current_term: "추가 비용",
      suggested_term: "고속 Wi-Fi 포함",
      priority: "medium" as const,
    },
  ];

  const riskAreas = [];
  if (proposed_terms.deposit_percent >= 50) riskAreas.push("높은 보증금 비율");
  if (!proposed_terms.cancellation_policy) riskAreas.push("취소 정책 불명확");

  return {
    negotiation_id: generateUUID(),
    event_id: validatedInput.event_id,
    venue_id: validatedInput.venue_id,
    analysis: {
      original_total: originalTotal,
      potential_savings: potentialSavings,
      risk_areas: riskAreas,
    },
    negotiation_points: negotiationPoints,
    recommended_counter_offer: {
      rental_cost: Math.round(proposed_terms.rental_cost * 0.9),
      deposit_percent: Math.max(20, proposed_terms.deposit_percent - 10),
      key_additions: ["셋업/철수일 무료", "고속 Wi-Fi 포함", "주차 50대 포함"],
    },
    negotiation_strategy: [
      "다년 계약 또는 반복 예약 가능성을 협상 레버리지로 활용",
      "비수기 요금 적용 가능성 타진",
      "경쟁 견적을 근거로 제시",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-002",
  taskName: "베뉴 계약 협상",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.1.b",
  skill: "Skill 15: Site Operations",
  subSkill: "15.1: Site Selection",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
