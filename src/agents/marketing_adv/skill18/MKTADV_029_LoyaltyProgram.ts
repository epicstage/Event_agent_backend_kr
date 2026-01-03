/**
 * MKTADV-029: 로열티 프로그램 관리
 * CMP-IS Reference: 18.7.a - Loyalty program management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Loyalty Program Manager for event engagement.`;

export const InputSchema = z.object({
  event_id: z.string(),
  program_action: z.enum(["analyze", "recommend_rewards", "calculate_points", "tier_evaluation"]).optional(),
  member_segment: z.string().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  program_id: z.string(),
  event_id: z.string(),
  program_overview: z.object({
    total_members: z.number(),
    active_members: z.number(),
    total_points_issued: z.number(),
    total_points_redeemed: z.number(),
    redemption_rate: z.number(),
    program_cost: z.number(),
    revenue_impact: z.number(),
  }),
  tier_distribution: z.array(z.object({
    tier: z.string(),
    members: z.number(),
    percentage: z.number(),
    avg_annual_spend: z.number(),
    retention_rate: z.number(),
    benefits: z.array(z.string()),
  })),
  reward_performance: z.array(z.object({
    reward: z.string(),
    category: z.string(),
    redemptions: z.number(),
    satisfaction_score: z.number(),
    cost_per_redemption: z.number(),
    engagement_impact: z.number(),
  })),
  point_economy: z.object({
    earn_rules: z.array(z.object({
      action: z.string(),
      points: z.number(),
      multiplier_conditions: z.string().optional(),
    })),
    burn_options: z.array(z.object({
      reward: z.string(),
      points_required: z.number(),
      availability: z.string(),
    })),
  }),
  optimization_recommendations: z.array(z.object({
    recommendation: z.string(),
    expected_impact: z.string(),
    implementation_effort: z.enum(["low", "medium", "high"]),
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
    program_id: generateUUID(),
    event_id: validatedInput.event_id,
    program_overview: {
      total_members: 2850,
      active_members: 1920,
      total_points_issued: 4250000,
      total_points_redeemed: 2850000,
      redemption_rate: 67,
      program_cost: 85000,
      revenue_impact: 425000,
    },
    tier_distribution: [
      { tier: "Platinum", members: 85, percentage: 3, avg_annual_spend: 2800, retention_rate: 92, benefits: ["VIP 좌석", "전용 네트워킹", "무료 업그레이드", "전담 매니저"] },
      { tier: "Gold", members: 320, percentage: 11, avg_annual_spend: 1500, retention_rate: 78, benefits: ["우선 등록", "할인 혜택", "라운지 접근", "얼리버드 연장"] },
      { tier: "Silver", members: 680, percentage: 24, avg_annual_spend: 850, retention_rate: 62, benefits: ["포인트 2배", "뉴스레터 VIP", "생일 보너스"] },
      { tier: "Bronze", members: 1765, percentage: 62, avg_annual_spend: 380, retention_rate: 45, benefits: ["기본 포인트 적립", "회원 전용 콘텐츠"] },
    ],
    reward_performance: [
      { reward: "등록비 할인", category: "discount", redemptions: 850, satisfaction_score: 4.5, cost_per_redemption: 45, engagement_impact: 35 },
      { reward: "VIP 업그레이드", category: "experience", redemptions: 180, satisfaction_score: 4.8, cost_per_redemption: 120, engagement_impact: 45 },
      { reward: "전용 네트워킹 초대", category: "access", redemptions: 95, satisfaction_score: 4.7, cost_per_redemption: 80, engagement_impact: 40 },
      { reward: "브랜드 굿즈", category: "merchandise", redemptions: 420, satisfaction_score: 3.8, cost_per_redemption: 25, engagement_impact: 15 },
      { reward: "온디맨드 콘텐츠", category: "content", redemptions: 650, satisfaction_score: 4.2, cost_per_redemption: 10, engagement_impact: 25 },
    ],
    point_economy: {
      earn_rules: [
        { action: "이벤트 등록", points: 500, multiplier_conditions: "얼리버드 시 2배" },
        { action: "세션 참석", points: 50, multiplier_conditions: "키노트 시 3배" },
        { action: "네트워킹 참여", points: 30 },
        { action: "설문 완료", points: 100 },
        { action: "친구 추천", points: 200, multiplier_conditions: "등록 완료 시" },
        { action: "소셜 공유", points: 25 },
      ],
      burn_options: [
        { reward: "10% 등록 할인", points_required: 500, availability: "상시" },
        { reward: "VIP 업그레이드", points_required: 2000, availability: "선착순 50명" },
        { reward: "전용 네트워킹", points_required: 1500, availability: "Gold 이상" },
        { reward: "프리미엄 굿즈", points_required: 300, availability: "상시" },
      ],
    },
    optimization_recommendations: [
      { recommendation: "Bronze → Silver 전환 캠페인 실행", expected_impact: "리텐션 15% 향상", implementation_effort: "low" },
      { recommendation: "경험 기반 리워드 확대", expected_impact: "만족도 0.3점 상승", implementation_effort: "medium" },
      { recommendation: "포인트 만료 알림 자동화", expected_impact: "사용률 20% 증가", implementation_effort: "low" },
      { recommendation: "파트너 브랜드 리워드 추가", expected_impact: "프로그램 가치 인식 향상", implementation_effort: "high" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-029",
  taskName: "로열티 프로그램 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 18.7.a",
  skill: "Skill 18: CRM Integration",
  subSkill: "18.7: Loyalty Management",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
