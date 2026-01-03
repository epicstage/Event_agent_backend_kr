/**
 * MKT-038: 리타겟팅 캠페인
 * CMP-IS Reference: 8.5.b - Retargeting campaign execution
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Retargeting Campaign Agent.
CMP-IS Standard: 8.5.b - Executing retargeting campaigns for re-engagement.`;

export const InputSchema = z.object({
  event_id: z.string(),
  audience_segment: z.string(),
  campaign_objective: z.string(),
  budget: z.number(),
  duration_days: z.number().default(14),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  campaign_id: z.string(),
  event_id: z.string(),
  retargeting_setup: z.object({
    audience_segment: z.string(),
    audience_size: z.number(),
    lookback_window: z.string(),
    frequency_cap: z.string(),
    exclusions: z.array(z.string()),
  }),
  campaign_structure: z.array(z.object({
    ad_set: z.string(),
    audience: z.string(),
    budget_allocation: z.number(),
    messaging: z.string(),
    creative_approach: z.string(),
  })),
  platform_config: z.array(z.object({
    platform: z.string(),
    pixel_status: z.string(),
    audience_matched: z.number(),
    estimated_reach: z.number(),
    estimated_cpm: z.number(),
  })),
  creative_recommendations: z.array(z.object({ format: z.string(), message: z.string(), cta: z.string() })),
  performance_projections: z.object({
    impressions: z.number(),
    clicks: z.number(),
    conversions: z.number(),
    cpa: z.number(),
    roas: z.number(),
  }),
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
    campaign_id: generateUUID(),
    event_id: validatedInput.event_id,
    retargeting_setup: {
      audience_segment: validatedInput.audience_segment,
      audience_size: 15000,
      lookback_window: "30일",
      frequency_cap: "일 3회, 주 10회",
      exclusions: ["이미 등록 완료", "수신거부자", "30일 내 전환자"],
    },
    campaign_structure: [
      { ad_set: "사이트 방문자", audience: "전체 방문자 (30일)", budget_allocation: validatedInput.budget * 0.4, messaging: "다시 방문해주세요", creative_approach: "혜택 리마인더" },
      { ad_set: "등록 이탈자", audience: "등록 시작 후 미완료", budget_allocation: validatedInput.budget * 0.35, messaging: "등록을 완료하세요", creative_approach: "긴급성 강조" },
      { ad_set: "고관여 방문자", audience: "3+ 페이지 조회", budget_allocation: validatedInput.budget * 0.25, messaging: "특별 혜택 제공", creative_approach: "VIP 오퍼" },
    ],
    platform_config: [
      { platform: "Meta", pixel_status: "active", audience_matched: 12000, estimated_reach: 10000, estimated_cpm: 2500 },
      { platform: "Google Display", pixel_status: "active", audience_matched: 10000, estimated_reach: 8000, estimated_cpm: 2000 },
      { platform: "LinkedIn", pixel_status: "active", audience_matched: 5000, estimated_reach: 4000, estimated_cpm: 6000 },
    ],
    creative_recommendations: [
      { format: "Carousel", message: "놓친 세션 하이라이트", cta: "지금 등록하기" },
      { format: "Video 15s", message: "마감 임박 카운트다운", cta: "마감 전 등록" },
      { format: "Static Image", message: "한정 할인 혜택", cta: "할인받기" },
    ],
    performance_projections: {
      impressions: 200000,
      clicks: 6000,
      conversions: 300,
      cpa: Math.round(validatedInput.budget / 300),
      roas: 4.5,
    },
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-038";
export const taskName = "리타겟팅 캠페인";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.5.b";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.5: Lead Management";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
