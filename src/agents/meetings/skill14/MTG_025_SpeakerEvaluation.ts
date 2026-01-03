/**
 * MTG-025: Speaker Evaluation
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_025_InputSchema = z.object({
  event_id: z.string().uuid(),
  speaker_id: z.string(),
  speaker_name: z.string(),
  session_title: z.string(),
  feedback_responses: z.array(z.object({
    question: z.string(),
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().optional(),
  })),
  attendance_data: z.object({ registered: z.number(), attended: z.number(), stayed_full: z.number() }),
});

export const MTG_025_OutputSchema = z.object({
  event_id: z.string(),
  evaluation_summary: z.object({
    speaker_id: z.string(),
    overall_score: z.number(),
    dimension_scores: z.array(z.object({ dimension: z.string(), score: z.number(), benchmark: z.number() })),
    attendance_metrics: z.object({ attendance_rate: z.number(), retention_rate: z.number() }),
    sentiment_analysis: z.object({ positive: z.number(), neutral: z.number(), negative: z.number() }),
    top_comments: z.object({ positive: z.array(z.string()), constructive: z.array(z.string()) }),
  }),
  benchmarking: z.object({ vs_event_average: z.number(), percentile: z.number() }),
  action_items: z.array(z.object({ action: z.string(), owner: z.string() })),
  recommendations: z.array(z.string()),
});

export type MTG_025_Input = z.infer<typeof MTG_025_InputSchema>;
export type MTG_025_Output = z.infer<typeof MTG_025_OutputSchema>;

export async function execute(input: MTG_025_Input): Promise<MTG_025_Output> {
  const ratings = input.feedback_responses.filter(r => r.rating).map(r => r.rating!);
  const overallScore = ratings.length > 0 ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length * 10) / 10 : 0;
  const attendanceRate = Math.round((input.attendance_data.attended / input.attendance_data.registered) * 100);
  const retentionRate = Math.round((input.attendance_data.stayed_full / input.attendance_data.attended) * 100);

  const comments = input.feedback_responses.filter(r => r.comment).map(r => r.comment!);
  const positiveKeywords = ["great", "excellent", "insightful", "engaging", "loved"];
  const negativeKeywords = ["boring", "long", "sales", "disappointed", "confusing"];

  const positiveComments = comments.filter(c => positiveKeywords.some(k => c.toLowerCase().includes(k)));
  const negativeComments = comments.filter(c => negativeKeywords.some(k => c.toLowerCase().includes(k)));
  const neutralComments = comments.filter(c => !positiveKeywords.some(k => c.toLowerCase().includes(k)) && !negativeKeywords.some(k => c.toLowerCase().includes(k)));

  return {
    event_id: input.event_id,
    evaluation_summary: {
      speaker_id: input.speaker_id,
      overall_score: overallScore,
      dimension_scores: [
        { dimension: "Content relevance", score: overallScore + 0.2, benchmark: 4.0 },
        { dimension: "Presentation skills", score: overallScore, benchmark: 4.0 },
        { dimension: "Engagement", score: overallScore - 0.1, benchmark: 3.8 },
        { dimension: "Practical value", score: overallScore + 0.1, benchmark: 3.9 },
      ],
      attendance_metrics: { attendance_rate: attendanceRate, retention_rate: retentionRate },
      sentiment_analysis: {
        positive: Math.round((positiveComments.length / Math.max(comments.length, 1)) * 100),
        neutral: Math.round((neutralComments.length / Math.max(comments.length, 1)) * 100),
        negative: Math.round((negativeComments.length / Math.max(comments.length, 1)) * 100),
      },
      top_comments: {
        positive: positiveComments.slice(0, 3),
        constructive: negativeComments.slice(0, 2),
      },
    },
    benchmarking: {
      vs_event_average: overallScore - 4.0,
      percentile: overallScore >= 4.5 ? 90 : overallScore >= 4.0 ? 70 : overallScore >= 3.5 ? 50 : 30,
    },
    action_items: [
      { action: "Share feedback summary with speaker", owner: "Speaker liaison" },
      { action: overallScore >= 4.2 ? "Add to preferred speaker list" : "Review for future consideration", owner: "Content team" },
      { action: "Update speaker database with evaluation", owner: "Database admin" },
    ],
    recommendations: [
      overallScore >= 4.5 ? "Priority invite for future events" : "Consider with guidance for improvement",
      retentionRate < 70 ? "Discuss session pacing for future" : "Retention rate healthy",
      "Share constructive feedback diplomatically",
    ],
  };
}

export const MTG_025_SpeakerEvaluation = {
  id: "MTG-025", name: "Speaker Evaluation", description: "연사 평가",
  inputSchema: MTG_025_InputSchema, outputSchema: MTG_025_OutputSchema, execute,
  tags: ["speaker", "evaluation", "feedback"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
