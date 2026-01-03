/**
 * HR-014: Backup Staffing Plan
 *
 * CMP-IS Domain F: Human Resources - Skill 11: HR Planning
 * 비상 인력 및 백업 계획
 */

import { z } from "zod";

export const HR_014_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  total_staff_count: z.number(),
  departments: z.array(z.object({
    name: z.string(),
    staff_count: z.number(),
    criticality: z.enum(["high", "medium", "low"]),
  })),
  event_duration_days: z.number(),
  historical_no_show_rate: z.number().default(0.1),
  backup_budget_available: z.number().optional(),
});

export const HR_014_OutputSchema = z.object({
  event_id: z.string(),
  risk_analysis: z.object({
    expected_no_shows: z.number(),
    peak_risk_times: z.array(z.string()),
    high_risk_positions: z.array(z.object({
      position: z.string(),
      risk_factors: z.array(z.string()),
      impact_if_absent: z.string(),
    })),
  }),
  backup_strategy: z.object({
    backup_pool_size: z.number(),
    pool_composition: z.array(z.object({
      source: z.string(),
      quantity: z.number(),
      readiness_level: z.enum(["immediate", "same_day", "next_day"]),
      cost_per_person: z.number(),
    })),
    cross_training_plan: z.array(z.object({
      primary_role: z.string(),
      backup_roles: z.array(z.string()),
      training_required: z.string(),
    })),
  }),
  contingency_protocols: z.array(z.object({
    scenario: z.string(),
    trigger: z.string(),
    immediate_actions: z.array(z.string()),
    escalation_path: z.string(),
    resolution_target: z.string(),
  })),
  on_call_system: z.object({
    structure: z.string(),
    on_call_count: z.number(),
    compensation: z.string(),
    activation_process: z.array(z.object({
      step: z.number(),
      action: z.string(),
      responsible: z.string(),
      timeframe: z.string(),
    })),
  }),
  agency_partnerships: z.array(z.object({
    agency_type: z.string(),
    purpose: z.string(),
    lead_time: z.string(),
    estimated_cost: z.string(),
    contract_terms: z.array(z.string()),
  })),
  budget_estimate: z.object({
    on_call_compensation: z.number(),
    agency_retainer: z.number(),
    emergency_fund: z.number(),
    total: z.number(),
  }),
});

export type HR_014_Input = z.infer<typeof HR_014_InputSchema>;
export type HR_014_Output = z.infer<typeof HR_014_OutputSchema>;

