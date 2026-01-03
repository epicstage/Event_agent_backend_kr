/**
 * MKTADV-017: 채널 믹스 최적화
 * CMP-IS Reference: 17.10.a - Marketing channel mix optimization
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Marketing Channel Strategist for event promotion.`;

export const InputSchema = z.object({
  event_id: z.string(),
  total_budget: z.number(),
  channels: z.array(z.enum(["paid_search", "social_ads", "display", "email", "content", "influencer", "offline", "partner"])).optional(),
  optimization_goal: z.enum(["registrations", "awareness", "engagement", "roi"]).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  optimization_id: z.string(),
  event_id: z.string(),
  current_allocation: z.array(z.object({
    channel: z.string(),
    budget_pct: z.number(),
    spend: z.number(),
    conversions: z.number(),
    cpa: z.number(),
    roi: z.number(),
  })),
  optimized_allocation: z.array(z.object({
    channel: z.string(),
    recommended_pct: z.number(),
    recommended_spend: z.number(),
    expected_conversions: z.number(),
    expected_cpa: z.number(),
    expected_roi: z.number(),
    change_from_current: z.number(),
  })),
  optimization_impact: z.object({
    total_conversions_increase: z.number(),
    average_cpa_reduction: z.number(),
    overall_roi_improvement: z.number(),
  }),
  channel_insights: z.array(z.object({
    channel: z.string(),
    strength: z.string(),
    weakness: z.string(),
    recommendation: z.string(),
  })),
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

  const budget = validatedInput.total_budget;
  const channels = validatedInput.channels || ["paid_search", "social_ads", "email", "content"];

  const currentAllocation = channels.map((channel, idx) => {
    const pct = [30, 25, 20, 15, 10][idx] || 10;
    const spend = budget * (pct / 100);
    const conversions = channel === "email" ? Math.floor(spend / 15) :
      channel === "paid_search" ? Math.floor(spend / 45) :
      channel === "social_ads" ? Math.floor(spend / 35) : Math.floor(spend / 55);
    return {
      channel,
      budget_pct: pct,
      spend,
      conversions,
      cpa: Math.round(spend / conversions),
      roi: channel === "email" ? 4.2 : channel === "paid_search" ? 2.8 : 2.1,
    };
  });

  const optimizedAllocation = channels.map((channel, idx) => {
    const currentPct = currentAllocation[idx].budget_pct;
    const recommendedPct = channel === "email" ? currentPct + 8 :
      channel === "paid_search" ? currentPct + 3 :
      channel === "social_ads" ? currentPct - 5 : currentPct - 6;
    const recommendedSpend = budget * (recommendedPct / 100);
    const expectedConversions = Math.floor(currentAllocation[idx].conversions * 1.25);
    return {
      channel,
      recommended_pct: recommendedPct,
      recommended_spend: recommendedSpend,
      expected_conversions: expectedConversions,
      expected_cpa: Math.round(recommendedSpend / expectedConversions),
      expected_roi: currentAllocation[idx].roi * 1.15,
      change_from_current: recommendedPct - currentPct,
    };
  });

  return {
    optimization_id: generateUUID(),
    event_id: validatedInput.event_id,
    current_allocation: currentAllocation,
    optimized_allocation: optimizedAllocation,
    optimization_impact: {
      total_conversions_increase: 28,
      average_cpa_reduction: 18,
      overall_roi_improvement: 32,
    },
    channel_insights: [
      { channel: "email", strength: "최저 CPA, 최고 ROI", weakness: "도달 범위 제한", recommendation: "예산 증액 및 리스트 확장" },
      { channel: "paid_search", strength: "높은 구매 의도", weakness: "비용 상승 추세", recommendation: "롱테일 키워드 확대" },
      { channel: "social_ads", strength: "넓은 도달", weakness: "전환율 낮음", recommendation: "리타겟팅 집중" },
      { channel: "content", strength: "브랜드 인지도", weakness: "ROI 측정 어려움", recommendation: "SEO 강화로 유기적 유입 증가" },
    ],
    recommendations: [
      "이메일 마케팅 예산 30% 증액 - ROI 4.2배로 최고 효율",
      "소셜 광고 리타겟팅으로 전환 효율 개선",
      "검색 광고 롱테일 키워드로 CPA 20% 절감 가능",
      "콘텐츠 마케팅은 중장기 투자로 유지",
      "인플루언서 마케팅 파일럿 테스트 권장",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-017",
  taskName: "채널 믹스 최적화",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 17.10.a",
  skill: "Skill 17: Marketing Analytics",
  subSkill: "17.10: Channel Optimization",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
