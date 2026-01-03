/**
 * FIN-063: 감사 추적 구성
 *
 * CMP-IS Reference: 9.1.f
 * Task Type: Hybrid
 */

import { z } from "zod";
import { generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Audit Trail Configuration.
CMP-IS Standard: 9.1.f - Configuring audit trail and documentation systems.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  systems_in_use: z.array(z.object({
    system_name: z.string(),
    system_type: z.enum(["registration", "payment", "accounting", "crm", "erp", "other"]),
    vendor: z.string(),
    has_audit_log: z.boolean(),
  })),
  compliance_requirements: z.array(z.string()),
  retention_requirements: z.object({
    financial_records: z.number().int(),
    transaction_logs: z.number().int(),
    audit_reports: z.number().int(),
  }),
  access_control_needs: z.enum(["basic", "standard", "strict"]),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  configuration_id: z.string().uuid(),
  event_id: z.string().uuid(),
  audit_trail_design: z.object({
    objectives: z.array(z.string()),
    scope: z.array(z.string()),
    key_principles: z.array(z.string()),
  }),
  data_capture_requirements: z.array(z.object({
    transaction_type: z.string(),
    data_elements: z.array(z.string()),
    capture_method: z.string(),
    storage_location: z.string(),
  })),
  system_configurations: z.array(z.object({
    system_name: z.string(),
    audit_settings: z.array(z.object({
      setting: z.string(),
      value: z.string(),
      purpose: z.string(),
    })),
    integration_requirements: z.array(z.string()),
  })),
  access_controls: z.object({
    role_based_access: z.array(z.object({
      role: z.string(),
      audit_log_access: z.enum(["none", "read_own", "read_all", "full"]),
      modification_rights: z.boolean(),
    })),
    authentication_requirements: z.array(z.string()),
    segregation_rules: z.array(z.string()),
  }),
  retention_policy: z.object({
    categories: z.array(z.object({
      category: z.string(),
      retention_period_years: z.number().int(),
      storage_format: z.string(),
      destruction_method: z.string(),
    })),
    backup_schedule: z.array(z.object({
      type: z.string(),
      frequency: z.string(),
      location: z.string(),
    })),
  }),
  reporting_framework: z.object({
    standard_reports: z.array(z.object({
      report_name: z.string(),
      purpose: z.string(),
      frequency: z.string(),
      recipients: z.array(z.string()),
    })),
    ad_hoc_capabilities: z.array(z.string()),
    exception_alerts: z.array(z.object({
      trigger: z.string(),
      alert_method: z.string(),
      recipients: z.array(z.string()),
    })),
  }),
  quality_assurance: z.object({
    verification_procedures: z.array(z.object({
      procedure: z.string(),
      frequency: z.string(),
      responsible: z.string(),
    })),
    completeness_checks: z.array(z.string()),
    integrity_controls: z.array(z.string()),
  }),
  implementation_plan: z.array(z.object({
    phase: z.string(),
    tasks: z.array(z.string()),
    timeline: z.string(),
    dependencies: z.array(z.string()),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const systemConfigs = validated.systems_in_use.map(system => ({
    system_name: system.system_name,
    audit_settings: [
      { setting: "감사 로그 활성화", value: "true", purpose: "모든 거래 기록 유지" },
      { setting: "타임스탬프 형식", value: "ISO 8601 UTC", purpose: "표준화된 시간 기록" },
      { setting: "사용자 식별", value: "개별 계정 필수", purpose: "행위자 추적" },
      { setting: "변경 전/후 값 기록", value: "true", purpose: "수정 내역 추적" },
      { setting: "로그 삭제 방지", value: "true", purpose: "무결성 보장" },
    ],
    integration_requirements: system.has_audit_log
      ? ["기존 감사 로그 활성화", "중앙 로그 서버 연동"]
      : ["별도 감사 로그 시스템 구축", "API 연동 개발 필요"],
  }));

  const output: Output = {
    configuration_id: generateUUID(),
    event_id: validated.event_id,
    audit_trail_design: {
      objectives: [
        "모든 금융 거래의 완전한 기록 유지",
        "거래 발생부터 완료까지 전 과정 추적 가능",
        "부정 및 오류 탐지/예방 지원",
        "규정 준수 증빙 확보",
        "내/외부 감사 지원",
      ],
      scope: [
        "모든 수입 거래 (등록, 스폰서십, 전시 등)",
        "모든 지출 거래 (구매, 결제, 환불 등)",
        "예산 변경 및 승인",
        "시스템 접근 및 권한 변경",
        "데이터 수정 및 삭제",
      ],
      key_principles: [
        "완전성: 누락 없는 기록",
        "정확성: 오류 없는 데이터",
        "시의성: 실시간 또는 준실시간 기록",
        "불변성: 무단 수정 방지",
        "접근성: 권한자 열람 가능",
      ],
    },
    data_capture_requirements: [
      {
        transaction_type: "결제 거래",
        data_elements: [
          "거래 ID", "타임스탬프", "금액", "통화",
          "결제 방법", "고객 ID", "상품/서비스", "상태",
          "처리자", "승인 코드",
        ],
        capture_method: "결제 시스템 자동 기록",
        storage_location: "중앙 거래 데이터베이스",
      },
      {
        transaction_type: "환불 처리",
        data_elements: [
          "환불 ID", "원거래 ID", "환불 금액", "환불 사유",
          "요청자", "승인자", "처리 일시", "환불 방법",
        ],
        capture_method: "환불 워크플로우 시스템",
        storage_location: "중앙 거래 데이터베이스",
      },
      {
        transaction_type: "지출 승인",
        data_elements: [
          "요청 ID", "요청자", "금액", "카테고리",
          "공급자", "사유", "승인자", "승인 일시", "상태",
        ],
        capture_method: "지출 승인 워크플로우",
        storage_location: "지출 관리 시스템",
      },
      {
        transaction_type: "시스템 접근",
        data_elements: [
          "세션 ID", "사용자 ID", "로그인 시간", "IP 주소",
          "접근 시스템", "수행 작업", "로그아웃 시간",
        ],
        capture_method: "인증 시스템 자동 기록",
        storage_location: "보안 로그 서버",
      },
    ],
    system_configurations: systemConfigs,
    access_controls: {
      role_based_access: [
        { role: "시스템 관리자", audit_log_access: "full", modification_rights: false },
        { role: "재무팀장", audit_log_access: "read_all", modification_rights: false },
        { role: "재무 담당자", audit_log_access: "read_own", modification_rights: false },
        { role: "내부 감사", audit_log_access: "read_all", modification_rights: false },
        { role: "외부 감사", audit_log_access: "read_all", modification_rights: false },
        { role: "일반 사용자", audit_log_access: "none", modification_rights: false },
      ],
      authentication_requirements: [
        "개인 계정 필수 (공유 계정 금지)",
        "강력한 비밀번호 정책",
        "2단계 인증 (민감 시스템)",
        "세션 타임아웃 설정",
        "비활동 자동 로그아웃",
      ],
      segregation_rules: [
        "거래 실행자와 승인자 분리",
        "시스템 관리자와 데이터 입력자 분리",
        "감사 로그 접근자와 거래 처리자 분리",
      ],
    },
    retention_policy: {
      categories: [
        {
          category: "거래 기록",
          retention_period_years: validated.retention_requirements.financial_records,
          storage_format: "암호화된 데이터베이스",
          destruction_method: "보안 삭제 (덮어쓰기 3회)",
        },
        {
          category: "시스템 로그",
          retention_period_years: validated.retention_requirements.transaction_logs,
          storage_format: "압축 로그 파일",
          destruction_method: "보안 삭제",
        },
        {
          category: "감사 보고서",
          retention_period_years: validated.retention_requirements.audit_reports,
          storage_format: "PDF + 원본 데이터",
          destruction_method: "승인 후 보안 삭제",
        },
      ],
      backup_schedule: [
        { type: "전체 백업", frequency: "매일", location: "이중화 데이터센터" },
        { type: "증분 백업", frequency: "매 시간", location: "로컬 + 원격" },
        { type: "아카이브", frequency: "월간", location: "오프사이트 저장소" },
      ],
    },
    reporting_framework: {
      standard_reports: [
        {
          report_name: "일일 거래 요약",
          purpose: "당일 거래 현황 검토",
          frequency: "매일",
          recipients: ["재무팀", "프로젝트 매니저"],
        },
        {
          report_name: "예외 거래 보고서",
          purpose: "비정상 거래 식별",
          frequency: "주간",
          recipients: ["재무팀장", "내부 감사"],
        },
        {
          report_name: "접근 로그 분석",
          purpose: "시스템 접근 패턴 검토",
          frequency: "주간",
          recipients: ["IT 보안", "재무팀장"],
        },
        {
          report_name: "감사 증적 완전성 보고",
          purpose: "기록 누락 확인",
          frequency: "월간",
          recipients: ["내부 감사", "경영진"],
        },
      ],
      ad_hoc_capabilities: [
        "기간별 거래 조회",
        "사용자별 활동 조회",
        "특정 거래 상세 추적",
        "커스텀 필터 검색",
        "데이터 내보내기 (감사 목적)",
      ],
      exception_alerts: [
        {
          trigger: "대금액 거래 (기준 초과)",
          alert_method: "이메일 + 시스템 알림",
          recipients: ["재무팀장", "프로젝트 매니저"],
        },
        {
          trigger: "업무 시간 외 접근",
          alert_method: "즉시 SMS + 이메일",
          recipients: ["IT 보안", "재무팀장"],
        },
        {
          trigger: "다수 실패 로그인",
          alert_method: "계정 잠금 + 알림",
          recipients: ["IT 보안"],
        },
        {
          trigger: "권한 변경",
          alert_method: "이메일",
          recipients: ["시스템 관리자", "재무팀장"],
        },
      ],
    },
    quality_assurance: {
      verification_procedures: [
        {
          procedure: "로그 완전성 검증",
          frequency: "매일",
          responsible: "시스템 자동 + IT팀 검토",
        },
        {
          procedure: "샘플 거래 대조",
          frequency: "주간",
          responsible: "재무팀",
        },
        {
          procedure: "백업 복원 테스트",
          frequency: "월간",
          responsible: "IT팀",
        },
        {
          procedure: "감사 추적 검토",
          frequency: "분기",
          responsible: "내부 감사",
        },
      ],
      completeness_checks: [
        "일일 거래 수 vs 로그 항목 수 대조",
        "시스템 간 거래 ID 연결 확인",
        "누락 타임스탬프 탐지",
        "필수 필드 공백 확인",
      ],
      integrity_controls: [
        "해시값 검증 (로그 무결성)",
        "순차 번호 연속성 확인",
        "타임스탬프 순서 검증",
        "변경 불가 설정 확인",
      ],
    },
    implementation_plan: [
      {
        phase: "평가 및 계획",
        tasks: [
          "현재 시스템 감사 로그 기능 평가",
          "갭 분석",
          "상세 구현 계획 수립",
        ],
        timeline: "D-60 ~ D-45",
        dependencies: [],
      },
      {
        phase: "시스템 구성",
        tasks: [
          "각 시스템 감사 설정 적용",
          "중앙 로그 수집 시스템 구축",
          "접근 권한 설정",
        ],
        timeline: "D-45 ~ D-30",
        dependencies: ["평가 및 계획"],
      },
      {
        phase: "통합 및 테스트",
        tasks: [
          "시스템 간 연동 테스트",
          "보고서 생성 테스트",
          "복원 테스트",
        ],
        timeline: "D-30 ~ D-21",
        dependencies: ["시스템 구성"],
      },
      {
        phase: "교육 및 런칭",
        tasks: [
          "담당자 교육",
          "운영 매뉴얼 배포",
          "모니터링 시작",
        ],
        timeline: "D-21 ~ D-14",
        dependencies: ["통합 및 테스트"],
      },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-063",
  taskName: "감사 추적 구성",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 9.1.f",
  skill: "Skill 9: Manage Monetary Transactions",
  subSkill: "9.1: Establish Monetary Transaction Procedures",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
