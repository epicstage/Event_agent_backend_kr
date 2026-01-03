/**
 * FIN-048: 환불 정책 생성
 *
 * CMP-IS Reference: 8.2.f
 * Task Type: Hybrid
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Refund Policy Creation.
CMP-IS Standard: 8.2.f - Creating fair and clear refund policies.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_type: z.string(),
  event_date: z.string(),
  ticket_types: z.array(z.object({
    type: z.string(),
    price: z.number(),
    refundable: z.boolean().default(true),
  })),
  organizational_requirements: z.object({
    minimum_notice_days: z.number().int().default(14),
    processing_fee: z.number().optional(),
    force_majeure_clause: z.boolean().default(true),
  }).optional(),
  industry_standards: z.array(z.object({
    standard: z.string(),
    typical_policy: z.string(),
  })).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  policy_id: z.string().uuid(),
  event_id: z.string().uuid(),
  refund_tiers: z.array(z.object({
    tier_name: z.string(),
    time_period: z.string(),
    refund_percentage: z.number(),
    processing_fee: z.number(),
    conditions: z.array(z.string()),
  })),
  special_provisions: z.array(z.object({
    provision_type: z.string(),
    description: z.string(),
    applicable_situations: z.array(z.string()),
  })),
  transfer_policy: z.object({
    allowed: z.boolean(),
    fee: z.number(),
    deadline: z.string(),
    process: z.array(z.string()),
  }),
  cancellation_by_organizer: z.object({
    refund_commitment: z.string(),
    notification_timeline: z.string(),
    additional_compensation: z.array(z.string()),
  }),
  policy_document: z.object({
    summary: z.string(),
    legal_disclaimers: z.array(z.string()),
    contact_info: z.string(),
  }),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);
  const processingFee = validated.organizational_requirements?.processing_fee || 25;

  const output: Output = {
    policy_id: generateUUID(),
    event_id: validated.event_id,
    refund_tiers: [
      {
        tier_name: "전액 환불",
        time_period: "이벤트 60일 이전",
        refund_percentage: 100,
        processing_fee: processingFee,
        conditions: ["등록 완료된 건", "서면 요청 필수"],
      },
      {
        tier_name: "75% 환불",
        time_period: "이벤트 60-30일 전",
        refund_percentage: 75,
        processing_fee: processingFee,
        conditions: ["서면 요청 필수", "환불 처리 7-10일 소요"],
      },
      {
        tier_name: "50% 환불",
        time_period: "이벤트 30-14일 전",
        refund_percentage: 50,
        processing_fee: processingFee,
        conditions: ["서면 요청 필수"],
      },
      {
        tier_name: "환불 불가",
        time_period: "이벤트 14일 이내",
        refund_percentage: 0,
        processing_fee: 0,
        conditions: ["양도만 가능", "예외 상황 별도 검토"],
      },
    ],
    special_provisions: [
      {
        provision_type: "의료 사유",
        description: "질병, 부상으로 인한 참석 불가 시",
        applicable_situations: ["의사 진단서 제출", "이벤트 7일 전까지 신청"],
      },
      {
        provision_type: "불가항력",
        description: "천재지변, 전염병 등 불가항력 사유",
        applicable_situations: ["주최측 취소 시 전액 환불", "개인 사유는 표준 정책 적용"],
      },
      {
        provision_type: "비자 거부",
        description: "해외 참가자 비자 발급 거부 시",
        applicable_situations: ["공식 거부 서류 제출", "90% 환불"],
      },
    ],
    transfer_policy: {
      allowed: true,
      fee: 50,
      deadline: "이벤트 7일 전까지",
      process: [
        "이메일로 양도 요청 제출",
        "양수인 정보 제공",
        "양도 수수료 결제",
        "새 등록 확인서 발급",
      ],
    },
    cancellation_by_organizer: {
      refund_commitment: "전액 환불 (수수료 없음)",
      notification_timeline: "최소 14일 전 통보",
      additional_compensation: [
        "다음 해 이벤트 10% 할인 코드",
        "관련 비용 증빙 시 교통비 일부 보상 검토",
      ],
    },
    policy_document: {
      summary: `본 환불 정책은 ${validated.event_type} 이벤트에 적용됩니다. 환불 요청은 반드시 서면으로 제출해야 하며, 처리에는 영업일 기준 7-10일이 소요됩니다.`,
      legal_disclaimers: [
        "본 정책은 사전 예고 없이 변경될 수 있습니다.",
        "분쟁 발생 시 대한민국 법률이 적용됩니다.",
        "개인정보는 환불 처리 목적으로만 사용됩니다.",
      ],
      contact_info: "환불 문의: refund@event.com / 02-xxxx-xxxx",
    },
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-048",
  taskName: "환불 정책 생성",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 8.2.f",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.2: Establish Pricing",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
