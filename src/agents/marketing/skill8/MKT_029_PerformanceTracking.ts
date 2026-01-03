/**
 * MKT-029: 성과 추적
 * CMP-IS Reference: 8.3.a - Marketing performance tracking and monitoring
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Performance Tracking Agent.
CMP-IS Standard: 8.3.a - Tracking and monitoring marketing performance metrics.`;

export const InputSchema = z.object({
  event_id: z.string(),
  campaign_id: z.string().optional(),
  date_range: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  channels: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  tracking_id: z.string(),
  event_id: z.string(),
  report_period: z.object({ start: z.string(), end: z.string() }),
  overall_metrics: z.object({
    total_spend: z.number(),
    total_impressions: z.number(),
    total_reach: z.number(),
    total_clicks: z.number(),
    total_conversions: z.number(),
    overall_ctr: z.number(),
    overall_cpc: z.number(),
    overall_cpa: z.number(),
    overall_roas: z.number(),
  }),
  channel_breakdown: z.array(z.object({
    channel: z.string(),
    spend: z.number(),
    impressions: z.number(),
    clicks: z.number(),
    conversions: z.number(),
    ctr: z.number(),
    cpc: z.number(),
    cpa: z.number(),
    roas: z.number(),
    trend: z.string(),
  })),
  daily_trends: z.array(z.object({
    date: z.string(),
    spend: z.number(),
    conversions: z.number(),
    cpa: z.number(),
  })),
  goal_progress: z.array(z.object({
    goal: z.string(),
    target: z.number(),
    current: z.number(),
    progress: z.number(),
    status: z.string(),
  })),
  alerts: z.array(z.object({
    type: z.string(),
    severity: z.string(),
    message: z.string(),
    recommendation: z.string(),
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
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    tracking_id: generateUUID(),
    event_id: validatedInput.event_id,
    report_period: {
      start: validatedInput.date_range?.start || weekAgo.toISOString().split('T')[0],
      end: validatedInput.date_range?.end || now.toISOString().split('T')[0],
    },
    overall_metrics: {
      total_spend: 10000000,
      total_impressions: 2000000,
      total_reach: 800000,
      total_clicks: 50000,
      total_conversions: 1500,
      overall_ctr: 2.5,
      overall_cpc: 200,
      overall_cpa: 6667,
      overall_roas: 3.2,
    },
    channel_breakdown: [
      { channel: "Google Ads", spend: 4000000, impressions: 600000, clicks: 21000, conversions: 700, ctr: 3.5, cpc: 190, cpa: 5714, roas: 4.1, trend: "up" },
      { channel: "Meta Ads", spend: 3000000, impressions: 800000, clicks: 16000, conversions: 450, ctr: 2.0, cpc: 188, cpa: 6667, roas: 2.8, trend: "stable" },
      { channel: "LinkedIn", spend: 2000000, impressions: 300000, clicks: 6000, conversions: 200, ctr: 2.0, cpc: 333, cpa: 10000, roas: 2.5, trend: "down" },
      { channel: "Email", spend: 500000, impressions: 200000, clicks: 5000, conversions: 100, ctr: 2.5, cpc: 100, cpa: 5000, roas: 5.0, trend: "up" },
      { channel: "Organic Social", spend: 500000, impressions: 100000, clicks: 2000, conversions: 50, ctr: 2.0, cpc: 250, cpa: 10000, roas: 2.0, trend: "stable" },
    ],
    daily_trends: Array.from({ length: 7 }, (_, i) => ({
      date: new Date(weekAgo.getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      spend: 1400000 + Math.random() * 200000,
      conversions: 200 + Math.floor(Math.random() * 50),
      cpa: 6000 + Math.random() * 1000,
    })),
    goal_progress: [
      { goal: "등록자 수", target: 2000, current: 1500, progress: 75, status: "on_track" },
      { goal: "총 도달", target: 1000000, current: 800000, progress: 80, status: "on_track" },
      { goal: "목표 CPA", target: 7000, current: 6667, progress: 105, status: "exceeding" },
      { goal: "ROAS", target: 3.0, current: 3.2, progress: 107, status: "exceeding" },
    ],
    alerts: [
      { type: "performance", severity: "warning", message: "LinkedIn CPA 목표 대비 43% 초과", recommendation: "타겟 및 크리에이티브 점검" },
      { type: "budget", severity: "info", message: "예산 소진율 70% (예상 대비 정상)", recommendation: "현 페이스 유지" },
      { type: "opportunity", severity: "info", message: "Google Ads 고성과 - 확장 검토", recommendation: "예산 +20% 고려" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-029";
export const taskName = "성과 추적";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.3.a";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.3: Performance Monitoring";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
