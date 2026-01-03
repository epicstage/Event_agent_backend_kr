/**
 * PRO-003: 비즈니스 에티켓 가이드
 * CMP-IS Reference: 19.3.a - Business etiquette guidance
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Business Etiquette Consultant for international events.`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_type: z.enum(["international", "domestic", "virtual", "hybrid"]).optional(),
  cultural_contexts: z.array(z.string()).optional(),
  focus_areas: z.array(z.enum(["greeting", "dining", "gift", "dress_code", "communication", "networking"])).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  guide_id: z.string(),
  event_id: z.string(),
  etiquette_overview: z.object({
    primary_cultures: z.array(z.string()),
    complexity_level: z.enum(["simple", "moderate", "complex"]),
    key_considerations: z.number(),
  }),
  cultural_guidelines: z.array(z.object({
    culture: z.string(),
    greeting_protocol: z.object({
      physical_greeting: z.string(),
      verbal_greeting: z.string(),
      business_card_exchange: z.string(),
    }),
    communication_style: z.object({
      directness: z.enum(["direct", "indirect", "context_dependent"]),
      formality_level: z.enum(["very_formal", "formal", "moderate", "casual"]),
      key_phrases: z.array(z.string()),
    }),
    taboos: z.array(z.string()),
    tips: z.array(z.string()),
  })),
  dress_code_guide: z.object({
    overall_recommendation: z.string(),
    by_occasion: z.array(z.object({
      occasion: z.string(),
      men: z.string(),
      women: z.string(),
      notes: z.string(),
    })),
  }),
  dining_protocol: z.object({
    seating_arrangement: z.string(),
    table_manners: z.array(z.string()),
    toasting_customs: z.string(),
    dietary_considerations: z.array(z.string()),
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

  return {
    guide_id: generateUUID(),
    event_id: validatedInput.event_id,
    etiquette_overview: {
      primary_cultures: validatedInput.cultural_contexts || ["한국", "미국", "일본"],
      complexity_level: "moderate",
      key_considerations: 15,
    },
    cultural_guidelines: [
      {
        culture: "한국",
        greeting_protocol: {
          physical_greeting: "가벼운 목례 또는 악수 (연장자가 먼저 손을 내밀 때까지 대기)",
          verbal_greeting: "안녕하세요, [직함]님",
          business_card_exchange: "두 손으로 주고받기, 받은 명함은 테이블에 정중히 놓기",
        },
        communication_style: {
          directness: "indirect",
          formality_level: "formal",
          key_phrases: ["수고하셨습니다", "감사합니다", "잘 부탁드립니다"],
        },
        taboos: ["직접적인 거절 표현", "공개석상에서 개인 비판", "술잔 혼자 따르기"],
        tips: ["연장자 먼저 배려", "첫 만남에서는 존칭 필수", "회식 문화 이해"],
      },
      {
        culture: "미국",
        greeting_protocol: {
          physical_greeting: "단단한 악수, 눈 맞춤 중요",
          verbal_greeting: "Hello, nice to meet you [First Name]",
          business_card_exchange: "한 손으로 자연스럽게 교환",
        },
        communication_style: {
          directness: "direct",
          formality_level: "moderate",
          key_phrases: ["Looking forward to working with you", "Let's connect"],
        },
        taboos: ["정치/종교 토론", "지나친 신체 접촉", "약속 시간 무시"],
        tips: ["첫 이름 사용 일반적", "Small talk 중요", "시간 엄수 필수"],
      },
    ],
    dress_code_guide: {
      overall_recommendation: "비즈니스 캐주얼 기본, 공식 행사 시 정장",
      by_occasion: [
        { occasion: "개막식", men: "다크 수트, 넥타이", women: "비즈니스 정장 또는 드레스", notes: "보수적 색상 권장" },
        { occasion: "네트워킹 세션", men: "스마트 캐주얼", women: "비즈니스 캐주얼", notes: "편안하지만 단정하게" },
        { occasion: "갈라 디너", men: "턱시도 또는 다크 수트", women: "이브닝 드레스", notes: "초대장 드레스코드 확인" },
      ],
    },
    dining_protocol: {
      seating_arrangement: "주빈을 가장 좋은 자리에, 호스트는 문을 등지고 앉음",
      table_manners: [
        "웃어른이 먼저 식사를 시작할 때까지 대기",
        "냅킨은 무릎 위에 펼쳐 놓기",
        "음식에 대한 감사 표현",
        "휴대폰은 무음 또는 테이블 밖에",
      ],
      toasting_customs: "주빈이 먼저 건배, 눈을 마주치며 잔을 부딪힘",
      dietary_considerations: ["할랄", "코셔", "채식", "알레르기 사전 확인"],
    },
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-003",
  taskName: "비즈니스 에티켓 가이드",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 19.3.a",
  skill: "Skill 19: Ethics & Standards",
  subSkill: "19.3: Business Etiquette",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
