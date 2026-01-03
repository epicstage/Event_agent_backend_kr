/**
 * MKTADV-032: 피드백 분석
 * CMP-IS Reference: 18.8.b - Post-event feedback analysis
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Event Feedback Analyst for actionable insights.`;

export const InputSchema = z.object({
  event_id: z.string(),
  feedback_sources: z.array(z.enum(["survey", "social", "email_replies", "support_tickets", "reviews"])).optional(),
  analysis_depth: z.enum(["summary", "detailed", "comprehensive"]).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string(),
  event_id: z.string(),
  overall_metrics: z.object({
    total_responses: z.number(),
    response_rate: z.number(),
    nps_score: z.number(),
    csat_score: z.number(),
    avg_rating: z.number(),
  }),
  category_scores: z.array(z.object({
    category: z.string(),
    score: z.number(),
    vs_benchmark: z.number(),
    trend: z.enum(["up", "down", "stable"]),
    key_feedback: z.array(z.string()),
  })),
  sentiment_analysis: z.object({
    positive_percentage: z.number(),
    neutral_percentage: z.number(),
    negative_percentage: z.number(),
    top_positive_themes: z.array(z.string()),
    top_negative_themes: z.array(z.string()),
  }),
  verbatim_highlights: z.object({
    praise: z.array(z.object({
      quote: z.string(),
      category: z.string(),
    })),
    criticism: z.array(z.object({
      quote: z.string(),
      category: z.string(),
    })),
    suggestions: z.array(z.object({
      quote: z.string(),
      feasibility: z.enum(["high", "medium", "low"]),
    })),
  }),
  action_items: z.array(z.object({
    priority: z.enum(["critical", "high", "medium", "low"]),
    area: z.string(),
    issue: z.string(),
    recommended_action: z.string(),
    owner: z.string(),
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
    analysis_id: generateUUID(),
    event_id: validatedInput.event_id,
    overall_metrics: {
      total_responses: 385,
      response_rate: 38.5,
      nps_score: 42,
      csat_score: 4.2,
      avg_rating: 4.3,
    },
    category_scores: [
      { category: "콘텐츠 품질", score: 4.5, vs_benchmark: 8, trend: "up", key_feedback: ["연사 수준 높음", "실용적 내용", "최신 트렌드 반영"] },
      { category: "네트워킹 기회", score: 4.2, vs_benchmark: 5, trend: "stable", key_feedback: ["충분한 시간", "다양한 참가자", "앱 매칭 유용"] },
      { category: "장소/시설", score: 3.8, vs_benchmark: -5, trend: "down", key_feedback: ["Wi-Fi 불안정", "좌석 부족", "위치 접근성 좋음"] },
      { category: "등록/체크인", score: 4.0, vs_benchmark: 0, trend: "stable", key_feedback: ["빠른 체크인", "앱 편리", "대기 시간 있음"] },
      { category: "케이터링", score: 3.5, vs_benchmark: -10, trend: "down", key_feedback: ["다양성 부족", "채식 옵션 필요", "커피 품질 좋음"] },
    ],
    sentiment_analysis: {
      positive_percentage: 68,
      neutral_percentage: 22,
      negative_percentage: 10,
      top_positive_themes: ["연사 전문성", "네트워킹 가치", "콘텐츠 실용성", "조직력"],
      top_negative_themes: ["Wi-Fi 품질", "식사 다양성", "세션 충돌", "가격"],
    },
    verbatim_highlights: {
      praise: [
        { quote: "올해 참석한 이벤트 중 최고의 연사 라인업", category: "콘텐츠" },
        { quote: "네트워킹 시간 덕분에 3건의 비즈니스 기회 확보", category: "네트워킹" },
        { quote: "체크인이 1분도 안 걸려서 놀랐어요", category: "운영" },
      ],
      criticism: [
        { quote: "Wi-Fi가 계속 끊겨서 실시간 참여가 어려웠습니다", category: "시설" },
        { quote: "채식 옵션이 너무 제한적이었어요", category: "케이터링" },
        { quote: "가격 대비 티켓 가치가 아쉬움", category: "가격" },
      ],
      suggestions: [
        { quote: "세션별 Q&A 시간을 늘려주세요", feasibility: "high" },
        { quote: "앱에 AI 매칭 기능이 있으면 좋겠어요", feasibility: "medium" },
        { quote: "2일 코스로 확대하면 좋겠습니다", feasibility: "low" },
      ],
    },
    action_items: [
      { priority: "critical", area: "시설", issue: "Wi-Fi 불안정", recommended_action: "다음 이벤트 전용 네트워크 구축", owner: "운영팀" },
      { priority: "high", area: "케이터링", issue: "식사 다양성 부족", recommended_action: "채식/특수식 옵션 확대", owner: "케이터링 담당" },
      { priority: "medium", area: "프로그램", issue: "세션 충돌", recommended_action: "핵심 세션 스케줄 최적화", owner: "프로그램팀" },
      { priority: "low", area: "운영", issue: "체크인 대기", recommended_action: "셀프 키오스크 추가 배치", owner: "등록팀" },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-032",
  taskName: "피드백 분석",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 18.8.b",
  skill: "Skill 18: CRM Integration",
  subSkill: "18.8: Post-Event Engagement",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
