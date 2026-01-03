/**
 * FIN-039: 예산 승인 프로세스
 *
 * CMP-IS Reference: 8.1.i
 * Task Type: Human
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Budget Approval Process.
CMP-IS Standard: 8.1.i - Managing budget approval workflows (Human task with AI support).`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  budget_id: z.string().uuid(),
  budget_summary: z.object({
    total_budget: z.number(),
    total_revenue: z.number(),
    net_position: z.number(),
    major_categories: z.array(z.object({
      category: z.string(),
      amount: z.number(),
    })),
  }),
  organization_structure: z.object({
    approval_levels: z.number().int().default(3),
    budget_owner: z.string(),
    finance_contact: z.string(),
    executive_sponsor: z.string().optional(),
  }),
  previous_approvals: z.array(z.object({
    approver: z.string(),
    status: z.enum(["approved", "rejected", "pending"]),
    date: z.string().optional(),
    comments: z.string().optional(),
  })).optional(),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  approval_id: z.string().uuid(),
  event_id: z.string().uuid(),
  approval_workflow: z.object({
    current_status: z.string(),
    next_approver: z.string(),
    approval_chain: z.array(z.object({
      level: z.number().int(),
      approver_role: z.string(),
      approver_name: z.string(),
      status: z.enum(["pending", "approved", "rejected", "skipped"]),
      due_date: z.string(),
    })),
  }),
  approval_package: z.object({
    executive_summary: z.string(),
    key_metrics: z.array(z.object({
      metric: z.string(),
      value: z.string(),
    })),
    risk_highlights: z.array(z.string()),
    comparison_to_previous: z.string().optional(),
  }),
  required_documents: z.array(z.object({
    document: z.string(),
    status: z.enum(["attached", "pending", "not_required"]),
  })),
  escalation_rules: z.array(z.string()),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const approvalChain: Array<{
    level: number;
    approver_role: string;
    approver_name: string;
    status: "pending" | "approved" | "rejected" | "skipped";
    due_date: string;
  }> = [
    {
      level: 1,
      approver_role: "예산 담당자",
      approver_name: validated.organization_structure.budget_owner,
      status: "pending",
      due_date: "D-60",
    },
    {
      level: 2,
      approver_role: "재무팀",
      approver_name: validated.organization_structure.finance_contact,
      status: "pending",
      due_date: "D-55",
    },
    {
      level: 3,
      approver_role: "경영진",
      approver_name: validated.organization_structure.executive_sponsor || "CEO/CFO",
      status: "pending",
      due_date: "D-50",
    },
  ];

  // Update with previous approvals
  validated.previous_approvals?.forEach(prev => {
    const matching = approvalChain.find(a => a.approver_name === prev.approver);
    if (matching) {
      matching.status = prev.status;
    }
  });

  const nextPending = approvalChain.find(a => a.status === "pending");
  const currentStatus = nextPending
    ? `Level ${nextPending.level} 승인 대기`
    : approvalChain.every(a => a.status === "approved")
      ? "최종 승인 완료"
      : "반려됨";

  const netPosition = validated.budget_summary.net_position;
  const roi = ((validated.budget_summary.total_revenue - validated.budget_summary.total_budget) /
    validated.budget_summary.total_budget * 100).toFixed(1);

  const output: Output = {
    approval_id: generateUUID(),
    event_id: validated.event_id,
    approval_workflow: {
      current_status: currentStatus,
      next_approver: nextPending?.approver_name || "N/A",
      approval_chain: approvalChain,
    },
    approval_package: {
      executive_summary: `총 예산 ${validated.budget_summary.total_budget.toLocaleString()}원, 예상 수익 ${validated.budget_summary.total_revenue.toLocaleString()}원으로 ${netPosition >= 0 ? "흑자" : "적자"} ${Math.abs(netPosition).toLocaleString()}원 예상. 예상 ROI ${roi}%.`,
      key_metrics: [
        { metric: "총 예산", value: `${validated.budget_summary.total_budget.toLocaleString()}원` },
        { metric: "예상 수익", value: `${validated.budget_summary.total_revenue.toLocaleString()}원` },
        { metric: "순이익/손실", value: `${netPosition >= 0 ? "+" : ""}${netPosition.toLocaleString()}원` },
        { metric: "예상 ROI", value: `${roi}%` },
        { metric: "주요 비용 항목", value: validated.budget_summary.major_categories[0]?.category || "N/A" },
      ],
      risk_highlights: [
        "등록 수익 미달 시 손익분기점 미도달 가능",
        "스폰서십 확정 필요 (현재 pipeline)",
        "환율 변동 리스크 (해외 비용)",
      ],
      comparison_to_previous: "전년 대비 예산 5% 증가, 수익 목표 10% 상향",
    },
    required_documents: [
      { document: "상세 예산서", status: "attached" },
      { document: "수익 예측 보고서", status: "attached" },
      { document: "현금흐름 예측", status: "pending" },
      { document: "리스크 분석", status: "attached" },
      { document: "공급사 견적서", status: "pending" },
      { document: "스폰서십 LOI", status: "pending" },
    ],
    escalation_rules: [
      "3영업일 내 미승인 시 자동 리마인더",
      "5영업일 초과 시 상위 레벨 에스컬레이션",
      "반려 시 3영업일 내 수정안 제출 필요",
      "긴급 건은 병렬 승인 가능 (사후 문서화)",
    ],
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-039",
  taskName: "예산 승인 프로세스",
  taskType: "Human" as const,
  cmpReference: "CMP-IS 8.1.i",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.1: Develop Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
