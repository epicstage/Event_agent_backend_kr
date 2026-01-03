/**
 * FIN-061: 재무 통제 설정
 *
 * CMP-IS Reference: 9.1.d
 * Task Type: Human
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Financial Controls Setup.
CMP-IS Standard: 9.1.d - Establishing financial controls and segregation of duties (Human task with AI support).`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  organization_structure: z.object({
    finance_team_size: z.number().int(),
    roles: z.array(z.object({
      role_name: z.string(),
      count: z.number().int(),
    })),
  }),
  financial_volume: z.object({
    estimated_revenue: z.number(),
    estimated_expenses: z.number(),
    vendor_count: z.number().int(),
  }),
  risk_level: z.enum(["low", "medium", "high"]),
  compliance_requirements: z.array(z.string()).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  controls_id: z.string().uuid(),
  event_id: z.string().uuid(),
  segregation_of_duties: z.object({
    principle: z.string(),
    role_matrix: z.array(z.object({
      function: z.string(),
      role: z.string(),
      cannot_also_perform: z.array(z.string()),
    })),
    minimum_requirements: z.array(z.string()),
  }),
  authorization_levels: z.object({
    payment_approval: z.array(z.object({
      amount_up_to: z.number(),
      required_approvers: z.array(z.string()),
      documentation_required: z.array(z.string()),
    })),
    budget_changes: z.array(z.object({
      change_type: z.string(),
      threshold: z.number(),
      approver: z.string(),
    })),
    contract_signing: z.array(z.object({
      contract_value: z.number(),
      authority: z.string(),
    })),
  }),
  preventive_controls: z.array(z.object({
    control_name: z.string(),
    description: z.string(),
    implementation: z.string(),
    frequency: z.string(),
  })),
  detective_controls: z.array(z.object({
    control_name: z.string(),
    description: z.string(),
    implementation: z.string(),
    frequency: z.string(),
  })),
  corrective_controls: z.array(z.object({
    control_name: z.string(),
    trigger: z.string(),
    action: z.string(),
    responsible: z.string(),
  })),
  documentation_requirements: z.object({
    transaction_records: z.array(z.object({
      document_type: z.string(),
      retention_period: z.string(),
      storage_location: z.string(),
    })),
    audit_trail: z.array(z.string()),
  }),
  monitoring_framework: z.object({
    key_indicators: z.array(z.object({
      indicator: z.string(),
      threshold: z.string(),
      action_if_exceeded: z.string(),
    })),
    review_schedule: z.array(z.object({
      review_type: z.string(),
      frequency: z.string(),
      participants: z.array(z.string()),
    })),
  }),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const isHighVolume = validated.financial_volume.estimated_expenses > 500000;

  const output: Output = {
    controls_id: generateUUID(),
    event_id: validated.event_id,
    segregation_of_duties: {
      principle: "재무 거래의 승인, 실행, 기록, 검토는 서로 다른 담당자가 수행해야 합니다.",
      role_matrix: [
        {
          function: "구매 요청",
          role: "담당자",
          cannot_also_perform: ["구매 승인", "지불 처리", "회계 기록"],
        },
        {
          function: "구매 승인",
          role: "팀장/디렉터",
          cannot_also_perform: ["구매 요청", "지불 처리"],
        },
        {
          function: "지불 처리",
          role: "재무팀",
          cannot_also_perform: ["구매 요청", "구매 승인"],
        },
        {
          function: "회계 기록",
          role: "회계 담당자",
          cannot_also_perform: ["현금 취급", "지불 처리"],
        },
        {
          function: "수금 처리",
          role: "수납 담당자",
          cannot_also_perform: ["회계 기록", "은행 조회"],
        },
        {
          function: "은행 조회",
          role: "재무 관리자",
          cannot_also_perform: ["수금 처리", "지불 처리"],
        },
      ],
      minimum_requirements: [
        "최소 2인 이상의 담당자로 업무 분리",
        "동일인 연속 업무 제한 (순환 근무)",
        "긴급 시 대리 승인은 사후 문서화 필수",
        "IT 시스템 접근 권한 분리",
      ],
    },
    authorization_levels: {
      payment_approval: [
        {
          amount_up_to: 1000,
          required_approvers: ["담당자"],
          documentation_required: ["영수증", "지출 요청서"],
        },
        {
          amount_up_to: 5000,
          required_approvers: ["팀장"],
          documentation_required: ["영수증", "지출 요청서", "사전 승인 기록"],
        },
        {
          amount_up_to: 20000,
          required_approvers: ["디렉터"],
          documentation_required: ["영수증", "지출 요청서", "견적서", "계약서"],
        },
        {
          amount_up_to: 100000,
          required_approvers: ["VP/재무이사"],
          documentation_required: ["영수증", "지출 요청서", "견적서", "계약서", "비교 견적"],
        },
        {
          amount_up_to: Infinity,
          required_approvers: ["CEO/CFO"],
          documentation_required: ["전체 문서 패키지", "이사회 승인 (해당 시)"],
        },
      ],
      budget_changes: [
        { change_type: "카테고리 내 재배분", threshold: 5000, approver: "프로젝트 매니저" },
        { change_type: "카테고리 간 재배분", threshold: 10000, approver: "디렉터" },
        { change_type: "총 예산 증액", threshold: 0, approver: "VP + CFO" },
        { change_type: "예비비 사용", threshold: 5000, approver: "프로젝트 매니저" },
        { change_type: "예비비 초과 사용", threshold: 0, approver: "CFO" },
      ],
      contract_signing: [
        { contract_value: 10000, authority: "팀장" },
        { contract_value: 50000, authority: "디렉터" },
        { contract_value: 200000, authority: "VP" },
        { contract_value: Infinity, authority: "CEO" },
      ],
    },
    preventive_controls: [
      {
        control_name: "사전 예산 확인",
        description: "모든 지출 전 예산 잔액 확인",
        implementation: "시스템 자동 검증 + 담당자 확인",
        frequency: "매 거래",
      },
      {
        control_name: "이중 승인",
        description: "일정 금액 이상 거래 복수 승인",
        implementation: "워크플로우 시스템",
        frequency: "해당 거래 발생 시",
      },
      {
        control_name: "공급사 검증",
        description: "신규 공급사 등록 전 검증",
        implementation: "체크리스트 + 신용 조회",
        frequency: "신규 등록 시",
      },
      {
        control_name: "권한 분리",
        description: "시스템 접근 권한 역할별 분리",
        implementation: "IT 접근 통제",
        frequency: "상시",
      },
      {
        control_name: "예산 한도 설정",
        description: "카테고리별/담당자별 지출 한도",
        implementation: "시스템 설정",
        frequency: "이벤트 시작 전",
      },
    ],
    detective_controls: [
      {
        control_name: "일일 거래 검토",
        description: "전일 거래 내역 검토",
        implementation: "재무팀 체크리스트",
        frequency: "매일",
      },
      {
        control_name: "예산 대비 실적 분석",
        description: "예산 vs 실제 차이 분석",
        implementation: "재무 보고서",
        frequency: "주간",
      },
      {
        control_name: "은행 조정",
        description: "은행 잔액과 장부 대조",
        implementation: "조정 표 작성",
        frequency: "주간",
      },
      {
        control_name: "이상 거래 탐지",
        description: "비정상 패턴 거래 식별",
        implementation: "자동 모니터링",
        frequency: "상시",
      },
      {
        control_name: "감사 샘플링",
        description: "무작위 거래 표본 검토",
        implementation: "내부 감사",
        frequency: "월간",
      },
    ],
    corrective_controls: [
      {
        control_name: "오류 수정 절차",
        trigger: "기록 오류 발견",
        action: "수정 분개 및 문서화",
        responsible: "회계 담당자 + 승인자",
      },
      {
        control_name: "부정 대응",
        trigger: "부정 의심 탐지",
        action: "즉시 조사 및 보고",
        responsible: "내부 감사 + 경영진",
      },
      {
        control_name: "예산 초과 대응",
        trigger: "카테고리 예산 90% 도달",
        action: "경고 발송 및 추가 지출 제한",
        responsible: "재무팀",
      },
      {
        control_name: "통제 실패 대응",
        trigger: "통제 미준수 발견",
        action: "원인 분석 및 재발 방지 조치",
        responsible: "프로젝트 매니저",
      },
    ],
    documentation_requirements: {
      transaction_records: [
        { document_type: "인보이스/영수증", retention_period: "7년", storage_location: "전자 문서 시스템" },
        { document_type: "계약서", retention_period: "10년", storage_location: "계약 관리 시스템" },
        { document_type: "승인 기록", retention_period: "7년", storage_location: "워크플로우 시스템" },
        { document_type: "은행 거래 내역", retention_period: "7년", storage_location: "재무 시스템" },
        { document_type: "정산 보고서", retention_period: "7년", storage_location: "문서 저장소" },
      ],
      audit_trail: [
        "모든 거래에 타임스탬프 기록",
        "변경 이력 자동 저장",
        "승인자 정보 기록",
        "접근 로그 유지",
        "삭제 불가, 수정 시 원본 보존",
      ],
    },
    monitoring_framework: {
      key_indicators: [
        {
          indicator: "예산 소진율",
          threshold: "일정 대비 ±10%",
          action_if_exceeded: "원인 분석 및 조정 계획 수립",
        },
        {
          indicator: "미결제 인보이스",
          threshold: "30일 초과 미결제",
          action_if_exceeded: "결제 우선순위 검토",
        },
        {
          indicator: "미수금",
          threshold: "60일 초과",
          action_if_exceeded: "추심 절차 시작",
        },
        {
          indicator: "지출 승인 소요 시간",
          threshold: "평균 3일 초과",
          action_if_exceeded: "프로세스 개선 검토",
        },
        {
          indicator: "차이 발생 빈도",
          threshold: "월 5건 초과",
          action_if_exceeded: "통제 강화 및 교육",
        },
      ],
      review_schedule: [
        {
          review_type: "일일 거래 검토",
          frequency: "매일",
          participants: ["재무팀"],
        },
        {
          review_type: "주간 예산 검토",
          frequency: "주간",
          participants: ["프로젝트 매니저", "재무팀"],
        },
        {
          review_type: "월간 재무 회의",
          frequency: "월간",
          participants: ["경영진", "재무팀", "프로젝트 매니저"],
        },
        {
          review_type: "내부 감사",
          frequency: isHighVolume ? "월간" : "분기",
          participants: ["내부 감사팀"],
        },
      ],
    },
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-061",
  taskName: "재무 통제 설정",
  taskType: "Human" as const,
  cmpReference: "CMP-IS 9.1.d",
  skill: "Skill 9: Manage Monetary Transactions",
  subSkill: "9.1: Establish Monetary Transaction Procedures",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
