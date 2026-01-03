/**
 * MTG-006: Call for Papers Management
 * CMP-IS Domain G - Skill 13
 */
import { z } from "zod";

export const MTG_006_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_title: z.string(),
  submission_deadline: z.string(),
  review_deadline: z.string(),
  topics: z.array(z.string()),
  submission_types: z.array(z.enum(["oral", "poster", "workshop"])),
});

export const MTG_006_OutputSchema = z.object({
  event_id: z.string(),
  cfp_document: z.object({
    title: z.string(),
    overview: z.string(),
    topics: z.array(z.string()),
    submission_guidelines: z.array(z.string()),
    timeline: z.array(z.object({ milestone: z.string(), date: z.string() })),
    review_criteria: z.array(z.object({ criterion: z.string(), weight: z.number() })),
  }),
  distribution_plan: z.array(z.object({ channel: z.string(), timing: z.string() })),
  recommendations: z.array(z.string()),
});

export type MTG_006_Input = z.infer<typeof MTG_006_InputSchema>;
export type MTG_006_Output = z.infer<typeof MTG_006_OutputSchema>;

export async function execute(input: MTG_006_Input): Promise<MTG_006_Output> {
  return {
    event_id: input.event_id,
    cfp_document: {
      title: `Call for Papers: ${input.event_title}`,
      overview: `We invite submissions on topics related to ${input.topics[0]} and more.`,
      topics: input.topics,
      submission_guidelines: [
        "Abstract: 300-500 words",
        "Include 3-5 keywords",
        "Indicate preferred presentation format",
        "Provide author affiliations",
      ],
      timeline: [
        { milestone: "Submission Open", date: "Today" },
        { milestone: "Submission Deadline", date: input.submission_deadline },
        { milestone: "Review Complete", date: input.review_deadline },
        { milestone: "Notification", date: "2 weeks after review" },
      ],
      review_criteria: [
        { criterion: "Relevance to Theme", weight: 30 },
        { criterion: "Originality", weight: 25 },
        { criterion: "Quality of Content", weight: 25 },
        { criterion: "Clarity", weight: 20 },
      ],
    },
    distribution_plan: [
      { channel: "Email to past attendees", timing: "Immediately" },
      { channel: "Social media", timing: "Weekly updates" },
      { channel: "Partner organizations", timing: "Within 1 week" },
    ],
    recommendations: ["Early bird deadline for higher submissions", "Provide clear formatting templates"],
  };
}

export const MTG_006_CFPManagement = {
  id: "MTG-006", name: "Call for Papers Management", description: "초록 공모 관리",
  inputSchema: MTG_006_InputSchema, outputSchema: MTG_006_OutputSchema, execute,
  tags: ["cfp", "submissions"], domain: "meetings", skill: 13, taskType: "AI" as const,
};
