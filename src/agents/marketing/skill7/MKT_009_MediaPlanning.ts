/**
 * MKT-009: 미디어 플래닝
 * CMP-IS Reference: 7.2.f - Planning media mix and placement
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Media Planning Agent.
CMP-IS Standard: 7.2.f - Planning optimal media mix and placement for maximum reach and engagement.`;

export const InputSchema = z.object({
  event_id: z.string(),
  campaign_objectives: z.array(z.string()),
  target_audience: z.object({
    demographics: z.record(z.any()).optional(),
    behaviors: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
  }),
  budget: z.number(),
  currency: z.string().default("KRW"),
  campaign_duration_weeks: z.number().default(8),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  media_plan_id: z.string(),
  event_id: z.string(),
  media_mix: z.array(z.object({
    channel: z.string(),
    platform: z.string(),
    format: z.string(),
    budget_allocation: z.number(),
    expected_reach: z.number(),
    expected_impressions: z.number(),
    cpm: z.number(),
    placement_schedule: z.string(),
  })),
  reach_frequency: z.object({
    total_reach: z.number(),
    average_frequency: z.number(),
    effective_frequency: z.number(),
  }),
  budget_breakdown: z.object({
    media_spend: z.number(),
    production_cost: z.number(),
    agency_fee: z.number(),
    contingency: z.number(),
  }),
  kpis: z.array(z.object({
    metric: z.string(),
    target: z.number(),
    measurement_method: z.string(),
  })),
  recommendations: z.array(z.string()),
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
  const { budget } = validatedInput;

  const mediaMix = [
    {
      channel: "디지털",
      platform: "Google Ads",
      format: "검색 광고",
      budget_allocation: budget * 0.25,
      expected_reach: 150000,
      expected_impressions: 500000,
      cpm: 3000,
      placement_schedule: "캠페인 전 기간",
    },
    {
      channel: "디지털",
      platform: "Meta (Facebook/Instagram)",
      format: "피드 광고 + 스토리",
      budget_allocation: budget * 0.20,
      expected_reach: 200000,
      expected_impressions: 800000,
      cpm: 2500,
      placement_schedule: "캠페인 전 기간",
    },
    {
      channel: "디지털",
      platform: "LinkedIn",
      format: "스폰서드 콘텐츠",
      budget_allocation: budget * 0.15,
      expected_reach: 50000,
      expected_impressions: 150000,
      cpm: 8000,
      placement_schedule: "D-60 ~ D-14",
    },
    {
      channel: "디지털",
      platform: "YouTube",
      format: "프리롤/범퍼 광고",
      budget_allocation: budget * 0.15,
      expected_reach: 100000,
      expected_impressions: 300000,
      cpm: 4000,
      placement_schedule: "D-45 ~ D-7",
    },
    {
      channel: "프로그래매틱",
      platform: "Display Network",
      format: "리타겟팅 배너",
      budget_allocation: budget * 0.10,
      expected_reach: 80000,
      expected_impressions: 400000,
      cpm: 2000,
      placement_schedule: "D-30 ~ D-day",
    },
    {
      channel: "네이티브",
      platform: "산업 매체",
      format: "스폰서드 아티클",
      budget_allocation: budget * 0.10,
      expected_reach: 30000,
      expected_impressions: 60000,
      cpm: 15000,
      placement_schedule: "D-45 ~ D-21",
    },
  ];

  return {
    media_plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    media_mix: mediaMix,
    reach_frequency: {
      total_reach: 500000,
      average_frequency: 4.5,
      effective_frequency: 3.0,
    },
    budget_breakdown: {
      media_spend: budget * 0.85,
      production_cost: budget * 0.08,
      agency_fee: budget * 0.05,
      contingency: budget * 0.02,
    },
    kpis: [
      { metric: "총 도달", target: 500000, measurement_method: "애드 플랫폼 리포트" },
      { metric: "클릭률(CTR)", target: 1.5, measurement_method: "애드 플랫폼 리포트" },
      { metric: "전환율", target: 3.0, measurement_method: "GA4 + 애드 플랫폼" },
      { metric: "ROAS", target: 300, measurement_method: "매출/광고비 계산" },
    ],
    recommendations: [
      "얼리버드 기간에 검색 광고 비중 확대",
      "리타겟팅으로 이탈 방문자 재유입",
      "LinkedIn은 B2B 타겟에 집중",
      "주간 성과 리뷰로 예산 재배분",
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-009";
export const taskName = "미디어 플래닝";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 7.2.f";
export const skill = "Skill 7: Plan Marketing";
export const subSkill = "7.2: Marketing Planning";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
