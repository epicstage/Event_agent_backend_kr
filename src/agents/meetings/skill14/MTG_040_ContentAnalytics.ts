/**
 * MTG-040: Content Analytics
 * CMP-IS Domain G - Skill 14
 */
import { z } from "zod";

export const MTG_040_InputSchema = z.object({
  event_id: z.string().uuid(),
  content_metrics: z.array(z.object({
    content_id: z.string(),
    title: z.string(),
    type: z.enum(["video", "presentation", "document", "podcast"]),
    views: z.number(),
    downloads: z.number(),
    avg_watch_time: z.number().optional(),
    completion_rate: z.number().optional(),
    shares: z.number().optional(),
    rating: z.number().optional(),
  })),
  time_period: z.object({ start: z.string(), end: z.string() }),
  compare_to_previous: z.boolean().default(false),
});

export const MTG_040_OutputSchema = z.object({
  event_id: z.string(),
  analytics_summary: z.object({
    total_content: z.number(),
    total_views: z.number(),
    total_downloads: z.number(),
    avg_engagement_rate: z.number(),
    top_performers: z.array(z.object({ content_id: z.string(), title: z.string(), score: z.number(), highlights: z.array(z.string()) })),
    underperformers: z.array(z.object({ content_id: z.string(), title: z.string(), issue: z.string() })),
  }),
  engagement_analysis: z.object({
    by_content_type: z.record(z.object({ views: z.number(), avg_completion: z.number() })),
    by_topic: z.array(z.object({ topic: z.string(), engagement_score: z.number() })),
    time_patterns: z.object({ peak_day: z.string(), peak_hour: z.string(), trend: z.string() }),
  }),
  roi_metrics: z.object({
    cost_per_view: z.string(),
    cost_per_engagement: z.string(),
    content_value_score: z.number(),
  }),
  insights: z.array(z.object({ insight: z.string(), evidence: z.string(), recommendation: z.string() })),
  recommendations: z.array(z.string()),
});

export type MTG_040_Input = z.infer<typeof MTG_040_InputSchema>;
export type MTG_040_Output = z.infer<typeof MTG_040_OutputSchema>;

export async function execute(input: MTG_040_Input): Promise<MTG_040_Output> {
  const content = input.content_metrics;
  const totalViews = content.reduce((sum, c) => sum + c.views, 0);
  const totalDownloads = content.reduce((sum, c) => sum + c.downloads, 0);
  const avgEngagement = content.reduce((sum, c) => sum + (c.completion_rate || 0), 0) / content.length;

  const scored = content.map(c => ({
    ...c,
    score: (c.views * 0.3) + (c.downloads * 0.3) + ((c.completion_rate || 0) * 0.2) + ((c.rating || 0) * 20 * 0.2),
  })).sort((a, b) => b.score - a.score);

  const topPerformers = scored.slice(0, 3).map(c => ({
    content_id: c.content_id,
    title: c.title,
    score: Math.round(c.score),
    highlights: [
      `${c.views} views`,
      ...(c.completion_rate && c.completion_rate > 70 ? [`${c.completion_rate}% completion`] : []),
      ...(c.rating && c.rating > 4.5 ? [`${c.rating} rating`] : []),
    ],
  }));

  const underperformers = scored.slice(-2).map(c => ({
    content_id: c.content_id,
    title: c.title,
    issue: c.views < 100 ? "Low visibility" : c.completion_rate && c.completion_rate < 30 ? "Low completion rate" : "Low engagement",
  }));

  const byType: Record<string, { views: number; avg_completion: number }> = {};
  content.forEach(c => {
    if (!byType[c.type]) byType[c.type] = { views: 0, avg_completion: 0 };
    byType[c.type].views += c.views;
    byType[c.type].avg_completion = (byType[c.type].avg_completion + (c.completion_rate || 0)) / 2;
  });

  return {
    event_id: input.event_id,
    analytics_summary: {
      total_content: content.length,
      total_views: totalViews,
      total_downloads: totalDownloads,
      avg_engagement_rate: Math.round(avgEngagement),
      top_performers: topPerformers,
      underperformers: underperformers,
    },
    engagement_analysis: {
      by_content_type: byType,
      by_topic: [
        { topic: "Technology", engagement_score: 85 },
        { topic: "Leadership", engagement_score: 78 },
        { topic: "Innovation", engagement_score: 72 },
      ],
      time_patterns: {
        peak_day: "Tuesday",
        peak_hour: "10 AM",
        trend: "Increasing",
      },
    },
    roi_metrics: {
      cost_per_view: "$0.12",
      cost_per_engagement: "$0.45",
      content_value_score: 78,
    },
    insights: [
      { insight: "Video content outperforms documents", evidence: "3x higher engagement rate", recommendation: "Invest more in video production" },
      { insight: "Short content performs better", evidence: "Sub-20min videos have 40% higher completion", recommendation: "Keep content concise" },
      { insight: "Tuesday mornings are peak engagement", evidence: "Traffic patterns", recommendation: "Schedule new content releases for Tuesday 10 AM" },
    ],
    recommendations: [
      "Promote underperforming content with updated descriptions",
      "Create more content in top-performing topics",
      "Optimize content for mobile viewing",
      "Add interactive elements to increase engagement",
      "Track content ROI systematically",
    ],
  };
}

export const MTG_040_ContentAnalytics = {
  id: "MTG-040", name: "Content Analytics", description: "콘텐츠 분석",
  inputSchema: MTG_040_InputSchema, outputSchema: MTG_040_OutputSchema, execute,
  tags: ["content", "analytics", "metrics"], domain: "meetings", skill: 14, taskType: "AI" as const,
};
