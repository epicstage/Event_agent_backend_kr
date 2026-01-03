/**
 * MKTADV-025: 참가자 행동 추적
 * CMP-IS Reference: 18.4.a - Attendee behavior tracking
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Attendee Behavior Analyst for event engagement optimization.`;

export const InputSchema = z.object({
  event_id: z.string(),
  tracking_scope: z.enum(["pre_event", "during_event", "post_event", "full_lifecycle"]).optional(),
  metrics_focus: z.array(z.enum(["engagement", "navigation", "content", "networking", "conversion"])).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  tracking_id: z.string(),
  event_id: z.string(),
  behavior_summary: z.object({
    total_tracked: z.number(),
    active_users: z.number(),
    avg_session_duration: z.string(),
    total_interactions: z.number(),
    engagement_score: z.number(),
  }),
  engagement_patterns: z.array(z.object({
    pattern: z.string(),
    user_count: z.number(),
    percentage: z.number(),
    avg_engagement: z.number(),
    conversion_rate: z.number(),
  })),
  content_interactions: z.array(z.object({
    content_type: z.string(),
    views: z.number(),
    completions: z.number(),
    avg_time: z.string(),
    engagement_rate: z.number(),
  })),
  navigation_flow: z.array(z.object({
    from_page: z.string(),
    to_page: z.string(),
    transitions: z.number(),
    drop_off_rate: z.number(),
  })),
  behavioral_segments: z.array(z.object({
    segment_name: z.string(),
    description: z.string(),
    user_count: z.number(),
    key_behaviors: z.array(z.string()),
    recommended_action: z.string(),
  })),
  insights: z.array(z.string()),
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
    tracking_id: generateUUID(),
    event_id: validatedInput.event_id,
    behavior_summary: {
      total_tracked: 2450,
      active_users: 1850,
      avg_session_duration: "12:35",
      total_interactions: 45000,
      engagement_score: 72,
    },
    engagement_patterns: [
      { pattern: "고참여자 (10+ 상호작용/일)", user_count: 380, percentage: 15.5, avg_engagement: 92, conversion_rate: 45 },
      { pattern: "중참여자 (5-9 상호작용/일)", user_count: 620, percentage: 25.3, avg_engagement: 68, conversion_rate: 28 },
      { pattern: "저참여자 (1-4 상호작용/일)", user_count: 850, percentage: 34.7, avg_engagement: 42, conversion_rate: 12 },
      { pattern: "수동적 (0 상호작용)", user_count: 600, percentage: 24.5, avg_engagement: 15, conversion_rate: 3 },
    ],
    content_interactions: [
      { content_type: "라이브 세션", views: 8500, completions: 6200, avg_time: "42:15", engagement_rate: 73 },
      { content_type: "온디맨드 영상", views: 12000, completions: 5400, avg_time: "18:30", engagement_rate: 45 },
      { content_type: "PDF 자료", views: 6800, completions: 4200, avg_time: "5:45", engagement_rate: 62 },
      { content_type: "인터랙티브 부스", views: 4500, completions: 2800, avg_time: "8:20", engagement_rate: 62 },
    ],
    navigation_flow: [
      { from_page: "홈", to_page: "프로그램", transitions: 12500, drop_off_rate: 15 },
      { from_page: "프로그램", to_page: "세션 상세", transitions: 8200, drop_off_rate: 22 },
      { from_page: "세션 상세", to_page: "등록", transitions: 3500, drop_off_rate: 35 },
      { from_page: "등록", to_page: "결제", transitions: 2100, drop_off_rate: 28 },
    ],
    behavioral_segments: [
      { segment_name: "열정적 학습자", description: "콘텐츠 소비 중심", user_count: 450, key_behaviors: ["세션 다중 참석", "자료 다운로드", "Q&A 참여"], recommended_action: "심화 콘텐츠 제공" },
      { segment_name: "네트워커", description: "관계 구축 중심", user_count: 320, key_behaviors: ["네트워킹 활발", "명함 교환", "1:1 미팅"], recommended_action: "VIP 네트워킹 초대" },
      { segment_name: "탐색자", description: "정보 수집 중심", user_count: 580, key_behaviors: ["부스 다수 방문", "자료 수집", "비교 탐색"], recommended_action: "맞춤 솔루션 제안" },
      { segment_name: "관망자", description: "수동적 참여", user_count: 500, key_behaviors: ["최소 참여", "단일 세션", "빠른 이탈"], recommended_action: "참여 유도 캠페인" },
    ],
    insights: [
      "고참여자의 전환율이 저참여자 대비 15배 높음",
      "세션 완료율이 네트워킹 참여와 강한 상관관계",
      "모바일 사용자의 세션 시간이 데스크톱 대비 40% 짧음",
      "오전 10시-12시가 가장 높은 참여 시간대",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-025",
  taskName: "참가자 행동 추적",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 18.4.a",
  skill: "Skill 18: CRM Integration",
  subSkill: "18.4: Behavior Analytics",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
