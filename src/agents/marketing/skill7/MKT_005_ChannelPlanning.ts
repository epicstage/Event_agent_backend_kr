/**
 * MKT-005: 채널 계획
 * CMP-IS Reference: 7.2.b - Planning marketing channel mix
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Channel Planning Agent for event marketing.
CMP-IS Standard: 7.2.b - Planning optimal marketing channel mix for maximum reach and ROI.`;

export const InputSchema = z.object({
  event_id: z.string(),
  target_segments: z.array(z.string()),
  marketing_budget: z.number(),
  currency: z.string().default("KRW"),
  campaign_duration_weeks: z.number().default(12),
  priority_channels: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string(),
  event_id: z.string(),
  channel_mix: z.array(z.object({
    channel: z.string(),
    channel_type: z.string(),
    budget_allocation: z.number(),
    budget_percent: z.number(),
    expected_reach: z.number(),
    expected_conversions: z.number(),
    cpa_estimate: z.number(),
    tactics: z.array(z.string()),
    kpis: z.array(z.string()),
  })),
  total_expected_reach: z.number(),
  total_expected_conversions: z.number(),
  blended_cpa: z.number(),
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
  const { marketing_budget } = validatedInput;

  const channels = [
    { channel: "검색 광고", type: "paid", percent: 25, cpa: 15000, convRate: 0.03 },
    { channel: "소셜 미디어 광고", type: "paid", percent: 20, cpa: 12000, convRate: 0.025 },
    { channel: "이메일 마케팅", type: "owned", percent: 15, cpa: 5000, convRate: 0.05 },
    { channel: "콘텐츠 마케팅", type: "owned", percent: 15, cpa: 8000, convRate: 0.04 },
    { channel: "LinkedIn", type: "paid", percent: 10, cpa: 20000, convRate: 0.035 },
    { channel: "파트너/제휴", type: "earned", percent: 10, cpa: 10000, convRate: 0.06 },
    { channel: "리타겟팅", type: "paid", percent: 5, cpa: 8000, convRate: 0.08 },
  ];

  const channelMix = channels.map(ch => {
    const budget = marketing_budget * (ch.percent / 100);
    const reach = Math.round(budget / 500);
    const conversions = Math.round(reach * ch.convRate);
    return {
      channel: ch.channel,
      channel_type: ch.type,
      budget_allocation: budget,
      budget_percent: ch.percent,
      expected_reach: reach,
      expected_conversions: conversions,
      cpa_estimate: ch.cpa,
      tactics: [`${ch.channel} 최적화`, "A/B 테스트", "성과 분석"],
      kpis: ["도달", "클릭", "전환", "CPA"],
    };
  });

  const totalReach = channelMix.reduce((s, c) => s + c.expected_reach, 0);
  const totalConversions = channelMix.reduce((s, c) => s + c.expected_conversions, 0);

  return {
    plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    channel_mix: channelMix,
    total_expected_reach: totalReach,
    total_expected_conversions: totalConversions,
    blended_cpa: Math.round(marketing_budget / totalConversions),
    recommendations: [
      "초기에는 인지도 채널에 집중",
      "중반부터 전환 채널로 예산 이동",
      "리타겟팅으로 이탈자 재유입",
      "성과 기반 실시간 예산 재배분",
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-005";
export const taskName = "채널 계획";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 7.2.b";
export const skill = "Skill 7: Plan Marketing";
export const subSkill = "7.2: Marketing Planning";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
