/**
 * HR-033: Labor Cost Tracking
 *
 * CMP-IS Domain F: Human Resources - Skill 12: HR Management
 * 실시간 인건비 추적 및 분석
 */

import { z } from "zod";

export const HR_033_InputSchema = z.object({
  event_id: z.string().uuid(),
  budget: z.object({
    total_labor_budget: z.number(),
    contingency_percent: z.number().default(10),
  }),
  actual_costs: z.array(z.object({
    category: z.string(),
    planned: z.number(),
    actual: z.number(),
    variance_reason: z.string().optional(),
  })),
  staffing_data: z.object({
    planned_headcount: z.number(),
    actual_headcount: z.number(),
    overtime_hours: z.number(),
    additional_hires: z.number(),
  }),
  event_days_completed: z.number(),
  total_event_days: z.number(),
});

export const HR_033_OutputSchema = z.object({
  event_id: z.string(),
  cost_summary: z.object({
    total_budget: z.number(),
    spent_to_date: z.number(),
    remaining: z.number(),
    burn_rate: z.number(),
    projected_final: z.number(),
    variance_percent: z.number(),
    status: z.enum(["on_track", "at_risk", "over_budget"]),
  }),
  category_breakdown: z.array(z.object({
    category: z.string(),
    budget: z.number(),
    actual: z.number(),
    variance: z.number(),
    variance_percent: z.number(),
    trend: z.enum(["up", "stable", "down"]),
    action_needed: z.boolean(),
  })),
  cost_drivers: z.array(z.object({
    driver: z.string(),
    impact: z.number(),
    controllable: z.boolean(),
    mitigation: z.string(),
  })),
  efficiency_metrics: z.object({
    cost_per_attendee: z.number(),
    cost_per_staff_hour: z.number(),
    overtime_ratio: z.number(),
    utilization_rate: z.number(),
  }),
  recommendations: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    recommendation: z.string(),
    potential_savings: z.number(),
    implementation: z.string(),
  })),
  alerts: z.array(z.object({
    severity: z.enum(["info", "warning", "critical"]),
    message: z.string(),
    action_required: z.string(),
  })),
  forecast: z.object({
    best_case: z.number(),
    expected: z.number(),
    worst_case: z.number(),
    confidence: z.number(),
  }),
});

export type HR_033_Input = z.infer<typeof HR_033_InputSchema>;
export type HR_033_Output = z.infer<typeof HR_033_OutputSchema>;

