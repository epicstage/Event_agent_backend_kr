/**
 * MKT-031: ROI 분석
 * CMP-IS Reference: 8.3.c - Marketing ROI analysis
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert ROI Analysis Agent.
CMP-IS Standard: 8.3.c - Analyzing marketing return on investment.`;

export const InputSchema = z.object({
  event_id: z.string(),
  analysis_period: z.object({ start: z.string(), end: z.string() }).optional(),
  include_indirect_costs: z.boolean().default(true),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string(),
  event_id: z.string(),
  roi_summary: z.object({
    total_investment: z.number(),
    total_revenue: z.number(),
    net_profit: z.number(),
    roi_percentage: z.number(),
    roas: z.number(),
  }),
  channel_roi: z.array(z.object({
    channel: z.string(),
    investment: z.number(),
    revenue: z.number(),
    roi: z.number(),
    roas: z.number(),
    efficiency_rating: z.string(),
  })),
  cost_breakdown: z.object({
    media_spend: z.number(),
    creative_production: z.number(),
    agency_fees: z.number(),
    technology: z.number(),
    personnel: z.number(),
    other: z.number(),
  }),
  roi_trends: z.array(z.object({
    period: z.string(),
    investment: z.number(),
    revenue: z.number(),
    roi: z.number(),
  })),
  recommendations: z.array(z.object({
    area: z.string(),
    recommendation: z.string(),
    expected_impact: z.string(),
  })),
  created_at: z.string(),
});

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: Input): Promise<z.infer<typeof OutputSchema>> {
  const validatedInput = InputSchema.parse(input);

  const totalInvestment = 50000000;
  const totalRevenue = 150000000;

  return {
    analysis_id: generateUUID(),
    event_id: validatedInput.event_id,
    roi_summary: {
      total_investment: totalInvestment,
      total_revenue: totalRevenue,
      net_profit: totalRevenue - totalInvestment,
      roi_percentage: ((totalRevenue - totalInvestment) / totalInvestment) * 100,
      roas: totalRevenue / totalInvestment,
    },
    channel_roi: [
      { channel: "Paid Search", investment: 15000000, revenue: 60000000, roi: 300, roas: 4.0, efficiency_rating: "excellent" },
      { channel: "Email Marketing", investment: 3000000, revenue: 25000000, roi: 733, roas: 8.3, efficiency_rating: "excellent" },
      { channel: "Paid Social", investment: 12000000, revenue: 35000000, roi: 192, roas: 2.9, efficiency_rating: "good" },
      { channel: "LinkedIn", investment: 8000000, revenue: 18000000, roi: 125, roas: 2.3, efficiency_rating: "average" },
      { channel: "Content/PR", investment: 5000000, revenue: 8000000, roi: 60, roas: 1.6, efficiency_rating: "below_average" },
      { channel: "Partnerships", investment: 2000000, revenue: 4000000, roi: 100, roas: 2.0, efficiency_rating: "average" },
    ],
    cost_breakdown: {
      media_spend: 35000000,
      creative_production: 5000000,
      agency_fees: 4000000,
      technology: 3000000,
      personnel: 2000000,
      other: 1000000,
    },
    roi_trends: [
      { period: "Week 1", investment: 8000000, revenue: 15000000, roi: 88 },
      { period: "Week 2", investment: 10000000, revenue: 25000000, roi: 150 },
      { period: "Week 3", investment: 12000000, revenue: 40000000, roi: 233 },
      { period: "Week 4", investment: 15000000, revenue: 50000000, roi: 233 },
      { period: "Week 5", investment: 5000000, revenue: 20000000, roi: 300 },
    ],
    recommendations: [
      { area: "이메일 마케팅", recommendation: "예산 확대 권장 (최고 ROI 채널)", expected_impact: "ROI +50%" },
      { area: "Paid Search", recommendation: "브랜드 키워드 확대", expected_impact: "전환 +20%" },
      { area: "Content/PR", recommendation: "성과 측정 방법 개선 필요", expected_impact: "정확도 향상" },
      { area: "리타겟팅", recommendation: "예산 비중 확대", expected_impact: "전체 ROAS +15%" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-031";
export const taskName = "ROI 분석";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.3.c";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.3: Performance Monitoring";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
