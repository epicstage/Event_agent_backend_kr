/**
 * MKTADV-031: 사후 이벤트 후속 조치
 * CMP-IS Reference: 18.8.a - Post-event follow-up management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Post-Event Follow-Up Strategist for maximizing event ROI.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_date: z.string(),
  follow_up_type: z.enum(["immediate", "nurture_sequence", "sales_handoff", "feedback"]).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  follow_up_id: z.string(),
  event_id: z.string(),
  follow_up_timeline: z.array(z.object({
    day: z.number(),
    action: z.string(),
    channel: z.string(),
    segment: z.string(),
    content_type: z.string(),
    goal: z.string(),
    expected_response: z.number(),
  })),
  attendee_segments: z.array(z.object({
    segment: z.string(),
    count: z.number(),
    engagement_level: z.string(),
    follow_up_priority: z.enum(["immediate", "high", "medium", "low"]),
    recommended_approach: z.string(),
  })),
  content_assets: z.array(z.object({
    asset_type: z.string(),
    title: z.string(),
    target_segment: z.string(),
    availability: z.string(),
    expected_engagement: z.number(),
  })),
  sales_handoff: z.object({
    qualified_leads: z.number(),
    hot_leads: z.number(),
    handoff_package: z.array(z.string()),
    sla_days: z.number(),
  }),
  feedback_collection: z.object({
    survey_type: z.string(),
    target_response_rate: z.number(),
    incentive: z.string(),
    key_questions: z.array(z.string()),
  }),
  success_metrics: z.array(z.object({
    metric: z.string(),
    target: z.string(),
    measurement_method: z.string(),
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
    follow_up_id: generateUUID(),
    event_id: validatedInput.event_id,
    follow_up_timeline: [
      { day: 0, action: "감사 이메일 발송", channel: "email", segment: "전체 참가자", content_type: "thank_you", goal: "관계 유지", expected_response: 55 },
      { day: 1, action: "설문 조사 발송", channel: "email", segment: "전체 참가자", content_type: "survey", goal: "피드백 수집", expected_response: 35 },
      { day: 2, action: "Hot 리드 영업 연락", channel: "phone", segment: "Hot 리드", content_type: "sales_call", goal: "미팅 설정", expected_response: 40 },
      { day: 3, action: "세션 녹화 공유", channel: "email", segment: "참가자", content_type: "content", goal: "가치 제공", expected_response: 45 },
      { day: 5, action: "발표 자료 공유", channel: "email", segment: "세션 참석자", content_type: "resources", goal: "참여 유지", expected_response: 38 },
      { day: 7, action: "하이라이트 영상 공유", channel: "social", segment: "전체", content_type: "video", goal: "브랜드 강화", expected_response: 25 },
      { day: 14, action: "다음 이벤트 안내", channel: "email", segment: "참가자", content_type: "promotion", goal: "재등록 유도", expected_response: 18 },
    ],
    attendee_segments: [
      { segment: "Hot 리드 (데모 요청)", count: 45, engagement_level: "매우 높음", follow_up_priority: "immediate", recommended_approach: "24시간 내 영업 연락" },
      { segment: "Warm 리드 (고참여)", count: 180, engagement_level: "높음", follow_up_priority: "high", recommended_approach: "맞춤 콘텐츠 + 1주 내 연락" },
      { segment: "일반 참가자", count: 520, engagement_level: "보통", follow_up_priority: "medium", recommended_approach: "육성 캠페인 등록" },
      { segment: "노쇼", count: 85, engagement_level: "낮음", follow_up_priority: "low", recommended_approach: "콘텐츠 공유 + 재참여 유도" },
    ],
    content_assets: [
      { asset_type: "세션 녹화", title: "전체 세션 온디맨드", target_segment: "참가자", availability: "D+3", expected_engagement: 65 },
      { asset_type: "발표 자료", title: "연사 슬라이드 팩", target_segment: "세션 참석자", availability: "D+5", expected_engagement: 55 },
      { asset_type: "하이라이트", title: "이벤트 하이라이트 영상", target_segment: "전체", availability: "D+7", expected_engagement: 40 },
      { asset_type: "인포그래픽", title: "주요 인사이트 요약", target_segment: "소셜 공유", availability: "D+10", expected_engagement: 35 },
    ],
    sales_handoff: {
      qualified_leads: 225,
      hot_leads: 45,
      handoff_package: ["참석 이력", "참여 점수", "관심 세션", "부스 방문", "데모 요청", "명함 교환"],
      sla_days: 3,
    },
    feedback_collection: {
      survey_type: "NPS + 상세 피드백",
      target_response_rate: 35,
      incentive: "추첨 기프트카드 $50",
      key_questions: ["전반적 만족도", "콘텐츠 품질", "네트워킹 가치", "재참가 의향", "개선 제안"],
    },
    success_metrics: [
      { metric: "이메일 오픈율", target: "> 45%", measurement_method: "이메일 플랫폼 트래킹" },
      { metric: "설문 응답률", target: "> 35%", measurement_method: "설문 완료 수 / 발송 수" },
      { metric: "Hot 리드 미팅 전환", target: "> 40%", measurement_method: "미팅 설정 / Hot 리드 수" },
      { metric: "콘텐츠 다운로드율", target: "> 25%", measurement_method: "다운로드 / 이메일 수신자" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-031",
  taskName: "사후 이벤트 후속 조치",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 18.8.a",
  skill: "Skill 18: CRM Integration",
  subSkill: "18.8: Post-Event Engagement",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
