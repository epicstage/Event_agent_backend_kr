/**
 * PRJ-018: 예산 통제
 *
 * CMP-IS Reference: 6.1.e - Controlling project budget
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Budget Control Agent for event projects.

Your expertise includes:
- Tracking actual vs planned expenditures
- Analyzing budget variances
- Forecasting final costs
- Recommending corrective actions

CMP-IS Standard: 6.1.e - Controlling project budget`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  baseline_budget: z.number(),
  currency: z.string().default("KRW"),
  expenditures: z.array(z.object({
    category: z.string(),
    planned_amount: z.number(),
    actual_amount: z.number(),
    committed_amount: z.number().optional(),
    vendor: z.string().optional(),
  })),
  contingency_budget: z.number().optional(),
  reporting_date: z.string().optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  reporting_date: z.string(),
  budget_summary: z.object({
    baseline_budget: z.number(),
    total_planned: z.number(),
    total_actual: z.number(),
    total_committed: z.number(),
    total_forecast: z.number(),
    remaining_budget: z.number(),
    variance_amount: z.number(),
    variance_percentage: z.number(),
    budget_health: z.enum(["under_budget", "on_budget", "over_budget", "critical"]),
    currency: z.string(),
  }),
  category_analysis: z.array(z.object({
    category: z.string(),
    planned: z.number(),
    actual: z.number(),
    committed: z.number(),
    forecast: z.number(),
    variance: z.number(),
    variance_percentage: z.number(),
    status: z.enum(["under", "on_track", "over", "critical"]),
    trend: z.enum(["improving", "stable", "worsening"]),
  })),
  earned_value_analysis: z.object({
    planned_value: z.number(),
    earned_value: z.number(),
    actual_cost: z.number(),
    cost_variance: z.number(),
    cost_performance_index: z.number(),
    estimate_at_completion: z.number(),
    estimate_to_complete: z.number(),
    variance_at_completion: z.number(),
  }),
  contingency_status: z.object({
    original_contingency: z.number(),
    used_contingency: z.number(),
    remaining_contingency: z.number(),
    contingency_usage_percentage: z.number(),
  }),
  forecast: z.object({
    optimistic: z.number(),
    most_likely: z.number(),
    pessimistic: z.number(),
    confidence_level: z.string(),
  }),
  alerts: z.array(z.object({
    alert_type: z.enum(["warning", "critical"]),
    category: z.string(),
    message: z.string(),
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

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const today = validatedInput.reporting_date || new Date().toISOString().split("T")[0];
  const contingencyBudget = validatedInput.contingency_budget || validatedInput.baseline_budget * 0.1;

  // 집계
  const totalPlanned = validatedInput.expenditures.reduce((sum, e) => sum + e.planned_amount, 0);
  const totalActual = validatedInput.expenditures.reduce((sum, e) => sum + e.actual_amount, 0);
  const totalCommitted = validatedInput.expenditures.reduce((sum, e) => sum + (e.committed_amount || 0), 0);
  const totalForecast = totalActual + totalCommitted;

  const variance = totalActual - totalPlanned;
  const variancePercentage = (variance / totalPlanned) * 100;

  // 예산 건강 상태
  let budgetHealth: "under_budget" | "on_budget" | "over_budget" | "critical";
  if (variancePercentage < -5) {
    budgetHealth = "under_budget";
  } else if (variancePercentage <= 5) {
    budgetHealth = "on_budget";
  } else if (variancePercentage <= 15) {
    budgetHealth = "over_budget";
  } else {
    budgetHealth = "critical";
  }

  const remainingBudget = validatedInput.baseline_budget - totalActual - totalCommitted;

  const budgetSummary: Output["budget_summary"] = {
    baseline_budget: validatedInput.baseline_budget,
    total_planned: totalPlanned,
    total_actual: totalActual,
    total_committed: totalCommitted,
    total_forecast: totalForecast,
    remaining_budget: remainingBudget,
    variance_amount: variance,
    variance_percentage: Math.round(variancePercentage * 100) / 100,
    budget_health: budgetHealth,
    currency: validatedInput.currency,
  };

  // 카테고리별 분석
  const categoryAnalysis: Output["category_analysis"] = validatedInput.expenditures.map(exp => {
    const committed = exp.committed_amount || 0;
    const forecast = exp.actual_amount + committed;
    const catVariance = exp.actual_amount - exp.planned_amount;
    const catVariancePercentage = (catVariance / exp.planned_amount) * 100;

    let status: "under" | "on_track" | "over" | "critical";
    if (catVariancePercentage < -10) status = "under";
    else if (catVariancePercentage <= 10) status = "on_track";
    else if (catVariancePercentage <= 20) status = "over";
    else status = "critical";

    return {
      category: exp.category,
      planned: exp.planned_amount,
      actual: exp.actual_amount,
      committed,
      forecast,
      variance: catVariance,
      variance_percentage: Math.round(catVariancePercentage * 100) / 100,
      status,
      trend: catVariance > 0 ? "worsening" : catVariance < 0 ? "improving" : "stable",
    };
  });

  // Earned Value Analysis (간소화)
  const percentComplete = 0.6; // 예시: 60% 완료
  const plannedValue = validatedInput.baseline_budget * percentComplete;
  const earnedValue = plannedValue; // 실제로는 완료된 작업 가치
  const actualCost = totalActual;

  const costVariance = earnedValue - actualCost;
  const cpi = actualCost > 0 ? earnedValue / actualCost : 1;
  const eac = cpi > 0 ? validatedInput.baseline_budget / cpi : validatedInput.baseline_budget;
  const etc = eac - actualCost;
  const vac = validatedInput.baseline_budget - eac;

  const earnedValueAnalysis: Output["earned_value_analysis"] = {
    planned_value: plannedValue,
    earned_value: earnedValue,
    actual_cost: actualCost,
    cost_variance: Math.round(costVariance),
    cost_performance_index: Math.round(cpi * 100) / 100,
    estimate_at_completion: Math.round(eac),
    estimate_to_complete: Math.round(etc),
    variance_at_completion: Math.round(vac),
  };

  // 예비비 상태
  const usedContingency = variance > 0 ? Math.min(variance, contingencyBudget) : 0;

  const contingencyStatus: Output["contingency_status"] = {
    original_contingency: contingencyBudget,
    used_contingency: usedContingency,
    remaining_contingency: contingencyBudget - usedContingency,
    contingency_usage_percentage: Math.round((usedContingency / contingencyBudget) * 100),
  };

  // 예측
  const forecast: Output["forecast"] = {
    optimistic: Math.round(totalForecast * 0.95),
    most_likely: Math.round(totalForecast),
    pessimistic: Math.round(totalForecast * 1.1),
    confidence_level: cpi >= 0.95 ? "높음" : cpi >= 0.85 ? "중간" : "낮음",
  };

  // 알림
  const alerts: Output["alerts"] = [];

  categoryAnalysis.forEach(cat => {
    if (cat.status === "critical") {
      alerts.push({
        alert_type: "critical",
        category: cat.category,
        message: `${cat.category} 예산 ${Math.abs(cat.variance_percentage).toFixed(1)}% 초과`,
        recommended_action: "즉시 비용 절감 또는 범위 조정 필요",
      });
    } else if (cat.status === "over") {
      alerts.push({
        alert_type: "warning",
        category: cat.category,
        message: `${cat.category} 예산 ${cat.variance_percentage.toFixed(1)}% 초과 경향`,
        recommended_action: "추가 지출 모니터링 강화",
      });
    }
  });

  if (contingencyStatus.contingency_usage_percentage > 50) {
    alerts.push({
      alert_type: "warning",
      category: "예비비",
      message: `예비비 ${contingencyStatus.contingency_usage_percentage}% 사용`,
      recommended_action: "추가 리스크 대비 검토",
    });
  }

  // 권장사항
  const recommendations: string[] = [];
  recommendations.push(`현재 예산 상태: ${budgetHealth === "under_budget" ? "예산 내" :
    budgetHealth === "on_budget" ? "정상" :
    budgetHealth === "over_budget" ? "초과 경향" : "위험"}`);

  if (cpi < 1) {
    recommendations.push(`CPI ${cpi.toFixed(2)} - 비용 효율성 개선 필요`);
  }

  if (remainingBudget < 0) {
    recommendations.push("잔여 예산 부족 - 추가 예산 승인 또는 범위 축소 검토");
  }

  const overCategories = categoryAnalysis.filter(c => c.status === "over" || c.status === "critical");
  if (overCategories.length > 0) {
    recommendations.push(`${overCategories.map(c => c.category).join(", ")} 카테고리 비용 관리 강화`);
  }

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    reporting_date: today,
    budget_summary: budgetSummary,
    category_analysis: categoryAnalysis,
    earned_value_analysis: earnedValueAnalysis,
    contingency_status: contingencyStatus,
    forecast,
    alerts,
    recommendations,
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-018",
  taskName: "예산 통제",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.1.e",
  skill: "Skill 6: Manage Project",
  subSkill: "6.1: Monitor and Control Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
