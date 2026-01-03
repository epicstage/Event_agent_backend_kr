/**
 * STR-017: 기대치 관리
 *
 * CMP-IS Reference: Domain A - Strategic Planning (Expectation Management)
 * Task Type: AI
 */

import { z } from "zod";

export const AGENT_PERSONA = `You are an expert Expectation Management Agent for event planning.

Your expertise includes:
- Identifying and documenting stakeholder expectations
- Gap analysis between expectations and deliverables
- Proactive expectation alignment strategies
- Managing expectation changes throughout event lifecycle

CMP-IS Standard: Domain A - Strategic Planning (Expectation Management)`;

export const InputSchema = z.object({
  event_id: z.string().uuid(),
  stakeholder_expectations: z.array(z.object({
    stakeholder_id: z.string(),
    name: z.string(),
    role: z.string(),
    explicit_expectations: z.array(z.string()),
    implicit_expectations: z.array(z.string()).optional(),
    priority_expectations: z.array(z.string()).optional(),
  })),
  planned_deliverables: z.array(z.object({
    deliverable: z.string(),
    description: z.string(),
    confidence: z.enum(["high", "medium", "low"]),
  })),
  constraints: z.array(z.string()).optional(),
});

export type Input = z.infer<typeof InputSchema>;

export const OutputSchema = z.object({
  management_id: z.string().uuid(),
  event_id: z.string().uuid(),
  expectation_analysis: z.array(z.object({
    stakeholder_id: z.string(),
    name: z.string(),
    expectations_met: z.array(z.object({
      expectation: z.string(),
      how_met: z.string(),
      confidence: z.enum(["high", "medium", "low"]),
    })),
    expectations_gap: z.array(z.object({
      expectation: z.string(),
      gap_reason: z.string(),
      mitigation_strategy: z.string(),
      communication_approach: z.string(),
    })),
    overall_alignment: z.number().min(0).max(100),
  })),
  expectation_registry: z.array(z.object({
    id: z.string(),
    expectation: z.string(),
    stakeholders: z.array(z.string()),
    status: z.enum(["will_meet", "partial", "at_risk", "cannot_meet"]),
    action_required: z.string(),
  })),
  communication_plan: z.array(z.object({
    timing: z.string(),
    message: z.string(),
    target_stakeholders: z.array(z.string()),
    channel: z.string(),
  })),
  escalation_triggers: z.array(z.object({
    trigger: z.string(),
    action: z.string(),
    responsible: z.string(),
  })),
  generated_at: z.string().datetime(),
});

export type Output = z.infer<typeof OutputSchema>;

export const metadata = {
  taskId: "STR-017",
  taskName: "Expectation Management",
  domain: "A",
  skill: "Stakeholder Analysis",
  taskType: "AI" as const,
  description: "이해관계자 기대치를 분석하고 관리 전략을 수립합니다.",
  inputSchema: InputSchema,
  outputSchema: OutputSchema,
};

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function execute(input: unknown): Promise<Output> {
  const validated = InputSchema.parse(input);

  const deliverableSet = new Set(validated.planned_deliverables.map(d => d.deliverable.toLowerCase()));

  const analysis = validated.stakeholder_expectations.map(s => {
    const allExpectations = [...s.explicit_expectations, ...(s.implicit_expectations || [])];
    const metExpectations: Output["expectation_analysis"][0]["expectations_met"] = [];
    const gapExpectations: Output["expectation_analysis"][0]["expectations_gap"] = [];

    for (const exp of allExpectations) {
      const deliverable = validated.planned_deliverables.find(d =>
        exp.toLowerCase().includes(d.deliverable.toLowerCase().split(" ")[0])
      );

      if (deliverable) {
        metExpectations.push({
          expectation: exp,
          how_met: deliverable.description,
          confidence: deliverable.confidence,
        });
      } else {
        gapExpectations.push({
          expectation: exp,
          gap_reason: "현재 계획에 포함되지 않음",
          mitigation_strategy: "대안 제시 또는 기대치 조정 협의",
          communication_approach: "사전 투명한 소통으로 이해 구득",
        });
      }
    }

    const alignment = allExpectations.length > 0
      ? Math.round((metExpectations.length / allExpectations.length) * 100)
      : 100;

    return {
      stakeholder_id: s.stakeholder_id,
      name: s.name,
      expectations_met: metExpectations,
      expectations_gap: gapExpectations,
      overall_alignment: alignment,
    };
  });

  // 기대치 레지스트리
  const allExpectations = new Map<string, string[]>();
  validated.stakeholder_expectations.forEach(s => {
    s.explicit_expectations.forEach(e => {
      if (!allExpectations.has(e)) allExpectations.set(e, []);
      allExpectations.get(e)!.push(s.name);
    });
  });

  let expCounter = 1;
  const registry: Output["expectation_registry"] = [];
  for (const [exp, stakeholders] of allExpectations) {
    const met = validated.planned_deliverables.some(d =>
      exp.toLowerCase().includes(d.deliverable.toLowerCase().split(" ")[0])
    );
    registry.push({
      id: `EXP-${String(expCounter++).padStart(3, "0")}`,
      expectation: exp,
      stakeholders,
      status: met ? "will_meet" : "at_risk",
      action_required: met ? "계획대로 진행" : "조정 필요",
    });
  }

  return {
    management_id: generateUUID(),
    event_id: validated.event_id,
    expectation_analysis: analysis,
    expectation_registry: registry,
    communication_plan: [
      { timing: "기획 초기", message: "기대치 확인 및 조율", target_stakeholders: analysis.map(a => a.name), channel: "1:1 미팅" },
      { timing: "중간 점검", message: "진행 상황 및 조정 사항 공유", target_stakeholders: analysis.map(a => a.name), channel: "이메일/미팅" },
      { timing: "이벤트 직전", message: "최종 확인 및 기대 관리", target_stakeholders: analysis.map(a => a.name), channel: "미팅" },
    ],
    escalation_triggers: [
      { trigger: "기대치 충족률 70% 미만", action: "긴급 이해관계자 미팅", responsible: "프로젝트 매니저" },
      { trigger: "핵심 이해관계자 불만 제기", action: "즉시 대응 및 해결책 제시", responsible: "담당 임원" },
    ],
    generated_at: new Date().toISOString(),
  };
}

export default { ...metadata, persona: AGENT_PERSONA, execute };
