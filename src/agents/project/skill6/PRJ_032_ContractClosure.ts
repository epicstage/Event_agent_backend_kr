/**
 * PRJ-032: 계약 종결
 * CMP-IS Reference: 6.3.b - Closing contracts
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Contract Closure Agent for event projects.
CMP-IS Standard: 6.3.b - Closing contracts`;

export const InputSchema = z.object({
  event_id: z.string(),
  contracts: z.array(z.object({
    contract_id: z.string(),
    vendor_name: z.string(),
    contract_type: z.enum(["venue", "catering", "av", "decoration", "staffing", "other"]),
    contract_value: z.number(),
    start_date: z.string(),
    end_date: z.string(),
    deliverables: z.array(z.string()),
    payment_terms: z.string(),
    outstanding_amount: z.number().optional(),
  })),
  currency: z.string().default("KRW"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  report_id: z.string(),
  event_id: z.string(),
  closure_summary: z.object({
    total_contracts: z.number(),
    total_value: z.number(),
    currency: z.string(),
    ready_to_close: z.number(),
    pending_issues: z.number(),
  }),
  contract_closures: z.array(z.object({
    contract_id: z.string(),
    vendor_name: z.string(),
    contract_value: z.number(),
    status: z.enum(["ready_to_close", "pending_deliverables", "pending_payment", "disputed"]),
    deliverables_status: z.object({
      total: z.number(),
      completed: z.number(),
      pending: z.array(z.string()),
    }),
    financial_status: z.object({
      total_paid: z.number(),
      outstanding: z.number(),
      final_payment_due: z.string(),
    }),
    closure_checklist: z.array(z.object({
      item: z.string(),
      status: z.enum(["completed", "pending", "not_applicable"]),
    })),
    issues: z.array(z.string()),
  })),
  final_payments: z.array(z.object({
    vendor: z.string(),
    amount: z.number(),
    due_date: z.string(),
    payment_status: z.enum(["scheduled", "processed", "pending_approval"]),
  })),
  documentation_required: z.array(z.object({
    document: z.string(),
    responsible: z.string(),
    deadline: z.string(),
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

function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const { contracts, currency } = validatedInput;

  const totalValue = contracts.reduce((sum, c) => sum + c.contract_value, 0);

  const contractClosures = contracts.map(contract => {
    const outstanding = contract.outstanding_amount || 0;
    const deliveredCount = Math.floor(contract.deliverables.length * 0.9); // 가정: 90% 완료
    const pendingDeliverables = contract.deliverables.slice(deliveredCount);

    const status = outstanding > 0 ? "pending_payment" as const :
      pendingDeliverables.length > 0 ? "pending_deliverables" as const : "ready_to_close" as const;

    return {
      contract_id: contract.contract_id,
      vendor_name: contract.vendor_name,
      contract_value: contract.contract_value,
      status,
      deliverables_status: {
        total: contract.deliverables.length,
        completed: deliveredCount,
        pending: pendingDeliverables,
      },
      financial_status: {
        total_paid: contract.contract_value - outstanding,
        outstanding,
        final_payment_due: addDays(14),
      },
      closure_checklist: [
        { item: "모든 산출물 수령", status: pendingDeliverables.length === 0 ? "completed" as const : "pending" as const },
        { item: "품질 검수 완료", status: "pending" as const },
        { item: "최종 정산", status: outstanding > 0 ? "pending" as const : "completed" as const },
        { item: "벤더 평가 완료", status: "pending" as const },
        { item: "종료 확인서 수령", status: "pending" as const },
      ],
      issues: outstanding > 0 ? [`미지급금 ${outstanding.toLocaleString()} ${currency}`] : [],
    };
  });

  const readyToClose = contractClosures.filter(c => c.status === "ready_to_close").length;
  const pendingIssues = contractClosures.filter(c => c.status !== "ready_to_close").length;

  const finalPayments = contracts
    .filter(c => (c.outstanding_amount || 0) > 0)
    .map(c => ({
      vendor: c.vendor_name,
      amount: c.outstanding_amount || 0,
      due_date: addDays(14),
      payment_status: "pending_approval" as const,
    }));

  return {
    report_id: generateUUID(),
    event_id: validatedInput.event_id,
    closure_summary: {
      total_contracts: contracts.length,
      total_value: totalValue,
      currency,
      ready_to_close: readyToClose,
      pending_issues: pendingIssues,
    },
    contract_closures: contractClosures,
    final_payments: finalPayments,
    documentation_required: [
      { document: "계약 종료 확인서", responsible: "Procurement", deadline: addDays(7) },
      { document: "벤더 성과 평가서", responsible: "PM", deadline: addDays(14) },
      { document: "최종 정산서", responsible: "Finance", deadline: addDays(21) },
      { document: "보증 기간 안내서", responsible: "Procurement", deadline: addDays(7) },
    ],
    recommendations: [
      pendingIssues > 0 ? `${pendingIssues}개 계약 이슈 해결 필요` : "모든 계약 종료 준비 완료",
      "벤더 평가를 통한 향후 계약 참고",
      "보증 기간 및 A/S 조건 확인",
      "계약 관련 문서 보관 (법적 요건 충족)",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-032",
  taskName: "계약 종결",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.3.b",
  skill: "Skill 6: Manage Project",
  subSkill: "6.3: Close Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
