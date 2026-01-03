/**
 * MTG-018: Audience Engagement Design
 * CMP-IS Domain G - Skill 13
 */
import { z } from "zod";

export const MTG_018_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_format: z.enum(["in_person", "virtual", "hybrid"]),
  audience_size: z.number(),
  session_count: z.number(),
  tech_savviness: z.enum(["low", "medium", "high"]).default("medium"),
  engagement_budget: z.number().optional(),
});

export const MTG_018_OutputSchema = z.object({
  event_id: z.string(),
  engagement_plan: z.object({
    pre_event: z.array(z.object({ activity: z.string(), channel: z.string(), goal: z.string() })),
    during_event: z.array(z.object({ activity: z.string(), timing: z.string(), tool: z.string(), participation_target: z.number() })),
    post_event: z.array(z.object({ activity: z.string(), timeline: z.string(), goal: z.string() })),
  }),
  technology_stack: z.array(z.object({ tool: z.string(), purpose: z.string(), cost_tier: z.string() })),
  gamification: z.object({
    enabled: z.boolean(),
    mechanics: z.array(z.object({ mechanic: z.string(), reward: z.string() })),
    leaderboard: z.boolean(),
  }),
  success_metrics: z.array(z.object({ metric: z.string(), target: z.number(), measurement: z.string() })),
  recommendations: z.array(z.string()),
});

export type MTG_018_Input = z.infer<typeof MTG_018_InputSchema>;
export type MTG_018_Output = z.infer<typeof MTG_018_OutputSchema>;

export async function execute(input: MTG_018_Input): Promise<MTG_018_Output> {
  const isVirtual = input.event_format !== "in_person";
  const participationTarget = input.tech_savviness === "high" ? 0.7 : input.tech_savviness === "medium" ? 0.5 : 0.3;

  return {
    event_id: input.event_id,
    engagement_plan: {
      pre_event: [
        { activity: "Pre-event survey", channel: "Email", goal: "Understand expectations" },
        { activity: "Networking app activation", channel: "Mobile app", goal: "Build connections early" },
        { activity: "Session preference polling", channel: "Registration portal", goal: "Inform scheduling" },
      ],
      during_event: [
        { activity: "Live polling", timing: "Each session", tool: isVirtual ? "Virtual platform" : "Slido/Mentimeter", participation_target: participationTarget * 100 },
        { activity: "Q&A submission", timing: "Throughout", tool: "Event app", participation_target: participationTarget * 80 },
        { activity: "Networking breaks", timing: "Between sessions", tool: isVirtual ? "Breakout rooms" : "Designated areas", participation_target: participationTarget * 60 },
        { activity: "Social wall", timing: "Continuous", tool: "Hashtag aggregator", participation_target: participationTarget * 40 },
      ],
      post_event: [
        { activity: "Feedback survey", timeline: "Within 24 hours", goal: "Capture fresh impressions" },
        { activity: "Content follow-up", timeline: "1 week", goal: "Extend engagement" },
        { activity: "Community invitation", timeline: "2 weeks", goal: "Build year-round community" },
      ],
    },
    technology_stack: [
      { tool: "Event app", purpose: "Central hub for all activities", cost_tier: "$$" },
      { tool: "Live polling tool", purpose: "Real-time interaction", cost_tier: "$" },
      { tool: "Networking platform", purpose: "Matchmaking and meetings", cost_tier: "$$" },
      { tool: "Social aggregator", purpose: "Display social mentions", cost_tier: "$" },
    ],
    gamification: {
      enabled: input.tech_savviness !== "low",
      mechanics: [
        { mechanic: "Session check-ins", reward: "Points" },
        { mechanic: "Poll participation", reward: "Badges" },
        { mechanic: "Networking meetings", reward: "Bonus points" },
        { mechanic: "Social sharing", reward: "Entries for prize draw" },
      ],
      leaderboard: input.audience_size <= 500,
    },
    success_metrics: [
      { metric: "App adoption rate", target: 70, measurement: "Downloads / Registrations" },
      { metric: "Session engagement", target: 50, measurement: "Poll responses / Attendees" },
      { metric: "Networking meetings", target: 3, measurement: "Avg meetings per attendee" },
      { metric: "NPS score", target: 50, measurement: "Post-event survey" },
    ],
    recommendations: [
      "Start engagement before the event",
      "Keep technology simple and intuitive",
      "Offer incentives for participation",
      "Train staff on engagement tools",
    ],
  };
}

export const MTG_018_AudienceEngagement = {
  id: "MTG-018", name: "Audience Engagement Design", description: "참석자 참여 설계",
  inputSchema: MTG_018_InputSchema, outputSchema: MTG_018_OutputSchema, execute,
  tags: ["engagement", "interaction", "audience"], domain: "meetings", skill: 13, taskType: "AI" as const,
};
