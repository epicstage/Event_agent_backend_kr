/**
 * HR-027: Emergency Staffing Response
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 비상 인력 대응
 */

import { z } from "zod";

export const HR_027_InputSchema = z.object({
  event_id: z.string().uuid(),
  emergency_type: z.enum(["mass_no_show", "key_person_absence", "sudden_demand", "injury_evacuation", "weather_delay"]),
  affected_positions: z.array(z.object({
    department: z.string(),
    role: z.string(),
    count_needed: z.number(),
  })),
  available_resources: z.object({
    on_call_staff: z.number(),
    cross_trained_staff: z.number(),
    agency_contact_available: z.boolean(),
  }),
  time_constraint: z.string(),
});

export const HR_027_OutputSchema = z.object({
  event_id: z.string(),
  situation_assessment: z.object({
    emergency_level: z.enum(["level_1", "level_2", "level_3"]),
    total_gap: z.number(),
    time_available: z.string(),
    feasibility: z.enum(["high", "medium", "low"]),
  }),
  immediate_actions: z.array(z.object({
    priority: z.number(),
    action: z.string(),
    responsible: z.string(),
    timeline: z.string(),
    expected_result: z.string(),
  })),
  resource_activation: z.object({
    on_call_activated: z.number(),
    cross_trained_deployed: z.number(),
    agency_requested: z.number(),
    internal_reallocation: z.number(),
  }),
  contingency_measures: z.array(z.object({
    measure: z.string(),
    applies_when: z.string(),
    impact: z.string(),
  })),
  communication_script: z.object({
    to_on_call_staff: z.string(),
    to_agency: z.string(),
    to_management: z.string(),
    to_remaining_staff: z.string(),
  }),
  status_updates: z.array(z.object({
    time: z.string(),
    update_to: z.string(),
    content: z.string(),
  })),
});

export type HR_027_Input = z.infer<typeof HR_027_InputSchema>;
export type HR_027_Output = z.infer<typeof HR_027_OutputSchema>;

export async function execute(input: HR_027_Input): Promise<HR_027_Output> {
  const totalGap = input.affected_positions.reduce((sum, p) => sum + p.count_needed, 0);

  // 비상 레벨 결정
  let emergencyLevel: "level_1" | "level_2" | "level_3" = "level_1";
  if (totalGap > 20 || input.emergency_type === "mass_no_show") emergencyLevel = "level_3";
  else if (totalGap > 10 || input.emergency_type === "key_person_absence") emergencyLevel = "level_2";

  const totalAvailable = input.available_resources.on_call_staff +
    input.available_resources.cross_trained_staff;

  const feasibility = totalAvailable >= totalGap ? "high" : totalAvailable >= totalGap * 0.7 ? "medium" : "low";

  // 자원 활성화 계획
  let remainingGap = totalGap;
  const onCallActivated = Math.min(input.available_resources.on_call_staff, remainingGap);
  remainingGap -= onCallActivated;

  const crossTrainedDeployed = Math.min(input.available_resources.cross_trained_staff, remainingGap);
  remainingGap -= crossTrainedDeployed;

  const agencyRequested = input.available_resources.agency_contact_available ? remainingGap : 0;

  const immediateActions = [
    {
      priority: 1,
      action: "대기 인력 전원 연락 및 출동 요청",
      responsible: "HR 담당",
      timeline: "즉시",
      expected_result: `${onCallActivated}명 확보 예상`,
    },
    {
      priority: 2,
      action: "교차 훈련 인력 긴급 배치",
      responsible: "부서 매니저",
      timeline: "10분 이내",
      expected_result: `${crossTrainedDeployed}명 재배치`,
    },
  ];

  if (agencyRequested > 0) {
    immediateActions.push({
      priority: 3,
      action: "인력 파견업체 긴급 요청",
      responsible: "HR 담당",
      timeline: "15분 이내",
      expected_result: `${agencyRequested}명 요청 (도착까지 2-4시간)`,
    });
  }

  immediateActions.push({
    priority: 4,
    action: "비핵심 구역 인력 재배치",
    responsible: "운영 총괄",
    timeline: "20분 이내",
    expected_result: "핵심 구역 우선 커버",
  });

  immediateActions.push({
    priority: 5,
    action: "상황 보고 및 기대 조정",
    responsible: "운영 총괄",
    timeline: "30분 이내",
    expected_result: "의사결정권자 상황 공유",
  });

  return {
    event_id: input.event_id,
    situation_assessment: {
      emergency_level: emergencyLevel,
      total_gap: totalGap,
      time_available: input.time_constraint,
      feasibility,
    },
    immediate_actions: immediateActions,
    resource_activation: {
      on_call_activated: onCallActivated,
      cross_trained_deployed: crossTrainedDeployed,
      agency_requested: agencyRequested,
      internal_reallocation: Math.min(5, Math.ceil(totalGap * 0.1)),
    },
    contingency_measures: [
      {
        measure: "서비스 범위 축소",
        applies_when: "인력 확보율 70% 미만",
        impact: "비핵심 서비스 일시 중단",
      },
      {
        measure: "운영 시간 조정",
        applies_when: "인력 확보율 50% 미만",
        impact: "오픈 시간 지연 또는 조기 종료",
      },
      {
        measure: "관리자 현장 투입",
        applies_when: "핵심 구역 인력 부족 지속",
        impact: "매니저급 직접 업무 수행",
      },
      {
        measure: "참가자 동선 조정",
        applies_when: "특정 구역 인력 확보 불가",
        impact: "해당 구역 우회 안내",
      },
    ],
    communication_script: {
      to_on_call_staff: `긴급 출동 요청입니다. ${input.time_constraint} 이내 현장 도착 가능하신가요? 즉시 회신 부탁드립니다. 출동 시 일당 외 긴급 수당 지급됩니다.`,
      to_agency: `긴급 인력 요청: ${input.affected_positions.map((p) => `${p.role} ${p.count_needed}명`).join(", ")}. 가능한 빨리 파견 부탁드립니다.`,
      to_management: `[비상 상황 보고] ${input.emergency_type} 발생. 인력 갭 ${totalGap}명. 현재 대응 중이며, 예상 해소 시간 ${input.time_constraint}입니다.`,
      to_remaining_staff: `현재 일부 인력 부족 상황입니다. 팀워크로 함께 이겨내겠습니다. 추가 지원이 곧 도착합니다.`,
    },
    status_updates: [
      { time: "+15분", update_to: "운영 총괄", content: "대기 인력 연락 완료, 확정 인원 보고" },
      { time: "+30분", update_to: "전체 매니저", content: "인력 확보 현황 및 배치 계획" },
      { time: "+60분", update_to: "총괄 디렉터", content: "상황 해소 여부 및 추가 조치 필요 여부" },
    ],
  };
}

export const HR_027_EmergencyStaffing = {
  id: "HR-027",
  name: "Emergency Staffing Response",
  description: "비상 인력 대응",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.12",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_027_InputSchema,
  outputSchema: HR_027_OutputSchema,
  persona: `당신은 위기 대응 전문가입니다. 긴급 인력 상황에서 신속한 판단과 자원 동원으로 행사 운영을 정상화합니다.`,
};

export default HR_027_EmergencyStaffing;
