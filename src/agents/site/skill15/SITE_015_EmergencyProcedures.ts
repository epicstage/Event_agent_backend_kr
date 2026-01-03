/**
 * SITE-015: 비상 절차 수립
 * CMP-IS Reference: 15.3.b - Emergency procedures
 */
import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Event Emergency Procedures Planner.`;

export const InputSchema = z.object({
  event_id: z.string(),
  venue_id: z.string(),
  attendee_count: z.number(),
  venue_type: z.string(),
  emergency_contacts: z.array(z.object({ role: z.string(), name: z.string(), phone: z.string() })).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  plan_id: z.string(),
  event_id: z.string(),
  emergency_procedures: z.array(z.object({ scenario: z.string(), severity: z.string(), immediate_actions: z.array(z.string()), responsible: z.string() })),
  communication_chain: z.array(z.object({ order: z.number(), role: z.string(), action: z.string() })),
  evacuation_time_estimate: z.number(),
  resources_needed: z.array(z.string()),
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

export async function execute(input: Input): Promise<Output> {
  const validatedInput = InputSchema.parse(input);

  return {
    plan_id: generateUUID(),
    event_id: validatedInput.event_id,
    emergency_procedures: [
      { scenario: "화재", severity: "critical", immediate_actions: ["경보 발령", "119 신고", "대피 유도"], responsible: "안전관리자" },
      { scenario: "의료 응급", severity: "high", immediate_actions: ["의료진 호출", "119 신고", "현장 확보"], responsible: "의료팀" },
      { scenario: "정전", severity: "medium", immediate_actions: ["비상등 확인", "안내 방송", "발전기 가동"], responsible: "시설팀" },
      { scenario: "테러 위협", severity: "critical", immediate_actions: ["경찰 신고", "현장 봉쇄", "대피 유도"], responsible: "보안팀" },
    ],
    communication_chain: [
      { order: 1, role: "현장 발견자", action: "상황 보고" },
      { order: 2, role: "안전관리자", action: "상황 판단 및 지시" },
      { order: 3, role: "운영본부", action: "외부 기관 연락" },
    ],
    evacuation_time_estimate: Math.ceil(validatedInput.attendee_count / 100) * 2,
    resources_needed: ["비상 조끼", "확성기", "응급 키트", "들것"],
    recommendations: ["비상 대피 훈련 실시", "비상 연락망 사전 공유"],
    created_at: new Date().toISOString(),
  };
}

export const AGENT_METADATA = {
  taskId: "SITE-015",
  taskName: "비상 절차 수립",
  taskType: "AI" as const,
  cmpReference: "CMP-IS 15.3.b",
  skill: "Skill 15: Site Operations",
  subSkill: "15.3: Safety & Security",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
  execute,
};

export default AGENT_METADATA;
