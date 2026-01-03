/**
 * MTG-017: Keynote Strategy
 * CMP-IS Domain G - Skill 13
 */
import { z } from "zod";

export const MTG_017_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_theme: z.string(),
  keynote_slots: z.number().min(1).max(5).default(2),
  audience_profile: z.object({
    size: z.number(),
    seniority_mix: z.record(z.number()),
    industry_focus: z.array(z.string()),
  }),
  budget_per_keynote: z.number().optional(),
});

export const MTG_017_OutputSchema = z.object({
  event_id: z.string(),
  keynote_strategy: z.object({
    positioning: z.array(z.object({ slot: z.number(), timing: z.string(), purpose: z.string(), ideal_profile: z.string() })),
    speaker_criteria: z.array(z.object({ criterion: z.string(), weight: z.number() })),
    topic_themes: z.array(z.object({ theme: z.string(), relevance: z.string() })),
    format_options: z.array(z.object({ format: z.string(), duration: z.number(), best_for: z.string() })),
  }),
  speaker_sourcing: z.object({
    channels: z.array(z.string()),
    outreach_timeline: z.string(),
    backup_strategy: z.string(),
  }),
  production_requirements: z.array(z.object({ item: z.string(), importance: z.enum(["critical", "important", "nice_to_have"]) })),
  recommendations: z.array(z.string()),
});

export type MTG_017_Input = z.infer<typeof MTG_017_InputSchema>;
export type MTG_017_Output = z.infer<typeof MTG_017_OutputSchema>;

export async function execute(input: MTG_017_Input): Promise<MTG_017_Output> {
  const slots = [];
  for (let i = 1; i <= input.keynote_slots; i++) {
    slots.push({
      slot: i,
      timing: i === 1 ? "Opening Day Morning" : i === input.keynote_slots ? "Closing Session" : `Day ${i} Morning`,
      purpose: i === 1 ? "Set the tone, inspire" : i === input.keynote_slots ? "Call to action, send-off" : "Deep dive, challenge thinking",
      ideal_profile: i === 1 ? "Industry visionary" : i === input.keynote_slots ? "Motivational leader" : "Subject matter expert",
    });
  }

  return {
    event_id: input.event_id,
    keynote_strategy: {
      positioning: slots,
      speaker_criteria: [
        { criterion: "Relevance to theme", weight: 30 },
        { criterion: "Speaking ability", weight: 25 },
        { criterion: "Industry recognition", weight: 20 },
        { criterion: "Audience draw", weight: 15 },
        { criterion: "Availability", weight: 10 },
      ],
      topic_themes: [
        { theme: `Future of ${input.event_theme}`, relevance: "Forward-looking perspective" },
        { theme: "Innovation and disruption", relevance: "Challenges status quo" },
        { theme: "Leadership in change", relevance: "Actionable insights" },
      ],
      format_options: [
        { format: "Traditional keynote", duration: 45, best_for: "Thought leadership" },
        { format: "Fireside chat", duration: 30, best_for: "Intimate, conversational" },
        { format: "TED-style", duration: 18, best_for: "Punchy, memorable" },
      ],
    },
    speaker_sourcing: {
      channels: ["Speaker bureaus", "Industry associations", "Past attendee referrals", "LinkedIn/social research", "Author/book circuit"],
      outreach_timeline: "Begin 6-9 months before event",
      backup_strategy: "Maintain shortlist of 3 alternatives per slot",
    },
    production_requirements: [
      { item: "Professional AV crew", importance: "critical" },
      { item: "Confidence monitor", importance: "critical" },
      { item: "Green room", importance: "important" },
      { item: "Professional recording", importance: "important" },
      { item: "Live streaming capability", importance: "nice_to_have" },
    ],
    recommendations: [
      "Book keynotes first - they anchor marketing",
      "Negotiate recording rights upfront",
      "Include Q&A or interaction for engagement",
      "Brief speakers on audience demographics",
    ],
  };
}

export const MTG_017_KeynoteStrategy = {
  id: "MTG-017", name: "Keynote Strategy", description: "키노트 전략 수립",
  inputSchema: MTG_017_InputSchema, outputSchema: MTG_017_OutputSchema, execute,
  tags: ["keynote", "speaker", "strategy"], domain: "meetings", skill: 13, taskType: "AI" as const,
};
