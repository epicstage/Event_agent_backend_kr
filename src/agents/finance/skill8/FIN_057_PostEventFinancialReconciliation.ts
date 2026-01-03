/**
 * FIN-057: 이벤트 후 재무 정산
 *
 * CMP-IS Reference: 8.3.g
 * Task Type: Hybrid
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Post-Event Financial Reconciliation.
CMP-IS Standard: 8.3.g - Reconciling finances after event completion.`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  original_budget: z.number(),
  final_expenses: z.array(z.object({
    category_code: z.string(),
    category_name: z.string(),
    budgeted: z.number(),
    actual: z.number(),
    invoices_received: z.number(),
    invoices_paid: z.number(),
  })),
  final_revenue: z.array(z.object({
    source: z.string(),
    projected: z.number(),
    actual: z.number(),
    collected: z.number(),
    outstanding: z.number(),
  })),
  pending_items: z.array(z.object({
    description: z.string(),
    type: z.enum(["expense", "revenue"]),
    estimated_amount: z.number(),
    expected_resolution: z.string(),
  })).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  reconciliation_id: z.string().uuid(),
  event_id: z.string().uuid(),
  financial_summary: z.object({
    total_budget: z.number(),
    total_actual_expense: z.number(),
    total_revenue: z.number(),
    net_result: z.number(),
    roi: z.number(),
    variance_summary: z.object({
      expense_variance: z.number(),
      expense_variance_pct: z.number(),
      revenue_variance: z.number(),
      revenue_variance_pct: z.number(),
    }),
  }),
  expense_reconciliation: z.array(z.object({
    category: z.string(),
    budgeted: z.number(),
    actual: z.number(),
    variance: z.number(),
    variance_pct: z.number(),
    status: z.enum(["reconciled", "pending_invoice", "in_dispute"]),
    notes: z.string().optional(),
  })),
  revenue_reconciliation: z.array(z.object({
    source: z.string(),
    projected: z.number(),
    actual: z.number(),
    collected: z.number(),
    outstanding: z.number(),
    collection_status: z.enum(["fully_collected", "partially_collected", "outstanding"]),
  })),
  outstanding_items: z.object({
    pending_payments: z.array(z.object({
      vendor: z.string(),
      amount: z.number(),
      due_date: z.string(),
    })),
    pending_collections: z.array(z.object({
      source: z.string(),
      amount: z.number(),
      follow_up_action: z.string(),
    })),
  }),
  lessons_learned_financial: z.array(z.object({
    area: z.string(),
    observation: z.string(),
    recommendation: z.string(),
  })),
  close_out_checklist: z.array(z.object({
    item: z.string(),
    status: z.enum(["complete", "in_progress", "pending"]),
    responsible: z.string(),
    deadline: z.string(),
  })),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const totalActualExpense = validated.final_expenses.reduce((sum, e) => sum + e.actual, 0);
  const totalBudgeted = validated.final_expenses.reduce((sum, e) => sum + e.budgeted, 0);
  const totalRevenue = validated.final_revenue.reduce((sum, r) => sum + r.actual, 0);
  const totalProjectedRevenue = validated.final_revenue.reduce((sum, r) => sum + r.projected, 0);
  const netResult = totalRevenue - totalActualExpense;
  const roi = totalActualExpense > 0 ? ((netResult / totalActualExpense) * 100) : 0;

  const expenseRecon = validated.final_expenses.map(e => {
    const variance = e.actual - e.budgeted;
    const variancePct = e.budgeted > 0 ? (variance / e.budgeted) * 100 : 0;
    const status = e.invoices_received === e.invoices_paid ? "reconciled" :
      e.invoices_received > e.invoices_paid ? "pending_invoice" : "reconciled";

    return {
      category: e.category_name,
      budgeted: e.budgeted,
      actual: e.actual,
      variance: Math.round(variance),
      variance_pct: Math.round(variancePct * 10) / 10,
      status,
      notes: status === "pending_invoice" ? `${e.invoices_received - e.invoices_paid}건 인보이스 미결제` : undefined,
    } as const;
  });

  const revenueRecon = validated.final_revenue.map(r => ({
    source: r.source,
    projected: r.projected,
    actual: r.actual,
    collected: r.collected,
    outstanding: r.outstanding,
    collection_status: r.outstanding === 0 ? "fully_collected" :
      r.collected > 0 ? "partially_collected" : "outstanding",
  }) as const);

  const pendingPayments = validated.final_expenses
    .filter(e => e.invoices_received > e.invoices_paid)
    .map(e => ({
      vendor: e.category_name,
      amount: e.actual - (e.actual * (e.invoices_paid / e.invoices_received)),
      due_date: "D+30",
    }));

  const pendingCollections = validated.final_revenue
    .filter(r => r.outstanding > 0)
    .map(r => ({
      source: r.source,
      amount: r.outstanding,
      follow_up_action: "청구서 재발송 및 담당자 연락",
    }));

  const output: Output = {
    reconciliation_id: generateUUID(),
    event_id: validated.event_id,
    financial_summary: {
      total_budget: validated.original_budget,
      total_actual_expense: totalActualExpense,
      total_revenue: totalRevenue,
      net_result: Math.round(netResult),
      roi: Math.round(roi * 10) / 10,
      variance_summary: {
        expense_variance: Math.round(totalActualExpense - totalBudgeted),
        expense_variance_pct: Math.round(((totalActualExpense - totalBudgeted) / totalBudgeted) * 100 * 10) / 10,
        revenue_variance: Math.round(totalRevenue - totalProjectedRevenue),
        revenue_variance_pct: Math.round(((totalRevenue - totalProjectedRevenue) / totalProjectedRevenue) * 100 * 10) / 10,
      },
    },
    expense_reconciliation: expenseRecon,
    revenue_reconciliation: revenueRecon,
    outstanding_items: {
      pending_payments: pendingPayments,
      pending_collections: pendingCollections,
    },
    lessons_learned_financial: [
      {
        area: "예산 정확도",
        observation: `최종 비용 예산 대비 ${Math.round(((totalActualExpense - totalBudgeted) / totalBudgeted) * 100)}% 차이`,
        recommendation: "주요 차이 항목에 대한 향후 예산 산정 방법 개선",
      },
      {
        area: "수익 예측",
        observation: `실제 수익 예측 대비 ${Math.round(((totalRevenue - totalProjectedRevenue) / totalProjectedRevenue) * 100)}% 차이`,
        recommendation: "등록 전환율 및 스폰서십 확보율 데이터 축적",
      },
      {
        area: "현금 관리",
        observation: pendingPayments.length > 0 ? "일부 결제 지연" : "적시 결제 완료",
        recommendation: "공급사 결제 일정 자동화 검토",
      },
    ],
    close_out_checklist: [
      { item: "모든 인보이스 수령 확인", status: "in_progress", responsible: "재무팀", deadline: "D+14" },
      { item: "미결제 인보이스 처리", status: "pending", responsible: "재무팀", deadline: "D+30" },
      { item: "미수금 회수", status: "pending", responsible: "영업팀", deadline: "D+45" },
      { item: "최종 재무 보고서 작성", status: "pending", responsible: "재무팀", deadline: "D+30" },
      { item: "감사 자료 정리", status: "pending", responsible: "재무팀", deadline: "D+60" },
      { item: "교훈 문서화 및 공유", status: "pending", responsible: "PM", deadline: "D+30" },
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-057",
  taskName: "이벤트 후 재무 정산",
  taskType: "Hybrid" as const,
  cmpReference: "CMP-IS 8.3.g",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.3: Monitor and Revise Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
