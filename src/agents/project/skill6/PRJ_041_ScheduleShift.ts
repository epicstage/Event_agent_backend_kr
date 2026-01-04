/**
 * PRJ-041: 일정 일괄 조정
 *
 * CMP-IS Reference: 6.1.c - Schedule adjustment and rescheduling
 * Task Type: AI
 *
 * 사용 예:
 * - "기획회의가 2일 뒤로 밀렸어. 전체 다 2일 미뤄줘"
 * - "D-Day가 앞당겨졌어. 모든 일정을 5일 당겨줘"
 * - "마일스톤 이후 일정만 3일 연기해줘"
 */

import { z } from "zod";

// =============================================================================
// AGENT PERSONA
// =============================================================================

export const AGENT_PERSONA = `You are an expert Schedule Adjustment Agent for event project management.

Your expertise includes:
- Bulk shifting all tasks by a specified number of days
- Adjusting schedules while preserving task dependencies
- Identifying schedule conflicts after adjustment
- Recommending mitigation for compressed timelines

CMP-IS Standard: 6.1.c - Schedule adjustment and rescheduling

You help event managers quickly reschedule when dates change, ensuring all dependent tasks move together correctly.`;

// =============================================================================
// INPUT/OUTPUT SCHEMAS
// =============================================================================

