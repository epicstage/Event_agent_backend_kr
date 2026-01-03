/**
 * PRJ-001: 프로젝트 일정 수립
 *
 * CMP-IS Reference: 5.1.a - Developing the project schedule
 * Task Type: AI
 *
 * Input: 이벤트 정보, 마일스톤, 제약 조건
 * Output: 전체 프로젝트 일정표 (간트 차트 데이터)
 */

import { z } from "zod";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an expert Project Scheduling Agent specializing in event project management.

Your expertise includes:
- Creating comprehensive project schedules with dependencies
- Identifying critical path and buffer requirements
- Optimizing resource allocation across timeline
- Balancing parallel vs sequential task execution

CMP-IS Standard: 5.1.a - Developing the project schedule

You create realistic, achievable schedules that account for event-specific constraints like venue availability, vendor lead times, and stakeholder review cycles.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  event_id: z.string().describe("이벤트 ID"),
  event_name: z.string().describe("이벤트명"),
  event_date: z.string().describe("이벤트 날짜 (ISO 8601)"),
  planning_start_date: z.string().optional().describe("기획 시작일"),
  milestones: z.array(z.object({
    name: z.string(),
    target_date: z.string().optional(),
    is_fixed: z.boolean().default(false),
    dependencies: z.array(z.string()).optional(),
  })).optional().describe("주요 마일스톤"),
  constraints: z.object({
    venue_booking_deadline: z.string().optional(),
    vendor_lead_time_days: z.number().default(30),
    approval_buffer_days: z.number().default(7),
    marketing_lead_time_days: z.number().default(60),
  }).optional().describe("제약 조건"),
  event_type: z.enum(["conference", "exhibition", "seminar", "gala", "hybrid", "virtual", "other"]).default("conference"),
  expected_attendees: z.number().int().min(1).describe("예상 참석자 수"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  schedule_id: z.string().describe("일정 ID"),
  event_id: z.string().describe("이벤트 ID"),
  total_duration_days: z.number().describe("총 소요 기간 (일)"),
  phases: z.array(z.object({
    phase_name: z.string(),
    phase_code: z.string(),
    start_date: z.string(),
    end_date: z.string(),
    duration_days: z.number(),
    tasks: z.array(z.object({
      task_code: z.string(),
      task_name: z.string(),
      start_date: z.string(),
      end_date: z.string(),
      duration_days: z.number(),
      dependencies: z.array(z.string()),
      is_critical_path: z.boolean(),
      assigned_team: z.string().optional(),
    })),
  })).describe("단계별 일정"),
  critical_path: z.array(z.string()).describe("크리티컬 패스 태스크 코드"),
  milestones: z.array(z.object({
    milestone_code: z.string(),
    name: z.string(),
    date: z.string(),
    phase: z.string(),
  })).describe("주요 마일스톤"),
  buffer_analysis: z.object({
    total_buffer_days: z.number(),
    risk_level: z.enum(["low", "medium", "high"]),
    recommendations: z.array(z.string()),
  }).describe("버퍼 분석"),
  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// TASK LOGIC
// =============================================================================

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function daysBetween(startStr: string, endStr: string): number {
  const start = new Date(startStr);
  const end = new Date(endStr);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * 이벤트 규모에 따른 기본 리드 타임
 */
function getLeadTimeDays(attendees: number, eventType: string): number {
  let baseDays = 90;

  if (attendees < 100) baseDays = 60;
  else if (attendees < 500) baseDays = 90;
  else if (attendees < 1000) baseDays = 120;
  else if (attendees < 5000) baseDays = 180;
  else baseDays = 270;

  // 이벤트 타입별 조정
  if (eventType === "exhibition") baseDays *= 1.3;
  if (eventType === "gala") baseDays *= 1.2;
  if (eventType === "virtual") baseDays *= 0.7;

  return Math.round(baseDays);
}

/**
 * PRJ-001 메인 실행 함수
 */
export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);

  const eventDate = validatedInput.event_date;
  const leadTimeDays = getLeadTimeDays(validatedInput.expected_attendees, validatedInput.event_type);
  const planningStart = validatedInput.planning_start_date || addDays(eventDate, -leadTimeDays);
  const totalDuration = daysBetween(planningStart, eventDate);

  const constraints = validatedInput.constraints || {
    vendor_lead_time_days: 30,
    approval_buffer_days: 7,
    marketing_lead_time_days: 60,
  };
  const vendorLeadTime = constraints.vendor_lead_time_days ?? 30;
  const approvalBuffer = constraints.approval_buffer_days ?? 7;
  const marketingLeadTime = constraints.marketing_lead_time_days ?? 60;

  // 단계별 일정 생성
  const phases: Output["phases"] = [];
  const criticalPath: string[] = [];
  const milestones: Output["milestones"] = [];

  // Phase 1: 기획 (Planning)
  const phase1End = addDays(planningStart, Math.round(totalDuration * 0.25));
  phases.push({
    phase_name: "기획 단계",
    phase_code: "P1-PLAN",
    start_date: planningStart,
    end_date: phase1End,
    duration_days: daysBetween(planningStart, phase1End),
    tasks: [
      {
        task_code: "P1-T01",
        task_name: "이벤트 목표 수립",
        start_date: planningStart,
        end_date: addDays(planningStart, 7),
        duration_days: 7,
        dependencies: [],
        is_critical_path: true,
        assigned_team: "Strategy",
      },
      {
        task_code: "P1-T02",
        task_name: "이해관계자 분석",
        start_date: addDays(planningStart, 5),
        end_date: addDays(planningStart, 14),
        duration_days: 9,
        dependencies: ["P1-T01"],
        is_critical_path: true,
        assigned_team: "Strategy",
      },
      {
        task_code: "P1-T03",
        task_name: "예산 초안 작성",
        start_date: addDays(planningStart, 10),
        end_date: addDays(planningStart, 21),
        duration_days: 11,
        dependencies: ["P1-T01"],
        is_critical_path: true,
        assigned_team: "Finance",
      },
    ],
  });
  criticalPath.push("P1-T01", "P1-T02", "P1-T03");
  milestones.push({
    milestone_code: "MS-01",
    name: "기획 완료",
    date: phase1End,
    phase: "P1-PLAN",
  });

  // Phase 2: 조달 (Procurement)
  const phase2Start = addDays(phase1End, 1);
  const phase2End = addDays(eventDate, -marketingLeadTime);
  phases.push({
    phase_name: "조달 단계",
    phase_code: "P2-PROC",
    start_date: phase2Start,
    end_date: phase2End,
    duration_days: daysBetween(phase2Start, phase2End),
    tasks: [
      {
        task_code: "P2-T01",
        task_name: "장소 확정",
        start_date: phase2Start,
        end_date: addDays(phase2Start, 14),
        duration_days: 14,
        dependencies: ["P1-T03"],
        is_critical_path: true,
        assigned_team: "Logistics",
      },
      {
        task_code: "P2-T02",
        task_name: "벤더 선정 및 계약",
        start_date: addDays(phase2Start, 7),
        end_date: addDays(phase2Start, vendorLeadTime),
        duration_days: vendorLeadTime - 7,
        dependencies: ["P2-T01"],
        is_critical_path: true,
        assigned_team: "Procurement",
      },
      {
        task_code: "P2-T03",
        task_name: "스폰서 유치",
        start_date: phase2Start,
        end_date: addDays(phase2Start, 30),
        duration_days: 30,
        dependencies: ["P1-T02"],
        is_critical_path: false,
        assigned_team: "Sales",
      },
    ],
  });
  criticalPath.push("P2-T01", "P2-T02");
  milestones.push({
    milestone_code: "MS-02",
    name: "장소 및 벤더 확정",
    date: phase2End,
    phase: "P2-PROC",
  });

  // Phase 3: 마케팅 (Marketing)
  const phase3Start = addDays(phase2End, 1);
  const phase3End = addDays(eventDate, -14);
  phases.push({
    phase_name: "마케팅 단계",
    phase_code: "P3-MKT",
    start_date: phase3Start,
    end_date: phase3End,
    duration_days: daysBetween(phase3Start, phase3End),
    tasks: [
      {
        task_code: "P3-T01",
        task_name: "등록 시스템 오픈",
        start_date: phase3Start,
        end_date: addDays(phase3Start, 7),
        duration_days: 7,
        dependencies: ["P2-T02"],
        is_critical_path: true,
        assigned_team: "Marketing",
      },
      {
        task_code: "P3-T02",
        task_name: "홍보 캠페인 실행",
        start_date: addDays(phase3Start, 7),
        end_date: phase3End,
        duration_days: daysBetween(addDays(phase3Start, 7), phase3End),
        dependencies: ["P3-T01"],
        is_critical_path: true,
        assigned_team: "Marketing",
      },
      {
        task_code: "P3-T03",
        task_name: "연사/출연자 확정",
        start_date: phase3Start,
        end_date: addDays(phase3Start, 21),
        duration_days: 21,
        dependencies: ["P2-T01"],
        is_critical_path: false,
        assigned_team: "Content",
      },
    ],
  });
  criticalPath.push("P3-T01", "P3-T02");
  milestones.push({
    milestone_code: "MS-03",
    name: "등록 마감",
    date: phase3End,
    phase: "P3-MKT",
  });

  // Phase 4: 실행 (Execution)
  const phase4Start = addDays(phase3End, 1);
  phases.push({
    phase_name: "실행 단계",
    phase_code: "P4-EXEC",
    start_date: phase4Start,
    end_date: eventDate,
    duration_days: daysBetween(phase4Start, eventDate),
    tasks: [
      {
        task_code: "P4-T01",
        task_name: "현장 설치",
        start_date: addDays(eventDate, -3),
        end_date: addDays(eventDate, -1),
        duration_days: 2,
        dependencies: ["P3-T02"],
        is_critical_path: true,
        assigned_team: "Operations",
      },
      {
        task_code: "P4-T02",
        task_name: "리허설",
        start_date: addDays(eventDate, -1),
        end_date: addDays(eventDate, -1),
        duration_days: 1,
        dependencies: ["P4-T01"],
        is_critical_path: true,
        assigned_team: "Operations",
      },
      {
        task_code: "P4-T03",
        task_name: "이벤트 본 행사",
        start_date: eventDate,
        end_date: eventDate,
        duration_days: 1,
        dependencies: ["P4-T02"],
        is_critical_path: true,
        assigned_team: "All",
      },
    ],
  });
  criticalPath.push("P4-T01", "P4-T02", "P4-T03");
  milestones.push({
    milestone_code: "MS-04",
    name: "이벤트 D-Day",
    date: eventDate,
    phase: "P4-EXEC",
  });

  // 버퍼 분석
  const bufferDays = Math.round(totalDuration * 0.1);
  let riskLevel: "low" | "medium" | "high" = "medium";
  const bufferRecommendations: string[] = [];

  if (totalDuration < 60) {
    riskLevel = "high";
    bufferRecommendations.push("준비 기간이 짧습니다. 병렬 작업과 빠른 의사결정이 필요합니다.");
  } else if (totalDuration > 150) {
    riskLevel = "low";
    bufferRecommendations.push("충분한 준비 기간입니다. 품질 관리에 집중하세요.");
  }

  if (validatedInput.expected_attendees > 1000) {
    bufferRecommendations.push("대규모 이벤트입니다. 각 단계별 추가 검토 시간을 확보하세요.");
  }

  bufferRecommendations.push(`크리티컬 패스 태스크 ${criticalPath.length}개를 우선 관리하세요.`);

  return {
    schedule_id: generateUUID(),
    event_id: validatedInput.event_id,
    total_duration_days: totalDuration,
    phases,
    critical_path: criticalPath,
    milestones,
    buffer_analysis: {
      total_buffer_days: bufferDays,
      risk_level: riskLevel,
      recommendations: bufferRecommendations,
    },
    created_at: new Date().toISOString(),
  };
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "PRJ-001",
  taskName: "프로젝트 일정 수립",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 5.1.a",
  skill: "Skill 5: Plan Project",
  subSkill: "5.1: Develop Project Plan",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
