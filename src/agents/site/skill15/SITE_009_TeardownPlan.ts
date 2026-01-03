/**
 * SITE-009: 철수 계획
 * CMP-IS Reference: 15.5.b - Teardown planning
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Event Teardown Planner.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_end_datetime: z.string(),
  teardown_hours_available: z.number(),
  items_to_remove: z.array(z.object({ item: z.string(), category: z.string(), priority: z.enum(["high", "medium", "low"]) })),
  venue_requirements: z.object({ must_clear_by: z.string(), special_instructions: z.array(z.string()).optional() }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string(),
  event_id: z.string(),
  teardown_sequence: z.array(z.object({ order: z.number(), item: z.string(), estimated_time: z.string(), team: z.string() })),
  timeline: z.object({ start: z.string(), end: z.string(), total_hours: z.number() }),
  logistics: z.object({ trucks_needed: z.number(), personnel_needed: z.number() }),
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
  const items = [...validatedInput.items_to_remove].sort((a, b) => {
    const priority = { high: 0, medium: 1, low: 2 };
    return priority[a.priority] - priority[b.priority];
  });

  return {
    plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    teardown_sequence: items.map((item, i) => ({
      order: i + 1,
      item: item.item,
      estimated_time: "1시간",
      team: item.category,
    })),
    timeline: {
      start: validatedInput.event_end_datetime,
      end: new Date(new Date(validatedInput.event_end_datetime).getTime() + validatedInput.teardown_hours_available * 60 * 60 * 1000).toISOString(),
      total_hours: validatedInput.teardown_hours_available,
    },
    logistics: {
      trucks_needed: Math.ceil(items.length / 10),
      personnel_needed: Math.ceil(items.length / 5),
    },
    recommendations: ["렌탈 장비 우선 반납", "손상 여부 확인 후 반출"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-009",
  taskName: "철수 계획",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.5.b",
  skill: "Skill 15: Site Operations",
  subSkill: "15.5: Setup & Teardown",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
