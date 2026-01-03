/**
 * HR-021: Shift Assignment
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 시프트 배정 및 스케줄 관리
 */

import { z } from "zod";

export const HR_021_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_date: z.string(),
  shifts: z.array(z.object({
    shift_id: z.string(),
    department: z.string(),
    start_time: z.string(),
    end_time: z.string(),
    required_count: z.number(),
  })),
  available_staff: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    department: z.string(),
    skills: z.array(z.string()),
    preferences: z.object({
      preferred_shift: z.string().optional(),
      max_hours: z.number().optional(),
    }).optional(),
  })),
});

export const HR_021_OutputSchema = z.object({
  event_id: z.string(),
  assignment_summary: z.object({
    total_shifts: z.number(),
    total_positions: z.number(),
    assigned: z.number(),
    unassigned: z.number(),
    coverage_rate: z.number(),
  }),
  shift_assignments: z.array(z.object({
    shift_id: z.string(),
    department: z.string(),
    time: z.string(),
    required: z.number(),
    assigned: z.number(),
    staff_list: z.array(z.object({
      staff_id: z.string(),
      name: z.string(),
      role: z.string(),
    })),
    status: z.enum(["fully_staffed", "understaffed", "overstaffed"]),
  })),
  staff_schedules: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    assignments: z.array(z.object({
      shift_id: z.string(),
      time: z.string(),
      department: z.string(),
    })),
    total_hours: z.number(),
  })),
  conflicts: z.array(z.object({
    type: z.string(),
    description: z.string(),
    affected_staff: z.array(z.string()),
    resolution: z.string(),
  })),
  recommendations: z.array(z.string()),
});

export type HR_021_Input = z.infer<typeof HR_021_InputSchema>;
export type HR_021_Output = z.infer<typeof HR_021_OutputSchema>;

export async function execute(input: HR_021_Input): Promise<HR_021_Output> {
  const totalPositions = input.shifts.reduce((sum, s) => sum + s.required_count, 0);

  // 시프트별 배정
  const shiftAssignments = input.shifts.map((shift) => {
    const deptStaff = input.available_staff.filter((s) => s.department === shift.department);
    const assignedCount = Math.min(shift.required_count, deptStaff.length);
    const assignedStaff = deptStaff.slice(0, assignedCount);

    return {
      shift_id: shift.shift_id,
      department: shift.department,
      time: `${shift.start_time} - ${shift.end_time}`,
      required: shift.required_count,
      assigned: assignedCount,
      staff_list: assignedStaff.map((s) => ({
        staff_id: s.staff_id,
        name: s.name,
        role: "스태프",
      })),
      status: assignedCount >= shift.required_count
        ? "fully_staffed" as const
        : assignedCount > shift.required_count
          ? "overstaffed" as const
          : "understaffed" as const,
    };
  });

  const totalAssigned = shiftAssignments.reduce((sum, s) => sum + s.assigned, 0);

  // 스태프별 스케줄
  const staffSchedules = input.available_staff.map((staff) => {
    const assignments = shiftAssignments
      .filter((sa) => sa.staff_list.some((s) => s.staff_id === staff.staff_id))
      .map((sa) => {
        const shift = input.shifts.find((s) => s.shift_id === sa.shift_id)!;
        return {
          shift_id: sa.shift_id,
          time: sa.time,
          department: sa.department,
        };
      });

    const totalHours = assignments.reduce((sum, a) => {
      const shift = input.shifts.find((s) => s.shift_id === a.shift_id)!;
      const start = parseInt(shift.start_time.split(":")[0]);
      const end = parseInt(shift.end_time.split(":")[0]);
      return sum + (end - start);
    }, 0);

    return {
      staff_id: staff.staff_id,
      name: staff.name,
      assignments,
      total_hours: totalHours,
    };
  }).filter((s) => s.assignments.length > 0);

  // 충돌 감지
  const conflicts = [];
  const understaffedShifts = shiftAssignments.filter((s) => s.status === "understaffed");
  if (understaffedShifts.length > 0) {
    conflicts.push({
      type: "인력 부족",
      description: `${understaffedShifts.length}개 시프트 인력 부족`,
      affected_staff: [],
      resolution: "대기 인력 투입 또는 교차 배치 검토",
    });
  }

  const overworked = staffSchedules.filter((s) => s.total_hours > 10);
  if (overworked.length > 0) {
    conflicts.push({
      type: "과로 위험",
      description: `${overworked.length}명 일일 10시간 초과 근무`,
      affected_staff: overworked.map((s) => s.name),
      resolution: "근무시간 조정 또는 교대 인력 배치",
    });
  }

  return {
    event_id: input.event_id,
    assignment_summary: {
      total_shifts: input.shifts.length,
      total_positions: totalPositions,
      assigned: totalAssigned,
      unassigned: totalPositions - totalAssigned,
      coverage_rate: Math.round((totalAssigned / totalPositions) * 100),
    },
    shift_assignments: shiftAssignments,
    staff_schedules: staffSchedules,
    conflicts,
    recommendations: [
      understaffedShifts.length > 0 ? `${understaffedShifts.map((s) => s.department).join(", ")} 부서 추가 인력 필요` : "모든 시프트 인력 충족",
      "시프트 시작 30분 전 체크인 요청",
      "휴식 시간 및 교대 시간 명확히 공지",
      "비상 연락망 확인 완료 필요",
    ],
  };
}

export const HR_021_ShiftAssignment = {
  id: "HR-021",
  name: "Shift Assignment",
  description: "시프트 배정 및 스케줄 관리",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.6",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_021_InputSchema,
  outputSchema: HR_021_OutputSchema,
  persona: `당신은 시프트 스케줄러입니다. 효율적인 인력 배치로 모든 시프트를 충족하고 스태프 만족도를 높입니다.`,
};

export default HR_021_ShiftAssignment;
