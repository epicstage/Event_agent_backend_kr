/**
 * MTG-013: Exhibition Program Integration
 * CMP-IS Domain G - Skill 13
 */
import { z } from "zod";

export const MTG_013_InputSchema = z.object({
  event_id: z.string().uuid(),
  exhibition_area_sqm: z.number(),
  exhibitor_count: z.number(),
  exhibition_days: z.number(),
  theater_sessions: z.number().optional(),
});

export const MTG_013_OutputSchema = z.object({
  event_id: z.string(),
  exhibition_program: z.object({
    theater_schedule: z.array(z.object({ slot: z.string(), type: z.string(), duration: z.number() })),
    demo_zones: z.number(),
    poster_area_allocation: z.number(),
    guided_tours: z.object({ count: z.number(), duration: z.number() }),
  }),
  integration_points: z.array(z.object({ conference_session: z.string(), exhibition_link: z.string() })),
  recommendations: z.array(z.string()),
});

export type MTG_013_Input = z.infer<typeof MTG_013_InputSchema>;
export type MTG_013_Output = z.infer<typeof MTG_013_OutputSchema>;

export async function execute(input: MTG_013_Input): Promise<MTG_013_Output> {
  return {
    event_id: input.event_id,
    exhibition_program: {
      theater_schedule: Array.from({ length: input.theater_sessions || 4 }, (_, i) => ({
        slot: `${10 + i * 2}:00-${10 + i * 2 + 1}:00`,
        type: i % 2 === 0 ? "Product demo" : "Expert talk",
        duration: 45,
      })),
      demo_zones: Math.ceil(input.exhibitor_count / 10),
      poster_area_allocation: Math.round(input.exhibition_area_sqm * 0.1),
      guided_tours: { count: input.exhibition_days * 3, duration: 45 },
    },
    integration_points: [
      { conference_session: "Opening keynote", exhibition_link: "Exhibition grand opening follows" },
      { conference_session: "Networking breaks", exhibition_link: "Coffee served in exhibition hall" },
    ],
    recommendations: ["Schedule breaks to drive traffic", "Coordinate exhibitor presentations", "Offer prize draws"],
  };
}

export const MTG_013_ExhibitionProgram = {
  id: "MTG-013", name: "Exhibition Program Integration", description: "전시 프로그램 통합",
  inputSchema: MTG_013_InputSchema, outputSchema: MTG_013_OutputSchema, execute,
  tags: ["exhibition", "trade show"], domain: "meetings", skill: 13, taskType: "AI" as const,
};