export const InputSchema = z.object({
  // 조정할 일수 (양수=연기, 음수=앞당김) - optional, 자연어에서 추출 가능
  shift_days: z.number().int().optional().describe("조정할 일수 (양수: 연기, 음수: 앞당김)"),

  // 선택: 기존 일정 데이터 (없으면 자연어에서 추출)
  event_id: z.string().optional().describe("이벤트 ID"),
  event_name: z.string().optional().describe("이벤트명"),

  // 기존 일정 (있으면 그대로 사용, 없으면 새로 생성)
  current_schedule: z.object({
    event_date: z.string().describe("이벤트 날짜 (ISO 8601)"),
    tasks: z.array(z.object({
      task_code: z.string(),
      task_name: z.string(),
      start_date: z.string(),
      end_date: z.string(),
      dependencies: z.array(z.string()).optional(),
    })).optional(),
    milestones: z.array(z.object({
      milestone_code: z.string(),
      name: z.string(),
      date: z.string(),
    })).optional(),
  }).optional().describe("현재 일정 데이터"),

  // 조정 범위 옵션
  scope: z.enum(["all", "after_milestone", "before_milestone", "selected"]).default("all")
    .describe("조정 범위: all=전체, after_milestone=특정 마일스톤 이후, selected=선택한 태스크만"),

  // scope가 after_milestone/before_milestone일 때 사용
  reference_milestone: z.string().optional().describe("기준 마일스톤 코드"),

  // scope가 selected일 때 사용
  selected_tasks: z.array(z.string()).optional().describe("조정할 태스크 코드 목록"),

  // 자연어 입력 (shift_days가 없을 때 파싱용)
  question: z.string().optional().describe("원본 자연어 질문"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  adjustment_id: z.string(),
  event_id: z.string(),

  // 조정 요약
  summary: z.object({
    shift_days: z.number(),
    direction: z.enum(["delayed", "advanced"]),
    scope: z.string(),
    tasks_affected: z.number(),
    milestones_affected: z.number(),
  }),

  // 조정된 이벤트 날짜
  event_date: z.object({
    original: z.string(),
    adjusted: z.string(),
  }),

  // 조정된 태스크 목록
  adjusted_tasks: z.array(z.object({
    task_code: z.string(),
    task_name: z.string(),
    original_start: z.string(),
    original_end: z.string(),
    adjusted_start: z.string(),
    adjusted_end: z.string(),
    shift_applied: z.number(),
  })),

  // 조정된 마일스톤
  adjusted_milestones: z.array(z.object({
    milestone_code: z.string(),
    name: z.string(),
    original_date: z.string(),
    adjusted_date: z.string(),
  })),

  // 충돌/경고
  warnings: z.array(z.object({
    type: z.enum(["date_conflict", "dependency_issue", "deadline_risk", "resource_conflict"]),
    message: z.string(),
    severity: z.enum(["low", "medium", "high"]),
    affected_tasks: z.array(z.string()),
  })),

  // 권장사항
  recommendations: z.array(z.string()),

  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

// =============================================================================
// HELPER FUNCTIONS
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

function parseShiftDaysFromText(text: string): number | null {
  // "2일 미뤄", "2일 연기", "2일 뒤로"
  const delayMatch = text.match(/(\d+)\s*일?\s*(미뤄|연기|뒤로|늦춰|밀어)/);
  if (delayMatch) {
    return parseInt(delayMatch[1], 10);
  }

  // "2일 앞당겨", "2일 당겨"
  const advanceMatch = text.match(/(\d+)\s*일?\s*(앞당|당겨|앞으로)/);
  if (advanceMatch) {
    return -parseInt(advanceMatch[1], 10);
  }

  return null;
}

// 기본 샘플 일정 생성 (실제로는 DB에서 가져와야 함)
function generateSampleSchedule(eventDate: string) {
  return {
    tasks: [
      { task_code: "P1-T01", task_name: "이벤트 목표 수립", start_date: addDays(eventDate, -90), end_date: addDays(eventDate, -83), dependencies: [] },
      { task_code: "P1-T02", task_name: "이해관계자 분석", start_date: addDays(eventDate, -85), end_date: addDays(eventDate, -76), dependencies: ["P1-T01"] },
      { task_code: "P1-T03", task_name: "예산 초안 작성", start_date: addDays(eventDate, -80), end_date: addDays(eventDate, -69), dependencies: ["P1-T01"] },
      { task_code: "P2-T01", task_name: "장소 확정", start_date: addDays(eventDate, -68), end_date: addDays(eventDate, -54), dependencies: ["P1-T03"] },
      { task_code: "P2-T02", task_name: "벤더 선정 및 계약", start_date: addDays(eventDate, -61), end_date: addDays(eventDate, -38), dependencies: ["P2-T01"] },
      { task_code: "P3-T01", task_name: "등록 시스템 오픈", start_date: addDays(eventDate, -37), end_date: addDays(eventDate, -30), dependencies: ["P2-T02"] },
      { task_code: "P3-T02", task_name: "홍보 캠페인 실행", start_date: addDays(eventDate, -30), end_date: addDays(eventDate, -14), dependencies: ["P3-T01"] },
      { task_code: "P4-T01", task_name: "현장 설치", start_date: addDays(eventDate, -3), end_date: addDays(eventDate, -1), dependencies: ["P3-T02"] },
      { task_code: "P4-T02", task_name: "리허설", start_date: addDays(eventDate, -1), end_date: addDays(eventDate, -1), dependencies: ["P4-T01"] },
      { task_code: "P4-T03", task_name: "이벤트 본 행사", start_date: eventDate, end_date: eventDate, dependencies: ["P4-T02"] },
    ],
    milestones: [
      { milestone_code: "MS-01", name: "기획 완료", date: addDays(eventDate, -68) },
      { milestone_code: "MS-02", name: "장소 및 벤더 확정", date: addDays(eventDate, -37) },
      { milestone_code: "MS-03", name: "등록 마감", date: addDays(eventDate, -14) },
      { milestone_code: "MS-04", name: "이벤트 D-Day", date: eventDate },
    ],
  };
}

// =============================================================================
// TASK LOGIC
// =============================================================================

export async function execute(input: Input): Promise<Output> {
  // 1. shift_days 결정 (직접 입력 또는 자연어 파싱)
  let shiftDays = input.shift_days;

  if ((shiftDays === undefined || shiftDays === 0) && input.question) {
    const parsed = parseShiftDaysFromText(input.question);
    if (parsed !== null) {
      shiftDays = parsed;
    }
  }

  if (shiftDays === undefined || shiftDays === 0) {
    throw new Error("조정할 일수를 지정해주세요. 예: '2일 미뤄줘' 또는 shift_days: 2");
  }

  // 2. 현재 일정 가져오기 (없으면 샘플 생성)
  const eventId = input.event_id || generateUUID();
  const today = new Date().toISOString().split("T")[0];
  const defaultEventDate = addDays(today, 90);

  let currentSchedule = input.current_schedule;
  if (!currentSchedule) {
    currentSchedule = {
      event_date: defaultEventDate,
      ...generateSampleSchedule(defaultEventDate),
    };
  }

  const originalEventDate = currentSchedule.event_date;
  const tasks = currentSchedule.tasks || [];
  const milestones = currentSchedule.milestones || [];

  // 3. 조정 범위 결정
  let tasksToAdjust = tasks;
  let milestonesToAdjust = milestones;

  if (input.scope === "after_milestone" && input.reference_milestone) {
    const refMilestone = milestones.find(m => m.milestone_code === input.reference_milestone);
    if (refMilestone) {
      const refDate = new Date(refMilestone.date);
      tasksToAdjust = tasks.filter(t => new Date(t.start_date) >= refDate);
      milestonesToAdjust = milestones.filter(m => new Date(m.date) >= refDate);
    }
  } else if (input.scope === "before_milestone" && input.reference_milestone) {
    const refMilestone = milestones.find(m => m.milestone_code === input.reference_milestone);
    if (refMilestone) {
      const refDate = new Date(refMilestone.date);
      tasksToAdjust = tasks.filter(t => new Date(t.end_date) <= refDate);
      milestonesToAdjust = milestones.filter(m => new Date(m.date) <= refDate);
    }
  } else if (input.scope === "selected" && input.selected_tasks) {
    tasksToAdjust = tasks.filter(t => input.selected_tasks!.includes(t.task_code));
    // 선택된 태스크와 관련된 마일스톤만
    milestonesToAdjust = [];
  }

  // 4. 일정 조정 적용
  const adjustedTasks = tasksToAdjust.map(task => ({
    task_code: task.task_code,
    task_name: task.task_name,
    original_start: task.start_date,
    original_end: task.end_date,
    adjusted_start: addDays(task.start_date, shiftDays),
    adjusted_end: addDays(task.end_date, shiftDays),
    shift_applied: shiftDays,
  }));

  const adjustedMilestones = milestonesToAdjust.map(ms => ({
    milestone_code: ms.milestone_code,
    name: ms.name,
    original_date: ms.date,
    adjusted_date: addDays(ms.date, shiftDays),
  }));

  // 5. 이벤트 날짜 조정 (전체 범위일 때만)
  const adjustedEventDate = input.scope === "all"
    ? addDays(originalEventDate, shiftDays)
    : originalEventDate;

  // 6. 경고 및 충돌 체크
  const warnings: Output["warnings"] = [];

  // 과거 날짜 체크
  const todayDate = new Date(today);
  for (const task of adjustedTasks) {
    if (new Date(task.adjusted_start) < todayDate) {
      warnings.push({
        type: "date_conflict",
        message: `${task.task_name}의 시작일이 과거입니다 (${task.adjusted_start})`,
        severity: "high",
        affected_tasks: [task.task_code],
      });
    }
  }

  // 일정 압박 체크 (D-Day까지 14일 미만)
  const daysUntilEvent = Math.ceil((new Date(adjustedEventDate).getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilEvent < 14 && shiftDays > 0) {
    warnings.push({
      type: "deadline_risk",
      message: `이벤트까지 ${daysUntilEvent}일 남았습니다. 일정이 매우 촉박합니다.`,
      severity: "high",
      affected_tasks: adjustedTasks.map(t => t.task_code),
    });
  } else if (daysUntilEvent < 30 && shiftDays > 0) {
    warnings.push({
      type: "deadline_risk",
      message: `이벤트까지 ${daysUntilEvent}일 남았습니다. 일정 관리에 주의가 필요합니다.`,
      severity: "medium",
      affected_tasks: [],
    });
  }

  // 7. 권장사항 생성
  const recommendations: string[] = [];

  if (shiftDays > 0) {
    recommendations.push(`모든 관련 벤더/파트너에게 ${shiftDays}일 연기를 통보하세요.`);
    recommendations.push("변경된 일정을 이해관계자에게 공유하세요.");
  } else {
    recommendations.push(`일정이 ${Math.abs(shiftDays)}일 앞당겨졌습니다. 리소스 가용성을 즉시 확인하세요.`);
    recommendations.push("압축된 일정에 맞춰 우선순위를 재조정하세요.");
  }

  if (warnings.length > 0) {
    recommendations.push("경고 사항을 검토하고 필요한 조치를 취하세요.");
  }

  recommendations.push("변경 이력을 프로젝트 문서에 기록하세요.");

  return {
    adjustment_id: generateUUID(),
    event_id: eventId,
    summary: {
      shift_days: shiftDays,
      direction: shiftDays > 0 ? "delayed" : "advanced",
      scope: input.scope,
      tasks_affected: adjustedTasks.length,
      milestones_affected: adjustedMilestones.length,
    },
    event_date: {
      original: originalEventDate,
      adjusted: adjustedEventDate,
    },
    adjusted_tasks: adjustedTasks,
    adjusted_milestones: adjustedMilestones,
    warnings,
    recommendations,
    created_at: new Date().toISOString(),
  };
}

// =============================================================================
// AGENT METADATA
// =============================================================================

export const AGENT_METADATA = {
  taskId: "PRJ-041",
  taskName: "일정 일괄 조정",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.1.c",
  skill: "Skill 6: Manage Project",
  subSkill: "6.1: Monitor and Control Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
