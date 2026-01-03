/**
 * PRJ-014: 진행 상황 추적
 *
 * CMP-IS Reference: 6.1.a - Tracking project progress
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Progress Tracking Agent for event projects.

Your expertise includes:
- Monitoring task completion status
- Tracking milestone achievements
- Analyzing schedule variance
- Identifying delays and bottlenecks

CMP-IS Standard: 6.1.a - Tracking project progress`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  event_date: z.string(),
  tasks: z.array(z.object({
    task_id: z.string(),
    task_name: z.string(),
    planned_start: z.string(),
    planned_end: z.string(),
    actual_start: z.string().optional(),
    actual_end: z.string().optional(),
    status: z.enum(["not_started", "in_progress", "completed", "blocked", "cancelled"]),
    completion_percentage: z.number().min(0).max(100),
    assigned_to: z.string().optional(),
  })),
  milestones: z.array(z.object({
    milestone_id: z.string(),
    name: z.string(),
    target_date: z.string(),
    actual_date: z.string().optional(),
    status: z.enum(["pending", "achieved", "missed", "at_risk"]),
  })).optional(),
  reporting_date: z.string().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  reporting_date: z.string(),
  overall_progress: z.object({
    total_tasks: z.number(),
    completed_tasks: z.number(),
    in_progress_tasks: z.number(),
    not_started_tasks: z.number(),
    blocked_tasks: z.number(),
    overall_completion_percentage: z.number(),
    health_status: z.enum(["on_track", "at_risk", "behind_schedule", "critical"]),
  }),
  schedule_analysis: z.object({
    days_to_event: z.number(),
    planned_completion_by_now: z.number(),
    actual_completion: z.number(),
    schedule_variance_percentage: z.number(),
    schedule_performance_index: z.number(),
  }),
  milestone_status: z.array(z.object({
    milestone_id: z.string(),
    name: z.string(),
    target_date: z.string(),
    status: z.string(),
    variance_days: z.number(),
    impact: z.string(),
  })),
  task_details: z.object({
    on_track: z.array(z.object({
      task_id: z.string(),
      task_name: z.string(),
      completion: z.number(),
    })),
    delayed: z.array(z.object({
      task_id: z.string(),
      task_name: z.string(),
      delay_days: z.number(),
      reason: z.string(),
      impact: z.string(),
    })),
    blocked: z.array(z.object({
      task_id: z.string(),
      task_name: z.string(),
      blocker: z.string(),
      escalation_needed: z.boolean(),
    })),
  }),
  critical_issues: z.array(z.object({
    issue_id: z.string(),
    description: z.string(),
    severity: z.enum(["low", "medium", "high", "critical"]),
    affected_tasks: z.array(z.string()),
    recommended_action: z.string(),
  })),
  recommendations: z.array(z.string()),
  created_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const reportingDate = validatedInput.reporting_date || new Date().toISOString().split("T")[0];
  const tasks = validatedInput.tasks;

  // 전체 진행률 계산
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
  const notStartedTasks = tasks.filter(t => t.status === "not_started").length;
  const blockedTasks = tasks.filter(t => t.status === "blocked").length;

  const avgCompletion = tasks.reduce((sum, t) => sum + t.completion_percentage, 0) / totalTasks;

  // 일정 분석
  const daysToEvent = daysBetween(reportingDate, validatedInput.event_date);

  // 현재까지 완료되어야 할 태스크 비율 계산 (간단한 선형 모델)
  const projectDuration = Math.max(
    ...tasks.map(t => daysBetween(t.planned_start, validatedInput.event_date))
  );
  const elapsedDays = projectDuration - daysToEvent;
  const plannedCompletionByNow = Math.min(100, (elapsedDays / projectDuration) * 100);

  const scheduleVariance = avgCompletion - plannedCompletionByNow;
  const spi = plannedCompletionByNow > 0 ? avgCompletion / plannedCompletionByNow : 1;

  // 건강 상태 결정
  let healthStatus: "on_track" | "at_risk" | "behind_schedule" | "critical";
  if (spi >= 0.95 && blockedTasks === 0) {
    healthStatus = "on_track";
  } else if (spi >= 0.85 && blockedTasks <= 2) {
    healthStatus = "at_risk";
  } else if (spi >= 0.70) {
    healthStatus = "behind_schedule";
  } else {
    healthStatus = "critical";
  }

  const overallProgress: Output["overall_progress"] = {
    total_tasks: totalTasks,
    completed_tasks: completedTasks,
    in_progress_tasks: inProgressTasks,
    not_started_tasks: notStartedTasks,
    blocked_tasks: blockedTasks,
    overall_completion_percentage: Math.round(avgCompletion),
    health_status: healthStatus,
  };

  const scheduleAnalysis: Output["schedule_analysis"] = {
    days_to_event: daysToEvent,
    planned_completion_by_now: Math.round(plannedCompletionByNow),
    actual_completion: Math.round(avgCompletion),
    schedule_variance_percentage: Math.round(scheduleVariance),
    schedule_performance_index: Math.round(spi * 100) / 100,
  };

  // 마일스톤 상태
  const milestoneStatus: Output["milestone_status"] = (validatedInput.milestones || []).map(m => {
    const varianceDays = m.actual_date
      ? daysBetween(m.target_date, m.actual_date)
      : (m.status === "pending" ? daysBetween(reportingDate, m.target_date) : 0);

    let impact = "없음";
    if (m.status === "missed") {
      impact = "후속 작업 지연 가능";
    } else if (m.status === "at_risk") {
      impact = "일정 압박 증가";
    }

    return {
      milestone_id: m.milestone_id,
      name: m.name,
      target_date: m.target_date,
      status: m.status,
      variance_days: varianceDays,
      impact,
    };
  });

  // 태스크 상세 분류
  const onTrackTasks: Output["task_details"]["on_track"] = [];
  const delayedTasks: Output["task_details"]["delayed"] = [];
  const blockedTaskDetails: Output["task_details"]["blocked"] = [];

  for (const task of tasks) {
    const plannedEndDate = new Date(task.planned_end);
    const today = new Date(reportingDate);
    const taskStatus = task.status;

    if (taskStatus === "blocked") {
      blockedTaskDetails.push({
        task_id: task.task_id,
        task_name: task.task_name,
        blocker: "상세 분석 필요",
        escalation_needed: true,
      });
    } else if (taskStatus === "completed") {
      onTrackTasks.push({
        task_id: task.task_id,
        task_name: task.task_name,
        completion: 100,
      });
    } else if (plannedEndDate < today) {
      const delayDays = daysBetween(task.planned_end, reportingDate);
      delayedTasks.push({
        task_id: task.task_id,
        task_name: task.task_name,
        delay_days: delayDays,
        reason: "계획 종료일 초과",
        impact: delayDays > 7 ? "높음 - 후속 작업 영향" : "중간 - 모니터링 필요",
      });
    } else {
      onTrackTasks.push({
        task_id: task.task_id,
        task_name: task.task_name,
        completion: task.completion_percentage,
      });
    }
  }

  const taskDetails: Output["task_details"] = {
    on_track: onTrackTasks,
    delayed: delayedTasks,
    blocked: blockedTaskDetails,
  };

  // 주요 이슈 식별
  const criticalIssues: Output["critical_issues"] = [];

  if (blockedTasks > 0) {
    criticalIssues.push({
      issue_id: `ISS-${criticalIssues.length + 1}`,
      description: `${blockedTasks}개 태스크가 블로킹 상태`,
      severity: blockedTasks > 2 ? "critical" : "high",
      affected_tasks: tasks.filter(t => t.status === "blocked").map(t => t.task_id),
      recommended_action: "즉시 블로커 원인 파악 및 해결 방안 마련",
    });
  }

  if (delayedTasks.length > 3) {
    criticalIssues.push({
      issue_id: `ISS-${criticalIssues.length + 1}`,
      description: `${delayedTasks.length}개 태스크 지연 발생`,
      severity: delayedTasks.length > 5 ? "high" : "medium",
      affected_tasks: delayedTasks.map(t => t.task_id),
      recommended_action: "일정 재조정 또는 리소스 추가 투입 검토",
    });
  }

  if (daysToEvent < 14 && avgCompletion < 80) {
    criticalIssues.push({
      issue_id: `ISS-${criticalIssues.length + 1}`,
      description: "D-Day 임박, 준비 완료율 부족",
      severity: "critical",
      affected_tasks: tasks.filter(t => t.status !== "completed").map(t => t.task_id),
      recommended_action: "비상 대응 체제 가동, 범위 축소 또는 추가 리소스 투입",
    });
  }

  // 권장사항
  const recommendations: string[] = [];

  recommendations.push(`현재 프로젝트 상태: ${healthStatus === "on_track" ? "정상" :
    healthStatus === "at_risk" ? "주의 필요" :
    healthStatus === "behind_schedule" ? "일정 지연" : "긴급 조치 필요"}`);

  if (spi < 1) {
    recommendations.push(`SPI ${spi.toFixed(2)} - 일정 만회 방안 필요`);
  }

  if (blockedTasks > 0) {
    recommendations.push(`블로킹 태스크 ${blockedTasks}개 즉시 해결 필요`);
  }

  if (daysToEvent <= 7) {
    recommendations.push("D-Day 임박 - 일일 진행 상황 점검 권장");
  } else if (daysToEvent <= 30) {
    recommendations.push("마무리 단계 - 주 2회 이상 진행 점검 권장");
  }

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    reporting_date: reportingDate,
    overall_progress: overallProgress,
    schedule_analysis: scheduleAnalysis,
    milestone_status: milestoneStatus,
    task_details: taskDetails,
    critical_issues: criticalIssues,
    recommendations,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-014",
  taskName: "진행 상황 추적",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.1.a",
  skill: "Skill 6: Manage Project",
  subSkill: "6.1: Monitor and Control Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
