/**
 * PRO-008: 선물/접대 정책 관리
 * CMP-IS Reference: 19.8.a - Gift and hospitality policy management
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Gift and Hospitality Policy Specialist.`;

export const InputSchema = z.object({
  event_id: z.string(),
  policy_review_scope: z.enum(["full", "incoming", "outgoing"]).optional(),
  stakeholder_groups: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  policy_id: z.string(),
  event_id: z.string(),
  policy_summary: z.object({
    policy_version: z.string(),
    last_updated: z.string(),
    approval_threshold: z.number(),
    pre_approval_required_above: z.number(),
  }),
  gift_register: z.object({
    total_entries: z.number(),
    received: z.number(),
    given: z.number(),
    total_value_received: z.number(),
    total_value_given: z.number(),
    pending_approval: z.number(),
    declined: z.number(),
  }),
  recent_entries: z.array(z.object({
    entry_id: z.string(),
    direction: z.enum(["received", "given"]),
    description: z.string(),
    estimated_value: z.number(),
    giver_receiver: z.string(),
    purpose: z.string(),
    approval_status: z.enum(["approved", "pending", "declined"]),
    notes: z.string(),
  })),
  policy_guidelines: z.array(z.object({
    category: z.string(),
    threshold_amount: z.number(),
    approval_required: z.enum(["none", "manager", "compliance", "executive"]),
    restrictions: z.array(z.string()),
  })),
  compliance_alerts: z.array(z.object({
    alert_type: z.string(),
    description: z.string(),
    severity: z.enum(["info", "warning", "critical"]),
    action_required: z.string(),
  })),
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

  return {
    policy_id: generateUUID(),
    event_id: validatedInput.event_id,
    policy_summary: {
      policy_version: "2.1",
      last_updated: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      approval_threshold: 50000,
      pre_approval_required_above: 100000,
    },
    gift_register: {
      total_entries: 45,
      received: 28,
      given: 17,
      total_value_received: 2850000,
      total_value_given: 1950000,
      pending_approval: 3,
      declined: 2,
    },
    recent_entries: [
      {
        entry_id: "GFT-001",
        direction: "received",
        description: "베뉴 감사 와인 세트",
        estimated_value: 80000,
        giver_receiver: "호텔 A 총지배인",
        purpose: "이벤트 성공 축하",
        approval_status: "approved",
        notes: "팀 공유용으로 수령",
      },
      {
        entry_id: "GFT-002",
        direction: "given",
        description: "스폰서 감사 선물",
        estimated_value: 150000,
        giver_receiver: "골드 스폰서사",
        purpose: "스폰서십 감사 표시",
        approval_status: "approved",
        notes: "사전 승인 완료",
      },
      {
        entry_id: "GFT-003",
        direction: "received",
        description: "벤더 제안 골프 초대",
        estimated_value: 300000,
        giver_receiver: "AV 장비 업체",
        purpose: "관계 구축",
        approval_status: "declined",
        notes: "진행 중인 계약 협상으로 인해 거절",
      },
    ],
    policy_guidelines: [
      {
        category: "일반 선물",
        threshold_amount: 50000,
        approval_required: "none",
        restrictions: ["현금/현금성 금지", "빈번한 수령 자제"],
      },
      {
        category: "식사/접대",
        threshold_amount: 100000,
        approval_required: "manager",
        restrictions: ["비즈니스 목적 필수", "과도한 빈도 자제"],
      },
      {
        category: "여행/골프",
        threshold_amount: 200000,
        approval_required: "compliance",
        restrictions: ["계약 협상 중 금지", "사전 승인 필수"],
      },
    ],
    compliance_alerts: [
      {
        alert_type: "누적 한도 근접",
        description: "A 벤더로부터 분기 누적 선물 가치가 한도 80%에 도달",
        severity: "warning",
        action_required: "추가 수령 시 사전 승인 필요",
      },
    ],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "PRO-008",
  taskName: "선물/접대 정책 관리",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 19.8.a",
  skill: "Skill 19: Ethics & Standards",
  subSkill: "19.8: Gift Policy",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
