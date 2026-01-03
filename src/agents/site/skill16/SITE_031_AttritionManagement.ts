/**
 * SITE-031: 감실 관리 (Attrition Management)
 * CMP-IS Reference: 16.4.b - Attrition management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Room Block Attrition Manager.`;

export const InputSchema = z.object({
  event_id: z.string(),
  hotel_blocks: z.array(z.object({
    hotel_id: z.string(),
    hotel_name: z.string(),
    rooms_blocked: z.number(),
    rooms_picked_up: z.number(),
    attrition_allowance_percent: z.number(),
    cutoff_date: z.string(),
    penalty_per_room: z.number(),
  })),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string(),
  event_id: z.string(),
  overall_status: z.object({
    total_blocked: z.number(),
    total_picked_up: z.number(),
    pickup_rate: z.number(),
    at_risk: z.boolean(),
  }),
  by_hotel: z.array(z.object({
    hotel_name: z.string(),
    blocked: z.number(),
    picked_up: z.number(),
    minimum_required: z.number(),
    shortfall: z.number(),
    potential_penalty: z.number(),
    days_until_cutoff: z.number(),
    status: z.string(),
  })),
  mitigation_strategies: z.array(z.object({ hotel: z.string(), strategy: z.string(), priority: z.string() })),
  financial_exposure: z.object({ total_potential_penalty: z.number(), hotels_at_risk: z.number() }),
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
  const now = new Date();

  const byHotel = validatedInput.hotel_blocks.map(h => {
    const minimumRequired = Math.ceil(h.rooms_blocked * (1 - h.attrition_allowance_percent / 100));
    const shortfall = Math.max(0, minimumRequired - h.rooms_picked_up);
    const daysUntil = Math.ceil((new Date(h.cutoff_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const pickupRate = Math.round((h.rooms_picked_up / h.rooms_blocked) * 100);

    return {
      hotel_name: h.hotel_name,
      blocked: h.rooms_blocked,
      picked_up: h.rooms_picked_up,
      minimum_required: minimumRequired,
      shortfall,
      potential_penalty: shortfall * h.penalty_per_room,
      days_until_cutoff: daysUntil,
      status: shortfall === 0 ? "safe" : daysUntil < 7 ? "critical" : "warning",
    };
  });

  const totalBlocked = byHotel.reduce((sum, h) => sum + h.blocked, 0);
  const totalPickedUp = byHotel.reduce((sum, h) => sum + h.picked_up, 0);
  const totalPenalty = byHotel.reduce((sum, h) => sum + h.potential_penalty, 0);
  const hotelsAtRisk = byHotel.filter(h => h.shortfall > 0).length;

  const strategies = byHotel
    .filter(h => h.shortfall > 0)
    .map(h => ({
      hotel: h.hotel_name,
      strategy: h.days_until_cutoff < 7
        ? "호텔과 블록 축소 재협상"
        : h.shortfall > 10
          ? "참가자 대상 적극적 예약 유도 캠페인"
          : "일반 예약자 해당 호텔로 유도",
      priority: h.status === "critical" ? "high" : "medium",
    }));

  return {
    analysis_id: generateUUID(),
    event_id: validatedInput.event_id,
    overall_status: {
      total_blocked: totalBlocked,
      total_picked_up: totalPickedUp,
      pickup_rate: Math.round((totalPickedUp / totalBlocked) * 100),
      at_risk: hotelsAtRisk > 0,
    },
    by_hotel: byHotel,
    mitigation_strategies: strategies,
    financial_exposure: {
      total_potential_penalty: totalPenalty,
      hotels_at_risk: hotelsAtRisk,
    },
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-031",
  taskName: "감실 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.4.b",
  skill: "Skill 16: Housing Management",
  subSkill: "16.4: Budget Control",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
