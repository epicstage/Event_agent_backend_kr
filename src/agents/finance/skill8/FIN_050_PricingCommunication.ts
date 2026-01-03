/**
 * FIN-050: 가격 커뮤니케이션
 *
 * CMP-IS Reference: 8.2.h
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Pricing Communication.
CMP-IS Standard: 8.2.h - Communicating pricing effectively to target audiences.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  pricing_structure: z.object({
    tiers: z.array(z.object({
      name: z.string(),
      price: z.number(),
      value_points: z.array(z.string()),
    })),
    early_bird_deadline: z.string().optional(),
    discounts_available: z.array(z.string()).optional(),
  }),
  target_audiences: z.array(z.object({
    segment: z.string(),
    key_concerns: z.array(z.string()),
    preferred_channels: z.array(z.string()),
  })),
  event_value_proposition: z.array(z.string()),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  communication_id: z.string().uuid(),
  event_id: z.string().uuid(),
  messaging_framework: z.object({
    headline: z.string(),
    value_proposition_summary: z.string(),
    key_messages: z.array(z.object({
      message: z.string(),
      supporting_points: z.array(z.string()),
    })),
    objection_handlers: z.array(z.object({
      objection: z.string(),
      response: z.string(),
    })),
  }),
  segment_specific_messaging: z.array(z.object({
    segment: z.string(),
    tailored_headline: z.string(),
    value_emphasis: z.array(z.string()),
    recommended_tier: z.string(),
    call_to_action: z.string(),
  })),
  channel_content: z.array(z.object({
    channel: z.string(),
    content_type: z.string(),
    key_elements: z.array(z.string()),
    sample_copy: z.string(),
  })),
  pricing_faq: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })),
  urgency_messaging: z.array(z.object({
    timing: z.string(),
    message: z.string(),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const standardTier = validated.pricing_structure.tiers.find(t =>
    t.name.toLowerCase().includes("standard") || t.name.toLowerCase().includes("regular")) ||
    validated.pricing_structure.tiers[0];

  const output: Output = {
    communication_id: generateUUID(),
    event_id: validated.event_id,
    messaging_framework: {
      headline: `업계 최고의 인사이트, 합리적인 투자`,
      value_proposition_summary: `${validated.event_value_proposition.slice(0, 3).join(", ")} - 이 모든 것을 한 곳에서 경험하세요.`,
      key_messages: [
        {
          message: "투자 대비 최고의 가치",
          supporting_points: [
            "업계 리더들의 인사이트",
            "실무에 바로 적용 가능한 지식",
            "귀중한 네트워킹 기회",
          ],
        },
        {
          message: "다양한 참가 옵션",
          supporting_points: [
            `${validated.pricing_structure.tiers.length}가지 티켓 옵션`,
            "예산과 니즈에 맞는 선택",
            "유연한 결제 방법",
          ],
        },
        {
          message: "조기 등록 혜택",
          supporting_points: [
            validated.pricing_structure.early_bird_deadline
              ? `${validated.pricing_structure.early_bird_deadline}까지 할인`
              : "얼리버드 할인 적용",
            "우선 좌석 배정",
            "한정 수량",
          ],
        },
      ],
      objection_handlers: [
        {
          objection: "가격이 너무 비싸요",
          response: "1일 환산 비용을 생각해보세요. 동종 업계 세미나 3-4회 참석 비용으로 1년치 인사이트를 얻을 수 있습니다.",
        },
        {
          objection: "예산 승인이 어려워요",
          response: "기업용 인보이스와 상사 설득용 자료를 제공해드립니다. 분할 결제도 가능합니다.",
        },
        {
          objection: "온라인으로 볼 수 있지 않나요",
          response: "현장 참석만의 네트워킹, 실시간 Q&A, 비공개 세션은 온라인으로 대체할 수 없습니다.",
        },
      ],
    },
    segment_specific_messaging: validated.target_audiences.map(audience => ({
      segment: audience.segment,
      tailored_headline: `${audience.segment}를 위한 맞춤 프로그램`,
      value_emphasis: audience.key_concerns.map(c => `${c}에 대한 해답 제공`),
      recommended_tier: standardTier?.name || "Standard",
      call_to_action: `지금 ${audience.segment} 전용 혜택으로 등록하세요`,
    })),
    channel_content: [
      {
        channel: "이메일",
        content_type: "프로모션 캠페인",
        key_elements: ["개인화된 인사", "가치 제안", "가격 정보", "CTA 버튼"],
        sample_copy: `안녕하세요 [이름]님, 올해 가장 기대되는 이벤트에 ${validated.pricing_structure.early_bird_deadline ? "얼리버드 가격으로 " : ""}참가하세요. [CTA: 지금 등록하기]`,
      },
      {
        channel: "소셜미디어",
        content_type: "인스타그램/링크드인 포스트",
        key_elements: ["시각적 가격표", "카운트다운", "해시태그"],
        sample_copy: `🎯 ${standardTier?.price.toLocaleString()}원으로 업계 최고의 인사이트를 만나세요. ⏰ 얼리버드 마감 임박! #이벤트명 #얼리버드`,
      },
      {
        channel: "웹사이트",
        content_type: "가격 페이지",
        key_elements: ["비교 테이블", "FAQ", "보증 문구", "결제 옵션"],
        sample_copy: "투명한 가격, 확실한 가치. 모든 티켓에 만족 보장.",
      },
    ],
    pricing_faq: [
      {
        question: "얼리버드 할인은 언제까지인가요?",
        answer: validated.pricing_structure.early_bird_deadline
          ? `${validated.pricing_structure.early_bird_deadline}까지 적용됩니다.`
          : "등록 시작 후 4주간 적용됩니다.",
      },
      {
        question: "그룹 할인이 있나요?",
        answer: "5인 이상 단체 등록 시 15% 할인이 적용됩니다. 별도 문의 바랍니다.",
      },
      {
        question: "환불은 가능한가요?",
        answer: "이벤트 60일 전까지 전액 환불, 이후 환불 정책에 따라 처리됩니다.",
      },
      {
        question: "분할 결제가 가능한가요?",
        answer: "네, 고가 티켓의 경우 2회 분할 결제가 가능합니다.",
      },
    ],
    urgency_messaging: [
      {
        timing: "D-90 (얼리버드 시작)",
        message: "🚀 얼리버드 오픈! 한정 수량 선착순 마감",
      },
      {
        timing: "D-60 (얼리버드 마감 임박)",
        message: "⏰ 얼리버드 마감 7일 전! 지금 등록하고 20% 절약하세요",
      },
      {
        timing: "D-30 (정규가 전환)",
        message: "📢 정규 가격으로 전환되었습니다. 그래도 아직 자리가 있어요!",
      },
      {
        timing: "D-7 (마감 임박)",
        message: "🔥 마지막 기회! 잔여 좌석 10% 미만",
      },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-050",
  taskName: "가격 커뮤니케이션",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 8.2.h",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.2: Establish Pricing",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
