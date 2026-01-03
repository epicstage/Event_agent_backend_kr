/**
 * PRJ-020: 자원 통제
 *
 * CMP-IS Reference: 6.1.g - Controlling project resources
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Resource Control Agent for event projects.

Your expertise includes:
- Monitoring resource utilization
- Tracking resource allocation vs actual usage
- Identifying resource conflicts
- Optimizing resource distribution

CMP-IS Standard: 6.1.g - Controlling project resources`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  resources: z.array(z.object({
    resource_id: z.string(),
    name: z.string(),
    type: z.enum(["human", "equipment", "venue", "material"]),
    allocated_hours: z.number(),
    actual_hours: z.number(),
    planned_cost: z.number(),
    actual_cost: z.number(),
    availability_percentage: z.number().optional(),
    assigned_tasks: z.array(z.string()).optional(),
  })),
  reporting_period: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  reporting_date: z.string(),
  resource_summary: z.object({
    total_resources: z.number(),
    human_resources: z.number(),
    equipment_resources: z.number(),
    total_allocated_hours: z.number(),
    total_actual_hours: z.number(),
    overall_utilization: z.number(),
    total_planned_cost: z.number(),
    total_actual_cost: z.number(),
    cost_variance: z.number(),
  }),
  utilization_analysis: z.array(z.object({
    resource_id: z.string(),
    name: z.string(),
    type: z.string(),
    allocated_hours: z.number(),
    actual_hours: z.number(),
    utilization_rate: z.number(),
    utilization_status: z.enum(["underutilized", "optimal", "overutilized", "critical"]),
    cost_efficiency: z.number(),
    issues: z.array(z.string()),
  })),
  resource_conflicts: z.array(z.object({
    conflict_id: z.string(),
    resource_id: z.string(),
    resource_name: z.string(),
    conflict_type: z.enum(["overallocation", "scheduling", "skill_mismatch", "availability"]),
    description: z.string(),
    affected_tasks: z.array(z.string()),
    resolution_options: z.array(z.string()),
    priority: z.enum(["high", "medium", "low"]),
  })),
  optimization_opportunities: z.array(z.object({
    opportunity_id: z.string(),
    description: z.string(),
    potential_savings: z.number(),
    implementation_effort: z.enum(["low", "medium", "high"]),
    recommendation: z.string(),
  })),
  forecasted_needs: z.object({
    additional_hours_needed: z.number(),
    additional_cost: z.number(),
    resource_gaps: z.array(z.object({
      type: z.string(),
      gap_description: z.string(),
      urgency: z.enum(["immediate", "soon", "future"]),
    })),
  }),
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

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const today = new Date().toISOString().split("T")[0];
  const resources = validatedInput.resources;

  // 집계
  const humanResources = resources.filter(r => r.type === "human");
  const equipmentResources = resources.filter(r => r.type === "equipment");

  const totalAllocatedHours = resources.reduce((sum, r) => sum + r.allocated_hours, 0);
  const totalActualHours = resources.reduce((sum, r) => sum + r.actual_hours, 0);
  const totalPlannedCost = resources.reduce((sum, r) => sum + r.planned_cost, 0);
  const totalActualCost = resources.reduce((sum, r) => sum + r.actual_cost, 0);

  const overallUtilization = totalAllocatedHours > 0
    ? Math.round((totalActualHours / totalAllocatedHours) * 100)
    : 0;

  const resourceSummary: Output["resource_summary"] = {
    total_resources: resources.length,
    human_resources: humanResources.length,
    equipment_resources: equipmentResources.length,
    total_allocated_hours: totalAllocatedHours,
    total_actual_hours: totalActualHours,
    overall_utilization: overallUtilization,
    total_planned_cost: totalPlannedCost,
    total_actual_cost: totalActualCost,
    cost_variance: totalActualCost - totalPlannedCost,
  };

  // 활용도 분석
  const utilizationAnalysis: Output["utilization_analysis"] = resources.map(res => {
    const utilizationRate = res.allocated_hours > 0
      ? Math.round((res.actual_hours / res.allocated_hours) * 100)
      : 0;

    let utilizationStatus: "underutilized" | "optimal" | "overutilized" | "critical";
    if (utilizationRate < 60) {
      utilizationStatus = "underutilized";
    } else if (utilizationRate <= 100) {
      utilizationStatus = "optimal";
    } else if (utilizationRate <= 120) {
      utilizationStatus = "overutilized";
    } else {
      utilizationStatus = "critical";
    }

    const costEfficiency = res.planned_cost > 0
      ? Math.round((res.actual_cost / res.planned_cost) * 100)
      : 100;

    const issues: string[] = [];
    if (utilizationRate > 110) {
      issues.push("과다 투입 - 번아웃 리스크");
    }
    if (utilizationRate < 50) {
      issues.push("저활용 - 비용 비효율");
    }
    if (costEfficiency > 120) {
      issues.push("비용 초과");
    }

    return {
      resource_id: res.resource_id,
      name: res.name,
      type: res.type,
      allocated_hours: res.allocated_hours,
      actual_hours: res.actual_hours,
      utilization_rate: utilizationRate,
      utilization_status: utilizationStatus,
      cost_efficiency: costEfficiency,
      issues,
    };
  });

  // 리소스 충돌
  const resourceConflicts: Output["resource_conflicts"] = [];
  let conflictCount = 0;

  const overutilized = utilizationAnalysis.filter(u => u.utilization_status === "critical" || u.utilization_status === "overutilized");
  overutilized.forEach(res => {
    conflictCount++;
    const resource = resources.find(r => r.resource_id === res.resource_id);
    resourceConflicts.push({
      conflict_id: `CONF-${String(conflictCount).padStart(3, "0")}`,
      resource_id: res.resource_id,
      resource_name: res.name,
      conflict_type: "overallocation",
      description: `${res.name} 리소스 ${res.utilization_rate}% 과다 할당`,
      affected_tasks: resource?.assigned_tasks || [],
      resolution_options: [
        "업무 재분배",
        "추가 리소스 투입",
        "일정 조정",
        "범위 축소",
      ],
      priority: res.utilization_status === "critical" ? "high" : "medium",
    });
  });

  // 최적화 기회
  const optimizationOpportunities: Output["optimization_opportunities"] = [];
  let optCount = 0;

  const underutilized = utilizationAnalysis.filter(u => u.utilization_status === "underutilized");
  if (underutilized.length > 0) {
    const potentialSavings = underutilized.reduce((sum, u) => {
      const res = resources.find(r => r.resource_id === u.resource_id);
      return sum + (res ? res.planned_cost * 0.3 : 0);
    }, 0);

    optCount++;
    optimizationOpportunities.push({
      opportunity_id: `OPT-${String(optCount).padStart(3, "0")}`,
      description: `저활용 리소스 ${underutilized.length}개 재배치`,
      potential_savings: Math.round(potentialSavings),
      implementation_effort: "medium",
      recommendation: "과다 할당 영역으로 재배치 또는 범위 확대",
    });
  }

  const costOverruns = utilizationAnalysis.filter(u => u.cost_efficiency > 110);
  if (costOverruns.length > 0) {
    optCount++;
    optimizationOpportunities.push({
      opportunity_id: `OPT-${String(optCount).padStart(3, "0")}`,
      description: "비용 초과 리소스 관리 강화",
      potential_savings: Math.round(resourceSummary.cost_variance * 0.5),
      implementation_effort: "low",
      recommendation: "비용 모니터링 주기 단축 및 승인 절차 강화",
    });
  }

  // 예측 필요
  const additionalHoursNeeded = overutilized.reduce((sum, u) => {
    return sum + (u.actual_hours - u.allocated_hours);
  }, 0);

  const avgHourlyCost = totalPlannedCost / Math.max(totalAllocatedHours, 1);
  const additionalCost = additionalHoursNeeded * avgHourlyCost;

  const resourceGaps: Output["forecasted_needs"]["resource_gaps"] = [];
  if (humanResources.length > 0) {
    const humanOverutilized = overutilized.filter(u => {
      const res = resources.find(r => r.resource_id === u.resource_id);
      return res?.type === "human";
    });
    if (humanOverutilized.length > 0) {
      resourceGaps.push({
        type: "human",
        gap_description: `인력 ${humanOverutilized.length}명 추가 필요`,
        urgency: "immediate",
      });
    }
  }

  const forecastedNeeds: Output["forecasted_needs"] = {
    additional_hours_needed: Math.round(additionalHoursNeeded),
    additional_cost: Math.round(additionalCost),
    resource_gaps: resourceGaps,
  };

  // 권장사항
  const recommendations: string[] = [];
  recommendations.push(`전체 리소스 활용률: ${overallUtilization}%`);

  if (resourceConflicts.length > 0) {
    recommendations.push(`리소스 충돌 ${resourceConflicts.length}건 해결 필요`);
  }

  if (resourceSummary.cost_variance > 0) {
    recommendations.push(`리소스 비용 ${Math.round(resourceSummary.cost_variance / 10000)}만원 초과 - 관리 강화`);
  }

  if (underutilized.length > 0) {
    recommendations.push(`저활용 리소스 ${underutilized.length}개 재배치 검토`);
  }

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    reporting_date: today,
    resource_summary: resourceSummary,
    utilization_analysis: utilizationAnalysis,
    resource_conflicts: resourceConflicts,
    optimization_opportunities: optimizationOpportunities,
    forecasted_needs: forecastedNeeds,
    recommendations,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-020",
  taskName: "자원 통제",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.1.g",
  skill: "Skill 6: Manage Project",
  subSkill: "6.1: Monitor and Control Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
