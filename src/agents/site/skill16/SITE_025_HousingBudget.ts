/**
 * SITE-025: 숙박 예산 관리
 * CMP-IS Reference: 16.4.a - Housing budget management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Housing Budget Manager.`;

export const InputSchema = z.object({
  event_id: z.string(),
  housing_budget: z.number(),
  hotel_blocks: z.array(z.object({ hotel_name: z.string(), rate_per_night: z.number(), rooms: z.number(), nights: z.number() })),
  covered_by_organizer: z.array(z.object({ guest_type: z.string(), count: z.number() })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  budget_id: z.string(),
  event_id: z.string(),
  budget_analysis: z.object({ total_budget: z.number(), estimated_cost: z.number(), variance: z.number(), within_budget: z.boolean() }),
  cost_breakdown: z.array(z.object({ hotel: z.string(), cost: z.number(), rooms: z.number(), nights: z.number() })),
  organizer_liability: z.object({ total_rooms: z.number(), total_cost: z.number() }),
  recommendations: z.array(z.string()),
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
  const costBreakdown = validatedInput.hotel_blocks.map(h => ({
    hotel: h.hotel_name,
    cost: h.rate_per_night * h.rooms * h.nights,
    rooms: h.rooms,
    nights: h.nights,
  }));
  const estimatedCost = costBreakdown.reduce((sum, c) => sum + c.cost, 0);
  const organizerRooms = validatedInput.covered_by_organizer?.reduce((sum, g) => sum + g.count, 0) || 0;
  const avgRate = estimatedCost / validatedInput.hotel_blocks.reduce((sum, h) => sum + h.rooms * h.nights, 0);

  return {
    budget_id: generateUUID(),
    event_id: validatedInput.event_id,
    budget_analysis: {
      total_budget: validatedInput.housing_budget,
      estimated_cost: estimatedCost,
      variance: validatedInput.housing_budget - estimatedCost,
      within_budget: estimatedCost <= validatedInput.housing_budget,
    },
    cost_breakdown: costBreakdown,
    organizer_liability: {
      total_rooms: organizerRooms,
      total_cost: organizerRooms * avgRate * 3, // 평균 3박 가정
    },
    recommendations: estimatedCost > validatedInput.housing_budget ? ["저가 호텔 추가 확보", "VIP 외 자비 부담 검토"] : ["예산 내 운영 가능"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-025",
  taskName: "숙박 예산 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.4.a",
  skill: "Skill 16: Housing Management",
  subSkill: "16.4: Budget Control",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
