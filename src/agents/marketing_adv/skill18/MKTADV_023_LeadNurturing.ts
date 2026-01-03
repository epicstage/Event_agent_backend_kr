/**
 * MKTADV-023: 리드 육성 캠페인
 * CMP-IS Reference: 18.2.b - Lead nurturing campaign management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Lead Nurturing Strategist for event follow-up campaigns.`;

export const InputSchema = z.object({
  event_id: z.string(),
  lead_segment: z.enum(["hot", "warm", "cool", "cold", "all"]).optional(),
  nurture_goal: z.enum(["demo_request", "content_engagement", "event_reregistration", "product_trial"]).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  campaign_id: z.string(),
  event_id: z.string(),
  campaign_config: z.object({
    name: z.string(),
    goal: z.string(),
    target_segment: z.string(),
    duration_days: z.number(),
    total_touchpoints: z.number(),
  }),
  nurture_sequence: z.array(z.object({
    step: z.number(),
    day: z.number(),
    channel: z.string(),
    content_type: z.string(),
    subject: z.string(),
    goal: z.string(),
    expected_engagement: z.number(),
  })),
  personalization_rules: z.array(z.object({
    condition: z.string(),
    variation: z.string(),
    content_change: z.string(),
  })),
  exit_triggers: z.array(z.object({
    trigger: z.string(),
    action: z.string(),
    next_step: z.string(),
  })),
  performance_forecast: z.object({
    expected_engagement_rate: z.number(),
    expected_conversion_rate: z.number(),
    estimated_pipeline_value: z.number(),
  }),
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

  const segment = validatedInput.lead_segment || "warm";
  const goal = validatedInput.nurture_goal || "demo_request";

  return {
    campaign_id: generateUUID(),
    event_id: validatedInput.event_id,
    campaign_config: {
      name: `Post-Event ${segment.toUpperCase()} Lead Nurture - ${goal}`,
      goal: goal === "demo_request" ? "데모 요청 유도" : "콘텐츠 참여 증대",
      target_segment: `${segment} 리드 세그먼트`,
      duration_days: 30,
      total_touchpoints: 8,
    },
    nurture_sequence: [
      { step: 1, day: 1, channel: "email", content_type: "thank_you", subject: "이벤트 참석 감사합니다", goal: "관계 유지", expected_engagement: 45 },
      { step: 2, day: 3, channel: "email", content_type: "content", subject: "놓치신 세션 다시보기", goal: "가치 제공", expected_engagement: 35 },
      { step: 3, day: 7, channel: "email", content_type: "case_study", subject: "성공 사례: [산업] 기업의 변화", goal: "신뢰 구축", expected_engagement: 28 },
      { step: 4, day: 10, channel: "linkedin", content_type: "connection", subject: "LinkedIn 연결 요청", goal: "채널 확장", expected_engagement: 22 },
      { step: 5, day: 14, channel: "email", content_type: "webinar_invite", subject: "심화 웨비나 초대", goal: "추가 참여", expected_engagement: 18 },
      { step: 6, day: 18, channel: "email", content_type: "product_info", subject: "솔루션 가이드 공유", goal: "제품 인지", expected_engagement: 15 },
      { step: 7, day: 24, channel: "email", content_type: "demo_offer", subject: "1:1 데모 기회", goal: "전환 유도", expected_engagement: 12 },
      { step: 8, day: 30, channel: "phone", content_type: "follow_up_call", subject: "후속 전화", goal: "직접 대화", expected_engagement: 8 },
    ],
    personalization_rules: [
      { condition: "참석 세션 3개 이상", variation: "고참여자", content_change: "심화 콘텐츠 제공" },
      { condition: "부스 방문 있음", variation: "제품 관심자", content_change: "제품 정보 우선 제공" },
      { condition: "VIP 티켓 구매", variation: "VIP", content_change: "임원 레벨 콘텐츠" },
      { condition: "이전 참가자", variation: "리피터", content_change: "로열티 혜택 강조" },
    ],
    exit_triggers: [
      { trigger: "데모 요청", action: "캠페인 종료", next_step: "영업팀 전달" },
      { trigger: "구독 취소", action: "캠페인 종료", next_step: "재참여 캠페인" },
      { trigger: "3회 연속 미오픈", action: "휴면 처리", next_step: "재활성화 캠페인" },
      { trigger: "웹사이트 10회 이상 방문", action: "점수 상향", next_step: "Hot 리드 캠페인" },
    ],
    performance_forecast: {
      expected_engagement_rate: 32,
      expected_conversion_rate: 8.5,
      estimated_pipeline_value: 125000,
    },
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "MKTADV-023",
  taskName: "리드 육성 캠페인",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 18.2.b",
  skill: "Skill 18: CRM Integration",
  subSkill: "18.2: Lead Management",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
