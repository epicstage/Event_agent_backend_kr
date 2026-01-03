/**
 * MTG-032: Speaker Database Management
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_032_InputSchema = z.object({
  event_id: z.string().uuid(),
  action: z.enum(["search", "add", "update", "analyze"]),
  search_criteria: z.object({
    expertise: z.array(z.string()).optional(),
    location: z.string().optional(),
    tier: z.enum(["A", "B", "C"]).optional(),
    availability: z.boolean().optional(),
  }).optional(),
  speaker_data: z.object({
    name: z.string(),
    expertise: z.array(z.string()),
    bio: z.string(),
    past_events: z.number(),
    avg_rating: z.number(),
  }).optional(),
});

export const MTG_032_OutputSchema = z.object({
  event_id: z.string(),
  database_result: z.object({
    action_performed: z.string(),
    matches: z.array(z.object({
      speaker_id: z.string(),
      name: z.string(),
      expertise: z.array(z.string()),
      tier: z.string(),
      availability: z.string(),
      rating: z.number(),
      events_count: z.number(),
    })).optional(),
    analytics: z.object({
      total_speakers: z.number(),
      by_tier: z.record(z.number()),
      by_expertise: z.record(z.number()),
      avg_rating: z.number(),
    }).optional(),
    record_updated: z.boolean().optional(),
  }),
  database_health: z.object({
    last_updated: z.string(),
    completeness: z.number(),
    stale_records: z.number(),
  }),
  recommendations: z.array(z.string()),
});

export type MTG_032_Input = z.infer<typeof MTG_032_InputSchema>;
export type MTG_032_Output = z.infer<typeof MTG_032_OutputSchema>;

export async function execute(input: MTG_032_Input): Promise<MTG_032_Output> {
  const mockMatches = [
    { speaker_id: "SPK-001", name: "Dr. Jane Smith", expertise: ["AI", "Machine Learning"], tier: "A", availability: "Available", rating: 4.8, events_count: 15 },
    { speaker_id: "SPK-002", name: "John Chen", expertise: ["Cloud", "DevOps"], tier: "B", availability: "Available", rating: 4.5, events_count: 8 },
    { speaker_id: "SPK-003", name: "Maria Garcia", expertise: ["Leadership", "Strategy"], tier: "A", availability: "Limited", rating: 4.9, events_count: 22 },
  ];

  return {
    event_id: input.event_id,
    database_result: {
      action_performed: input.action,
      matches: input.action === "search" ? mockMatches.filter(s =>
        !input.search_criteria?.expertise || input.search_criteria.expertise.some(e => s.expertise.includes(e))
      ) : undefined,
      analytics: input.action === "analyze" ? {
        total_speakers: 245,
        by_tier: { "A": 25, "B": 80, "C": 140 },
        by_expertise: { "Technology": 85, "Business": 70, "Leadership": 45, "Innovation": 45 },
        avg_rating: 4.2,
      } : undefined,
      record_updated: input.action === "add" || input.action === "update" ? true : undefined,
    },
    database_health: {
      last_updated: new Date().toISOString().split("T")[0],
      completeness: 78,
      stale_records: 23,
    },
    recommendations: [
      "Update speaker availability quarterly",
      "Collect feedback after each event",
      "Archive speakers inactive for 2+ years",
      "Tag speakers with event types (keynote, panel, etc.)",
      "Track diversity metrics",
    ],
  };
}

export const MTG_032_SpeakerDatabase = {
  id: "MTG-032", name: "Speaker Database Management", description: "연사 데이터베이스 관리",
  inputSchema: MTG_032_InputSchema, outputSchema: MTG_032_OutputSchema, execute,
  tags: ["speaker", "database", "management"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
