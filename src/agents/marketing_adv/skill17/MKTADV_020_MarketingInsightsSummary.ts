/**
 * MKTADV-020: 마케팅 인사이트 요약
 * CMP-IS Reference: 17.12.a - Marketing insights synthesis
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Marketing Insights Synthesizer for event strategy.`;

export const InputSchema = z.object({
  event_id: z.string(),
  analysis_scope: z.enum(["full_campaign", "pre_event", "during_event", "post_event"]).optional(),
  insight_focus: z.array(z.enum(["audience", "channels", "content", "timing", "pricing", "competitors"])).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  summary_id: z.string(),
  event_id: z.string(),
  key_insights: z.array(z.object({
    insight: z.string(),
    category: z.string(),
    confidence: z.enum(["high", "medium", "low"]),
    supporting_data: z.string(),
    business_impact: z.string(),
  })),
  audience_insights: z.object({
    primary_persona: z.object({
      description: z.string(),
      key_motivators: z.array(z.string()),
      preferred_channels: z.array(z.string()),
      conversion_triggers: z.array(z.string()),
    }),
    segment_performance: z.array(z.object({
      segment: z.string(),
      conversion_rate: z.number(),
      avg_ticket_value: z.number(),
      engagement_score: z.number(),
    })),
  }),
  channel_insights: z.object({
    best_performing: z.string(),
    highest_roi: z.string(),
    emerging_opportunity: z.string(),
    declining_effectiveness: z.string(),
  }),
  timing_insights: z.object({
    optimal_campaign_start: z.string(),
    peak_registration_period: z.string(),
    key_milestone_impacts: z.array(z.object({
      milestone: z.string(),
      impact: z.string(),
    })),
  }),
  strategic_recommendations: z.array(z.object({
    recommendation: z.string(),
    expected_impact: z.string(),
    implementation_effort: z.enum(["low", "medium", "high"]),
    priority: z.number(),
  })),
  lessons_learned: z.array(z.string()),
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
    summary_id: generateUUID(),
    event_id: validatedInput.event_id,
    key_insights: [
      {
        insight: "이전 참가자의 재등록률이 신규 대비 3배 높음",
        category: "audience",
        confidence: "high",
        supporting_data: "재등록률 45% vs 신규 전환율 15%",
        business_impact: "CAC 60% 절감 가능",
      },
      {
        insight: "D-14 시점 리마인더가 전체 등록의 35% 유도",
        category: "timing",
        confidence: "high",
        supporting_data: "D-14 캠페인 전환율 8.5% (평균 3.2%)",
        business_impact: "등록 목표 달성의 핵심 시점",
      },
      {
        insight: "모바일 트래픽 65%지만 전환은 35%에 불과",
        category: "channels",
        confidence: "high",
        supporting_data: "모바일 CVR 2.1% vs 데스크톱 6.8%",
        business_impact: "모바일 최적화로 등록 40% 증가 가능",
      },
      {
        insight: "연사 관련 콘텐츠가 일반 콘텐츠 대비 2.5배 참여",
        category: "content",
        confidence: "medium",
        supporting_data: "연사 콘텐츠 참여율 12.5% vs 평균 5%",
        business_impact: "콘텐츠 전략 재수립 필요",
      },
    ],
    audience_insights: {
      primary_persona: {
        description: "35-45세 중간관리자, 업계 경력 10년+, 네트워킹 중시",
        key_motivators: ["최신 트렌드 습득", "동료 네트워킹", "경력 개발"],
        preferred_channels: ["이메일", "LinkedIn", "업계 미디어"],
        conversion_triggers: ["얼리버드 마감", "연사 발표", "동료 참가 확인"],
      },
      segment_performance: [
        { segment: "이전 참가자", conversion_rate: 45, avg_ticket_value: 450, engagement_score: 85 },
        { segment: "뉴스레터 구독자", conversion_rate: 18, avg_ticket_value: 380, engagement_score: 72 },
        { segment: "콜드 리드", conversion_rate: 3, avg_ticket_value: 350, engagement_score: 45 },
        { segment: "파트너 추천", conversion_rate: 28, avg_ticket_value: 520, engagement_score: 78 },
      ],
    },
    channel_insights: {
      best_performing: "이메일 - CPA $15, ROI 4.2x",
      highest_roi: "오가닉 검색 - CPA $0, 전환 71건",
      emerging_opportunity: "LinkedIn 광고 - CTR 상승 추세",
      declining_effectiveness: "디스플레이 광고 - CTR 0.1% 하락 중",
    },
    timing_insights: {
      optimal_campaign_start: "이벤트 D-60 시점",
      peak_registration_period: "D-14 ~ D-7 구간 (전체 등록의 40%)",
      key_milestone_impacts: [
        { milestone: "얼리버드 마감", impact: "등록 스파이크 25% 증가" },
        { milestone: "연사 발표", impact: "웹사이트 트래픽 3배 증가" },
        { milestone: "프로그램 공개", impact: "전환율 1.5%p 상승" },
      ],
    },
    strategic_recommendations: [
      { recommendation: "이전 참가자 VIP 프로그램 도입", expected_impact: "재등록률 60%로 향상", implementation_effort: "medium", priority: 1 },
      { recommendation: "모바일 등록 경험 전면 개선", expected_impact: "모바일 전환 2배 증가", implementation_effort: "high", priority: 2 },
      { recommendation: "D-14 캠페인 예산 2배 증액", expected_impact: "등록 15% 추가 확보", implementation_effort: "low", priority: 3 },
      { recommendation: "연사 중심 콘텐츠 시리즈 제작", expected_impact: "참여도 30% 향상", implementation_effort: "medium", priority: 4 },
    ],
    lessons_learned: [
      "조기 마케팅 시작이 중요 - D-90부터 인지도 캠페인 필요",
      "이메일 세분화가 성과 핵심 - 개인화율과 전환율 정비례",
      "모바일 우선 전략 필수 - 트래픽 대비 전환 갭 해소 시급",
      "마일스톤 기반 캠페인이 효과적 - 자연스러운 긴급성 창출",
      "경쟁사 동향 모니터링 강화 필요 - 가격 민감도 높음",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-020",
  taskName: "마케팅 인사이트 요약",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 17.12.a",
  skill: "Skill 17: Marketing Analytics",
  subSkill: "17.12: Insights Synthesis",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
