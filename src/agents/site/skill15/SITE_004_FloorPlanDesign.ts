/**
 * SITE-004: 플로어 플랜 설계
 * CMP-IS Reference: 15.2.a - Floor plan design
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Floor Plan Designer for events.`;

export const InputSchema = z.object({
  event_id: z.string(),
  venue_id: z.string(),
  venue_dimensions: z.object({ length_m: z.number(), width_m: z.number(), height_m: z.number().optional() }),
  attendee_count: z.number(),
  setup_style: z.enum(["theater", "classroom", "banquet", "reception", "u_shape", "boardroom", "exhibition"]),
  required_areas: z.array(z.object({ name: z.string(), type: z.string(), size_sqm: z.number().optional() })),
  accessibility_requirements: z.boolean().default(true),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  design_id: z.string(),
  event_id: z.string(),
  floor_plan: z.object({
    total_area_sqm: z.number(),
    usable_area_sqm: z.number(),
    areas: z.array(z.object({ name: z.string(), location: z.string(), size_sqm: z.number() })),
  }),
  capacity_analysis: z.object({ max_capacity: z.number(), recommended_capacity: z.number(), per_person_sqm: z.number() }),
  flow_analysis: z.object({ entry_points: z.array(z.string()), exit_routes: z.array(z.string()), bottlenecks: z.array(z.string()) }),
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
  const totalArea = validatedInput.venue_dimensions.length_m * validatedInput.venue_dimensions.width_m;
  const usableArea = totalArea * 0.85;

  return {
    design_id: generateUUID(),
    event_id: validatedInput.event_id,
    floor_plan: {
      total_area_sqm: totalArea,
      usable_area_sqm: usableArea,
      areas: validatedInput.required_areas.map((a, i) => ({
        name: a.name,
        location: `Zone ${i + 1}`,
        size_sqm: a.size_sqm || Math.round(usableArea / validatedInput.required_areas.length),
      })),
    },
    capacity_analysis: {
      max_capacity: Math.floor(usableArea / 1.5),
      recommended_capacity: Math.floor(usableArea / 2),
      per_person_sqm: 2,
    },
    flow_analysis: {
      entry_points: ["Main Entrance", "Side Entrance"],
      exit_routes: ["Emergency Exit A", "Emergency Exit B"],
      bottlenecks: ["Registration Area"],
    },
    recommendations: ["등록 구역 확장 권장", "비상 통로 표시 강화"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-004",
  taskName: "플로어 플랜 설계",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.2.a",
  skill: "Skill 15: Site Operations",
  subSkill: "15.2: Space Planning",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
