/**
 * PRJ-037: 이해관계자 승인
 * CMP-IS Reference: 6.3.g - Obtaining stakeholder sign-off
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Stakeholder Sign-off Agent for event projects.
CMP-IS Standard: 6.3.g - Obtaining stakeholder sign-off`;

export const InputSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  stakeholders: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    signoff_required: z.boolean(),
    contact_email: z.string().optional(),
  })),
  deliverables: z.array(z.object({
    deliverable_id: z.string(),
    name: z.string(),
    status: z.enum(["completed", "pending", "partial"]),
    acceptance_criteria: z.array(z.string()),
  })),
  project_summary: z.object({
    objectives_met: z.boolean(),
    budget_status: z.enum(["under", "on", "over"]),
    schedule_status: z.enum(["early", "on_time", "late"]),
  }),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  signoff_id: z.string(),
  event_id: z.string(),
  signoff_summary: z.object({
    event_name: z.string(),
    request_date: z.string(),
    total_stakeholders: z.number(),
    signoff_required: z.number(),
    signed: z.number(),
    pending: z.number(),
  }),
  signoff_requests: z.array(z.object({
    stakeholder_id: z.string(),
    stakeholder_name: z.string(),
    role: z.string(),
    signoff_status: z.enum(["approved", "pending", "rejected", "not_required"]),
    requested_date: z.string(),
    response_date: z.string().optional(),
    comments: z.string().optional(),
  })),
  deliverable_acceptance: z.array(z.object({
    deliverable_id: z.string(),
    deliverable_name: z.string(),
    acceptance_status: z.enum(["accepted", "conditionally_accepted", "rejected", "pending"]),
    criteria_met: z.number(),
    criteria_total: z.number(),
    signoff_by: z.array(z.string()),
  })),
  project_closure_checklist: z.array(z.object({
    item: z.string(),
    status: z.enum(["completed", "pending", "not_applicable"]),
    evidence: z.string(),
  })),
  formal_closure_document: z.object({
    document_type: z.string(),
    prepared_by: z.string(),
    prepared_date: z.string(),
    approval_chain: z.array(z.object({
      approver: z.string(),
      role: z.string(),
      status: z.enum(["approved", "pending"]),
    })),
  }),
  next_steps: z.array(z.string()),
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
  const { stakeholders, deliverables, project_summary } = validatedInput;
  const today = new Date().toISOString().split("T")[0];

  const requiredSignoffs = stakeholders.filter(s => s.signoff_required);

  // 승인 요청
  const signoffRequests = stakeholders.map(sh => ({
    stakeholder_id: sh.id,
    stakeholder_name: sh.name,
    role: sh.role,
    signoff_status: sh.signoff_required ? "pending" as const : "not_required" as const,
    requested_date: today,
    response_date: undefined,
    comments: undefined,
  }));

  // 산출물 수락
  const deliverableAcceptance = deliverables.map(del => {
    const criteriaTotal = del.acceptance_criteria.length;
    const criteriaMet = del.status === "completed" ? criteriaTotal :
      del.status === "partial" ? Math.floor(criteriaTotal * 0.7) : 0;

    return {
      deliverable_id: del.deliverable_id,
      deliverable_name: del.name,
      acceptance_status: criteriaMet === criteriaTotal ? "accepted" as const :
        criteriaMet >= criteriaTotal * 0.8 ? "conditionally_accepted" as const :
        criteriaMet > 0 ? "pending" as const : "rejected" as const,
      criteria_met: criteriaMet,
      criteria_total: criteriaTotal,
      signoff_by: requiredSignoffs.slice(0, 2).map(s => s.name),
    };
  });

  return {
    signoff_id: generateUUID(),
    event_id: validatedInput.event_id,
    signoff_summary: {
      event_name: validatedInput.event_name,
      request_date: today,
      total_stakeholders: stakeholders.length,
      signoff_required: requiredSignoffs.length,
      signed: 0,
      pending: requiredSignoffs.length,
    },
    signoff_requests: signoffRequests,
    deliverable_acceptance: deliverableAcceptance,
    project_closure_checklist: [
      { item: "모든 산출물 제출 완료", status: "completed", evidence: "산출물 목록 확인" },
      { item: "최종 보고서 작성", status: "completed", evidence: "보고서 첨부" },
      { item: "재무 정산 완료", status: "pending", evidence: "정산서 대기 중" },
      { item: "계약 종결 완료", status: "pending", evidence: "벤더 확인 대기" },
      { item: "교훈 문서화", status: "completed", evidence: "교훈 보고서" },
    ],
    formal_closure_document: {
      document_type: "프로젝트 종료 확인서",
      prepared_by: "PM",
      prepared_date: today,
      approval_chain: requiredSignoffs.map(s => ({
        approver: s.name,
        role: s.role,
        status: "pending" as const,
      })),
    },
    next_steps: [
      "이해관계자별 승인 요청 이메일 발송",
      "미결 사항 해결 후 재요청",
      "서명 완료 시 공식 종료 선언",
      "프로젝트 종료 공지",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-037",
  taskName: "이해관계자 승인",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.3.g",
  skill: "Skill 6: Manage Project",
  subSkill: "6.3: Close Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
