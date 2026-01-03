/**
 * FIN-065: 환불 처리
 *
 * CMP-IS Reference: 9.2.b
 * Task Type: Hybrid
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Refund Processing.
CMP-IS Standard: 9.2.b - Processing refunds according to established policies.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  original_transaction_id: z.string().uuid(),
  refund_request: z.object({
    requester_name: z.string(),
    requester_email: z.string().email(),
    request_date: z.string(),
    reason: z.string(),
    reason_category: z.enum([
      "cancellation", "dissatisfaction", "duplicate_charge",
      "event_cancelled", "policy_exception", "other",
    ]),
  }),
  original_payment: z.object({
    amount: z.number(),
    currency: CurrencyCode,
    payment_date: z.string(),
    payment_method: z.string(),
    registration_type: z.string(),
  }),
  refund_amount_requested: z.number().optional(),
  event_refund_policy: z.object({
    full_refund_deadline: z.string(),
    partial_refund_deadline: z.string(),
    partial_refund_percentage: z.number(),
    processing_fee_refundable: z.boolean(),
  }),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  refund_id: z.string().uuid(),
  event_id: z.string().uuid(),
  original_transaction_id: z.string().uuid(),
  eligibility_check: z.object({
    is_eligible: z.boolean(),
    policy_applied: z.string(),
    eligibility_reason: z.string(),
    refund_percentage: z.number(),
  }),
  refund_calculation: z.object({
    original_amount: z.number(),
    refundable_amount: z.number(),
    non_refundable_amount: z.number(),
    processing_fee_deduction: z.number(),
    net_refund_amount: z.number(),
    currency: z.string(),
  }),
  approval_status: z.object({
    status: z.enum(["auto_approved", "pending_approval", "approved", "denied"]),
    approver: z.string().optional(),
    approval_date: z.string().optional(),
    notes: z.string().optional(),
  }),
  processing_details: z.object({
    refund_method: z.string(),
    estimated_completion: z.string(),
    reference_number: z.string(),
    status: z.enum(["initiated", "processing", "completed", "failed"]),
  }),
  communication: z.object({
    notification_sent: z.boolean(),
    notification_type: z.string(),
    message_preview: z.string(),
  }),
  accounting_entry: z.object({
    debit_account: z.string(),
    credit_account: z.string(),
    amount: z.number(),
    memo: z.string(),
  }),
  audit_trail: z.array(z.object({
    timestamp: z.string(),
    action: z.string(),
    actor: z.string(),
    details: z.string(),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const requestDate = new Date(validated.refund_request.request_date);
  const fullRefundDeadline = new Date(validated.event_refund_policy.full_refund_deadline);
  const partialRefundDeadline = new Date(validated.event_refund_policy.partial_refund_deadline);

  let isEligible = true;
  let refundPercentage = 0;
  let policyApplied = "";
  let eligibilityReason = "";

  if (validated.refund_request.reason_category === "event_cancelled" ||
      validated.refund_request.reason_category === "duplicate_charge") {
    refundPercentage = 100;
    policyApplied = "전액 환불 (특별 사유)";
    eligibilityReason = "이벤트 취소 또는 중복 결제로 인한 전액 환불 대상";
  } else if (requestDate <= fullRefundDeadline) {
    refundPercentage = 100;
    policyApplied = "전액 환불 기간 내";
    eligibilityReason = "전액 환불 마감일 이전 요청";
  } else if (requestDate <= partialRefundDeadline) {
    refundPercentage = validated.event_refund_policy.partial_refund_percentage;
    policyApplied = "부분 환불 기간";
    eligibilityReason = `부분 환불 기간 내 요청 (${refundPercentage}%)`;
  } else {
    isEligible = validated.refund_request.reason_category === "policy_exception";
    refundPercentage = isEligible ? 50 : 0;
    policyApplied = isEligible ? "예외 적용" : "환불 불가 기간";
    eligibilityReason = isEligible ? "예외 사유 적용" : "환불 마감일 경과";
  }

  const processingFee = validated.event_refund_policy.processing_fee_refundable ? 0 : 0.30;
  const refundableAmount = Math.round(validated.original_payment.amount * refundPercentage / 100 * 100) / 100;
  const netRefundAmount = Math.max(0, refundableAmount - processingFee);

  const refundId = generateUUID();
  const currentTime = nowISO();

  const approvalStatus = refundPercentage === 100 && validated.original_payment.amount < 1000
    ? "auto_approved"
    : "pending_approval";

  const output: Output = {
    refund_id: refundId,
    event_id: validated.event_id,
    original_transaction_id: validated.original_transaction_id,
    eligibility_check: {
      is_eligible: isEligible,
      policy_applied: policyApplied,
      eligibility_reason: eligibilityReason,
      refund_percentage: refundPercentage,
    },
    refund_calculation: {
      original_amount: validated.original_payment.amount,
      refundable_amount: refundableAmount,
      non_refundable_amount: validated.original_payment.amount - refundableAmount,
      processing_fee_deduction: processingFee,
      net_refund_amount: netRefundAmount,
      currency: validated.original_payment.currency,
    },
    approval_status: {
      status: approvalStatus as "auto_approved" | "pending_approval",
      approver: approvalStatus === "auto_approved" ? "시스템" : undefined,
      approval_date: approvalStatus === "auto_approved" ? currentTime : undefined,
      notes: approvalStatus === "auto_approved" ? "자동 승인 조건 충족" : "검토 대기 중",
    },
    processing_details: {
      refund_method: validated.original_payment.payment_method,
      estimated_completion: "3-5 영업일",
      reference_number: `REF-${refundId.substring(0, 8).toUpperCase()}`,
      status: approvalStatus === "auto_approved" ? "initiated" : "processing",
    },
    communication: {
      notification_sent: true,
      notification_type: "email",
      message_preview: isEligible
        ? `환불 요청이 접수되었습니다. ${netRefundAmount.toLocaleString()}${validated.original_payment.currency}이 ${validated.original_payment.payment_method}로 환불됩니다.`
        : `환불 요청이 접수되었으나 정책에 따라 환불이 불가합니다. 자세한 문의는 고객센터로 연락 바랍니다.`,
    },
    accounting_entry: {
      debit_account: "매출",
      credit_account: "환불 대기금",
      amount: netRefundAmount,
      memo: `환불 처리 - ${validated.refund_request.reason_category} - ${validated.refund_request.requester_name}`,
    },
    audit_trail: [
      {
        timestamp: currentTime,
        action: "환불 요청 접수",
        actor: validated.refund_request.requester_email,
        details: `사유: ${validated.refund_request.reason}`,
      },
      {
        timestamp: currentTime,
        action: "적격성 검토",
        actor: "시스템",
        details: eligibilityReason,
      },
      {
        timestamp: currentTime,
        action: "환불 금액 계산",
        actor: "시스템",
        details: `${netRefundAmount.toLocaleString()}${validated.original_payment.currency} (${refundPercentage}%)`,
      },
      {
        timestamp: currentTime,
        action: approvalStatus === "auto_approved" ? "자동 승인" : "승인 대기",
        actor: approvalStatus === "auto_approved" ? "시스템" : "대기",
        details: approvalStatus === "auto_approved" ? "조건 충족으로 자동 승인" : "수동 검토 필요",
      },
    ],
    generated_at: currentTime,
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-065",
  taskName: "환불 처리",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 9.2.b",
  skill: "Skill 9: Manage Monetary Transactions",
  subSkill: "9.2: Manage Monetary Transactions Process",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
