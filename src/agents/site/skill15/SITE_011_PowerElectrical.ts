/**
 * SITE-011: 전력/전기 관리
 * CMP-IS Reference: 15.7.a - Power and electrical management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Event Power and Electrical Planner.`;

export const InputSchema = z.object({
  event_id: z.string(),
  venue_power_capacity: z.object({ total_amps: z.number(), voltage: z.number().default(220) }),
  equipment_requirements: z.array(z.object({ item: z.string(), watts: z.number(), quantity: z.number() })),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string(),
  event_id: z.string(),
  power_analysis: z.object({ total_required_watts: z.number(), required_amps: z.number(), available_amps: z.number(), utilization_percent: z.number() }),
  distribution_plan: z.array(z.object({ zone: z.string(), items: z.array(z.string()), watts: z.number(), circuit: z.number() })),
  backup_requirements: z.object({ generator_needed: z.boolean(), ups_needed: z.boolean() }),
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
  const totalWatts = validatedInput.equipment_requirements.reduce((sum, e) => sum + e.watts * e.quantity, 0);
  const requiredAmps = totalWatts / validatedInput.venue_power_capacity.voltage;
  const utilization = (requiredAmps / validatedInput.venue_power_capacity.total_amps) * 100;

  return {
    plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    power_analysis: {
      total_required_watts: totalWatts,
      required_amps: Math.round(requiredAmps),
      available_amps: validatedInput.venue_power_capacity.total_amps,
      utilization_percent: Math.round(utilization),
    },
    distribution_plan: [{ zone: "Main Hall", items: validatedInput.equipment_requirements.map(e => e.item), watts: totalWatts, circuit: 1 }],
    backup_requirements: { generator_needed: utilization > 80, ups_needed: true },
    recommendations: utilization > 80 ? ["추가 전력 확보 필요", "발전기 대기"] : ["현재 용량 적정"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-011",
  taskName: "전력/전기 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.7.a",
  skill: "Skill 15: Site Operations",
  subSkill: "15.7: Technical Infrastructure",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
