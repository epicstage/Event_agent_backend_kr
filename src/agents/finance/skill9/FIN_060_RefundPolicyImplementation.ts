/**
 * FIN-060: 환불 정책 구현
 *
 * CMP-IS Reference: 9.1.c
 * Task Type: Hybrid
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Refund Policy Implementation.
CMP-IS Standard: 9.1.c - Implementing refund policies and procedures.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  event_date: z.string(),
  refund_policy: z.object({
    full_refund_until: z.string(),
    partial_refund_until: z.string(),
    partial_refund_percentage: z.number(),
    no_refund_after: z.string(),
    exceptions: z.array(z.string()).optional(),
  }),
  registration_types: z.array(z.object({
    type_name: z.string(),
    price: z.number(),
    transferable: z.boolean(),
    special_terms: z.string().optional(),
  })),
  processing_requirements: z.object({
    max_processing_days: z.number().int(),
    refund_methods: z.array(z.enum(["original_payment", "credit", "check", "bank_transfer"])),
  }),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  implementation_id: z.string().uuid(),
  event_id: z.string().uuid(),
  policy_documentation: z.object({
    policy_summary: z.string(),
    detailed_terms: z.array(z.object({
      period: z.string(),
      refund_amount: z.string(),
      processing_time: z.string(),
    })),
    exceptions_policy: z.array(z.string()),
    non_refundable_items: z.array(z.string()),
  }),
  processing_workflow: z.object({
    request_channels: z.array(z.object({
      channel: z.string(),
      instructions: z.string(),
      response_time: z.string(),
    })),
    approval_workflow: z.array(z.object({
      step: z.number().int(),
      action: z.string(),
      responsible: z.string(),
      sla_hours: z.number(),
    })),
    refund_execution: z.array(z.object({
      method: z.string(),
      processing_time: z.string(),
      requirements: z.array(z.string()),
    })),
  }),
  system_configuration: z.object({
    automated_rules: z.array(z.object({
      condition: z.string(),
      action: z.string(),
      requires_approval: z.boolean(),
    })),
    notification_templates: z.array(z.object({
      trigger: z.string(),
      template_name: z.string(),
      recipient: z.string(),
    })),
    reporting_setup: z.array(z.object({
      report_name: z.string(),
      frequency: z.string(),
      metrics: z.array(z.string()),
    })),
  }),
  communication_plan: z.object({
    pre_event_messaging: z.array(z.object({
      touchpoint: z.string(),
      message_focus: z.string(),
    })),
    refund_request_response: z.object({
      acknowledgment_template: z.string(),
      approval_template: z.string(),
      denial_template: z.string(),
    }),
  }),
  staff_training: z.array(z.object({
    topic: z.string(),
    key_points: z.array(z.string()),
    scenarios: z.array(z.string()),
  })),
  quality_assurance: z.object({
    audit_checklist: z.array(z.string()),
    escalation_triggers: z.array(z.string()),
    customer_satisfaction_measures: z.array(z.string()),
  }),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const fullRefundDate = new Date(validated.refund_policy.full_refund_until);
  const partialRefundDate = new Date(validated.refund_policy.partial_refund_until);
  const eventDate = new Date(validated.event_date);

  const daysToFullRefund = Math.round((eventDate.getTime() - fullRefundDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysToPartialRefund = Math.round((eventDate.getTime() - partialRefundDate.getTime()) / (1000 * 60 * 60 * 24));

  const output: Output = {
    implementation_id: generateUUID(),
    event_id: validated.event_id,
    policy_documentation: {
      policy_summary: `${validated.event_name} 환불 정책: 이벤트 ${daysToFullRefund}일 전까지 전액 환불, ${daysToPartialRefund}일 전까지 ${validated.refund_policy.partial_refund_percentage}% 환불 가능`,
      detailed_terms: [
        {
          period: `이벤트 ${daysToFullRefund}일 전까지`,
          refund_amount: "100% 전액 환불",
          processing_time: `${validated.processing_requirements.max_processing_days}영업일 이내`,
        },
        {
          period: `이벤트 ${daysToPartialRefund}일 전까지`,
          refund_amount: `${validated.refund_policy.partial_refund_percentage}% 부분 환불`,
          processing_time: `${validated.processing_requirements.max_processing_days}영업일 이내`,
        },
        {
          period: `이벤트 ${daysToPartialRefund}일 이내`,
          refund_amount: "환불 불가",
          processing_time: "해당 없음",
        },
      ],
      exceptions_policy: validated.refund_policy.exceptions || [
        "천재지변으로 인한 이벤트 취소 시 전액 환불",
        "주최측 사유 이벤트 취소 시 전액 환불",
        "참가자 질병/사고 시 의료 증빙 제출로 특별 검토",
      ],
      non_refundable_items: [
        "처리 수수료",
        "이미 제공된 사전 자료/교재",
        "네트워킹 디너 (별도 구매 시)",
        "추가 옵션 상품 (특별 명시 제외)",
      ],
    },
    processing_workflow: {
      request_channels: [
        {
          channel: "온라인 환불 신청 폼",
          instructions: "이벤트 웹사이트 > 마이페이지 > 환불 신청",
          response_time: "1영업일 이내 접수 확인",
        },
        {
          channel: "이메일",
          instructions: "refund@event.com으로 등록 확인서 첨부하여 신청",
          response_time: "2영업일 이내 응답",
        },
        {
          channel: "고객센터",
          instructions: "고객센터 전화 또는 채팅으로 신청",
          response_time: "즉시 접수, 처리는 1영업일",
        },
      ],
      approval_workflow: [
        {
          step: 1,
          action: "환불 요청 접수 및 자격 확인",
          responsible: "고객서비스팀",
          sla_hours: 24,
        },
        {
          step: 2,
          action: "환불 금액 계산 및 검토",
          responsible: "재무팀",
          sla_hours: 24,
        },
        {
          step: 3,
          action: "승인/반려 결정",
          responsible: "환불 담당자",
          sla_hours: 24,
        },
        {
          step: 4,
          action: "환불 처리 실행",
          responsible: "재무팀",
          sla_hours: 48,
        },
        {
          step: 5,
          action: "완료 통지 및 기록",
          responsible: "고객서비스팀",
          sla_hours: 24,
        },
      ],
      refund_execution: validated.processing_requirements.refund_methods.map(method => ({
        method: method === "original_payment" ? "원결제수단" :
          method === "credit" ? "이벤트 크레딧" :
            method === "check" ? "수표" : "계좌이체",
        processing_time: method === "original_payment" ? "3-7영업일" :
          method === "credit" ? "즉시" : "5-10영업일",
        requirements: method === "bank_transfer"
          ? ["계좌번호", "예금주명", "은행명"]
          : ["원결제 정보 확인"],
      })),
    },
    system_configuration: {
      automated_rules: [
        {
          condition: "전액 환불 기간 내 요청",
          action: "자동 승인 후 처리 대기열 추가",
          requires_approval: false,
        },
        {
          condition: "부분 환불 기간 내 요청",
          action: "자동 금액 계산 후 검토 대기열 추가",
          requires_approval: true,
        },
        {
          condition: "환불 불가 기간 요청",
          action: "예외 검토 대기열 추가",
          requires_approval: true,
        },
        {
          condition: "환불 금액 100만원 초과",
          action: "관리자 승인 필요 플래그",
          requires_approval: true,
        },
      ],
      notification_templates: [
        { trigger: "환불 요청 접수", template_name: "환불 접수 확인 이메일", recipient: "신청자" },
        { trigger: "환불 승인", template_name: "환불 승인 알림", recipient: "신청자" },
        { trigger: "환불 반려", template_name: "환불 반려 사유 안내", recipient: "신청자" },
        { trigger: "환불 완료", template_name: "환불 완료 확인", recipient: "신청자" },
        { trigger: "고액 환불 요청", template_name: "관리자 승인 요청", recipient: "관리자" },
      ],
      reporting_setup: [
        {
          report_name: "일일 환불 현황",
          frequency: "매일",
          metrics: ["요청 건수", "처리 건수", "환불 총액", "평균 처리 시간"],
        },
        {
          report_name: "주간 환불 분석",
          frequency: "주간",
          metrics: ["등록 유형별 환불율", "환불 사유 분석", "트렌드"],
        },
        {
          report_name: "월간 환불 요약",
          frequency: "월간",
          metrics: ["총 환불액", "순수익 영향", "고객 만족도"],
        },
      ],
    },
    communication_plan: {
      pre_event_messaging: [
        { touchpoint: "등록 페이지", message_focus: "환불 정책 요약 및 상세 링크" },
        { touchpoint: "확인 이메일", message_focus: "주요 환불 마감일 명시" },
        { touchpoint: "리마인더 이메일", message_focus: "환불 마감 임박 알림" },
        { touchpoint: "FAQ 페이지", message_focus: "환불 관련 자주 묻는 질문" },
      ],
      refund_request_response: {
        acknowledgment_template: "환불 요청이 접수되었습니다. 요청 번호: {request_id}. {processing_days}영업일 이내 처리됩니다.",
        approval_template: "환불이 승인되었습니다. {refund_amount}원이 {refund_method}로 {processing_time} 내 환불됩니다.",
        denial_template: "환불 요청이 반려되었습니다. 사유: {denial_reason}. 문의사항은 고객센터로 연락 바랍니다.",
      },
    },
    staff_training: [
      {
        topic: "환불 정책 이해",
        key_points: [
          "기간별 환불 비율",
          "예외 사항 및 처리 방법",
          "비환불 항목",
        ],
        scenarios: [
          "전액 환불 기간 내 요청 처리",
          "부분 환불 계산 및 안내",
          "환불 불가 기간 고객 응대",
        ],
      },
      {
        topic: "시스템 운영",
        key_points: [
          "환불 요청 접수 방법",
          "승인/반려 처리",
          "보고서 생성",
        ],
        scenarios: [
          "온라인 요청 처리",
          "전화 요청 처리",
          "긴급 환불 처리",
        ],
      },
      {
        topic: "고객 응대",
        key_points: [
          "불만 고객 응대 방법",
          "예외 상황 에스컬레이션",
          "정확한 정보 전달",
        ],
        scenarios: [
          "환불 거부에 불만인 고객",
          "환불 지연 문의",
          "특수 상황 요청",
        ],
      },
    ],
    quality_assurance: {
      audit_checklist: [
        "모든 환불이 정책에 따라 처리되었는가",
        "처리 시간이 SLA 내 완료되었는가",
        "정확한 금액이 환불되었는가",
        "적절한 문서화가 되었는가",
        "고객 커뮤니케이션이 적시에 이루어졌는가",
      ],
      escalation_triggers: [
        "SLA 초과 지연",
        "고객 불만 접수",
        "금액 오류 발견",
        "시스템 장애",
        "정책 위반 의심",
      ],
      customer_satisfaction_measures: [
        "환불 완료 후 만족도 설문",
        "처리 시간 모니터링",
        "재등록률 추적",
        "고객 피드백 분석",
      ],
    },
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-060",
  taskName: "환불 정책 구현",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 9.1.c",
  skill: "Skill 9: Manage Monetary Transactions",
  subSkill: "9.1: Establish Monetary Transaction Procedures",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
