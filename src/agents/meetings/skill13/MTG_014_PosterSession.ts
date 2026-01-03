/**
 * MTG-014: Poster Session Management
 * CMP-IS Domain G - Skill 13
 */
import { z } from "zod";

export const MTG_014_InputSchema = z.object({
  event_id: z.string().uuid(),
  poster_count: z.number(),
  session_duration_minutes: z.number(),
  available_space_sqm: z.number(),
});

export const MTG_014_OutputSchema = z.object({
  event_id: z.string(),
  poster_session: z.object({
    layout: z.object({ rows: z.number(), boards_per_row: z.number(), board_size: z.string() }),
    schedule: z.object({ setup_time: z.string(), presentation_time: z.string(), teardown_time: z.string() }),
    presenter_guidelines: z.array(z.string()),
    judging: z.object({ judges_needed: z.number(), criteria: z.array(z.string()) }).optional(),
  }),
  logistics: z.array(z.object({ item: z.string(), quantity: z.number() })),
  recommendations: z.array(z.string()),
});

export type MTG_014_Input = z.infer<typeof MTG_014_InputSchema>;
export type MTG_014_Output = z.infer<typeof MTG_014_OutputSchema>;

export async function execute(input: MTG_014_Input): Promise<MTG_014_Output> {
  const boardsPerRow = 10;
  const rows = Math.ceil(input.poster_count / boardsPerRow);
  return {
    event_id: input.event_id,
    poster_session: {
      layout: { rows, boards_per_row: boardsPerRow, board_size: "A0 (841x1189mm)" },
      schedule: {
        setup_time: "08:00-09:00",
        presentation_time: `${Math.floor(input.session_duration_minutes / 2)} min mandatory attendance`,
        teardown_time: "17:00-18:00",
      },
      presenter_guidelines: ["Arrive 10 min before session", "Prepare 3-min elevator pitch", "Bring business cards"],
      judging: { judges_needed: Math.ceil(input.poster_count / 10), criteria: ["Scientific merit", "Visual design", "Presentation"] },
    },
    logistics: [
      { item: "Poster boards", quantity: input.poster_count },
      { item: "Push pins (pack)", quantity: Math.ceil(input.poster_count / 5) },
      { item: "Number labels", quantity: input.poster_count },
    ],
    recommendations: ["Group by topic area", "Provide poster tubes for storage", "Award best poster prizes"],
  };
}

export const MTG_014_PosterSession = {
  id: "MTG-014", name: "Poster Session Management", description: "포스터 세션 관리",
  inputSchema: MTG_014_InputSchema, outputSchema: MTG_014_OutputSchema, execute,
  tags: ["poster", "academic"], domain: "meetings", skill: 13, taskType: "AI" as const,
};
