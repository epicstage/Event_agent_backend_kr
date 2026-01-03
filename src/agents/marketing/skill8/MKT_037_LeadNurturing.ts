/**
 * MKT-037: 리드 너처링
 * CMP-IS Reference: 8.5.a - Lead nurturing and engagement
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Lead Nurturing Agent.
CMP-IS Standard: 8.5.a - Nurturing leads through personalized engagement journeys.`;

export const InputSchema = z.object({
  event_id: z.string(),
  lead_id: z.string().optional(),
  lead_segment: z.string(),
  current_stage: z.string(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  nurturing_id: z.string(),
  event_id: z.string(),
  lead_profile: z.object({
    segment: z.string(),
    stage: z.string(),
    engagement_score: z.number(),
    last_interaction: z.string(),
    interactions_count: z.number(),
  }),
  nurturing_journey: z.array(z.object({
    step: z.number(),
    action: z.string(),
    channel: z.string(),
    timing: z.string(),
    content: z.string(),
    goal: z.string(),
  })),
  personalization: z.object({
    recommended_content: z.array(z.string()),
    preferred_channels: z.array(z.string()),
    optimal_send_times: z.array(z.string()),
    messaging_tone: z.string(),
  }),
  automation_triggers: z.array(z.object({ trigger: z.string(), action: z.string(), condition: z.string() })),
  scoring_model: z.object({
    current_score: z.number(),
    threshold_mqr: z.number(),
    threshold_sql: z.number(),
    score_factors: z.array(z.object({ factor: z.string(), weight: z.number(), current_points: z.number() })),
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
    nurturing_id: generateUUID(),
    event_id: validatedInput.event_id,
    lead_profile: {
      segment: validatedInput.lead_segment,
      stage: validatedInput.current_stage,
      engagement_score: 65,
      last_interaction: new Date(Date.now() - 172800000).toISOString(),
      interactions_count: 5,
    },
    nurturing_journey: [
      { step: 1, action: "웰컴 이메일", channel: "Email", timing: "즉시", content: "이벤트 소개 및 가치 제안", goal: "인지도 향상" },
      { step: 2, action: "연사 하이라이트", channel: "Email", timing: "+3일", content: "주요 연사 소개", goal: "관심 유발" },
      { step: 3, action: "리타겟팅 광고", channel: "Meta", timing: "+5일", content: "세션 미리보기", goal: "재방문 유도" },
      { step: 4, action: "얼리버드 알림", channel: "Email", timing: "+7일", content: "할인 혜택 안내", goal: "등록 유도" },
      { step: 5, action: "마감 임박", channel: "SMS", timing: "+10일", content: "마감 리마인더", goal: "전환" },
    ],
    personalization: {
      recommended_content: ["연사 인터뷰 영상", "작년 하이라이트", "네트워킹 가이드"],
      preferred_channels: ["이메일", "LinkedIn"],
      optimal_send_times: ["화요일 오전 10시", "목요일 오후 2시"],
      messaging_tone: "전문적이면서 친근한",
    },
    automation_triggers: [
      { trigger: "이메일 오픈", action: "관련 콘텐츠 추가 발송", condition: "2회 연속 오픈" },
      { trigger: "가격 페이지 방문", action: "할인 코드 발송", condition: "3회 이상 방문" },
      { trigger: "등록 시작 후 이탈", action: "장바구니 리마인더", condition: "24시간 미완료" },
      { trigger: "점수 70점 도달", action: "영업팀 알림", condition: "MQL 임계치 도달" },
    ],
    scoring_model: {
      current_score: 65,
      threshold_mqr: 50,
      threshold_sql: 80,
      score_factors: [
        { factor: "이메일 오픈", weight: 5, current_points: 15 },
        { factor: "링크 클릭", weight: 10, current_points: 20 },
        { factor: "페이지 방문", weight: 3, current_points: 15 },
        { factor: "콘텐츠 다운로드", weight: 15, current_points: 15 },
        { factor: "등록 시작", weight: 20, current_points: 0 },
      ],
    },
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-037";
export const taskName = "리드 너처링";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 8.5.a";
export const skill = "Skill 8: Execute Marketing";
export const subSkill = "8.5: Lead Management";

export default { taskId, taskName, taskType, cmpReference, skill, subSkill, AGENT_PERSONA, InputSchema, OutputSchema, execute };
