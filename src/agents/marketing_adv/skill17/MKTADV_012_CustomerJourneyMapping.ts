/**
 * MKTADV-012: 고객 여정 매핑
 * CMP-IS Reference: 17.4.b - Customer journey mapping and analysis
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Customer Journey Analyst for event marketing.`;

export const InputSchema = z.object({
  event_id: z.string(),
  journey_type: z.enum(["prospect", "registrant", "attendee", "advocate"]),
  touchpoint_data: z.array(z.object({
    touchpoint: z.string(),
    channel: z.string(),
    interactions: z.number(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  journey_id: z.string(),
  event_id: z.string(),
  journey_stages: z.array(z.object({
    stage: z.string(),
    description: z.string(),
    touchpoints: z.array(z.string()),
    emotions: z.enum(["positive", "neutral", "negative"]),
    pain_points: z.array(z.string()),
    opportunities: z.array(z.string()),
  })),
  key_moments: z.array(z.object({
    moment: z.string(),
    importance: z.enum(["critical", "high", "medium"]),
    current_performance: z.number(),
    improvement_potential: z.string(),
  })),
  drop_off_points: z.array(z.object({
    stage: z.string(),
    drop_off_rate: z.number(),
    reason: z.string(),
    suggested_fix: z.string(),
  })),
  optimization_recommendations: z.array(z.string()),
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

  const journeyStages = [
    {
      stage: "인지 (Awareness)",
      description: "이벤트 존재를 처음 알게 되는 단계",
      touchpoints: ["소셜 미디어", "검색 광고", "이메일", "추천"],
      emotions: "neutral" as const,
      pain_points: ["정보 부족", "경쟁 이벤트와 혼동"],
      opportunities: ["차별화된 가치 제안", "타겟 광고"],
    },
    {
      stage: "고려 (Consideration)",
      description: "이벤트 참가를 검토하는 단계",
      touchpoints: ["웹사이트", "프로그램 페이지", "연사 정보"],
      emotions: "positive" as const,
      pain_points: ["상세 정보 부족", "가격 비교 어려움"],
      opportunities: ["비교 콘텐츠", "얼리버드 할인"],
    },
    {
      stage: "결정 (Decision)",
      description: "등록을 결정하는 단계",
      touchpoints: ["등록 페이지", "결제 시스템"],
      emotions: "neutral" as const,
      pain_points: ["복잡한 등록 절차", "결제 옵션 제한"],
      opportunities: ["간소화된 폼", "다양한 결제 수단"],
    },
    {
      stage: "참가 (Participation)",
      description: "실제 이벤트 참가 단계",
      touchpoints: ["체크인", "세션", "네트워킹"],
      emotions: "positive" as const,
      pain_points: ["네비게이션 어려움", "세션 충돌"],
      opportunities: ["앱 가이드", "개인화 추천"],
    },
    {
      stage: "사후 (Post-Event)",
      description: "이벤트 종료 후 단계",
      touchpoints: ["설문", "콘텐츠 공유", "네트워킹 후속"],
      emotions: "positive" as const,
      pain_points: ["콘텐츠 접근성", "연결 유지"],
      opportunities: ["온디맨드 콘텐츠", "커뮤니티 구축"],
    },
  ];

  return {
    journey_id: generateUUID(),
    event_id: validatedInput.event_id,
    journey_stages: journeyStages,
    key_moments: [
      { moment: "첫 웹사이트 방문", importance: "critical", current_performance: 72, improvement_potential: "랜딩페이지 개선으로 +15%" },
      { moment: "등록 완료", importance: "critical", current_performance: 45, improvement_potential: "폼 간소화로 +20%" },
      { moment: "첫 세션 참가", importance: "high", current_performance: 85, improvement_potential: "온보딩 개선으로 +5%" },
    ],
    drop_off_points: [
      { stage: "고려 → 결정", drop_off_rate: 55, reason: "가격 장벽", suggested_fix: "분할 결제 옵션 도입" },
      { stage: "결정 → 등록완료", drop_off_rate: 28, reason: "복잡한 폼", suggested_fix: "필수 필드 최소화" },
    ],
    optimization_recommendations: [
      "등록 폼 필드 50% 감소로 전환율 개선",
      "가격 페이지에 ROI 계산기 추가",
      "참가 후 24시간 내 피드백 요청으로 응답률 향상",
      "모바일 체크인 경험 최적화",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-012",
  taskName: "고객 여정 매핑",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 17.4.b",
  skill: "Skill 17: Marketing Analytics",
  subSkill: "17.4: Audience Analysis",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
