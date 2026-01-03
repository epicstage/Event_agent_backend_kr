/**
 * HR-006: Shift Schedule Planning
 *
 * CMP-IS Domain F: Human Resources - Skill 11: HR Planning
 * 근무 시프트 계획 및 스케줄링
 */

import { z } from "zod";

export const HR_006_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_dates: z.array(z.string()),
  operating_hours: z.object({ start: z.string(), end: z.string() }),
  departments: z.array(z.object({
    name: z.string(),
    staff_count: z.number(),
    coverage_required: z.enum(["full", "peak_only", "custom"]),
  })),
  shift_preferences: z.object({
    max_shift_hours: z.number().default(8),
    min_break_hours: z.number().default(1),
    overlap_minutes: z.number().default(15),
  }).optional(),
});

export const HR_006_OutputSchema = z.object({
  event_id: z.string(),
  shift_plan: z.object({
    total_shifts: z.number(),
    total_person_hours: z.number(),
    shifts: z.array(z.object({
      shift_id: z.string(),
      department: z.string(),
      date: z.string(),
      start_time: z.string(),
      end_time: z.string(),
      duration_hours: z.number(),
      staff_required: z.number(),
      break_schedule: z.string(),
      notes: z.string(),
    })),
    coverage_summary: z.array(z.object({
      department: z.string(),
      coverage_percentage: z.number(),
      peak_coverage: z.number(),
      gap_periods: z.array(z.string()),
    })),
  }),
  staffing_requirements: z.object({
    minimum_unique_staff: z.number(),
    recommended_pool_size: z.number(),
    overtime_risk: z.enum(["low", "medium", "high"]),
  }),
  recommendations: z.array(z.string()),
});

export type HR_006_Input = z.infer<typeof HR_006_InputSchema>;
export type HR_006_Output = z.infer<typeof HR_006_OutputSchema>;

export async function execute(input: HR_006_Input): Promise<HR_006_Output> {
  const maxShift = input.shift_preferences?.max_shift_hours || 8;
  const overlap = input.shift_preferences?.overlap_minutes || 15;

  const opStart = parseInt(input.operating_hours.start.split(":")[0]);
  const opEnd = parseInt(input.operating_hours.end.split(":")[0]);
  const totalOpHours = opEnd > opStart ? opEnd - opStart : 24 - opStart + opEnd;

  const shiftsPerDay = Math.ceil(totalOpHours / maxShift);
  const shifts: Array<{
    shift_id: string;
    department: string;
    date: string;
    start_time: string;
    end_time: string;
    duration_hours: number;
    staff_required: number;
    break_schedule: string;
    notes: string;
  }> = [];

  let shiftCounter = 0;
  const coverageSummary: Array<{
    department: string;
    coverage_percentage: number;
    peak_coverage: number;
    gap_periods: string[];
  }> = [];

  input.departments.forEach((dept) => {
    const gapPeriods: string[] = [];

    input.event_dates.forEach((date) => {
      for (let i = 0; i < shiftsPerDay; i++) {
        shiftCounter++;
        const shiftStart = opStart + i * maxShift;
        const shiftEnd = Math.min(shiftStart + maxShift, opEnd);

        const startHour = shiftStart % 24;
        const endHour = shiftEnd % 24;

        shifts.push({
          shift_id: `SH-${shiftCounter.toString().padStart(4, "0")}`,
          department: dept.name,
          date,
          start_time: `${startHour.toString().padStart(2, "0")}:00`,
          end_time: `${endHour.toString().padStart(2, "0")}:${overlap.toString().padStart(2, "0")}`,
          duration_hours: maxShift + overlap / 60,
          staff_required: Math.ceil(dept.staff_count / shiftsPerDay),
          break_schedule: maxShift > 6 ? "4시간 근무 후 1시간 휴식" : "연속 근무",
          notes: i === 0 ? "오프닝 시프트 - 조기 출근" : i === shiftsPerDay - 1 ? "클로징 시프트 - 마감 정리" : "일반 시프트",
        });
      }
    });

    coverageSummary.push({
      department: dept.name,
      coverage_percentage: dept.coverage_required === "full" ? 100 : 80,
      peak_coverage: 100,
      gap_periods: gapPeriods,
    });
  });

  const totalPersonHours = shifts.reduce((sum, s) => sum + s.duration_hours * s.staff_required, 0);
  const uniqueStaff = Math.ceil(totalPersonHours / (maxShift * input.event_dates.length));

  return {
    event_id: input.event_id,
    shift_plan: {
      total_shifts: shifts.length,
      total_person_hours: Math.round(totalPersonHours),
      shifts,
      coverage_summary: coverageSummary,
    },
    staffing_requirements: {
      minimum_unique_staff: uniqueStaff,
      recommended_pool_size: Math.ceil(uniqueStaff * 1.2),
      overtime_risk: totalPersonHours / uniqueStaff > maxShift * input.event_dates.length ? "high" : "low",
    },
    recommendations: [
      "시프트 시작 15분 전 출근 권장",
      "시프트 교대 시 인수인계 브리핑 필수",
      "연속 2일 이상 근무 시 휴식일 배정",
      "피크 시간대 추가 인력 대기",
    ],
  };
}

export const HR_006_ShiftPlanning = {
  id: "HR-006",
  name: "Shift Schedule Planning",
  description: "근무 시프트 계획 및 스케줄링",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 11.6",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_006_InputSchema,
  outputSchema: HR_006_OutputSchema,
  persona: `당신은 스케줄링 전문가입니다. 효율적인 인력 배치와 근로기준법 준수를 동시에 추구합니다.`,
};

export default HR_006_ShiftPlanning;
