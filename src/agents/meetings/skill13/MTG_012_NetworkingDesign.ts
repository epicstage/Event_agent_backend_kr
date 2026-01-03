/**
 * MTG-012: Networking Session Design
 * CMP-IS Domain G - Skill 13
 */
import { z } from "zod";

export const MTG_012_InputSchema = z.object({
  event_id: z.string().uuid(),
  attendee_count: z.number(),
  attendee_types: z.array(z.string()),
  networking_goals: z.array(z.string()),
  available_time_minutes: z.number(),
});

export const MTG_012_OutputSchema = z.object({
  event_id: z.string(),
  networking_plan: z.object({
    format: z.string(),
    activities: z.array(z.object({ name: z.string(), duration: z.number(), description: z.string() })),
    facilitation: z.object({ facilitators_needed: z.number(), tools: z.array(z.string()) }),
    space_setup: z.object({ layout: z.string(), stations: z.number() }),
  }),
  expected_connections: z.number(),
  recommendations: z.array(z.string()),
});

export type MTG_012_Input = z.infer<typeof MTG_012_InputSchema>;
export type MTG_012_Output = z.infer<typeof MTG_012_OutputSchema>;

export async function execute(input: MTG_012_Input): Promise<MTG_012_Output> {
  const stations = Math.ceil(input.attendee_count / 20);
  return {
    event_id: input.event_id,
    networking_plan: {
      format: input.attendee_count > 200 ? "Structured networking" : "Open networking with icebreakers",
      activities: [
        { name: "Speed networking", duration: 20, description: "3-minute rotations" },
        { name: "Topic tables", duration: 30, description: "Discussion groups by interest" },
        { name: "Open mingling", duration: input.available_time_minutes - 50, description: "Free-form networking" },
      ],
      facilitation: { facilitators_needed: Math.ceil(stations / 3), tools: ["Name tags with interests", "Topic signs", "Timer/bell"] },
      space_setup: { layout: "cocktail with stations", stations },
    },
    expected_connections: Math.ceil(input.attendee_count * 0.3),
    recommendations: ["Provide conversation starters", "Use matchmaking app", "Include refreshments"],
  };
}

export const MTG_012_NetworkingDesign = {
  id: "MTG-012", name: "Networking Session Design", description: "네트워킹 세션 설계",
  inputSchema: MTG_012_InputSchema, outputSchema: MTG_012_OutputSchema, execute,
  tags: ["networking", "engagement"], domain: "meetings", skill: 13, taskType: "AI" as const,
};
