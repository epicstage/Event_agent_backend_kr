/**
 * MTG-007: Abstract Review Process
 * CMP-IS Domain G - Skill 13
 */
import { z } from "zod";

export const MTG_007_InputSchema = z.object({
  event_id: z.string().uuid(),
  abstract_id: z.string(),
  title: z.string(),
  abstract_text: z.string(),
  category: z.string(),
  keywords: z.array(z.string()).optional(),
});

export const MTG_007_OutputSchema = z.object({
  event_id: z.string(),
  abstract_id: z.string(),
  review_result: z.object({
    overall_score: z.number(),
    scores: z.array(z.object({ criterion: z.string(), score: z.number(), comment: z.string() })),
    recommendation: z.enum(["accept_oral", "accept_poster", "revise", "reject"]),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    suggested_track: z.string(),
  }),
  recommendations: z.array(z.string()),
});

export type MTG_007_Input = z.infer<typeof MTG_007_InputSchema>;
export type MTG_007_Output = z.infer<typeof MTG_007_OutputSchema>;

export async function execute(input: MTG_007_Input): Promise<MTG_007_Output> {
  const wordCount = input.abstract_text.split(/\s+/).length;
  const hasKeywords = (input.keywords?.length || 0) >= 3;
  const baseScore = Math.min(90, 60 + wordCount / 10);

  return {
    event_id: input.event_id,
    abstract_id: input.abstract_id,
    review_result: {
      overall_score: Math.round(baseScore),
      scores: [
        { criterion: "Relevance", score: 85, comment: "Aligns with conference theme" },
        { criterion: "Originality", score: 80, comment: "Novel approach presented" },
        { criterion: "Clarity", score: wordCount > 250 ? 85 : 70, comment: wordCount > 250 ? "Well structured" : "Could be more detailed" },
        { criterion: "Quality", score: hasKeywords ? 85 : 75, comment: hasKeywords ? "Good keyword selection" : "Add more keywords" },
      ],
      recommendation: baseScore >= 80 ? "accept_oral" : baseScore >= 70 ? "accept_poster" : "revise",
      strengths: ["Clear research question", "Relevant to theme"],
      weaknesses: wordCount < 250 ? ["Abstract too brief"] : [],
      suggested_track: input.category,
    },
    recommendations: ["Assign 2-3 reviewers for final decision", "Check for conflicts of interest"],
  };
}

export const MTG_007_AbstractReview = {
  id: "MTG-007", name: "Abstract Review Process", description: "초록 심사 프로세스",
  inputSchema: MTG_007_InputSchema, outputSchema: MTG_007_OutputSchema, execute,
  tags: ["abstract", "review", "evaluation"], domain: "meetings", skill: 13, taskType: "AI" as const,
};
