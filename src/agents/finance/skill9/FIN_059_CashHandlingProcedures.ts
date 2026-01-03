/**
 * FIN-059: 현금 취급 절차
 *
 * CMP-IS Reference: 9.1.b
 * Task Type: Human
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Cash Handling Procedures.
CMP-IS Standard: 9.1.b - Establishing cash handling procedures (Human task with AI support).`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  event_dates: z.object({
    start: z.string(),
    end: z.string(),
  }),
  cash_points: z.array(z.object({
    location_name: z.string(),
    type: z.enum(["registration", "merchandise", "food_beverage", "parking", "other"]),
    expected_daily_volume: z.number(),
    operating_hours: z.string(),
  })),
  staff_count: z.object({
    cashiers: z.number().int(),
    supervisors: z.number().int(),
  }),
  security_requirements: z.enum(["standard", "enhanced", "high_security"]),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  procedure_id: z.string().uuid(),
  event_id: z.string().uuid(),
  cash_handling_policy: z.object({
    policy_statement: z.string(),
    scope: z.string(),
    effective_date: z.string(),
  }),
  opening_procedures: z.array(z.object({
    step: z.number().int(),
    action: z.string(),
    responsible: z.string(),
    verification: z.string(),
  })),
  during_event_procedures: z.object({
    transaction_handling: z.array(z.object({
      procedure: z.string(),
      frequency: z.string(),
    })),
    cash_drop_schedule: z.array(z.object({
      threshold_amount: z.number(),
      action: z.string(),
      documentation: z.string(),
    })),
    supervisor_checks: z.array(z.object({
      check_type: z.string(),
      frequency: z.string(),
      documentation: z.string(),
    })),
  }),
  closing_procedures: z.array(z.object({
    step: z.number().int(),
    action: z.string(),
    responsible: z.string(),
    verification: z.string(),
  })),
  security_measures: z.object({
    physical_security: z.array(z.string()),
    personnel_requirements: z.array(z.string()),
    transport_procedures: z.array(z.string()),
    emergency_procedures: z.array(z.string()),
  }),
  documentation_requirements: z.object({
    forms: z.array(z.object({
      form_name: z.string(),
      purpose: z.string(),
      frequency: z.string(),
    })),
    reporting: z.array(z.object({
      report_type: z.string(),
      deadline: z.string(),
      recipient: z.string(),
    })),
  }),
  float_management: z.object({
    initial_float_per_point: z.number(),
    denominations: z.array(z.object({
      denomination: z.string(),
      quantity: z.number().int(),
    })),
    replenishment_threshold: z.number(),
    replenishment_procedure: z.string(),
  }),
  discrepancy_handling: z.object({
    tolerance_amount: z.number(),
    investigation_triggers: z.array(z.string()),
    escalation_path: z.array(z.string()),
    documentation_required: z.array(z.string()),
  }),
  training_requirements: z.array(z.object({
    topic: z.string(),
    duration_hours: z.number(),
    certification_required: z.boolean(),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const totalDailyVolume = validated.cash_points.reduce((sum, p) => sum + p.expected_daily_volume, 0);
  const floatPerPoint = Math.max(500, Math.round(totalDailyVolume / validated.cash_points.length * 0.1 / 100) * 100);

  const output: Output = {
    procedure_id: generateUUID(),
    event_id: validated.event_id,
    cash_handling_policy: {
      policy_statement: `${validated.event_name} 이벤트의 모든 현금 거래는 본 절차에 따라 처리되어야 하며, 모든 현금 취급 직원은 이를 준수해야 합니다.`,
      scope: `모든 현금 수납 지점 (${validated.cash_points.length}개소) 및 현금 취급 담당자`,
      effective_date: validated.event_dates.start,
    },
    opening_procedures: [
      {
        step: 1,
        action: "현금 금고 개방 및 시재 확인",
        responsible: "수퍼바이저",
        verification: "시재 확인서 서명",
      },
      {
        step: 2,
        action: "각 수납 지점별 운영 자금(float) 배분",
        responsible: "수퍼바이저",
        verification: "인수인계 서명",
      },
      {
        step: 3,
        action: "POS/금전등록기 시스템 확인",
        responsible: "캐셔",
        verification: "시스템 로그",
      },
      {
        step: 4,
        action: "현금함 시재 카운트 및 기록",
        responsible: "캐셔",
        verification: "개시 시재 확인서",
      },
      {
        step: 5,
        action: "영업 시작 준비 완료 보고",
        responsible: "캐셔",
        verification: "수퍼바이저 확인",
      },
    ],
    during_event_procedures: {
      transaction_handling: [
        { procedure: "모든 거래는 POS 시스템에 즉시 등록", frequency: "매 거래" },
        { procedure: "거스름돈 확인 후 고객에게 전달", frequency: "매 거래" },
        { procedure: "영수증 발행 및 제공", frequency: "매 거래" },
        { procedure: "위조지폐 검사 (고액권)", frequency: "매 거래" },
      ],
      cash_drop_schedule: [
        {
          threshold_amount: 2000,
          action: "현금함에서 금고로 이동",
          documentation: "현금 이동 전표 작성",
        },
        {
          threshold_amount: 5000,
          action: "즉시 금고 입금 및 보안 담당자 호출",
          documentation: "긴급 이동 보고서",
        },
      ],
      supervisor_checks: [
        { check_type: "무작위 현금함 확인", frequency: "2시간마다", documentation: "점검 체크리스트" },
        { check_type: "POS 거래 내역 검토", frequency: "4시간마다", documentation: "거래 요약 보고서" },
        { check_type: "교대 시 시재 확인", frequency: "교대 시", documentation: "교대 인수인계서" },
      ],
    },
    closing_procedures: [
      {
        step: 1,
        action: "최종 거래 완료 및 POS 마감",
        responsible: "캐셔",
        verification: "마감 영수증 출력",
      },
      {
        step: 2,
        action: "현금함 전체 시재 카운트",
        responsible: "캐셔",
        verification: "마감 시재 확인서",
      },
      {
        step: 3,
        action: "POS 매출과 현금 대조",
        responsible: "캐셔 + 수퍼바이저",
        verification: "대조 확인서 서명",
      },
      {
        step: 4,
        action: "차액 발생 시 원인 조사",
        responsible: "수퍼바이저",
        verification: "차액 보고서",
      },
      {
        step: 5,
        action: "현금 봉투 밀봉 및 금고 입금",
        responsible: "수퍼바이저",
        verification: "입금 확인서",
      },
      {
        step: 6,
        action: "다음 날 운영 자금 분리",
        responsible: "수퍼바이저",
        verification: "다음 날 시재 준비 확인",
      },
    ],
    security_measures: {
      physical_security: [
        "현금함은 항상 잠금 상태 유지",
        "CCTV 현금 취급 구역 상시 녹화",
        "금고는 이중 잠금 장치 사용",
        "현금 운반 시 보안 가방 사용",
      ],
      personnel_requirements: [
        "신원 조회 완료된 직원만 현금 취급",
        "현금 취급 교육 이수 필수",
        "2인 1조 현금 카운트 원칙",
        "정기 휴식 시 대체 인력 배치",
      ],
      transport_procedures: [
        "현금 운반은 보안 요원 동행",
        "정해진 루트 외 이동 금지",
        "운반 일정 비공개",
        "대량 현금은 전문 현금 수송 업체 이용",
      ],
      emergency_procedures: [
        "강도 발생 시: 저항하지 않고 협조, 즉시 경찰 신고",
        "화재 발생 시: 인명 안전 우선, 가능시 현금 금고 확보",
        "시스템 장애 시: 수기 영수증 발행, 이중 기록",
        "정전 시: 현금함 잠금, 운영 중단",
      ],
    },
    documentation_requirements: {
      forms: [
        { form_name: "시재 확인서", purpose: "개시/마감 시재 기록", frequency: "매일 2회" },
        { form_name: "현금 이동 전표", purpose: "현금함-금고 간 이동 기록", frequency: "수시" },
        { form_name: "차액 보고서", purpose: "시재 불일치 기록", frequency: "발생 시" },
        { form_name: "일일 정산 보고서", purpose: "일일 현금 흐름 요약", frequency: "매일" },
      ],
      reporting: [
        { report_type: "일일 현금 보고서", deadline: "익일 오전 9시", recipient: "재무팀" },
        { report_type: "차액 발생 보고", deadline: "즉시", recipient: "재무팀장" },
        { report_type: "주간 현금 요약", deadline: "매주 월요일", recipient: "프로젝트 매니저" },
      ],
    },
    float_management: {
      initial_float_per_point: floatPerPoint,
      denominations: [
        { denomination: "10,000원", quantity: Math.round(floatPerPoint * 0.3 / 10000) },
        { denomination: "5,000원", quantity: Math.round(floatPerPoint * 0.2 / 5000) },
        { denomination: "1,000원", quantity: Math.round(floatPerPoint * 0.3 / 1000) },
        { denomination: "500원", quantity: Math.round(floatPerPoint * 0.1 / 500) },
        { denomination: "100원", quantity: Math.round(floatPerPoint * 0.1 / 100) },
      ],
      replenishment_threshold: Math.round(floatPerPoint * 0.3),
      replenishment_procedure: "수퍼바이저에게 요청 후 금고에서 인출, 인수인계서 작성",
    },
    discrepancy_handling: {
      tolerance_amount: 5,
      investigation_triggers: [
        "허용 오차 초과 차액 발생",
        "연속 3일 차액 발생",
        "패턴성 차액 (특정 시간대, 담당자)",
        "대금액 차액 (100 이상)",
      ],
      escalation_path: [
        "1단계: 수퍼바이저 현장 확인",
        "2단계: 재무팀장 보고 및 CCTV 검토",
        "3단계: 프로젝트 매니저 보고",
        "4단계: 법적 조치 검토 (필요시)",
      ],
      documentation_required: [
        "차액 발생 보고서",
        "관련 거래 내역",
        "담당자 진술서",
        "CCTV 영상 보존 요청",
      ],
    },
    training_requirements: [
      { topic: "현금 취급 기본 절차", duration_hours: 2, certification_required: true },
      { topic: "위조지폐 식별", duration_hours: 1, certification_required: false },
      { topic: "POS 시스템 운영", duration_hours: 1.5, certification_required: true },
      { topic: "보안 및 비상 대응", duration_hours: 1, certification_required: true },
      { topic: "고객 응대", duration_hours: 0.5, certification_required: false },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-059",
  taskName: "현금 취급 절차",
  taskType: "Human" as const,
  cmpReference: "CMP-IS 9.1.b",
  skill: "Skill 9: Manage Monetary Transactions",
  subSkill: "9.1: Establish Monetary Transaction Procedures",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
