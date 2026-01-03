/**
 * SITE-033: 사후 정산
 * CMP-IS Reference: 16.5.b - Post-event reconciliation
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Post-Event Housing Reconciliation Specialist.`;

export const InputSchema = z.object({
  event_id: z.string(),
  hotel_blocks: z.array(z.object({
    hotel_id: z.string(),
    hotel_name: z.string(),
    contracted_rooms: z.number(),
    actual_rooms_used: z.number(),
    contracted_rate: z.number(),
    actual_charges: z.number(),
    attrition_penalty: z.number().optional(),
  })),
  master_account_charges: z.array(z.object({ category: z.string(), amount: z.number() })).optional(),
  guest_incidentals: z.number().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  reconciliation_id: z.string(),
  event_id: z.string(),
  overall_summary: z.object({
    total_contracted_value: z.number(),
    total_actual_charges: z.number(),
    variance: z.number(),
    variance_percent: z.number(),
  }),
  by_hotel: z.array(z.object({
    hotel_name: z.string(),
    rooms_contracted: z.number(),
    rooms_used: z.number(),
    expected_cost: z.number(),
    actual_cost: z.number(),
    variance: z.number(),
    attrition_penalty: z.number(),
    status: z.string(),
  })),
  disputed_items: z.array(z.object({ hotel: z.string(), item: z.string(), expected: z.number(), actual: z.number() })),
  action_items: z.array(z.object({ action: z.string(), responsible: z.string(), deadline: z.string() })),
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

  const byHotel = validatedInput.hotel_blocks.map(h => {
    const expectedCost = h.contracted_rooms * h.contracted_rate * 3; // 평균 3박 가정
    const variance = h.actual_charges - expectedCost;
    return {
      hotel_name: h.hotel_name,
      rooms_contracted: h.contracted_rooms,
      rooms_used: h.actual_rooms_used,
      expected_cost: expectedCost,
      actual_cost: h.actual_charges,
      variance,
      attrition_penalty: h.attrition_penalty || 0,
      status: Math.abs(variance) < expectedCost * 0.05 ? "approved" : "review_required",
    };
  });

  const totalContracted = byHotel.reduce((sum, h) => sum + h.expected_cost, 0);
  const totalActual = byHotel.reduce((sum, h) => sum + h.actual_cost + h.attrition_penalty, 0);

  const disputed = byHotel
    .filter(h => h.status === "review_required")
    .map(h => ({
      hotel: h.hotel_name,
      item: "총 숙박비",
      expected: h.expected_cost,
      actual: h.actual_cost,
    }));

  const actionItems = disputed.map(d => ({
    action: `${d.hotel} 청구서 검토 및 협의`,
    responsible: "Housing Manager",
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  }));

  return {
    reconciliation_id: generateUUID(),
    event_id: validatedInput.event_id,
    overall_summary: {
      total_contracted_value: totalContracted,
      total_actual_charges: totalActual,
      variance: totalActual - totalContracted,
      variance_percent: Math.round(((totalActual - totalContracted) / totalContracted) * 100),
    },
    by_hotel: byHotel,
    disputed_items: disputed,
    action_items: actionItems,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-033",
  taskName: "사후 정산",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 16.5.b",
  skill: "Skill 16: Housing Management",
  subSkill: "16.5: Financial Management",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
