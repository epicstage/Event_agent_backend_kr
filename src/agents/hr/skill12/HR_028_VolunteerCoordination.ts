/**
 * HR-028: Volunteer Coordination
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 봉사자 현장 코디네이션
 */

import { z } from "zod";

export const HR_028_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_date: z.string(),
  volunteers: z.array(z.object({
    volunteer_id: z.string(),
    name: z.string(),
    assigned_role: z.string(),
    assigned_area: z.string(),
    shift_time: z.string(),
    experience_level: z.enum(["first_time", "experienced", "veteran"]),
  })),
  coordinator_count: z.number(),
});

export const HR_028_OutputSchema = z.object({
  event_id: z.string(),
  coordination_plan: z.object({
    total_volunteers: z.number(),
    coordinator_ratio: z.string(),
    buddy_system: z.boolean(),
    check_in_location: z.string(),
  }),
  volunteer_groups: z.array(z.object({
    group_name: z.string(),
    coordinator: z.string(),
    area: z.string(),
    volunteers: z.array(z.object({
      name: z.string(),
      role: z.string(),
      experience: z.string(),
      buddy: z.string().optional(),
    })),
    special_instructions: z.array(z.string()),
  })),
  support_structure: z.object({
    check_in_process: z.array(z.string()),
    during_event_support: z.array(z.object({
      support_type: z.string(),
      location: z.string(),
      available_time: z.string(),
    })),
    welfare_provisions: z.array(z.object({
      item: z.string(),
      location: z.string(),
      timing: z.string(),
    })),
  }),
  engagement_activities: z.array(z.object({
    activity: z.string(),
    timing: z.string(),
    purpose: z.string(),
  })),
  recognition: z.object({
    during_event: z.array(z.string()),
    post_event: z.array(z.object({
      recognition: z.string(),
      timeline: z.string(),
    })),
  }),
  emergency_protocol: z.object({
    volunteer_emergency_contact: z.string(),
    escalation: z.array(z.string()),
  }),
});

export type HR_028_Input = z.infer<typeof HR_028_InputSchema>;
export type HR_028_Output = z.infer<typeof HR_028_OutputSchema>;

export async function execute(input: HR_028_Input): Promise<HR_028_Output> {
  const totalVolunteers = input.volunteers.length;
  const volunteersPerCoordinator = Math.ceil(totalVolunteers / input.coordinator_count);

  // 그룹 생성
  const areas = [...new Set(input.volunteers.map((v) => v.assigned_area))];
  const volunteerGroups = areas.map((area, idx) => {
    const areaVolunteers = input.volunteers.filter((v) => v.assigned_area === area);

    // 버디 매칭 (신입 + 경험자)
    const firstTimers = areaVolunteers.filter((v) => v.experience_level === "first_time");
    const experienced = areaVolunteers.filter((v) => v.experience_level !== "first_time");

    const volunteersWithBuddy = areaVolunteers.map((v, i) => {
      let buddy: string | undefined;
      if (v.experience_level === "first_time" && experienced.length > 0) {
        buddy = experienced[i % experienced.length]?.name;
      }
      return {
        name: v.name,
        role: v.assigned_role,
        experience: v.experience_level,
        buddy,
      };
    });

    return {
      group_name: `${area} 봉사팀`,
      coordinator: `코디네이터 ${idx + 1}`,
      area,
      volunteers: volunteersWithBuddy,
      special_instructions: [
        "휴식 시간 준수",
        "어려운 상황 발생 시 즉시 코디네이터에게 연락",
        "봉사자 간 서로 도움",
        "안전 최우선",
      ],
    };
  });

  return {
    event_id: input.event_id,
    coordination_plan: {
      total_volunteers: totalVolunteers,
      coordinator_ratio: `1:${volunteersPerCoordinator}`,
      buddy_system: true,
      check_in_location: "봉사자 전용 체크인 부스 (정문 옆)",
    },
    volunteer_groups: volunteerGroups,
    support_structure: {
      check_in_process: [
        "신분증 확인 및 출석 체크",
        "봉사자 배지 및 티셔츠 지급",
        "소속 그룹 및 코디네이터 안내",
        "비상연락망 카드 배포",
        "간단한 브리핑 (5분)",
      ],
      during_event_support: [
        { support_type: "문제 상담", location: "봉사자 본부", available_time: "행사 전 시간" },
        { support_type: "물품 보충", location: "봉사자 본부", available_time: "행사 전 시간" },
        { support_type: "응급 처치", location: "의무실", available_time: "행사 전 시간" },
        { support_type: "휴식 공간", location: "봉사자 라운지", available_time: "지정 휴식 시간" },
      ],
      welfare_provisions: [
        { item: "간식 및 음료", location: "봉사자 라운지", timing: "상시" },
        { item: "점심 도시락", location: "케이터링 구역", timing: "12:00-13:00" },
        { item: "충전기/보조배터리", location: "봉사자 본부", timing: "상시 대여" },
        { item: "우산/우비", location: "봉사자 본부", timing: "우천 시" },
      ],
    },
    engagement_activities: [
      { activity: "아침 아이스브레이킹", timing: "08:30", purpose: "분위기 형성 및 에너지 업" },
      { activity: "중간 격려 방송", timing: "14:00", purpose: "동기부여 및 진행 상황 공유" },
      { activity: "단체 사진 촬영", timing: "17:00", purpose: "추억 만들기" },
      { activity: "마무리 소감 나눔", timing: "종료 직전", purpose: "감사와 연결감" },
    ],
    recognition: {
      during_event: [
        "코디네이터의 현장 칭찬",
        "우수 봉사자 스팟 발표",
        "SNS 실시간 감사 포스팅",
      ],
      post_event: [
        { recognition: "감사 메시지 발송", timeline: "D+1" },
        { recognition: "봉사 시간 인증서 발급", timeline: "D+3" },
        { recognition: "사진 공유", timeline: "D+5" },
        { recognition: "우수 봉사자 개별 감사 연락", timeline: "D+7" },
        { recognition: "향후 행사 우선 초청", timeline: "다음 행사 시" },
      ],
    },
    emergency_protocol: {
      volunteer_emergency_contact: "봉사자 본부 (내선 999)",
      escalation: [
        "1차: 담당 코디네이터에게 보고",
        "2차: 봉사자 본부 연락",
        "3차: HR 매니저 직접 연락",
      ],
    },
  };
}

export const HR_028_VolunteerCoordination = {
  id: "HR-028",
  name: "Volunteer Coordination",
  description: "봉사자 현장 코디네이션",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.13",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_028_InputSchema,
  outputSchema: HR_028_OutputSchema,
  persona: `당신은 봉사자 코디네이터입니다. 봉사자들이 보람을 느끼고 긍정적인 경험을 할 수 있도록 지원합니다.`,
};

export default HR_028_VolunteerCoordination;
