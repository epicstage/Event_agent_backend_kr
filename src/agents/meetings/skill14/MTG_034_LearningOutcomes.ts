/**
 * MTG-034: Learning Outcomes Design
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_034_InputSchema = z.object({
  event_id: z.string().uuid(),
  session_id: z.string(),
  session_title: z.string(),
  session_type: z.enum(["keynote", "workshop", "breakout", "masterclass", "panel"]),
  duration_minutes: z.number(),
  target_audience: z.object({ level: z.string(), roles: z.array(z.string()) }),
  topic_area: z.string(),
});

export const MTG_034_OutputSchema = z.object({
  event_id: z.string(),
  learning_design: z.object({
    session_id: z.string(),
    learning_objectives: z.array(z.object({
      objective: z.string(),
      bloom_level: z.enum(["remember", "understand", "apply", "analyze", "evaluate", "create"]),
      measurable: z.boolean(),
    })),
    competencies: z.array(z.object({ competency: z.string(), level: z.enum(["awareness", "knowledge", "skill", "mastery"]) })),
    assessment_methods: z.array(z.object({ method: z.string(), timing: z.string(), measures: z.string() })),
    engagement_strategies: z.array(z.object({ strategy: z.string(), learning_objective_link: z.number() })),
  }),
  accreditation_alignment: z.object({
    potential_credits: z.number(),
    requirements_met: z.array(z.string()),
    documentation_needed: z.array(z.string()),
  }),
  recommendations: z.array(z.string()),
});

export type MTG_034_Input = z.infer<typeof MTG_034_InputSchema>;
export type MTG_034_Output = z.infer<typeof MTG_034_OutputSchema>;

export async function execute(input: MTG_034_Input): Promise<MTG_034_Output> {
  const creditHours = Math.floor(input.duration_minutes / 60);
  const isHands = input.session_type === "workshop" || input.session_type === "masterclass";

  return {
    event_id: input.event_id,
    learning_design: {
      session_id: input.session_id,
      learning_objectives: [
        {
          objective: `Understand the core principles of ${input.topic_area}`,
          bloom_level: "understand",
          measurable: true,
        },
        {
          objective: `Analyze current challenges in ${input.topic_area} and identify solutions`,
          bloom_level: "analyze",
          measurable: true,
        },
        {
          objective: isHands ? `Apply learned techniques to real-world scenarios` : `Evaluate best practices and implementation strategies`,
          bloom_level: isHands ? "apply" : "evaluate",
          measurable: true,
        },
      ],
      competencies: [
        { competency: `${input.topic_area} knowledge`, level: isHands ? "skill" : "knowledge" },
        { competency: "Critical thinking", level: "knowledge" },
        { competency: "Problem solving", level: isHands ? "skill" : "awareness" },
      ],
      assessment_methods: [
        { method: "Pre-session poll", timing: "Before session", measures: "Baseline knowledge" },
        { method: isHands ? "Hands-on exercise completion" : "Q&A participation", timing: "During session", measures: "Engagement and comprehension" },
        { method: "Post-session quiz", timing: "End of session", measures: "Learning objective achievement" },
        { method: "Follow-up survey", timing: "1 week post", measures: "Knowledge retention and application" },
      ],
      engagement_strategies: [
        { strategy: "Real-world case study discussion", learning_objective_link: 1 },
        { strategy: isHands ? "Hands-on practice exercise" : "Think-pair-share activity", learning_objective_link: 2 },
        { strategy: "Action planning for implementation", learning_objective_link: 3 },
      ],
    },
    accreditation_alignment: {
      potential_credits: creditHours,
      requirements_met: [
        "Defined learning objectives",
        "Qualified instructor",
        "Assessment mechanism",
        "Attendance tracking",
      ],
      documentation_needed: [
        "Instructor credentials",
        "Detailed session outline",
        "Assessment rubric",
        "Evaluation summary",
      ],
    },
    recommendations: [
      "Write objectives in SMART format",
      "Align assessment with objectives",
      "Include application opportunities",
      "Collect before/after metrics",
      "Provide take-home resources",
    ],
  };
}

export const MTG_034_LearningOutcomes = {
  id: "MTG-034", name: "Learning Outcomes Design", description: "학습 성과 설계",
  inputSchema: MTG_034_InputSchema, outputSchema: MTG_034_OutputSchema, execute,
  tags: ["learning", "outcomes", "education"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
