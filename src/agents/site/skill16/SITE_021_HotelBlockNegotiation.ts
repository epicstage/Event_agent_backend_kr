/**
 * SITE-021: 호텔 블록 협상
 * CMP-IS Reference: 16.1.a - Hotel block negotiation
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Hotel Block Negotiation Specialist.`;

export const InputSchema = z.object({
  event_id: z.string(),
  hotel_id: z.string(),
  hotel_name: z.string(),
  rooms_needed: z.number(),
  check_in_date: z.string(),
  check_out_date: z.string(),
  proposed_rates: z.object({ single: z.number(), double: z.number() }).optional(),
  budget_per_night: z.number().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  negotiation_id: z.string(),
  event_id: z.string(),
  hotel_id: z.string(),
  block_terms: z.object({ rooms_blocked: z.number(), cutoff_date: z.string(), attrition_rate: z.number(), cancellation_policy: z.string() }),
  negotiated_rates: z.object({ single: z.number(), double: z.number(), includes_breakfast: z.boolean() }),
  savings_analysis: z.object({ rack_rate_total: z.number(), negotiated_total: z.number(), savings_percent: z.number() }),
  negotiation_points: z.array(z.string()),
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
  const nights = Math.ceil((new Date(validatedInput.check_out_date).getTime() - new Date(validatedInput.check_in_date).getTime()) / (1000 * 60 * 60 * 24));
  const proposedSingle = validatedInput.proposed_rates?.single || 200000;
  const negotiatedSingle = Math.round(proposedSingle * 0.85);
  const rackTotal = proposedSingle * validatedInput.rooms_needed * nights;
  const negotiatedTotal = negotiatedSingle * validatedInput.rooms_needed * nights;

  return {
    negotiation_id: generateUUID(),
    event_id: validatedInput.event_id,
    hotel_id: validatedInput.hotel_id,
    block_terms: {
      rooms_blocked: validatedInput.rooms_needed,
      cutoff_date: new Date(new Date(validatedInput.check_in_date).getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      attrition_rate: 20,
      cancellation_policy: "14일 전 무료 취소",
    },
    negotiated_rates: { single: negotiatedSingle, double: Math.round(negotiatedSingle * 1.2), includes_breakfast: true },
    savings_analysis: { rack_rate_total: rackTotal, negotiated_total: negotiatedTotal, savings_percent: 15 },
    negotiation_points: ["조식 포함 협상", "무료 업그레이드 요청", "주차 할인 요청"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-021",
  taskName: "호텔 블록 협상",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.1.a",
  skill: "Skill 16: Housing Management",
  subSkill: "16.1: Hotel Contracting",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
