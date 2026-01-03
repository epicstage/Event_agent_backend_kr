/**
 * MKTADV-033: 커뮤니티 관리
 * CMP-IS Reference: 18.9.a - Event community management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Event Community Manager for year-round engagement.`;

export const InputSchema = z.object({
  event_id: z.string(),
  community_platform: z.enum(["slack", "discord", "linkedin", "custom", "hybrid"]).optional(),
  management_action: z.enum(["health_check", "engagement_plan", "growth_strategy", "content_calendar"]).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  community_id: z.string(),
  event_id: z.string(),
  community_health: z.object({
    total_members: z.number(),
    active_members: z.number(),
    activity_rate: z.number(),
    growth_rate: z.number(),
    churn_rate: z.number(),
    engagement_score: z.number(),
  }),
  engagement_metrics: z.array(z.object({
    metric: z.string(),
    current_value: z.number(),
    benchmark: z.number(),
    trend: z.enum(["up", "down", "stable"]),
  })),
  member_segments: z.array(z.object({
    segment: z.string(),
    count: z.number(),
    characteristics: z.array(z.string()),
    engagement_level: z.string(),
    value_to_community: z.string(),
  })),
  content_performance: z.array(z.object({
    content_type: z.string(),
    posts: z.number(),
    avg_engagement: z.number(),
    best_time: z.string(),
    top_topics: z.array(z.string()),
  })),
  community_initiatives: z.array(z.object({
    initiative: z.string(),
    frequency: z.string(),
    participation_rate: z.number(),
    impact: z.string(),
    status: z.enum(["active", "planned", "completed"]),
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

  return {
    community_id: generateUUID(),
    event_id: validatedInput.event_id,
    community_health: {
      total_members: 3200,
      active_members: 1450,
      activity_rate: 45.3,
      growth_rate: 8.5,
      churn_rate: 3.2,
      engagement_score: 72,
    },
    engagement_metrics: [
      { metric: "일일 활성 사용자 (DAU)", current_value: 285, benchmark: 250, trend: "up" },
      { metric: "주간 활성 사용자 (WAU)", current_value: 1450, benchmark: 1200, trend: "up" },
      { metric: "평균 게시물/주", current_value: 125, benchmark: 100, trend: "stable" },
      { metric: "평균 댓글/게시물", current_value: 4.2, benchmark: 3.5, trend: "up" },
      { metric: "회원 간 연결", current_value: 2800, benchmark: 2500, trend: "up" },
    ],
    member_segments: [
      { segment: "슈퍼 유저", count: 85, characteristics: ["주 5회+ 활동", "콘텐츠 생산자", "신입 환영"], engagement_level: "매우 높음", value_to_community: "커뮤니티 문화 주도" },
      { segment: "활발한 참여자", count: 420, characteristics: ["주 2-4회 활동", "토론 참여", "이벤트 참석"], engagement_level: "높음", value_to_community: "활발한 대화 유지" },
      { segment: "관찰자", count: 680, characteristics: ["주 1회 방문", "콘텐츠 소비", "간헐적 반응"], engagement_level: "보통", value_to_community: "잠재적 참여자" },
      { segment: "휴면 회원", count: 2015, characteristics: ["월 1회 미만", "비활성"], engagement_level: "낮음", value_to_community: "재활성화 대상" },
    ],
    content_performance: [
      { content_type: "업계 뉴스", posts: 45, avg_engagement: 35, best_time: "화 오전 10시", top_topics: ["AI 트렌드", "시장 변화", "규제 업데이트"] },
      { content_type: "회원 소개", posts: 12, avg_engagement: 58, best_time: "월 오전 9시", top_topics: ["신입 환영", "성공 사례", "팀 소개"] },
      { content_type: "질문/토론", posts: 68, avg_engagement: 42, best_time: "수 오후 2시", top_topics: ["베스트 프랙티스", "기술 질문", "의견 요청"] },
      { content_type: "이벤트 안내", posts: 15, avg_engagement: 28, best_time: "목 오전 11시", top_topics: ["웨비나", "네트워킹", "컨퍼런스"] },
    ],
    community_initiatives: [
      { initiative: "주간 AMA 세션", frequency: "매주 목요일", participation_rate: 15, impact: "전문가 연결 강화", status: "active" },
      { initiative: "월간 네트워킹", frequency: "첫째 주 금요일", participation_rate: 8, impact: "회원 간 관계 형성", status: "active" },
      { initiative: "멘토링 프로그램", frequency: "분기별 매칭", participation_rate: 5, impact: "신규 회원 정착", status: "planned" },
      { initiative: "챌린지 이벤트", frequency: "분기별", participation_rate: 12, impact: "참여도 급상승", status: "completed" },
    ],
    recommendations: [
      "휴면 회원 재활성화 캠페인 실행 - 잠재 활성 회원 500명 확보 가능",
      "슈퍼 유저 인센티브 프로그램 강화 - 커뮤니티 문화 유지",
      "AMA 세션 녹화본 공유로 비동기 참여 확대",
      "관찰자 → 참여자 전환을 위한 환영 프로그램 도입",
      "회원 소개 콘텐츠 확대 - 최고 참여율 기록",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-033",
  taskName: "커뮤니티 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 18.9.a",
  skill: "Skill 18: CRM Integration",
  subSkill: "18.9: Community Engagement",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
