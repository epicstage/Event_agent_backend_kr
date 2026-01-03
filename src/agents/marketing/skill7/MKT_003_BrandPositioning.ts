/**
 * MKT-003: 브랜드 포지셔닝
 * CMP-IS Reference: 7.1.c - Developing brand positioning and messaging
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Brand Positioning Agent for event marketing.
CMP-IS Standard: 7.1.c - Developing unique brand positioning and compelling messaging.
You create differentiated positioning strategies and brand identities.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_type: z.string(),
  target_audience: z.string(),
  key_differentiators: z.array(z.string()).optional(),
  competitor_positioning: z.array(z.object({
    competitor: z.string(),
    positioning: z.string(),
  })).optional(),
  brand_values: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  positioning_id: z.string(),
  event_id: z.string(),
  brand_identity: z.object({
    brand_essence: z.string(),
    brand_promise: z.string(),
    brand_personality: z.array(z.string()),
    tone_of_voice: z.string(),
  }),
  positioning_statement: z.string(),
  value_proposition: z.object({
    headline: z.string(),
    subheadline: z.string(),
    key_benefits: z.array(z.string()),
    proof_points: z.array(z.string()),
  }),
  messaging_framework: z.object({
    primary_message: z.string(),
    secondary_messages: z.array(z.string()),
    call_to_action: z.string(),
    tagline_options: z.array(z.string()),
  }),
  differentiation_strategy: z.object({
    unique_selling_points: z.array(z.string()),
    competitive_advantages: z.array(z.string()),
    positioning_map: z.object({
      x_axis: z.string(),
      y_axis: z.string(),
      our_position: z.string(),
    }),
  }),
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
  const { event_name, event_type, target_audience } = validatedInput;

  return {
    positioning_id: generateUUID(),
    event_id: validatedInput.event_id,
    brand_identity: {
      brand_essence: `${event_type} 분야의 혁신과 성장을 이끄는 플랫폼`,
      brand_promise: "참가자에게 실질적인 가치와 성장 기회를 제공합니다",
      brand_personality: ["전문적인", "혁신적인", "신뢰할 수 있는", "영감을 주는"],
      tone_of_voice: "전문적이면서도 친근하고 영감을 주는 어조",
    },
    positioning_statement: `${target_audience}를 위한 ${event_name}은(는) 다른 ${event_type}과 달리 ` +
      "실질적인 인사이트와 네트워킹 기회를 제공하여 참가자의 성장을 돕습니다.",
    value_proposition: {
      headline: `${event_type} 분야 최고의 전문가들과 함께하세요`,
      subheadline: "실무에 바로 적용 가능한 인사이트와 가치있는 네트워킹",
      key_benefits: [
        "업계 최고 전문가의 실전 노하우",
        "동종 업계 전문가와의 네트워킹",
        "최신 트렌드와 기술 정보",
        "커리어 성장 기회",
      ],
      proof_points: [
        "작년 참가자 만족도 95%",
        "100+ 업계 리더 연사",
        "5,000+ 전문가 네트워크",
        "10년 이상의 행사 운영 경험",
      ],
    },
    messaging_framework: {
      primary_message: `${event_name}에서 미래를 준비하세요`,
      secondary_messages: [
        "업계 리더들의 인사이트를 직접 경험하세요",
        "같은 고민을 가진 전문가들과 연결되세요",
        "실무에 바로 적용할 수 있는 솔루션을 찾으세요",
      ],
      call_to_action: "지금 등록하고 얼리버드 혜택을 받으세요",
      tagline_options: [
        `${event_type}의 미래, 여기서 시작됩니다`,
        "연결하고, 배우고, 성장하세요",
        "변화를 이끄는 전문가들의 만남",
      ],
    },
    differentiation_strategy: {
      unique_selling_points: [
        "실무 중심 콘텐츠 구성",
        "소규모 네트워킹 세션",
        "1:1 멘토링 기회",
        "사후 온라인 콘텐츠 제공",
      ],
      competitive_advantages: [
        "검증된 연사 라인업",
        "높은 참가자 만족도",
        "체계적인 네트워킹 프로그램",
        "지속적인 커뮤니티 운영",
      ],
      positioning_map: {
        x_axis: "실용성 (이론적 ↔ 실무적)",
        y_axis: "규모 (대규모 ↔ 밀도있는)",
        our_position: "실무적 + 밀도있는 (우상단)",
      },
    },
    recommendations: [
      "모든 마케팅 채널에서 일관된 메시지 사용",
      "타겟 세그먼트별 메시지 커스터마이징",
      "참가자 추천사를 proof point로 활용",
      "경쟁사와 차별화되는 비주얼 아이덴티티 개발",
      "SNS에서 브랜드 스토리 지속적 공유",
    ],
    created_at: new Date().toISOString(),
  };
}

export const taskId = "MKT-003";
export const taskName = "브랜드 포지셔닝";
export const taskType = "AI" as const;
export const cmpReference = "CMP-IS 7.1.c";
export const skill = "Skill 7: Plan Marketing";
export const subSkill = "7.1: Market Research";

export default {
  taskId,
  taskName,
  taskType,
  cmpReference,
  skill,
  subSkill,
  AGENT_PERSONA,
  InputSchema,
  OutputSchema,
  execute,
};
