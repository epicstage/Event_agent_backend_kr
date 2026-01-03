/**
 * MKTADV-018: 마케팅 대시보드
 * CMP-IS Reference: 17.11.a - Marketing dashboard generation
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Marketing Dashboard Designer for event analytics.`;

export const InputSchema = z.object({
  event_id: z.string(),
  dashboard_type: z.enum(["executive", "operational", "campaign", "channel"]).optional(),
  date_range: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  dashboard_id: z.string(),
  event_id: z.string(),
  summary_kpis: z.array(z.object({
    metric: z.string(),
    value: z.number(),
    unit: z.string(),
    change: z.number(),
    trend: z.enum(["up", "down", "stable"]),
    target: z.number(),
    achievement: z.number(),
  })),
  registration_funnel: z.object({
    visitors: z.number(),
    page_views: z.number(),
    started_registration: z.number(),
    completed_registration: z.number(),
    paid: z.number(),
    conversion_rates: z.array(z.object({
      stage: z.string(),
      rate: z.number(),
    })),
  }),
  channel_performance: z.array(z.object({
    channel: z.string(),
    visitors: z.number(),
    conversions: z.number(),
    revenue: z.number(),
    cpa: z.number(),
  })),
  timeline_metrics: z.array(z.object({
    date: z.string(),
    registrations: z.number(),
    revenue: z.number(),
    visitors: z.number(),
  })),
  alerts: z.array(z.object({
    severity: z.enum(["critical", "warning", "info"]),
    message: z.string(),
    metric: z.string(),
    action_required: z.string(),
  })),
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

  return {
    dashboard_id: generateUUID(),
    event_id: validatedInput.event_id,
    summary_kpis: [
      { metric: "총 등록자", value: 856, unit: "명", change: 12, trend: "up", target: 1000, achievement: 85.6 },
      { metric: "전환율", value: 4.2, unit: "%", change: 0.5, trend: "up", target: 5.0, achievement: 84.0 },
      { metric: "마케팅 ROI", value: 3.8, unit: "배", change: 0.3, trend: "up", target: 4.0, achievement: 95.0 },
      { metric: "CPA", value: 45, unit: "USD", change: -5, trend: "up", target: 50, achievement: 110.0 },
      { metric: "총 매출", value: 128500, unit: "USD", change: 15, trend: "up", target: 150000, achievement: 85.7 },
    ],
    registration_funnel: {
      visitors: 45000,
      page_views: 78000,
      started_registration: 3200,
      completed_registration: 1850,
      paid: 856,
      conversion_rates: [
        { stage: "방문 → 등록 시작", rate: 7.1 },
        { stage: "등록 시작 → 완료", rate: 57.8 },
        { stage: "등록 완료 → 결제", rate: 46.3 },
        { stage: "전체 전환율", rate: 1.9 },
      ],
    },
    channel_performance: [
      { channel: "이메일", visitors: 12000, conversions: 380, revenue: 57000, cpa: 15 },
      { channel: "검색 광고", visitors: 15000, conversions: 285, revenue: 42750, cpa: 45 },
      { channel: "소셜 광고", visitors: 10000, conversions: 120, revenue: 18000, cpa: 55 },
      { channel: "오가닉", visitors: 8000, conversions: 71, revenue: 10650, cpa: 0 },
    ],
    timeline_metrics: [
      { date: "2024-01-15", registrations: 45, revenue: 6750, visitors: 2800 },
      { date: "2024-01-16", registrations: 62, revenue: 9300, visitors: 3200 },
      { date: "2024-01-17", registrations: 78, revenue: 11700, visitors: 4100 },
      { date: "2024-01-18", registrations: 95, revenue: 14250, visitors: 4800 },
      { date: "2024-01-19", registrations: 112, revenue: 16800, visitors: 5500 },
    ],
    alerts: [
      { severity: "warning", message: "등록 목표 대비 14.4% 미달", metric: "총 등록자", action_required: "마케팅 캠페인 강화 필요" },
      { severity: "info", message: "이메일 캠페인 성과 우수", metric: "이메일 CPA", action_required: "예산 증액 검토" },
      { severity: "critical", message: "등록 완료율 하락 감지", metric: "폼 완료율", action_required: "등록 폼 UX 점검 필요" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-018",
  taskName: "마케팅 대시보드",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 17.11.a",
  skill: "Skill 17: Marketing Analytics",
  subSkill: "17.11: Dashboard & Reporting",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
