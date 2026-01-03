/**
 * PRJ-028: 의사결정 기록
 * CMP-IS Reference: 6.2.d - Documenting decisions
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Decision Documentation Agent for event projects.
CMP-IS Standard: 6.2.d - Documenting decisions`;

export const InputSchema = z.object({
  event_id: z.string(),
  decision: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(["scope", "schedule", "budget", "resource", "vendor", "technical", "other"]),
    urgency: z.enum(["immediate", "this_week", "this_month", "no_rush"]),
    options: z.array(z.object({
      option: z.string(),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
    })),
    selected_option: z.string(),
    rationale: z.string(),
    decision_maker: z.string(),
    stakeholders_consulted: z.array(z.string()).optional(),
  }),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  decision_id: z.string(),
  event_id: z.string(),
  decision_record: z.object({
    title: z.string(),
    category: z.string(),
    status: z.enum(["draft", "pending_approval", "approved", "implemented", "reversed"]),
    decision_date: z.string(),
    effective_date: z.string(),
  }),
  context: z.object({
    background: z.string(),
    problem_statement: z.string(),
    constraints: z.array(z.string()),
    assumptions: z.array(z.string()),
  }),
  options_analysis: z.array(z.object({
    option_id: z.string(),
    option: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    feasibility_score: z.number(),
    risk_level: z.enum(["low", "medium", "high"]),
  })),
  decision_outcome: z.object({
    selected_option: z.string(),
    rationale: z.string(),
    expected_impact: z.string(),
    success_criteria: z.array(z.string()),
  }),
  governance: z.object({
    decision_maker: z.string(),
    stakeholders_consulted: z.array(z.string()),
    approval_required: z.boolean(),
    approvers: z.array(z.string()),
  }),
  implementation: z.object({
    action_items: z.array(z.object({
      action: z.string(),
      owner: z.string(),
      deadline: z.string(),
    })),
    communication_plan: z.string(),
    review_date: z.string(),
  }),
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
  const { decision } = validatedInput;
  const today = new Date().toISOString().split("T")[0];

  const optionsAnalysis = decision.options.map((opt, idx) => ({
    option_id: `OPT-${String(idx + 1).padStart(2, "0")}`,
    option: opt.option,
    pros: opt.pros,
    cons: opt.cons,
    feasibility_score: opt.option === decision.selected_option ? 85 : 60 + (idx * 5),
    risk_level: opt.cons.length > 2 ? "high" as const : opt.cons.length > 0 ? "medium" as const : "low" as const,
  }));

  const needsApproval = decision.category === "budget" || decision.category === "scope" || decision.urgency === "immediate";

  return {
    decision_id: generateUUID(),
    event_id: validatedInput.event_id,
    decision_record: {
      title: decision.title,
      category: decision.category,
      status: needsApproval ? "pending_approval" : "approved",
      decision_date: today,
      effective_date: decision.urgency === "immediate" ? today : addDays(3),
    },
    context: {
      background: decision.description,
      problem_statement: `${decision.title}에 대한 의사결정 필요`,
      constraints: ["예산 제약", "일정 제약", "자원 제약"],
      assumptions: ["현재 계획대로 진행", "이해관계자 협조"],
    },
    options_analysis: optionsAnalysis,
    decision_outcome: {
      selected_option: decision.selected_option,
      rationale: decision.rationale,
      expected_impact: "프로젝트 목표 달성에 긍정적 영향",
      success_criteria: [
        "계획된 일정 내 구현",
        "추가 비용 발생 없음",
        "이해관계자 수용",
      ],
    },
    governance: {
      decision_maker: decision.decision_maker,
      stakeholders_consulted: decision.stakeholders_consulted || [],
      approval_required: needsApproval,
      approvers: needsApproval ? ["PM", "이벤트 오너"] : [],
    },
    implementation: {
      action_items: [
        {
          action: "결정 사항 이해관계자 공유",
          owner: decision.decision_maker,
          deadline: addDays(1),
        },
        {
          action: "실행 계획 수립",
          owner: "PM",
          deadline: addDays(3),
        },
        {
          action: "결과 모니터링",
          owner: "PM",
          deadline: addDays(14),
        },
      ],
      communication_plan: "이메일 + 팀 미팅에서 공유",
      review_date: addDays(14),
    },
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-028",
  taskName: "의사결정 기록",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.2.d",
  skill: "Skill 6: Manage Project",
  subSkill: "6.2: Coordinate Project Team",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
