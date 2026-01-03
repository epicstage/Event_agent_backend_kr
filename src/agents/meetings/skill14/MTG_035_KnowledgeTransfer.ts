/**
 * MTG-035: Knowledge Transfer Planning
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_035_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_type: z.enum(["conference", "summit", "workshop", "training"]),
  total_sessions: z.number(),
  key_topics: z.array(z.string()),
  attendee_count: z.number(),
  post_event_goals: z.array(z.string()),
});

export const MTG_035_OutputSchema = z.object({
  event_id: z.string(),
  transfer_plan: z.object({
    pre_event: z.array(z.object({ activity: z.string(), purpose: z.string(), timing: z.string() })),
    during_event: z.array(z.object({ activity: z.string(), purpose: z.string(), implementation: z.string() })),
    post_event: z.array(z.object({ activity: z.string(), purpose: z.string(), timeline: z.string(), owner: z.string() })),
  }),
  content_strategy: z.object({
    capture_methods: z.array(z.object({ method: z.string(), content_types: z.array(z.string()) })),
    repurposing: z.array(z.object({ source: z.string(), derivative: z.string(), audience: z.string() })),
    distribution_channels: z.array(z.object({ channel: z.string(), content_types: z.array(z.string()), timing: z.string() })),
  }),
  engagement_continuation: z.object({
    community_building: z.array(z.object({ initiative: z.string(), platform: z.string() })),
    learning_reinforcement: z.array(z.object({ activity: z.string(), timing: z.string() })),
  }),
  success_metrics: z.array(z.object({ metric: z.string(), target: z.string(), measurement: z.string() })),
  recommendations: z.array(z.string()),
});

export type MTG_035_Input = z.infer<typeof MTG_035_InputSchema>;
export type MTG_035_Output = z.infer<typeof MTG_035_OutputSchema>;

export async function execute(input: MTG_035_Input): Promise<MTG_035_Output> {
  return {
    event_id: input.event_id,
    transfer_plan: {
      pre_event: [
        { activity: "Pre-reading materials", purpose: "Establish baseline knowledge", timing: "2 weeks before" },
        { activity: "Learning goals setting", purpose: "Focus attendee attention", timing: "1 week before" },
        { activity: "Pre-event community activation", purpose: "Start conversations", timing: "1 week before" },
      ],
      during_event: [
        { activity: "Interactive note-taking", purpose: "Active engagement", implementation: "Event app with notes feature" },
        { activity: "Peer discussion slots", purpose: "Knowledge sharing", implementation: "Built into schedule" },
        { activity: "Action planning sessions", purpose: "Application commitment", implementation: "Dedicated workshop time" },
        { activity: "Expert Q&A access", purpose: "Clarification and depth", implementation: "Speaker office hours" },
      ],
      post_event: [
        { activity: "Session recordings release", purpose: "Review and reinforcement", timeline: "Within 1 week", owner: "Content team" },
        { activity: "Key insights summary", purpose: "Quick reference", timeline: "Within 3 days", owner: "Editorial team" },
        { activity: "Implementation check-in", purpose: "Accountability", timeline: "30 days post", owner: "Community manager" },
        { activity: "Success stories collection", purpose: "Proof of value", timeline: "60-90 days post", owner: "Marketing team" },
      ],
    },
    content_strategy: {
      capture_methods: [
        { method: "Video recording", content_types: ["Keynotes", "Featured sessions"] },
        { method: "Slide collection", content_types: ["All sessions"] },
        { method: "Live notes/blogs", content_types: ["Key sessions"] },
        { method: "Social listening", content_types: ["Attendee insights", "Questions"] },
      ],
      repurposing: [
        { source: "Keynote video", derivative: "Blog post + key clips", audience: "Broader industry" },
        { source: "Workshop materials", derivative: "Online course module", audience: "Non-attendees" },
        { source: "Panel discussion", derivative: "Podcast episode", audience: "Audio-preferring audience" },
        { source: "Attendee notes", derivative: "Crowdsourced summary", audience: "Community" },
      ],
      distribution_channels: [
        { channel: "Event platform", content_types: ["All recordings", "Slides"], timing: "Immediate" },
        { channel: "Email series", content_types: ["Highlights", "Action items"], timing: "Weekly for 4 weeks" },
        { channel: "Social media", content_types: ["Clips", "Quotes", "Insights"], timing: "Daily for 2 weeks" },
        { channel: "Industry publications", content_types: ["Thought leadership pieces"], timing: "Within 1 month" },
      ],
    },
    engagement_continuation: {
      community_building: [
        { initiative: "Alumni network", platform: "LinkedIn Group or Slack" },
        { initiative: "Monthly webinars", platform: "Zoom/virtual platform" },
        { initiative: "Topic-based sub-groups", platform: "Community platform" },
      ],
      learning_reinforcement: [
        { activity: "Micro-learning emails", timing: "Weekly for 8 weeks" },
        { activity: "Implementation challenges", timing: "Monthly" },
        { activity: "Peer accountability pairs", timing: "Ongoing" },
      ],
    },
    success_metrics: [
      { metric: "Content access rate", target: "60% of attendees", measurement: "Platform analytics" },
      { metric: "Knowledge retention", target: "70% score on follow-up quiz", measurement: "Survey" },
      { metric: "Implementation rate", target: "40% report applying learnings", measurement: "30-day survey" },
      { metric: "Community engagement", target: "30% active monthly", measurement: "Community metrics" },
    ],
    recommendations: [
      "Design for transfer from the start",
      "Make content easily accessible post-event",
      "Create accountability mechanisms",
      "Celebrate and share success stories",
      "Build year-round engagement, not just at events",
    ],
  };
}

export const MTG_035_KnowledgeTransfer = {
  id: "MTG-035", name: "Knowledge Transfer Planning", description: "지식 전달 계획",
  inputSchema: MTG_035_InputSchema, outputSchema: MTG_035_OutputSchema, execute,
  tags: ["knowledge", "transfer", "learning"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
