/**
 * PRJ-038: 재무 마감
 * CMP-IS Reference: 6.3.h - Completing financial closure
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Financial Closure Agent for event projects.
CMP-IS Standard: 6.3.h - Completing financial closure`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  budget_data: z.object({
    original_budget: z.number(),
    approved_changes: z.number(),
    final_budget: z.number(),
    currency: z.string().default("KRW"),
  }),
  expenditure_summary: z.array(z.object({
    category: z.string(),
    budgeted: z.number(),
    actual: z.number(),
    committed: z.number(),
  })),
  revenue_data: z.object({
    registration_revenue: z.number(),
    sponsorship_revenue: z.number(),
    other_revenue: z.number(),
  }).optional(),
  pending_items: z.array(z.object({
    item: z.string(),
    amount: z.number(),
    type: z.enum(["receivable", "payable"]),
    due_date: z.string(),
    vendor_or_source: z.string(),
  })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  closure_id: z.string(),
  event_id: z.string(),
  financial_summary: z.object({
    event_name: z.string(),
    closure_date: z.string(),
    final_budget: z.number(),
    total_spent: z.number(),
    total_revenue: z.number(),
    net_result: z.number(),
    currency: z.string(),
    status: z.enum(["surplus", "balanced", "deficit"]),
  }),
  budget_variance_analysis: z.array(z.object({
    category: z.string(),
    budgeted: z.number(),
    actual: z.number(),
    variance: z.number(),
    variance_percentage: z.number(),
    explanation: z.string(),
  })),
  revenue_breakdown: z.object({
    registration: z.number(),
    sponsorship: z.number(),
    other: z.number(),
    total: z.number(),
  }),
  outstanding_items: z.object({
    receivables: z.array(z.object({
      item: z.string(),
      amount: z.number(),
      source: z.string(),
      due_date: z.string(),
      action: z.string(),
    })),
    payables: z.array(z.object({
      item: z.string(),
      amount: z.number(),
      vendor: z.string(),
      due_date: z.string(),
      action: z.string(),
    })),
    total_receivables: z.number(),
    total_payables: z.number(),
  }),
  closure_checklist: z.array(z.object({
    task: z.string(),
    status: z.enum(["completed", "in_progress", "pending"]),
    responsible: z.string(),
    notes: z.string(),
  })),
  financial_lessons: z.array(z.string()),
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
  const { budget_data, expenditure_summary, revenue_data, pending_items } = validatedInput;
  const today = new Date().toISOString().split("T")[0];

  // 총 지출
  const totalSpent = expenditure_summary.reduce((sum, e) => sum + e.actual, 0);
  const totalBudgeted = expenditure_summary.reduce((sum, e) => sum + e.budgeted, 0);

  // 총 수입
  const totalRevenue = revenue_data
    ? revenue_data.registration_revenue + revenue_data.sponsorship_revenue + revenue_data.other_revenue
    : 0;

  const netResult = totalRevenue - totalSpent;
  const status = netResult > 0 ? "surplus" : netResult < 0 ? "deficit" : "balanced";

  // 예산 편차 분석
  const budgetVarianceAnalysis = expenditure_summary.map(exp => {
    const variance = exp.actual - exp.budgeted;
    const variancePct = exp.budgeted > 0 ? (variance / exp.budgeted) * 100 : 0;

    return {
      category: exp.category,
      budgeted: exp.budgeted,
      actual: exp.actual,
      variance,
      variance_percentage: Math.round(variancePct * 10) / 10,
      explanation: variance > 0
        ? "예산 초과 - 추가 비용 발생"
        : variance < 0
        ? "예산 절감 - 효율적 집행"
        : "계획대로 집행",
    };
  });

  // 미결 항목
  const receivables = (pending_items || []).filter(i => i.type === "receivable");
  const payables = (pending_items || []).filter(i => i.type === "payable");

  return {
    closure_id: generateUUID(),
    event_id: validatedInput.event_id,
    financial_summary: {
      event_name: validatedInput.event_name,
      closure_date: today,
      final_budget: budget_data.final_budget,
      total_spent: totalSpent,
      total_revenue: totalRevenue,
      net_result: netResult,
      currency: budget_data.currency,
      status,
    },
    budget_variance_analysis: budgetVarianceAnalysis,
    revenue_breakdown: {
      registration: revenue_data?.registration_revenue || 0,
      sponsorship: revenue_data?.sponsorship_revenue || 0,
      other: revenue_data?.other_revenue || 0,
      total: totalRevenue,
    },
    outstanding_items: {
      receivables: receivables.map(r => ({
        item: r.item,
        amount: r.amount,
        source: r.vendor_or_source,
        due_date: r.due_date,
        action: "청구서 발송 및 추적",
      })),
      payables: payables.map(p => ({
        item: p.item,
        amount: p.amount,
        vendor: p.vendor_or_source,
        due_date: p.due_date,
        action: "지급 승인 요청",
      })),
      total_receivables: receivables.reduce((sum, r) => sum + r.amount, 0),
      total_payables: payables.reduce((sum, p) => sum + p.amount, 0),
    },
    closure_checklist: [
      { task: "모든 영수증/증빙 수집", status: "completed", responsible: "Finance", notes: "완료" },
      { task: "벤더 최종 정산", status: "in_progress", responsible: "Procurement", notes: "진행 중" },
      { task: "스폰서 정산서 발송", status: "pending", responsible: "Sponsorship", notes: "대기" },
      { task: "예산 편차 분석 완료", status: "completed", responsible: "Finance", notes: "완료" },
      { task: "재무 보고서 작성", status: "in_progress", responsible: "Finance", notes: "진행 중" },
      { task: "경영진 보고", status: "pending", responsible: "PM", notes: "예정" },
    ],
    financial_lessons: [
      status === "surplus" ? "효율적인 예산 관리로 절감 달성" : "예산 초과 원인 분석 필요",
      "조기 예산 확정이 협상력 향상에 도움",
      "예비비 활용은 승인 프로세스 준수",
      budgetVarianceAnalysis.filter(v => Math.abs(v.variance_percentage) > 20).length > 0
        ? "일부 항목 예산 정확도 개선 필요"
        : "전반적으로 예산 예측 정확",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-038",
  taskName: "재무 마감",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.3.h",
  skill: "Skill 6: Manage Project",
  subSkill: "6.3: Close Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