export async function execute(input: HR_014_Input): Promise<HR_014_Output> {
  const expectedNoShows = Math.ceil(input.total_staff_count * input.historical_no_show_rate);

  // 부서별 백업 필요 인원 계산
  const backupNeeds = input.departments.map((dept) => {
    const multiplier = dept.criticality === "high" ? 0.2 : dept.criticality === "medium" ? 0.15 : 0.1;
    return {
      department: dept.name,
      backup_needed: Math.ceil(dept.staff_count * multiplier),
    };
  });
  const totalBackupNeeded = backupNeeds.reduce((sum, d) => sum + d.backup_needed, 0);

  // 고위험 포지션 식별
  const highRiskPositions = input.departments
    .filter((d) => d.criticality === "high")
    .map((d) => ({
      position: `${d.name} 핵심 스태프`,
      risk_factors: [
        "대체 불가능한 전문 기술 필요",
        "참가자 접점 최전선",
        "행사 운영 핵심 역할",
      ],
      impact_if_absent: "서비스 품질 저하, 참가자 불만, 운영 차질",
    }));

  // 백업 풀 구성
  const poolComposition = [
    {
      source: "대기 인력 (On-call Staff)",
      quantity: Math.ceil(totalBackupNeeded * 0.4),
      readiness_level: "immediate" as const,
      cost_per_person: 50000, // 대기 수당
    },
    {
      source: "교차 훈련된 기존 스태프",
      quantity: Math.ceil(totalBackupNeeded * 0.3),
      readiness_level: "immediate" as const,
      cost_per_person: 0, // 추가 비용 없음
    },
    {
      source: "인력 파견 업체 계약",
      quantity: Math.ceil(totalBackupNeeded * 0.2),
      readiness_level: "same_day" as const,
      cost_per_person: 120000,
    },
    {
      source: "인력풀 예비 등록자",
      quantity: Math.ceil(totalBackupNeeded * 0.1),
      readiness_level: "next_day" as const,
      cost_per_person: 100000,
    },
  ];

  // 교차 훈련 계획
  const crossTrainingPlan = [
    {
      primary_role: "등록 스태프",
      backup_roles: ["안내 데스크", "정보 부스"],
      training_required: "등록 시스템 기초 교육 (2시간)",
    },
    {
      primary_role: "안내 스태프",
      backup_roles: ["등록 보조", "출입 통제 보조"],
      training_required: "행사장 레이아웃 숙지 (1시간)",
    },
    {
      primary_role: "케이터링 스태프",
      backup_roles: ["청소 지원", "물품 운반"],
      training_required: "위생 기초 교육 (1시간)",
    },
    {
      primary_role: "기술 스태프",
      backup_roles: ["기본 AV 조작"],
      training_required: "장비 기초 조작법 (2시간)",
    },
  ];

  // 비상 프로토콜
  const contingencyProtocols = [
    {
      scenario: "다수 노쇼 (20% 이상)",
      trigger: "출근 체크 마감 시 20% 이상 미출근",
      immediate_actions: [
        "대기 인력 전원 출동 요청",
        "교차 훈련 스태프 재배치",
        "인력 파견 업체 긴급 요청",
        "비핵심 구역 인력 감축 후 재배치",
      ],
      escalation_path: "팀 리더 → 부서 매니저 → 운영 총괄",
      resolution_target: "30분 내 필수 인력 확보",
    },
    {
      scenario: "핵심 인력 긴급 이탈",
      trigger: "팀 리더 또는 매니저 급 인력 부재",
      immediate_actions: [
        "지정 백업 리더 활성화",
        "운영 총괄에 즉시 보고",
        "해당 팀 브리핑 실시",
      ],
      escalation_path: "운영 부총괄 → 행사 총괄",
      resolution_target: "15분 내 대체 리더 배치",
    },
    {
      scenario: "근무 중 부상/질병",
      trigger: "스태프 업무 지속 불가",
      immediate_actions: [
        "의료 지원 제공",
        "해당 포지션 임시 커버",
        "대기 인력 또는 교차 배치",
        "사고 보고서 작성",
      ],
      escalation_path: "팀 리더 → 안전 매니저 → 부서 매니저",
      resolution_target: "즉시 커버, 30분 내 정식 대체",
    },
    {
      scenario: "대규모 인력 이동 필요",
      trigger: "특정 구역 인원 급증/급감",
      immediate_actions: [
        "실시간 현황 파악",
        "유연 배치 인력 이동",
        "대기 인력 선택적 투입",
      ],
      escalation_path: "팀 리더 → 부서 매니저 → 운영 총괄",
      resolution_target: "15분 내 재배치 완료",
    },
  ];

  // 대기 시스템
  const onCallCount = Math.ceil(totalBackupNeeded * 0.4);
  const onCallSystem = {
    structure: "1차 대기 (현장 대기) + 2차 대기 (원거리 대기)",
    on_call_count: onCallCount,
    compensation: "대기 수당 50,000원/일 + 출동 시 정상 급여",
    activation_process: [
      { step: 1, action: "HR 담당자가 대기 인력 연락", responsible: "HR 담당", timeframe: "결원 확인 즉시" },
      { step: 2, action: "대기 인력 출동 가능 여부 확인", responsible: "HR 담당", timeframe: "5분 이내" },
      { step: 3, action: "출동 확정 및 배치 위치 안내", responsible: "부서 매니저", timeframe: "10분 이내" },
      { step: 4, action: "현장 도착 및 간단 브리핑", responsible: "팀 리더", timeframe: "도착 즉시" },
      { step: 5, action: "업무 투입 및 확인", responsible: "팀 리더", timeframe: "브리핑 후 즉시" },
    ],
  };

  // 예산 추정
  const onCallCompensation = onCallCount * 50000 * input.event_duration_days;
  const agencyRetainer = 500000; // 기본 계약 유지비
  const emergencyFund = Math.ceil(input.total_staff_count * 0.05 * 100000); // 5% 긴급 투입 비용
  const budgetTotal = onCallCompensation + agencyRetainer + emergencyFund;

  return {
    event_id: input.event_id,
    risk_analysis: {
      expected_no_shows: expectedNoShows,
      peak_risk_times: [
        "행사 첫날 아침 (긴장감 높음)",
        "마지막 날 오후 (피로 누적)",
        "장시간 근무 후 다음 날",
        "악천후 예보 시",
      ],
      high_risk_positions: highRiskPositions,
    },
    backup_strategy: {
      backup_pool_size: totalBackupNeeded,
      pool_composition: poolComposition,
      cross_training_plan: crossTrainingPlan,
    },
    contingency_protocols: contingencyProtocols,
    on_call_system: onCallSystem,
    agency_partnerships: [
      {
        agency_type: "일반 이벤트 인력 파견",
        purpose: "등록, 안내, 케이터링 보조 등 일반 업무",
        lead_time: "최소 24시간, 긴급 시 4시간",
        estimated_cost: "시간당 15,000원 + 수수료 20%",
        contract_terms: [
          "최소 4시간 단위 파견",
          "노쇼 시 대체 인력 무상 제공",
          "사전 교육 필수 (1시간)",
        ],
      },
      {
        agency_type: "전문 보안 인력",
        purpose: "출입 통제, 안전 관리",
        lead_time: "최소 48시간",
        estimated_cost: "시간당 20,000원 + 수수료 25%",
        contract_terms: [
          "자격증 소지자 필수",
          "유니폼 별도 제공 또는 대여",
          "보험 가입 필수",
        ],
      },
    ],
    budget_estimate: {
      on_call_compensation: onCallCompensation,
      agency_retainer: agencyRetainer,
      emergency_fund: emergencyFund,
      total: budgetTotal,
    },
  };
}

export const HR_014_BackupStaffing = {
  id: "HR-014",
  name: "Backup Staffing Plan",
  description: "비상 인력 및 백업 계획",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 11.14",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_014_InputSchema,
  outputSchema: HR_014_OutputSchema,
  persona: `당신은 인력 위기관리 전문가입니다. 예상치 못한 인력 공백에 대비하여 행사 운영의 연속성을 보장하는 백업 체계를 수립합니다.`,
};

export default HR_014_BackupStaffing;
