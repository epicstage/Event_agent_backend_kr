/**
 * FIN-054: 예산 재배분
 *
 * CMP-IS Reference: 8.3.d
 * Task Type: Human
 */

import { z } from "zod";
import { CurrencyCode, generateUUID, nowISO } from "../../../schemas/financial";

export const AGENT_PERSONA = `You are an AI Assistant for Budget Reallocation.
CMP-IS Standard: 8.3.d - Managing budget reallocation decisions (Human task with AI support).`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  current_budget: z.array(z.object({
    category_code: z.string(),
    category_name: z.string(),
    original_budget: z.number(),
    current_allocation: z.number(),
    spent_to_date: z.number(),
    remaining: z.number(),
  })),
  reallocation_request: z.object({
    from_category: z.string(),
    to_category: z.string(),
    amount: z.number(),
    reason: z.string(),
    urgency: z.enum(["low", "medium", "high"]),
  }),
  authorization_level: z.enum(["team_lead", "director", "vp", "cfo"]),
  currency: CurrencyCode.default("USD"),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  reallocation_id: z.string().uuid(),
  event_id: z.string().uuid(),
  request_summary: z.object({
    from_category: z.string(),
    to_category: z.string(),
    amount: z.number(),
    reason: z.string(),
    requester_level: z.string(),
  }),
  feasibility_analysis: z.object({
    from_category_status: z.object({
      remaining_after: z.number(),
      committed_obligations: z.number(),
      is_feasible: z.boolean(),
      risk_level: z.enum(["low", "medium", "high"]),
    }),
    to_category_status: z.object({
      new_total: z.number(),
      justification_strength: z.enum(["weak", "moderate", "strong"]),
    }),
  }),
  impact_assessment: z.object({
    budget_impact: z.array(z.object({
      category: z.string(),
      before: z.number(),
      after: z.number(),
      change: z.number(),
    })),
    risk_considerations: z.array(z.string()),
    trade_offs: z.array(z.string()),
  }),
  approval_workflow: z.object({
    required_approver: z.string(),
    approval_threshold_met: z.boolean(),
    escalation_needed: z.boolean(),
    next_steps: z.array(z.string()),
  }),
  decision_support: z.object({
    recommendation: z.enum(["approve", "approve_with_conditions", "reject", "escalate"]),
    conditions: z.array(z.string()).optional(),
    alternative_options: z.array(z.string()),
  }),
  audit_trail: z.object({
    request_timestamp: z.string(),
    documentation_requirements: z.array(z.string()),
  }),
  generated_at: z.string(),
});

export type Output = z.infer<typeof OutputSchema>;

export async function execute(input: Input): Promise<Output> {
  const validated = InputSchema.parse(input);

  const fromCat = validated.current_budget.find(c => c.category_code === validated.reallocation_request.from_category);
  const toCat = validated.current_budget.find(c => c.category_code === validated.reallocation_request.to_category);

  const isFeasible = fromCat ? fromCat.remaining >= validated.reallocation_request.amount : false;
  const remainingAfter = fromCat ? fromCat.remaining - validated.reallocation_request.amount : 0;

  // Determine approval requirements based on amount
  const amount = validated.reallocation_request.amount;
  let requiredApprover = "팀장";
  let thresholdMet = true;

  if (amount > 10000) {
    requiredApprover = "CFO";
    thresholdMet = validated.authorization_level === "cfo";
  } else if (amount > 5000) {
    requiredApprover = "VP";
    thresholdMet = ["vp", "cfo"].includes(validated.authorization_level);
  } else if (amount > 2000) {
    requiredApprover = "디렉터";
    thresholdMet = ["director", "vp", "cfo"].includes(validated.authorization_level);
  }

  const recommendation = !isFeasible ? "reject" :
    !thresholdMet ? "escalate" :
      validated.reallocation_request.urgency === "high" ? "approve" : "approve_with_conditions";

  const output: Output = {
    reallocation_id: generateUUID(),
    event_id: validated.event_id,
    request_summary: {
      from_category: validated.reallocation_request.from_category,
      to_category: validated.reallocation_request.to_category,
      amount: validated.reallocation_request.amount,
      reason: validated.reallocation_request.reason,
      requester_level: validated.authorization_level,
    },
    feasibility_analysis: {
      from_category_status: {
        remaining_after: remainingAfter,
        committed_obligations: fromCat ? fromCat.spent_to_date : 0,
        is_feasible: isFeasible,
        risk_level: remainingAfter < 0 ? "high" : remainingAfter < fromCat?.remaining! * 0.2 ? "medium" : "low",
      },
      to_category_status: {
        new_total: toCat ? toCat.current_allocation + validated.reallocation_request.amount : 0,
        justification_strength: validated.reallocation_request.urgency === "high" ? "strong" : "moderate",
      },
    },
    impact_assessment: {
      budget_impact: [
        {
          category: validated.reallocation_request.from_category,
          before: fromCat?.current_allocation || 0,
          after: (fromCat?.current_allocation || 0) - validated.reallocation_request.amount,
          change: -validated.reallocation_request.amount,
        },
        {
          category: validated.reallocation_request.to_category,
          before: toCat?.current_allocation || 0,
          after: (toCat?.current_allocation || 0) + validated.reallocation_request.amount,
          change: validated.reallocation_request.amount,
        },
      ],
      risk_considerations: [
        isFeasible ? "출처 카테고리 여유분 충분" : "출처 카테고리 예산 부족 위험",
        "재배분 후 원래 계획 이행 가능 여부 확인 필요",
        "향후 추가 재배분 요청 가능성 고려",
      ],
      trade_offs: [
        `${validated.reallocation_request.from_category} 유연성 감소`,
        `${validated.reallocation_request.to_category} 실행력 강화`,
        "전체 예산 총액 불변",
      ],
    },
    approval_workflow: {
      required_approver: requiredApprover,
      approval_threshold_met: thresholdMet,
      escalation_needed: !thresholdMet,
      next_steps: thresholdMet
        ? ["승인 처리", "예산 시스템 업데이트", "관계자 통보"]
        : [`${requiredApprover} 승인 요청`, "승인 대기", "결과 통보"],
    },
    decision_support: {
      recommendation,
      conditions: recommendation === "approve_with_conditions"
        ? ["재배분 후 모니터링 강화", "추가 재배분 제한", "월간 검토"]
        : undefined,
      alternative_options: [
        "예비비에서 충당",
        "부분 금액만 재배분",
        "다른 카테고리에서 추가 확보",
        "해당 지출 축소 또는 연기",
      ],
    },
    audit_trail: {
      request_timestamp: nowISO(),
      documentation_requirements: [
        "재배분 사유서",
        "영향 분석 문서",
        "승인 이력",
        "예산 변경 로그",
      ],
    },
    generated_at: nowISO(),
  };

  return OutputSchema.parse(output);
}

export const AGENT_METADATA = {
  taskId: "FIN-054",
  taskName: "예산 재배분",
  taskType: "Human" as const,
  cmpReference: "CMP-IS 8.3.d",
  skill: "Skill 8: Develop and Manage Event Budget",
  subSkill: "8.3: Monitor and Revise Budget",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
