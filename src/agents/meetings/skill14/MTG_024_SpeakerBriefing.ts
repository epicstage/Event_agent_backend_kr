/**
 * MTG-024: Speaker Briefing
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_024_InputSchema = z.object({
  event_id: z.string().uuid(),
  speaker_id: z.string(),
  speaker_name: z.string(),
  session_title: z.string(),
  session_type: z.enum(["keynote", "panel", "workshop", "breakout"]),
  session_duration: z.number(),
  audience_profile: z.object({ size: z.number(), level: z.string(), interests: z.array(z.string()) }),
  event_theme: z.string(),
});

export const MTG_024_OutputSchema = z.object({
  event_id: z.string(),
  briefing_document: z.object({
    event_overview: z.object({ name: z.string(), theme: z.string(), dates: z.string(), venue: z.string() }),
    audience_insights: z.object({ size: z.number(), demographics: z.string(), expectations: z.array(z.string()) }),
    session_guidelines: z.object({ duration: z.number(), format: z.string(), objectives: z.array(z.string()), dos: z.array(z.string()), donts: z.array(z.string()) }),
    technical_requirements: z.object({ slide_format: z.string(), deadline: z.string(), av_available: z.array(z.string()) }),
    key_messages: z.array(z.string()),
  }),
  pre_event_calls: z.array(z.object({ call: z.string(), timing: z.string(), attendees: z.array(z.string()) })),
  recommendations: z.array(z.string()),
});

export type MTG_024_Input = z.infer<typeof MTG_024_InputSchema>;
export type MTG_024_Output = z.infer<typeof MTG_024_OutputSchema>;

export async function execute(input: MTG_024_Input): Promise<MTG_024_Output> {
  return {
    event_id: input.event_id,
    briefing_document: {
      event_overview: {
        name: "[Event Name]",
        theme: input.event_theme,
        dates: "[Event Dates]",
        venue: "[Venue Name, City]",
      },
      audience_insights: {
        size: input.audience_profile.size,
        demographics: input.audience_profile.level,
        expectations: [
          "Actionable insights they can implement",
          "Fresh perspectives on " + input.audience_profile.interests[0],
          "Networking with industry peers",
          "Inspiration and motivation",
        ],
      },
      session_guidelines: {
        duration: input.session_duration,
        format: input.session_type === "keynote" ? "Presentation + Q&A (45+15)" :
          input.session_type === "workshop" ? "Interactive with exercises" : "Presentation with discussion",
        objectives: [
          "Align with event theme: " + input.event_theme,
          "Provide practical takeaways",
          "Engage audience through interaction",
        ],
        dos: [
          "Share real examples and case studies",
          "Include audience interaction points",
          "Leave time for Q&A",
          "Connect to event theme",
          "Use high-quality visuals",
        ],
        donts: [
          "Heavy product promotion",
          "Read directly from slides",
          "Exceed time allocation",
          "Use competitor disparagement",
          "Include confidential client info without permission",
        ],
      },
      technical_requirements: {
        slide_format: "16:9 PowerPoint or PDF",
        deadline: "2 weeks before event",
        av_available: ["Confidence monitor", "Clicker/remote", "Lapel mic", "Backup laptop", "Confidence monitor"],
      },
      key_messages: [
        "This event is about [Theme] - weave this into your narrative",
        "Our audience values practical, implementable insights",
        "We encourage authentic, conversational delivery",
      ],
    },
    pre_event_calls: [
      { call: "Introduction call", timing: "6 weeks before", attendees: ["Speaker", "Content lead", "Session chair"] },
      { call: "Content review", timing: "3 weeks before", attendees: ["Speaker", "Content lead"] },
      { call: "Final prep call", timing: "1 week before", attendees: ["Speaker", "Production manager", "Moderator"] },
    ],
    recommendations: [
      "Share attendee list (with permission) for tailoring",
      "Provide previous years' feedback themes",
      "Connect speaker with session moderator early",
      "Offer presentation coaching if needed",
    ],
  };
}

export const MTG_024_SpeakerBriefing = {
  id: "MTG-024", name: "Speaker Briefing", description: "연사 브리핑",
  inputSchema: MTG_024_InputSchema, outputSchema: MTG_024_OutputSchema, execute,
  tags: ["speaker", "briefing", "preparation"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
