/**
 * MKTADV-030: 추천 프로그램 관리
 * CMP-IS Reference: 18.7.b - Referral program management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Referral Program Manager for event growth.`;

export const InputSchema = z.object({
  event_id: z.string(),
  program_type: z.enum(["simple", "tiered", "viral", "ambassador"]).optional(),
  analyze_existing: z.boolean().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  program_id: z.string(),
  event_id: z.string(),
  program_performance: z.object({
    total_referrers: z.number(),
    total_referrals: z.number(),
    conversion_rate: z.number(),
    revenue_from_referrals: z.number(),
    avg_referrals_per_advocate: z.number(),
    program_roi: z.number(),
  }),
  referrer_tiers: z.array(z.object({
    tier: z.string(),
    referrers: z.number(),
    referrals_range: z.string(),
    total_referrals: z.number(),
    avg_conversion_rate: z.number(),
    rewards_earned: z.number(),
  })),
  incentive_structure: z.object({
    referrer_rewards: z.array(z.object({
      milestone: z.string(),
      reward: z.string(),
      value: z.number(),
    })),
    referee_rewards: z.array(z.object({
      condition: z.string(),
      reward: z.string(),
      value: z.number(),
    })),
  }),
  viral_metrics: z.object({
    viral_coefficient: z.number(),
    avg_time_to_convert: z.string(),
    top_referral_channels: z.array(z.object({
      channel: z.string(),
      referrals: z.number(),
      conversion_rate: z.number(),
    })),
  }),
  top_advocates: z.array(z.object({
    advocate_id: z.string(),
    referrals: z.number(),
    conversions: z.number(),
    revenue_generated: z.number(),
    tier: z.string(),
  })),
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

  return {
    program_id: generateUUID(),
    event_id: validatedInput.event_id,
    program_performance: {
      total_referrers: 285,
      total_referrals: 842,
      conversion_rate: 45,
      revenue_from_referrals: 142000,
      avg_referrals_per_advocate: 2.95,
      program_roi: 5.2,
    },
    referrer_tiers: [
      { tier: "Ambassador", referrers: 15, referrals_range: "20+", total_referrals: 380, avg_conversion_rate: 62, rewards_earned: 12500 },
      { tier: "Champion", referrers: 45, referrals_range: "10-19", total_referrals: 285, avg_conversion_rate: 52, rewards_earned: 8500 },
      { tier: "Advocate", referrers: 85, referrals_range: "5-9", total_referrals: 125, avg_conversion_rate: 45, rewards_earned: 4200 },
      { tier: "Supporter", referrers: 140, referrals_range: "1-4", total_referrals: 52, avg_conversion_rate: 38, rewards_earned: 1800 },
    ],
    incentive_structure: {
      referrer_rewards: [
        { milestone: "첫 번째 추천", reward: "10% 할인 코드", value: 50 },
        { milestone: "5회 추천", reward: "무료 티켓 1매", value: 300 },
        { milestone: "10회 추천", reward: "VIP 업그레이드", value: 500 },
        { milestone: "20회 추천", reward: "Ambassador 패키지", value: 1500 },
      ],
      referee_rewards: [
        { condition: "첫 등록", reward: "10% 할인", value: 50 },
        { condition: "얼리버드 기간", reward: "추가 5% 할인", value: 25 },
      ],
    },
    viral_metrics: {
      viral_coefficient: 0.35,
      avg_time_to_convert: "4.2일",
      top_referral_channels: [
        { channel: "이메일 공유", referrals: 320, conversion_rate: 52 },
        { channel: "LinkedIn", referrals: 215, conversion_rate: 48 },
        { channel: "직접 링크", referrals: 180, conversion_rate: 42 },
        { channel: "WhatsApp", referrals: 127, conversion_rate: 38 },
      ],
    },
    top_advocates: [
      { advocate_id: "ADV-001", referrals: 45, conversions: 32, revenue_generated: 12800, tier: "Ambassador" },
      { advocate_id: "ADV-002", referrals: 38, conversions: 25, revenue_generated: 10000, tier: "Ambassador" },
      { advocate_id: "ADV-003", referrals: 32, conversions: 22, revenue_generated: 8800, tier: "Ambassador" },
      { advocate_id: "ADV-004", referrals: 28, conversions: 18, revenue_generated: 7200, tier: "Champion" },
      { advocate_id: "ADV-005", referrals: 25, conversions: 15, revenue_generated: 6000, tier: "Champion" },
    ],
    optimization_suggestions: [
      "Ambassador 전용 콘텐츠 제공으로 참여 유지",
      "이메일 공유 템플릿 최적화 - 전환율 52%로 최고 효율",
      "LinkedIn 공유 시 추가 보너스 제공",
      "추천 전환 주기 단축을 위한 한시적 보너스 도입",
      "Supporter → Advocate 전환 캠페인 실행",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-030",
  taskName: "추천 프로그램 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 18.7.b",
  skill: "Skill 18: CRM Integration",
  subSkill: "18.7: Loyalty Management",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
