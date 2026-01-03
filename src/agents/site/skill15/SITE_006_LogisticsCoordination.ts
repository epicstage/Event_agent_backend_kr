/**
 * SITE-006: 물류 조정
 * CMP-IS Reference: 15.4.a - Logistics coordination
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Event Logistics Coordinator.`;

export const InputSchema = z.object({
  event_id: z.string(),
  venue_id: z.string(),
  deliveries: z.array(z.object({
    item_name: z.string(),
    supplier: z.string(),
    quantity: z.number(),
    delivery_date: z.string(),
    delivery_time: z.string().optional(),
  })),
  loading_dock_info: z.object({ docks_available: z.number(), hours: z.string() }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  coordination_id: z.string(),
  event_id: z.string(),
  delivery_schedule: z.array(z.object({ slot: z.string(), supplier: z.string(), items: z.string(), dock: z.number() })),
  logistics_requirements: z.object({ equipment_needed: z.array(z.string()), personnel_needed: z.number() }),
  potential_conflicts: z.array(z.string()),
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
  const schedule = validatedInput.deliveries.map((d, i) => ({
    slot: `${d.delivery_date} ${d.delivery_time || "09:00"}`,
    supplier: d.supplier,
    items: `${d.item_name} x${d.quantity}`,
    dock: (i % (validatedInput.loading_dock_info?.docks_available || 2)) + 1,
  }));

  return {
    coordination_id: generateUUID(),
    event_id: validatedInput.event_id,
    delivery_schedule: schedule,
    logistics_requirements: {
      equipment_needed: ["지게차", "핸드카트", "팔레트"],
      personnel_needed: Math.ceil(validatedInput.deliveries.length / 3),
    },
    potential_conflicts: schedule.length > 5 ? ["배송 시간대 중복 가능성"] : [],
    recommendations: ["배송 시간대 분산 권장", "대형 장비 우선 배송"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-006",
  taskName: "물류 조정",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.4.a",
  skill: "Skill 15: Site Operations",
  subSkill: "15.4: Logistics",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
