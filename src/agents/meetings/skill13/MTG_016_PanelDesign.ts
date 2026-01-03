/**
 * MTG-016: Panel Discussion Design
 * CMP-IS Domain G - Skill 13
 */
import { z } from "zod";

export const MTG_016_InputSchema = z.object({
  event_id: z.string().uuid(),
  panel_topic: z.string(),
  duration_minutes: z.number().min(30).max(120).default(60),
  panelist_count: z.number().min(2).max(8).default(4),
  include_audience_qa: z.boolean().default(true),
  format: z.enum(["traditional", "fishbowl", "debate", "world_cafe"]).default("traditional"),
});

export const MTG_016_OutputSchema = z.object({
  event_id: z.string(),
  panel_design: z.object({
    format: z.string(),
    timeline: z.array(z.object({ segment: z.string(), duration_min: z.number(), description: z.string() })),
    moderator_guide: z.array(z.string()),
    panelist_briefing: z.array(z.string()),
    audience_engagement: z.array(z.object({ method: z.string(), timing: z.string() })),
    stage_setup: z.object({ arrangement: z.string(), equipment: z.array(z.string()) }),
  }),
  discussion_questions: z.array(z.object({ question: z.string(), purpose: z.string(), time_allocation: z.number() })),
  contingency_plan: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type MTG_016_Input = z.infer<typeof MTG_016_InputSchema>;
export type MTG_016_Output = z.infer<typeof MTG_016_OutputSchema>;

export async function execute(input: MTG_016_Input): Promise<MTG_016_Output> {
  const qaTime = input.include_audience_qa ? 15 : 0;
  const discussionTime = input.duration_minutes - 10 - qaTime;

  return {
    event_id: input.event_id,
    panel_design: {
      format: input.format,
      timeline: [
        { segment: "Introductions", duration_min: 5, description: "Moderator introduces topic and panelists" },
        { segment: "Opening Statements", duration_min: 5, description: "Each panelist: 1-min perspective" },
        { segment: "Moderated Discussion", duration_min: discussionTime, description: "Core discussion with prepared questions" },
        ...(input.include_audience_qa ? [{ segment: "Audience Q&A", duration_min: qaTime, description: "Live questions from audience" }] : []),
        { segment: "Closing Remarks", duration_min: 5, description: "Key takeaways from each panelist" },
      ],
      moderator_guide: [
        "Research all panelists beforehand",
        "Prepare 2x more questions than needed",
        "Balance speaking time across panelists",
        "Have techniques to redirect off-topic discussions",
        "Prepare graceful interruption phrases",
      ],
      panelist_briefing: [
        "Keep responses to 2 minutes max",
        "Build on others' points when possible",
        "Bring specific examples and data",
        "Avoid reading from notes",
      ],
      audience_engagement: [
        { method: "Live polling", timing: "Before panel starts" },
        { method: "Q&A cards", timing: "Collected during discussion" },
        { method: "Mic runners", timing: "During Q&A segment" },
      ],
      stage_setup: {
        arrangement: input.format === "fishbowl" ? "Inner circle with outer audience ring" : "Semi-circle facing audience",
        equipment: ["Individual microphones", "Moderator table", "Timer display", "Water for panelists"],
      },
    },
    discussion_questions: [
      { question: `What is the biggest challenge in ${input.panel_topic}?`, purpose: "Opening hook", time_allocation: 8 },
      { question: "Where do you see this field in 5 years?", purpose: "Forward-looking", time_allocation: 8 },
      { question: "What advice would you give to newcomers?", purpose: "Practical value", time_allocation: 6 },
    ],
    contingency_plan: [
      "If panelist absent: redistribute questions",
      "If running long: skip to closing 5 min before end",
      "If low audience engagement: use pre-submitted questions",
    ],
    recommendations: [
      "Conduct pre-panel call with all participants",
      "Share questions 48 hours in advance",
      "Diversity of perspectives enhances discussion",
    ],
  };
}

export const MTG_016_PanelDesign = {
  id: "MTG-016", name: "Panel Discussion Design", description: "패널 토론 설계",
  inputSchema: MTG_016_InputSchema, outputSchema: MTG_016_OutputSchema, execute,
  tags: ["panel", "discussion", "moderation"], domain: "meetings", skill: 13, taskType: "AI" as const,
};
