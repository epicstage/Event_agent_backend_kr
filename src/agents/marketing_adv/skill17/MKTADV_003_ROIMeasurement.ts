/**
 * MKTADV-003: ROI 측정
 * CMP-IS Reference: 17.2.a - Marketing ROI measurement and attribution
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Marketing ROI Analyst specializing in event marketing attribution.`;

export const InputSchema = z.object({
  event_id: z.string(),
  campaign_id: z.string().optional(),
  investment: z.object({
    advertising: z.number(),
    content_creation: z.number(),
    email_marketing: z.number(),
    social_media: z.number(),
    influencer: z.number().optional(),
    pr: z.number().optional(),
    other: z.number().optional(),
  }),
  revenue: z.object({
    ticket_sales: z.number(),
    sponsorships: z.number(),
    exhibitions: z.number(),
    merchandise: z.number().optional(),
    other: z.number().optional(),
  }),
  attribution_model: z.enum(["last_click", "first_click", "linear", "time_decay", "position_based"]).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  roi_report_id: z.string(),
  event_id: z.string(),
  overall_roi: z.object({
    total_investment: z.number(),
    total_revenue: z.number(),
    net_profit: z.number(),
    roi_percent: z.number(),
    roas: z.number(),
  }),
  channel_roi: z.array(z.object({
    channel: z.string(),
    investment: z.number(),
    attributed_revenue: z.number(),
    roi_percent: z.number(),
    efficiency_score: z.number(),
  })),
  attribution_breakdown: z.array(z.object({
    touchpoint: z.string(),
    contribution_percent: z.number(),
    conversions: z.number(),
  })),
  benchmarks: z.object({
    industry_avg_roi: z.number(),
    performance_vs_industry: z.string(),
  }),
  recommendations: z.array(z.string()),
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
  const inv = validatedInput.investment;
  const rev = validatedInput.revenue;

  const totalInvestment = inv.advertising + inv.content_creation + inv.email_marketing +
    inv.social_media + (inv.influencer || 0) + (inv.pr || 0) + (inv.other || 0);
  const totalRevenue = rev.ticket_sales + rev.sponsorships + rev.exhibitions +
    (rev.merchandise || 0) + (rev.other || 0);
  const netProfit = totalRevenue - totalInvestment;
  const roiPercent = Math.round((netProfit / totalInvestment) * 100 * 10) / 10;

  const channelRoi = [
    { channel: "Advertising", investment: inv.advertising, factor: 2.5 },
    { channel: "Content", investment: inv.content_creation, factor: 3.2 },
    { channel: "Email", investment: inv.email_marketing, factor: 4.0 },
    { channel: "Social Media", investment: inv.social_media, factor: 2.8 },
  ].map(c => {
    const attributedRevenue = Math.floor(c.investment * c.factor);
    return {
      channel: c.channel,
      investment: c.investment,
      attributed_revenue: attributedRevenue,
      roi_percent: Math.round((attributedRevenue - c.investment) / c.investment * 100 * 10) / 10,
      efficiency_score: Math.round(c.factor * 25),
    };
  });

  const attributionBreakdown = [
    { touchpoint: "Organic Search", contribution_percent: 25, conversions: 150 },
    { touchpoint: "Email Campaign", contribution_percent: 30, conversions: 180 },
    { touchpoint: "Social Media", contribution_percent: 20, conversions: 120 },
    { touchpoint: "Paid Ads", contribution_percent: 15, conversions: 90 },
    { touchpoint: "Direct", contribution_percent: 10, conversions: 60 },
  ];

  const industryAvgRoi = 180;
  const performanceVsIndustry = roiPercent > industryAvgRoi ? "above_average" :
    roiPercent > industryAvgRoi * 0.8 ? "average" : "below_average";

  return {
    roi_report_id: generateUUID(),
    event_id: validatedInput.event_id,
    overall_roi: {
      total_investment: totalInvestment,
      total_revenue: totalRevenue,
      net_profit: netProfit,
      roi_percent: roiPercent,
      roas: Math.round(totalRevenue / totalInvestment * 100) / 100,
    },
    channel_roi: channelRoi,
    attribution_breakdown: attributionBreakdown,
    benchmarks: {
      industry_avg_roi: industryAvgRoi,
      performance_vs_industry: performanceVsIndustry,
    },
    recommendations: [
      "이메일 마케팅 ROI가 가장 높음 - 예산 15% 증액 권장",
      "광고 채널별 A/B 테스트로 효율 개선 필요",
      "콘텐츠 마케팅의 장기 효과 측정 시스템 구축",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-003",
  taskName: "ROI 측정",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 17.2.a",
  skill: "Skill 17: Marketing Analytics",
  subSkill: "17.2: ROI Measurement",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
