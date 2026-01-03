/**
 * MTG-011: Hybrid Program Design
 * CMP-IS Domain G - Skill 13
 */
import { z } from "zod";

export const MTG_011_InputSchema = z.object({
  event_id: z.string().uuid(),
  in_person_attendees: z.number(),
  virtual_attendees: z.number(),
  sessions_count: z.number(),
  timezone_coverage: z.array(z.string()),
});

export const MTG_011_OutputSchema = z.object({
  event_id: z.string(),
  hybrid_design: z.object({
    streaming_sessions: z.number(),
    interactive_sessions: z.number(),
    on_demand_content: z.number(),
    platform_requirements: z.array(z.string()),
    engagement_features: z.array(z.string()),
  }),
  timezone_schedule: z.array(z.object({ timezone: z.string(), optimal_time: z.string() })),
  technical_requirements: z.array(z.object({ item: z.string(), quantity: z.number() })),
  recommendations: z.array(z.string()),
});

export type MTG_011_Input = z.infer<typeof MTG_011_InputSchema>;
export type MTG_011_Output = z.infer<typeof MTG_011_OutputSchema>;

export async function execute(input: MTG_011_Input): Promise<MTG_011_Output> {
  return {
    event_id: input.event_id,
    hybrid_design: {
      streaming_sessions: Math.ceil(input.sessions_count * 0.8),
      interactive_sessions: Math.ceil(input.sessions_count * 0.5),
      on_demand_content: input.sessions_count,
      platform_requirements: ["HD streaming", "Chat", "Q&A", "Polling", "Breakout rooms", "Networking lounge"],
      engagement_features: ["Live polls", "Virtual networking", "Digital swag bag", "Gamification"],
    },
    timezone_schedule: input.timezone_coverage.map(tz => ({ timezone: tz, optimal_time: "09:00-17:00 local" })),
    technical_requirements: [
      { item: "Streaming encoders", quantity: Math.ceil(input.sessions_count / 4) },
      { item: "PTZ cameras", quantity: Math.ceil(input.sessions_count / 2) },
      { item: "Audio mixers", quantity: 2 },
    ],
    recommendations: ["Test platform 2 weeks before", "Assign virtual moderators", "Create engagement playbook"],
  };
}

export const MTG_011_HybridProgram = {
  id: "MTG-011", name: "Hybrid Program Design", description: "하이브리드 프로그램 설계",
  inputSchema: MTG_011_InputSchema, outputSchema: MTG_011_OutputSchema, execute,
  tags: ["hybrid", "virtual", "streaming"], domain: "meetings", skill: 13, taskType: "AI" as const,
};