export async function execute(input: HR_033_Input): Promise<HR_033_Output> {
  const totalBudget = input.budget.total_labor_budget;
  const contingency = totalBudget * (input.budget.contingency_percent / 100);
  const effectiveBudget = totalBudget - contingency;

  const spentToDate = input.actual_costs.reduce((sum, c) => sum + c.actual, 0);
  const plannedToDate = input.actual_costs.reduce((sum, c) => sum + c.planned, 0);

  const progressPercent = input.event_days_completed / input.total_event_days;
  const burnRate = spentToDate / input.event_days_completed;
  const projectedFinal = burnRate * input.total_event_days;
  const variancePercent = Math.round(((projectedFinal - totalBudget) / totalBudget) * 100);

  let status: "on_track" | "at_risk" | "over_budget" = "on_track";
  if (variancePercent > 10) status = "over_budget";
  else if (variancePercent > 5) status = "at_risk";

  // 카테고리별 분석
  const categoryBreakdown = input.actual_costs.map((c) => {
    const variance = c.actual - c.planned;
    const variancePercent = Math.round((variance / c.planned) * 100);
    let trend: "up" | "stable" | "down" = "stable";
    if (variancePercent > 5) trend = "up";
    else if (variancePercent < -5) trend = "down";

    return {
      category: c.category,
      budget: c.planned,
      actual: c.actual,
      variance,
      variance_percent: variancePercent,
      trend,
      action_needed: variancePercent > 10,
    };
  });

  // 비용 동인
  const costDrivers = [];

  if (input.staffing_data.overtime_hours > 0) {
    const overtimeCost = input.staffing_data.overtime_hours * 15000 * 1.5;
    costDrivers.push({
      driver: "초과 근무",
      impact: overtimeCost,
      controllable: true,
      mitigation: "교대 스케줄 최적화, 추가 인력 투입 검토",
    });
  }

  if (input.staffing_data.additional_hires > 0) {
    const additionalCost = input.staffing_data.additional_hires * 120000;
    costDrivers.push({
      driver: "추가 채용",
      impact: additionalCost,
      controllable: false,
      mitigation: "예비 인력 풀 확대, 사전 수요 예측 개선",
    });
  }

  const headcountVariance = input.staffing_data.actual_headcount - input.staffing_data.planned_headcount;
  if (headcountVariance > 0) {
    costDrivers.push({
      driver: "인력 초과",
      impact: headcountVariance * 100000,
      controllable: true,
      mitigation: "비핵심 구역 인력 재배치, 휴식 로테이션 조정",
    });
  }

  // 효율성 지표
  const estimatedAttendees = 5000;
  const totalHours = input.staffing_data.actual_headcount * 8 * input.event_days_completed;

  const efficiencyMetrics = {
    cost_per_attendee: Math.round(spentToDate / estimatedAttendees),
    cost_per_staff_hour: Math.round(spentToDate / totalHours),
    overtime_ratio: Math.round((input.staffing_data.overtime_hours / totalHours) * 100),
    utilization_rate: Math.min(100, Math.round((totalHours / (input.staffing_data.actual_headcount * 10 * input.event_days_completed)) * 100)),
  };

  // 권장사항
  const recommendations = [];

  if (status === "over_budget" || status === "at_risk") {
    recommendations.push({
      priority: "high" as const,
      recommendation: "초과 근무 제한 조치",
      potential_savings: input.staffing_data.overtime_hours * 15000 * 0.5,
      implementation: "일 2시간 초과근무 상한선 설정",
    });
  }

  if (efficiencyMetrics.utilization_rate < 70) {
    recommendations.push({
      priority: "medium" as const,
      recommendation: "인력 재배치 최적화",
      potential_savings: Math.round(spentToDate * 0.1),
      implementation: "피크 시간대 집중 배치, 저조한 시간대 인력 감축",
    });
  }

  recommendations.push({
    priority: "low" as const,
    recommendation: "다음 행사 예산 조정 반영",
    potential_savings: 0,
    implementation: "실제 비용 데이터를 다음 행사 계획에 활용",
  });

  // 알림
  const alerts = [];

  if (status === "over_budget") {
    alerts.push({
      severity: "critical" as const,
      message: `예산 초과 예상: 현재 추세 유지 시 ${variancePercent}% 초과`,
      action_required: "즉시 비용 절감 조치 시행 필요",
    });
  } else if (status === "at_risk") {
    alerts.push({
      severity: "warning" as const,
      message: `예산 초과 위험: ${variancePercent}% 초과 가능성`,
      action_required: "비용 모니터링 강화 및 예방 조치 검토",
    });
  }

  if (efficiencyMetrics.overtime_ratio > 15) {
    alerts.push({
      severity: "warning" as const,
      message: `초과근무 비율 ${efficiencyMetrics.overtime_ratio}%로 과다`,
      action_required: "스케줄 조정 또는 추가 인력 투입 검토",
    });
  }

  // 예측
  const forecast = {
    best_case: Math.round(projectedFinal * 0.9),
    expected: Math.round(projectedFinal),
    worst_case: Math.round(projectedFinal * 1.15),
    confidence: Math.round((input.event_days_completed / input.total_event_days) * 80 + 10),
  };

  return {
    event_id: input.event_id,
    cost_summary: {
      total_budget: totalBudget,
      spent_to_date: spentToDate,
      remaining: totalBudget - spentToDate,
      burn_rate: Math.round(burnRate),
      projected_final: Math.round(projectedFinal),
      variance_percent: variancePercent,
      status,
    },
    category_breakdown: categoryBreakdown,
    cost_drivers: costDrivers,
    efficiency_metrics: efficiencyMetrics,
    recommendations,
    alerts,
    forecast,
  };
}

export const HR_033_LaborCostTracking = {
  id: "HR-033",
  name: "Labor Cost Tracking",
  description: "실시간 인건비 추적 및 분석",
  version: "1.0.0",
  cmpStandard: "CMP-IS Domain F: Skill 12.18",
  taskType: "AI" as const,
  execute,
  inputSchema: HR_033_InputSchema,
  outputSchema: HR_033_OutputSchema,
  persona: `당신은 인건비 분석 전문가입니다. 실시간 비용 추적과 예측으로 예산 내 운영을 지원합니다.`,
};

export default HR_033_LaborCostTracking;
