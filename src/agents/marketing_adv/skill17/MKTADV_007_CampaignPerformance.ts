/**
 * MKTADV-007: 캠페인 성과 분석
 * CMP-IS Reference: 17.2.c - Campaign performance analysis
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Campaign Performance Analyst for event marketing.`;

export const InputSchema = z.object({
  event_id: z.string(),
  campaign_id: z.string(),
  campaign_name: z.string(),
  campaign_type: z.enum(["email", "social", "paid_search", "display", "content", "influencer", "pr"]),
  date_range: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }),
  goals: z.object({
    target_impressions: z.number().optional(),
    target_clicks: z.number().optional(),
    target_conversions: z.number().optional(),
    target_roi: z.number().optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string(),
  event_id: z.string(),
  campaign_id: z.string(),
  performance_metrics: z.object({
    impressions: z.number(),
    reach: z.number(),
    clicks: z.number(),
    ctr: z.number(),
    conversions: z.number(),
    conversion_rate: z.number(),
    spend: z.number(),
    cpc: z.number(),
    cpa: z.number(),
    revenue: z.number(),
    roas: z.number(),
  }),
  goal_achievement: z.array(z.object({
    goal: z.string(),
    target: z.number(),
    actual: z.number(),
    achievement_rate: z.number(),
    status: z.enum(["exceeded", "met", "below"]),
  })),
  daily_trend: z.array(z.object({
    date: z.string(),
    impressions: z.number(),
    clicks: z.number(),
    conversions: z.number(),
  })),
  insights: z.array(z.string()),
  optimization_suggestions: z.array(z.string()),
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

  const impressions = Math.floor(Math.random() * 500000) + 100000;
  const reach = Math.floor(impressions * 0.7);
  const clicks = Math.floor(impressions * (Math.random() * 0.03 + 0.01));
  const conversions = Math.floor(clicks * (Math.random() * 0.08 + 0.02));
  const spend = Math.floor(Math.random() * 10000) + 2000;
  const revenue = conversions * (Math.random() * 150 + 50);

  const dailyTrend = Array.from({ length: 7 }, (_, i) => ({
    date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    impressions: Math.floor(impressions / 7 * (0.8 + Math.random() * 0.4)),
    clicks: Math.floor(clicks / 7 * (0.8 + Math.random() * 0.4)),
    conversions: Math.floor(conversions / 7 * (0.8 + Math.random() * 0.4)),
  }));

  const goals = validatedInput.goals || {};
  const goalItems: { goal: string; target: number; actual: number }[] = [];
  if (goals.target_impressions) goalItems.push({ goal: "Impressions", target: goals.target_impressions, actual: impressions });
  if (goals.target_clicks) goalItems.push({ goal: "Clicks", target: goals.target_clicks, actual: clicks });
  if (goals.target_conversions) goalItems.push({ goal: "Conversions", target: goals.target_conversions, actual: conversions });

  const goalAchievement = goalItems.map(g => ({
    goal: g.goal,
    target: g.target,
    actual: g.actual,
    achievement_rate: Math.round(g.actual / g.target * 100),
    status: g.actual >= g.target * 1.1 ? "exceeded" as const :
      g.actual >= g.target * 0.9 ? "met" as const : "below" as const,
  }));

  return {
    analysis_id: generateUUID(),
    event_id: validatedInput.event_id,
    campaign_id: validatedInput.campaign_id,
    performance_metrics: {
      impressions,
      reach,
      clicks,
      ctr: Math.round(clicks / impressions * 100 * 100) / 100,
      conversions,
      conversion_rate: Math.round(conversions / clicks * 100 * 100) / 100,
      spend,
      cpc: Math.round(spend / clicks * 100) / 100,
      cpa: Math.round(spend / conversions * 100) / 100,
      revenue: Math.round(revenue),
      roas: Math.round(revenue / spend * 100) / 100,
    },
    goal_achievement: goalAchievement,
    daily_trend: dailyTrend,
    insights: [
      "주중(화-목) 성과가 주말 대비 40% 높음",
      "모바일 전환율이 데스크톱 대비 25% 낮음",
      "리타겟팅 광고의 CPA가 신규 타겟 대비 50% 저렴",
    ],
    optimization_suggestions: [
      "주말 예산을 주중으로 재배분하여 효율 개선",
      "모바일 랜딩페이지 최적화 필요",
      "고성과 광고 소재 확장 운영",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-007",
  taskName: "캠페인 성과 분석",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 17.2.c",
  skill: "Skill 17: Marketing Analytics",
  subSkill: "17.2: ROI Measurement",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
