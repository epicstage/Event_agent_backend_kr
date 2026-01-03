/**
 * SITE-017: 주차 및 교통 관리
 * CMP-IS Reference: 15.9.a - Parking and traffic management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Event Parking and Traffic Planner.`;

export const InputSchema = z.object({
  event_id: z.string(),
  attendee_count: z.number(),
  venue_parking_capacity: z.number(),
  vip_parking_needed: z.number().default(0),
  shuttle_service: z.boolean().default(false),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string(),
  event_id: z.string(),
  parking_plan: z.object({ total_spaces: z.number(), estimated_demand: z.number(), overflow_needed: z.boolean(), vip_reserved: z.number() }),
  traffic_flow: z.object({ entry_points: z.array(z.string()), exit_points: z.array(z.string()), peak_times: z.array(z.string()) }),
  shuttle_plan: z.object({ routes: z.array(z.object({ from: z.string(), to: z.string(), frequency_minutes: z.number() })) }).optional(),
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
  const estimatedDemand = Math.ceil(validatedInput.attendee_count * 0.4);

  return {
    plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    parking_plan: {
      total_spaces: validatedInput.venue_parking_capacity,
      estimated_demand: estimatedDemand,
      overflow_needed: estimatedDemand > validatedInput.venue_parking_capacity,
      vip_reserved: validatedInput.vip_parking_needed,
    },
    traffic_flow: {
      entry_points: ["Main Gate", "Side Gate"],
      exit_points: ["Main Gate", "Rear Exit"],
      peak_times: ["08:00-09:30", "17:00-18:30"],
    },
    shuttle_plan: validatedInput.shuttle_service ? {
      routes: [{ from: "지하철역", to: "행사장", frequency_minutes: 15 }],
    } : undefined,
    recommendations: estimatedDemand > validatedInput.venue_parking_capacity ? ["인근 주차장 협약 필요", "셔틀 서비스 권장"] : ["주차 안내 요원 배치"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-017",
  taskName: "주차 및 교통 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.9.a",
  skill: "Skill 15: Site Operations",
  subSkill: "15.9: Transportation",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
