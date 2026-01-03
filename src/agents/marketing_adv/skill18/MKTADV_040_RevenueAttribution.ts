/**
 * MKTADV-040: 수익 귀속 분석
 * CMP-IS Reference: 18.12.b - Marketing revenue attribution
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Revenue Attribution Analyst for event marketing ROI.`;

export const InputSchema = z.object({
  event_id: z.string(),
  attribution_model: z.enum(["first_touch", "last_touch", "linear", "time_decay", "position_based", "data_driven"]).optional(),
  analysis_period: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  attribution_id: z.string(),
  event_id: z.string(),
  revenue_summary: z.object({
    total_revenue: z.number(),
    attributed_revenue: z.number(),
    attribution_rate: z.number(),
    total_conversions: z.number(),
    avg_deal_size: z.number(),
  }),
  channel_attribution: z.array(z.object({
    channel: z.string(),
    attributed_revenue: z.number(),
    revenue_share: z.number(),
    conversions: z.number(),
    avg_deal_size: z.number(),
    cost: z.number(),
    roi: z.number(),
    cpa: z.number(),
  })),
  campaign_attribution: z.array(z.object({
    campaign: z.string(),
    channel: z.string(),
    attributed_revenue: z.number(),
    conversions: z.number(),
    cost: z.number(),
    roas: z.number(),
  })),
  touchpoint_analysis: z.object({
    avg_touchpoints_to_convert: z.number(),
    avg_days_to_convert: z.number(),
    common_paths: z.array(z.object({
      path: z.array(z.string()),
      conversions: z.number(),
      revenue: z.number(),
    })),
  }),
  model_comparison: z.array(z.object({
    model: z.string(),
    top_channel: z.string(),
    top_channel_share: z.number(),
    insights: z.string(),
  })),
  optimization_insights: z.array(z.object({
    insight: z.string(),
    impact: z.string(),
    recommended_action: z.string(),
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
    attribution_id: generateUUID(),
    event_id: validatedInput.event_id,
    revenue_summary: {
      total_revenue: 285000,
      attributed_revenue: 268000,
      attribution_rate: 94,
      total_conversions: 856,
      avg_deal_size: 313,
    },
    channel_attribution: [
      { channel: "이메일", attributed_revenue: 85000, revenue_share: 31.7, conversions: 285, avg_deal_size: 298, cost: 5000, roi: 17.0, cpa: 17.5 },
      { channel: "검색 광고", attributed_revenue: 62000, revenue_share: 23.1, conversions: 185, avg_deal_size: 335, cost: 18000, roi: 3.4, cpa: 97.3 },
      { channel: "소셜 광고", attributed_revenue: 48000, revenue_share: 17.9, conversions: 145, avg_deal_size: 331, cost: 15000, roi: 3.2, cpa: 103.4 },
      { channel: "오가닉 검색", attributed_revenue: 38000, revenue_share: 14.2, conversions: 125, avg_deal_size: 304, cost: 0, roi: 0, cpa: 0 },
      { channel: "직접 방문", attributed_revenue: 22000, revenue_share: 8.2, conversions: 78, avg_deal_size: 282, cost: 0, roi: 0, cpa: 0 },
      { channel: "파트너/추천", attributed_revenue: 13000, revenue_share: 4.9, conversions: 38, avg_deal_size: 342, cost: 3000, roi: 4.3, cpa: 78.9 },
    ],
    campaign_attribution: [
      { campaign: "얼리버드 프로모션", channel: "이메일", attributed_revenue: 45000, conversions: 150, cost: 2000, roas: 22.5 },
      { campaign: "브랜드 검색", channel: "검색 광고", attributed_revenue: 35000, conversions: 105, cost: 8000, roas: 4.4 },
      { campaign: "리마인더 시리즈", channel: "이메일", attributed_revenue: 28000, conversions: 95, cost: 1500, roas: 18.7 },
      { campaign: "리타겟팅", channel: "소셜 광고", attributed_revenue: 25000, conversions: 72, cost: 6000, roas: 4.2 },
      { campaign: "인지도 캠페인", channel: "소셜 광고", attributed_revenue: 18000, conversions: 58, cost: 8000, roas: 2.3 },
    ],
    touchpoint_analysis: {
      avg_touchpoints_to_convert: 4.2,
      avg_days_to_convert: 18,
      common_paths: [
        { path: ["소셜 광고", "웹사이트", "이메일", "등록"], conversions: 125, revenue: 42000 },
        { path: ["검색 광고", "웹사이트", "등록"], conversions: 98, revenue: 32000 },
        { path: ["이메일", "웹사이트", "이메일", "등록"], conversions: 85, revenue: 28000 },
        { path: ["오가닉", "웹사이트", "리타겟팅", "등록"], conversions: 72, revenue: 24000 },
      ],
    },
    model_comparison: [
      { model: "First Touch", top_channel: "소셜 광고", top_channel_share: 32, insights: "인지도 구축 채널 강조" },
      { model: "Last Touch", top_channel: "이메일", top_channel_share: 38, insights: "전환 채널 강조" },
      { model: "Linear", top_channel: "이메일", top_channel_share: 28, insights: "균등 기여 반영" },
      { model: "Time Decay", top_channel: "이메일", top_channel_share: 33, insights: "최근 접점 가중" },
      { model: "Position Based", top_channel: "소셜 광고", top_channel_share: 30, insights: "첫/마지막 접점 강조" },
    ],
    optimization_insights: [
      { insight: "이메일 ROI 17x로 최고 효율 채널", impact: "예산 재배분 시 +$25,000 추가 수익 가능", recommended_action: "이메일 예산 30% 증액" },
      { insight: "소셜 광고 인지도 역할 크지만 직접 전환 낮음", impact: "단독 평가 시 과소평가됨", recommended_action: "First-touch 관점 KPI 추가" },
      { insight: "평균 4.2 터치포인트로 멀티터치 여정 확인", impact: "단일 채널 귀속 시 왜곡 발생", recommended_action: "Linear 모델 병행 사용" },
      { insight: "검색 광고 CPA 높지만 딜 사이즈도 최고", impact: "고가치 고객 유입 채널", recommended_action: "CPA 보다 LTV 기준 평가" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-040",
  taskName: "수익 귀속 분석",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 18.12.b",
  skill: "Skill 18: CRM Integration",
  subSkill: "18.12: Revenue Optimization",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
