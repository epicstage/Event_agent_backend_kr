/**
 * FIN-052: 실제 vs 예산 분석
 *
 * CMP-IS Reference: 8.3.b
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Actual vs Budget Analysis.
CMP-IS Standard: 8.3.b - Analyzing variances between actual spending and budget.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  budget_data: z.array(z.object({
    category_code: z.string(),
    category_name: z.string(),
    budgeted: z.number(),
    actual: z.number(),
    committed: z.number().optional(),
  })),
  reporting_period: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }),
  event_progress: z.number().min(0).max(100),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  analysis_id: z.string().uuid(),
  event_id: z.string().uuid(),
  summary: z.object({
    total_budget: z.number(),
    total_actual: z.number(),
    total_committed: z.number(),
    total_variance: z.number(),
    variance_percentage: z.number(),
    projected_final: z.number(),
    event_progress: z.number(),
    spend_rate_assessment: z.enum(["under", "on_track", "over"]),
  }),
  category_analysis: z.array(z.object({
    category_code: z.string(),
    category_name: z.string(),
    budgeted: z.number(),
    actual: z.number(),
    committed: z.number(),
    available: z.number(),
    variance: z.number(),
    variance_percentage: z.number(),
    status: z.enum(["green", "yellow", "red"]),
    trend: z.enum(["improving", "stable", "worsening"]),
    analysis: z.string(),
  })),
  variance_drivers: z.array(z.object({
    driver: z.string(),
    impact: z.number(),
    category: z.string(),
    root_cause: z.string(),
    corrective_action: z.string(),
  })),
  projections: z.object({
    projected_total_spend: z.number(),
    projected_variance: z.number(),
    confidence_level: z.number(),
    assumption: z.string(),
  }),
  recommendations: z.array(z.object({
    recommendation: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    expected_impact: z.string(),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const totalBudget = validated.budget_data.reduce((sum, c) => sum + c.budgeted, 0);
  const totalActual = validated.budget_data.reduce((sum, c) => sum + c.actual, 0);
  const totalCommitted = validated.budget_data.reduce((sum, c) => sum + (c.committed || 0), 0);
  const totalVariance = totalActual - totalBudget * (validated.event_progress / 100);
  const variancePercentage = (totalVariance / (totalBudget * (validated.event_progress / 100))) * 100;

  const expectedSpendRate = validated.event_progress / 100;
  const actualSpendRate = totalActual / totalBudget;
  const spendAssessment = actualSpendRate > expectedSpendRate * 1.15 ? "over" :
    actualSpendRate < expectedSpendRate * 0.85 ? "under" : "on_track";

  const categoryAnalysis = validated.budget_data.map(cat => {
    const committed = cat.committed || 0;
    const available = cat.budgeted - cat.actual - committed;
    const variance = cat.actual - (cat.budgeted * (validated.event_progress / 100));
    const variancePct = (variance / (cat.budgeted * (validated.event_progress / 100))) * 100;

    let status: "green" | "yellow" | "red" = "green";
    if (Math.abs(variancePct) > 20) status = "red";
    else if (Math.abs(variancePct) > 10) status = "yellow";

    return {
      category_code: cat.category_code,
      category_name: cat.category_name,
      budgeted: cat.budgeted,
      actual: cat.actual,
      committed,
      available: Math.max(0, available),
      variance: Math.round(variance),
      variance_percentage: Math.round(variancePct * 10) / 10,
      status,
      trend: variance > 0 ? "worsening" : "stable",
      analysis: status === "red"
        ? `${cat.category_name} 예산 초과 위험. 즉시 검토 필요.`
        : status === "yellow"
          ? `${cat.category_name} 모니터링 강화 필요.`
          : `${cat.category_name} 정상 범위 내 집행 중.`,
    } as const;
  });

  const varianceDrivers = categoryAnalysis
    .filter(c => c.status !== "green")
    .map(c => ({
      driver: `${c.category_name} ${c.variance > 0 ? "초과" : "미달"}`,
      impact: Math.abs(c.variance),
      category: c.category_code,
      root_cause: c.variance > 0 ? "예상보다 높은 비용 발생" : "지출 지연 또는 절감",
      corrective_action: c.variance > 0 ? "대안 검토 및 비용 통제 강화" : "계획대로 집행 진행",
    }));

  // Projection
  const projectedTotal = totalActual / (validated.event_progress / 100);
  const projectedVariance = projectedTotal - totalBudget;

  const output: Output = {
    analysis_id: generateUUID(),
    event_id: validated.event_id,
    summary: {
      total_budget: totalBudget,
      total_actual: totalActual,
      total_committed: totalCommitted,
      total_variance: Math.round(totalVariance),
      variance_percentage: Math.round(variancePercentage * 10) / 10,
      projected_final: Math.round(projectedTotal),
      event_progress: validated.event_progress,
      spend_rate_assessment: spendAssessment,
    },
    category_analysis: categoryAnalysis,
    variance_drivers: varianceDrivers,
    projections: {
      projected_total_spend: Math.round(projectedTotal),
      projected_variance: Math.round(projectedVariance),
      confidence_level: 75,
      assumption: "현재 지출 패턴이 유지된다고 가정",
    },
    recommendations: [
      {
        recommendation: spendAssessment === "over"
          ? "긴급 비용 통제 회의 소집"
          : "현재 추적 체계 유지",
        priority: spendAssessment === "over" ? "high" : "low",
        expected_impact: "예산 준수율 향상",
      },
      {
        recommendation: "주요 variance 항목 원인 분석 심화",
        priority: "medium",
        expected_impact: "정확한 예측 및 통제력 확보",
      },
      {
        recommendation: "예비비 사용 기준 재검토",
        priority: "medium",
        expected_impact: "리스크 대응력 강화",
      },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-052",
  taskName: "실제 vs 예산 분석",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 8.3.b",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.3: Monitor and Revise Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
