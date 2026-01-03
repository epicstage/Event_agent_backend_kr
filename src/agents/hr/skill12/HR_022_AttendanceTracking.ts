/**
 * HR-022: Attendance Tracking
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 출퇴근 및 근태 관리
 */

import { z } from "zod";

export const HR_022_InputSchema = z.object({
  event_id: z.string().uuid(),
  event_date: z.string(),
  staff_count: z.number(),
  check_in_records: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    scheduled_start: z.string(),
    actual_check_in: z.string().optional(),
    scheduled_end: z.string(),
    actual_check_out: z.string().optional(),
  })),
});

export const HR_022_OutputSchema = z.object({
  event_id: z.string(),
  attendance_summary: z.object({
    date: z.string(),
    total_expected: z.number(),
    checked_in: z.number(),
    on_time: z.number(),
    late: z.number(),
    no_show: z.number(),
    early_departure: z.number(),
    attendance_rate: z.number(),
    punctuality_rate: z.number(),
  }),
  detailed_records: z.array(z.object({
    staff_id: z.string(),
    name: z.string(),
    status: z.enum(["on_time", "late", "early_departure", "no_show", "present"]),
    scheduled_hours: z.number(),
    actual_hours: z.number(),
    variance_minutes: z.number(),
    notes: z.string(),
  })),
  alerts: z.array(z.object({
    type: z.enum(["no_show", "late", "early_departure", "overtime"]),
    staff_name: z.string(),
    details: z.string(),
    action_required: z.string(),
  })),
  payroll_data: z.object({
    total_scheduled_hours: z.number(),
    total_actual_hours: z.number(),
    overtime_hours: z.number(),
    adjustment_notes: z.array(z.string()),
  }),
});

export type HR_022_Input = z.infer<typeof HR_022_InputSchema>;
export type HR_022_Output = z.infer<typeof HR_022_OutputSchema>;

export async function execute(input: HR_022_Input): Promise<HR_022_Output> {
  const detailedRecords = input.check_in_records.map((record) => {
    const scheduledStart = parseTime(record.scheduled_start);
    const scheduledEnd = parseTime(record.scheduled_end);
    const scheduledHours = (scheduledEnd - scheduledStart) / 60;

    let status: "on_time" | "late" | "early_departure" | "no_show" | "present" = "no_show";
    let actualHours = 0;
    let varianceMinutes = 0;
    let notes = "";

    if (record.actual_check_in) {
      const checkIn = parseTime(record.actual_check_in);
      const checkOut = record.actual_check_out ? parseTime(record.actual_check_out) : scheduledEnd;
      actualHours = (checkOut - checkIn) / 60;

      if (checkIn <= scheduledStart + 5) {
        status = "on_time";
        notes = "정상 출근";
      } else {
        status = "late";
        varianceMinutes = checkIn - scheduledStart;
        notes = `${varianceMinutes}분 지각`;
      }

      if (record.actual_check_out) {
        const earlyMinutes = scheduledEnd - checkOut;
        if (earlyMinutes > 10) {
          status = "early_departure";
          notes += ` / ${earlyMinutes}분 조퇴`;
        }
      }
    } else {
      notes = "무단 결근";
      varianceMinutes = scheduledHours * 60;
    }

    return {
      staff_id: record.staff_id,
      name: record.name,
      status,
      scheduled_hours: Math.round(scheduledHours * 10) / 10,
      actual_hours: Math.round(actualHours * 10) / 10,
      variance_minutes: varianceMinutes,
      notes,
    };
  });

  const onTime = detailedRecords.filter((r) => r.status === "on_time").length;
  const late = detailedRecords.filter((r) => r.status === "late").length;
  const noShow = detailedRecords.filter((r) => r.status === "no_show").length;
  const earlyDeparture = detailedRecords.filter((r) => r.status === "early_departure").length;
  const checkedIn = detailedRecords.filter((r) => r.status !== "no_show").length;

  const alerts = [];
  for (const record of detailedRecords) {
    if (record.status === "no_show") {
      alerts.push({
        type: "no_show" as const,
        staff_name: record.name,
        details: "출근 기록 없음",
        action_required: "즉시 연락 및 대체 인력 배치",
      });
    } else if (record.status === "late" && record.variance_minutes > 15) {
      alerts.push({
        type: "late" as const,
        staff_name: record.name,
        details: `${record.variance_minutes}분 지각`,
        action_required: "사유 확인 필요",
      });
    }
  }

  const totalScheduledHours = detailedRecords.reduce((sum, r) => sum + r.scheduled_hours, 0);
  const totalActualHours = detailedRecords.reduce((sum, r) => sum + r.actual_hours, 0);
  const overtimeHours = detailedRecords
    .filter((r) => r.actual_hours > r.scheduled_hours)
    .reduce((sum, r) => sum + (r.actual_hours - r.scheduled_hours), 0);

  return {
    event_id: input.event_id,
    attendance_summary: {
      date: input.event_date,
      total_expected: input.staff_count,
      checked_in: checkedIn,
      on_time: onTime,
      late,
      no_show: noShow,
      early_departure: earlyDeparture,
      attendance_rate: Math.round((checkedIn / input.staff_count) * 100),
      punctuality_rate: Math.round((onTime / checkedIn) * 100) || 0,
    },
    detailed_records: detailedRecords,
    alerts,
    payroll_data: {
      total_scheduled_hours: Math.round(totalScheduledHours * 10) / 10,
      total_actual_hours: Math.round(totalActualHours * 10) / 10,
      overtime_hours: Math.round(overtimeHours * 10) / 10,
      adjustment_notes: [
        noShow > 0 ? `결근 ${noShow}명 급여 미지급` : "",
        late > 0 ? `지각 ${late}명 사유서 수집 필요` : "",
        overtimeHours > 0 ? `초과근무 ${Math.round(overtimeHours)}시간 수당 산정` : "",
      ].filter(Boolean),
    },
  };
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

export const HR_022_AttendanceTracking = {
  id: "HR-022",
  name: "Attendance Tracking",
  description: "출퇴근 및 근태 관리",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.7",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_022_InputSchema,
  outputSchema: HR_022_OutputSchema,
  persona: `당신은 근태 관리 담당자입니다. 정확한 출퇴근 기록과 근태 분석으로 공정한 급여 정산을 지원합니다.`,
};

export default HR_022_AttendanceTracking;
