/**
 * MKT-034: 마케팅 리포팅
 * CMP-IS Reference: 8.4.a - Marketing reporting and dashboards
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Marketing Reporting Agent.
CMP-IS Standard: 8.4.a - Creating comprehensive marketing reports and dashboards.`;

export const InputSchema = z.object({
  event_id: z.string(),
  report_type: z.enum(["daily", "weekly", "monthly", "campaign"]),
  report_period: z.object({ start: z.string(), end: z.string() }),
  stakeholders: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  report_type: z.string(),
  report_period: z.object({ start: z.string(), end: z.string() }),
  executive_summary: z.object({
    key_highlights: z.array(z.string()),
    challenges: z.array(z.string()),
    recommendations: z.array(z.string()),
  }),
  kpi_dashboard: z.array(z.object({
    metric: z.string(),
    current: z.number(),
    target: z.number(),
    variance: z.number(),
    status: z.string(),
    trend: z.string(),
  })),
  channel_performance: z.array(z.object({
    channel: z.string(),
    spend: z.number(),
    conversions: z.number(),
    revenue: z.number(),
    roas: z.number(),
    vs_last_period: z.number(),
  })),
  insights: z.array(z.object({ insight: z.string(), data_point: z.string(), action: z.string() })),
  next_period_focus: z.array(z.object({ priority: z.string(), initiative: z.string(), expected_outcome: z.string() })),
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

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    report_type: validatedInput.report_type,
    report_period: validatedInput.report_period,
    executive_summary: {
      key_highlights: ["등록자 목표 85% 달성", "ROAS 3.2로 목표 초과", "이메일 캠페인 최고 성과"],
      challenges: ["LinkedIn CPA 목표 대비 높음", "모바일 전환율 개선 필요"],
      recommendations: ["고성과 채널(이메일, 검색) 예산 확대", "LinkedIn 타겟팅 재검토", "모바일 UX 개선"],
    },
    kpi_dashboard: [
      { metric: "총 등록자", current: 1700, target: 2000, variance: -15, status: "on_track", trend: "up" },
      { metric: "마케팅 비용", current: 45000000, target: 50000000, variance: -10, status: "under_budget", trend: "stable" },
      { metric: "CPA", current: 26470, target: 30000, variance: -12, status: "exceeding", trend: "down" },
      { metric: "ROAS", current: 3.2, target: 3.0, variance: 7, status: "exceeding", trend: "up" },
      { metric: "전환율", current: 3.4, target: 3.0, variance: 13, status: "exceeding", trend: "up" },
    ],
    channel_performance: [
      { channel: "Paid Search", spend: 15000000, conversions: 600, revenue: 60000000, roas: 4.0, vs_last_period: 12 },
      { channel: "Paid Social", spend: 12000000, conversions: 350, revenue: 35000000, roas: 2.9, vs_last_period: -5 },
      { channel: "Email", spend: 3000000, conversions: 400, revenue: 40000000, roas: 13.3, vs_last_period: 25 },
      { channel: "LinkedIn", spend: 8000000, conversions: 200, revenue: 20000000, roas: 2.5, vs_last_period: -8 },
      { channel: "Organic", spend: 2000000, conversions: 150, revenue: 15000000, roas: 7.5, vs_last_period: 5 },
    ],
    insights: [
      { insight: "화요일 오전 이메일 오픈율 최고", data_point: "오픈율 42% (평균 28%)", action: "주요 이메일 화요일 발송" },
      { insight: "리타겟팅 전환율 3배 높음", data_point: "전환율 9% vs 신규 3%", action: "리타겟팅 예산 확대" },
      { insight: "연사 관련 콘텐츠 참여율 높음", data_point: "CTR 5.2% (평균 2.5%)", action: "연사 콘텐츠 확대" },
    ],
    next_period_focus: [
      { priority: "1", initiative: "마감 임박 캠페인 강화", expected_outcome: "등록 20% 추가 확보" },
      { priority: "2", initiative: "LinkedIn 타겟팅 리뉴얼", expected_outcome: "CPA 20% 개선" },
      { priority: "3", initiative: "모바일 랜딩페이지 최적화", expected_outcome: "모바일 전환율 +30%" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-034";
export const taskName = "마케팅 리포팅";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.4.a";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.4: Reporting & Analysis";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
