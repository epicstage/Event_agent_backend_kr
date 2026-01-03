/**
 * STR-031: 비상 대응 계획
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Contingency Planning)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Contingency Planning Agent for event planning.

Your expertise includes:
- Emergency response planning
- Backup system design
- Crisis scenario development
- Business continuity planning

CMP-IS Standard: Domain A - Strategic Planning (Contingency Planning)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  high_priority_risks: z.array(z.object({
    risk_id: z.string(),
    risk_name: z.string(),
    category: z.string(),
    potential_impact: z.string(),
  })),
  event_critical_elements: z.array(z.object({
    element: z.string(),
    importance: z.enum(["critical", "high", "medium"]),
    current_backup: z.string().optional(),
  })).optional(),
  resources: z.object({
    emergency_budget: z.number().optional(),
    backup_venues: z.array(z.string()).optional(),
    key_contacts: z.array(z.object({
      role: z.string(),
      name: z.string().optional(),
    })).optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  contingency_plan_id: z.string().uuid(),
  event_id: z.string().uuid(),
  contingency_plans: z.array(z.object({
    risk_id: z.string(),
    risk_name: z.string(),
    trigger_conditions: z.array(z.string()),
    response_actions: z.array(z.object({
      sequence: z.number(),
      action: z.string(),
      responsible: z.string(),
      timeframe: z.string(),
      resources_needed: z.array(z.string()),
    })),
    communication_protocol: z.object({
      who_to_notify: z.array(z.string()),
      notification_method: z.string(),
      message_template: z.string(),
    }),
    decision_authority: z.object({
      level: z.string(),
      decision_maker: z.string(),
      escalation_path: z.array(z.string()),
    }),
    success_criteria: z.array(z.string()),
    stand_down_conditions: z.array(z.string()),
  })),
  backup_systems: z.array(z.object({
    primary_element: z.string(),
    backup_option: z.string(),
    activation_trigger: z.string(),
    switch_time: z.string(),
    test_schedule: z.string(),
  })),
  emergency_response_team: z.object({
    team_structure: z.array(z.object({
      role: z.string(),
      responsibilities: z.array(z.string()),
      contact_priority: z.number(),
    })),
    assembly_point: z.string(),
    communication_channel: z.string(),
  }),
  resource_reserves: z.object({
    financial_reserve: z.number(),
    allocation_guidelines: z.array(z.object({
      scenario: z.string(),
      max_allocation: z.number(),
      approval_required: z.string(),
    })),
    vendor_backup_contracts: z.array(z.object({
      service: z.string(),
      backup_vendor: z.string(),
      activation_terms: z.string(),
    })),
  }),
  drill_schedule: z.array(z.object({
    drill_type: z.string(),
    frequency: z.string(),
    participants: z.array(z.string()),
    objectives: z.array(z.string()),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-031",
  taskName: "Contingency Planning",
  domain: "A",
  skill: "Risk Management",
  taskType: "AI" as const,
  description: "리스크 발생 시 비상 대응 계획을 수립합니다.",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
};

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const contingencyPlans = validated.high_priority_risks.map(risk => ({
    risk_id: risk.risk_id,
    risk_name: risk.risk_name,
    trigger_conditions: [
      `${risk.risk_name} 발생 징후 감지`,
      `${risk.risk_name} 관련 임계값 초과`,
      "이해관계자로부터 위험 보고",
    ],
    response_actions: [
      { sequence: 1, action: "상황 확인 및 초기 평가", responsible: "현장 담당자", timeframe: "즉시 (10분 이내)", resources_needed: ["통신 장비"] },
      { sequence: 2, action: "비상 대응팀 소집", responsible: "비상 대응팀장", timeframe: "15분 이내", resources_needed: ["비상 연락망"] },
      { sequence: 3, action: "대응 계획 실행", responsible: "각 담당자", timeframe: "30분 이내", resources_needed: ["비상 예산", "백업 자원"] },
      { sequence: 4, action: "상황 모니터링 및 조정", responsible: "비상 대응팀", timeframe: "지속", resources_needed: ["상황판"] },
    ],
    communication_protocol: {
      who_to_notify: ["경영진", "핵심 이해관계자", "관련 팀"],
      notification_method: "전화 > 문자 > 이메일 순",
      message_template: `[긴급] ${validated.event_name} - ${risk.risk_name} 발생. 현재 대응 중. 상세 업데이트 예정.`,
    },
    decision_authority: {
      level: risk.category === "safety" ? "최고 수준" : "운영 수준",
      decision_maker: risk.category === "safety" ? "총괄 책임자" : "현장 책임자",
      escalation_path: ["현장 책임자", "운영 총괄", "경영진"],
    },
    success_criteria: [
      "인명 피해 없음",
      "이벤트 주요 일정 유지",
      "참가자 만족도 유지",
    ],
    stand_down_conditions: [
      "위험 상황 해소 확인",
      "정상 운영 복귀 가능",
      "추가 리스크 없음 확인",
    ],
  }));

  const criticalElements = validated.event_critical_elements || [
    { element: "메인 무대", importance: "critical" as const },
    { element: "등록 시스템", importance: "critical" as const },
    { element: "음향/영상 시스템", importance: "high" as const },
    { element: "케이터링", importance: "high" as const },
  ];

  const backupSystems = criticalElements.map(elem => ({
    primary_element: elem.element,
    backup_option: elem.current_backup || `${elem.element} 백업 시스템`,
    activation_trigger: `${elem.element} 장애 발생`,
    switch_time: elem.importance === "critical" ? "5분 이내" : "15분 이내",
    test_schedule: "이벤트 1주일 전",
  }));

  return {
    contingency_plan_id: generateUUID(),
    event_id: validated.event_id,
    contingency_plans: contingencyPlans,
    backup_systems: backupSystems,
    emergency_response_team: {
      team_structure: [
        { role: "비상 대응팀장", responsibilities: ["총괄 지휘", "의사결정", "외부 커뮤니케이션"], contact_priority: 1 },
        { role: "운영 담당", responsibilities: ["현장 운영 조정", "자원 배치"], contact_priority: 2 },
        { role: "안전 담당", responsibilities: ["인명 안전", "대피 지휘"], contact_priority: 2 },
        { role: "커뮤니케이션 담당", responsibilities: ["내부/외부 소통", "미디어 대응"], contact_priority: 3 },
        { role: "물류/시설 담당", responsibilities: ["시설 관리", "장비 대응"], contact_priority: 3 },
      ],
      assembly_point: "행사장 내 지정 통제실 또는 백업 지휘소",
      communication_channel: "전용 무전기 + 비상 연락 그룹",
    },
    resource_reserves: {
      financial_reserve: validated.resources?.emergency_budget || 50000000,
      allocation_guidelines: [
        { scenario: "경미한 운영 이슈", max_allocation: 5000000, approval_required: "현장 책임자" },
        { scenario: "중요 시스템 장애", max_allocation: 20000000, approval_required: "운영 총괄" },
        { scenario: "안전 관련 비상", max_allocation: 50000000, approval_required: "즉시 집행 (사후 보고)" },
      ],
      vendor_backup_contracts: [
        { service: "음향/영상", backup_vendor: "백업 AV 업체", activation_terms: "주 업체 장애 시 2시간 내 투입" },
        { service: "케이터링", backup_vendor: "백업 케이터링", activation_terms: "긴급 요청 시 당일 대응" },
      ],
    },
    drill_schedule: [
      { drill_type: "테이블탑 훈련", frequency: "이벤트 1개월 전", participants: ["핵심 팀"], objectives: ["시나리오별 대응 숙지", "의사결정 연습"] },
      { drill_type: "현장 훈련", frequency: "이벤트 1주일 전", participants: ["전체 스태프"], objectives: ["실제 대응 절차 점검", "커뮤니케이션 테스트"] },
      { drill_type: "시스템 전환 테스트", frequency: "이벤트 3일 전", participants: ["기술팀"], objectives: ["백업 시스템 정상 작동 확인"] },
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
