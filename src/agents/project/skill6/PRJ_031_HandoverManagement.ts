/**
 * PRJ-031: 인수인계 관리
 * CMP-IS Reference: 6.3.a - Managing handovers
 * Task Type: AI
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Handover Management Agent for event projects.
CMP-IS Standard: 6.3.a - Managing handovers`;

export const InputSchema = z.object({
  event_id: z.string(),
  handover_type: z.enum(["role_change", "phase_transition", "project_closure", "team_change"]),
  from_party: z.object({
    name: z.string(),
    role: z.string(),
    contact: z.string().optional(),
  }),
  to_party: z.object({
    name: z.string(),
    role: z.string(),
    contact: z.string().optional(),
  }),
  handover_items: z.array(z.object({
    item: z.string(),
    category: z.enum(["document", "access", "relationship", "task", "knowledge"]),
    priority: z.enum(["critical", "high", "medium", "low"]),
  })),
  deadline: z.string(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  handover_id: z.string(),
  event_id: z.string(),
  handover_summary: z.object({
    type: z.string(),
    from: z.string(),
    to: z.string(),
    deadline: z.string(),
    status: z.enum(["planning", "in_progress", "completed", "verified"]),
  }),
  handover_checklist: z.array(z.object({
    item_id: z.string(),
    item: z.string(),
    category: z.string(),
    priority: z.string(),
    status: z.enum(["pending", "transferred", "verified"]),
    notes: z.string(),
  })),
  knowledge_transfer_plan: z.array(z.object({
    topic: z.string(),
    method: z.enum(["document", "meeting", "shadowing", "workshop"]),
    duration: z.string(),
    scheduled_date: z.string(),
  })),
  access_transfer: z.array(z.object({
    system: z.string(),
    current_owner: z.string(),
    new_owner: z.string(),
    transfer_date: z.string(),
  })),
  risk_mitigation: z.array(z.object({
    risk: z.string(),
    mitigation: z.string(),
    owner: z.string(),
  })),
  verification_criteria: z.array(z.string()),
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

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);
  const { from_party, to_party, handover_items, deadline, handover_type } = validatedInput;

  // 체크리스트 생성
  const handoverChecklist = handover_items.map((item, idx) => ({
    item_id: `HO-${String(idx + 1).padStart(3, "0")}`,
    item: item.item,
    category: item.category,
    priority: item.priority,
    status: "pending" as const,
    notes: item.priority === "critical" ? "우선 처리 필요" : "",
  }));

  // 지식 전달 계획
  const knowledgeItems = handover_items.filter(i => i.category === "knowledge" || i.category === "task");
  const knowledgeTransferPlan = knowledgeItems.length > 0
    ? knowledgeItems.map((item, idx) => ({
        topic: item.item,
        method: item.priority === "critical" ? "shadowing" as const : "meeting" as const,
        duration: item.priority === "critical" ? "4시간" : "1시간",
        scheduled_date: addDays(deadline, -7 + idx),
      }))
    : [{
        topic: "전체 업무 개요",
        method: "meeting" as const,
        duration: "2시간",
        scheduled_date: addDays(deadline, -5),
      }];

  // 접근 권한 이전
  const accessItems = handover_items.filter(i => i.category === "access");
  const accessTransfer = accessItems.map(item => ({
    system: item.item,
    current_owner: from_party.name,
    new_owner: to_party.name,
    transfer_date: addDays(deadline, -2),
  }));

  return {
    handover_id: generateUUID(),
    event_id: validatedInput.event_id,
    handover_summary: {
      type: handover_type,
      from: `${from_party.name} (${from_party.role})`,
      to: `${to_party.name} (${to_party.role})`,
      deadline,
      status: "planning",
    },
    handover_checklist: handoverChecklist,
    knowledge_transfer_plan: knowledgeTransferPlan,
    access_transfer: accessTransfer.length > 0 ? accessTransfer : [
      {
        system: "프로젝트 관리 도구",
        current_owner: from_party.name,
        new_owner: to_party.name,
        transfer_date: addDays(deadline, -2),
      },
    ],
    risk_mitigation: [
      {
        risk: "지식 손실",
        mitigation: "상세 문서화 및 녹화",
        owner: from_party.name,
      },
      {
        risk: "업무 공백",
        mitigation: "중복 기간 운영 (3-5일)",
        owner: "PM",
      },
      {
        risk: "이해관계자 혼란",
        mitigation: "변경 사항 사전 공지",
        owner: "PM",
      },
    ],
    verification_criteria: [
      "모든 문서가 공유됨",
      "시스템 접근 권한 이전 완료",
      "핵심 이해관계자와 인사 완료",
      "진행 중 업무 상태 공유됨",
      "인수자가 독립 업무 수행 가능",
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRJ-031",
  taskName: "인수인계 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 6.3.a",
  skill: "Skill 6: Manage Project",
  subSkill: "6.3: Close Project",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
