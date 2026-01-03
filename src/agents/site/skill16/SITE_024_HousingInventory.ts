/**
 * SITE-024: 숙박 인벤토리 관리
 * CMP-IS Reference: 16.3.a - Housing inventory management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Housing Inventory Manager.`;

export const InputSchema = z.object({
  event_id: z.string(),
  hotel_blocks: z.array(z.object({ hotel_id: z.string(), hotel_name: z.string(), rooms_blocked: z.number(), rooms_reserved: z.number(), cutoff_date: z.string() })),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  inventory_id: z.string(),
  event_id: z.string(),
  summary: z.object({ total_blocked: z.number(), total_reserved: z.number(), total_available: z.number(), utilization_rate: z.number() }),
  by_hotel: z.array(z.object({ hotel: z.string(), blocked: z.number(), reserved: z.number(), available: z.number(), days_until_cutoff: z.number() })),
  alerts: z.array(z.object({ type: z.string(), message: z.string(), hotel: z.string() })),
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
  const now = new Date();
  const totalBlocked = validatedInput.hotel_blocks.reduce((sum, h) => sum + h.rooms_blocked, 0);
  const totalReserved = validatedInput.hotel_blocks.reduce((sum, h) => sum + h.rooms_reserved, 0);

  const byHotel = validatedInput.hotel_blocks.map(h => {
    const cutoff = new Date(h.cutoff_date);
    const daysUntil = Math.ceil((cutoff.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      hotel: h.hotel_name,
      blocked: h.rooms_blocked,
      reserved: h.rooms_reserved,
      available: h.rooms_blocked - h.rooms_reserved,
      days_until_cutoff: daysUntil,
    };
  });

  const alerts = byHotel.filter(h => h.days_until_cutoff < 7 && h.available > h.blocked * 0.3).map(h => ({
    type: "cutoff_warning",
    message: `컷오프 ${h.days_until_cutoff}일 전, 미예약 ${h.available}실`,
    hotel: h.hotel,
  }));

  return {
    inventory_id: generateUUID(),
    event_id: validatedInput.event_id,
    summary: {
      total_blocked: totalBlocked,
      total_reserved: totalReserved,
      total_available: totalBlocked - totalReserved,
      utilization_rate: Math.round((totalReserved / totalBlocked) * 100),
    },
    by_hotel: byHotel,
    alerts,
    recommendations: alerts.length > 0 ? ["미예약 객실 마케팅 강화", "호텔과 리릴리스 협의"] : [],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-024",
  taskName: "숙박 인벤토리 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.3.a",
  skill: "Skill 16: Housing Management",
  subSkill: "16.3: Inventory Control",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
