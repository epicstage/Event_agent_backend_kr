/**
 * PRJ-015: 변경 통제
 *
 * CMP-IS Reference: 6.1.b - Managing change control
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Change Control Agent for event projects.

Your expertise includes:
- Evaluating change requests
- Assessing impact on scope, schedule, and budget
- Managing approval workflows
- Documenting and tracking changes

CMP-IS Standard: 6.1.b - Managing change control`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  change_request: z.object({
    title: z.string(),
    description: z.string(),
    requested_by: z.string(),
    request_date: z.string(),
    category: z.enum(["scope", "schedule", "budget", "resource", "quality", "other"]),
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    reason: z.string(),
  }),
  current_baseline: z.object({
    total_budget: z.number(),
    remaining_budget: z.number(),
    event_date: z.string(),
    project_end_date: z.string(),
    scope_items: z.array(z.string()).optional(),
  }),
  estimated_impact: z.object({
    cost_impact: z.number().optional(),
    schedule_impact_days: z.number().optional(),
    scope_changes: z.array(z.string()).optional(),
    quality_impact: z.string().optional(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string(),
  event_id: z.string(),
  change_request_id: z.string(),
  request_summary: z.object({
    title: z.string(),
    category: z.string(),
    priority: z.string(),
    requested_by: z.string(),
    request_date: z.string(),
  }),
  impact_analysis: z.object({
    scope_impact: z.object({
      affected_items: z.array(z.string()),
      new_items: z.array(z.string()),
      removed_items: z.array(z.string()),
      impact_level: z.enum(["none", "low", "medium", "high"]),
    }),
    schedule_impact: z.object({
      original_end_date: z.string(),
      projected_end_date: z.string(),
      delay_days: z.number(),
      affected_milestones: z.array(z.string()),
      impact_level: z.enum(["none", "low", "medium", "high"]),
    }),
    budget_impact: z.object({
      original_budget: z.number(),
      additional_cost: z.number(),
      new_total: z.number(),
      budget_variance_percentage: z.number(),
      remaining_contingency: z.number(),
      impact_level: z.enum(["none", "low", "medium", "high"]),
    }),
    resource_impact: z.object({
      additional_resources: z.array(z.string()),
      reallocation_needed: z.boolean(),
      impact_level: z.enum(["none", "low", "medium", "high"]),
    }),
    risk_impact: z.object({
      new_risks: z.array(z.string()),
      mitigated_risks: z.array(z.string()),
      overall_risk_change: z.enum(["decreased", "unchanged", "increased"]),
    }),
  }),
  overall_assessment: z.object({
    total_impact_score: z.number(),
    impact_level: z.enum(["minimal", "moderate", "significant", "major"]),
    recommendation: z.enum(["approve", "approve_with_conditions", "defer", "reject"]),
    justification: z.string(),
  }),
  approval_requirements: z.object({
    required_approvers: z.array(z.object({
      role: z.string(),
      reason: z.string(),
    })),
    approval_deadline: z.string(),
    escalation_path: z.string(),
  }),
  implementation_plan: z.object({
    steps: z.array(z.object({
      step_number: z.number(),
      action: z.string(),
      responsible: z.string(),
      due_date: z.string(),
    })),
    communication_plan: z.array(z.string()),
    rollback_plan: z.string(),
  }).optional(),
  alternatives: z.array(z.object({
    option: z.string(),
    description: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    estimated_cost: z.number(),
    estimated_delay: z.number(),
  })),
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
  const { change_request, current_baseline, estimated_impact } = validatedInput;

  const changeRequestId = `CR-${Date.now().toString(36).toUpperCase()}`;

  // 영향 분석
  const costImpact = estimated_impact?.cost_impact || 0;
  const scheduleImpact = estimated_impact?.schedule_impact_days || 0;
  const scopeChanges = estimated_impact?.scope_changes || [];

  // 범위 영향
  const scopeImpactLevel = scopeChanges.length === 0 ? "none" :
    scopeChanges.length <= 2 ? "low" :
    scopeChanges.length <= 5 ? "medium" : "high";

  const scopeImpact: Output["impact_analysis"]["scope_impact"] = {
    affected_items: scopeChanges,
    new_items: change_request.category === "scope" ? scopeChanges : [],
    removed_items: [],
    impact_level: scopeImpactLevel,
  };

  // 일정 영향
  const projectedEndDate = addDays(current_baseline.project_end_date, scheduleImpact);
  const scheduleImpactLevel = scheduleImpact === 0 ? "none" :
    scheduleImpact <= 3 ? "low" :
    scheduleImpact <= 7 ? "medium" : "high";

  const scheduleImpactAnalysis: Output["impact_analysis"]["schedule_impact"] = {
    original_end_date: current_baseline.project_end_date,
    projected_end_date: projectedEndDate,
    delay_days: scheduleImpact,
    affected_milestones: scheduleImpact > 0 ? ["최종 리허설", "D-Day"] : [],
    impact_level: scheduleImpactLevel,
  };

  // 예산 영향
  const budgetVariance = (costImpact / current_baseline.total_budget) * 100;
  const budgetImpactLevel = budgetVariance <= 0 ? "none" :
    budgetVariance <= 5 ? "low" :
    budgetVariance <= 10 ? "medium" : "high";

  const remainingContingency = Math.max(0, current_baseline.remaining_budget - costImpact);

  const budgetImpact: Output["impact_analysis"]["budget_impact"] = {
    original_budget: current_baseline.total_budget,
    additional_cost: costImpact,
    new_total: current_baseline.total_budget + costImpact,
    budget_variance_percentage: Math.round(budgetVariance * 100) / 100,
    remaining_contingency: remainingContingency,
    impact_level: budgetImpactLevel,
  };

  // 리소스 영향
  const resourceImpactLevel = change_request.category === "resource" ? "medium" : "low";

  const resourceImpact: Output["impact_analysis"]["resource_impact"] = {
    additional_resources: costImpact > 0 ? ["추가 인력 또는 장비 가능성"] : [],
    reallocation_needed: scheduleImpact > 3,
    impact_level: resourceImpactLevel,
  };

  // 리스크 영향
  const riskImpact: Output["impact_analysis"]["risk_impact"] = {
    new_risks: scheduleImpact > 7 ? ["일정 압박으로 인한 품질 저하 리스크"] : [],
    mitigated_risks: [],
    overall_risk_change: scheduleImpact > 7 || budgetVariance > 10 ? "increased" : "unchanged",
  };

  // 전체 영향 점수 계산 (0-100)
  const impactScores = {
    scope: { none: 0, low: 10, medium: 25, high: 40 },
    schedule: { none: 0, low: 10, medium: 25, high: 40 },
    budget: { none: 0, low: 10, medium: 25, high: 40 },
    resource: { none: 0, low: 5, medium: 15, high: 25 },
  };

  const totalImpactScore = Math.min(100,
    impactScores.scope[scopeImpactLevel] +
    impactScores.schedule[scheduleImpactLevel] +
    impactScores.budget[budgetImpactLevel] +
    impactScores.resource[resourceImpactLevel]
  );

  // 영향 수준 결정
  const impactLevel: "minimal" | "moderate" | "significant" | "major" =
    totalImpactScore <= 20 ? "minimal" :
    totalImpactScore <= 40 ? "moderate" :
    totalImpactScore <= 70 ? "significant" : "major";

  // 승인 권장사항
  let recommendation: "approve" | "approve_with_conditions" | "defer" | "reject";
  let justification: string;

  if (totalImpactScore <= 20 && change_request.priority !== "critical") {
    recommendation = "approve";
    justification = "영향이 최소화되어 승인 권장";
  } else if (totalImpactScore <= 50) {
    recommendation = "approve_with_conditions";
    justification = "조건부 승인 권장 - 영향 완화 조치 필요";
  } else if (change_request.priority === "critical") {
    recommendation = "approve_with_conditions";
    justification = "긴급 사안으로 조건부 승인 권장 - 리스크 모니터링 강화";
  } else {
    recommendation = "defer";
    justification = "영향이 크므로 대안 검토 또는 연기 권장";
  }

  // 승인 요건
  const requiredApprovers: Output["approval_requirements"]["required_approvers"] = [];

  if (budgetVariance > 5) {
    requiredApprovers.push({ role: "재무 담당", reason: "예산 변경 승인" });
  }
  if (scheduleImpact > 3) {
    requiredApprovers.push({ role: "PM", reason: "일정 변경 승인" });
  }
  if (impactLevel === "significant" || impactLevel === "major") {
    requiredApprovers.push({ role: "이벤트 오너", reason: "주요 변경 승인" });
  }
  if (requiredApprovers.length === 0) {
    requiredApprovers.push({ role: "PM", reason: "일반 변경 승인" });
  }

  const approvalDeadline = addDays(change_request.request_date,
    change_request.priority === "critical" ? 1 :
    change_request.priority === "high" ? 3 : 5
  );

  // 구현 계획 (승인 권장 시)
  const implementationPlan = recommendation !== "defer" ? {
    steps: [
      {
        step_number: 1,
        action: "변경 승인 획득",
        responsible: "PM",
        due_date: approvalDeadline,
      },
      {
        step_number: 2,
        action: "기준선 업데이트",
        responsible: "PM",
        due_date: addDays(approvalDeadline, 1),
      },
      {
        step_number: 3,
        action: "이해관계자 통보",
        responsible: "PM",
        due_date: addDays(approvalDeadline, 2),
      },
      {
        step_number: 4,
        action: "변경 실행",
        responsible: "담당 팀",
        due_date: addDays(approvalDeadline, 7),
      },
    ],
    communication_plan: [
      "승인 결과 이메일 발송",
      "영향받는 팀 별도 브리핑",
      "주간 보고서에 변경 사항 반영",
    ],
    rollback_plan: "변경 실행 전 상태로 복구 가능하도록 백업 유지",
  } : undefined;

  // 대안
  const alternatives: Output["alternatives"] = [
    {
      option: "축소 적용",
      description: "변경 범위를 축소하여 부분 적용",
      pros: ["비용 절감", "리스크 감소"],
      cons: ["원래 목적 부분 달성"],
      estimated_cost: Math.round(costImpact * 0.5),
      estimated_delay: Math.round(scheduleImpact * 0.5),
    },
    {
      option: "연기",
      description: "이벤트 후로 변경 연기",
      pros: ["현재 일정 유지", "충분한 검토 시간"],
      cons: ["현재 이벤트에는 미반영"],
      estimated_cost: 0,
      estimated_delay: 0,
    },
    {
      option: "대체 방안",
      description: "동일 목적 달성을 위한 다른 접근법",
      pros: ["유연성", "비용 절감 가능"],
      cons: ["추가 검토 필요", "결과 불확실"],
      estimated_cost: Math.round(costImpact * 0.7),
      estimated_delay: Math.round(scheduleImpact * 0.8),
    },
  ];

  return {
    analysis_id: generateUUID(),
    event_id: validatedInput.event_id,
    change_request_id: changeRequestId,
    request_summary: {
      title: change_request.title,
      category: change_request.category,
      priority: change_request.priority,
      requested_by: change_request.requested_by,
      request_date: change_request.request_date,
    },
    impact_analysis: {
      scope_impact: scopeImpact,
      schedule_impact: scheduleImpactAnalysis,
      budget_impact: budgetImpact,
      resource_impact: resourceImpact,
      risk_impact: riskImpact,
    },
    overall_assessment: {
      total_impact_score: totalImpactScore,
      impact_level: impactLevel,
      recommendation,
      justification,
    },
    approval_requirements: {
      required_approvers: requiredApprovers,
      approval_deadline: approvalDeadline,
      escalation_path: "PM → 이벤트 오너 → 경영진",
    },
    implementation_plan: implementationPlan,
    alternatives,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-015",
  taskName: "변경 통제",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.1.b",
  skill: "Skill 6: Manage Project",
  subSkill: "6.1: Monitor and Control Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
