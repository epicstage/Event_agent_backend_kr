/**
 * MKT-040: 사후 이벤트 마케팅
 * CMP-IS Reference: 8.6.a - Post-event marketing and follow-up
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Post-Event Marketing Agent.
CMP-IS Standard: 8.6.a - Executing post-event marketing for engagement and future event promotion.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_date: z.string(),
  attendee_count: z.number(),
  next_event_date: z.string().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  post_event_id: z.string(),
  event_id: z.string(),
  follow_up_sequence: z.array(z.object({
    timing: z.string(),
    action: z.string(),
    channel: z.string(),
    content: z.string(),
    goal: z.string(),
  })),
  content_repurposing: z.array(z.object({
    original_content: z.string(),
    repurposed_formats: z.array(z.string()),
    distribution_channels: z.array(z.string()),
    timeline: z.string(),
  })),
  feedback_collection: z.object({
    survey_sent: z.number(),
    responses: z.number(),
    response_rate: z.number(),
    nps_score: z.number(),
    key_feedback: z.array(z.string()),
  }),
  engagement_activities: z.array(z.object({
    activity: z.string(),
    target_audience: z.string(),
    timing: z.string(),
    expected_engagement: z.string(),
  })),
  next_event_promotion: z.object({
    early_access_sent: z.number(),
    early_registrations: z.number(),
    conversion_rate: z.number(),
    special_offers: z.array(z.string()),
  }),
  metrics: z.object({
    content_views: z.number(),
    social_shares: z.number(),
    email_engagement_rate: z.number(),
    community_growth: z.number(),
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
    post_event_id: generateUUID(),
    event_id: validatedInput.event_id,
    follow_up_sequence: [
      { timing: "D+1", action: "감사 이메일", channel: "Email", content: "참석 감사 + 피드백 설문", goal: "감사 표현 및 피드백 수집" },
      { timing: "D+3", action: "하이라이트 공유", channel: "Email + Social", content: "행사 사진 및 영상 하이라이트", goal: "경험 리마인드" },
      { timing: "D+7", action: "세션 녹화 공개", channel: "Email", content: "주요 세션 다시보기 링크", goal: "콘텐츠 가치 연장" },
      { timing: "D+14", action: "인사이트 리포트", channel: "Email", content: "행사 핵심 인사이트 요약", goal: "전문성 강화" },
      { timing: "D+30", action: "다음 행사 예고", channel: "Email", content: "얼리버드 독점 접근", goal: "다음 행사 준비" },
    ],
    content_repurposing: [
      { original_content: "키노트 세션", repurposed_formats: ["블로그 포스트", "인포그래픽", "숏폼 클립"], distribution_channels: ["웹사이트", "LinkedIn", "YouTube"], timeline: "D+3~D+14" },
      { original_content: "패널 토론", repurposed_formats: ["팟캐스트 에피소드", "인용 카드", "기사"], distribution_channels: ["Spotify", "Instagram", "미디어"], timeline: "D+7~D+21" },
      { original_content: "네트워킹 하이라이트", repurposed_formats: ["사진 갤러리", "참석자 인터뷰", "커뮤니티 스토리"], distribution_channels: ["Instagram", "LinkedIn", "뉴스레터"], timeline: "D+1~D+7" },
    ],
    feedback_collection: {
      survey_sent: validatedInput.attendee_count,
      responses: Math.round(validatedInput.attendee_count * 0.35),
      response_rate: 35,
      nps_score: 72,
      key_feedback: [
        "세션 품질 높음 (4.5/5)",
        "네트워킹 시간 더 필요",
        "모바일 앱 개선 요청",
        "점심 시간 연장 희망",
        "하이브리드 옵션 좋았음",
      ],
    },
    engagement_activities: [
      { activity: "온라인 커뮤니티 오픈", target_audience: "전체 참석자", timing: "D+7", expected_engagement: "참석자 40% 가입" },
      { activity: "연사 Q&A 세션", target_audience: "관심 참석자", timing: "D+14", expected_engagement: "200명 참여" },
      { activity: "네트워킹 후속 모임", target_audience: "적극 참여자", timing: "D+30", expected_engagement: "50명 참석" },
    ],
    next_event_promotion: {
      early_access_sent: validatedInput.attendee_count,
      early_registrations: Math.round(validatedInput.attendee_count * 0.15),
      conversion_rate: 15,
      special_offers: [
        "참석자 전용 30% 얼리버드",
        "그룹 등록 추가 10% 할인",
        "VIP 업그레이드 무료",
      ],
    },
    metrics: {
      content_views: 25000,
      social_shares: 1500,
      email_engagement_rate: 42,
      community_growth: 500,
    },
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-040";
export const taskName = "사후 이벤트 마케팅";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.6.a";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.6: Post-Event Marketing";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
