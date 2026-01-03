/**
 * HR-023: Break Management
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 휴식 및 식사 시간 관리
 */

import { z } from "zod";

export const HR_023_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_date: z.string(),
  staff_count: z.number(),
  shift_duration_hours: z.number(),
  meal_service: z.object({
    provided: z.boolean(),
    meal_times: z.array(z.string()).optional(),
    location: z.string().optional(),
  }),
  break_areas: z.array(z.string()),
});

export const HR_023_OutputSchema = z.object({
  event_id: z.string(),
  break_policy: z.object({
    legal_requirements: z.array(z.object({
      condition: z.string(),
      requirement: z.string(),
      reference: z.string(),
    })),
    break_schedule: z.object({
      short_breaks: z.object({
        frequency: z.string(),
        duration_minutes: z.number(),
      }),
      meal_break: z.object({
        duration_minutes: z.number(),
        timing: z.string(),
        paid: z.boolean(),
      }),
    }),
  }),
  rotation_plan: z.array(z.object({
    group: z.string(),
    staff_count: z.number(),
    break_time: z.string(),
    meal_time: z.string(),
    return_time: z.string(),
  })),
  break_area_assignment: z.array(z.object({
    area: z.string(),
    capacity: z.number(),
    amenities: z.array(z.string()),
    assigned_groups: z.array(z.string()),
  })),
  meal_logistics: z.object({
    service_times: z.array(z.string()),
    estimated_headcount_per_slot: z.number(),
    dietary_accommodations: z.array(z.string()),
    queue_management: z.array(z.string()),
  }),
  monitoring: z.object({
    check_points: z.array(z.object({
      time: z.string(),
      action: z.string(),
      responsible: z.string(),
    })),
    escalation_triggers: z.array(z.string()),
  }),
});

export type HR_023_Input = z.infer<typeof HR_023_InputSchema>;
export type HR_023_Output = z.infer<typeof HR_023_OutputSchema>;

export async function execute(input: HR_023_Input): Promise<HR_023_Output> {
  const groupCount = Math.ceil(input.staff_count / 20);
  const staffPerGroup = Math.ceil(input.staff_count / groupCount);

  const rotationPlan = [];
  let baseBreakTime = 10 * 60; // 10:00 AM
  let baseMealTime = 12 * 60; // 12:00 PM

  for (let i = 0; i < groupCount; i++) {
    const breakHour = Math.floor(baseBreakTime / 60);
    const breakMin = baseBreakTime % 60;
    const mealHour = Math.floor(baseMealTime / 60);
    const mealMin = baseMealTime % 60;
    const returnHour = Math.floor((baseMealTime + 45) / 60);
    const returnMin = (baseMealTime + 45) % 60;

    rotationPlan.push({
      group: `${String.fromCharCode(65 + i)}조`,
      staff_count: staffPerGroup,
      break_time: `${breakHour.toString().padStart(2, "0")}:${breakMin.toString().padStart(2, "0")}`,
      meal_time: `${mealHour.toString().padStart(2, "0")}:${mealMin.toString().padStart(2, "0")}`,
      return_time: `${returnHour.toString().padStart(2, "0")}:${returnMin.toString().padStart(2, "0")}`,
    });

    baseBreakTime += 30;
    baseMealTime += 20;
  }

  const breakAreaAssignment = input.break_areas.map((area, idx) => ({
    area,
    capacity: Math.ceil(staffPerGroup * 1.2),
    amenities: ["의자/테이블", "음료수", "에어컨/난방", "휴대폰 충전"],
    assigned_groups: [rotationPlan[idx % groupCount]?.group || "전체"],
  }));

  return {
    event_id: input.event_id,
    break_policy: {
      legal_requirements: [
        {
          condition: "4시간 이상 근무",
          requirement: "30분 이상 휴게시간 부여",
          reference: "근로기준법 제54조",
        },
        {
          condition: "8시간 이상 근무",
          requirement: "1시간 이상 휴게시간 부여",
          reference: "근로기준법 제54조",
        },
        {
          condition: "휴게시간 사용",
          requirement: "근로자가 자유롭게 이용",
          reference: "근로기준법 제54조",
        },
      ],
      break_schedule: {
        short_breaks: {
          frequency: "2시간마다",
          duration_minutes: 10,
        },
        meal_break: {
          duration_minutes: input.shift_duration_hours >= 8 ? 60 : 30,
          timing: "근무 중간 시점",
          paid: false,
        },
      },
    },
    rotation_plan: rotationPlan,
    break_area_assignment: breakAreaAssignment,
    meal_logistics: {
      service_times: input.meal_service.meal_times || ["12:00", "12:30", "13:00"],
      estimated_headcount_per_slot: Math.ceil(input.staff_count / 3),
      dietary_accommodations: [
        "채식 옵션",
        "할랄 옵션",
        "알레르기 대응 (견과류, 해산물)",
        "무글루텐 옵션",
      ],
      queue_management: [
        "조별 입장 시간 지정",
        "줄서기 안내 스태프 배치",
        "식권 또는 QR 체크인",
        "테이크아웃 옵션 제공",
      ],
    },
    monitoring: {
      check_points: [
        { time: "휴식 시작 5분 전", action: "교대 인력 확인", responsible: "팀 리더" },
        { time: "휴식 시작", action: "휴식 인원 이동 확인", responsible: "팀 리더" },
        { time: "복귀 시간", action: "복귀 인원 체크", responsible: "팀 리더" },
        { time: "복귀 5분 후", action: "미복귀자 연락", responsible: "팀 리더" },
      ],
      escalation_triggers: [
        "휴식 복귀 10분 이상 지연",
        "휴식 공간 과밀",
        "식사 대기줄 30분 이상",
        "휴식 미부여 스태프 발생",
      ],
    },
  };
}

export const HR_023_BreakManagement = {
  id: "HR-023",
  name: "Break Management",
  description: "휴식 및 식사 시간 관리",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.8",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_023_InputSchema,
  outputSchema: HR_023_OutputSchema,
  persona: `당신은 복지 관리 담당자입니다. 스태프의 휴식권을 보장하고 효율적인 교대 시스템을 운영합니다.`,
};

export default HR_023_BreakManagement;
