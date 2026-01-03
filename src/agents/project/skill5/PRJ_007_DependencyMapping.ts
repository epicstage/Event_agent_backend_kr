/**
 * PRJ-007: 의존성 매핑
 *
 * CMP-IS Reference: 5.1.e - Mapping task dependencies
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Dependency Mapping Agent for event project management.

Your expertise includes:
- Identifying task relationships and dependencies
- Detecting dependency conflicts and circular references
- Optimizing task sequencing for parallel execution
- Calculating critical path based on dependencies

CMP-IS Standard: 5.1.e - Mapping task dependencies`;

export const InputSchema = z.object({
  event_id: z.string(),
  tasks: z.array(z.object({
    task_code: z.string(),
    task_name: z.string(),
    duration_days: z.number(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    predecessors: z.array(z.string()).optional(),
    category: z.string().optional(),
  })).min(1),
  analyze_critical_path: z.boolean().default(true),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  mapping_id: z.string(),
  event_id: z.string(),
  dependency_matrix: z.array(z.object({
    task_code: z.string(),
    task_name: z.string(),
    predecessors: z.array(z.object({
      task_code: z.string(),
      dependency_type: z.enum(["FS", "SS", "FF", "SF"]),
      lag_days: z.number(),
    })),
    successors: z.array(z.string()),
    earliest_start: z.string(),
    latest_start: z.string(),
    earliest_finish: z.string(),
    latest_finish: z.string(),
    float_days: z.number(),
    is_critical: z.boolean(),
  })),
  critical_path: z.object({
    tasks: z.array(z.string()),
    total_duration: z.number(),
    bottlenecks: z.array(z.object({
      task_code: z.string(),
      reason: z.string(),
    })),
  }),
  parallel_opportunities: z.array(z.object({
    task_group: z.array(z.string()),
    can_start_after: z.string(),
    time_savings_days: z.number(),
  })),
  issues_detected: z.array(z.object({
    issue_type: z.enum(["circular", "missing_predecessor", "orphan", "overlap"]),
    description: z.string(),
    affected_tasks: z.array(z.string()),
    severity: z.enum(["low", "medium", "high"]),
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

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const tasks = validatedInput.tasks;

  // 태스크 맵 생성
  const taskMap = new Map(tasks.map(t => [t.task_code, t]));

  // 후속 태스크 계산
  const successorsMap = new Map<string, string[]>();
  for (const task of tasks) {
    successorsMap.set(task.task_code, []);
  }

  for (const task of tasks) {
    for (const pred of task.predecessors || []) {
      const successors = successorsMap.get(pred) || [];
      successors.push(task.task_code);
      successorsMap.set(pred, successors);
    }
  }

  // Forward Pass (ES, EF 계산)
  const esMap = new Map<string, number>();
  const efMap = new Map<string, number>();

  function calculateES(taskCode: string, visited = new Set<string>()): number {
    if (esMap.has(taskCode)) return esMap.get(taskCode)!;
    if (visited.has(taskCode)) return 0; // 순환 방지

    visited.add(taskCode);
    const task = taskMap.get(taskCode);
    if (!task) return 0;

    const preds = task.predecessors || [];
    if (preds.length === 0) {
      esMap.set(taskCode, 0);
      efMap.set(taskCode, task.duration_days);
      return 0;
    }

    let maxEF = 0;
    for (const pred of preds) {
      calculateES(pred, new Set(visited));
      maxEF = Math.max(maxEF, efMap.get(pred) || 0);
    }

    esMap.set(taskCode, maxEF);
    efMap.set(taskCode, maxEF + task.duration_days);
    return maxEF;
  }

  for (const task of tasks) {
    calculateES(task.task_code);
  }

  const projectDuration = Math.max(...Array.from(efMap.values()));

  // Backward Pass (LS, LF 계산)
  const lsMap = new Map<string, number>();
  const lfMap = new Map<string, number>();

  function calculateLF(taskCode: string, visited = new Set<string>()): number {
    if (lfMap.has(taskCode)) return lfMap.get(taskCode)!;
    if (visited.has(taskCode)) return projectDuration;

    visited.add(taskCode);
    const task = taskMap.get(taskCode);
    if (!task) return projectDuration;

    const succs = successorsMap.get(taskCode) || [];
    if (succs.length === 0) {
      lfMap.set(taskCode, projectDuration);
      lsMap.set(taskCode, projectDuration - task.duration_days);
      return projectDuration;
    }

    let minLS = projectDuration;
    for (const succ of succs) {
      calculateLF(succ, new Set(visited));
      minLS = Math.min(minLS, lsMap.get(succ) || projectDuration);
    }

    lfMap.set(taskCode, minLS);
    lsMap.set(taskCode, minLS - task.duration_days);
    return minLS;
  }

  for (const task of [...tasks].reverse()) {
    calculateLF(task.task_code);
  }

  // Float 및 크리티컬 패스 계산
  const today = new Date().toISOString().split("T")[0];
  const dependencyMatrix: Output["dependency_matrix"] = [];
  const criticalTasks: string[] = [];

  for (const task of tasks) {
    const es = esMap.get(task.task_code) || 0;
    const ef = efMap.get(task.task_code) || 0;
    const ls = lsMap.get(task.task_code) || 0;
    const lf = lfMap.get(task.task_code) || 0;
    const float = ls - es;
    const isCritical = float === 0;

    if (isCritical) criticalTasks.push(task.task_code);

    dependencyMatrix.push({
      task_code: task.task_code,
      task_name: task.task_name,
      predecessors: (task.predecessors || []).map(p => ({
        task_code: p,
        dependency_type: "FS" as const,
        lag_days: 0,
      })),
      successors: successorsMap.get(task.task_code) || [],
      earliest_start: addDays(today, es),
      latest_start: addDays(today, ls),
      earliest_finish: addDays(today, ef),
      latest_finish: addDays(today, lf),
      float_days: float,
      is_critical: isCritical,
    });
  }

  // 병렬 실행 기회 식별
  const parallelOpportunities: Output["parallel_opportunities"] = [];
  const tasksByPredecessor = new Map<string, string[]>();

  for (const task of tasks) {
    const predKey = (task.predecessors || []).sort().join(",") || "ROOT";
    const group = tasksByPredecessor.get(predKey) || [];
    group.push(task.task_code);
    tasksByPredecessor.set(predKey, group);
  }

  for (const [predKey, taskGroup] of tasksByPredecessor) {
    if (taskGroup.length > 1) {
      const canStartAfter = predKey === "ROOT" ? today : addDays(today, Math.max(...predKey.split(",").map(p => efMap.get(p) || 0)));
      parallelOpportunities.push({
        task_group: taskGroup,
        can_start_after: canStartAfter,
        time_savings_days: Math.max(...taskGroup.map(t => taskMap.get(t)?.duration_days || 0)) -
                          taskGroup.reduce((sum, t) => sum + (taskMap.get(t)?.duration_days || 0), 0) / taskGroup.length,
      });
    }
  }

  // 이슈 탐지
  const issuesDetected: Output["issues_detected"] = [];

  // 고아 태스크 (선행도 없고 후속도 없는)
  for (const task of tasks) {
    const hasPred = (task.predecessors || []).length > 0;
    const hasSucc = (successorsMap.get(task.task_code) || []).length > 0;
    if (!hasPred && !hasSucc && tasks.length > 1) {
      issuesDetected.push({
        issue_type: "orphan",
        description: `태스크 ${task.task_code}가 다른 태스크와 연결되지 않음`,
        affected_tasks: [task.task_code],
        severity: "medium",
      });
    }
  }

  // 누락된 선행 태스크
  for (const task of tasks) {
    for (const pred of task.predecessors || []) {
      if (!taskMap.has(pred)) {
        issuesDetected.push({
          issue_type: "missing_predecessor",
          description: `선행 태스크 ${pred}가 목록에 없음`,
          affected_tasks: [task.task_code],
          severity: "high",
        });
      }
    }
  }

  // 병목 분석
  const bottlenecks = criticalTasks
    .filter(t => (successorsMap.get(t) || []).length > 2)
    .map(t => ({
      task_code: t,
      reason: `${(successorsMap.get(t) || []).length}개 태스크가 이 태스크 완료를 대기 중`,
    }));

  const recommendations: string[] = [];
  recommendations.push(`프로젝트 총 소요 기간: ${projectDuration}일`);
  recommendations.push(`크리티컬 패스: ${criticalTasks.length}개 태스크`);

  if (parallelOpportunities.length > 0) {
    recommendations.push(`병렬 실행 가능한 태스크 그룹: ${parallelOpportunities.length}개`);
  }

  if (issuesDetected.length > 0) {
    recommendations.push(`의존성 이슈 ${issuesDetected.length}개 발견 - 검토 필요`);
  }

  return {
    mapping_id: generateUUID(),
    event_id: validatedInput.event_id,
    dependency_matrix: dependencyMatrix,
    critical_path: {
      tasks: criticalTasks,
      total_duration: projectDuration,
      bottlenecks,
    },
    parallel_opportunities: parallelOpportunities,
    issues_detected: issuesDetected,
    recommendations,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-007",
  taskName: "의존성 매핑",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 5.1.e",
  skill: "Skill 5: Plan Project",
  subSkill: "5.1: Develop Project Plan",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
