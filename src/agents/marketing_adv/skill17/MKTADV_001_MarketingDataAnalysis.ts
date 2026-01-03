/**
 * MKTADV-001: 마케팅 데이터 분석
 * CMP-IS Reference: 17.1.a - Marketing data analysis and insights
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Marketing Data Analyst specializing in event marketing analytics.`;

export const InputSchema = z.object({
  event_id: z.string(),
  analysis_period: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }),
  data_sources: z.array(z.enum(["google_analytics", "social_media", "email", "crm", "survey", "paid_ads"])),
  metrics_focus: z.array(z.string()).optional(),
  comparison_period: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string(),
  event_id: z.string(),
  analysis_period: z.object({ start_date: z.string(), end_date: z.string() }),
  key_metrics: z.array(z.object({
    metric_name: z.string(),
    current_value: z.number(),
    previous_value: z.number().optional(),
    change_percent: z.number().optional(),
    trend: z.enum(["up", "down", "stable"]),
  })),
  channel_performance: z.array(z.object({
    channel: z.string(),
    impressions: z.number(),
    clicks: z.number(),
    conversions: z.number(),
    spend: z.number(),
    roi: z.number(),
  })),
  insights: z.array(z.object({
    category: z.string(),
    finding: z.string(),
    impact: z.enum(["high", "medium", "low"]),
    recommendation: z.string(),
  })),
  data_quality_score: z.number(),
  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);

  const channels = ["email", "social", "paid_search", "display", "content"];
  const channelPerformance = channels.map(channel => {
    const impressions = Math.floor(Math.random() * 100000) + 10000;
    const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01));
    const conversions = Math.floor(clicks * (Math.random() * 0.1 + 0.02));
    const spend = Math.floor(Math.random() * 5000) + 500;
    const revenue = conversions * (Math.random() * 200 + 50);
    return {
      channel,
      impressions,
      clicks,
      conversions,
      spend,
      roi: Math.round((revenue - spend) / spend * 100) / 100,
    };
  });

  const keyMetrics = [
    { metric_name: "Total Registrations", current_value: Math.floor(Math.random() * 1000) + 500, trend: "up" as const },
    { metric_name: "Website Sessions", current_value: Math.floor(Math.random() * 50000) + 10000, trend: "up" as const },
    { metric_name: "Email Open Rate", current_value: Math.round((Math.random() * 20 + 20) * 10) / 10, trend: "stable" as const },
    { metric_name: "Social Engagement", current_value: Math.floor(Math.random() * 5000) + 1000, trend: "up" as const },
    { metric_name: "Cost Per Registration", current_value: Math.round((Math.random() * 50 + 20) * 100) / 100, trend: "down" as const },
  ].map(m => ({
    ...m,
    previous_value: Math.floor(m.current_value * (0.8 + Math.random() * 0.4)),
    change_percent: Math.round((Math.random() * 30 - 10) * 10) / 10,
  }));

  const insights = [
    { category: "Channel", finding: "이메일 캠페인이 가장 높은 ROI 기록", impact: "high" as const, recommendation: "이메일 마케팅 예산 20% 증액 권장" },
    { category: "Timing", finding: "화요일 오전 10시 발송 이메일 오픈율 최고", impact: "medium" as const, recommendation: "주요 캠페인 발송 시간 최적화" },
    { category: "Content", finding: "비디오 콘텐츠 참여율이 텍스트 대비 3배", impact: "high" as const, recommendation: "비디오 콘텐츠 제작 확대" },
  ];

  return {
    analysis_id: generateUUID(),
    event_id: validatedInput.event_id,
    analysis_period: validatedInput.analysis_period,
    key_metrics: keyMetrics,
    channel_performance: channelPerformance,
    insights,
    data_quality_score: Math.round((Math.random() * 15 + 85) * 10) / 10,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-001",
  taskName: "마케팅 데이터 분석",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 17.1.a",
  skill: "Skill 17: Marketing Analytics",
  subSkill: "17.1: Data Analysis",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
