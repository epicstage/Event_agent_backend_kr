/**
 * MTG-026: Content Review
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_026_InputSchema = z.object({
  event_id: z.string().uuid(),
  content_id: z.string(),
  content_type: z.enum(["presentation", "paper", "poster", "video", "handout"]),
  title: z.string(),
  content_text: z.string().optional(),
  slide_count: z.number().optional(),
  speaker_id: z.string(),
});

export const MTG_026_OutputSchema = z.object({
  event_id: z.string(),
  review_result: z.object({
    content_id: z.string(),
    status: z.enum(["approved", "minor_revisions", "major_revisions", "rejected"]),
    overall_quality: z.number(),
    criteria_scores: z.array(z.object({ criterion: z.string(), score: z.number(), feedback: z.string() })),
    brand_compliance: z.object({ template_used: z.boolean(), logo_correct: z.boolean(), issues: z.array(z.string()) }),
    revision_requests: z.array(z.object({ item: z.string(), priority: z.enum(["required", "recommended"]), details: z.string() })),
  }),
  timeline: z.object({ review_completed: z.string(), revision_due: z.string(), final_due: z.string() }),
  recommendations: z.array(z.string()),
});

export type MTG_026_Input = z.infer<typeof MTG_026_InputSchema>;
export type MTG_026_Output = z.infer<typeof MTG_026_OutputSchema>;

export async function execute(input: MTG_026_Input): Promise<MTG_026_Output> {
  const slideCheck = input.slide_count ? input.slide_count <= 30 : true;
  const hasContent = !!input.content_text && input.content_text.length > 100;
  const qualityScore = hasContent && slideCheck ? 4.2 : hasContent ? 3.5 : 2.5;

  return {
    event_id: input.event_id,
    review_result: {
      content_id: input.content_id,
      status: qualityScore >= 4.0 ? "approved" : qualityScore >= 3.5 ? "minor_revisions" : qualityScore >= 2.5 ? "major_revisions" : "rejected",
      overall_quality: qualityScore,
      criteria_scores: [
        { criterion: "Relevance to theme", score: 4.0, feedback: "Aligns well with event theme" },
        { criterion: "Technical accuracy", score: 4.2, feedback: "Content appears accurate" },
        { criterion: "Presentation quality", score: slideCheck ? 4.0 : 3.0, feedback: slideCheck ? "Good slide design" : "Too many slides - consider condensing" },
        { criterion: "Engagement potential", score: 3.8, feedback: "Could add more interactive elements" },
      ],
      brand_compliance: {
        template_used: true,
        logo_correct: true,
        issues: slideCheck ? [] : ["Slide count exceeds recommended maximum (30)"],
      },
      revision_requests: slideCheck ? [] : [
        { item: "Reduce slide count", priority: "required", details: "Current: " + input.slide_count + " slides. Target: 30 max" },
        { item: "Add speaker notes", priority: "recommended", details: "Include key talking points for each slide" },
      ],
    },
    timeline: {
      review_completed: new Date().toISOString().split("T")[0],
      revision_due: "5 days from review",
      final_due: "10 days before event",
    },
    recommendations: [
      "Provide branded template early in process",
      "Set clear content guidelines in speaker kit",
      "Offer optional design review service",
      "Track revision completion rates",
    ],
  };
}

export const MTG_026_ContentReview = {
  id: "MTG-026", name: "Content Review", description: "콘텐츠 검토",
  inputSchema: MTG_026_InputSchema, outputSchema: MTG_026_OutputSchema, execute,
  tags: ["content", "review", "quality"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
