/**
 * FIN-064: 결제 처리
 *
 * CMP-IS Reference: 9.2.a
 * Task Type: Hybrid
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Payment Processing.
CMP-IS Standard: 9.2.a - Processing payments and transactions.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  payment_request: z.object({
    amount: z.number(),
    currency: CurrencyCode,
    payment_method: z.enum(["credit_card", "debit_card", "bank_transfer", "paypal", "cash", "check"]),
    payer_info: z.object({
      name: z.string(),
      email: z.string().email(),
      registration_id: z.string().optional(),
    }),
    description: z.string(),
    payment_type: z.enum(["registration", "sponsorship", "exhibit", "merchandise", "other"]),
  }),
  card_info: z.object({
    last_four: z.string().length(4),
    brand: z.string(),
    exp_month: z.number().int(),
    exp_year: z.number().int(),
  }).optional(),
  billing_address: z.object({
    line1: z.string(),
    city: z.string(),
    postal_code: z.string(),
    country: z.string(),
  }).optional(),
  idempotency_key: z.string().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  transaction_id: z.string().uuid(),
  event_id: z.string().uuid(),
  payment_result: z.object({
    status: z.enum(["approved", "declined", "pending", "failed", "requires_action"]),
    authorization_code: z.string().optional(),
    processor_response: z.object({
      code: z.string(),
      message: z.string(),
    }),
    risk_assessment: z.object({
      score: z.number(),
      level: z.enum(["low", "medium", "high"]),
      flags: z.array(z.string()),
    }),
  }),
  transaction_details: z.object({
    amount: z.number(),
    currency: z.string(),
    net_amount: z.number(),
    fees: z.object({
      processing_fee: z.number(),
      platform_fee: z.number(),
      total_fees: z.number(),
    }),
    exchange_rate: z.number().optional(),
  }),
  receipt: z.object({
    receipt_number: z.string(),
    issued_at: z.string(),
    line_items: z.array(z.object({
      description: z.string(),
      quantity: z.number().int(),
      unit_price: z.number(),
      total: z.number(),
    })),
    subtotal: z.number(),
    tax: z.number(),
    total: z.number(),
  }),
  payer_confirmation: z.object({
    confirmation_sent: z.boolean(),
    confirmation_method: z.string(),
    confirmation_id: z.string(),
  }),
  next_steps: z.array(z.object({
    action: z.string(),
    required: z.boolean(),
    deadline: z.string().optional(),
  })),
  audit_log: z.object({
    request_timestamp: z.string(),
    response_timestamp: z.string(),
    processing_time_ms: z.number(),
    idempotency_key: z.string(),
  }),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const processingFeeRate = 0.029;
  const fixedFee = 0.30;
  const processingFee = Math.round((validated.payment_request.amount * processingFeeRate + fixedFee) * 100) / 100;
  const netAmount = validated.payment_request.amount - processingFee;

  const receiptNumber = `RCP-${Date.now().toString(36).toUpperCase()}`;
  const transactionId = generateUUID();
  const requestTimestamp = nowISO();

  // Simulate processing time
  const processingTimeMs = Math.floor(Math.random() * 500) + 200;

  const output: Output = {
    transaction_id: transactionId,
    event_id: validated.event_id,
    payment_result: {
      status: "approved",
      authorization_code: `AUTH${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      processor_response: {
        code: "00",
        message: "Transaction approved",
      },
      risk_assessment: {
        score: Math.floor(Math.random() * 30),
        level: "low",
        flags: [],
      },
    },
    transaction_details: {
      amount: validated.payment_request.amount,
      currency: validated.payment_request.currency,
      net_amount: Math.round(netAmount * 100) / 100,
      fees: {
        processing_fee: processingFee,
        platform_fee: 0,
        total_fees: processingFee,
      },
    },
    receipt: {
      receipt_number: receiptNumber,
      issued_at: nowISO(),
      line_items: [
        {
          description: validated.payment_request.description,
          quantity: 1,
          unit_price: validated.payment_request.amount,
          total: validated.payment_request.amount,
        },
      ],
      subtotal: validated.payment_request.amount,
      tax: 0,
      total: validated.payment_request.amount,
    },
    payer_confirmation: {
      confirmation_sent: true,
      confirmation_method: "email",
      confirmation_id: `CONF-${transactionId.substring(0, 8)}`,
    },
    next_steps: [
      {
        action: "결제 확인 이메일 발송 완료",
        required: false,
      },
      {
        action: "영수증 다운로드 가능",
        required: false,
      },
      {
        action: validated.payment_request.payment_type === "registration"
          ? "등록 확인서 발급"
          : "서비스 제공 준비",
        required: true,
        deadline: "D+1",
      },
    ],
    audit_log: {
      request_timestamp: requestTimestamp,
      response_timestamp: nowISO(),
      processing_time_ms: processingTimeMs,
      idempotency_key: validated.idempotency_key || generateUUID(),
    },
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-064",
  taskName: "결제 처리",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 9.2.a",
  skill: "Skill 9: Manage Monetary Transactions",
  subSkill: "9.2: Manage Monetary Transactions Process",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
