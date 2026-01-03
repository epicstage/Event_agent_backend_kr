/**
 * FIN-068: 재무 보고
 *
 * CMP-IS Reference: 9.2.e
 * Task Type: AI
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Agent for Financial Reporting.
CMP-IS Standard: 9.2.e - Generating comprehensive financial reports.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  event_name: z.string(),
  report_period: z.object({
    start_date: z.string(),
    end_date: z.string(),
  }),
  report_type: z.enum(["interim", "final", "executive", "detailed"]),
  financial_data: z.object({
    revenue: z.array(z.object({
      category: z.string(),
      budgeted: z.number(),
      actual: z.number(),
    })),
    expenses: z.array(z.object({
      category: z.string(),
      budgeted: z.number(),
      actual: z.number(),
      committed: z.number(),
    })),
    cash_position: z.object({
      opening_balance: z.number(),
      total_inflows: z.number(),
      total_outflows: z.number(),
      closing_balance: z.number(),
    }),
  }),
  comparison_data: z.object({
    previous_event: z.object({
      name: z.string(),
      total_revenue: z.number(),
      total_expenses: z.number(),
      net_result: z.number(),
    }).optional(),
    industry_benchmark: z.object({
      profit_margin: z.number(),
      expense_ratio: z.number(),
    }).optional(),
  }).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string().uuid(),
  event_id: z.string().uuid(),
  report_metadata: z.object({
    report_type: z.string(),
    period: z.string(),
    generated_date: z.string(),
    prepared_by: z.string(),
  }),
  executive_summary: z.object({
    headline: z.string(),
    key_metrics: z.array(z.object({
      metric: z.string(),
      value: z.string(),
      trend: z.enum(["up", "down", "stable"]),
      status: z.enum(["good", "warning", "critical"]),
    })),
    highlights: z.array(z.string()),
    concerns: z.array(z.string()),
  }),
  revenue_analysis: z.object({
    total_budgeted: z.number(),
    total_actual: z.number(),
    variance: z.number(),
    variance_percentage: z.number(),
    by_category: z.array(z.object({
      category: z.string(),
      budgeted: z.number(),
      actual: z.number(),
      variance: z.number(),
      variance_pct: z.number(),
      contribution_pct: z.number(),
    })),
    top_performers: z.array(z.string()),
    underperformers: z.array(z.string()),
  }),
  expense_analysis: z.object({
    total_budgeted: z.number(),
    total_actual: z.number(),
    total_committed: z.number(),
    total_projected: z.number(),
    variance: z.number(),
    variance_percentage: z.number(),
    by_category: z.array(z.object({
      category: z.string(),
      budgeted: z.number(),
      actual: z.number(),
      committed: z.number(),
      remaining: z.number(),
      variance_pct: z.number(),
    })),
    cost_efficiency_index: z.number(),
  }),
  profitability_analysis: z.object({
    gross_profit: z.number(),
    gross_margin: z.number(),
    net_profit: z.number(),
    net_margin: z.number(),
    break_even_status: z.enum(["achieved", "on_track", "at_risk", "not_achieved"]),
    roi: z.number(),
  }),
  cash_flow_summary: z.object({
    opening_balance: z.number(),
    total_inflows: z.number(),
    total_outflows: z.number(),
    net_cash_flow: z.number(),
    closing_balance: z.number(),
    runway_days: z.number().int(),
  }),
  comparative_analysis: z.object({
    vs_previous_event: z.object({
      revenue_change_pct: z.number(),
      expense_change_pct: z.number(),
      profit_change_pct: z.number(),
      narrative: z.string(),
    }).optional(),
    vs_benchmark: z.object({
      profit_margin_vs_benchmark: z.number(),
      expense_ratio_vs_benchmark: z.number(),
      narrative: z.string(),
    }).optional(),
  }).optional(),
  recommendations: z.array(z.object({
    category: z.string(),
    recommendation: z.string(),
    priority: z.enum(["high", "medium", "low"]),
    expected_impact: z.string(),
  })),
  appendices: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const totalBudgetedRevenue = validated.financial_data.revenue.reduce((sum, r) => sum + r.budgeted, 0);
  const totalActualRevenue = validated.financial_data.revenue.reduce((sum, r) => sum + r.actual, 0);
  const revenueVariance = totalActualRevenue - totalBudgetedRevenue;
  const revenueVariancePct = totalBudgetedRevenue > 0 ? (revenueVariance / totalBudgetedRevenue) * 100 : 0;

  const totalBudgetedExpense = validated.financial_data.expenses.reduce((sum, e) => sum + e.budgeted, 0);
  const totalActualExpense = validated.financial_data.expenses.reduce((sum, e) => sum + e.actual, 0);
  const totalCommitted = validated.financial_data.expenses.reduce((sum, e) => sum + e.committed, 0);
  const totalProjectedExpense = totalActualExpense + totalCommitted;
  const expenseVariance = totalActualExpense - totalBudgetedExpense;
  const expenseVariancePct = totalBudgetedExpense > 0 ? (expenseVariance / totalBudgetedExpense) * 100 : 0;

  const grossProfit = totalActualRevenue - totalActualExpense;
  const grossMargin = totalActualRevenue > 0 ? (grossProfit / totalActualRevenue) * 100 : 0;
  const netProfit = grossProfit;
  const netMargin = grossMargin;
  const roi = totalActualExpense > 0 ? (netProfit / totalActualExpense) * 100 : 0;

  const breakEvenStatus = netProfit > 0 ? "achieved" :
    netProfit > -totalBudgetedExpense * 0.1 ? "on_track" :
      netProfit > -totalBudgetedExpense * 0.2 ? "at_risk" : "not_achieved";

  const revenueByCategory = validated.financial_data.revenue.map(r => ({
    category: r.category,
    budgeted: r.budgeted,
    actual: r.actual,
    variance: r.actual - r.budgeted,
    variance_pct: r.budgeted > 0 ? Math.round(((r.actual - r.budgeted) / r.budgeted) * 100 * 10) / 10 : 0,
    contribution_pct: totalActualRevenue > 0 ? Math.round((r.actual / totalActualRevenue) * 100 * 10) / 10 : 0,
  }));

  const expenseByCategory = validated.financial_data.expenses.map(e => ({
    category: e.category,
    budgeted: e.budgeted,
    actual: e.actual,
    committed: e.committed,
    remaining: Math.max(0, e.budgeted - e.actual - e.committed),
    variance_pct: e.budgeted > 0 ? Math.round(((e.actual - e.budgeted) / e.budgeted) * 100 * 10) / 10 : 0,
  }));

  const topPerformers = revenueByCategory
    .filter(r => r.variance_pct > 5)
    .map(r => `${r.category} (+${r.variance_pct}%)`);

  const underperformers = revenueByCategory
    .filter(r => r.variance_pct < -5)
    .map(r => `${r.category} (${r.variance_pct}%)`);

  const keyMetrics = [
    {
      metric: "총 수익",
      value: `${totalActualRevenue.toLocaleString()}원`,
      trend: revenueVariance > 0 ? "up" as const : revenueVariance < 0 ? "down" as const : "stable" as const,
      status: revenueVariancePct >= -5 ? "good" as const : revenueVariancePct >= -15 ? "warning" as const : "critical" as const,
    },
    {
      metric: "총 비용",
      value: `${totalActualExpense.toLocaleString()}원`,
      trend: expenseVariance > 0 ? "up" as const : expenseVariance < 0 ? "down" as const : "stable" as const,
      status: expenseVariancePct <= 5 ? "good" as const : expenseVariancePct <= 15 ? "warning" as const : "critical" as const,
    },
    {
      metric: "순이익",
      value: `${netProfit.toLocaleString()}원`,
      trend: netProfit > 0 ? "up" as const : netProfit < 0 ? "down" as const : "stable" as const,
      status: netProfit >= 0 ? "good" as const : netProfit >= -totalBudgetedExpense * 0.1 ? "warning" as const : "critical" as const,
    },
    {
      metric: "ROI",
      value: `${Math.round(roi * 10) / 10}%`,
      trend: roi > 0 ? "up" as const : roi < 0 ? "down" as const : "stable" as const,
      status: roi >= 10 ? "good" as const : roi >= 0 ? "warning" as const : "critical" as const,
    },
  ];

  const recommendations = [];
  if (revenueVariancePct < -5) {
    recommendations.push({
      category: "수익",
      recommendation: "수익 부진 카테고리 집중 마케팅 또는 대안 수익원 개발",
      priority: "high" as const,
      expected_impact: `수익 ${Math.abs(revenueVariance).toLocaleString()}원 회복 가능`,
    });
  }
  if (expenseVariancePct > 10) {
    recommendations.push({
      category: "비용",
      recommendation: "초과 지출 카테고리 긴급 비용 통제 조치",
      priority: "high" as const,
      expected_impact: `비용 ${Math.abs(expenseVariance).toLocaleString()}원 절감 가능`,
    });
  }
  if (grossMargin < 20) {
    recommendations.push({
      category: "수익성",
      recommendation: "마진 개선을 위한 가격 조정 또는 비용 구조 재검토",
      priority: "medium" as const,
      expected_impact: "이익률 5-10%p 개선",
    });
  }

  const output: Output = {
    report_id: generateUUID(),
    event_id: validated.event_id,
    report_metadata: {
      report_type: validated.report_type === "interim" ? "중간 보고서" :
        validated.report_type === "final" ? "최종 보고서" :
          validated.report_type === "executive" ? "경영진 요약" : "상세 보고서",
      period: `${validated.report_period.start_date} ~ ${validated.report_period.end_date}`,
      generated_date: nowISO().split("T")[0],
      prepared_by: "AI 재무 분석 시스템",
    },
    executive_summary: {
      headline: netProfit >= 0
        ? `${validated.event_name} 흑자 달성 (순이익 ${netProfit.toLocaleString()}원, ROI ${Math.round(roi)}%)`
        : `${validated.event_name} 손실 발생 (순손실 ${Math.abs(netProfit).toLocaleString()}원)`,
      key_metrics: keyMetrics,
      highlights: [
        `총 수익 ${totalActualRevenue.toLocaleString()}원 달성 (예산 대비 ${revenueVariancePct >= 0 ? "+" : ""}${Math.round(revenueVariancePct)}%)`,
        topPerformers.length > 0 ? `우수 카테고리: ${topPerformers.join(", ")}` : "모든 카테고리 예산 범위 내",
        `비용 관리: ${expenseVariancePct <= 0 ? "예산 절감 성공" : "예산 초과 관리 필요"}`,
      ],
      concerns: [
        ...underperformers.length > 0 ? [`수익 부진 카테고리: ${underperformers.join(", ")}`] : [],
        ...expenseByCategory.filter(e => e.variance_pct > 15).map(e => `${e.category} 비용 초과 (+${e.variance_pct}%)`),
      ],
    },
    revenue_analysis: {
      total_budgeted: totalBudgetedRevenue,
      total_actual: totalActualRevenue,
      variance: Math.round(revenueVariance),
      variance_percentage: Math.round(revenueVariancePct * 10) / 10,
      by_category: revenueByCategory,
      top_performers: topPerformers,
      underperformers: underperformers,
    },
    expense_analysis: {
      total_budgeted: totalBudgetedExpense,
      total_actual: totalActualExpense,
      total_committed: totalCommitted,
      total_projected: totalProjectedExpense,
      variance: Math.round(expenseVariance),
      variance_percentage: Math.round(expenseVariancePct * 10) / 10,
      by_category: expenseByCategory,
      cost_efficiency_index: totalBudgetedExpense > 0
        ? Math.round((totalBudgetedExpense / totalActualExpense) * 100) / 100
        : 1,
    },
    profitability_analysis: {
      gross_profit: Math.round(grossProfit),
      gross_margin: Math.round(grossMargin * 10) / 10,
      net_profit: Math.round(netProfit),
      net_margin: Math.round(netMargin * 10) / 10,
      break_even_status: breakEvenStatus,
      roi: Math.round(roi * 10) / 10,
    },
    cash_flow_summary: {
      opening_balance: validated.financial_data.cash_position.opening_balance,
      total_inflows: validated.financial_data.cash_position.total_inflows,
      total_outflows: validated.financial_data.cash_position.total_outflows,
      net_cash_flow: validated.financial_data.cash_position.total_inflows - validated.financial_data.cash_position.total_outflows,
      closing_balance: validated.financial_data.cash_position.closing_balance,
      runway_days: validated.financial_data.cash_position.closing_balance > 0 && totalActualExpense > 0
        ? Math.round(validated.financial_data.cash_position.closing_balance / (totalActualExpense / 30))
        : 0,
    },
    comparative_analysis: validated.comparison_data ? {
      vs_previous_event: validated.comparison_data.previous_event ? {
        revenue_change_pct: Math.round(((totalActualRevenue - validated.comparison_data.previous_event.total_revenue) /
          validated.comparison_data.previous_event.total_revenue) * 100 * 10) / 10,
        expense_change_pct: Math.round(((totalActualExpense - validated.comparison_data.previous_event.total_expenses) /
          validated.comparison_data.previous_event.total_expenses) * 100 * 10) / 10,
        profit_change_pct: Math.round(((netProfit - validated.comparison_data.previous_event.net_result) /
          Math.abs(validated.comparison_data.previous_event.net_result || 1)) * 100 * 10) / 10,
        narrative: `전년 대비 수익 ${totalActualRevenue > validated.comparison_data.previous_event.total_revenue ? "증가" : "감소"}`,
      } : undefined,
      vs_benchmark: validated.comparison_data.industry_benchmark ? {
        profit_margin_vs_benchmark: Math.round((netMargin - validated.comparison_data.industry_benchmark.profit_margin) * 10) / 10,
        expense_ratio_vs_benchmark: Math.round(((totalActualExpense / totalActualRevenue * 100) -
          validated.comparison_data.industry_benchmark.expense_ratio) * 10) / 10,
        narrative: netMargin >= validated.comparison_data.industry_benchmark.profit_margin
          ? "업계 평균 이상의 수익성 달성"
          : "업계 평균 대비 수익성 개선 필요",
      } : undefined,
    } : undefined,
    recommendations: recommendations.length > 0 ? recommendations : [
      {
        category: "일반",
        recommendation: "현재 재무 성과 양호, 현행 전략 유지",
        priority: "low" as const,
        expected_impact: "안정적 재무 성과 지속",
      },
    ],
    appendices: [
      { title: "상세 거래 내역", description: "모든 수입/지출 거래의 상세 목록" },
      { title: "예산 vs 실적 상세 비교", description: "각 항목별 예산 대비 실적 분석" },
      { title: "현금 흐름표", description: "기간별 현금 유입/유출 상세" },
      { title: "채권/채무 현황", description: "미수금 및 미지급금 상세 목록" },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-068",
  taskName: "재무 보고",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 9.2.e",
  skill: "Skill 9: Manage Monetary Transactions",
  subSkill: "9.2: Manage Monetary Transactions Process",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
