/**
 * FIN-049: 결제 조건 설계
 *
 * CMP-IS Reference: 8.2.g
 * Task Type: Hybrid
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Payment Terms Design.
CMP-IS Standard: 8.2.g - Designing payment terms and options.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  pricing_tiers: z.array(z.object({
    tier_name: z.string(),
    price: z.number(),
  })),
  target_audience: z.object({
    primary_type: z.enum(["corporate", "individual", "mixed"]),
    international_percentage: z.number().optional(),
  }),
  cash_flow_needs: z.object({
    early_cash_required: z.boolean().default(false),
    deposit_requirements: z.array(z.object({
      vendor: z.string(),
      amount: z.number(),
      due_date: z.string(),
    })).optional(),
  }).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  terms_id: z.string().uuid(),
  event_id: z.string().uuid(),
  payment_options: z.array(z.object({
    option_name: z.string(),
    description: z.string(),
    payment_methods: z.array(z.string()),
    installment_plan: z.object({
      enabled: z.boolean(),
      max_installments: z.number().int(),
      schedule: z.array(z.object({
        installment: z.number().int(),
        percentage: z.number(),
        due_timing: z.string(),
      })),
    }).optional(),
    incentives: z.array(z.string()),
    applicable_tiers: z.array(z.string()),
  })),
  payment_methods_accepted: z.array(z.object({
    method: z.string(),
    processing_fee: z.number(),
    fee_bearer: z.enum(["organizer", "customer", "shared"]),
    settlement_days: z.number().int(),
  })),
  invoicing_terms: z.object({
    corporate_invoicing: z.boolean(),
    net_days: z.number().int(),
    required_info: z.array(z.string()),
    late_payment_penalty: z.number(),
  }),
  international_payments: z.object({
    currencies_accepted: z.array(z.string()),
    exchange_rate_policy: z.string(),
    wire_transfer_enabled: z.boolean(),
  }),
  terms_and_conditions: z.array(z.string()),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const output: Output = {
    terms_id: generateUUID(),
    event_id: validated.event_id,
    payment_options: [
      {
        option_name: "전액 선결제",
        description: "등록 시 전액 결제",
        payment_methods: ["신용카드", "체크카드", "계좌이체"],
        incentives: ["Early Bird 할인 적용 가능", "우선 좌석 배정"],
        applicable_tiers: validated.pricing_tiers.map(t => t.tier_name),
      },
      {
        option_name: "2회 분할 결제",
        description: "등록 시 50%, 이벤트 30일 전 50%",
        payment_methods: ["신용카드", "계좌이체"],
        installment_plan: {
          enabled: true,
          max_installments: 2,
          schedule: [
            { installment: 1, percentage: 50, due_timing: "등록 시" },
            { installment: 2, percentage: 50, due_timing: "D-30" },
          ],
        },
        incentives: ["현금흐름 관리 용이"],
        applicable_tiers: validated.pricing_tiers.filter(t => t.price > 100000).map(t => t.tier_name),
      },
      {
        option_name: "기업 인보이스",
        description: "기업 대상 청구서 발행 후 결제",
        payment_methods: ["계좌이체", "법인카드"],
        invoicing_terms: {
          enabled: true,
          net_days: 30,
        },
        incentives: ["세금계산서 발행", "기업 회계 처리 용이"],
        applicable_tiers: validated.pricing_tiers.map(t => t.tier_name),
      } as any,
    ],
    payment_methods_accepted: [
      {
        method: "신용카드 (Visa/MC/Amex)",
        processing_fee: 2.9,
        fee_bearer: "organizer",
        settlement_days: 3,
      },
      {
        method: "국내 체크카드",
        processing_fee: 1.5,
        fee_bearer: "organizer",
        settlement_days: 2,
      },
      {
        method: "계좌이체",
        processing_fee: 0,
        fee_bearer: "organizer",
        settlement_days: 1,
      },
      {
        method: "PayPal",
        processing_fee: 3.4,
        fee_bearer: "shared",
        settlement_days: 3,
      },
    ],
    invoicing_terms: {
      corporate_invoicing: validated.target_audience.primary_type === "corporate",
      net_days: 30,
      required_info: [
        "사업자등록번호",
        "회사명",
        "대표자명",
        "청구지 주소",
        "담당자 이메일",
      ],
      late_payment_penalty: 1.5,
    },
    international_payments: {
      currencies_accepted: ["USD", "EUR", "KRW"],
      exchange_rate_policy: "결제 시점 시장 환율 적용, 환율 변동 리스크는 참가자 부담",
      wire_transfer_enabled: true,
    },
    terms_and_conditions: [
      "모든 결제는 등록 확인 전 완료되어야 합니다.",
      "분할 결제 미이행 시 등록 취소될 수 있습니다.",
      "환불은 별도 환불 정책에 따릅니다.",
      "기업 인보이스는 Net 30일 이내 결제해야 합니다.",
      "연체 시 월 1.5%의 연체료가 부과됩니다.",
      "해외 송금 수수료는 참가자 부담입니다.",
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-049",
  taskName: "결제 조건 설계",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 8.2.g",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.2: Establish Pricing",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
