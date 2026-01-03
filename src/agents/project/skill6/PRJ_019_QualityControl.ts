/**
 * PRJ-019: 품질 통제
 *
 * CMP-IS Reference: 6.1.f - Controlling project quality
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Quality Control Agent for event projects.

Your expertise includes:
- Monitoring quality metrics
- Conducting quality inspections
- Identifying quality deviations
- Recommending corrective actions

CMP-IS Standard: 6.1.f - Controlling project quality`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  quality_checkpoints: z.array(z.object({
    checkpoint_id: z.string(),
    name: z.string(),
    category: z.string(),
    target_score: z.number(),
    actual_score: z.number().optional(),
    status: z.enum(["pending", "passed", "failed", "conditional"]),
    inspector: z.string().optional(),
    inspection_date: z.string().optional(),
    notes: z.string().optional(),
  })),
  kpis: z.array(z.object({
    kpi_id: z.string(),
    name: z.string(),
    target: z.number(),
    actual: z.number().optional(),
    unit: z.string(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  reporting_date: z.string(),
  quality_summary: z.object({
    total_checkpoints: z.number(),
    passed: z.number(),
    failed: z.number(),
    conditional: z.number(),
    pending: z.number(),
    overall_quality_score: z.number(),
    quality_status: z.enum(["excellent", "good", "acceptable", "poor", "critical"]),
  }),
  checkpoint_results: z.array(z.object({
    checkpoint_id: z.string(),
    name: z.string(),
    category: z.string(),
    target_score: z.number(),
    actual_score: z.number(),
    variance: z.number(),
    status: z.string(),
    issues_found: z.array(z.string()),
    corrective_actions: z.array(z.string()),
  })),
  kpi_performance: z.array(z.object({
    kpi_id: z.string(),
    name: z.string(),
    target: z.number(),
    actual: z.number(),
    achievement_rate: z.number(),
    status: z.enum(["exceeded", "met", "below", "critical"]),
    trend: z.string(),
  })),
  quality_issues: z.array(z.object({
    issue_id: z.string(),
    checkpoint_id: z.string(),
    description: z.string(),
    severity: z.enum(["minor", "major", "critical"]),
    root_cause: z.string(),
    corrective_action: z.string(),
    responsible: z.string(),
    due_date: z.string(),
  })),
  improvement_actions: z.array(z.object({
    action_id: z.string(),
    action: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    expected_impact: z.string(),
    responsible: z.string(),
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
  const today = new Date().toISOString().split("T")[0];

  const checkpoints = validatedInput.quality_checkpoints;

  // 요약 집계
  const passed = checkpoints.filter(c => c.status === "passed").length;
  const failed = checkpoints.filter(c => c.status === "failed").length;
  const conditional = checkpoints.filter(c => c.status === "conditional").length;
  const pending = checkpoints.filter(c => c.status === "pending").length;

  const inspectedCheckpoints = checkpoints.filter(c => c.actual_score !== undefined);
  const avgScore = inspectedCheckpoints.length > 0
    ? inspectedCheckpoints.reduce((sum, c) => sum + (c.actual_score || 0), 0) / inspectedCheckpoints.length
    : 0;

  let qualityStatus: "excellent" | "good" | "acceptable" | "poor" | "critical";
  if (avgScore >= 90 && failed === 0) {
    qualityStatus = "excellent";
  } else if (avgScore >= 80 && failed <= 1) {
    qualityStatus = "good";
  } else if (avgScore >= 70) {
    qualityStatus = "acceptable";
  } else if (avgScore >= 60) {
    qualityStatus = "poor";
  } else {
    qualityStatus = "critical";
  }

  const qualitySummary: Output["quality_summary"] = {
    total_checkpoints: checkpoints.length,
    passed,
    failed,
    conditional,
    pending,
    overall_quality_score: Math.round(avgScore),
    quality_status: qualityStatus,
  };

  // 체크포인트 결과
  const checkpointResults: Output["checkpoint_results"] = checkpoints.map(cp => {
    const actualScore = cp.actual_score || 0;
    const variance = actualScore - cp.target_score;

    const issuesFound: string[] = [];
    const correctiveActions: string[] = [];

    if (cp.status === "failed") {
      issuesFound.push("목표 점수 미달성");
      correctiveActions.push("원인 분석 및 재검사");
    } else if (cp.status === "conditional") {
      issuesFound.push("조건부 통과 - 일부 항목 미충족");
      correctiveActions.push("미충족 항목 보완 후 재확인");
    }

    if (cp.notes) {
      issuesFound.push(cp.notes);
    }

    return {
      checkpoint_id: cp.checkpoint_id,
      name: cp.name,
      category: cp.category,
      target_score: cp.target_score,
      actual_score: actualScore,
      variance,
      status: cp.status,
      issues_found: issuesFound,
      corrective_actions: correctiveActions,
    };
  });

  // KPI 성과
  const kpiPerformance: Output["kpi_performance"] = (validatedInput.kpis || []).map(kpi => {
    const actual = kpi.actual || 0;
    const achievementRate = kpi.target > 0 ? (actual / kpi.target) * 100 : 0;

    let status: "exceeded" | "met" | "below" | "critical";
    if (achievementRate >= 110) status = "exceeded";
    else if (achievementRate >= 90) status = "met";
    else if (achievementRate >= 70) status = "below";
    else status = "critical";

    return {
      kpi_id: kpi.kpi_id,
      name: kpi.name,
      target: kpi.target,
      actual,
      achievement_rate: Math.round(achievementRate),
      status,
      trend: actual > 0 ? "측정 중" : "데이터 없음",
    };
  });

  // 품질 이슈
  const qualityIssues: Output["quality_issues"] = checkpoints
    .filter(cp => cp.status === "failed" || cp.status === "conditional")
    .map((cp, idx) => ({
      issue_id: `QI-${String(idx + 1).padStart(3, "0")}`,
      checkpoint_id: cp.checkpoint_id,
      description: `${cp.name} 품질 기준 미충족`,
      severity: cp.status === "failed" ? "major" : "minor",
      root_cause: "상세 분석 필요",
      corrective_action: cp.status === "failed"
        ? "즉시 재작업 및 재검사"
        : "보완 조치 후 확인",
      responsible: cp.inspector || "QA 담당",
      due_date: addDays(today, cp.status === "failed" ? 2 : 5),
    }));

  // 개선 조치
  const improvementActions: Output["improvement_actions"] = [];

  if (failed > 0) {
    improvementActions.push({
      action_id: "IMP-001",
      action: "실패 체크포인트 긴급 재검토 및 수정",
      priority: "high",
      expected_impact: "품질 점수 향상, 리스크 감소",
      responsible: "QA 리드",
    });
  }

  if (qualityStatus === "poor" || qualityStatus === "critical") {
    improvementActions.push({
      action_id: "IMP-002",
      action: "품질 프로세스 전면 검토",
      priority: "high",
      expected_impact: "체계적 품질 관리 개선",
      responsible: "PM",
    });
  }

  if (pending > checkpoints.length * 0.3) {
    improvementActions.push({
      action_id: "IMP-003",
      action: "미검사 항목 신속 처리",
      priority: "medium",
      expected_impact: "품질 가시성 향상",
      responsible: "QA 팀",
    });
  }

  // 권장사항
  const recommendations: string[] = [];
  recommendations.push(`현재 품질 상태: ${qualityStatus} (평균 ${Math.round(avgScore)}점)`);

  if (failed > 0) {
    recommendations.push(`실패 항목 ${failed}개 즉시 조치 필요`);
  }

  if (pending > 0) {
    recommendations.push(`미검사 항목 ${pending}개 잔여 - 검사 일정 확인`);
  }

  if (qualityStatus === "excellent" || qualityStatus === "good") {
    recommendations.push("현재 품질 수준 유지 권장");
  }

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    reporting_date: today,
    quality_summary: qualitySummary,
    checkpoint_results: checkpointResults,
    kpi_performance: kpiPerformance,
    quality_issues: qualityIssues,
    improvement_actions: improvementActions,
    recommendations,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-019",
  taskName: "품질 통제",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.1.f",
  skill: "Skill 6: Manage Project",
  subSkill: "6.1: Monitor and Control Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
